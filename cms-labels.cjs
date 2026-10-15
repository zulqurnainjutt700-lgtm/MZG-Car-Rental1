// Add safe leaf-label controls without resetting existing drafts/publications.
function upgradeLabels(db,transaction){
 if(db.prepare("SELECT value FROM metadata WHERE key='cms_leaf_labels_v1'").get())return;
 const cheerio=require('cheerio');{
 for(const row of db.prepare('SELECT slug,draft,published FROM cms_pages').all()){
  const base=db.prepare('SELECT value FROM site_settings WHERE key=?').get('base:'+row.slug),schemaRow=db.prepare('SELECT value FROM site_settings WHERE key=?').get('schema:'+row.slug);if(!base||!schemaRow)continue;
  const $=cheerio.load(base.value),schema=JSON.parse(schemaRow.value),added=new Map();
  for(const block of schema.blocks.filter(b=>b.type==='existing')){const node=$('[data-cms-block="'+block.id+'"]'),fields=[];node.find('span,small,strong,b,li,summary,label,button,.eyebrow').each((_,e)=>{const n=$(e);if(n.children().length||n.closest('[data-cms-field]').length||n.closest('[data-cms-block]').attr('data-cms-block')!==block.id||!/[A-Za-z0-9]/.test(n.text()))return;const key='label-'+fields.length;n.attr('data-cms-field',key);fields.push({key,tag:e.tagName,text:n.text().trim()});});block.fields.push(...fields);added.set(block.id,fields);}
  for(const state of ['draft','published']){const content=JSON.parse(row[state]);for(const b of content.blocks.filter(b=>b.type==='existing'))for(const f of added.get(b.sourceId||b.id)||[])if(!b.fields.some(x=>x.key===f.key))b.fields.push(f);db.prepare('UPDATE cms_pages SET '+state+'=? WHERE slug=?').run(JSON.stringify(content),row.slug);}
  db.prepare('UPDATE site_settings SET value=? WHERE key=?').run($.html(),'base:'+row.slug);db.prepare('UPDATE site_settings SET value=? WHERE key=?').run(JSON.stringify(schema),'schema:'+row.slug);
 }db.prepare('INSERT INTO metadata(key,value) VALUES(?,?)').run('cms_leaf_labels_v1',new Date().toISOString());}
}
module.exports={upgradeLabels};
