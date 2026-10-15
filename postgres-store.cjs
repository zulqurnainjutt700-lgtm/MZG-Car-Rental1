// Compatibility bridge keeps the established synchronous transaction boundaries.
// Network I/O runs in a dedicated worker; one connection per warm server instance.
const {Worker,MessageChannel,receiveMessageOnPort}=require('node:worker_threads');
const path=require('node:path'),fs=require('node:fs');
require('pg'); // Include the driver's dependencies in serverless file tracing.
const tables=['users','sessions','tokens','bookings','booking_events','limits','metadata','admin_access','admin_audit','vehicles','cms_pages','cms_revisions','site_settings','media','booking_internal','customer_notes','payments','backups','admin_invitations','booking_operations','maintenance_blocks','email_jobs','notice_broadcasts','customer_notices','notice_preferences'];
function translate(sql){
 let n=0;
 sql=sql.replace(/date\(created_at,'\+5 hours'\)/g,"to_char((created_at::timestamptz AT TIME ZONE 'Asia/Karachi'),'YYYY-MM-DD')");
 sql=sql.replace(/sum\((status='[^']+')\)/gi,'sum(($1)::int)');
 sql=sql.replace(/'([^']|'')*'|\?|\b[A-Za-z_][A-Za-z_0-9]*\b/g,token=>token==='?'?'$'+(++n):token==='day'?'"day"':tables.includes(token.toLowerCase())?'mzg_private.'+token:token);
 if(/^INSERT OR IGNORE/i.test(sql)){sql=sql.replace(/^INSERT OR IGNORE/i,'INSERT');sql+=' ON CONFLICT DO NOTHING';}
 return sql.replace(/\bLIKE\b/g,'ILIKE');
}
function openPostgresStore(url,directory){
 fs.mkdirSync(directory,{recursive:true,mode:0o700});
 const worker=new Worker(path.join(__dirname,'postgres-worker.cjs'),{workerData:{url}});worker.unref();
 let closed=false;
 function query(sql,args=[],close=false){
  if(closed)throw Error('Database closed');
  const {port1,port2}=new MessageChannel(),signal=new SharedArrayBuffer(4);
  worker.postMessage({sql,args,close,port:port2,signal},[port2]);
  const result=Atomics.wait(new Int32Array(signal),0,0,30000);
  const response=receiveMessageOnPort(port1)?.message;port1.close();
  if(result==='timed-out'||!response){closed=true;worker.terminate();throw Error('Database timeout.');}
  if(response.error){const e=Error(response.error.message);e.code=response.error.code;throw e;}
  for(const row of response.rows)for(const k of Object.keys(row))if(row[k] instanceof Uint8Array)row[k]=Buffer.from(row[k]);
  return response;
 }
 const db={kind:'postgres',exec(sql){return query(sql);},prepare(sql){const converted=translate(sql);return {all:(...args)=>query(converted,args).rows,get:(...args)=>query(converted,args).rows[0],run:(...args)=>{const r=query(converted,args);return {changes:r.changes};}};},close(){if(!closed){query('',[],true);closed=true;worker.terminate();}}};
 const transaction=fn=>{query('BEGIN');try{query("SELECT pg_advisory_xact_lock(729306214)");const result=fn();query('COMMIT');return result;}catch(e){query('ROLLBACK');throw e;}};
 query(fs.readFileSync(path.join(__dirname,'postgres-schema.sql'),'utf8'));
 const fleet=JSON.parse(fs.readFileSync(path.join(__dirname,'fleet.json'),'utf8'));
 transaction(()=>{if(!db.prepare("SELECT 1 FROM metadata WHERE key='fleet_seeded'").get()){for(const c of fleet)db.prepare('INSERT OR IGNORE INTO vehicles VALUES(?,?,?,?,?)').run(c.id,'MZG-'+String(c.id).padStart(3,'0'),JSON.stringify({...c,year:null,fuel:'Petrol',features:[],images:[c.image],featured:false,weeklyRate:c.rate*7,monthlyRate:c.rate*30}),'available',new Date().toISOString());db.prepare("INSERT INTO metadata VALUES('fleet_seeded',?)").run(new Date().toISOString());}});
 return {db,transaction,directory};
}
module.exports={openPostgresStore,translate,tables};
