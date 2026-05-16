// ============================================================
// SKILLMAP — CORE APP.JS
// ============================================================

/* ---- THEME ---- */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('skillmap_theme', theme);
  const isDark = theme === 'dark';
  // Update all theme icons
  document.querySelectorAll('#themeIcon').forEach(el => el.textContent = isDark ? '🌙' : '☀️');
  document.querySelectorAll('#themeLabel').forEach(el => el.textContent = isDark ? 'Dark Mode' : 'Light Mode');
  document.querySelectorAll('.theme-toggle-btn').forEach(el => el.textContent = isDark ? '🌙' : '☀️');
  const sw = document.getElementById('themeSwitch');
  if (sw) sw.checked = !isDark;
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}
// Init theme on load
(function() {
  const saved = localStorage.getItem('skillmap_theme') || 'dark';
  applyTheme(saved);
})();

/* ---- AUTH HELPERS ---- */
function getCurrentUser() {
  const u = localStorage.getItem('skillmap_current');
  return u ? JSON.parse(u) : null;
}
function saveCurrentUser(user) {
  localStorage.setItem('skillmap_current', JSON.stringify(user));
  const users = JSON.parse(localStorage.getItem('skillmap_users') || '[]');
  const idx = users.findIndex(u => u.email === user.email);
  if (idx >= 0) users[idx] = user; else users.push(user);
  localStorage.setItem('skillmap_users', JSON.stringify(users));
}
function logout() {
  if (!confirm('Are you sure you want to log out?')) return;
  localStorage.removeItem('skillmap_current');
  window.location.href = 'index.html';
}
function requireAuth() {
  if (!getCurrentUser()) window.location.href = 'login.html';
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function togglePass(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? 'Show' : 'Hide';
}

/* ---- SIGNUP ---- */
function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const college = document.getElementById('signupCollege').value.trim();
  const dept = document.getElementById('signupDept').value;
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const year = document.getElementById('signupYear').value;
  const errEl = document.getElementById('signupError');
  const sucEl = document.getElementById('signupSuccess');

  if (!name || !email || !password || !year || !dept) {
    errEl.textContent = 'Please fill in all required fields.'; errEl.style.display = 'block'; return;
  }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; return; }
  if (!email.includes('@')) { errEl.textContent = 'Enter a valid email address.'; errEl.style.display = 'block'; return; }

  const users = JSON.parse(localStorage.getItem('skillmap_users') || '[]');
  if (users.find(u => u.email === email)) { errEl.textContent = 'An account with this email already exists.'; errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  document.getElementById('signupBtnText').textContent = 'Creating...';

  const newUser = {
    name, college, dept, email, password, year,
    joined: new Date().toISOString(),
    skills: [], courses: [], certificates: [], projects: [], storedCerts: [],
    streak: 0, totalPoints: 100, rank: users.length + 4,
    resumeAnalyzed: false, avatar: null
  };
  users.push(newUser);
  localStorage.setItem('skillmap_users', JSON.stringify(users));
  localStorage.setItem('skillmap_current', JSON.stringify(newUser));
  sucEl.style.display = 'block';
  setTimeout(() => window.location.href = 'upload.html', 1200);
}

/* ---- LOGIN ---- */
function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; return; }
  document.getElementById('loginBtnText').textContent = 'Logging in...';
  errEl.style.display = 'none';
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('skillmap_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('skillmap_current', JSON.stringify(user));
      window.location.href = 'dashboard.html';
    } else {
      errEl.textContent = 'Invalid credentials. Try the Demo Login below.';
      errEl.style.display = 'block';
      document.getElementById('loginBtnText').textContent = 'Log In';
    }
  }, 700);
}

