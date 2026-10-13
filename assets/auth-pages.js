(async()=>{
 const auth=window.mzgAuth;await auth.ready;const form=document.querySelector('#auth-form'),feedback=document.querySelector('#auth-feedback');const params=new URLSearchParams(location.search);const destination=auth.next(params.get('next'));const mode=form?.dataset.mode;
 if(['signup','signin'].includes(mode)&&auth.state.user){location.replace(destination);return;}
 const switchLink=document.querySelector('#switch-auth');if(switchLink)switchLink.href=(mode==='signup'?'/login.html':'/signup.html')+'?next='+encodeURIComponent(destination);
 const token=new URLSearchParams(location.hash.slice(1)).get('token');if(token)history.replaceState(null,'',location.pathname+location.search);
 const show=(text,error=false)=>{if(feedback){feedback.textContent=text;feedback.className=error?'form-feedback error':'form-feedback success';}};
 const mark=(name,message)=>{const input=form?.elements.namedItem(name),field=document.querySelector('#error-'+name);if(field)field.textContent=message;if(input)input.setAttribute('aria-invalid',String(Boolean(message)));};
 const clear=()=>{document.querySelectorAll('.field-error').forEach(e=>e.textContent='');form?.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));};
 document.querySelector('#show-password')?.addEventListener('click',event=>{const input=form.elements.password,show=input.type==='password';input.type=show?'text':'password';event.currentTarget.textContent=show?'Hide password':'Show password';event.currentTarget.setAttribute('aria-pressed',String(show));});
 form?.addEventListener('submit',async event=>{
  event.preventDefault();clear();show('');const data=Object.fromEntries(new FormData(form));data.consent=form.elements.consent?.checked===true;let invalid=false;
  const error=(name,message)=>{mark(name,message);invalid=true;};
  if(form.elements.email&&(!data.email||form.elements.email.validity.typeMismatch))error('email','Enter a valid email address.');
  if(form.elements.password&&(data.password.length<12||data.password.length>128))error('password','Use a password of 12–128 characters.');
  if(form.elements.confirmPassword&&data.confirmPassword!==data.password)error('confirmPassword','Passwords must match.');
  if(mode==='signup'){if(!data.name||data.name.trim().length<2)error('name','Enter your full name.');if(!/^(?:03\d{9}|\+?923\d{9})$/.test((data.phone||'').replace(/[\s()-]/g,'')))error('phone','Use 03XXXXXXXXX or +923XXXXXXXXX.');if(!data.consent)error('consent','Accept the terms to continue.');}
  if(mode==='reset-password'&&!token){show('This reset link is missing. Request a new link.',true);return;}
  if(invalid){show('Please correct the highlighted fields.',true);form.querySelector('[aria-invalid=true]')?.focus();return;}
  const button=form.querySelector('[type=submit],button.primary');const original=button.textContent;button.disabled=true;button.textContent='Please wait…';
  try{if(mode==='reset-password')data.token=token;const result=await auth.api('/api/'+mode,{method:'POST',data});if(result.user){auth.state.csrfToken=result.csrfToken;auth.setUser(result.user);sessionStorage.setItem('mzg-account-notice',result.message||'Welcome back.');location.assign(destination);}else{show(result.message);if(mode==='reset-password'){form.reset();button.hidden=true;const link=document.createElement('a');link.className='text-link';link.href='/login.html';link.textContent='Sign in with your new password ↗';form.append(link);}}}catch(e){show(e.message,true);if(e.fields)for(const [key,message]of Object.entries(e.fields))mark(key,message);}finally{button.disabled=false;button.textContent=original;}
 });
 const verify=document.querySelector('#verify-email-action');if(verify){const notice=document.querySelector('#verify-feedback');if(!token){verify.disabled=true;notice.textContent='This verification link is missing. Sign in and resend it from Account Settings.';}verify.addEventListener('click',async()=>{verify.disabled=true;notice.textContent='Verifying your email…';try{const result=await auth.api('/api/verify-email',{method:'POST',data:{token}});notice.textContent=result.message;verify.hidden=true;await auth.refresh();}catch(e){notice.textContent=e.message;verify.disabled=false;}});}
})();
