(function(){
var RS_URL = "https://elevalife-ats.vercel.app/api/ats";
var RS_TESTERS = ["cristiano@elevalife.com.br","gisleiny@elevalife.com.br"];
var NIVEIS = {"Assistente / Auxiliar":20,"Analista":30,"Coordenador":45,"Especialista / Gerente":60};
var NIVEIS_DIRETORIA = ["Coordenador","Especialista / Gerente"];
var MOTIVOS = ["Aumento de Quadro","Substituição Definitiva","Substituição Temporária","Cobertura de Férias/Afastamento"];
var ETAPAS_FALLBACK = ["Inscrito","Triagem","Entrevista RH","Entrevista Gestor","Aprovado","Carta Oferta","Contratado","Reprovado","Banco de Talentos"];
var vagas = [];

function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function usuario(){ try { return (account && (account.username || account.name)) || ""; } catch(e){ return ""; } }
function toast(m, err){ if (typeof showToast === "function") showToast(m, !!err); else alert(m); }

async function api(method, params, body){
  var url = RS_URL;
  if (params){ var q = []; Object.keys(params).forEach(function(k){ q.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k])); }); url += "?" + q.join("&"); }
  var opt = { method: method, headers: { "x-painel-secret": RECRUTAHUB_API_SECRET } };
  if (method === "POST"){ opt.headers["Content-Type"] = "application/json"; body = body || {}; body.usuario = usuario(); opt.body = JSON.stringify(body); }
  var r = await fetch(url, opt);
  var j = await r.json().catch(function(){ return {}; });
  if (!r.ok) throw new Error(j.error || j.erro || ("HTTP " + r.status));
  return j.data;
}

function addDU(d, n){ var x = new Date(d.getTime()); var c = 0; while (c < n){ x.setDate(x.getDate()+1); var w = x.getDay(); if (w !== 0 && w !== 6) c++; } return x; }
function duEntre(a, b){ var s = a < b ? 1 : -1; var x = new Date(Math.min(a,b)); var y = new Date(Math.max(a,b)); var c = 0; x.setHours(0,0,0,0); y.setHours(0,0,0,0); while (x < y){ x.setDate(x.getDate()+1); var w = x.getDay(); if (w !== 0 && w !== 6) c++; } return s*c; }
function sla(v){
  if (!v.sla_inicio || !v.sla_dias || v.status === "Preenchida" || v.status === "Recusada" || v.status === "Cancelada") return null;
  var ini = new Date(v.sla_inicio + "T00:00:00"); var fim = addDU(ini, Number(v.sla_dias));
  var rest = duEntre(new Date(), fim);
  return { fim: fim, rest: rest, cls: rest < 0 ? "rs-red" : (rest <= 5 ? "rs-amber" : "rs-green"), txt: rest < 0 ? ("Vencido há " + (-rest) + " d.u.") : (rest === 0 ? "Vence hoje" : ("Faltam " + rest + " d.u.")) };
}
function fmtData(d){ return d.toLocaleDateString("pt-BR"); }

function css(){
  var s = document.createElement("style");
  s.textContent = ".rs-tbl{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden;font-size:13px}.rs-tbl th{background:var(--grena-bg);color:var(--grena);text-align:left;padding:9px 10px;font-weight:700}.rs-tbl td{padding:9px 10px;border-top:1px solid var(--border)}.rs-pill{display:inline-block;padding:2px 9px;border-radius:99px;font-size:12px;font-weight:600}.rs-green{background:var(--green-bg);color:var(--green-tx)}.rs-amber{background:var(--amber-bg);color:var(--amber-tx)}.rs-red{background:var(--red-bg);color:var(--red-tx)}.rs-blue{background:var(--blue-bg);color:var(--blue-tx)}.rs-gray{background:#eceef1;color:#555}.rs-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:14px 0 18px}.rs-kpi{background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px}.rs-kpi b{display:block;font-size:26px;color:var(--grena)}.rs-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:30px 12px}.rs-box{background:#fff;border-radius:12px;max-width:1100px;width:100%;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.3)}.rs-box h3{margin:0 0 12px;color:var(--grena)}.rs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 14px}.rs-grid label{font-size:12px;font-weight:600;display:block}.rs-grid input,.rs-grid select,.rs-grid textarea,.rs-in{width:100%;box-sizing:border-box;padding:8px;border:1px solid var(--border);border-radius:7px;font-size:13px;font-family:inherit}.rs-full{grid-column:1/-1}.rs-act{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}.rs-btn{background:var(--grena);color:#fff;border:none;padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px}.rs-btn.o{background:#fff;color:var(--grena);border:1px solid var(--grena)}.rs-btn.r{background:#b02a2a}.rs-kb{display:flex;gap:10px;overflow-x:auto;padding-bottom:8px}.rs-col{min-width:170px;flex:1;background:#f4f5f7;border-radius:9px;padding:8px}.rs-col h5{margin:0 0 8px;font-size:12px;color:var(--grena)}.rs-card{background:#fff;border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:8px;font-size:12px}.rs-card select{width:100%;margin-top:6px;font-size:11px}.rs-sec{margin:16px 0 6px;font-weight:700;color:var(--grena)}.rs-apr{display:flex;gap:10px;align-items:center;padding:8px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;font-size:13px}@media(max-width:800px){.rs-kpis{grid-template-columns:repeat(2,1fr)}.rs-grid{grid-template-columns:1fr}}";
  document.head.appendChild(s);
}

