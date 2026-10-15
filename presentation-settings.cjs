function validatePresentation(input={},previous={},fail){
 const {safeUrl}=require('./cms.cjs'),p={...previous,...input};
 const text=(v,n)=>{if(typeof v!=='string'||v.length>n)fail(400,'Check presentation text lengths.');return v.trim();};
 const footerGroups=Array.isArray(p.footerGroups)?p.footerGroups.slice(0,3).map(g=>({title:text(g.title,100),links:Array.isArray(g.links)?g.links.slice(0,12).map(l=>{if(!safeUrl(l.url))fail(400,'Use safe footer destinations.');return {label:text(l.label,100),url:l.url};}):[]})):[];
 return {supportEnabled:p.supportEnabled!==false,supportLabel:text(p.supportLabel||'Chat on WhatsApp',100),emailComposeMode:['chooser','gmail','app'].includes(p.emailComposeMode)?p.emailComposeMode:'chooser',font:['brand','system','arial'].includes(p.font)?p.font:'brand',copyright:text(p.copyright||'',200),footerGroups};
}
function defaultFooterGroups(){const fs=require('fs'),path=require('path'),$=require('cheerio').load(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'));return $('.footer-links>div:not(.footer-contact)').toArray().map(n=>({title:$(n).find('h3').text(),links:$(n).find('a').toArray().map(a=>({label:$(a).text(),url:$(a).attr('href')}))}));}
module.exports={validatePresentation,defaultFooterGroups};
