// ============ DADOS DO SISTEMA ============
const ATTR_KEYS = ['FOR','DES','VIG','INT','CAR','INS'];
const ATTR_NAMES = {FOR:'Força',DES:'Destreza',VIG:'Vigor',INT:'Intelecto',CAR:'Carisma',INS:'Instinto'};

const SKILL_GROUPS = [
  {attr:'FOR', title:'Força', skills:['Briga','Atletismo']},
  {attr:'DES', title:'Destreza', skills:['Pontaria','Acrobacia','Furtividade','Reflexos','Crime','Pilotagem']},
  {attr:'VIG', title:'Vigor', skills:['Fortitude','Bloqueio']},
  {attr:'INT', title:'Intelecto', skills:['Herbalogia','Monstrologia','Ofícios','Medicina','Conhecimento Acadêmico','Tática','Investigação']},
  {attr:'CAR', title:'Carisma', skills:['Diplomacia','Coerção','Arte','Adestramento']},
  {attr:'INS', title:'Instinto', skills:['Percepção','Rastreio','Sobrevivência','Imbuir','Ancorar','Vontade']},
];

function defaultCharacter(name){
  const attrs = {}; ATTR_KEYS.forEach(k=>attrs[k]=2);
  const skills = {};
  SKILL_GROUPS.forEach(g=>g.skills.forEach(s=>skills[s]=0));
  skills['Combate Armado'] = 0;
  return {
    id: 'char_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    name: name || 'Novo Caçador',
    race:'', archetype:'', past:'', grau:1, xpAtual:0,
    attrs, skills, combateArmadoAttr:'FOR',
    extraAttrPoints:7, extraSkillBonus:0,
    pvCurrent:10, pvArchBonus:0, pvTalentBonus:0,
    razaoCurrent:10, razaoArchBonus:0, razaoTalentBonus:0,
    fardoCurrent:0,
  };
}

// ============ ESTADO ============
let current = null;
let charIndex = []; // [{id,name}]
let saveTimeout = null;

// ============ STORAGE ============
async function loadIndex(){
  try{
    const r = await window.storage.get('char-index', false);
    charIndex = r ? JSON.parse(r.value) : [];
  }catch(e){ charIndex = []; }
}
async function saveIndex(){
  try{ await window.storage.set('char-index', JSON.stringify(charIndex), false); }catch(e){}
}
async function loadCharacter(id){
  try{
    const r = await window.storage.get('char-data:'+id, false);
    return r ? JSON.parse(r.value) : null;
  }catch(e){ return null; }
}
async function saveCharacterNow(){
  if(!current) return;
  const ind = document.getElementById('saveIndicator');
  ind.textContent = 'salvando...'; ind.classList.add('saving');
  try{
    await window.storage.set('char-data:'+current.id, JSON.stringify(current), false);
    await window.storage.set('active-char', current.id, false);
    ind.textContent = 'salvo automaticamente'; ind.classList.remove('saving');
  }catch(e){
    ind.textContent = 'erro ao salvar — tente novamente';
  }
}
function queueSave(){
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveCharacterNow, 450);
}

// ============ CÁLCULOS ============
function calc(c){
  const pvMax = 8 + c.attrs.VIG*2 + (Number(c.pvArchBonus)||0) + (Number(c.pvTalentBonus)||0);
  const razaoMax = 8 + c.attrs.INS*2 + (Number(c.razaoArchBonus)||0) + (Number(c.razaoTalentBonus)||0);
  const fardoMax = 10 + c.attrs.FOR*2;
  const defesa = c.attrs.DES >= 4 ? '2 de 6+' : '2 de 5+';
  const periciasDisp = 6 + c.attrs.INT + (Number(c.extraSkillBonus)||0);
  let periciasUsadas = 0;
  Object.values(c.skills).forEach(v=>periciasUsadas+=Number(v)||0);
  const attrPointsUsed = ATTR_KEYS.reduce((s,k)=>s+Math.max(0,c.attrs[k]-2),0);
  const xpProximo = 10 + 3*(Math.max(1,c.grau)-1);
  return {pvMax,razaoMax,fardoMax,defesa,periciasDisp,periciasUsadas,attrPointsUsed,xpProximo};
}

