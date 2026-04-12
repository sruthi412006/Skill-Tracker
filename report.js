// report.js
document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  initSidebarUser();
  renderReport();
});

function renderReport() {
  const user = getCurrentUser();
  const skills = user.skills || [];
  const avgScore = skills.length ? Math.round(skills.reduce((a,b) => a+b.score,0)/skills.length) : 0;
  const overallLevel = avgScore >= 65 ? 'Advanced' : avgScore >= 40 ? 'Intermediate' : 'Beginner';
  const date = new Date().toLocaleDateString('en-IN', {year:'numeric',month:'long',day:'numeric'});
  const levelColor = overallLevel==='Advanced'?'#69f0ae':overallLevel==='Intermediate'?'#5b8af5':'#ffd54f';

  const el = document.getElementById('reportContent');
  if (!el) return;

  el.innerHTML = `
    <div class="report-header-card">
      <div class="rh-top">
        <div>
          <div class="rh-name">${user.name || 'Student'}</div>
          <div class="rh-college">${user.college || 'College'} · ${user.year||''}</div>
          <div class="rh-date">Report generated: ${date}</div>
        </div>
        <div style="text-align:center">
          <div class="rh-overall" style="color:${levelColor}">${avgScore}%</div>
          <div class="rh-level">Overall Proficiency</div>
          <div style="margin-top:8px"><span class="level-badge ${overallLevel}" style="font-size:.85rem;padding:4px 14px">${overallLevel}</span></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:20px;padding-top:20px;border-top:1px solid var(--border)">
        <div style="text-align:center"><div style="font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800">${skills.length}</div><div style="font-size:.78rem;color:var(--text2)">Skills Tracked</div></div>
        <div style="text-align:center"><div style="font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800">${(user.courses||[]).length}</div><div style="font-size:.78rem;color:var(--text2)">Courses</div></div>
        <div style="text-align:center"><div style="font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800">${(user.certificates||[]).length}</div><div style="font-size:.78rem;color:var(--text2)">Certifications</div></div>
        <div style="text-align:center"><div style="font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800">${user.totalPoints||0}</div><div style="font-size:.78rem;color:var(--text2)">Total Points</div></div>
      </div>
    </div>

    <div class="report-section">
      <h3>🛠 Skill Proficiency Breakdown</h3>
      ${skills.length ? skills.map(s => {
        const color = getSkillColor(s.score);
        return `
          <div class="report-skill-row">
            <div class="rs-name">${s.name}<div style="font-size:.72rem;color:var(--text2)">${s.category||''}</div></div>
            <div class="rs-bar"><div class="rs-fill" style="width:${s.score}%;background:${color}"></div></div>
            <div class="rs-pct">${s.score}%</div>
            <span class="level-badge ${getLevel(s.score)}">${getLevel(s.score)}</span>
          </div>`;
      }).join('') : '<p style="color:var(--text2)">No skills recorded. Upload your resume to analyze.</p>'}
    </div>

    ${(user.courses||[]).length ? `
    <div class="report-section">
      <h3>📚 Course Progress</h3>
      ${user.courses.map(c => `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-weight:600;font-size:.88rem">${c.name}</span>
            <span style="color:var(--accent1);font-weight:700">${c.progress}%</span>
          </div>
          <div style="height:8px;background:var(--bg3);border-radius:4px;overflow:hidden">
            <div style="width:${c.progress}%;height:100%;background:linear-gradient(90deg,var(--accent2),var(--accent1));border-radius:4px"></div>
          </div>
          <div style="font-size:.72rem;color:var(--text2);margin-top:4px">${c.platform||''} · ${c.status||'In Progress'}</div>
        </div>
      `).join('')}
    </div>` : ''}

    ${(user.certificates||[]).length ? `
    <div class="report-section">
      <h3>📜 Certifications</h3>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        ${user.certificates.map(c => `<span class="ar-tag">📜 ${c}</span>`).join('')}
      </div>
    </div>` : ''}

    ${(user.projects||[]).length ? `
    <div class="report-section">
      <h3>💼 Projects</h3>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        ${user.projects.map(p => `<span class="ar-tag">💻 ${p}</span>`).join('')}
      </div>
    </div>` : ''}

    <div class="report-section">
      <h3>🎯 Recommendations</h3>
      ${generateRecommendations(skills).map(r => `
        <div style="padding:14px;background:var(--bg3);border-radius:8px;margin-bottom:10px;border-left:3px solid var(--accent1)">
          <div style="font-weight:700;margin-bottom:4px">${r.title}</div>
          <div style="font-size:.83rem;color:var(--text2)">${r.desc}</div>
        </div>
      `).join('')}
    </div>`;
}

function generateRecommendations(skills) {
  const recs = [];
  const weak = skills.filter(s => s.score < 50);
  const mid = skills.filter(s => s.score >= 50 && s.score < 70);
  if (weak.length) recs.push({ title:`Focus on: ${weak[0].name}`, desc:`Your ${weak[0].name} score is ${weak[0].score}%. Dedicate 30 mins/day to reach Intermediate level.` });
  if (mid.length) recs.push({ title:`Level up: ${mid[0].name}`, desc:`You're close to Advanced in ${mid[0].name} (${mid[0].score}%). Push to 70%+ through projects.` });
  if (!skills.find(s=>s.name==='React')) recs.push({ title:'Add React to your skillset', desc:'React is the #1 demanded front-end skill. Start with official docs and build 2 small projects.' });
  if (!skills.find(s=>s.name==='System Design')) recs.push({ title:'Learn System Design', desc:'Critical for campus placements and internships. Start with Gaurav Sen\'s YouTube series.' });
  recs.push({ title:'Build a GitHub Portfolio', desc:'Upload all your projects to GitHub with good READMEs. Recruiters actively look at GitHub profiles.' });
  return recs;
}

function downloadReport() {
  const user = getCurrentUser();
  alert(`📥 Report download for ${user.name} would start here.\n\nIn production, this would generate a PDF using libraries like jsPDF or a backend service.`);
}