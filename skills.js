// skills.js
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  initSidebarUser();
  renderSkills();
});

function renderSkills() {
  const user = getCurrentUser();
  const skills = user.skills || [];
  const filtered = currentFilter === 'all' ? skills : skills.filter(s => getLevel(s.score) === currentFilter);
  const el = document.getElementById('skillsGrid');

  if (!skills.length) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius)">
        <div style="font-size:3rem;margin-bottom:16px">🛠</div>
        <h3 style="margin-bottom:8px">No skills tracked yet</h3>
        <p style="color:var(--text2);margin-bottom:24px">Upload your resume for instant AI analysis, or add skills manually.</p>
        <a href="upload.html" class="cta-primary" style="display:inline-block">Upload Resume →</a>
      </div>`;
    return;
  }
  if (!filtered.length) {
    el.innerHTML = `<div style="grid-column:1/-1;color:var(--text2);text-align:center;padding:40px">No ${currentFilter} skills found.</div>`;
    return;
  }

  el.innerHTML = filtered.map(s => {
    const level = getLevel(s.score);
    const color = getSkillColor(s.score);
    return `
      <div class="skill-card">
        <div class="sc-top">
          <div>
            <div class="sc-name">${s.name}</div>
            <div class="sc-category">${s.category || 'General'}</div>
          </div>
          <span class="level-badge ${level}">${level}</span>
        </div>
        <div class="sc-bar-wrap">
          <div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--text2);margin-bottom:6px">
            <span>Proficiency</span><span style="color:${color};font-weight:700">${s.score}%</span>
          </div>
          <div class="sc-bar"><div class="sc-fill" style="width:${s.score}%;background:${color}"></div></div>
        </div>
        <div class="sc-footer">
          <span class="sc-score">Progress Level: ${level}</span>
          <div class="sc-actions">
            <button class="sc-action-btn" onclick="updateSkillScore('${s.name}')">Update</button>
            <button class="sc-action-btn" style="color:var(--danger)" onclick="deleteSkill('${s.name}')">✕</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function filterSkills(level, btn) {
  currentFilter = level;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSkills();
}

function showAddSkillModal() {
  document.getElementById('addSkillModal').style.display = 'flex';
}
function closeModal() {
  document.getElementById('addSkillModal').style.display = 'none';
}

function addSkill() {
  const name = document.getElementById('newSkillName').value.trim();
  const cat = document.getElementById('newSkillCat').value;
  const score = parseInt(document.getElementById('newSkillScore').value);
  if (!name) { alert('Please enter a skill name.'); return; }

  const user = getCurrentUser();
  user.skills = user.skills || [];
  if (user.skills.find(s => s.name.toLowerCase() === name.toLowerCase())) {
    alert('This skill is already in your list.'); return;
  }
  user.skills.push({ name, category: cat, score, level: getLevel(score) });
  user.totalPoints = (user.totalPoints || 0) + 50;
  saveCurrentUser(user);
  closeModal();
  document.getElementById('newSkillName').value = '';
  renderSkills();
}

function updateSkillScore(skillName) {
  const newScore = prompt(`Update proficiency for "${skillName}" (0–100):`, '');
  if (newScore === null) return;
  const score = Math.max(0, Math.min(100, parseInt(newScore) || 0));
  const user = getCurrentUser();
  const skill = user.skills.find(s => s.name === skillName);
  if (skill) { skill.score = score; skill.level = getLevel(score); }
  saveCurrentUser(user);
  renderSkills();
}

function deleteSkill(skillName) {
  if (!confirm(`Remove "${skillName}" from your skills?`)) return;
  const user = getCurrentUser();
  user.skills = user.skills.filter(s => s.name !== skillName);
  saveCurrentUser(user);
  renderSkills();
}