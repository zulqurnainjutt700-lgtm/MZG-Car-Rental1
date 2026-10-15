// Read-only production smoke audit. Never submits accounts or bookings.
const {load}=require('cheerio');
const root=process.argv[2]||'https://mzg-car-rental2.vercel.app';
const pages=['/','/fleet.html','/about.html','/contact.html','/rental-plans.html','/rental-policy.html','/privacy-policy.html','/terms-and-conditions.html','/image-credits.html','/login.html','/signup.html','/forgot-password.html','/reset-password.html','/verify-email.html','/admin','/sitemap.xml','/robots.txt'];
(async()=>{
 const errors=[],assets=new Set(),documents=new Map();let checkedAssets=0;
 async function read(path){const r=await fetch(new URL(path,root),{signal:AbortSignal.timeout(30000)});const body=await r.text();if(r.status!==200)errors.push(path+': HTTP '+r.status);return {r,body};}
 // Limit concurrency to avoid opening a large database connection burst.
 for(let i=0;i<pages.length;i+=2)await Promise.all(pages.slice(i,i+2).map(async p=>{try{const {r,body}=await read(p);if(!r.headers.get('content-type')?.includes('text/html'))return;const $=load(body);documents.set(p,$);if($('h1').length!==1)errors.push(p+': expected one H1');if(!$('title').text().trim())errors.push(p+': missing title');$('script[src],link[rel=stylesheet][href],img[src],source[srcset]').each((_,el)=>{const raw=$(el).attr('src')||$(el).attr('href')||$(el).attr('srcset');for(const piece of raw.split(',')){const value=piece.trim().split(/\s+/)[0];if(value.startsWith('/'))assets.add(value);}});}catch(e){errors.push(p+': '+e.name);}}));
 const f=await read('/fleet.json');let fleet=[];try{fleet=JSON.parse(f.body);}catch{errors.push('Invalid fleet JSON');}
 for(const car of fleet){assets.add(car.image);for(const v of (car.imageSrcSet||'').split(',')){const p=v.trim().split(/\s+/)[0];if(p)assets.add(p);}}
 const list=[...assets];for(let i=0;i<list.length;i+=4)await Promise.all(list.slice(i,i+4).map(async p=>{try{const r=await fetch(new URL(p,root),{signal:AbortSignal.timeout(30000)});if(!r.ok)errors.push(p+': HTTP '+r.status);await r.arrayBuffer();checkedAssets++;}catch(e){errors.push(p+': '+e.name);}}));
 for(const [page,$]of documents)$('a[href]').each((_,el)=>{const href=$(el).attr('href');if(!href.startsWith('/')&&!href.startsWith('#'))return;const u=new URL(href,new URL(page,root));const target=documents.get(u.pathname);if(u.hash&&target&&!target('[id]').toArray().some(x=>target(x).attr('id')===decodeURIComponent(u.hash.slice(1))))errors.push(page+': missing anchor '+href);});
 const protectedResults=[];for(const p of ['/api/admin/dashboard','/api/admin/media','/api/bookings','/dashboard.html','/profile.html','/my-bookings.html']){const r=await fetch(new URL(p,root),{redirect:'manual',signal:AbortSignal.timeout(30000)});protectedResults.push({path:p,status:r.status});if(![401,403,303].includes(r.status))errors.push(p+': private route allowed anonymous access');await r.arrayBuffer();}
 console.log(JSON.stringify({root,pages:pages.length,fleet: fleet.length,assets:checkedAssets,protectedResults,errors},null,2));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e.name);process.exitCode=1;});