function demoLogin() {
  const demo = {
    name: 'Arjun Sharma', email: 'arjun@demo.com', college: 'Anna University',
    dept: 'CSE', year: '3rd Year', password: 'demo123',
    joined: new Date(Date.now() - 45 * 86400000).toISOString(), avatar: null,
    skills: [
      { name:'Java', level:'Intermediate', score:78, category:'Programming' },
      { name:'Web Development', level:'Intermediate', score:65, category:'Web' },
      { name:'Data Structures', level:'Beginner', score:50, category:'CS Fundamentals' },
      { name:'MySQL', level:'Beginner', score:40, category:'Database' },
      { name:'JavaScript', level:'Intermediate', score:60, category:'Web' },
      { name:'HTML & CSS', level:'Intermediate', score:72, category:'Web' },
      { name:'Git', level:'Beginner', score:45, category:'Tools' }
    ],
    courses: [
      { name:'Java Fundamentals', progress:85, status:'In Progress', platform:'Udemy' },
      { name:'Web Dev Bootcamp', progress:100, status:'Completed', platform:'Coursera' },
      { name:'Data Structures & Algorithms', progress:45, status:'In Progress', platform:'College' },
      { name:'MySQL for Beginners', progress:30, status:'In Progress', platform:'YouTube' },
      { name:'HTML & CSS Mastery', progress:100, status:'Completed', platform:'edX' }
    ],
    certificates: ['Oracle Java SE Fundamentals', 'FreeCodeCamp Responsive Web Design'],
    storedCerts: [],
    projects: ['E-commerce Website', 'Student Management System', 'To-Do App', 'Portfolio Website'],
    streak: 12, totalPoints: 820, rank: 3, resumeAnalyzed: true
  };
  localStorage.setItem('skillmap_current', JSON.stringify(demo));
  const users = JSON.parse(localStorage.getItem('skillmap_users') || '[]');
  if (!users.find(u => u.email === demo.email)) { users.push(demo); localStorage.setItem('skillmap_users', JSON.stringify(users)); }
  window.location.href = 'dashboard.html';
}

/* ---- UTILS ---- */
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function getLevel(score) {
  return score >= 70 ? 'Advanced' : score >= 40 ? 'Intermediate' : 'Beginner';
}
function getSkillColor(score) {
  return score >= 70 ? '#69f0ae' : score >= 40 ? '#5b8af5' : '#ffd54f';
}
function initSidebarUser() {
  const user = getCurrentUser();
  if (!user) return;
  const el = document.getElementById('sbUser');
  if (el) el.textContent = '👤 ' + user.name;
}
function computeAchievements(user) {
  const skills = user.skills || [];
  const courses = user.courses || [];
  const completed = courses.filter(c => c.progress === 100 || c.status === 'Completed');
  const advanced = skills.filter(s => s.score >= 70);
  const badges = [];

  if (skills.length >= 1) badges.push({ icon:'🛠', text:'First Skill!', sub:'Added 1st skill', unlocked:true });
  if (skills.length >= 5) badges.push({ icon:'⚡', text:'Skill Builder', sub:'5 skills tracked', unlocked:true });
  if (skills.length >= 10) badges.push({ icon:'🚀', text:'Skill Master', sub:'10+ skills', unlocked:true });
  if (completed.length >= 1) badges.push({ icon:'🎓', text:'Course Complete!', sub:'Finished 1 course', unlocked:true });
  if (completed.length >= 5) badges.push({ icon:'🏆', text:'5 Courses Done', sub:'Completed 5 courses', unlocked:true });
  if (advanced.length >= 1) badges.push({ icon:'🧠', text:'Advanced in '+advanced[0].name, sub:'Reached 70%+', unlocked:true });
  if ((user.streak||0) >= 7) badges.push({ icon:'🔥', text:'Week Streak', sub:'7 days in a row', unlocked:true });
  if (user.resumeAnalyzed) badges.push({ icon:'📄', text:'Resume Analyzed', sub:'AI scan complete', unlocked:true });
  if ((user.totalPoints||0) >= 500) badges.push({ icon:'💎', text:'500 Points!', sub:'High scorer', unlocked:true });
  if (skills.find(s => s.name === 'Java' && s.score >= 40)) badges.push({ icon:'☕', text:'Java Developer', sub:'Java Beginner Done', unlocked:true });

  // Locked examples
  if (completed.length < 5) badges.push({ icon:'🏅', text:'5 Courses Finished', sub:completed.length+'/5 completed', unlocked:false });
  if (advanced.length < 3) badges.push({ icon:'🌟', text:'3 Advanced Skills', sub:advanced.length+'/3', unlocked:false });

  return badges;
}

// Init on all dashboard pages
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.dashboard-page')) {
    requireAuth();
    initSidebarUser();
  }
  // Sync theme switch state
  const sw = document.getElementById('themeSwitch');
  if (sw) sw.checked = (localStorage.getItem('skillmap_theme')||'dark') === 'light';
});

// ── Expose getToken globally (used by api.js) ────────────────
function getToken() { return localStorage.getItem('skillmap_jwt'); }

// Override logout to use API
function logout() {
  if (!confirm('Are you sure you want to log out?')) return;
  try { fetch('http://localhost:8080/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+getToken()}}); } catch(e){}
  localStorage.removeItem('skillmap_jwt');
  localStorage.removeItem('skillmap_current');
  window.location.href = 'index.html';
}
