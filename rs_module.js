(function(){
var RS_URL = "https://elevalife-ats.vercel.app/api/ats";
var PUB_URL = "https://elevalife-ats.vercel.app/vagas.html";
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
  document.getElementById("rsNovaBtn").addEventListener("click", function(){ formVaga(); });
  lab.style.display = ""; tab.style.display = "";
}

var reqs = [];
var reqErro = "";
async function carregarRequisicoes(){
  reqs = []; reqErro = "";
  try {
    if (typeof graphFetch !== "function" || typeof COBERTURAS_GRAPH_BASE === "undefined") { reqErro = "Login Microsoft necessario para listar as requisicoes."; return; }
    var d = await graphFetch(COBERTURAS_GRAPH_BASE + "/items?expand=fields&$top=999");
    reqs = (d.value || []).map(function(it){ var f = it.fields || {}; f.__id = String(it.id); f.__created = it.createdDateTime || null; return f; });
  } catch(e){ reqErro = "Nao foi possivel ler as requisicoes: " + e.message; }
}
function reqPendentes(){
  var usados = {}; vagas.forEach(function(v){ if (v.origem_id) usados[String(v.origem_id)] = true; });
  return reqs.filter(function(f){
    var st = String(f.Status || "").toLowerCase();
    return (f.Cargo || "") && st.indexOf("cancel") < 0 && st.indexOf("conclu") < 0 && !usados[f.__id];
  }).sort(function(a, b){ return new Date(b.__created || 0) - new Date(a.__created || 0); });
}
async function carregar(){
  var el = document.getElementById("rsLista"); el.innerHTML = "<p>Carregando...</p>";
  try { vagas = await api("GET", { r: "vagas" }); await carregarRequisicoes(); render(); }
  catch(e){ el.innerHTML = '<p style="color:#b02a2a">Erro ao carregar: ' + esc(e.message) + '</p>'; }
}

function render(){
  var abertas = 0, aguard = 0, venc = 0, pos = 0;
  vagas.forEach(function(v){ if (v.status === "Aberta") abertas++; if (v.status === "Aguardando aprovação") aguard++; var s = sla(v); if (s && s.rest < 0) venc++; if (v.status !== "Recusada") pos += (v.posicoes.total - v.posicoes.preenchidas); });
  document.getElementById("rsKpis").innerHTML = [["Vagas abertas",abertas],["Aguardando aprovação",aguard],["SLA vencido",venc],["Posições em seleção",pos]].map(function(k){ return '<div class="rs-kpi"><b>' + k[1] + '</b>' + k[0] + '</div>'; }).join("");
  var el = document.getElementById("rsLista");
  var pend = reqPendentes();
  var h = '<div class="rs-sec" style="margin-top:0">Requisições de pessoal dos coordenadores aguardando abertura de vaga (' + pend.length + ')</div>';
  if (reqErro) h += '<p style="font-size:13px;color:#b02a2a">' + esc(reqErro) + '</p>';
  else if (!pend.length) h += '<p style="font-size:13px;color:#777">Nenhuma requisição pendente. As requisições feitas em Solicitações aparecem aqui.</p>';
  else {
    h += '<table class="rs-tbl" style="margin-bottom:18px"><thead><tr><th>Data</th><th>Cliente</th><th>Cargo</th><th>Motivo</th><th>Solicitante</th><th>Salário</th><th></th></tr></thead><tbody>';
    pend.forEach(function(f){
      var dt = f.__created ? new Date(f.__created).toLocaleDateString("pt-BR") : "";
      var sal = (f.ValorRemuneracao !== undefined && f.ValorRemuneracao !== null && f.ValorRemuneracao !== "") ? "R$ " + Number(f.ValorRemuneracao).toLocaleString("pt-BR", {minimumFractionDigits: 2}) : "-";
      h += '<tr><td>' + dt + '</td><td>' + esc(f.Cliente) + '</td><td><b>' + esc(f.Cargo) + '</b></td><td>' + esc(f.Motivo) + '</td><td>' + esc(f.Solicitante) + '</td><td>' + sal + '</td><td><button class="rs-btn" data-req="' + esc(f.__id) + '">Abrir vaga</button></td></tr>';
    });
    h += '</tbody></table>';
  }
  h += '<div class="rs-sec">Vagas</div>';
  if (!vagas.length) h += '<p>Nenhuma vaga cadastrada ainda. Abra uma a partir de uma requisição acima ou clique em "+ Nova vaga".</p>';
  else {
    h += '<table class="rs-tbl"><thead><tr><th>Código</th><th>Cargo</th><th>Área</th><th>Motivo</th><th>Posições</th><th>Aprovação</th><th>Status</th><th>SLA</th><th></th></tr></thead><tbody>';
    vagas.forEach(function(v){
      var s = sla(v);
      var ac = v.aprovacao_status === "Aprovada" ? "rs-green" : (v.aprovacao_status === "Recusada" ? "rs-red" : "rs-amber");
      h += '<tr><td>' + esc(v.codigo) + '</td><td><b>' + esc(v.cargo) + '</b>' + (v.sigilosa ? ' <span class="rs-pill rs-red">sigilosa</span>' : '') + (v.origem === "requisicao-pessoal" ? ' <span class="rs-pill rs-gray">requisição</span>' : '') + '</td><td>' + esc(v.area) + '</td><td>' + esc(v.motivo) + '</td><td>' + v.posicoes.preenchidas + '/' + v.posicoes.total + '</td><td><span class="rs-pill ' + ac + '">' + esc(v.aprovacao_status) + '</span></td><td>' + esc(v.status) + '</td><td>' + (s ? '<span class="rs-pill ' + s.cls + '" title="Prazo: ' + fmtData(s.fim) + '">' + s.txt + '</span>' : '-') + '</td><td><button class="rs-btn o" data-id="' + esc(v.id) + '">Abrir</button></td></tr>';
    });
    h += '</tbody></table>';
  }
  el.innerHTML = h;
  el.querySelectorAll("button[data-id]").forEach(function(b){ b.addEventListener("click", function(){ detalhe(b.getAttribute("data-id")); }); });
  el.querySelectorAll("button[data-req]").forEach(function(b){ b.addEventListener("click", function(){
    var f = reqs.filter(function(x){ return x.__id === b.getAttribute("data-req"); })[0];
    if (f) formVaga(deRequisicao(f));
  }); });
}

function mapMotivo(m){
  var s = String(m || "").toLowerCase();
  if (s.indexOf("aument") >= 0) return "Aumento de Quadro";
  if (s.indexOf("ferias") >= 0 || s.indexOf("férias") >= 0 || s.indexOf("afast") >= 0 || s.indexOf("cobertura") >= 0) return "Cobertura de Férias/Afastamento";
  if (s.indexOf("tempor") >= 0) return "Substituição Temporária";
  return "Substituição Definitiva";
}
function nivelSlaPorCargo(c){
  var s = String(c || "").toLowerCase();
  if (/coordena|gerente|especialista|diretor/.test(s)) return /gerente|especialista|diretor/.test(s) ? "Especialista / Gerente" : "Coordenador";
  if (/assistente|auxiliar|estagi|recepcion/.test(s)) return "Assistente / Auxiliar";
  return "Analista";
}
function deRequisicao(f){
  var sig = f.PselSigiloso === true || String(f.PselSigiloso || f.Sigiloso || "").toLowerCase() === "sim";
  return { cargo: f.Cargo || "", area: f.Area || "", motivo: mapMotivo(f.Motivo), motivo_original: f.Motivo || "", colaborador_substituido: f.ColaboradorSubstituido || f.ProfissionalTitular || "", cliente: f.Cliente || "", carga_horaria: f.CargaHorariaSemanal || "", salario: (f.ValorRemuneracao !== undefined && f.ValorRemuneracao !== null && f.ValorRemuneracao !== "") ? f.ValorRemuneracao : "", tipo_valor: f.TipoValor || "", tipo_contrato: f.TipoContrato || "", beneficios: f.Beneficios || "", requisitos_obrig: f.RequisitosObrigatorios || "", requisitos_dif: f.RequisitosDiferenciais || "", jornada: f.EscalaTurno || "", solicitante: f.Solicitante || f.Coordenador || "", gestor_nome: f.Coordenador || f.Solicitante || "", gestor_email: f.EmailResponsavel || "", sigilosa: sig, origem: "requisicao-pessoal", origem_id: f.__id };
}

function overlay(html){
  var ov = document.createElement("div"); ov.className = "rs-ov";
  ov.innerHTML = '<div class="rs-box">' + html + '</div>';
  ov.addEventListener("mousedown", function(e){ if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov); return ov;
}

function tabelaRemun(){ return (typeof REMUNERACAO_TABLE !== "undefined" && REMUNERACAO_TABLE) ? REMUNERACAO_TABLE : []; }
function formVaga(pre){
  pre = pre || {};
  var nv = Object.keys(NIVEIS).map(function(n){ return '<option>' + esc(n) + '</option>'; }).join("");
  var mt = MOTIVOS.map(function(n){ return '<option' + (n === pre.motivo ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join("");
  var cargos = []; tabelaRemun().forEach(function(r){ if (cargos.indexOf(r.funcao) < 0) cargos.push(r.funcao); });
  var dl = cargos.map(function(c){ return '<option value="' + esc(c) + '">'; }).join("");
  var tc = ["CLT","Autonomo","PJ"]; var tcEl = document.getElementById("coberturaTipoContrato");
  if (tcEl){ var o = [].map.call(tcEl.options, function(x){ return x.value; }).filter(Boolean); if (o.length) tc = o; }
  if (pre.tipo_contrato && tc.indexOf(pre.tipo_contrato) < 0) tc.push(pre.tipo_contrato);
  var tco = '<option value="">Selecione...</option>' + tc.map(function(x){ return '<option' + (x === pre.tipo_contrato ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join("");
  var tvo = ["","Liquido","Bruto"].map(function(x){ return '<option value="' + x + '"' + (x === pre.tipo_valor ? ' selected' : '') + '>' + (x || "Selecione...") + '</option>'; }).join("");
  var aviso = pre.origem === "requisicao-pessoal" ? '<p style="font-size:13px;background:var(--amber-bg);color:var(--amber-tx);padding:8px 10px;border-radius:8px;margin:0 0 10px">Formulário preenchido a partir da requisição de pessoal' + (pre.solicitante ? ' de <b>' + esc(pre.solicitante) + '</b>' : '') + (pre.motivo_original ? ' (motivo informado: ' + esc(pre.motivo_original) + ')' : '') + '. Confira e ajuste se necessário.</p>' : '';
  var ov = overlay('<h3>' + (pre.origem === "requisicao-pessoal" ? 'Abrir vaga a partir da requisição' : 'Nova vaga') + ' (homologação)</h3>' + aviso + '<div class="rs-grid">' +
    '<div><label>Cargo *</label><input id="f_cargo" list="rsCargoList" value="' + esc(pre.cargo) + '"><datalist id="rsCargoList">' + dl + '</datalist></div><div><label>Área</label><input id="f_area" value="' + esc(pre.area) + '"></div>' +
    '<div><label>Perfil do profissional (nível na tabela)</label><select id="f_perfil"></select></div><div><label>Carga horária semanal (h)</label><input id="f_carga" type="number" min="1" max="60" value="' + esc(pre.carga_horaria) + '"></div>' +
    '<div><label>Salário / remuneração (R$)</label><input id="f_sal" type="number" min="0" step="0.01" value="' + esc(pre.salario) + '"><small id="f_leg" style="color:#777"></small></div><div><label>Líquido ou bruto</label><select id="f_tval">' + tvo + '</select></div>' +
    '<div><label>Tipo de contrato</label><select id="f_tcont">' + tco + '</select></div><div><label>Nº de posições</label><input id="f_pos" type="number" min="1" max="50" value="1"></div>' +
    '<div><label>Motivo *</label><select id="f_motivo">' + mt + '</select></div><div><label>Colaborador substituído / detalhe do motivo</label><input id="f_colab" value="' + esc(pre.colaborador_substituido) + '"></div>' +
    '<div><label>Solicitante / gestor</label><input id="f_gestor" value="' + esc(pre.gestor_nome) + '"></div><div><label>E-mail do responsável</label><input id="f_gemail" value="' + esc(pre.gestor_email) + '"></div>' +
    '<div><label>Cliente</label><input id="f_cliente" value="' + esc(pre.cliente) + '"></div><div><label>Local de trabalho</label><input id="f_local"></div>' +
    '<div><label>Escala / turno</label><input id="f_jornada" value="' + esc(pre.jornada) + '"></div><div><label>Modelo de trabalho</label><select id="f_modelo"><option>Presencial</option><option>Híbrido</option><option>Remoto</option></select></div>' +
    '<div class="rs-full"><label>Requisitos obrigatórios</label><textarea id="f_robrig" rows="2">' + esc(pre.requisitos_obrig) + '</textarea></div>' +
    '<div class="rs-full"><label>Requisitos diferenciais</label><textarea id="f_rdif" rows="2">' + esc(pre.requisitos_dif) + '</textarea></div>' +
    '<div class="rs-full"><label>Benefícios</label><textarea id="f_ben" rows="2">' + esc(pre.beneficios) + '</textarea></div>' +
    '<div><label>Equipamentos</label><input id="f_equip"></div><div><label>EPIs / uniforme</label><input id="f_epis"></div>' +
    '<div><label>Nível do cargo (define o SLA)</label><select id="f_nivel">' + nv + '</select></div><div><label>SLA (dias úteis)</label><input id="f_sla" type="number" min="1"></div>' +
    '<div><label><input type="checkbox" id="f_dir" style="width:auto"> Exige aprovação da Diretoria</label></div><div><label><input type="checkbox" id="f_sig" style="width:auto"' + (pre.sigilosa ? ' checked' : '') + '> Vaga sigilosa</label></div>' +
    '</div><div class="rs-act"><button class="rs-btn o" id="f_cancel">Cancelar</button><button class="rs-btn" id="f_ok">Criar vaga</button></div>');
  var q = function(i){ return ov.querySelector("#" + i); };
  function nivelSla(){ nivelSla0(); if (typeof checaTeto === "function") checaTeto(); }
  function nivelSla0(){ q("f_sla").value = NIVEIS[q("f_nivel").value]; q("f_dir").checked = NIVEIS_DIRETORIA.indexOf(q("f_nivel").value) >= 0; }
  q("f_nivel").value = nivelSlaPorCargo(pre.cargo); q("f_nivel").addEventListener("change", nivelSla); nivelSla();
  var salEditado = (pre.salario !== undefined && pre.salario !== null && pre.salario !== "");
  q("f_sal").addEventListener("input", function(){ salEditado = true; checaTeto(); });
  function perfis(){
    var c = q("f_cargo").value.trim(); var sel = q("f_perfil"); var atual = sel.value;
    var lst = tabelaRemun().filter(function(r){ return r.funcao === c; }).map(function(r){ return r.nivel; });
    sel.innerHTML = lst.length ? lst.map(function(n){ return '<option>' + esc(n) + '</option>'; }).join("") : '<option value="">(cargo fora da tabela)</option>';
    if (atual && lst.indexOf(atual) >= 0) sel.value = atual;
  }
  var tetoAtual = null;
  function checaTeto(){
    var el = q("f_teto");
    if (!el) { el = document.createElement("div"); el.id = "f_teto"; el.style.cssText = "color:#b45309;font-size:12px;font-weight:600;margin-top:4px"; q("f_leg").parentNode.appendChild(el); }
    var s = Number(String(q("f_sal").value).replace(",", "."));
    var acima = tetoAtual !== null && s > 0 && s > tetoAtual + 0.005;
    if (acima) {
      q("f_dir").checked = true; q("f_dir").disabled = true;
      el.textContent = "Salário acima do teto máximo do cargo (Step IV do maior nível, carga horária máxima: " + tetoAtual.toLocaleString("pt-BR", {style: "currency", currency: "BRL"}) + "): exige aprovação da Diretoria.";
    } else {
      q("f_dir").disabled = false; el.textContent = "";
      q("f_dir").checked = NIVEIS_DIRETORIA.indexOf(q("f_nivel").value) >= 0;
    }
  }
  function salAuto(){
    var c = q("f_cargo").value.trim(), n = q("f_perfil").value, leg = q("f_leg");
    if (typeof remuneracaoInicialPara !== "function") { leg.textContent = ""; tetoAtual = null; checaTeto(); return; }
    var cheio = remuneracaoInicialPara(c, n);
    if (cheio === null || cheio === undefined) { leg.textContent = ""; tetoAtual = null; checaTeto(); return; }
    var base = (typeof baseHorasParaCargo === "function") ? baseHorasParaCargo(c) : 44;
    var carga = Number(q("f_carga").value);
    var prop = (carga && carga > 0) ? cheio * (carga / base) : cheio;
    leg.textContent = "Tabela de remuneração: " + cheio.toLocaleString("pt-BR", {style: "currency", currency: "BRL"}) + " (carga cheia " + base + "h)" + (carga ? " - proporcional a " + carga + "h: " + prop.toLocaleString("pt-BR", {style: "currency", currency: "BRL"}) : "");
    var fator = (carga && carga > 0) ? carga / base : 1; var mx = null; REMUNERACAO_TABLE.forEach(function(r){ if (r.funcao === c) { var v = Math.max(r.stepI, r.stepII, r.stepIII, r.stepIV); if (mx === null || v > mx) mx = v; } }); tetoAtual = (mx === null) ? null : mx; if (!salEditado) q("f_sal").value = prop.toFixed(2); checaTeto();
  }
  q("f_cargo").addEventListener("input", function(){ perfis(); salAuto(); q("f_nivel").value = nivelSlaPorCargo(q("f_cargo").value); nivelSla(); });
  q("f_perfil").addEventListener("change", salAuto); q("f_carga").addEventListener("input", salAuto);
  perfis(); salAuto();
  q("f_cancel").addEventListener("click", function(){ ov.remove(); });
  q("f_ok").addEventListener("click", async function(){
    if (!q("f_cargo").value.trim()) { toast("Informe o cargo.", true); return; }
    var d = { cargo: q("f_cargo").value.trim(), area: q("f_area").value, motivo: q("f_motivo").value, subtipo_motivo: pre.motivo_original || null, colaborador_substituido: q("f_colab").value, gestor_nome: q("f_gestor").value, gestor_email: q("f_gemail").value, solicitante: pre.solicitante || q("f_gestor").value, cliente: q("f_cliente").value, local_trabalho: q("f_local").value, salario: q("f_sal").value ? Number(q("f_sal").value) : null, tipo_valor: q("f_tval").value || null, tipo_contrato: q("f_tcont").value || null, carga_horaria: q("f_carga").value ? Number(q("f_carga").value) : null, modelo_trabalho: q("f_modelo").value, jornada: q("f_jornada").value, requisitos_obrig: q("f_robrig").value, requisitos_dif: q("f_rdif").value, beneficios: q("f_ben").value, equipamentos: q("f_equip").value, epis: q("f_epis").value, sla_dias: Number(q("f_sla").value) || null, exige_diretoria: q("f_dir").checked, sigilosa: q("f_sig").checked, origem: pre.origem || "painel-hml", origem_id: pre.origem_id || null, num_posicoes: Number(q("f_pos").value) || 1 };
    q("f_ok").disabled = true;
    try { await api("POST", null, { acao: "criar_vaga", dados: d }); ov.remove(); toast("Vaga criada. Aguardando aprovação."); carregar(); }
    catch(e){ toast("Erro: " + e.message, true); q("f_ok").disabled = false; }
  });
}

async function detalhe(id, antigo){
  var data;
  try { data = await api("GET", { r: "vaga", id: id }); } catch(e){ toast("Erro: " + e.message, true); return; }
  var tri = {};
  try { (await api("GET", { r: "triagens", vaga_id: id }) || []).forEach(function(x){ tri[x.candidato_id] = x; }); } catch(e){}
  function triCard(c){
    var t = tri[c.candidato_id], h = '<div style="margin:4px 0;font-size:11px">';
    if (t) h += '<span class="rs-pill ' + (t.score >= 70 ? "rs-green" : (t.score >= 45 ? "rs-amber" : "rs-red")) + '">IA ' + Math.round(t.score) + '</span> <a href="#" data-tv="' + esc(c.candidato_id) + '">ver análise</a> · ';
    h += '<a href="#" data-ia="' + esc(c.candidato_id) + '">' + (t ? "refazer IA" : "Triar com IA") + '</a>';
    if (["Aprovado", "Carta Oferta", "Contratado"].indexOf(c.etapa) >= 0) h += ' · <a href="#" data-of="' + esc(c.candidato_id) + '">Carta-oferta</a>';
    return h + '</div>';
  }
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
      return '<div class="rs-card"><b>' + esc(c.nome) + '</b>' + (c.numero ? ' <span style="color:#777">#' + esc(c.numero) + '</span>' : '') + (c.fonte === "publico" ? '<a href="#" data-p="' + esc(c.candidato_id) + '" style="font-size:11px;margin-left:6px">perfil</a>' : '') + triCard(c) + '<select data-c="' + esc(c.candidato_id) + '">' + op + '</select></div>';
    }).join("");
    return '<div class="rs-col"><h5>' + esc(e) + ' (' + data.pipeline.filter(function(c){ return c.etapa === e; }).length + ')</h5>' + cards + '</div>';
  }).join("");
  var campos = [["Área",v.area],["Motivo",v.motivo + (v.colaborador_substituido ? " - " + v.colaborador_substituido : "")],["Solicitante / gestor",v.gestor_nome],["Cliente",v.cliente],["Local",v.local_trabalho],["Salário",v.salario != null ? "R$ " + Number(v.salario).toLocaleString("pt-BR",{minimumFractionDigits:2}) + (v.tipo_valor ? " (" + v.tipo_valor + ")" : "") : ""],["Tipo de contrato",v.tipo_contrato],["Carga horária",v.carga_horaria ? v.carga_horaria + "h/semana" : ""],["Escala / turno",v.jornada],["Modelo",v.modelo_trabalho],["Requisitos obrigatórios",v.requisitos_obrig],["Requisitos diferenciais",v.requisitos_dif],["Benefícios",v.beneficios],["Equipamentos",v.equipamentos],["EPIs",v.epis],["Origem",v.origem === "requisicao-pessoal" ? "Requisição de pessoal" : ""]];
  var cH = campos.filter(function(c){ return c[1]; }).map(function(c){ return '<div><label style="font-size:12px;color:#777">' + c[0] + '</label><div>' + esc(c[1]) + '</div></div>'; }).join("");
  var pubH = '<div class="rs-sec">Publicação na página de vagas</div>' + (v.status === "Aberta" ? '<div style="font-size:13px"><label style="display:inline-flex;gap:6px;align-items:center;margin-right:16px"><input type="checkbox" id="rs_pub"' + (v.publicada ? ' checked' : '') + '> Publicar esta vaga na página pública</label><label style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" id="rs_cvobr"' + (v.curriculo_obrigatorio ? ' checked' : '') + '> Currículo obrigatório</label>' + (v.publicada && !v.sigilosa ? '<div style="margin-top:6px">Link: <a target="_blank" rel="noopener" href="' + PUB_URL + '?vaga=' + esc(v.id) + '">' + PUB_URL + '?vaga=' + esc(v.id) + '</a></div>' : '') + (v.sigilosa ? '<div style="color:#b45309;margin-top:6px">Vaga sigilosa: não aparece na página pública.</div>' : '') + '</div>' : '<p style="font-size:13px;color:#777">A publicação fica disponível depois da aprovação (vaga Aberta).</p>');
  var ov = overlay('<h3>' + esc(v.codigo) + ' - ' + esc(v.cargo) + ' <span class="rs-pill rs-blue">' + esc(v.status) + '</span> ' + (s ? '<span class="rs-pill ' + s.cls + '">SLA: ' + s.txt + ' (prazo ' + fmtData(s.fim) + ')</span>' : '') + '</h3><div class="rs-grid" style="grid-template-columns:repeat(3,1fr)">' + cH + '</div>' +
    '<div class="rs-sec">Aprovação</div>' + aprH + pubH + '<div class="rs-sec">Posições</div>' + posH +
    '<div class="rs-sec">Candidatos (pipeline)</div>' + (v.status === "Aguardando aprovação" || v.status === "Recusada" ? '<p style="font-size:13px;color:#777">Candidatos só podem ser vinculados após a aprovação da vaga.</p>' : '<div style="display:flex;gap:8px;margin-bottom:8px"><input class="rs-in" id="rs_busca" placeholder="Buscar candidato do banco por nome (mín. 2 letras)"><button class="rs-btn" id="rs_bbtn">Buscar</button></div><div id="rs_res" style="margin-bottom:8px"></div>') +
    '<div class="rs-kb">' + kb + '</div><div class="rs-act"><button class="rs-btn o" id="rs_fecha">Fechar</button></div>');
  ov.querySelector("#rs_fecha").addEventListener("click", function(){ ov.remove(); carregar(); });
  ["rs_pub","rs_cvobr"].forEach(function(i){ var el = ov.querySelector("#" + i); if (el) el.addEventListener("change", async function(){
    try { await api("POST", null, { acao: "publicar_vaga", id: id, publicada: ov.querySelector("#rs_pub").checked, curriculo_obrigatorio: ov.querySelector("#rs_cvobr").checked }); toast("Publicação atualizada."); detalhe(id, ov); }
    catch(e){ toast("Erro: " + e.message, true); }
  }); });
  function candPorId(i){ return data.pipeline.filter(function(x){ return x.candidato_id === i; })[0]; }
  ov.querySelectorAll("a[data-tv]").forEach(function(a){ a.addEventListener("click", function(ev){ ev.preventDefault(); var i = a.getAttribute("data-tv"); triDetalhe(candPorId(i), tri[i]); }); });
  ov.querySelectorAll("a[data-of]").forEach(function(a){ a.addEventListener("click", function(ev){ ev.preventDefault(); cartaOferta(v, candPorId(a.getAttribute("data-of"))); }); });
  ov.querySelectorAll("a[data-ia]").forEach(function(a){ a.addEventListener("click", async function(ev){
    ev.preventDefault(); if (a.getAttribute("data-busy")) return; a.setAttribute("data-busy", "1"); var old = a.textContent; a.textContent = "analisando...";
    try { await api("POST", null, { acao: "triar_candidato", vaga_id: id, candidato_id: a.getAttribute("data-ia") }); toast("Triagem concluída."); detalhe(id, ov); }
    catch(e){ a.textContent = old; a.removeAttribute("data-busy"); toast("Erro: " + e.message, true); }
  }); });
  ov.querySelectorAll("a[data-p]").forEach(function(a){ a.addEventListener("click", function(e){ e.preventDefault(); perfil(a.getAttribute("data-p")); }); });
  ov.querySelectorAll("button[data-a]").forEach(function(b){ b.addEventListener("click", async function(){
    var c = prompt(b.getAttribute("data-d") === "Recusada" ? "Motivo da recusa:" : "Comentário (opcional):") || "";
    try { await api("POST", null, { acao: "decidir", aprovacao_id: b.getAttribute("data-a"), decisao: b.getAttribute("data-d"), comentario: c }); toast("Decisão registrada."); detalhe(id, ov); }
    catch(e){ toast("Erro: " + e.message, true); }
  }); });
  ov.querySelectorAll("select[data-c]").forEach(function(sel){ sel.addEventListener("change", async function(){
    try { await api("POST", null, { acao: "mover_candidato", vaga_id: id, candidato_id: sel.getAttribute("data-c"), para_etapa: sel.value }); if (sel.value === "Contratado") await aoContratar(v, candPorId(sel.getAttribute("data-c"))); detalhe(id, ov); }
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
console.log("rs_module carregado v4");

/* ===== Fase 2: perfil do candidato e Banco de Talentos ===== */
function fmtDT(s){ try { return new Date(s).toLocaleDateString("pt-BR"); } catch(e){ return ""; } }
function modalTxt(titulo, html){
  var ov = document.createElement("div"); ov.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px";
  ov.innerHTML = '<div style="background:#fff;border-radius:10px;max-width:560px;width:100%;max-height:90vh;overflow:auto;padding:18px;font:14px Arial,sans-serif;color:#222"><h3 style="margin:0 0 10px">' + esc(titulo) + '</h3>' + html + '<div style="text-align:right;margin-top:14px"><button class="rs-btn" data-x="1">Fechar</button></div></div>';
  document.body.appendChild(ov);
  ov.querySelector("[data-x]").addEventListener("click", function(){ ov.remove(); });
  return ov;
}
function lista(a){ return (a || []).map(function(x){ return "<li>" + esc(x) + "</li>"; }).join(""); }
function triDetalhe(c, t){
  modalTxt("Triagem por IA - " + c.nome,
    '<p><b>Nota ' + Math.round(t.score) + '/100</b> (técnica ' + (t.score_tecnico != null ? Math.round(t.score_tecnico) : "-") + ', comportamental ' + (t.score_comportamental != null ? Math.round(t.score_comportamental) : "-") + ') - <b>' + esc(t.recomendacao) + '</b></p>' +
    '<p>' + esc(t.resumo) + '</p><b>Pontos fortes</b><ul>' + lista(t.fortes) + '</ul><b>Lacunas / riscos</b><ul>' + lista(t.lacunas) + '</ul>' +
    '<p style="font-size:11px;color:#777">Apoio à decisão: a avaliação é sempre do RH. Base: ' + esc(t.fonte_dados || "-") + (t.por ? " - por " + esc(t.por) : "") + ".</p>");
}
function carregarDocx(){
  return new Promise(function(res, rej){
    if (window.docx && window.docx.Packer) return res(window.docx);
    var sc = document.createElement("script"); sc.src = "https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js";
    sc.onload = function(){ res(window.docx); }; sc.onerror = function(){ rej(new Error("Não foi possível carregar o gerador de Word.")); };
    document.head.appendChild(sc);
  });
}
function dataExt(iso){ if (!iso) return ""; var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }); }
function cartaOferta(v, c){
  var d7 = new Date(); d7.setDate(d7.getDate() + 7); var val = d7.getFullYear() + "-" + ("0" + (d7.getMonth() + 1)).slice(-2) + "-" + ("0" + d7.getDate()).slice(-2);
  var inp = "width:100%;box-sizing:border-box;padding:6px;margin:2px 0 8px;border:1px solid #ccc;border-radius:6px";
  var f = function(id, rot, val2, tipo){ return '<label style="font-size:12px;color:#555">' + rot + '</label><input id="' + id + '" type="' + (tipo || "text") + '" value="' + esc(val2 == null ? "" : val2) + '" style="' + inp + '">'; };
  var ov = modalTxt("Carta-oferta - " + c.nome,
    f("of_cargo", "Cargo", v.cargo) + f("of_sal", "Remuneração mensal (R$)", v.salario, "number") + f("of_contrato", "Tipo de contrato", v.tipo_contrato || "CLT") +
    f("of_carga", "Carga horária (h/semana)", v.carga_horaria) + f("of_escala", "Escala / turno", v.jornada) + f("of_local", "Local de trabalho", v.local_trabalho) +
    '<label style="font-size:12px;color:#555">Benefícios</label><textarea id="of_benef" rows="3" style="' + inp + '">' + esc(v.beneficios || "") + '</textarea>' +
    f("of_inicio", "Data prevista de início", "", "date") + f("of_valid", "Proposta válida até", val, "date") + f("of_resp", "Assinatura (nome do RH)", "") +
    '<button class="rs-btn" id="of_go">Gerar Word (.docx)</button> ');
  ov.querySelector("#of_go").addEventListener("click", async function(){
    var g = function(i){ return ov.querySelector("#" + i).value.trim(); };
    if (!g("of_sal") || !g("of_inicio")) { toast("Informe a remuneração e a data de início.", true); return; }
    try {
      var D = await carregarDocx();
      var sal = "R$ " + Number(g("of_sal")).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + " mensais" + (v.tipo_valor ? " (" + String(v.tipo_valor).toLowerCase() + ")" : "");
      var P = function(t, o){ o = o || {}; return new D.Paragraph({ alignment: o.al, spacing: { after: o.after == null ? 160 : o.after }, children: [new D.TextRun({ text: t, bold: !!o.b, size: o.size || 22, color: o.cor, font: "Arial" })] }); };
      var linhas = [["Cargo", g("of_cargo")], ["Área", v.area || ""], ["Tipo de contrato", g("of_contrato")], ["Remuneração", sal], ["Carga horária", g("of_carga") ? g("of_carga") + " horas semanais" : ""], ["Escala / turno", g("of_escala")], ["Local de trabalho", g("of_local")], ["Benefícios", g("of_benef")], ["Data prevista de início", dataExt(g("of_inicio"))]].filter(function(x){ return x[1]; });
      var borda = { style: D.BorderStyle.SINGLE, size: 4, color: "BBBBBB" };
      var bordas = { top: borda, bottom: borda, left: borda, right: borda };
      var cel = function(t, w, b){ return new D.TableCell({ width: { size: w, type: D.WidthType.DXA }, borders: bordas, margins: { top: 80, bottom: 80, left: 120, right: 120 }, shading: b ? { type: D.ShadingType.CLEAR, fill: "F3E8EA" } : undefined, children: [P(t, { b: b, after: 0, size: 21 })] }); };
      var tab = new D.Table({ width: { size: 9026, type: D.WidthType.DXA }, columnWidths: [2800, 6226], rows: linhas.map(function(x){ return new D.TableRow({ children: [cel(x[0], 2800, true), cel(x[1], 6226, false)] }); }) });
      var hoje = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
      var doc = new D.Document({ sections: [{ properties: {}, children: [
        P("ElevaLife", { b: true, size: 32, cor: "7A1F2B", after: 60 }), P("CARTA-OFERTA", { b: true, size: 26, after: 300 }),
        P(hoje, { al: D.AlignmentType.RIGHT, after: 300 }),
        P("Prezado(a) " + c.nome + ",", { b: true }),
        P("É com satisfação que a ElevaLife formaliza o convite para você integrar o nosso time. Ao final do processo seletivo, você foi aprovado(a) para a posição abaixo, nas seguintes condições:", { al: D.AlignmentType.JUSTIFIED }),
        tab, P("", { after: 120 }),
        P("A efetivação está condicionada à entrega da documentação admissional e à aprovação nos exames exigidos. Esta proposta é válida até " + dataExt(g("of_valid")) + "; após essa data, será necessária nova confirmação.", { al: D.AlignmentType.JUSTIFIED }),
        P("Para aceitar, basta assinar abaixo e devolver este documento ao RH. Estamos à disposição para esclarecer qualquer dúvida.", { al: D.AlignmentType.JUSTIFIED, after: 400 }),
        P("Atenciosamente,", { after: 500 }),
        P("______________________________", { after: 40 }), P(g("of_resp") || "Recursos Humanos", { b: true, after: 0 }), P("ElevaLife", { after: 400 }),
        P("De acordo em ____/____/______", { after: 500 }), P("______________________________", { after: 40 }), P(c.nome, { b: true, after: 300 }),
        P("Minuta gerada pelo painel em ambiente de homologação - sujeita à validação do DP/Jurídico.", { size: 16, cor: "888888" })
      ] }] });
      var blob = await D.Packer.toBlob(doc);
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = ("Carta-oferta_" + c.nome + "_" + g("of_cargo")).replace(/[^A-Za-z0-9À-ÿ_-]+/g, "_") + ".docx";
      document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      toast("Carta-oferta gerada.");
    } catch(e){ toast("Erro: " + e.message, true); }
  });
}
async function perfil(id, aoFechar){
  var c;
  try { c = await api("GET", { r: "candidato", id: id }); } catch(e){ toast("Erro: " + e.message, true); return; }
  var linhas = [["E-mail", c.email], ["Telefone", c.telefone], ["Cidade", [c.cidade, c.uf].filter(Boolean).join("/")], ["Cargo de interesse", c.cargo_interesse], ["Área de interesse", c.area_interesse], ["Pretensão salarial", c.pretensao ? Number(c.pretensao).toLocaleString("pt-BR", {style: "currency", currency: "BRL"}) : ""], ["LinkedIn", c.linkedin], ["Resumo", c.resumo], ["Origem", c.origem], ["Entrada", fmtDT(c.criado_em)], ["Consentimento", "ciência do aviso em " + fmtDT(c.consentimento_em) + " (" + (c.consentimento_versao || "sem versão") + ")" + (c.banco_talentos ? "; autorizou o banco de talentos" : "; NÃO autorizou o banco de talentos")]];
  var h = '<h3>' + esc(c.nome) + '</h3><div class="rs-grid" style="grid-template-columns:repeat(2,1fr)">' + linhas.filter(function(l){ return l[1]; }).map(function(l){ return '<div><label style="font-size:12px;color:#777">' + l[0] + '</label><div>' + esc(l[1]) + '</div></div>'; }).join("") + '</div>' +
    '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">' + (c.tem_curriculo ? '<button class="rs-btn" id="rp_cv">Abrir currículo</button>' : '<span style="font-size:13px;color:#777;align-self:center">Sem currículo anexado.</span>') + '<button class="rs-btn" id="rp_del" style="color:#b02a2a">Excluir dados (LGPD)</button><button class="rs-btn" id="rp_x" style="margin-left:auto">Fechar</button></div>';
  var ov = overlay(h);
  ov.querySelector("#rp_x").addEventListener("click", function(){ ov.remove(); });
  var cv = ov.querySelector("#rp_cv");
  if (cv) cv.addEventListener("click", async function(){ try { var r = await fetch(RS_URL + "?r=curriculo-url&id=" + encodeURIComponent(id), { headers: { "x-painel-secret": RECRUTAHUB_API_SECRET } }); var j = await r.json(); if (!r.ok) throw new Error(j.error || "erro"); window.open(j.url, "_blank", "noopener"); } catch(e){ toast("Erro: " + e.message, true); } });
  ov.querySelector("#rp_del").addEventListener("click", async function(){
    if (!confirm("Excluir definitivamente os dados e o currículo de " + c.nome + "? Esta ação não pode ser desfeita.")) return;
    try { await api("POST", null, { acao: "excluir_candidato", id: id }); toast("Dados excluídos."); ov.remove(); if (aoFechar) aoFechar(); } catch(e){ toast("Erro: " + e.message, true); }
  });
}

async function vincularBanco(cand){
  var abertas = [];
  try { abertas = (await api("GET", { r: "vagas" })).filter(function(v){ return v.status === "Aberta"; }); } catch(e){ toast("Erro: " + e.message, true); return; }
  if (!abertas.length) { toast("Não há vagas Abertas para vincular.", true); return; }
  var ov = overlay('<h3>Vincular ' + esc(cand.nome) + ' a uma vaga</h3><select id="rv_v" style="width:100%">' + abertas.map(function(v){ return '<option value="' + esc(v.id) + '">' + esc(v.codigo + " - " + v.cargo) + '</option>'; }).join("") + '</select><div style="margin-top:14px;display:flex;gap:8px"><button class="rs-btn rs-primary" id="rv_ok">Vincular</button><button class="rs-btn" id="rv_x">Cancelar</button></div>');
  ov.querySelector("#rv_x").addEventListener("click", function(){ ov.remove(); });
  ov.querySelector("#rv_ok").addEventListener("click", async function(){
    try { await api("POST", null, { acao: "vincular_candidato", vaga_id: ov.querySelector("#rv_v").value, candidato_id: cand.id }); toast("Candidato vinculado à vaga."); ov.remove(); }
    catch(e){ toast("Erro: " + e.message, true); }
  });
}

var talentos = [];
async function buscarBanco(){
  var box = document.getElementById("rtLista"); if (!box) return;
  box.innerHTML = '<p style="color:#777">Buscando...</p>';
  var p = { r: "talentos", q: document.getElementById("rtQ").value.trim(), cargo: document.getElementById("rtCargo").value.trim(), cidade: document.getElementById("rtCidade").value.trim() };
  var f = document.getElementById("rtFonte").value; if (f) p.fonte = f;
  try { talentos = await api("GET", p); } catch(e){ box.innerHTML = '<span style="color:#b02a2a">' + esc(e.message) + '</span>'; return; }
  if (!talentos.length) { box.innerHTML = '<p style="color:#777">Nenhum candidato encontrado.</p>'; return; }
  box.innerHTML = '<div style="font-size:12px;color:#777;margin-bottom:6px">' + talentos.length + ' resultado(s)' + (talentos.length >= 100 ? ' (mostrando os 100 mais recentes; refine a busca)' : '') + '</div><table class="rs-tbl"><thead><tr><th>Nome</th><th>Cargo / área</th><th>Cidade</th><th>Contato</th><th>Origem</th><th>Entrada</th><th></th></tr></thead><tbody>' +
    talentos.map(function(c, i){ return '<tr><td><b>' + esc(c.nome) + '</b>' + (c.numero ? ' <span style="color:#777">#' + esc(c.numero) + '</span>' : '') + (c.etapa ? '<div style="font-size:11px;color:#777">' + esc(c.etapa) + '</div>' : '') + '</td><td>' + esc([c.cargo, c.area].filter(Boolean).join(" / ")) + '</td><td>' + esc(c.cidade || "") + '</td><td>' + esc([c.email, c.telefone].filter(Boolean).join(" · ")) + '</td><td>' + (c.fonte === "publico" ? '<span class="rs-pill rs-green">Página pública</span>' : '<span class="rs-pill rs-blue">RecrutaHub atual</span>') + '</td><td>' + fmtDT(c.criado_em) + '</td><td style="white-space:nowrap">' + (c.fonte === "publico" ? '<button class="rs-btn" data-pf="' + i + '">Perfil</button> ' : '') + '<button class="rs-btn" data-vc="' + i + '">Vincular</button></td></tr>'; }).join("") + '</tbody></table>';
  box.querySelectorAll("button[data-pf]").forEach(function(b){ b.addEventListener("click", function(){ perfil(talentos[Number(b.getAttribute("data-pf"))].id, buscarBanco); }); });
  box.querySelectorAll("button[data-vc]").forEach(function(b){ b.addEventListener("click", function(){ vincularBanco(talentos[Number(b.getAttribute("data-vc"))]); }); });
}

function montarBanco(){
  if (document.getElementById("rtTab") && document.getElementById("panel-rt")) return;
  ["rtTab","panel-rt"].forEach(function(i){ var e = document.getElementById(i); if (e) e.remove(); });
  var tabs = document.querySelector(".sidebar nav.tabs"), rs = document.getElementById("rsTab"), ref = document.getElementById("panel-ajuda");
  if (!tabs || !rs || !ref || rs.style.display === "none") return;
  var tab = document.createElement("div"); tab.className = "tab tab-sub"; tab.id = "rtTab"; tab.setAttribute("data-tab","rt");
  tab.innerHTML = '<span class="tab-icon">&#128269;</span>Talentos R&S (piloto)';
  tabs.insertBefore(tab, rs.nextSibling);
  var painel = document.createElement("div"); painel.className = "panel"; painel.id = "panel-rt";
  painel.innerHTML = '<div class="kanban-header"><h2>Talentos R&S (piloto)</h2></div><div style="padding:0 4px 10px;font-size:13px;color:#555">Candidatos da página pública que autorizaram o banco de talentos e candidatos do RecrutaHub atual.</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><input id="rtQ" placeholder="Busca livre (nome, e-mail, palavra-chave)" style="flex:2;min-width:220px"><input id="rtCargo" placeholder="Cargo / área" style="flex:1;min-width:140px"><input id="rtCidade" placeholder="Cidade" style="flex:1;min-width:120px"><select id="rtFonte"><option value="">Todas as origens</option><option value="publico">Página pública</option><option value="recrutahub">RecrutaHub atual</option></select><button class="rs-btn rs-primary" id="rtBuscar">Buscar</button></div><div id="rtLista"></div>';
  ref.parentNode.insertBefore(painel, ref);
  tab.addEventListener("click", function(){ document.querySelectorAll(".tab").forEach(function(x){ x.classList.remove("active"); }); document.querySelectorAll(".panel").forEach(function(x){ x.classList.remove("active"); }); tab.classList.add("active"); painel.classList.add("active"); var cb = document.getElementById("clientbarWrap"); if (cb) cb.style.display = "none"; buscarBanco(); });
  document.getElementById("rtBuscar").addEventListener("click", buscarBanco);
  ["rtQ","rtCargo","rtCidade"].forEach(function(i){ document.getElementById(i).addEventListener("keydown", function(e){ if (e.key === "Enter") buscarBanco(); }); });
}
setInterval(montarBanco, 1500);

/* ===== Fase 4: admissão e onboarding ===== */
var RS_NOTIFICA_DP_REAL = false; /* homologação: aviso vai só para quem executou a ação */
var GRUPOS_ADM = [["documentos","Documentos admissionais"],["exame_epi","Exame admissional e EPIs"],["onboarding","Onboarding (1º dia, 30/60/90 dias)"]];
function dpEmail(){ try { return AREA_RESPONSAVEL_EMAIL["Departamento Pessoal"] || ""; } catch(e){ return ""; } }
async function avisarDP(adm, v){
  try {
    if (typeof graphFetch !== "function") return false;
    var dest = RS_NOTIFICA_DP_REAL ? dpEmail() : usuario();
    if (!dest) return false;
    var html = "<p>Olá,</p><p>Um candidato foi marcado como <b>Contratado</b> no módulo de Recrutamento e Seleção" + (RS_NOTIFICA_DP_REAL ? "" : " (<b>HOMOLOGAÇÃO</b> - aviso enviado apenas a você; em produção seguirá ao DP)") + ":</p><ul><li><b>Candidato:</b> " + esc(adm.nome) + "</li><li><b>Cargo:</b> " + esc(adm.cargo) + "</li><li><b>Vaga:</b> " + esc(v.codigo) + (v.cliente ? " - " + esc(v.cliente) : "") + "</li></ul><p>A admissão foi aberta no painel com o checklist de documentos, exame/EPIs e onboarding.</p>";
    await graphFetch("https://graph.microsoft.com/v1.0/me/sendMail", { method: "POST", body: JSON.stringify({ message: { subject: "[Painel ElevaLife] Admissão aberta: " + adm.nome, body: { contentType: "HTML", content: html }, toRecipients: [{ emailAddress: { address: dest } }] }, saveToSentItems: true }) });
    return true;
  } catch(e){ console.warn("aviso DP", e); return false; }
}
async function aoContratar(v, c){
  try {
    var r = await api("POST", null, { acao: "iniciar_admissao", vaga_id: v.id, candidato_id: c.candidato_id, fonte: c.fonte, nome: c.nome, cargo: v.cargo });
    if (r && r.ja_existia) { toast("Admissão já estava aberta."); return; }
    var ok = await avisarDP(r, v);
    toast("Admissão aberta. " + (ok ? "DP avisado por e-mail." : "Não foi possível enviar o e-mail ao DP (entre com a conta Microsoft)."));
  } catch(e){ toast("Erro ao abrir admissão: " + e.message, true); }
}
function dataMais(iso, dias){ if (!iso || dias == null) return null; var p = iso.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]); d.setDate(d.getDate() + dias); return d; }
function progresso(itens, g){ var l = itens.filter(function(i){ return !g || i.grupo === g; }); var f = l.filter(function(i){ return i.concluido; }).length; return { f: f, t: l.length }; }
var adms = [];
async function carregarAdm(){
  var box = document.getElementById("adLista"); if (!box) return;
  box.innerHTML = '<p style="color:#777">Carregando...</p>';
  try { adms = await api("GET", { r: "admissoes" }); } catch(e){ box.innerHTML = '<span style="color:#b02a2a">' + esc(e.message) + '</span>'; return; }
  if (!adms.length) { box.innerHTML = '<p style="color:#777">Nenhuma admissão aberta. Elas são abertas automaticamente quando um candidato é movido para "Contratado" na vaga.</p>'; return; }
  box.innerHTML = '<table class="rs-tbl"><thead><tr><th>Candidato</th><th>Cargo</th><th>Início</th><th>Documentos</th><th>Exame / EPIs</th><th>Onboarding</th><th>Status</th><th></th></tr></thead><tbody>' + adms.map(function(a){
    var p = function(g){ var x = progresso(a.itens || [], g); return '<span class="rs-pill ' + (x.t && x.f === x.t ? "rs-green" : "rs-amber") + '">' + x.f + '/' + x.t + '</span>'; };
    return '<tr><td><b>' + esc(a.nome) + '</b></td><td>' + esc(a.cargo) + '</td><td>' + (a.data_inicio ? fmtData(dataMais(a.data_inicio, 0)) : '<span style="color:#b45309">definir</span>') + '</td><td>' + p("documentos") + '</td><td>' + p("exame_epi") + '</td><td>' + p("onboarding") + '</td><td>' + esc(a.status) + '</td><td><button class="rs-btn o" data-ad="' + esc(a.id) + '">Abrir</button></td></tr>';
  }).join("") + '</tbody></table>';
  box.querySelectorAll("button[data-ad]").forEach(function(b){ b.addEventListener("click", function(){ detalheAdm(b.getAttribute("data-ad")); }); });
}
async function detalheAdm(id, antigo){
  var a;
  try { a = await api("GET", { r: "admissao", id: id }); } catch(e){ toast("Erro: " + e.message, true); return; }
  if (antigo) antigo.remove();
  var itens = (a.itens || []).sort(function(x, y){ return x.ordem - y.ordem; });
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var h = '<h3>Admissão - ' + esc(a.nome) + ' <span class="rs-pill rs-blue">' + esc(a.status) + '</span></h3><div style="font-size:13px;margin-bottom:8px">' + esc(a.cargo) + ' &nbsp; Data de início: <input type="date" id="ad_ini" value="' + esc(a.data_inicio || "") + '" style="padding:5px;border:1px solid var(--border);border-radius:6px"> <span style="color:#777">Os prazos dos itens são calculados a partir desta data.</span></div>';
  GRUPOS_ADM.forEach(function(g){
    var p = progresso(itens, g[0]);
    h += '<div class="rs-sec">' + g[1] + ' (' + p.f + '/' + p.t + ')</div>';
    itens.filter(function(i){ return i.grupo === g[0]; }).forEach(function(i){
      var pz = dataMais(a.data_inicio, i.prazo_dias), atr = pz && !i.concluido && pz < hoje;
      h += '<div class="rs-apr"><label style="flex:1;display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" data-it="' + esc(i.id) + '"' + (i.concluido ? " checked" : "") + '> <span' + (i.concluido ? ' style="text-decoration:line-through;color:#777"' : "") + '>' + esc(i.titulo) + '</span></label>' + (pz ? '<span class="rs-pill ' + (i.concluido ? "rs-green" : (atr ? "rs-red" : "rs-gray")) + '">' + (i.concluido ? "feito" : (atr ? "atrasado " : "até ")) + (i.concluido ? "" : fmtData(pz)) + '</span>' : '') + (i.concluido_por ? '<span style="font-size:11px;color:#777">' + esc(i.concluido_por) + '</span>' : '') + '</div>';
    });
  });
  var tot = progresso(itens);
  h += '<div class="rs-act"><span style="margin-right:auto;font-size:13px">Progresso geral: <b>' + tot.f + '/' + tot.t + '</b></span>' + (a.status !== "Concluída" ? '<button class="rs-btn" id="ad_fin">Concluir admissão</button>' : '') + '<button class="rs-btn o" id="ad_x">Fechar</button></div>';
  var ov = overlay(h);
  ov.querySelector("#ad_x").addEventListener("click", function(){ ov.remove(); carregarAdm(); });
  ov.querySelector("#ad_ini").addEventListener("change", async function(e){ try { await api("POST", null, { acao: "atualizar_admissao", id: id, data_inicio: e.target.value }); detalheAdm(id, ov); } catch(er){ toast("Erro: " + er.message, true); } });
  var fin = ov.querySelector("#ad_fin"); if (fin) fin.addEventListener("click", async function(){ try { await api("POST", null, { acao: "atualizar_admissao", id: id, status: "Concluída" }); detalheAdm(id, ov); } catch(er){ toast("Erro: " + er.message, true); } });
  ov.querySelectorAll("input[data-it]").forEach(function(cb){ cb.addEventListener("change", async function(){ try { await api("POST", null, { acao: "atualizar_item", id: cb.getAttribute("data-it"), concluido: cb.checked }); detalheAdm(id, ov); } catch(er){ toast("Erro: " + er.message, true); cb.checked = !cb.checked; } }); });
}
function montarAdm(){
  if (document.getElementById("adTab") && document.getElementById("panel-ad")) return;
  ["adTab","panel-ad"].forEach(function(i){ var e = document.getElementById(i); if (e) e.remove(); });
  var tabs = document.querySelector(".sidebar nav.tabs"), ref = document.getElementById("panel-ajuda"), prev = document.getElementById("rtTab") || document.getElementById("rsTab");
  if (!tabs || !prev || !ref || prev.style.display === "none") return;
  var tab = document.createElement("div"); tab.className = "tab tab-sub"; tab.id = "adTab"; tab.setAttribute("data-tab","ad");
  tab.innerHTML = '<span class="tab-icon">&#128221;</span>Admissões (piloto)';
  tabs.insertBefore(tab, prev.nextSibling);
  var painel = document.createElement("div"); painel.className = "panel"; painel.id = "panel-ad";
  painel.innerHTML = '<div class="kanban-header"><h2>Admissões e onboarding <span class="rs-pill rs-amber" style="font-size:11px">PILOTO</span></h2></div><div style="padding:0 4px 10px;font-size:13px;color:#555">Candidatos contratados: documentos admissionais, exame e EPIs, onboarding de 1º dia, 30, 60 e 90 dias.</div><div id="adLista"></div>';
  ref.parentNode.insertBefore(painel, ref);
  tab.addEventListener("click", function(){ document.querySelectorAll(".tab").forEach(function(x){ x.classList.remove("active"); }); document.querySelectorAll(".panel").forEach(function(x){ x.classList.remove("active"); }); tab.classList.add("active"); painel.classList.add("active"); var cb = document.getElementById("clientbarWrap"); if (cb) cb.style.display = "none"; carregarAdm(); });
}
setInterval(montarAdm, 1500);

/* ===== Fase 4: indicadores de R&S e unificação do Banco de Talentos ===== */
async function carregarInd(){
  var box = document.getElementById("inLista"); if (!box) return;
  box.innerHTML = '<p style="color:#777">Calculando...</p>';
  var vs, ads, pipes = [], tris = 0;
  try {
    vs = await api("GET", { r: "vagas" }); ads = await api("GET", { r: "admissoes" });
    var ativas = vs.filter(function(v){ return v.status === "Aberta" || v.status === "Preenchida"; });
    for (var i = 0; i < ativas.length; i++){ try { var d = await api("GET", { r: "vaga", id: ativas[i].id }); pipes.push({ v: ativas[i], p: d.pipeline || [], mov: d.movimentos || [] }); var t = await api("GET", { r: "triagens", vaga_id: ativas[i].id }); tris += (t || []).length; } catch(e){} }
  } catch(e){ box.innerHTML = '<span style="color:#b02a2a">' + esc(e.message) + '</span>'; return; }
  var por = function(st){ return vs.filter(function(v){ return v.status === st; }).length; };
  var comSla = vs.filter(function(v){ return sla(v); }), venc = comSla.filter(function(v){ return sla(v).rest < 0; }).length;
  var noPrazo = comSla.length ? Math.round(100 * (comSla.length - venc) / comSla.length) : null;
  var pos = 0, pre = 0; vs.forEach(function(v){ if (v.status !== "Recusada" && v.posicoes){ pos += v.posicoes.total; pre += v.posicoes.preenchidas; } });
  var etapas = ETAPAS_FALLBACK, cont = {}; etapas.forEach(function(e){ cont[e] = 0; });
  var totCand = 0; pipes.forEach(function(x){ x.p.forEach(function(c){ cont[c.etapa] = (cont[c.etapa] || 0) + 1; totCand++; }); });
  var adAnd = ads.filter(function(a){ return a.status !== "Concluída"; }).length, adFim = ads.length - adAnd;
  var itTot = 0, itOk = 0; ads.forEach(function(a){ (a.itens || []).forEach(function(i){ itTot++; if (i.concluido) itOk++; }); });
  var k = function(t, v){ return '<div class="rs-kpi"><b>' + v + '</b>' + t + '</div>'; };
  var max = Math.max.apply(null, etapas.map(function(e){ return cont[e] || 0; }).concat([1]));
  var funil = etapas.map(function(e){ var n = cont[e] || 0; return '<div style="display:flex;align-items:center;gap:8px;margin:4px 0;font-size:13px"><span style="width:140px">' + esc(e) + '</span><div style="flex:1;background:#f0f0f2;border-radius:6px"><div style="width:' + Math.round(100 * n / max) + '%;min-width:' + (n ? 4 : 0) + 'px;background:var(--grena);height:16px;border-radius:6px"></div></div><b style="width:30px;text-align:right">' + n + '</b></div>'; }).join("");
  box.innerHTML = '<div class="rs-sec" style="margin-top:0">Vagas e prazos</div><div class="rs-kpis">' + k("Vagas abertas", por("Aberta")) + k("Aguardando aprovação", por("Aguardando aprovação")) + k("Preenchidas", por("Preenchida")) + k("SLA no prazo", noPrazo === null ? "-" : noPrazo + "%") + '</div><div class="rs-kpis">' + k("SLA vencido", venc) + k("Posições preenchidas", pre + "/" + pos) + k("Candidatos no funil", totCand) + k("Triagens por IA", tris) + '</div>' +
    '<div class="rs-sec">Funil de candidatos (vagas abertas/preenchidas)</div>' + funil +
    '<div class="rs-sec">Admissão e onboarding</div><div class="rs-kpis">' + k("Admissões em andamento", adAnd) + k("Admissões concluídas", adFim) + k("Itens concluídos", itTot ? Math.round(100 * itOk / itTot) + "%" : "-") + k("Itens totais", itTot) + '</div>';
}
function montarInd(){
  if (document.getElementById("inTab") && document.getElementById("panel-in")) return;
  ["inTab","panel-in"].forEach(function(i){ var e = document.getElementById(i); if (e) e.remove(); });
  var tabs = document.querySelector(".sidebar nav.tabs"), ref = document.getElementById("panel-ajuda"), prev = document.getElementById("adTab");
  if (!tabs || !prev || !ref) return;
  var tab = document.createElement("div"); tab.className = "tab tab-sub"; tab.id = "inTab"; tab.setAttribute("data-tab","in");
  tab.innerHTML = '<span class="tab-icon">&#128202;</span>Indicadores R&S (piloto)';
  tabs.insertBefore(tab, prev.nextSibling);
  var painel = document.createElement("div"); painel.className = "panel"; painel.id = "panel-in";
  painel.innerHTML = '<div class="kanban-header"><h2>Indicadores de Recrutamento e Seleção <span class="rs-pill rs-amber" style="font-size:11px">PILOTO</span></h2></div><div id="inLista"></div>';
  ref.parentNode.insertBefore(painel, ref);
  tab.addEventListener("click", function(){ document.querySelectorAll(".tab").forEach(function(x){ x.classList.remove("active"); }); document.querySelectorAll(".panel").forEach(function(x){ x.classList.remove("active"); }); tab.classList.add("active"); painel.classList.add("active"); var cb = document.getElementById("clientbarWrap"); if (cb) cb.style.display = "none"; carregarInd(); });
}
setInterval(montarInd, 1500);
/* unificação: o Banco de Talentos novo (público + RecrutaHub) passa a ser o principal; o anterior fica identificado até migrar as avaliações */
function unificarBanco(){
  var novo = document.getElementById("rtTab");
  if (novo && novo.textContent.indexOf("Talentos R&S") >= 0){ novo.innerHTML = '<span class="tab-icon">&#128269;</span>Banco de Talentos'; var h = document.querySelector("#panel-rt h2"); if (h) h.textContent = "Banco de Talentos"; }
  document.querySelectorAll(".sidebar nav.tabs .tab").forEach(function(t){
    if (t.id !== "rtTab" && /^\s*\S*\s*Banco de Talentos\s*$/.test(t.textContent) && t.textContent.indexOf("anterior") < 0) t.lastChild.textContent = " Banco de Talentos (anterior)";
  });
}
setInterval(unificarBanco, 1500);

window.rsDebug = { carregar: carregar, api: api };
})();
