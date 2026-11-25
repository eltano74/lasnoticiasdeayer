// Genera la placa de Instagram (modelo B) de La Hoja de Ayer.
// Uso: node herramientas/placa.js nota.json salida.png [posteo|historia]
// nota.json: {"titulo","bajada","rubro","fecha","fuente"} (opcional "pie": reemplaza la línea "Fuente: ...", p. ej. "Nota de la editora")
const {chromium}=require('playwright');const fs=require('fs');
const [,,notaPath,out,formato='posteo']=process.argv;
const N=JSON.parse(fs.readFileSync(notaPath,'utf8'));
const story=formato==='historia';const H=story?1920:1350;
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MARK=w=>`<svg viewBox="0 0 64 68" width="${w}" height="${w*68/64}" style="transform:rotate(-4deg);flex:none"><path fill="#FFFFFF" stroke="#FFFFFF" stroke-width="3" d="M12 12H52a6 6 0 0 1 6 6V48L45 61H12a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z"/><path fill="#2340B8" d="M7.5 18a4.5 4.5 0 0 1 4.5-4.5H52a4.5 4.5 0 0 1 4.5 4.5V27H7.5Z"/><text x="32" y="23.4" text-anchor="middle" font-size="8" font-family="DejaVu Sans Mono" font-weight="700" fill="#FFFFFF" letter-spacing="1.1">AYER</text><rect fill="#FFFFFF" x="17" y="5" width="5" height="13" rx="2.5"/><rect fill="#FFFFFF" x="42" y="5" width="5" height="13" rx="2.5"/><text x="30" y="51" text-anchor="middle" font-size="24" font-family="Inter Display" font-weight="800" fill="#16181D">−1</text><path fill="#D9DBD3" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" d="M58 48H49a4 4 0 0 0-4 4V61Z"/></svg>`;
const html=(t,b)=>`<html><head><style>*{box-sizing:border-box;margin:0}body{font-family:'Inter Display',Inter,sans-serif}.k{font-family:'DejaVu Sans Mono',monospace;letter-spacing:.14em;font-weight:700}</style></head><body>
<div id="c" style="width:1080px;height:${H}px;background:#2340B8;color:#fff;padding:${story?'230px 90px 260px':'90px'};display:flex;flex-direction:column;gap:${story?50:40}px;overflow:hidden">
<div style="display:flex;align-items:center;gap:22px">${MARK(70)}<div style="font-weight:800;font-size:43px;line-height:.9;letter-spacing:-.02em">La Hoja<br><span style="color:#BFD0FF">de Ayer</span></div></div>
<div style="height:4px;background:#fff;opacity:.35;margin-top:10px;flex:none"></div>
<span class="k" style="font-size:28px;color:#FFD84D">${esc(N.rubro)} · ${esc(N.fecha)}</span>
<div id="t" style="font-weight:800;font-size:${t}px;line-height:.98;letter-spacing:-.035em">${esc(N.titulo)}</div>
<div id="b" style="font-family:'DejaVu Serif',serif;font-size:${b}px;line-height:1.4;opacity:.92">${esc(N.bajada)}</div>
<div id="f" style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:20px"><span class="k" style="font-size:22px;opacity:.75">${esc(N.pie||("Fuente: "+N.fuente))}</span><span class="k" style="font-size:26px;background:#fff;color:#2340B8;padding:16px 26px;border-radius:999px;white-space:nowrap">LAHOJADEAYER.COM.AR</span></div>
</div></body></html>`;
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:1080,height:H}});
let t=story?156:132,b=story?52:46;
for(let i=0;i<30;i++){await p.setContent(html(t,b));await p.waitForTimeout(80);
 const fits=await p.evaluate(()=>{const c=document.getElementById('c'),f=document.getElementById('f');return f.getBoundingClientRect().bottom<=c.getBoundingClientRect().bottom-(parseFloat(getComputedStyle(c).paddingBottom)-1)&&c.scrollHeight<=c.clientHeight});
 if(fits)break; t=Math.round(t*0.93); b=Math.max(30,Math.round(b*0.96));}
await p.screenshot({path:out});await br.close();console.log('ok',out,t,b);})();
