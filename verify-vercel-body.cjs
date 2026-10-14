const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const {normalizeRequest}=require('./vercel-request.cjs');
(async()=>{
 for(const body of [{name:'Lahore لاہور'},JSON.stringify({name:'Lahore لاہور'}),Buffer.from('{"name":"Lahore"}')]){
  const original={body,method:'POST',url:'/api/signup',headers:{},socket:{}};
  const req=normalizeRequest(original),chunks=[];for await(const c of req){assert.ok(Buffer.isBuffer(c));chunks.push(c);}
  assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()),typeof body==='object'&&!Buffer.isBuffer(body)?body:JSON.parse(body.toString()));assert.equal(req.headers,original.headers);
 }
 const directory=await fs.mkdtemp(path.join(__dirname,'.auth-test-vercel-body-'));
 const backend=require('./server.cjs').createServer({authDirectory:directory,origin:'http://vercel-body.test',mailer:{configured:false}});
 const proxy=http.createServer(async(req,res)=>{const chunks=[];for await(const c of req)chunks.push(c);const bytes=Buffer.concat(chunks);req.body=bytes.length?JSON.parse(bytes):undefined;backend.emit('request',normalizeRequest(req),res);});
 try{
  await new Promise(r=>proxy.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+proxy.address().port;
  const post=(route,data)=>fetch(base+route,{method:'POST',headers:{Origin:'http://vercel-body.test','Content-Type':'application/json'},body:JSON.stringify(data)});
  let r=await post('/api/admin/signin',{email:'missing@example.test',password:'Strong test password 8821!'});assert.equal(r.status,401);assert.ok(!(await r.text()).includes('could not be read'));
  r=await post('/api/signup',{name:'Isolated Customer',email:'body-test@example.test',phone:'03001234567',password:'Strong test password 8821!',confirmPassword:'Strong test password 8821!',consent:true});assert.equal(r.status,201);
  r=await post('/api/signin',{email:'body-test@example.test',password:'Strong test password 8821!'});assert.equal(r.status,200);
  console.log('PASS Vercel object/string/Buffer JSON bodies, Unicode preservation, invalid admin credentials, customer signup and signin through normalized requests.');
 }finally{await new Promise(r=>proxy.close(r));await new Promise(r=>backend.close(r));await fs.rm(directory,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1});
