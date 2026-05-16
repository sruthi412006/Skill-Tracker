// dashboard.js — works with real backend API + localStorage fallback
document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser(); if (!user) return;

  const greetEl = document.getElementById('dashGreeting');
  if (greetEl) greetEl.textContent = `${getGreeting()}, ${(user.fullName||user.name||'Student').split(' ')[0]}! 👋`;
  const streakEl = document.getElementById('streakBadge');
  if (streakEl) streakEl.textContent = `🔥 ${user.streakDays||user.streak||0}d streak`;

  // Try real backend first
  let dash = null;
  try {
    if (getToken()) {
      const res = await UserAPI.getDashboard();
      if (res && res.success) dash = res.data;
    }
  } catch(e) { console.log('Backend offline, using local data'); }

  if (dash) {
    renderFromBackend(dash);
  } else {
    renderFromLocal(user);
  }
});

function renderFromBackend(dash) {
  setText('scSkills', dash.totalSkills || 0);
  setText('scCompleted', dash.completedCourses || 0);
  setText('scOngoing', dash.ongoingCourses || 0);
  setText('scProgress', (dash.overallProgress || 0) + '%');
  setText('scRank', '#' + (dash.leaderboardRank || '--'));

  // Resume banner
  if (dash.resumeStrength > 0) {
    showResumeBanner(dash.resumeStrength);
  }

  // Insight
  if (dash.insightMessage) {
    const ib = document.getElementById('insightBanner');
    ib.style.display = 'block'; ib.textContent = dash.insightMessage;
  }

  // Analysis row
  if (dash.topSkills && dash.topSkills.length) {
    showAnalysisRow(dash.topSkills, dash.weakSkills);
  }

  renderSkillChart(dash.topSkills || []);
  renderDonutChart(dash.levelDistribution || {});
  renderSkillsListFromDtos(dash.topSkills || []);
  renderCoursesListFromDtos(dash.recentCourses || []);
  renderAchievementsFromUser(getCurrentUser());
  renderRecsFromSkills(dash.topSkills || []);
}

function renderFromLocal(user) {
  const skills = user.skills || [];
  const courses = user.courses || [];
  const completed = courses.filter(c=>c.progress===100||c.progressPercent===100||c.status==='COMPLETED'||c.status==='Completed').length;
  const ongoing = courses.filter(c=>(c.progress>0&&c.progress<100)||(c.progressPercent>0&&c.progressPercent<100)||c.status==='IN_PROGRESS'||c.status==='In Progress').length;
  const avgScore = skills.length ? Math.round(skills.reduce((a,b)=>a+(b.score||b.proficiencyScore||0),0)/skills.length) : 0;

  setText('scSkills', skills.length);
  setText('scCompleted', completed);
  setText('scOngoing', ongoing);
  setText('scProgress', avgScore + '%');
  setText('scRank', '#' + (user.rank || user.leaderboardRank || '--'));

  if (user.resumeAnalyzed && skills.length) {
    const strength = Math.min(95, Math.round(skills.length*5 + (user.certificates||[]).length*8 + (user.projects||[]).length*4));
    showResumeBanner(strength);
  }

  if (skills.length) {
    const top = skills.reduce((a,b)=>(b.score||b.proficiencyScore||0)>(a.score||a.proficiencyScore||0)?b:a);
    const toAdv = skills.filter(s=>(s.score||s.proficiencyScore||0)>=50&&(s.score||s.proficiencyScore||0)<70).length;
    const ib = document.getElementById('insightBanner');
    ib.style.display='block';
    ib.textContent = toAdv>0 ? `📈 You are ${toAdv} skill(s) away from Advanced level!`
      : `🚀 Improving fast in ${top.name}! Keep going.`;
  }

  if (skills.length) showAnalysisRow(skills.map(normalizeSkill), skills.filter(s=>(s.score||s.proficiencyScore)<40).map(normalizeSkill));
  renderSkillChart(skills.map(normalizeSkill));
  const dist = { BEGINNER:0, INTERMEDIATE:0, ADVANCED:0 };
  skills.forEach(s => { const l = getLevel(s.score||s.proficiencyScore||0); dist[l]++; });
  renderDonutChart(dist);
  renderSkillsListFromDtos(skills.slice(0,5).map(normalizeSkill));
  renderCoursesListFromDtos(courses.slice(0,4).map(normalizeCourse));
  renderAchievementsFromUser(user);
  renderRecsFromSkills(skills.map(normalizeSkill));
}

