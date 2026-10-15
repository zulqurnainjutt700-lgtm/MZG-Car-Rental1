
window.mzgRequestReady=(button,review)=>{
 if(button){button.dataset.originalLabel ||= button.textContent;button.textContent='Request ready ✓';button.classList.add('request-ready');}
 let banner=review.querySelector('.request-ready-notice');
 if(!banner){banner=document.createElement('div');banner.className='request-ready-notice';banner.setAttribute('role','status');banner.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m7 12 3 3 7-7"/></svg><div><strong>Request ready</strong><span>Review your details, then open WhatsApp to send. This is not a booking confirmation.</span></div>';review.prepend(banner);}
 banner.classList.remove('animate-ready');requestAnimationFrame(()=>banner.classList.add('animate-ready'));
};
document.addEventListener('input',event=>{const form=event.target.closest('form');if(!form)return;form.querySelectorAll('.request-ready').forEach(button=>{button.textContent=button.dataset.originalLabel;button.classList.remove('request-ready');});});
const menu=document.querySelector('.menu'),navigation=document.querySelector('header nav');
function closeNavigation(){navigation?.classList.remove('open');document.body.classList.remove('nav-open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open navigation');}
if(menu&&navigation){navigation.id||='mzg-navigation';menu.setAttribute('aria-controls',navigation.id);menu.addEventListener('click',()=>{const open=navigation.classList.toggle('open');document.body.classList.toggle('nav-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');if(open)navigation.querySelector('a,button')?.focus();});navigation.addEventListener('click',e=>{if(e.target.closest('a'))closeNavigation();});document.addEventListener('keydown',e=>{if(!navigation.classList.contains('open'))return;if(e.key==='Escape'){closeNavigation();menu.focus();}if(e.key==='Tab'){const items=[menu,...navigation.querySelectorAll('a[href],button,summary')].filter(el=>el.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});window.addEventListener('resize',()=>{if(innerWidth>760)closeNavigation();});}

document.querySelector('#year')?.replaceChildren(document.createTextNode(new Date().getFullYear()));
const enquiry=document.querySelector('#enquiry-form');
if(enquiry){
 const localToday=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const pickup=document.querySelector('#contact-pickup'),dropoff=document.querySelector('#contact-return');pickup.min=localToday;dropoff.min=localToday;
 pickup.addEventListener('change',()=>{dropoff.min=pickup.value||localToday;if(dropoff.value&&dropoff.value<pickup.value)dropoff.value=''});
 const params=new URLSearchParams(location.search);if(params.get('car')){const select=document.querySelector('#contact-car');if([...select.options].some(o=>o.value===params.get('car')))select.value=params.get('car')}
 if(params.get('type')==='airport')enquiry.elements.type.value='Airport pickup';
 enquiry.addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(enquiry);const error=document.querySelector('#form-error');
  if(String(data.get('name')).trim().length<2){error.textContent='Please enter your name (at least two characters).';return}
  if(data.get('return')&&data.get('pickup')&&data.get('return')<data.get('pickup')){error.textContent='The return date must be on or after the pickup date.';return}
  error.textContent='';const lines=['Hello MZG Car Rental, I would like to enquire about a rental in Lahore.','',`Name: ${String(data.get('name')).trim()}`,`Phone: ${data.get('phone')}`];
  if(data.get('email'))lines.push(`Email: ${data.get('email')}`);lines.push(`Enquiry: ${data.get('type')}`,`Preferred car: ${data.get('car')}`);
  if(data.get('pickup'))lines.push(`Pick-up: ${data.get('pickup')}`);if(data.get('return'))lines.push(`Return: ${data.get('return')}`);if(data.get('location'))lines.push(`Lahore pickup area: ${data.get('location')}`);if(data.get('message'))lines.push('',String(data.get('message')).trim());
  const message=lines.join('\n');document.querySelector('#enquiry-text').textContent=message;document.querySelector('#send-enquiry').href='https://wa.me/923025184681?text='+encodeURIComponent(message);window.mzgRequestReady(enquiry.querySelector('button[type="submit"]'),document.querySelector('#enquiry-review'));enquiry.hidden=true;document.querySelector('#enquiry-review').hidden=false;document.querySelector('#enquiry-review').scrollIntoView({behavior:'smooth',block:'center'});
 });
 document.querySelector('#edit-enquiry').addEventListener('click',()=>{enquiry.hidden=false;document.querySelector('#enquiry-review').hidden=true;const button=enquiry.querySelector('.request-ready');if(button){button.textContent=button.dataset.originalLabel;button.classList.remove('request-ready');}enquiry.elements.name.focus()});
}

// Keep the support shortcut clear of essential form and hero actions.
const supportShortcut=document.querySelector('.whatsapp-float');if(supportShortcut){let pending=false;const placeSupport=()=>{pending=false;const r=supportShortcut.getBoundingClientRect();const overlaps=[...document.querySelectorAll('form input,form select,form textarea,form button,.hero-link,dialog[open]')].some(el=>{const b=el.getBoundingClientRect();return b.width&&b.height&&b.top<r.bottom+8&&b.bottom>r.top-8&&b.left<r.right+8&&b.right>r.left-8;});supportShortcut.classList.toggle('is-occluded',overlaps);};const queueSupport=()=>{if(!pending){pending=true;requestAnimationFrame(placeSupport);}};addEventListener('scroll',queueSupport,{passive:true});addEventListener('resize',queueSupport);queueSupport();}