function montar(){
  if (document.getElementById("rsTab") && document.getElementById("panel-rs")) return;
  ["rsTab","rsLabel","panel-rs"].forEach(function(i){ var e = document.getElementById(i); if (e) e.remove(); });
  var tabs = document.querySelector(".sidebar nav.tabs");
  var ancora = tabs && tabs.querySelector('a.tab[href*="elevalife-ats"]');
  if (!tabs || !ancora) return;
  var lab = document.createElement("p"); lab.className = "tab-group-label"; lab.id = "rsLabel"; lab.textContent = "Recrutamento e Seleção"; lab.style.display = "none";
  var tab = document.createElement("div"); tab.className = "tab tab-sub"; tab.id = "rsTab"; tab.setAttribute("data-tab","rs"); tab.style.display = "none";
  tab.innerHTML = '<span class="tab-icon">&#128203;</span>Vagas (piloto)';
  tabs.insertBefore(lab, ancora); tabs.insertBefore(tab, ancora);
  var painel = document.createElement("div"); painel.className = "panel"; painel.id = "panel-rs";
  painel.innerHTML = '<div class="kanban-header"><h2 class="kanban-client-name">Recrutamento e Seleção <span class="rs-pill rs-amber" style="font-size:11px">PILOTO</span></h2><span class="badge-note">Ambiente de homologação - dados separados da produção</span><button type="button" class="btn-new" id="rsNovaBtn" style="margin-left:auto">+ Nova vaga</button></div><div class="rs-kpis" id="rsKpis"></div><div id="rsLista"></div>';
  var ref = document.getElementById("panel-ajuda");
  ref.parentNode.insertBefore(painel, ref);
  tab.addEventListener("click", function(){ document.querySelectorAll(".tab").forEach(function(x){ x.classList.remove("active"); }); document.querySelectorAll(".panel").forEach(function(x){ x.classList.remove("active"); }); tab.classList.add("active"); painel.classList.add("active"); var cb = document.getElementById("clientbarWrap"); if (cb) cb.style.display = "none"; carregar(); });
  document.getElementById("rsNovaBtn").addEventListener("click", formVaga);
  lab.style.display = ""; tab.style.display = "";
}

async function carregar(){
  var el = document.getElementById("rsLista"); el.innerHTML = "<p>Carregando...</p>";
  try { vagas = await api("GET", { r: "vagas" }); render(); }
  catch(e){ el.innerHTML = '<p style="color:#b02a2a">Erro ao carregar: ' + esc(e.message) + '</p>'; }
}

