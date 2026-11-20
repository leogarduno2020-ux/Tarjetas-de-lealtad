const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{
const dir=__dirname;
const pages=fs.readdirSync(dir+'/paginas').filter(f=>/^p\d+\.html$/.test(f)).sort().map(f=>fs.readFileSync(dir+'/paginas/'+f,'utf8')).join('\n');
const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>A contraluz · Salud mental en México · Núm. 1</title><meta name="author" content="Equipo 4"><link rel="stylesheet" href="style.css"></head><body>\n${pages}\n</body></html>`;
fs.writeFileSync(dir+'/revista.html',html);
const b=await chromium.launch();const pg=await b.newPage();
await pg.goto('file://'+dir+'/revista.html');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(500);
const rep=await pg.evaluate(()=>{
 const mm=96/25.4,out=[];
 document.querySelectorAll('.page').forEach((p,i)=>{
  const pr=p.getBoundingClientRect();
  const inn=p.querySelector('.in');
  let maxB=0;
  if(inn){const ir=inn.getBoundingClientRect();
    inn.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.height){ if(r.bottom>ir.bottom+1.5||r.right>ir.right+1.5) out.push(`p${i+1} OVERFLOW ${e.tagName}.${e.className} "${(e.textContent||'').trim().slice(0,40)}" b=${((r.bottom-ir.bottom)/mm).toFixed(1)}mm r=${((r.right-ir.right)/mm).toFixed(1)}mm`);} });
    // scrollHeight check for in
    if(inn.scrollHeight>inn.clientHeight+2) out.push(`p${i+1} .in scroll ${(inn.scrollHeight-inn.clientHeight)/mm}mm`);
    // find slack: last child bottom
    const last=[...inn.children].pop(); if(last){const lr=last.getBoundingClientRect(); out.push(`p${i+1} slack ${((ir.bottom-lr.bottom)/mm).toFixed(1)}mm`);} }
  // fonts <7.5pt
 });
 return out;});
console.log(rep.join('\n'));
await pg.pdf({path:dir+'/A-Contraluz_Salud-mental-en-Mexico.pdf',width:'215.9mm',height:'279.4mm',printBackground:true,preferCSSPageSize:true});
await b.close();})();
