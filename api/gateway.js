const https=require('node:https');
const privatePages=new Set(['dashboard','profile','my-bookings','account-settings','admin'].flatMap(p=>['/'+p,'/'+p+'.html']));
const fs=require('node:fs'),path=require('node:path');
const publicFiles=new Set(['index.html','about.html','contact.html','fleet.html','rental-plans.html','rental-policy.html','privacy-policy.html','terms-and-conditions.html','image-credits.html','login.html','signup.html','forgot-password.html','reset-password.html','verify-email.html','admin-invitation.html','fleet.json','rental-policy.json','sitemap.xml','robots.txt']);
const publicPath=value=>value==='/'?'index.html':value.replace(/^\//,'');
function unavailable(req,res,status,message){res.setHeader('Cache-Control','no-store');if(req.url.startsWith('/api/')){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:message}));}else{res.writeHead(status,{'Content-Type':'text/html; charset=utf-8'});res.end('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MZG account service</title><link rel="stylesheet" href="/style.css"><main style="max-width:680px;margin:12vh auto;padding:32px"><h1>Account service is unavailable</h1><p>'+message+'</p><p><a href="/fleet.html">Browse our fleet</a> · <a href="https://wa.me/923025184681">Contact MZG on WhatsApp</a></p></main></html>');}}
module.exports=async function gateway(req,res){
 const requested=new URL(req.url,'http://localhost');
 if(!requested.pathname.startsWith('/api/')&&!privatePages.has(requested.pathname)&&!publicFiles.has(publicPath(requested.pathname))&&!/^\/(?:admin(?:\/[a-z-]+)?|cms-preview\/[a-z-]+|media\/[a-f0-9-]+(?:-small)?\.webp|[a-z0-9-]+)$/.test(requested.pathname)){res.writeHead(404);res.end('Not found');return;}
 res.setHeader('Cache-Control','no-store');
 if(!process.env.BACKEND_ORIGIN){const file=publicPath(requested.pathname);if(publicFiles.has(file)){const target=path.join(process.cwd(),'dist',file);if(fs.existsSync(target)){const type=file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':file.endsWith('.xml')?'application/xml':'text/plain';res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-cache'});res.end(fs.readFileSync(target));return;}}unavailable(req,res,503,'Online accounts, CMS and rental requests are awaiting backend hosting configuration. Please contact MZG on WhatsApp to arrange your rental.');return;}
 let base;try{base=new URL(process.env.BACKEND_ORIGIN);if(base.protocol!=='https:'||base.username||base.password||base.pathname!=='/'||base.search||base.hash)throw Error();}catch{unavailable(req,res,503,'The account service needs hosting configuration. Please contact MZG support.');return;}
 if(base.host===req.headers.host){unavailable(req,res,503,'The account service needs hosting configuration. Please contact MZG support.');return;}
 // Preserve the browser's Origin for the backend's exact-origin CSRF checks.
 // Only allow selected headers; never trust caller-provided forwarding headers.
 const headers={};for(const name of ['content-type','origin','x-csrf-token','idempotency-key','accept','user-agent'])if(req.headers[name])headers[name]=req.headers[name];
 const sessionCookie=String(req.headers.cookie||'').match(/(?:^|;\s*)(mzg_session=[a-f0-9]{64})(?:;|$)/);if(sessionCookie)headers.cookie=sessionCookie[1];const clientIp=req.headers['x-vercel-forwarded-for'];if(clientIp)headers['x-mzg-client-ip']=String(clientIp).split(',')[0].trim();
 if(process.env.BACKEND_PROXY_SECRET)headers['x-mzg-proxy-secret']=process.env.BACKEND_PROXY_SECRET;
 const target=new URL(base.origin+requested.pathname+requested.search);
 return new Promise(resolve=>{
  const upstream=https.request(target,{method:req.method,headers,timeout:45000},response=>{
   res.statusCode=response.statusCode;
   for(const name of ['content-type','set-cookie','location','retry-after','content-security-policy','x-content-type-options','x-frame-options','referrer-policy','permissions-policy'])if(response.headers[name]!==undefined)res.setHeader(name,response.headers[name]);
   response.on('error',()=>{res.destroy();resolve();});response.on('end',resolve);response.pipe(res);
  });
  upstream.on('timeout',()=>upstream.destroy(new Error('Backend timeout')));
  upstream.on('error',()=>{if(!res.headersSent)unavailable(req,res,502,'The account service is temporarily unavailable. Please try again or contact MZG support.');else res.destroy();resolve();});
  // Vercel may pre-parse request bodies; preserve JSON semantics in either mode.
  if(req.body!==undefined){const body=Buffer.isBuffer(req.body)||typeof req.body==='string'?req.body:JSON.stringify(req.body);upstream.end(body);}else req.pipe(upstream);
 });
};
