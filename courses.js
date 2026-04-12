// courses.js
document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  initSidebarUser();
  renderCourses();
});

function renderCourses() {
  const user = getCurrentUser();
  const courses = user.courses || [];
  const el = document.getElementById('courseGrid');
  if (!courses.length) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius)">
        <div style="font-size:3rem;margin-bottom:16px">📚</div>
        <h3 style="margin-bottom:8px">No courses yet</h3>
        <p style="color:var(--text2);margin-bottom:24px">Track your learning progress by adding courses.</p>
        <button class="cta-primary" onclick="showAddCourseModal()" style="border:none;cursor:pointer">Add First Course →</button>
      </div>`;
    return;
  }
  el.innerHTML = courses.map((c, i) => {
    const pct = c.progress || 0;
    const statusColor = pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--accent1)' : 'var(--text2)';
    return `
      <div class="course-card">
        <div class="cc-top">
          <div>
            <div class="cc-name">${c.name}</div>
            <div class="cc-platform">📺 ${c.platform || 'Self-Study'}</div>
          </div>
          <div class="cc-pct-big">${pct}%</div>
        </div>
        <div class="cc-bar"><div class="cc-fill" style="width:${pct}%"></div></div>
        <div class="cc-footer">
          <span class="cc-status" style="color:${statusColor}">${pct===100?'✅ Completed':pct>0?'⏳ '+c.status:'🔵 Not Started'}</span>
          <div style="display:flex;gap:8px">
            <button class="cc-update-btn" onclick="updateCourse(${i})">Update %</button>
            <button class="cc-update-btn" style="color:var(--danger)" onclick="deleteCourse(${i})">✕</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function showAddCourseModal() { document.getElementById('addCourseModal').style.display='flex'; }
function closeCourseModal() { document.getElementById('addCourseModal').style.display='none'; }

function addCourse() {
  const name = document.getElementById('newCourseName').value.trim();
  const platform = document.getElementById('newCoursePlatform').value;
  const progress = parseInt(document.getElementById('newCourseProgress').value);
  if (!name) { alert('Please enter course name.'); return; }

  const user = getCurrentUser();
  user.courses = user.courses || [];
  user.courses.push({ name, platform, progress, status: progress===100?'Completed':'In Progress' });
  user.totalPoints = (user.totalPoints || 0) + 30;
  saveCurrentUser(user);
  closeCourseModal();
  document.getElementById('newCourseName').value='';
  renderCourses();
}

function updateCourse(idx) {
  const val = prompt('Update progress (0–100):', '');
  if (val===null) return;
  const pct = Math.max(0, Math.min(100, parseInt(val)||0));
  const user = getCurrentUser();
  user.courses[idx].progress = pct;
  user.courses[idx].status = pct===100 ? 'Completed' : 'In Progress';
  if (pct===100) user.totalPoints = (user.totalPoints||0)+100;
  saveCurrentUser(user);
  renderCourses();
}

function deleteCourse(idx) {
  if (!confirm('Remove this course?')) return;
  const user = getCurrentUser();
  user.courses.splice(idx,1);
  saveCurrentUser(user);
  renderCourses();
}