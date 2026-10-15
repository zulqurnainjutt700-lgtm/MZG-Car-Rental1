const variants=require('./image-variants.json');
function imageVariants(src){return variants[src]?.map(v=>v.url+' '+v.width+'w').join(', ')||'';}
module.exports={imageVariants};
