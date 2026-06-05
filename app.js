const TYPES = ["Beer", "Wine", "Cocktail", "Tequila", "Vodka", "Whiskey"];
const $ = id => document.getElementById(id);
let state = JSON.parse(localStorage.getItem("drinkrState") || "null") || {
  mode: "simple", total: 0, drinks: {}, startedAt: new Date().toISOString(), history: []
};
function save(){ localStorage.setItem("drinkrState", JSON.stringify(state)); $("sessionState").textContent = "Saved"; setTimeout(()=>$("sessionState").textContent="Auto-saving", 900); }
function total(){ state.total = Object.values(state.drinks).reduce((a,b)=>a+b,0); }
function render(){
  total();
  $("total").textContent = state.total;
  $("simpleBtn").classList.toggle("active", state.mode === "simple");
  $("thirstyBtn").classList.toggle("active", state.mode === "thirsty");
  $("thirstyPanel").classList.toggle("hidden", state.mode !== "thirsty");
  $("startedAt").textContent = new Date(state.startedAt).toLocaleString([], {weekday:"short", hour:"2-digit", minute:"2-digit"});
  $("drinkGrid").innerHTML = TYPES.map(t=>`<button class="drink" data-drink="${t}"><span>${t}</span><span>${state.drinks[t]||0}</span></button>`).join("");
  document.querySelectorAll("[data-drink]").forEach(b => b.onclick = () => addDrink(b.dataset.drink));
  $("history").innerHTML = state.history.length ? state.history.slice(0,8).map(h => `<div class="history-item"><strong>${h.total} drinks</strong><br>${new Date(h.endedAt).toLocaleString()} · ${h.mode}${Object.keys(h.drinks).length ? `<br>${Object.entries(h.drinks).map(([k,v])=>`${k}: ${v}`).join(" · ")}` : ""}</div>`).join("") : `<p class="tiny">Finished sessions will appear here.</p>`;
  save();
}
function addDrink(type="Drink"){ state.drinks[type] = (state.drinks[type] || 0) + 1; render(); }
function undo(){ const entries = Object.entries(state.drinks).filter(([,v])=>v>0); if(!entries.length) return; const [k,v] = entries[entries.length-1]; v<=1 ? delete state.drinks[k] : state.drinks[k]--; render(); }
function resetSession(){ if(confirm("Reset the current session?")){ state.drinks={}; state.total=0; state.startedAt=new Date().toISOString(); render(); } }
function finish(){ total(); if(state.total===0){ alert("Add at least one drink before finishing."); return; } state.history.unshift({ total:state.total, drinks:{...state.drinks}, mode:state.mode, startedAt:state.startedAt, endedAt:new Date().toISOString() }); state.drinks={}; state.total=0; state.startedAt=new Date().toISOString(); render(); alert("Session saved."); }
$("simpleBtn").onclick = () => { state.mode="simple"; render(); };
$("thirstyBtn").onclick = () => { state.mode="thirsty"; render(); };
$("addSimple").onclick = () => addDrink(state.mode === "simple" ? "Drink" : "Drink");
$("undoBtn").onclick = undo;
$("resetBtn").onclick = resetSession;
$("finishBtn").onclick = finish;
$("addCustom").onclick = () => { const v=$("customDrink").value.trim(); if(v){ addDrink(v); $("customDrink").value=""; } };
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
