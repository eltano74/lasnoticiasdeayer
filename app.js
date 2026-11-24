/* La Hoja de Ayer — versión pública. Lee data/index.json y data/ediciones/AAAA-MM-DD.json */
const RUBROS=[
  {id:"politica",label:"Política"},
  {id:"economia",label:"Economía"},
  {id:"espectaculos",label:"Espectáculos"},
  {id:"entretenimiento",label:"Entretenimiento"},
  {id:"deporte",label:"Deporte"},
  {id:"falopas",label:"Noticias falopas"}
];
const ICO={
  politica:'<path d="M3 20h18M5 20v-7M9.5 20v-7M14.5 20v-7M19 20v-7M3 13h18M6 13a6 6 0 0 1 12 0M12 7V3.5l3 1-3 1"/>',
  economia:'<path d="M4 20h16M5 16l4.5-4.5 3 3L18 9"/><path d="M14 9h4v4"/>',
  espectaculos:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
  entretenimiento:'<rect x="3" y="4.5" width="18" height="13" rx="2"/><path d="M10 8.5v5l4.5-2.5zM8 21h8"/>',
  deporte:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5l3.6 2.6-1.4 4.2H9.8l-1.4-4.2zM12 7.5V3M15.6 10.1l4.6-1.4M14.2 14.3l2.8 3.9M9.8 14.3L7 18.2M8.4 10.1 3.8 8.7"/>',
  falopas:'<path d="M12 12.5a.9.9 0 0 1 1.5-.6 2.4 2.4 0 0 1-1.1 3.9 4.2 4.2 0 0 1-4.9-3.6A6 6 0 0 1 12.6 6a7.8 7.8 0 0 1 8.2 6.3"/><path d="M20 3.5l.6 2M16.8 2.6l-.2 1.6M22.5 7.4l-1.7.5"/>'
};
const AT='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>';
const REDES=[
  {id:"instagram",label:"Instagram",base:"https://www.instagram.com/"}
  /* Para sumar más redes: {id:"x",label:"X",base:"https://x.com/"}, {id:"tiktok",label:"TikTok",base:"https://www.tiktok.com/@"}, {id:"facebook",label:"Facebook",base:"https://www.facebook.com/"} */
];
const BAJADA={falopas:"Lo insólito del país, tal cual pasó. No es joda, aunque parezca."};
const RLABEL=Object.fromEntries(RUBROS.map(r=>[r.id,r.label]));
const DIAS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

const state={index:null,cache:{},rubro:"todas",day:null,view:"dia",ha:null,haCache:{},nota:null};
const $=id=>document.getElementById(id);