function normalizeSkill(s) {
  return { name: s.name, category: s.category, proficiencyScore: s.score||s.proficiencyScore||0, level: getLevel(s.score||s.proficiencyScore||0) };
}
function normalizeCourse(c) {
  return { name: c.name, platform: c.platform, progressPercent: c.progress||c.progressPercent||0, status: c.status||'IN_PROGRESS' };
}

function showResumeBanner(strength) {
  const banner = document.getElementById('resumeBanner');
  banner.style.display = 'flex';
  document.getElementById('rbFill').style.width = strength + '%';
  document.getElementById('rbScore').textContent = strength + '%';
  const msg = strength>=75 ? '🔥 Strong resume! Keep adding projects.' : strength>=50 ? '👍 Good — add more skills & certs.' : '⚡ Upload a detailed resume for better score.';
  document.getElementById('rbSub').textContent = msg;
}

function showAnalysisRow(skills, weakSkills) {
  document.getElementById('analysisRow').style.display = 'grid';
  const strong = skills.filter(s=>(s.proficiencyScore||s.score||0)>=65);
  const warn = skills.filter(s=>{const sc=s.proficiencyScore||s.score||0; return sc>=35&&sc<65;});
  const missing = (weakSkills||[]).concat(skills.filter(s=>(s.proficiencyScore||s.score||0)<35));
  renderAnalysisTags('strongSkills', strong, '#69f0ae', 'rgba(76,175,80,.12)');
  renderAnalysisTags('warnSkills', warn, '#ffd54f', 'rgba(255,193,7,.12)');
  renderAnalysisTags('missingSkills', missing.slice(0,4), '#ef9a9a', 'rgba(244,67,54,.12)');
  if (!missing.length) document.getElementById('missingSkills').innerHTML='<span style="font-size:.82rem;color:var(--text2)">None detected! 🎉</span>';
}

function renderAnalysisTags(id, skills, color, bg) {
  const el = document.getElementById(id); if(!el) return;
  if (!skills.length) { el.innerHTML='<span style="font-size:.78rem;color:var(--text2)">None</span>'; return; }
  el.innerHTML = skills.map(s=>`<span class="analysis-tag" style="color:${color};background:${bg}">${s.name} · ${s.proficiencyScore||s.score||0}%</span>`).join('');
}

function renderSkillChart(skills) {
  const ctx = document.getElementById('skillChart'); if(!ctx||!skills.length) return;
  new Chart(ctx, {
    type:'bar',
    data:{
      labels: skills.slice(0,8).map(s=>s.name),
      datasets:[{ label:'Proficiency %', data: skills.slice(0,8).map(s=>s.proficiencyScore||s.score||0),
        backgroundColor: skills.slice(0,8).map(s=>getSkillColor(s.proficiencyScore||s.score||0)+'33'),
        borderColor: skills.slice(0,8).map(s=>getSkillColor(s.proficiencyScore||s.score||0)),
        borderWidth:2, borderRadius:6 }]
    },
    options:{ responsive:true, plugins:{legend:{display:false}},
      scales:{ y:{min:0,max:100,ticks:{color:'#8b92b4',callback:v=>v+'%'},grid:{color:'rgba(128,128,128,0.08)'}},
               x:{ticks:{color:'#8b92b4'},grid:{display:false}} } }
  });
}

function renderDonutChart(dist) {
  const ctx = document.getElementById('donutChart'); if(!ctx) return;
  const beg = dist.BEGINNER||0, inter = dist.INTERMEDIATE||0, adv = dist.ADVANCED||0;
  new Chart(ctx, {
    type:'doughnut',
    data:{ labels:['Beginner','Intermediate','Advanced'],
      datasets:[{data:[beg,inter,adv],backgroundColor:['#ffd54f','#5b8af5','#69f0ae'],borderWidth:0,hoverOffset:6}] },
    options:{ responsive:true, cutout:'70%', plugins:{legend:{position:'bottom',labels:{color:'#8b92b4',padding:16}}} }
  });
}