function capTierLabel(val, kind){
  // kind: 'attr' or 'skill'
  const t = kind==='attr' ? {c:4,p:6,a:8} : {c:3,p:5,a:7};
  if(val<=t.c) return {label:'criação', color:'var(--ink-faint)'};
  if(val<=t.p) return {label:'permanente', color:'var(--brass-bright)'};
  if(val<=t.a) return {label:'absoluto (talento)', color:'var(--rust)'};
  return {label:'excede teto!', color:'var(--blood-bright)'};
}

// ============ RENDER ============
function renderAttrs(){
  const grid = document.getElementById('attrGrid');
  grid.innerHTML = '';
  ATTR_KEYS.forEach(k=>{
    const val = current.attrs[k];
    const tier = capTierLabel(val,'attr');
    const pips = Array.from({length:Math.min(val,8)},(_,i)=>`<div class="pip on"></div>`).join('')
      + Array.from({length:Math.max(0,8-val)},()=>`<div class="pip"></div>`).join('');
    const div = document.createElement('div');
    div.className = 'attr-card';
    div.innerHTML = `
      <div class="attr-top">
        <span class="attr-name">${ATTR_NAMES[k]}</span>
        <span class="attr-abbr" style="color:${tier.color}">${k} · ${tier.label}</span>
      </div>
      <div class="stepper">
        <button class="step-btn" data-attr="${k}" data-d="-1">−</button>
        <span class="step-val">${val}</span>
        <button class="step-btn" data-attr="${k}" data-d="1">+</button>
      </div>
      <div class="pip-row">${pips}</div>
    `;
    grid.appendChild(div);
  });
  grid.querySelectorAll('.step-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const k = btn.dataset.attr, d = Number(btn.dataset.d);
      current.attrs[k] = Math.max(1, Math.min(12, current.attrs[k]+d));
      renderAll(); queueSave();
    });
  });

  const c = calc(current);
  const remaining = current.extraAttrPoints - c.attrPointsUsed;
  const budgetEl = document.getElementById('attrBudget');
  budgetEl.className = 'budget-note' + (remaining<0?' warn':'');
  budgetEl.innerHTML = `<span>Pontos extras (criação): ${current.extraAttrPoints}</span><span>Restantes: ${remaining}</span>`;
}

function renderSkills(){
  const body = document.getElementById('skillsBody');
  body.innerHTML = '';
  SKILL_GROUPS.forEach(group=>{
    const title = document.createElement('div');
    title.className = 'skill-group-title';
    title.textContent = group.title;
    body.appendChild(title);
    group.skills.forEach(sk=>{
      body.appendChild(skillRow(sk, group.attr));
    });
  });
  // Combate Armado (coringa)
  const title = document.createElement('div');
  title.className = 'skill-group-title';
  title.textContent = 'Perícia Coringa';
  body.appendChild(title);
  const row = skillRow('Combate Armado', current.combateArmadoAttr, true);
  body.appendChild(row);

  const c = calc(current);
  const remaining = c.periciasDisp - c.periciasUsadas;
  const budgetEl = document.getElementById('skillBudget');
  budgetEl.className = 'budget-note' + (remaining<0?' warn':'');
  budgetEl.innerHTML = `<span>Perícias disponíveis: ${c.periciasDisp}</span><span>Restantes: ${remaining}</span>`;
}