function render(){
  var abertas = 0, aguard = 0, venc = 0, pos = 0;
  vagas.forEach(function(v){ if (v.status === "Aberta") abertas++; if (v.status === "Aguardando aprovação") aguard++; var s = sla(v); if (s && s.rest < 0) venc++; if (v.status !== "Recusada") pos += (v.posicoes.total - v.posicoes.preenchidas); });
  document.getElementById("rsKpis").innerHTML = [["Vagas abertas",abertas],["Aguardando aprovação",aguard],["SLA vencido",venc],["Posições em seleção",pos]].map(function(k){ return '<div class="rs-kpi"><b>' + k[1] + '</b>' + k[0] + '</div>'; }).join("");
  var el = document.getElementById("rsLista");
  if (!vagas.length){ el.innerHTML = '<p>Nenhuma vaga cadastrada ainda. Clique em "+ Nova vaga".</p>'; return; }
  var h = '<table class="rs-tbl"><thead><tr><th>Código</th><th>Cargo</th><th>Área</th><th>Motivo</th><th>Posições</th><th>Aprovação</th><th>Status</th><th>SLA</th><th></th></tr></thead><tbody>';
  vagas.forEach(function(v){
    var s = sla(v);
    var ac = v.aprovacao_status === "Aprovada" ? "rs-green" : (v.aprovacao_status === "Recusada" ? "rs-red" : "rs-amber");
    h += '<tr><td>' + esc(v.codigo) + '</td><td><b>' + esc(v.cargo) + '</b>' + (v.sigilosa ? ' <span class="rs-pill rs-red">sigilosa</span>' : '') + '</td><td>' + esc(v.area) + '</td><td>' + esc(v.motivo) + '</td><td>' + v.posicoes.preenchidas + '/' + v.posicoes.total + '</td><td><span class="rs-pill ' + ac + '">' + esc(v.aprovacao_status) + '</span></td><td>' + esc(v.status) + '</td><td>' + (s ? '<span class="rs-pill ' + s.cls + '" title="Prazo: ' + fmtData(s.fim) + '">' + s.txt + '</span>' : '-') + '</td><td><button class="rs-btn o" data-id="' + esc(v.id) + '">Abrir</button></td></tr>';
  });
  el.innerHTML = h + '</tbody></table>';
  el.querySelectorAll("button[data-id]").forEach(function(b){ b.addEventListener("click", function(){ detalhe(b.getAttribute("data-id")); }); });
}

