// Explicit private-data transfer. Never export this database to Git/CDN.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
try{process.loadEnvFile('.env');}catch(e){if(e.code!=='ENOENT')throw e;}
if(process.argv[2]!=='--confirm-private-data-transfer'||!process.env.DATABASE_URL)throw Error('Configure private DATABASE_URL, then use --confirm-private-data-transfer.');
const source=new DatabaseSync(path.join(process.env.AUTH_DIRECTORY||'.private','mzg.sqlite'),{readOnly:true});
const target=require('./postgres-store.cjs').openPostgresStore(process.env.DATABASE_URL,path.join('.private','postgres-migration-runtime'));
const skip=new Set(['sessions','tokens','limits','backups','admin_invitations']);
const {tables}=require('./postgres-store.cjs');
const snapshot=source.prepare('PRAGMA integrity_check').get();if(snapshot.integrity_check!=='ok'||source.prepare('PRAGMA foreign_key_check').all().length)throw Error('Local database integrity check failed.');
const values={};source.exec('BEGIN');try{for(const t of tables)if(!skip.has(t))values[t]=source.prepare('SELECT * FROM '+t).all();}finally{source.exec('ROLLBACK');}
function fingerprint(rows){return crypto.createHash('sha256').update(JSON.stringify(rows.map(row=>Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,v instanceof Uint8Array?Buffer.from(v).toString('hex'):v]))).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))))).digest('hex');}
try{
 target.transaction(()=>{
  if(target.db.prepare('SELECT count(*) n FROM users').get().n)throw Error('Target already has accounts. Refusing to overwrite an existing database.');
  target.db.prepare('DELETE FROM vehicles').run();target.db.prepare('DELETE FROM metadata').run();
  for(const [t,rows] of Object.entries(values)){
   for(const row of rows){const keys=Object.keys(row);target.db.prepare('INSERT INTO '+t+' ('+keys.join(',')+') VALUES ('+keys.map(()=>'?').join(',')+')').run(...keys.map(k=>row[k]));}
   if(fingerprint(rows)!==fingerprint(target.db.prepare('SELECT * FROM '+t).all()))throw Error('Migration verification failed for '+t);
  }
  for(const t of ['booking_events','admin_audit','cms_revisions','vehicles'])target.db.exec("SELECT setval(pg_get_serial_sequence('mzg_private."+t+"','id'),GREATEST(COALESCE((SELECT max(id) FROM mzg_private."+t+"),0),1),true)");
 });
 console.log('PASS private data migration: table fingerprints verified; sessions/reset tokens/invitations not copied. Local database preserved.');
}finally{source.close();target.db.close();}
