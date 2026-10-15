const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {createAuth}=require('./auth.cjs');
const pages=['index.html','about.html','contact.html','privacy-policy.html','terms-and-conditions.html','rental-plans.html','image-credits.html','fleet.html','rental-policy.html','signup.html','login.html','forgot-password.html','reset-password.html','verify-email.html','dashboard.html','profile.html','my-bookings.html','account-settings.html','admin.html','admin-invitation.html'];
const publicFiles=new Set([...pages,'style.css','pages.css','app.js','shared.js','home.js','fleet.json','rental-policy.json']);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.md':'text/plain','.wasm':'application/wasm','.glb':'model/gltf-binary'};
function createServer(options={}){
 const auth=createAuth({directory:options.authDirectory,origin:options.origin||'http://127.0.0.1:3000',secureCookies:options.secureCookies||false,mailer:options.mailer});
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://upload.wikimedia.org https://images.unsplash.com; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://wa.me; object-src 'none'");
  if(options.secureCookies)res.setHeader('Strict-Transport-Security','max-age=31536000');
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/healthz'){res.writeHead(200,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end('ok');return;}
   if(options.proxySecret){const expected=Buffer.from(options.proxySecret),provided=Buffer.from(String(req.headers['x-mzg-proxy-secret']||''));const trusted=provided.length===expected.length&&crypto.timingSafeEqual(provided,expected);if(!trusted){res.writeHead(403,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Use the MZG website to access this service.'}));return;}const ip=String(req.headers['x-mzg-client-ip']||'');if(require('node:net').isIP(ip))req.mzgClientIp=ip;}
   if(await auth(req,res,url))return;
   if(auth.admin.media(req,res,url))return;
   const adminPath=url.pathname.replace(/\/$/,'');
   if(adminPath==='/admin'||adminPath==='/admin.html'||adminPath.startsWith('/admin/')){
    const session=auth.authorize(req);let file='admin-login.html';
    if(session?.user.role==='admin'){
     const access=auth.admin.access(session.user),section=adminPath.split('/')[2]||'dashboard';
     if(!['notifications','availability','dashboard','pages','fleet','bookings','customers','media','seo','settings','maintenance','security','backups'].includes(section)){res.writeHead(404);res.end('Admin page not found');return;}
     if(!access.mfa_secret||!session.session.admin_verified){if(section==='security')file='admin-panel.html';else if(!['/admin','/admin.html'].includes(adminPath)){res.writeHead(303,{'Location':'/admin','Cache-Control':'no-store'});res.end();return;}}
     else{try{auth.admin.identity(req,section==='security'?null:section);}catch(e){res.writeHead(e.status||403,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end(e.message);return;}file='admin-panel.html';}
    }else if(session&&(adminPath.startsWith('/admin/')||adminPath==='/admin.html')){res.writeHead(403,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end('Administrator access required');return;}
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(__dirname,file)));return;
   }
   if(url.pathname.startsWith('/cms-preview/')){auth.admin.identity(req,'pages');const slug=url.pathname.slice('/cms-preview/'.length),html=auth.admin.cms.render(slug,true,options.origin||'http://127.0.0.1:3000',auth.admin.publicFleet(),auth.admin.settings());if(!html){res.writeHead(404);res.end('Page not found');return;}res.setHeader('X-Frame-Options','SAMEORIGIN');res.setHeader('Content-Security-Policy',String(res.getHeader('Content-Security-Policy')).replace("frame-ancestors 'none'","frame-ancestors 'self'"));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow'});res.end(html);return;}
   if(url.pathname==='/sitemap.xml'){res.writeHead(200,{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-cache'});res.end(auth.admin.sitemap());return;}
   if(url.pathname==='/robots.txt'){res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});res.end('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /cms-preview/\nSitemap: '+(options.origin||'http://127.0.0.1:3000')+'/sitemap.xml\n');return;}
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method not allowed');return;}
   let requested;try{requested=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400);res.end('Bad request');return;}
   const cmsFile=auth.admin.resolveSlug(requested);if(cmsFile)requested=cmsFile;
   if(!path.extname(requested)&&pages.includes(requested+'.html'))requested+='.html';
   const privatePages=['dashboard.html','profile.html','my-bookings.html','account-settings.html','admin.html'];
   if(privatePages.includes(requested)){const session=auth.authorize(req);if(!session){res.writeHead(303,{'Location':'/login.html?next='+encodeURIComponent('/'+requested+url.search),'Cache-Control':'no-store'});res.end();return;}if(requested==='admin.html'&&session.user.role!=='admin'){res.writeHead(403,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end('<h1>Administrator access required</h1><a href="/dashboard.html">My Dashboard</a>');return;}}
   const file=path.resolve(__dirname,requested),assetRoot=path.resolve(__dirname,'assets')+path.sep;
   const maintenance=auth.admin.maintenance();if(maintenance.enabled&&!requested.startsWith('assets/')&&!/\.(css|js)$/.test(requested)){const escape=require('./cms.cjs').esc;res.writeHead(503,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Retry-After':'3600'});res.end('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MZG Car Rental · Maintenance</title><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/admin.css"><main class="admin-login-card"><span class="admin-brand">MZG CAR RENTAL</span><h1>We’ll be right back.</h1><p>'+escape(maintenance.message)+'</p>'+(maintenance.until?'<p>Expected restoration: '+escape(maintenance.until)+'</p>':'')+'<a class="btn" href="https://wa.me/923025184681">Contact MZG</a></main></html>');return;}
   if(requested==='fleet.json'||requested==='rental-policy.json'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(requested==='fleet.json'?auth.admin.publicFleet():auth.admin.rentalPolicy()));return;}
   const html=auth.admin.render(requested);if(html){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(html);return;}
   const isAsset=requested.startsWith('assets/')&&file.startsWith(assetRoot);
   if((!publicFiles.has(requested)&&!isAsset)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end('<h1>Page not found</h1><a href="/">Back to MZG Car Rental</a>');return;}
   const ext=path.extname(file);res.writeHead(200,{'Content-Type':(types[ext]||'application/octet-stream')+(['.html','.css','.js','.json','.md'].includes(ext)?'; charset=utf-8':''),'Cache-Control':privatePages.includes(requested)?'no-store':'no-cache'});
   if(req.method==='HEAD'){res.end();return;}const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);
  }catch(e){if(!res.headersSent)res.writeHead(e.status||500,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end(e.status?e.message:'The request could not be completed.');}
 });
 server.on('close',()=>auth.close());return server;
}
module.exports={createServer};
if(require.main===module){
 try{process.loadEnvFile('.env');}catch(e){if(e.code!=='ENOENT')throw e;}
 const directory=path.resolve(process.env.AUTH_DIRECTORY||path.join(__dirname,'.private'));fs.mkdirSync(directory,{recursive:true,mode:0o700});const pidFile=path.join(directory,'backend.pid');
 if(fs.existsSync(pidFile)){const previous=Number(fs.readFileSync(pidFile,'utf8'));let live=false;if(Number.isSafeInteger(previous)&&previous>0)try{process.kill(previous,0);live=true;}catch{}if(live)throw Error('A backend already owns this database. Use one persistent server instance.');fs.unlinkSync(pidFile);}
 fs.writeFileSync(pidFile,String(process.pid),{flag:'wx',mode:0o600});const cleanup=()=>{if(fs.existsSync(pidFile)&&fs.readFileSync(pidFile,'utf8')===String(process.pid))fs.unlinkSync(pidFile);};process.on('exit',cleanup);
 const port=Number(process.env.PORT||3000),server=createServer({authDirectory:directory,origin:process.env.PUBLIC_ORIGIN||'http://127.0.0.1:'+port,secureCookies:process.env.SECURE_AUTH_COOKIES==='true',proxySecret:process.env.BACKEND_PROXY_SECRET});server.listen(port,process.env.BIND_HOST||'127.0.0.1',()=>console.log('MZG Car Rental listening on port '+port));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{cleanup();process.exit(0);}));
}
