const fs=require('node:fs'),path=require('node:path');
const root=__dirname,out=path.join(root,'dist');
if(path.resolve(out)!==path.join(root,'dist'))throw new Error('Invalid output directory');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
const pages=['index','about','contact','privacy-policy','terms-and-conditions','rental-plans','image-credits','fleet','rental-policy','signup','login','forgot-password','reset-password','verify-email'];
const files=[...pages.map(p=>p+'.html'),'style.css','pages.css','app.js','shared.js','home.js','fleet.json','rental-policy.json'];
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(out,file));
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
// Private account HTML is served by the protected backend, never by the CDN.
let origin=process.env.PUBLIC_ORIGIN;
if(!origin&&process.env.VERCEL_PROJECT_PRODUCTION_URL)origin='https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL;
if(origin){const u=new URL(origin);if(!['http:','https:'].includes(u.protocol)||u.pathname!=='/'||u.search||u.hash)throw new Error('PUBLIC_ORIGIN must be a website origin');origin=u.origin;}
const crawl=['index','fleet','rental-plans','about','contact','rental-policy','privacy-policy','terms-and-conditions'];
const xmlEscape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
if(origin){fs.writeFileSync(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+crawl.map(p=>'<url><loc>'+xmlEscape(origin+(p==='index'?'/':'/'+p+'.html'))+'</loc></url>').join('')+'</urlset>\n');}
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /api/\n'+['dashboard','profile','my-bookings','account-settings','admin','login','signup','reset-password','verify-email','forgot-password'].map(p=>'Disallow: /'+p).join('\n')+'\n'+(origin?'Sitemap: '+origin+'/sitemap.xml\n':''));
console.log('Vercel public build ready: '+files.length+' files and local assets. Private data and private account pages excluded.');
if(!process.env.BACKEND_ORIGIN)console.log('BACKEND_ORIGIN is not configured: public pages work; account/booking requests will return a clear setup message.');
