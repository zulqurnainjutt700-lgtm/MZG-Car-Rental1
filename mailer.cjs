const nodemailer=require('nodemailer');
const tls=require('node:tls');
// Trust Node and operating-system roots while retaining full certificate checks.
const smtpCa=[...tls.getCACertificates('default'),...tls.getCACertificates('system')];
function createMailer(env=process.env){
 if(env.RESEND_API_KEY&&env.EMAIL_FROM){return {configured:true,provider:'resend',async send({to,subject,text,html,idempotencyKey}){const headers={Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'};if(idempotencyKey)headers['Idempotency-Key']=idempotencyKey;const response=await fetch('https://api.resend.com/emails',{method:'POST',headers,signal:AbortSignal.timeout(15000),body:JSON.stringify({from:env.EMAIL_FROM,to:[to],subject,text,html:html||require('./email-templates.cjs').brandedEmail({subject,text})})});if(!response.ok)throw Object.assign(Error('Email provider rejected delivery.'),{code:'EMAIL_PROVIDER_'+response.status});const data=await response.json();if(!data.id)throw Error('Email provider did not acknowledge the message.');return {providerId:data.id};},async verify(){throw Error('Use a real test email to verify Resend sender acceptance; API key presence does not verify delivery.');}};}
 const configured=Boolean(env.SMTP_HOST&&env.SMTP_FROM&&(!env.SMTP_USER||env.SMTP_PASS));
 let transport;
 if(configured){const port=Number(env.SMTP_PORT||587);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid SMTP_PORT');transport=nodemailer.createTransport({host:env.SMTP_HOST,port,secure:env.SMTP_SECURE==='true'||port===465,requireTLS:port!==465,auth:env.SMTP_USER?{user:env.SMTP_USER,pass:env.SMTP_PASS}:undefined,tls:{rejectUnauthorized:true,ca:smtpCa},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});}
 return {configured,provider:'smtp',async send({to,subject,text,html}){if(!configured)throw new Error('SMTP is not configured');const result=await transport.sendMail({from:env.SMTP_FROM,to,subject,text,html:html||require('./email-templates.cjs').brandedEmail({subject,text}),disableFileAccess:true,disableUrlAccess:true});if(!result.accepted?.length)throw new Error('Message was not accepted');return {providerId:result.messageId};},async verify(){if(!configured)throw new Error('SMTP is not configured');return transport.verify();}};
}
module.exports={createMailer};
