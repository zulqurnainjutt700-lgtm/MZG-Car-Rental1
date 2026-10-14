const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),https=require('node:https'),{PassThrough}=require('node:stream'),{execFileSync}=require('node:child_process');
async function main(){
 const origin='https://mzg-deployment-check.vercel.app';execFileSync(process.execPath,['build-vercel.cjs'],{env:{...process.env,PUBLIC_ORIGIN:origin},stdio:'inherit'});
 const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));assert.equal(config.outputDirectory,'dist');assert.equal(config.cleanUrls,false);assert.ok(config.rewrites.some(r=>r.source==='/api/:path*'));
 for(const denied of ['.private','.env','auth.cjs','server.cjs','store.cjs','package.json','dashboard.html','profile.html','my-bookings.html','account-settings.html','admin.html'])assert.ok(!fs.existsSync(path.join('dist',denied)),denied+' must not be public');
 for(const file of ['index.html','fleet.html','login.html','signup.html','assets/account-auth.js'])assert.ok(fs.existsSync(path.join('dist',file)));
 const fleet=JSON.parse(fs.readFileSync('fleet.json','utf8'));for(const car of fleet)assert.ok(fs.existsSync(path.join('dist',car.image.replace(/^\//,''))));
 assert.ok(fs.readFileSync('dist/sitemap.xml','utf8').includes(origin+'/fleet.html'));assert.ok(!fs.readFileSync('dist/sitemap.xml','utf8').includes('dashboard'));assert.ok(fs.readFileSync('dist/robots.txt','utf8').includes('Disallow: /api/'));
 console.log('PASS Vercel public build, 24 fleet images, protected-page exclusion, sitemap and robots');
 const gateway=require('./api/gateway.js'),originalRequest=https.request,oldOrigin=process.env.BACKEND_ORIGIN,oldSecret=process.env.BACKEND_PROXY_SECRET;
 const server=http.createServer((req,res)=>gateway(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  delete process.env.BACKEND_ORIGIN;assert.equal((await fetch(base+'/')).status,200);let res=await fetch(base+'/api/me');assert.equal(res.status,503);assert.ok((await res.json()).error.includes('configuration'));res=await fetch(base+'/dashboard.html');assert.equal(res.status,503);assert.ok((await res.text()).includes('WhatsApp'));
  process.env.BACKEND_ORIGIN='http://insecure.example';assert.equal((await fetch(base+'/api/me')).status,503);
  process.env.BACKEND_ORIGIN='https://backend.example';process.env.BACKEND_PROXY_SECRET='test-only-proxy-secret';
  // Stub only the transport; inspect precisely what is forwarded to the backend.
  https.request=(url,options,callback)=>{assert.equal(url.href,'https://backend.example/api/bookings');assert.equal(options.headers.origin,origin);assert.equal(options.headers.cookie,'mzg_session='+'a'.repeat(64));assert.equal(options.headers['x-csrf-token'],'csrf');assert.equal(options.headers['x-mzg-proxy-secret'],'test-only-proxy-secret');assert.equal(options.headers['x-mzg-client-ip'],undefined);assert.equal(options.headers['x-forwarded-for'],undefined);const outgoing=new PassThrough();let body='';outgoing.on('data',c=>body+=c);outgoing.on('finish',()=>{assert.deepEqual(JSON.parse(body),{carId:1});const response=new PassThrough();response.statusCode=201;response.headers={'content-type':'application/json','set-cookie':['mzg_session=replacement; HttpOnly; Secure; SameSite=Strict; Path=/']};callback(response);response.end(JSON.stringify({status:'Pending'}));});return outgoing;};
  res=await fetch(base+'/api/bookings',{method:'POST',headers:{Origin:origin,Cookie:'mzg_session='+'a'.repeat(64)+'; unrelated=ignored-test-cookie','Content-Type':'application/json','X-CSRF-Token':'csrf','X-MZG-Client-IP':'spoofed','X-Forwarded-For':'spoofed'},body:JSON.stringify({carId:1})});assert.equal(res.status,201);assert.equal((await res.json()).status,'Pending');assert.ok(res.headers.get('set-cookie').includes('Secure'));assert.equal(res.headers.get('cache-control'),'no-store');
  console.log('PASS gateway setup errors, secure backend URL validation, JSON/Origin/CSRF/cookie forwarding and spoofed-header filtering (stub transport; no live backend)');
 }finally{https.request=originalRequest;for(const [key,value]of [['BACKEND_ORIGIN',oldOrigin],['BACKEND_PROXY_SECRET',oldSecret]])if(value===undefined)delete process.env[key];else process.env[key]=value;await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
