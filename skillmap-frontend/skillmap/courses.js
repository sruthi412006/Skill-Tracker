let courseStatusFilter='all';
document.addEventListener('DOMContentLoaded',async()=>{ requireAuth(); initSidebarUser(); await applyCourseFilters(); renderCourseInsight(); });

async function applyCourseFilters(){
  const q=(document.getElementById('courseSearch').value||'').toLowerCase();
  const plat=document.getElementById('platformFilter').value;
  let courses=[];
  try {
    if(getToken()){
      const res=await CourseAPI.getAll(courseStatusFilter,q);
      if(res&&res.success) courses=res.data||[];
    }
  } catch(e){}
  if(!courses.length){
    const user=getCurrentUser();
    courses=(user.courses||[]).map(normalizeCourse);
  }
  const filtered=courses.filter(c=>{
    const matchQ=!q||c.name.toLowerCase().includes(q)||(c.platform||'').toLowerCase().includes(q);
    const matchS=courseStatusFilter==='all'||getStatusStr(c)===courseStatusFilter;
    const matchP=plat==='all'||c.platform===plat;
    return matchQ&&matchS&&matchP;
  });
  renderCourseGrid(filtered);
}

function normalizeCourse(c){
  return { id:c.id,name:c.name,platform:c.platform,progressPercent:c.progress||c.progressPercent||0,status:c.status||'IN_PROGRESS' };
}
function getStatusStr(c){
  const s=c.status||'';
  if(s==='COMPLETED'||s==='Completed'||c.progressPercent===100||c.progress===100) return 'COMPLETED';
  if(s==='NOT_STARTED'||s==='Not Started'||(c.progressPercent===0&&c.progress===0)) return 'NOT_STARTED';
  return 'IN_PROGRESS';
}

function setCourseStatus(s,btn){
  courseStatusFilter=s;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); applyCourseFilters();
}

async function renderCourseInsight(){
  const user=getCurrentUser();
  const courses=user.courses||[];
  const completed=courses.filter(c=>c.progress===100||c.progressPercent===100||c.status==='COMPLETED'||c.status==='Completed').length;
  const el=document.getElementById('courseInsight');
  if(completed>0){ el.style.display='block';
    el.textContent=completed>=5?`🎉 Amazing! You've completed ${completed} courses!`:`📚 ${completed} completed. Complete 2 more for next milestone!`;
  }
}

function renderCourseGrid(courses){
  const el=document.getElementById('courseGrid');
  if(!courses.length){
    el.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:60px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius)">
      <div style="font-size:3rem;margin-bottom:16px">📚</div><h3 style="margin-bottom:8px">No courses found</h3>
      <p style="color:var(--text2);margin-bottom:24px">Add courses to track your learning.</p>
      <button class="cta-primary" onclick="showAddCourseModal()" style="border:none;cursor:pointer">Add First Course →</button>
    </div>`; return;
  }
  el.innerHTML=courses.map((c,i)=>{
    const pct=c.progressPercent||c.progress||0;
    const status=getStatusStr(c);
    const statusColor=status==='COMPLETED'?'var(--success)':status==='IN_PROGRESS'?'var(--accent1)':'var(--text2)';
    const statusIcon=status==='COMPLETED'?'✅':status==='IN_PROGRESS'?'⏳':'🔵';
    const statusLabel=status.replace(/_/g,' ');
    return `<div class="course-card">
      <div class="cc-top">
        <div><div class="cc-name">${c.name}</div><div class="cc-platform">📺 ${c.platform||'Self-Study'}</div></div>
        <div class="cc-pct-big">${pct}%</div>
      </div>
      <div class="cc-bar"><div class="cc-fill" style="width:${pct}%"></div></div>
      <div class="cc-footer">
        <span class="cc-status" style="color:${statusColor}">${statusIcon} ${statusLabel}</span>
        <div style="display:flex;gap:8px">
          <button class="cc-update-btn" onclick="updateCourse(${c.id||i},'${c.name}')">Update %</button>
          <button class="cc-update-btn" style="color:var(--danger)" onclick="deleteCourse(${c.id||i},'${c.name}')">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function showAddCourseModal(){ document.getElementById('addCourseModal').style.display='flex'; }
function closeCourseModal(){ document.getElementById('addCourseModal').style.display='none'; }

async function addCourse(){
  const name=document.getElementById('newCourseName').value.trim();
  const platform=document.getElementById('newCoursePlatform').value;
  const progress=parseInt(document.getElementById('newCourseProgress').value);
  if(!name){ alert('Enter course name.'); return; }
  try {
    if(getToken()){
      const res=await CourseAPI.add({name,platform,progressPercent:progress});
      if(res&&res.success){ closeCourseModal(); document.getElementById('newCourseName').value=''; await applyCourseFilters(); return; }
    }
  } catch(e){}
  // local fallback
  const user=getCurrentUser();
  user.courses=user.courses||[];
  user.courses.push({name,platform,progress,progressPercent:progress,status:progress===100?'COMPLETED':'IN_PROGRESS'});
  user.totalPoints=(user.totalPoints||0)+30+(progress===100?100:0);
  saveCurrentUser(user); closeCourseModal(); document.getElementById('newCourseName').value='';
  applyCourseFilters();
}

async function updateCourse(id,name){
  const val=prompt(`Update progress for "${name}" (0–100):`,'');
  if(val===null) return;
  const pct=Math.max(0,Math.min(100,parseInt(val)||0));
  try {
    if(getToken()&&id){ await CourseAPI.update(id,{progressPercent:pct}); await applyCourseFilters(); return; }
  } catch(e){}
  const user=getCurrentUser();
  const c=user.courses.find(x=>x.name===name);
  if(c){c.progress=pct;c.progressPercent=pct;c.status=pct===100?'COMPLETED':'IN_PROGRESS';}
  saveCurrentUser(user); applyCourseFilters();
}

async function deleteCourse(id,name){
  if(!confirm(`Remove "${name}"?`)) return;
  try {
    if(getToken()&&id){ await CourseAPI.delete(id); await applyCourseFilters(); return; }
  } catch(e){}
  const user=getCurrentUser();
  user.courses=user.courses.filter(c=>c.name!==name);
  saveCurrentUser(user); applyCourseFilters();
}
