const {Readable}=require('node:stream');
function normalizeRequest(req){
 if(req.body===undefined)return req;
 const body=Buffer.isBuffer(req.body)?req.body:Buffer.from(typeof req.body==='string'?req.body:JSON.stringify(req.body));
 const incoming=Readable.from([body]);
 incoming.method=req.method;incoming.url=req.url;incoming.headers=req.headers;incoming.socket=req.socket;
 return incoming;
}
module.exports={normalizeRequest};