function skillRow(name, attrKey, isJoker){
  const div = document.createElement('div');
  div.className = 'skill-row';
  const val = current.skills[name] || 0;
  const attrVal = current.attrs[attrKey];
  const tier = capTierLabel(val,'skill');
  let attrPicker = `<span class="skill-pool" style="min-width:34px;color:${tier.color}">${attrKey}</span>`;
  if(isJoker){
    attrPicker = `<select class="attr-pick" data-joker="1">
      <option value="FOR" ${attrKey==='FOR'?'selected':''}>FOR</option>
      <option value="DES" ${attrKey==='DES'?'selected':''}>DES</option>
    </select>`;
  }
  div.innerHTML = `
    <span class="skill-name">${name}</span>
    ${attrPicker}
    <span class="skill-pool">${attrVal}d12+${val}</span>
    <button class="roll-btn" title="Rolar ${name}">Roll</button>
    <div class="skill-stepper">
      <button class="skill-step-btn" data-skill="${name}" data-d="-1">−</button>
      <span class="skill-val">${val}</span>
      <button class="skill-step-btn" data-skill="${name}" data-d="1">+</button>
    </div>
  `;
  div.querySelectorAll('.skill-step-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const d = Number(btn.dataset.d);
      current.skills[name] = Math.max(0, Math.min(9,(current.skills[name]||0)+d));
      renderSkills(); renderResources(); queueSave();
    });
  });
  const jokerSel = div.querySelector('[data-joker]');
  if(jokerSel){
    jokerSel.addEventListener('change', (e)=>{
      current.combateArmadoAttr = e.target.value;
      renderSkills(); queueSave();
    });
  }
  div.querySelector('.roll-btn').addEventListener('click', ()=>{
    const currentAttrVal = current.attrs[isJoker ? current.combateArmadoAttr : attrKey];
    const currentSkillVal = current.skills[name] || 0;
    openRollModal(name, currentAttrVal, currentSkillVal);
  });
  return div;
}

function renderResources(){
  const c = calc(current);

  // PV
  document.getElementById('pvArchBonus').value = current.pvArchBonus;
  document.getElementById('pvTalentBonus').value = current.pvTalentBonus;
  document.getElementById('pvCurrent').value = current.pvCurrent;
  document.getElementById('pvMaxTag').textContent = '/ '+c.pvMax;
  const pvPct = c.pvMax>0 ? Math.max(0,Math.min(100,(current.pvCurrent/c.pvMax)*100)) : 0;
  document.getElementById('pvFill').style.width = pvPct+'%';

  // Razão
  document.getElementById('razaoArchBonus').value = current.razaoArchBonus;
  document.getElementById('razaoTalentBonus').value = current.razaoTalentBonus;
  document.getElementById('razaoCurrent').value = current.razaoCurrent;
  document.getElementById('razaoMaxTag').textContent = '/ '+c.razaoMax;
  const razaoPct = c.razaoMax>0 ? Math.max(0,Math.min(100,(current.razaoCurrent/c.razaoMax)*100)) : 0;
  document.getElementById('razaoFill').style.width = razaoPct+'%';

  // Fardo
  document.getElementById('fardoCurrent').value = current.fardoCurrent;
  document.getElementById('fardoMaxTag').textContent = '/ '+c.fardoMax;
  const fardoPct = c.fardoMax>0 ? Math.max(0,Math.min(100,(current.fardoCurrent/c.fardoMax)*100)) : 0;
  document.getElementById('fardoFill').style.width = fardoPct+'%';

  // Defesa
  document.getElementById('defesaBadge').textContent = c.defesa;

  // Sticky bar
  document.getElementById('pvGaugeText').textContent = current.pvCurrent+'/'+c.pvMax;
  document.getElementById('pvGaugeFill').style.width = pvPct+'%';
  document.getElementById('razaoGaugeText').textContent = current.razaoCurrent+'/'+c.razaoMax;
  document.getElementById('razaoGaugeFill').style.width = razaoPct+'%';
  document.getElementById('grauBadge').textContent = 'Grau '+current.grau;

  // XP
  document.getElementById('xpFill').style.width = Math.max(0,Math.min(100,(current.xpAtual/c.xpProximo)*100))+'%';
  document.getElementById('xpNeed').textContent = '/ '+c.xpProximo;
}

