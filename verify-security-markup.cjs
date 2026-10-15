const assert=require('node:assert/strict'),fs=require('node:fs'),{load}=require('cheerio');
let count=0;
for(const file of fs.readdirSync(__dirname).filter(f=>f.endsWith('.html'))){
 const $=load(fs.readFileSync(file,'utf8'));
 $('form').filter((_,e)=>$(e).find('input[type="password"]').length).each((_,e)=>{
  assert.equal($(e).attr('method')?.toLowerCase(),'post',file+': password form must never default to GET');
  assert.match($(e).attr('action')||'',/^\/api\/[a-z/-]+$/,file+': explicit same-origin destination');count++;
 });
}
// CMS-stored HTML may predate the source fix. The runtime must protect it too.
const $=load('<html><head></head><body><form id="old"><input type="password" name="password"></form></body></html>');
const {applyPresentation}=require('./site-presentation.cjs');applyPresentation($);applyPresentation($);
assert.equal($('#old').attr('method'),'post');
assert.equal($('meta[name="google-site-verification"]').length,1);
const brand=load('<html><head></head><body><header><a class="logo">MZG<span>CAR RENTAL</span></a></header></body></html>');
applyPresentation(brand,{name:'MZG Car Rental'});
assert.equal(brand('.logo').text(),'MZGCAR RENTAL');
console.log('PASS '+count+' password forms use same-origin POST; saved HTML protected; verification tag preserved');
