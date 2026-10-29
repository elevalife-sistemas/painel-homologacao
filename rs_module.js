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
      el.textContent = "Salário acima do teto (" + tetoAtual.toLocaleString("pt-BR", {style: "currency", currency: "BRL"}) + " para a carga informada): exige aprovação da Diretoria.";
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
    tetoAtual = prop; if (!salEditado) q("f_sal").value = prop.toFixed(2); checaTeto();
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
  var campos = [["Área",v.area],["Motivo",v.motivo + (v.colaborador_substituido ? " - " + v.colaborador_substituido : "")],["Solicitante / gestor",v.gestor_nome],["Cliente",v.cliente],["Local",v.local_trabalho],["Salário",v.salario != null ? "R$ " + Number(v.salario).toLocaleString("pt-BR",{minimumFractionDigits:2}) + (v.tipo_valor ? " (" + v.tipo_valor + ")" : "") : ""],["Tipo de contrato",v.tipo_contrato],["Carga horária",v.carga_horaria ? v.carga_horaria + "h/semana" : ""],["Escala / turno",v.jornada],["Modelo",v.modelo_trabalho],["Requisitos obrigatórios",v.requisitos_obrig],["Requisitos diferenciais",v.requisitos_dif],["Benefícios",v.beneficios],["Equipamentos",v.equipamentos],["EPIs",v.epis],["Origem",v.origem === "requisicao-pessoal" ? "Requisição de pessoal" : ""]];
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
console.log("rs_module carregado v4");
window.rsDebug = { carregar: carregar, api: api };
})();