function overlay(html){
  var ov = document.createElement("div"); ov.className = "rs-ov";
  ov.innerHTML = '<div class="rs-box">' + html + '</div>';
  ov.addEventListener("mousedown", function(e){ if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov); return ov;
}

function formVaga(){
  var nv = Object.keys(NIVEIS).map(function(n){ return '<option>' + esc(n) + '</option>'; }).join("");
  var mt = MOTIVOS.map(function(n){ return '<option>' + esc(n) + '</option>'; }).join("");
  var ov = overlay('<h3>Nova vaga (homologação)</h3><div class="rs-grid">' +
    '<div><label>Cargo *</label><input id="f_cargo"></div><div><label>Área</label><input id="f_area"></div>' +
    '<div><label>Nível do cargo (define SLA e aprovação)</label><select id="f_nivel">' + nv + '</select></div><div><label>SLA (dias úteis)</label><input id="f_sla" type="number" min="1"></div>' +
    '<div><label>Motivo *</label><select id="f_motivo">' + mt + '</select></div><div><label>Detalhe do motivo (quem substitui / período)</label><input id="f_sub"></div>' +
    '<div><label>Gestor solicitante</label><input id="f_gestor"></div><div><label>E-mail do gestor</label><input id="f_gemail"></div>' +
    '<div><label>Cliente</label><input id="f_cliente"></div><div><label>Local de trabalho</label><input id="f_local"></div>' +
    '<div><label>Salário (R$)</label><input id="f_sal" type="number" min="0" step="0.01"></div><div><label>Nº de posições</label><input id="f_pos" type="number" min="1" max="50" value="1"></div>' +
    '<div><label>Modelo de trabalho</label><select id="f_modelo"><option>Presencial</option><option>Híbrido</option><option>Remoto</option></select></div><div><label>Jornada / escala</label><input id="f_jornada"></div>' +
    '<div class="rs-full"><label>Benefícios</label><textarea id="f_ben" rows="2"></textarea></div>' +
    '<div><label>Equipamentos</label><input id="f_equip"></div><div><label>EPIs / uniforme</label><input id="f_epis"></div>' +
    '<div><label><input type="checkbox" id="f_dir" style="width:auto"> Exige aprovação da Diretoria</label></div><div><label><input type="checkbox" id="f_sig" style="width:auto"> Vaga sigilosa</label></div>' +
    '</div><div class="rs-act"><button class="rs-btn o" id="f_cancel">Cancelar</button><button class="rs-btn" id="f_ok">Criar vaga</button></div>');
  var q = function(i){ return ov.querySelector("#" + i); };
  function nivel(){ q("f_sla").value = NIVEIS[q("f_nivel").value]; q("f_dir").checked = NIVEIS_DIRETORIA.indexOf(q("f_nivel").value) >= 0; }
  q("f_nivel").addEventListener("change", nivel); nivel();
  q("f_cancel").addEventListener("click", function(){ ov.remove(); });
  q("f_ok").addEventListener("click", async function(){
    if (!q("f_cargo").value.trim()) { toast("Informe o cargo.", true); return; }
    var d = { cargo: q("f_cargo").value.trim(), area: q("f_area").value, motivo: q("f_motivo").value, subtipo_motivo: q("f_sub").value, gestor_nome: q("f_gestor").value, gestor_email: q("f_gemail").value, cliente: q("f_cliente").value, local_trabalho: q("f_local").value, salario: q("f_sal").value ? Number(q("f_sal").value) : null, modelo_trabalho: q("f_modelo").value, jornada: q("f_jornada").value, beneficios: q("f_ben").value, equipamentos: q("f_equip").value, epis: q("f_epis").value, sla_dias: Number(q("f_sla").value) || null, exige_diretoria: q("f_dir").checked, sigilosa: q("f_sig").checked, origem: "painel-hml", num_posicoes: Number(q("f_pos").value) || 1 };
    q("f_ok").disabled = true;
    try { await api("POST", null, { acao: "criar_vaga", dados: d }); ov.remove(); toast("Vaga criada. Aguardando aprovação."); carregar(); }
    catch(e){ toast("Erro: " + e.message, true); q("f_ok").disabled = false; }
  });
}

async function detalhe(id, antigo){
  var data;
  try { data = await api("GET", { r: "vaga", id: id }); } catch(e){ toast("Erro: " + e.message, true); return; }
  if (antigo) antigo.remove();
  var v = data.vaga, etapas = data.etapas || ETAPAS_FALLBACK, s = sla(v);
  var ordem = ["gestor","coordenador","diretoria"], rot = { gestor: "Gestor", coordenador: "Coordenador (confirma necessidade)", diretoria: "Diretoria" };
  var aprs = data.aprovacoes.slice().sort(function(a,b){ return ordem.indexOf(a.etapa) - ordem.indexOf(b.etapa); });
  var ant = true, aprH = "";
  aprs.forEach(function(a){
    var cls = a.decisao === "Aprovada" ? "rs-green" : (a.decisao === "Recusada" ? "rs-red" : "rs-amber");
    var pode = a.decisao === "Pendente" && ant && v.status === "Aguardando aprovação";
    aprH += '<div class="rs-apr"><b style="min-width:230px">' + rot[a.etapa] + '</b><span class="rs-pill ' + cls + '">' + a.decisao + '</span><span style="flex:1">' + (a.aprovador ? esc(a.aprovador) : '') + (a.comentario ? ' - ' + esc(a.comentario) : '') + '</span>' + (pode ? '<button class="rs-btn" data-d="Aprovada" data-a="' + a.id + '">Aprovar</button><button class="rs-btn r" data-d="Recusada" data-a="' + a.id + '">Recusar</button>' : '') + '</div>';
    if (a.decisao !== "Aprovada") ant = false;
  });
  var posH = data.posicoes.map(function(p){ return '<span class="rs-pill ' + (p.status === "Preenchida" ? "rs-green" : "rs-blue") + '" style="margin-right:6px">Posição ' + p.numero + ': ' + esc(p.status) + '</span>'; }).join("");
  var kb = etapas.map(function(e){
    var cards = data.pipeline.filter(function(c){ return c.etapa === e; }).map(function(c){
      var op = etapas.map(function(x){ return '<option' + (x === c.etapa ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join("");
      return '<div class="rs-card"><b>' + esc(c.nome) + '</b>' + (c.numero ? ' <span style="color:#777">#' + esc(c.numero) + '</span>' : '') + '<select data-c="' + esc(c.candidato_id) + '">' + op + '</select></div>';
    }).join("");
    return '<div class="rs-col"><h5>' + esc(e) + ' (' + data.pipeline.filter(function(c){ return c.etapa === e; }).length + ')</h5>' + cards + '</div>';
  }).join("");
  var campos = [["Área",v.area],["Motivo",v.motivo + (v.subtipo_motivo ? " - " + v.subtipo_motivo : "")],["Gestor",v.gestor_nome],["Cliente",v.cliente],["Local",v.local_trabalho],["Salário",v.salario != null ? "R$ " + Number(v.salario).toLocaleString("pt-BR",{minimumFractionDigits:2}) : ""],["Modelo",v.modelo_trabalho],["Jornada",v.jornada],["Benefícios",v.beneficios],["Equipamentos",v.equipamentos],["EPIs",v.epis]];
  var cH = campos.filter(function(c){ return c[1]; }).map(function(c){ return '<div><label style="font-size:12px;color:#777">' + c[0] + '</label><div>' + esc(c[1]) + '</div></div>'; }).join("");
  var ov = overlay('<h3>' + esc(v.codigo) + ' - ' + esc(v.cargo) + ' <span class="rs-pill rs-blue">' + esc(v.status) + '</span> ' + (s ? '<span class="rs-pill ' + s.cls + '">SLA: ' + s.txt + ' (prazo ' + fmtData(s.fim) + ')</span>' : '') + '</h3><div class="rs-grid" style="grid-template-columns:repeat(3,1fr)">' + cH + '</div>' +
    '<div class="rs-sec">Aprovação</div>' + aprH + '<div class="rs-sec">Posições</div>' + posH +
    '<div class="rs-sec">Candidatos (pipeline)</div>' + (v.status === "Aguardando aprovação" || v.status === "Recusada" ? '<p style="font-size:13px;color:#777">Candidatos só podem ser vinculados após a aprovação da vaga.</p>' : '<div style="display:flex;gap:8px;margin-bottom:8px"><input class="rs-in" id="rs_busca" placeholder="Buscar candidato do banco por nome (mín. 2 letras)"><button class="rs-btn" id="rs_bbtn">Buscar</button></div><div id="rs_res" style="margin-bottom:8px"></div>') +
    '<div class="rs-kb">' + kb + '</div><div class="rs-act"><button class="rs-btn o" id="rs_fecha">Fechar</button></div>');
  ov.querySelector("#rs_fecha").addEventListener("click", function(){ ov.remove(); carregar(); });
  ov.querySelectorAll("button[data-a]").forEach(function(b){ b.addEventListener("click", async function(){
    var c = prompt(b.getAttribute("data-d") === "Recusada" ? "Motivo da recusa:" : "Comentário (opcional):") || "";
    try { await api("POST", null, { acao: "decidir", aprovacao_id: b.getAttribute("data-a"), decisao: b.getAttribute("data-d"), comentario: c }); toast("Decisão registrada."); detalhe(id, ov); }
    catch(e){ toast("Erro: " + e.message, true); }
  }); });
  ov.querySelectorAll("select[data-c]").forEach(function(sel){ sel.addEventListener("change", async function(){
    try { await api("POST", null, { acao: "mover_candidato", vaga_id: id, candidato_id: sel.getAttribute("data-c"), para_etapa: sel.value }); detalhe(id, ov); }
    catch(e){ toast("Erro: " + e.message, true); }
  }); });
  var bb = ov.querySelector("#rs_bbtn");
  if (bb) bb.addEventListener("click", async function(){
    var r = ov.querySelector("#rs_res"); r.innerHTML = "Buscando...";
    try {
      var lst = await api("GET", { r: "buscar-candidatos", q: ov.querySelector("#rs_busca").value });
      r.innerHTML = lst.length ? lst.map(function(c){ return '<div class="rs-apr"><span style="flex:1">' + esc(c.name) + ' <span style="color:#777">#' + esc(c.candidate_number) + '</span></span><button class="rs-btn" data-v="' + esc(c.id) + '">Vincular</button></div>'; }).join("") : "Nenhum resultado.";
      r.querySelectorAll("button[data-v]").forEach(function(b){ b.addEventListener("click", async function(){
        try { await api("POST", null, { acao: "vincular_candidato", vaga_id: id, candidato_id: b.getAttribute("data-v") }); detalhe(id, ov); }
        catch(e){ toast("Erro: " + e.message, true); }
      }); });
    } catch(e){ r.innerHTML = '<span style="color:#b02a2a">' + esc(e.message) + '</span>'; }
  });
}

css();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar); else montar();
setInterval(montar, 1500);
console.log("rs_module carregado v3");
window.rsDebug = { carregar: carregar, api: api };
})();