function renderBasicInfo(){
  document.getElementById('charName').value = current.name;
  document.getElementById('race').value = current.race;
  document.getElementById('archetype').value = current.archetype;
  document.getElementById('past').value = current.past;
  document.getElementById('grau').value = current.grau;
  document.getElementById('xpAtual').value = current.xpAtual;
}

function renderAll(){
  renderBasicInfo();
  renderAttrs();
  renderSkills();
  renderResources();
}

// ============ EVENTOS: campos simples ============
function bindSimple(id, prop, isNumber){
  document.getElementById(id).addEventListener('input', (e)=>{
    current[prop] = isNumber ? (Number(e.target.value)||0) : e.target.value;
    if(id==='charName'){ syncIndexName(); }
    if(['grau','xpAtual'].includes(id)) renderResources();
    if(id==='grau') document.getElementById('grauBadge').textContent = 'Grau '+current.grau;
    queueSave();
  });
}
['race','archetype','past'].forEach(id=>bindSimple(id,id,false));
bindSimple('grau','grau',true);
bindSimple('xpAtual','xpAtual',true);
bindSimple('charName','name',false);

['pvCurrent','pvArchBonus','pvTalentBonus'].forEach(id=>{
  document.getElementById(id).addEventListener('input', e=>{
    const prop = id==='pvCurrent'?'pvCurrent':id;
    current[prop] = Number(e.target.value)||0;
    renderResources(); queueSave();
  });
});
['razaoCurrent','razaoArchBonus','razaoTalentBonus'].forEach(id=>{
  document.getElementById(id).addEventListener('input', e=>{
    const prop = id==='razaoCurrent'?'razaoCurrent':id;
    current[prop] = Number(e.target.value)||0;
    renderResources(); queueSave();
  });
});
document.getElementById('fardoCurrent').addEventListener('input', e=>{
  current.fardoCurrent = Number(e.target.value)||0;
  renderResources(); queueSave();
});

// ============ PAINEL DE PERSONAGENS ============
const overlay = document.getElementById('overlay');
const panel = document.getElementById('panel');
function openPanel(){ renderCharList(); overlay.classList.add('open'); panel.classList.add('open'); }
function closePanelFn(){ overlay.classList.remove('open'); panel.classList.remove('open'); }
document.getElementById('openMenu').addEventListener('click', openPanel);
document.getElementById('closePanel').addEventListener('click', closePanelFn);
overlay.addEventListener('click', closePanelFn);

function renderCharList(){
  const list = document.getElementById('charList');
  list.innerHTML = '';
  charIndex.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'char-item' + (current && item.id===current.id ? ' active' : '');
    div.innerHTML = `<span class="char-item-name">${item.name || 'Sem nome'}</span><button class="char-item-del" data-id="${item.id}">✕</button>`;
    div.addEventListener('click', (e)=>{
      if(e.target.classList.contains('char-item-del')) return;
      switchCharacter(item.id);
    });
    div.querySelector('.char-item-del').addEventListener('click', async (e)=>{
      e.stopPropagation();
      if(!confirm('Excluir "'+(item.name||'este Caçador')+'"? Essa ação não pode ser desfeita.')) return;
      await deleteCharacter(item.id);
    });
    list.appendChild(div);
  });
}

async function switchCharacter(id){
  const data = await loadCharacter(id);
  if(data){
    current = data;
    // preenche skills novas que possam ter sido adicionadas depois
    SKILL_GROUPS.forEach(g=>g.skills.forEach(s=>{ if(!(s in current.skills)) current.skills[s]=0; }));
    if(!('Combate Armado' in current.skills)) current.skills['Combate Armado']=0;
    await window.storage.set('active-char', id, false);
    renderAll();
    closePanelFn();
  }
}

