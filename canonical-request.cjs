// Keep authentication on one origin without broadening the CSRF allowlist.
function canonicalPageLocation(req, origin) {
 const canonical=new URL(origin);
 if(canonical.protocol!=='https:'||canonical.username||canonical.password||canonical.pathname!=='/'||canonical.search||canonical.hash)throw Error('Invalid PUBLIC_ORIGIN');
 if(!['GET','HEAD'].includes(req.method))return null;
 const host=String(req.headers.host||'').toLowerCase();
 if(!host||host===canonical.host.toLowerCase())return null;
 const url=new URL(req.url,'https://internal.invalid');
 if(/^\/(?:api|media|assets)(?:\/|$)/.test(url.pathname))return null;
 return canonical.origin+url.pathname+url.search;
}
module.exports={canonicalPageLocation};
