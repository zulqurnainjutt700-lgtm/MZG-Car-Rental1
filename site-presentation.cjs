const {esc}=require('./cms.cjs');
function applyPresentation($,s={}){
 // Keep ownership verification in server-rendered HTML, including saved CMS pages.
 $('meta[name="google-site-verification"]').remove();
 $('head').append('<meta name="google-site-verification" content="CNyAPvbUIWEx_Z4wFZmbXkkAK5fNVpx83t6AG-7xaso">');
 // Native submission must never put passwords in URL/history if JavaScript is delayed.
 $('form').filter((_,e)=>$(e).find('input[type="password"]').length).attr('method','post');
 const accountForm=$('form#auth-form[data-mode="signin"]');
 if(accountForm.length&&!$('[data-account-security-note]').length)accountForm.before('<p class="fine-print" data-account-security-note>Use your MZG account password here. This is not a Google or Gmail sign-in page.</p>');
 const p=s.presentation||{};
 $('body').attr('data-email-compose',p.emailComposeMode||'chooser');
 $('body').attr('data-business-whatsapp',s.whatsapp||'923025184681');
 if(s.name)$('header .logo').attr('aria-label',s.name+' home');
 if(s.name)$('.logo').each((_,e)=>{const n=$(e);if(!n.find('img').length)n.contents().filter((_,x)=>x.type==='text').first().replaceWith(esc(s.name==='MZG Car Rental'?'MZG':s.name));});
 for(const [selector,key]of [['header .logo','headerLogo'],['footer .logo','footerLogo']]){const logo=s[key]??s.logo;if(logo)$(selector).html('<img src="'+esc(logo)+'" alt="'+esc(s.name||'MZG Car Rental')+'" style="max-width:160px;max-height:56px;width:auto;object-fit:contain">');}
 for(const [key,prefix]of [['email','mailto:'],['phone','tel:'],['whatsapp','https://wa.me/']])if(s[key])$('a[href^="'+prefix+'"]').each((_,e)=>{$(e).attr('href',prefix+s[key]);if(key!=='whatsapp')$(e).text(s[key]);});
 if(p.supportEnabled===false)$('.whatsapp-float').remove();else $('.whatsapp-float').attr('aria-label',p.supportLabel||'Chat on WhatsApp');
 if(s.footer)$('.footer-top p').text(s.footer);
 if(s.address)$('.footer-contact p').first().text(s.address);
 if(s.hours)$('.footer-contact').append('<p>'+esc(s.hours)+'</p>');
 for(const link of s.social||[])$('.footer-contact').append('<a href="'+esc(link.url)+'">'+esc(link.label)+'</a>');
 if(s.favicon){$('link[rel="icon"]').remove();$('head').append('<link rel="icon" href="'+esc(s.favicon)+'">');}
 if(p.copyright)$('.footer-bottom>span').first().text(p.copyright.replace(/\{year\}/g,String(new Date().getFullYear())));
 if(p.footerGroups?.length){const contact=$('.footer-contact').clone();$('.footer-links').empty();for(const group of p.footerGroups){const n=$('<div>');n.append('<h3>'+esc(group.title)+'</h3>');for(const link of group.links)n.append('<a href="'+esc(link.url)+'">'+esc(link.label)+'</a>');$('.footer-links').append(n);}$('.footer-links').append(contact);}
 if(s.navigation?.length){$('header nav>a').remove();for(const n of [...s.navigation].reverse())$('header nav').prepend('<a href="'+esc(n.url)+'">'+esc(n.label)+'</a>');}
 const font={brand:"'DM Sans',sans-serif",system:'system-ui,sans-serif',arial:'Arial,sans-serif'}[p.font]||"'DM Sans',sans-serif";
 if(p.font&&p.font!=='brand')$('body').attr('style',($('body').attr('style')||'')+';font-family:'+font);
 if(!$('script[src="/assets/notifications-ui.js"]').length)$('body').append('<script src="/assets/notifications-ui.js" defer></script>');
 return $;
}
module.exports={applyPresentation};
