let levelFilter='all';
document.addEventListener('DOMContentLoaded', async ()=>{ requireAuth(); initSidebarUser(); await loadAndRender(); renderWeakAlert(); });

async function loadAndRender() {
  try {
    if(getToken()) {
      const res = await SkillAPI.getAll();
      if(res&&res.success) { renderSkillsGrid(res.data||[]); return; }
    }
  } catch(e){}
  // fallback
  const user=getCurrentUser(); applyFilters(user.skills||[]);
}

function renderWeakAlert() {
  const user=getCurrentUser();
  const skills=user.skills||[];
  const weak=skills.filter(s=>(s.score||s.proficiencyScore||0)<40);
  if(!weak.length) return;
  const el=document.getElementById('weakAreaAlert');
  el.style.display='block';
  el.innerHTML=`⚠️ <strong>Weak Area Detected:</strong> ${weak.map(s=>s.name+' ('+(s.score||s.proficiencyScore)+'%)').join(', ')} — Focus here to level up!`;
}

async function applyFilters() {
  const q=(document.getElementById('skillSearch').value||'').toLowerCase();
  const cat=document.getElementById('catFilter').value;
  let skills=[];
  try {
    if(getToken()) {
      const res=await SkillAPI.getAll(levelFilter,q);
      if(res&&res.success) skills=res.data||[];
    }
  } catch(e){}
  if(!skills.length) {
    const user=getCurrentUser();
    skills=(user.skills||[]).map(normalizeSkill);
  }
  const filtered=skills.filter(s=>{
    const matchQ=!q||s.name.toLowerCase().includes(q)||(s.category||'').toLowerCase().includes(q);
    const matchL=levelFilter==='all'||(s.level||getLevel(s.proficiencyScore||0))===levelFilter;
    const matchC=cat==='all'||s.category===cat;
    return matchQ&&matchL&&matchC;
  });
  renderSkillsGrid(filtered);
}

function normalizeSkill(s){
  return { id:s.id, name:s.name, category:s.category, proficiencyScore:s.score||s.proficiencyScore||0, level:s.level||getLevel(s.score||s.proficiencyScore||0), source:s.source||'MANUAL' };
}

function setLevelFilter(level,btn){
  levelFilter=level;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function renderSkillsGrid(skills){
  const el=document.getElementById('skillsGrid');
  const nm=document.getElementById('noSkillsMsg');
  if(!skills.length){
    el.innerHTML=''; nm.style.display='block'; return;
  }
  nm.style.display='none';
  el.innerHTML=skills.map(s=>{
    const score=s.proficiencyScore||s.score||0;
    const level=s.level||getLevel(score);
    const color=getSkillColor(score);
    const tip=level==='BEGINNER'||level==='Beginner'?'⚡ Needs attention':level==='INTERMEDIATE'||level==='Intermediate'?'👍 Good progress':'🏆 Excellent!';
    return `<div class="skill-card">
      <div class="sc-top">
        <div><div class="sc-name">${s.name}</div><div class="sc-category">${s.category||'General'}</div></div>
        <span class="level-badge ${level}">${level.charAt(0)+level.slice(1).toLowerCase()}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--text2);margin-bottom:6px">
        <span>Proficiency</span><span style="color:${color};font-weight:700">${score}%</span>
      </div>
      <div class="sc-bar"><div class="sc-fill" style="width:${score}%;background:${color}"></div></div>
      <div style="margin-top:6px;font-size:.75rem;color:var(--text2)">${tip}</div>
      <div class="sc-footer">
        <span class="sc-score">${score}/100</span>
        <div class="sc-actions">
          <button class="sc-action-btn" onclick="updateSkill(${s.id||0},'${s.name}')">✏ Update</button>
          <button class="sc-action-btn" style="color:var(--danger)" onclick="deleteSkill(${s.id||0},'${s.name}')">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function showAddSkillModal(){ document.getElementById('addSkillModal').style.display='flex'; }
function closeModal(){ document.getElementById('addSkillModal').style.display='none'; }

async function addSkill(){
  const name=document.getElementById('newSkillName').value.trim();
  const cat=document.getElementById('newSkillCat').value;
  const score=parseInt(document.getElementById('newSkillScore').value);
  if(!name){ alert('Enter a skill name.'); return; }

  try {
    if(getToken()){
      const res=await SkillAPI.add({name,category:cat,proficiencyScore:score});
      if(res&&res.success){ closeModal(); document.getElementById('newSkillName').value=''; await applyFilters(); return; }
    }
  } catch(e){}
  // local fallback
  const user=getCurrentUser();
  user.skills=user.skills||[];
  if(user.skills.find(s=>s.name.toLowerCase()===name.toLowerCase())){alert('Already exists.');return;}
  user.skills.push({name,category:cat,score,proficiencyScore:score,level:getLevel(score)});
  user.totalPoints=(user.totalPoints||0)+50;
  saveCurrentUser(user);
  closeModal(); document.getElementById('newSkillName').value='';
  applyFilters();
}

async function updateSkill(id, skillName){
  const val=prompt(`Update proficiency for "${skillName}" (0–100):`,'');
  if(val===null) return;
  const score=Math.max(0,Math.min(100,parseInt(val)||0));
  try {
    if(getToken()&&id){
      await SkillAPI.update(id,{proficiencyScore:score}); await applyFilters(); return;
    }
  } catch(e){}
  const user=getCurrentUser();
  const sk=user.skills.find(s=>s.name===skillName);
  if(sk){sk.score=score;sk.proficiencyScore=score;sk.level=getLevel(score);}
  saveCurrentUser(user); applyFilters();
}

async function deleteSkill(id, skillName){
  if(!confirm(`Remove "${skillName}"?`)) return;
  try {
    if(getToken()&&id){ await SkillAPI.delete(id); await applyFilters(); return; }
  } catch(e){}
  const user=getCurrentUser();
  user.skills=user.skills.filter(s=>s.name!==skillName);
  saveCurrentUser(user); applyFilters();
}
