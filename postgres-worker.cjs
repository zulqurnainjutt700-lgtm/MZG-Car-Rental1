const {parentPort,workerData}=require('node:worker_threads');
const {Client,types}=require('pg');
types.setTypeParser(20,v=>Number(v));
types.setTypeParser(1700,v=>Number(v));
const url=new URL(workerData.url);
if(!['postgres:','postgresql:'].includes(url.protocol))throw Error('Invalid database protocol');
url.searchParams.delete('sslmode');
const options={connectionString:url.href,ssl:{rejectUnauthorized:true,ca:require('node:fs').readFileSync(require('node:path').join(__dirname,'supabase-ca.crt'),'utf8')},connectionTimeoutMillis:15000,query_timeout:20000,application_name:'mzg-server'};
let client=new Client(options);
let connected=false;
client.on('error',()=>{connected=false;client=new Client(options);client.on('error',()=>{connected=false;});});
parentPort.on('message',async ({sql,args,port,signal,close})=>{
 const wake=()=>{Atomics.store(new Int32Array(signal),0,1);Atomics.notify(new Int32Array(signal),0);};
 try{
  if(close){await client.end();port.postMessage({rows:[],changes:0});wake();return;}
  if(!connected){await client.connect();connected=true;}
  const result=await client.query(sql,args?.map(v=>v instanceof Uint8Array?Buffer.from(v):v));
  const r=Array.isArray(result)?result.at(-1):result;
  port.postMessage({rows:r.rows||[],changes:r.rowCount||0});
 }catch(e){port.postMessage({error:{message:e.code?'Database operation failed ('+e.code+').':'Database connection failed. Check private DATABASE_URL and TLS configuration.',code:e.code||'DATABASE_UNAVAILABLE'}});}
 finally{wake();port.close();}
});