function renderSkillsListFromDtos(skills) {
  const el = document.getElementById('skillsList'); if(!el) return;
  if (!skills.length) { el.innerHTML='<p style="color:var(--text2);font-size:.85rem">No skills yet. <a href="upload.html">Upload resume →</a></p>'; return; }
  el.innerHTML = skills.map(s=>`
    <div class="skill-row-item">
      <div class="sri-header"><span class="sri-name">${s.name}</span>
        <span class="level-badge ${s.level||getLevel(s.proficiencyScore||0)}">${s.level||getLevel(s.proficiencyScore||0)}</span></div>
      <div class="sri-bar"><div class="sri-fill" style="width:${s.proficiencyScore||s.score||0}%;background:${getSkillColor(s.proficiencyScore||s.score||0)}"></div></div>
      <div class="sri-pct">${s.proficiencyScore||s.score||0}%</div>
    </div>`).join('');
}

function renderCoursesListFromDtos(courses) {
  const el = document.getElementById('coursesList'); if(!el) return;
  if (!courses.length) { el.innerHTML='<p style="color:var(--text2);font-size:.85rem">No courses. <a href="courses.html">Add course →</a></p>'; return; }
  el.innerHTML = courses.map(c=>`
    <div class="course-item">
      <div class="ci-header"><span class="ci-name">${c.name}</span><span class="ci-pct">${c.progressPercent||c.progress||0}%</span></div>
      <div class="ci-bar"><div class="ci-fill" style="width:${c.progressPercent||c.progress||0}%"></div></div>
      <div class="ci-status">${(c.status||'').replace(/_/g,' ')} · ${c.platform||''}</div>
    </div>`).join('');
}

function renderAchievementsFromUser(user) {
  const el = document.getElementById('achievementsList'); if(!el) return;
  const badges = computeAchievements(user);
  if (!badges.length) { el.innerHTML='<p style="color:var(--text2);font-size:.85rem">Complete activities to earn badges!</p>'; return; }
  el.innerHTML = badges.map(b=>`
    <div class="achievement-badge ${b.unlocked?'unlocked':'locked'}">
      <div class="ab-icon">${b.icon}</div>
      <div><div class="ab-text">${b.text}</div><div class="ab-sub">${b.sub}</div></div>
    </div>`).join('');
}

const SKILL_RECS = {
  'Java':'Spring Boot','Web Development':'React','Data Structures':'Algorithms','MySQL':'System Design',
  'JavaScript':'Node.js','HTML & CSS':'Tailwind CSS','Git':'CI/CD','Python':'Machine Learning','React':'Next.js'
};
const REC_REASONS = {
  'Spring Boot':'Java developers need Spring Boot for backend/REST APIs.',
  'React':'Most demanded front-end library. Completes your web dev path.',
  'Algorithms':'DSA + Algorithms is the combo to crack coding interviews.',
  'System Design':'Critical for placements and senior developer roles.',
  'Node.js':'Extends JavaScript to backend — full-stack development.',
  'Tailwind CSS':'Speeds up styling dramatically with React projects.',
  'CI/CD':'Automate testing and deployment — industry standard.',
  'Machine Learning':'Python + ML opens AI career paths.',
  'Next.js':'React + SSR = production-grade web apps.'
};

function renderRecsFromSkills(skills) {
  const el = document.getElementById('improveList'); if(!el) return;
  const recs = skills.slice(0,4).map(s=>{
    const next = SKILL_RECS[s.name] || 'System Design';
    return { skill:next, reason:`Because you know ${s.name} — ${REC_REASONS[next]||'High demand skill.'}`,
      resources:['📘 Official Docs','▶ YouTube Tutorials','💻 Build a project'] };
  });
  if (!recs.length) { el.innerHTML='<p style="color:var(--text2);font-size:.85rem">Upload resume for personalized recommendations.</p>'; return; }
  el.innerHTML = recs.map(r=>`
    <div class="improve-item">
      <div class="ii-skill">⚡ Learn: ${r.skill}</div>
      <div class="ii-reason">${r.reason}</div>
      <div class="ii-resources">${r.resources.map(x=>`<div class="ii-resource">${x}</div>`).join('')}</div>
    </div>`).join('');
}

function setText(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }
