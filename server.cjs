const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {createAuth}=require('./auth.cjs');
const pages=['index.html','about.html','contact.html','privacy-policy.html','terms-and-conditions.html','rental-plans.html','image-credits.html','fleet.html','rental-policy.html','signup.html','login.html','forgot-password.html','reset-password.html','verify-email.html','dashboard.html','profile.html','my-bookings.html','account-settings.html','admin.html'];
const publicFiles=new Set([...pages,'style.css','pages.css','app.js','shared.js','home.js','fleet.json','rental-policy.json']);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.md':'text/plain','.wasm':'application/wasm','.glb':'model/gltf-binary'};
function createServer(options={}){
 const auth=createAuth({directory:options.authDirectory,origin:options.origin||'http://127.0.0.1:3000',secureCookies:options.secureCookies||false,mailer:options.mailer});
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://upload.wikimedia.org https://images.unsplash.com; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://wa.me; object-src 'none'");
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/healthz'){res.writeHead(200,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end('ok');return;}
   if(options.proxySecret){const expected=Buffer.from(options.proxySecret),provided=Buffer.from(String(req.headers['x-mzg-proxy-secret']||''));const trusted=provided.length===expected.length&&crypto.timingSafeEqual(provided,expected);if(!trusted){res.writeHead(403,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Use the MZG website to access this service.'}));return;}const ip=String(req.headers['x-mzg-client-ip']||'');if(require('node:net').isIP(ip))req.mzgClientIp=ip;}
   if(await auth(req,res,url))return;
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method not allowed');return;}
   let requested;try{requested=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400);res.end('Bad request');return;}
   if(!path.extname(requested)&&pages.includes(requested+'.html'))requested+='.html';
   const privatePages=['dashboard.html','profile.html','my-bookings.html','account-settings.html','admin.html'];
   if(privatePages.includes(requested)){const session=auth.authorize(req);if(!session){res.writeHead(303,{'Location':'/login.html?next='+encodeURIComponent('/'+requested+url.search),'Cache-Control':'no-store'});res.end();return;}if(requested==='admin.html'&&session.user.role!=='admin'){res.writeHead(403,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end('<h1>Administrator access required</h1><a href="/dashboard.html">My Dashboard</a>');return;}}
   const file=path.resolve(__dirname,requested),assetRoot=path.resolve(__dirname,'assets')+path.sep;
   const isAsset=requested.startsWith('assets/')&&file.startsWith(assetRoot);
   if((!publicFiles.has(requested)&&!isAsset)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end('<h1>Page not found</h1><a href="/">Back to MZG Car Rental</a>');return;}
   const ext=path.extname(file);res.writeHead(200,{'Content-Type':(types[ext]||'application/octet-stream')+(['.html','.css','.js','.json','.md'].includes(ext)?'; charset=utf-8':''),'Cache-Control':privatePages.includes(requested)?'no-store':'no-cache'});
   if(req.method==='HEAD'){res.end();return;}const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);
  }catch{if(!res.headersSent)res.writeHead(500,{'Content-Type':'text/plain'});res.end('The request could not be completed.');}
 });
 server.on('close',()=>auth.close());return server;
}
module.exports={createServer};
if(require.main===module){try{process.loadEnvFile('.env');}catch(e){if(e.code!=='ENOENT')throw e;}const port=Number(process.env.PORT||3000);createServer({authDirectory:process.env.AUTH_DIRECTORY,origin:process.env.PUBLIC_ORIGIN||`http://127.0.0.1:${port}`,secureCookies:process.env.SECURE_AUTH_COOKIES==='true',proxySecret:process.env.BACKEND_PROXY_SECRET}).listen(port,process.env.BIND_HOST||'127.0.0.1',()=>console.log(`MZG Car Rental listening on port ${port}`));}