function icon(id){return ICO[id]?`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[id]}</svg>`:""}
function parseDay(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function fmt(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function addDay(s){const d=parseDay(s);d.setDate(d.getDate()+1);return fmt(d)}
function longDate(s){const d=parseDay(s);return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeUrl(u){try{const x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:"#"}catch(e){return "#"}}
function days(){return Object.keys(state.index?.dias||{}).sort()}

function redUrl(r,v){v=(v||"").trim();if(!v)return null;if(/^https?:\/\//i.test(v))return safeUrl(v)==="#"?null:v;const h=v.replace(/^@/,"").replace(/[^A-Za-z0-9._-]/g,"");return h?r.base+h:null}
function renderSocial(){
  const cfg=state.index?.config?.redes||{};
  $("social").innerHTML=`<span class="lab">Seguinos</span>`+REDES.map(r=>{const u=redUrl(r,cfg[r.id]);return u?`<a href="${esc(u)}" target="_blank" rel="noopener">${AT}${r.label}</a>`:`<span class="off" title="Muy pronto">${AT}${r.label}</span>`}).join("");
}
function renderTabs(){
  const all=[{id:"todas",label:"Todas"},...RUBROS];
  $("tabs").innerHTML=all.map(r=>`<button class="tab" data-r="${r.id}" aria-pressed="${state.rubro===r.id}" style="--dc:var(--c-${r.id})">${r.id!=="todas"?icon(r.id):""}${r.label}</button>`).join("");
}
function card(n,lead){
  const rc=`var(--c-${n.rubro})`;
  const url=esc(safeUrl(n.url));
  const pub=n.publicada&&n.publicada!==n.fecha?`<span>· publicada el ${parseDay(n.publicada).getDate()}/${parseDay(n.publicada).getMonth()+1}</span>`:"";
  const src=`<div class="src"><span>Fuente:</span><a href="${url}" target="_blank" rel="noopener">${esc(n.fuente)} ↗</a>${pub}</div>`;
  if(lead) return `<article class="lead" style="--rc:${rc}">
      <span style="color:${rc};font-family:var(--f-mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase">${esc(RLABEL[n.rubro]||n.rubro)} · Principal</span>
      <h2><a href="${url}" target="_blank" rel="noopener">${esc(n.titulo)}</a></h2>
      <p>${esc(n.resena)}</p>${src}</article>`;
  return `<article class="nota" style="--rc:${rc}">
      ${state.rubro==="todas"?"":`<span class="tag">${esc(RLABEL[n.rubro]||n.rubro)}</span>`}
      <h4><a href="${url}" target="_blank" rel="noopener">${esc(n.titulo)}</a></h4>
      <p>${esc(n.resena)}</p>${src}</article>`;
}
function sectionHtml(id,items){
  const baj=BAJADA[id]?`<p class="bajada">${BAJADA[id]}</p>`:"";
  return `<section class="rubro${id==="falopas"?" falopa":""}" style="--rc:var(--c-${id})"><h3>${icon(id)}${RLABEL[id]||id}</h3>${baj}<div class="grid">${items.map(n=>card(n)).join("")}</div></section>`;
}

/* ---- Hoja Abierta: notas de la editora (data/editora/index.json + data/editora/<slug>.json) ---- */
function inlineMd(t){
  t=esc(t);
  t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,a,u)=>{const h=safeUrl(u.replace(/&amp;/g,"&"));return h==="#"?a:`<a href="${esc(h)}" target="_blank" rel="noopener">${a}</a>`});
  t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>");
  return t;
}
function mdToHtml(md){
  const out=[];let list=null;
  const close=()=>{if(list){out.push(`</${list}>`);list=null}};
  for(const raw of String(md||"").split(/\n/)){
    const l=raw.trim();
    if(!l){close();continue}
    let m;
    if((m=l.match(/^#{2,3}\s+(.*)/))){close();out.push(`<h3>${inlineMd(m[1])}</h3>`)}
    else if((m=l.match(/^[-*]\s+(.*)/))){if(list!=="ul"){close();out.push("<ul>");list="ul"}out.push(`<li>${inlineMd(m[1])}</li>`)}
    else if((m=l.match(/^\d+\.\s+(.*)/))){if(list!=="ol"){close();out.push("<ol>");list="ol"}out.push(`<li>${inlineMd(m[1])}</li>`)}
    else{close();out.push(`<p>${inlineMd(l)}</p>`)}
  }
  close();return out.join("");
}
function shortDate(s){const d=parseDay(s);return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`}
async function loadHA(){
  if(state.ha) return state.ha;
  try{const r=await fetch("data/editora/index.json",{cache:"no-cache"});state.ha=r.ok?(await r.json()).notas||[]:[]}catch(e){state.ha=[]}
  state.ha.sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return state.ha;
}
function teaserHtml(){
  const n=state.ha?.[0];if(!n) return "";
  return `<button class="teaser" data-nota="${esc(n.slug)}"><span class="k">Hoja Abierta · nota de la editora</span><b>${esc(n.titulo)}</b><span class="go">Leer →</span></button>`;
}
async function renderHA(){
  const list=await loadHA();
  $("stampDate").textContent="Hoja Abierta";$("stampCount").textContent="Notas de la editora";
  let html=`<div class="ha"><div class="ha-head"><div><h3>Hoja Abierta</h3><p>Notas de la editora: preguntas incómodas sobre el país, para pensarlas juntos.</p></div><button class="btn ghost" id="backDay">Volver a la edición</button></div>`;
  if(!list.length) html+=`<p class="empty">Muy pronto, la primera nota.</p>`;
  html+=list.map(n=>`<button class="ha-item" data-nota="${esc(n.slug)}"><span class="f">${esc(shortDate(n.fecha))}${n.tema?" · "+esc(n.tema):""}</span><b>${esc(n.titulo)}</b>${n.bajada?`<p>${esc(n.bajada)}</p>`:""}</button>`).join("");
  $("main").innerHTML=html+`</div>`;
}
async function renderNota(){
  const slug=state.nota;
  let n=state.haCache[slug];
  if(!n){try{const r=await fetch(`data/editora/${encodeURIComponent(slug)}.json`,{cache:"no-cache"});if(!r.ok)throw 0;n=state.haCache[slug]=await r.json()}catch(e){$("main").innerHTML=`<p class="status">No se encontró esa nota.</p>`;return}}
  if(state.view!=="nota"||state.nota!==slug) return;
  $("stampDate").textContent="Hoja Abierta";$("stampCount").textContent=shortDate(n.fecha);
  document.title=`${n.titulo} · La Hoja de Ayer`;
  $("main").innerHTML=`<article class="editorial"><div class="kicker">Hoja Abierta · nota de la editora${n.tema?" · "+esc(n.tema):""}</div><h2 class="t">${esc(n.titulo)}</h2>${n.bajada?`<p class="baj">${esc(n.bajada)}</p>`:""}<div class="firma">${esc(n.firma||"La editora")} · ${esc(shortDate(n.fecha))}</div><div class="body">${mdToHtml(n.cuerpo)}</div><div class="back"><button class="btn ghost" id="openHA2">Más notas de Hoja Abierta</button> <button class="btn ghost" id="backDay">Volver a la edición</button></div></article>`;
  scrollTo(0,0);
}

async function loadDay(d){
  if(!state.cache[d]){
    const r=await fetch(`data/ediciones/${d}.json`,{cache:"no-cache"});
    if(!r.ok) throw new Error("edicion");
    state.cache[d]=await r.json();
  }
  return state.cache[d];
}
async function renderDay(){
  const ds=days();
  if(!state.day||!ds.includes(state.day)) state.day=ds[ds.length-1]||null;
  $("dayPick").value=state.day||"";
  const i=ds.indexOf(state.day);
  $("prevDay").disabled=i<=0; $("nextDay").disabled=i<0||i>=ds.length-1;
  if(!state.day){$("main").innerHTML=`<div class="empty"><b>Todavía no hay ediciones.</b>Cada mañana se suma la edición con las noticias del día anterior.</div>`;return}
  const d=state.day;
  $("stampDate").textContent=cap(longDate(addDay(d)));
  const total=state.index.dias[d].total;
  $("stampCount").textContent=`Noticias del ${longDate(d)} · ${total} ${total===1?"nota":"notas"}`;
  let notes;
  try{notes=await loadDay(d)}catch(e){$("main").innerHTML=`<p class="status">No se pudo cargar esta edición. Probá recargar la página.</p>`;return}
  if(d!==state.day||state.view!=="dia") return;
  let list=state.rubro==="todas"?notes:notes.filter(n=>n.rubro===state.rubro);
  list=[...list].sort((a,b)=>(a.orden??99)-(b.orden??99));
  if(!list.length){$("main").innerHTML=`<div class="empty"><b>Sin notas de ${esc(RLABEL[state.rubro]||"")} este día.</b>Probá con otro rubro u otra fecha.</div>`;return}
  let html="";
  if(state.rubro==="todas"){
    const lead=list.find(n=>n.destacada);
    if(lead) html+=card(lead,true);
    for(const r of RUBROS){const items=list.filter(n=>n.rubro===r.id&&n!==lead);if(items.length) html+=sectionHtml(r.id,items)}
  } else html=sectionHtml(state.rubro,list);
  $("main").innerHTML=(state.rubro==="todas"?teaserHtml():"")+html;
}
function renderArchive(){
  const counts={};
  for(const [d,v] of Object.entries(state.index.dias)){const c=state.rubro==="todas"?v.total:(v.rubros?.[state.rubro]||0);if(c)counts[d]=c}
  const ds=Object.keys(counts).sort().reverse(), byYear={};
  for(const d of ds){const [y,m]=d.split("-");(byYear[y]??={});(byYear[y][m]??=[]).push(d)}
  let html=`<div class="archive"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h3>Archivo</h3><button class="btn ghost" id="backDay">Volver a la edición</button></div>`;
  if(!ds.length) html+=`<p class="empty">Todavía no hay ediciones archivadas.</p>`;
  for(const y of Object.keys(byYear).sort().reverse()){
    html+=`<div><h3 style="font-size:22px;margin-bottom:12px">${y}</h3><div style="display:grid;gap:16px">`;
    for(const m of Object.keys(byYear[y]).sort().reverse()){
      html+=`<div class="mes"><h4>${MESES[Number(m)-1]}</h4><div class="dias">${byYear[y][m].map(d=>`<button class="dia" data-day="${d}">${DIAS[parseDay(d).getDay()].slice(0,3)} ${String(parseDay(d).getDate()).padStart(2,"0")} <small>· ${counts[d]}</small></button>`).join("")}</div></div>`;
    }
    html+=`</div></div>`;
  }
  $("main").innerHTML=html+`</div>`;
}
function render(){
  renderTabs();
  if(!state.index) return;
  if(state.view!=="nota") document.title="La Hoja de Ayer";
  $("stampK").textContent=(state.view==="ha"||state.view==="nota")?"Sección":"Edición del";
  if(state.view==="archivo") renderArchive(); else if(state.view==="ha") renderHA(); else if(state.view==="nota") renderNota(); else renderDay();
  const h=state.view==="archivo"?"#archivo":state.view==="ha"?"#hoja-abierta":state.view==="nota"?"#hoja-abierta-"+state.nota:(state.day&&state.day!==days().at(-1)?"#"+state.day:"");
  if(location.hash!==h) history.replaceState(null,"",h||location.pathname);
}
function fromHash(){
  const h=location.hash.slice(1);
  if(h==="archivo") state.view="archivo";
  else if(h==="hoja-abierta") state.view="ha";
  else if(h.startsWith("hoja-abierta-")){state.view="nota";state.nota=h.slice(13)}
  else if(/^\d{4}-\d{2}-\d{2}$/.test(h)){state.day=h;state.view="dia"}
}

$("tabs").addEventListener("click",e=>{const b=e.target.closest(".tab");if(!b)return;state.rubro=b.dataset.r;render()});
$("prevDay").onclick=()=>{const ds=days(),i=ds.indexOf(state.day);if(i>0){state.day=ds[i-1];state.view="dia";render();scrollTo(0,0)}};
$("nextDay").onclick=()=>{const ds=days(),i=ds.indexOf(state.day);if(i<ds.length-1){state.day=ds[i+1];state.view="dia";render();scrollTo(0,0)}};
$("dayPick").onchange=e=>{const v=e.target.value;if(!v)return;if(!days().includes(v)){$("dayPick").value=state.day||"";$("stampCount").textContent="No hay edición para esa fecha.";return}state.day=v;state.view="dia";render()};
$("openArchive").onclick=()=>{state.view="archivo";render()};
$("openHA").onclick=()=>{state.view="ha";render();scrollTo(0,0)};
$("main").addEventListener("click",e=>{
  const d=e.target.closest(".dia");if(d){state.day=d.dataset.day;state.view="dia";render();scrollTo(0,0);return}
  const t=e.target.closest("[data-nota]");if(t){state.nota=t.dataset.nota;state.view="nota";render();return}
  if(e.target.id==="openHA2"){state.view="ha";render();scrollTo(0,0);return}
  if(e.target.id==="backDay"){state.view="dia";render()}
});
addEventListener("hashchange",()=>{fromHash();render()});

renderTabs();renderSocial();
(async()=>{
  try{
    const r=await fetch("data/index.json",{cache:"no-cache"});
    state.index=await r.json();
  }catch(e){$("main").innerHTML=`<p class="status">No se pudieron cargar las noticias. Probá recargar la página.</p>`;return}
  if(state.index.config?.eslogan) $("slogan").textContent=state.index.config.eslogan;
  renderSocial();await loadHA();fromHash();render();
})();
