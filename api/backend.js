const {Readable}=require('node:stream');
let server;
module.exports=async function backend(req,res){
 try{
  if(!process.env.DATABASE_URL||!process.env.ADMIN_ENCRYPTION_KEY)throw Error('configuration');
  const origin=process.env.PUBLIC_ORIGIN;
  if(!origin||!origin.startsWith('https://'))throw Error('configuration');
  if(!server)server=require('../server.cjs').createServer({authDirectory:'/tmp/mzg-runtime',origin,secureCookies:true});
  let incoming=req;
  if(req.body!==undefined){const body=Buffer.isBuffer(req.body)||typeof req.body==='string'?req.body:JSON.stringify(req.body);incoming=Readable.from([body]);incoming.method=req.method;incoming.url=req.url;incoming.headers=req.headers;incoming.socket=req.socket;}
  // Vercel supplies this trusted client IP header; ordinary forwarded headers are ignored.
  const ip=String(req.headers['x-vercel-forwarded-for']||'').split(',')[0].trim();
  if(require('node:net').isIP(ip))incoming.mzgClientIp=ip;
  await new Promise(resolve=>{res.once('finish',resolve);res.once('close',resolve);server.emit('request',incoming,res);});
 }catch(e){console.error('MZG backend initialization failed:',e.code||'CONFIGURATION_OR_DATABASE');res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Account service setup is incomplete or the database is unavailable. Please contact MZG support.'}));}
};
