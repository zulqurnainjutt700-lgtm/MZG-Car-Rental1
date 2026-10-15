const {normalizeRequest}=require('../vercel-request.cjs');
let server;
module.exports=async function backend(req,res){
 try{
  if(!process.env.DATABASE_URL||!process.env.ADMIN_ENCRYPTION_KEY)throw Error('configuration');
  const origin=process.env.PUBLIC_ORIGIN;
  if(!origin||!origin.startsWith('https://'))throw Error('configuration');
  const canonicalLocation=require('../canonical-request.cjs').canonicalPageLocation(req,origin);
  if(canonicalLocation){res.writeHead(307,{'Location':canonicalLocation,'Cache-Control':'no-store'});res.end();return;}
  if(!server)server=require('../server.cjs').createServer({authDirectory:'/tmp/mzg-runtime',origin,secureCookies:true});
  const incoming=normalizeRequest(req);
  // Vercel supplies this trusted client IP header; ordinary forwarded headers are ignored.
  const ip=String(req.headers['x-vercel-forwarded-for']||'').split(',')[0].trim();
  if(require('node:net').isIP(ip))incoming.mzgClientIp=ip;
  await new Promise(resolve=>{res.once('finish',resolve);res.once('close',resolve);server.emit('request',incoming,res);});
 }catch(e){console.error('MZG backend initialization failed:',e.code||'CONFIGURATION_OR_DATABASE');res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Account service setup is incomplete or the database is unavailable. Please contact MZG support.'}));}
};
