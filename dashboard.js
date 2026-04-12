// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) return;

  // Greeting
  const greetEl = document.getElementById('dashGreeting');
  if (greetEl) greetEl.textContent = `${getGreeting()}, ${user.name.split(' ')[0]}! 👋`;
  const streak = document.getElementById('streakBadge');
  if (streak) streak.textContent = `🔥 ${user.streak || 0}d streak`;

  // Stats
  document.getElementById('scSkills').textContent = (user.skills || []).length;
  document.getElementById('scPoints').textContent = user.totalPoints || 0;
  document.getElementById('scCourses').textContent = (user.courses || []).length;
  document.getElementById('scRank').textContent = '#' + (user.rank || '--');

  // Charts
  renderSkillChart(user);
  renderDonutChart(user);
  renderSkillsList(user);
  renderCoursesList(user);
  renderImprove(user);
});

function renderSkillChart(user) {
  const skills = user.skills || [];
  if (!skills.length) return;
  const ctx = document.getElementById('skillChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: skills.map(s => s.name),
      datasets: [{
        label: 'Proficiency %',
        data: skills.map(s => s.score),
        backgroundColor: skills.map(s => getSkillColor(s.score) + '33'),
        borderColor: skills.map(s => getSkillColor(s.score)),
        borderWidth: 2, borderRadius: 6,
      }]
    },
    options: {
      responsive: true, plugins: { legend: { display: false } },
      scales: {
        y: { min:0, max:100, ticks:{ color:'#8b92b4', callback: v => v+'%' }, grid:{ color:'rgba(255,255,255,0.05)' } },
        x: { ticks:{ color:'#8b92b4' }, grid:{ display:false } }
      }
    }
  });
}

function renderDonutChart(user) {
  const skills = user.skills || [];
  const beg = skills.filter(s => s.score < 40).length;
  const inter = skills.filter(s => s.score >= 40 && s.score < 70).length;
  const adv = skills.filter(s => s.score >= 70).length;
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Beginner', 'Intermediate', 'Advanced'],
      datasets: [{ data: [beg, inter, adv], backgroundColor: ['#ffd54f', '#5b8af5', '#69f0ae'], borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      responsive: true, cutout: '70%',
      plugins: { legend: { position:'bottom', labels:{ color:'#8b92b4', padding:16 } } }
    }
  });
}

function renderSkillsList(user) {
  const el = document.getElementById('skillsList');
  if (!el) return;
  const skills = (user.skills || []).slice(0, 5);
  if (!skills.length) { el.innerHTML = '<p style="color:var(--text2);font-size:.85rem;">No skills yet. <a href="upload.html">Upload your resume →</a></p>'; return; }
  el.innerHTML = skills.map(s => `
    <div class="skill-row-item">
      <div class="sri-header">
        <span class="sri-name">${s.name}</span>
        <div class="sri-meta">
          <span class="level-badge ${getLevel(s.score)}">${getLevel(s.score)}</span>
        </div>
      </div>
      <div class="sri-bar"><div class="sri-fill" style="width:${s.score}%"></div></div>
      <div class="sri-pct">${s.score}%</div>
    </div>
  `).join('');
}

function renderCoursesList(user) {
  const el = document.getElementById('coursesList');
  if (!el) return;
  const courses = (user.courses || []).slice(0, 4);
  if (!courses.length) { el.innerHTML = '<p style="color:var(--text2);font-size:.85rem;">No courses yet. <a href="courses.html">Add a course →</a></p>'; return; }
  el.innerHTML = courses.map(c => `
    <div class="course-item">
      <div class="ci-header">
        <span class="ci-name">${c.name}</span>
        <span class="ci-pct">${c.progress}%</span>
      </div>
      <div class="ci-bar"><div class="ci-fill" style="width:${c.progress}%"></div></div>
      <div class="ci-status">${c.status || 'In Progress'} · ${c.platform || ''}</div>
    </div>
  `).join('');
}

function renderImprove(user) {
  const el = document.getElementById('improveList');
  if (!el) return;
  const skills = user.skills || [];
  const suggestions = [
    { skill:'Data Structures', reason:'Essential for coding interviews. Currently your weakest CS fundamental.', resources:['📘 GeeksForGeeks DSA Course','▶ Abdul Bari on YouTube','🏋 LeetCode Easy Problems'] },
    { skill:'MySQL', reason:'Database skills are required in 80% of backend developer roles.', resources:['📘 MySQL Official Docs','🎓 W3Schools SQL Tutorial','💻 SQLZoo Practice'] },
    { skill:'System Design', reason:'Not yet in your profile — highly valued for internships & placements.', resources:['📘 Designing Data-Intensive Apps','▶ Gaurav Sen on YouTube','🎓 Grokking System Design'] },
    { skill:'React', reason:'Next step after Web Development — most in-demand front-end skill.', resources:['📘 React Official Docs','🎓 Scrimba React Course','💡 Build 5 Projects'] },
  ];
  const lowSkills = skills.filter(s => s.score < 60).map(s => s.name);
  const filtered = suggestions.filter(s => lowSkills.includes(s.skill) || !skills.find(sk => sk.name === s.skill));
  const toShow = filtered.length ? filtered : suggestions;
  el.innerHTML = toShow.map(s => `
    <div class="improve-item">
      <div class="ii-skill">⚡ ${s.skill}</div>
      <div class="ii-reason">${s.reason}</div>
      <div class="ii-resources">
        ${s.resources.map(r => `<div class="ii-resource">${r}</div>`).join('')}
      </div>
    </div>
  `).join('');
}