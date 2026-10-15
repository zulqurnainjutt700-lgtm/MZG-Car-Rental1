// Read-only HTTP inspection: no browser execution, credential submission or review submission.
const fs=require('node:fs'),crypto=require('node:crypto'),{load}=require('cheerio');
const origin='https://mzg-car-rental2.vercel.app';
const pages=['/','/about.html','/contact.html','/fleet.html','/rental-plans.html','/rental-policy.html','/privacy-policy.html','/terms-and-conditions.html','/image-credits.html','/login.html','/signup.html','/forgot-password.html','/reset-password.html','/verify-email.html','/admin','/admin.html','/admin/dashboard'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function read(p,headers={}){const r=await fetch(new URL(p,origin),{redirect:'manual',headers,signal:AbortSignal.timeout(30000)});return {r,text:await r.text()};}
(async()=>{
 const report={date:new Date().toISOString(),origin,pages:[],scripts:[],sensitivePaths:[],contextComparisons:[],limits:['Targeted HTTP/source audit, not proof of absence of compromise or Google approval.','No passwords, sessions or private database records inspected.']},scripts=new Set();
 for(const path of pages){const {r,text}=await read(path),$=load(text);const entry={path,status:r.status,redirect:r.headers.get('location'),title:$('title').text(),heading:$('h1').text(),externalScripts:[],frames:[],forms:[],externalLinkHosts:[],logos:[],findings:[]};
  $('script[src]').each((_,e)=>{const src=$(e).attr('src'),u=new URL(src,origin);if(u.origin!==origin)entry.externalScripts.push(src);else scripts.add(u.pathname);});
  $('iframe,object,embed').each((_,e)=>entry.frames.push($(e).attr('src')||$(e).attr('data')||e.tagName));
  $('form').each((_,e)=>entry.forms.push({id:$(e).attr('id'),action:$(e).attr('action')||'(JavaScript handler)',method:$(e).attr('method')||'GET default'}));
  const hosts=new Set();$('a[href]').each((_,e)=>{const href=$(e).attr('href');if(/^https?:/i.test(href)){const u=new URL(href);if(u.origin!==origin)hosts.add(u.host);}if(/^javascript:/i.test(href))entry.findings.push('javascript: link');});entry.externalLinkHosts=[...hosts];
  $('.logo img,.admin-brand img').each((_,e)=>entry.logos.push({src:$(e).attr('src'),alt:$(e).attr('alt')}));
  if($('meta[http-equiv="refresh"]').length)entry.findings.push('meta refresh');
  if($('script:not([src])').filter((_,e)=>$(e).attr('type')!=='application/ld+json'&&$(e).text().trim()).length)entry.findings.push('inline executable script');
  entry.securityHeaders={csp:r.headers.get('content-security-policy'),hsts:r.headers.get('strict-transport-security'),nosniff:r.headers.get('x-content-type-options')};report.pages.push(entry);
 }
 for(const path of scripts){const {r,text}=await read(path);const localPath=path.slice(1),local=fs.existsSync(localPath)?fs.readFileSync(localPath,'utf8'):null;report.scripts.push({path,status:r.status,sha256:sha(text),matchesProject:local!==null&&text.replace(/\r\n/g,'\n')===local.replace(/\r\n/g,'\n'),suspiciousTokens:[...new Set((text.match(/\beval\s*\(|new Function\s*\(|sendBeacon\s*\(|document\.write\s*\(/g)||[]))]});}
 for(const path of ['/.env','/.git/config','/server.cjs','/postgres-schema.sql','/.private/auth.sqlite','/api/admin/dashboard','/api/admin/settings','/api/bookings']){const {r}=await read(path);report.sensitivePaths.push({path,status:r.status});}
 for(const path of ['/','/login.html','/admin']){const ordinary=await read(path),google=await read(path,{'User-Agent':'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)','Referer':'https://www.google.com/'});report.contextComparisons.push({path,sameBody:ordinary.text===google.text,status:google.r.status,redirect:google.r.headers.get('location')});}
 fs.writeFileSync('SAFE_BROWSING_AUDIT_RESULTS.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({pages:report.pages.length,scripts:report.scripts.length,scriptMismatches:report.scripts.filter(x=>!x.matchesProject),pageFindings:report.pages.filter(x=>x.findings.length||x.externalScripts.length||x.frames.length),sensitivePaths:report.sensitivePaths,contextComparisons:report.contextComparisons},null,2));
})().catch(e=>{console.error(e.name+': '+e.message);process.exitCode=1;});
