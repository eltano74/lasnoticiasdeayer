// Placa de efeméride de La Hoja de Ayer (hoja de calendario, fondo claro).
// Uso: node herramientas/efemeride.js efemeride.json salida.png [posteo|historia]
// efemeride.json: {"dia":"10 DE DICIEMBRE","anio":"1983","hace":"Hace 43 años","titulo","bajada","tono":"normal|memoria"}
// "memoria": versión sobria en gris oscuro, para fechas trágicas.
const {chromium}=require('playwright');const fs=require('fs');
const [,,path,out,formato='posteo']=process.argv;
const E=JSON.parse(fs.readFileSync(path,'utf8'));
const story=formato==='historia';const H=story?1920:1350;
const mem=E.tono==='memoria';
const C=mem?{bg:'#1F2228',ink:'#F2F3EF',acc:'#C9CCD4',tag:'#F2F3EF',tagInk:'#1F2228',sub:'#B9BDC7',line:'#3A3E47'}
          :{bg:'#F2F3EF',ink:'#16181D',acc:'#2340B8',tag:'#FFD84D',tagInk:'#16181D',sub:'#4A4F5C',line:'#D9DBD3'};
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MARK=w=>`<svg viewBox="0 0 64 68" width="${w}" height="${w*68/64}" style="transform:rotate(-4deg);flex:none"><path fill="${mem?'#2A2E36':'#FBFBF8'}" stroke="${C.ink}" stroke-width="3" d="M12 12H52a6 6 0 0 1 6 6V48L45 61H12a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z"/><path fill="${mem?'#8A8F9B':'#2340B8'}" d="M7.5 18a4.5 4.5 0 0 1 4.5-4.5H52a4.5 4.5 0 0 1 4.5 4.5V27H7.5Z"/><text x="32" y="23.4" text-anchor="middle" font-size="8" font-family="DejaVu Sans Mono" font-weight="700" fill="#FFFFFF" letter-spacing="1.1">AYER</text><rect fill="${C.ink}" x="17" y="5" width="5" height="13" rx="2.5"/><rect fill="${C.ink}" x="42" y="5" width="5" height="13" rx="2.5"/><text x="30" y="51" text-anchor="middle" font-size="24" font-family="Inter Display" font-weight="800" fill="${C.ink}">−1</text><path fill="${C.line}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round" d="M58 48H49a4 4 0 0 0-4 4V61Z"/></svg>`;
const html=(y,t,b)=>`<html><head><style>*{box-sizing:border-box;margin:0}body{font-family:'Inter Display',Inter,sans-serif}.k{font-family:'DejaVu Sans Mono',monospace;letter-spacing:.14em;font-weight:700}</style></head><body>
<div id="c" style="width:1080px;height:${H}px;background:${C.bg};color:${C.ink};padding:${story?'230px 90px 260px':'90px'};display:flex;flex-direction:column;gap:${story?40:30}px;overflow:hidden">
<div style="display:flex;justify-content:space-between;align-items:center;gap:20px">
 <span class="k" style="font-size:26px;background:${C.tag};color:${C.tagInk};padding:12px 20px;border-radius:8px">${mem?'MEMORIA':'EFEMÉRIDE'} · ${esc(E.dia)}</span>
 <span class="k" style="font-size:24px;color:${C.sub}">${esc(E.hace)}</span>
</div>
<div id="y" style="font-weight:800;font-size:${y}px;line-height:.82;letter-spacing:-.06em;color:${C.acc};margin-top:10px">${esc(E.anio)}</div>
<div style="height:5px;background:${C.ink};flex:none"></div>
<div id="t" style="font-weight:800;font-size:${t}px;line-height:1;letter-spacing:-.03em">${esc(E.titulo)}</div>
<div id="b" style="font-family:'DejaVu Serif',serif;font-size:${b}px;line-height:1.42;color:${C.sub}">${esc(E.bajada)}</div>
<div id="f" style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:20px">
 <div style="display:flex;align-items:center;gap:18px">${MARK(58)}<div style="font-weight:800;font-size:36px;line-height:.9;letter-spacing:-.02em">La Hoja<br><span style="color:${C.acc}">de Ayer</span></div></div>
 <span class="k" style="font-size:24px;background:${C.ink};color:${C.bg};padding:15px 24px;border-radius:999px;white-space:nowrap">LAHOJADEAYER.COM.AR</span>
</div></div></body></html>`;
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:1080,height:H}});
let y=story?360:340,t=story?110:100,b=story?52:46;
for(let i=0;i<30;i++){await p.setContent(html(y,t,b));await p.waitForTimeout(80);
 const fits=await p.evaluate(()=>{const c=document.getElementById('c');return c.scrollHeight<=c.clientHeight});
 if(fits)break; y=Math.round(y*0.95); t=Math.round(t*0.94); b=Math.max(28,Math.round(b*0.96));}
await p.screenshot({path:out});await br.close();console.log('ok',out,y,t,b);})();