async function deleteCharacter(id){
  try{ await window.storage.delete('char-data:'+id, false); }catch(e){}
  charIndex = charIndex.filter(c=>c.id!==id);
  await saveIndex();
  if(current && current.id===id){
    if(charIndex.length>0){
      await switchCharacter(charIndex[0].id);
    }else{
      await createNewCharacter();
    }
  }
  renderCharList();
}

async function createNewCharacter(){
  const c = defaultCharacter('Novo Caçador');
  current = c;
  charIndex.push({id:c.id, name:c.name});
  await saveIndex();
  await saveCharacterNow();
  renderAll();
  renderCharList();
  closePanelFn();
}
document.getElementById('newCharBtn').addEventListener('click', createNewCharacter);

function syncIndexName(){
  const entry = charIndex.find(c=>c.id===current.id);
  if(entry){ entry.name = current.name; saveIndex(); }
}

// ============ SISTEMA DE ROLAGEM ============
let lastRoll = null; // {name, attrVal, skillVal}
const SUCCESS_FACE = 6; // face mínima que conta como sucesso

function rollDice(qty){
  const dice = [];
  for(let i=0;i<qty;i++){ dice.push(Math.floor(Math.random()*12)+1); }
  return dice.sort((a,b)=>b-a); // maior pro menor
}

function openRollModal(name, attrVal, skillVal){
  lastRoll = {name, attrVal, skillVal};
  document.getElementById('rollTitle').textContent = name;
  document.getElementById('rollSub').textContent = attrVal+'d12 + '+skillVal+' sucesso(s) garantido(s) · sucesso em '+SUCCESS_FACE+'+';
  performRoll();
  document.getElementById('rollOverlay').classList.add('open');
}

function performRoll(){
  if(!lastRoll) return;
  const {attrVal, skillVal} = lastRoll;
  const dice = rollDice(attrVal);
  const grid = document.getElementById('diceGrid');
  grid.innerHTML = '';
  let successCount = 0;
  dice.forEach(d=>{
    const isSuccess = d >= SUCCESS_FACE;
    const isDouble = d === 12;
    if(isDouble) successCount += 2;
    else if(isSuccess) successCount += 1;
    const el = document.createElement('div');
    el.className = 'die' + (isSuccess ? ' success' : '') + (isDouble ? ' double' : '');
    el.textContent = d;
    if(isDouble){
      const tag = document.createElement('span');
      tag.className = 'die-tag';
      tag.textContent = '×2';
      el.appendChild(tag);
    }
    grid.appendChild(el);
  });
  document.getElementById('rollTotal').textContent = successCount + skillVal;
  document.getElementById('rollBreakdown').textContent =
    successCount+' nos dados (12 conta em dobro) + '+skillVal+' garantido(s)';
}

function closeRollModal(){
  document.getElementById('rollOverlay').classList.remove('open');
}

document.getElementById('rollAgainBtn').addEventListener('click', performRoll);
document.getElementById('rollClose').addEventListener('click', closeRollModal);
document.getElementById('rollOverlay').addEventListener('click', (e)=>{
  if(e.target.id === 'rollOverlay') closeRollModal();
});

// ============ INICIALIZAÇÃO ============
async function init(){
  await loadIndex();
  let activeId = null;
  try{
    const r = await window.storage.get('active-char', false);
    activeId = r ? r.value : null;
  }catch(e){}

  if(activeId && charIndex.find(c=>c.id===activeId)){
    current = await loadCharacter(activeId);
  }else if(charIndex.length>0){
    current = await loadCharacter(charIndex[0].id);
  }

  if(!current){
    current = defaultCharacter('Novo Caçador');
    charIndex = [{id:current.id, name:current.name}];
    await saveIndex();
    await saveCharacterNow();
  }else{
    SKILL_GROUPS.forEach(g=>g.skills.forEach(s=>{ if(!(s in current.skills)) current.skills[s]=0; }));
    if(!('Combate Armado' in current.skills)) current.skills['Combate Armado']=0;
  }

  renderAll();
}
init();