// ============================================================
// SKILLMAP — CORE APP.JS (shared across all pages)
// ============================================================

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
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = 'Hide'; }
  else { inp.type = 'password'; btn.textContent = 'Show'; }
}

/* ---- SIGNUP ---- */
function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const college = document.getElementById('signupCollege').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const year = document.getElementById('signupYear').value;
  const errEl = document.getElementById('signupError');
  const sucEl = document.getElementById('signupSuccess');

  if (!name || !email || !password || !year) {
    errEl.textContent = 'Please fill in all required fields.';
    errEl.style.display = 'block'; return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    errEl.style.display = 'block'; return;
  }
  const users = JSON.parse(localStorage.getItem('skillmap_users') || '[]');
  if (users.find(u => u.email === email)) {
    errEl.textContent = 'An account with this email already exists.';
    errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';
  document.getElementById('signupBtnText').textContent = 'Creating...';

  const newUser = {
    name, college, email, password, year,
    joined: new Date().toISOString(),
    skills: [], courses: [], certificates: [], projects: [],
    streak: 0, totalPoints: 100, rank: users.length + 4,
    resumeAnalyzed: false
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
  if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display='block'; return; }
  document.getElementById('loginBtnText').textContent = 'Logging in...';
  errEl.style.display = 'none';
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('skillmap_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('skillmap_current', JSON.stringify(user));
      window.location.href = 'dashboard.html';
    } else {
      errEl.textContent = 'Invalid credentials. Try the Demo Login button.';
      errEl.style.display = 'block';
      document.getElementById('loginBtnText').textContent = 'Log In';
    }
  }, 700);
}

function demoLogin() {
  const demo = {
    name:'Arjun Sharma', email:'arjun@demo.com', college:'Anna University', year:'3rd Year',
    joined: new Date(Date.now()-30*86400000).toISOString(),
    skills:[
      {name:'Java',level:'Intermediate',score:78,category:'Programming'},
      {name:'Web Development',level:'Intermediate',score:65,category:'Web'},
      {name:'Data Structures',level:'Beginner',score:50,category:'CS Fundamentals'},
      {name:'MySQL',level:'Beginner',score:40,category:'Database'},
      {name:'JavaScript',level:'Intermediate',score:60,category:'Web'},
      {name:'HTML & CSS',level:'Intermediate',score:72,category:'Web'},
      {name:'Git',level:'Beginner',score:45,category:'Tools'}
    ],
    courses:[
      {name:'Java Fundamentals',progress:85,status:'In Progress',platform:'Udemy'},
      {name:'Web Dev Bootcamp',progress:60,status:'In Progress',platform:'Coursera'},
      {name:'Data Structures & Algorithms',progress:45,status:'In Progress',platform:'College'},
      {name:'MySQL for Beginners',progress:30,status:'In Progress',platform:'YouTube'}
    ],
    certificates:['Oracle Java SE Fundamentals','FreeCodeCamp Responsive Web Design'],
    projects:['E-commerce Website','Student Management System','To-Do App','Portfolio Website','Library System'],
    streak:12, totalPoints:820, rank:3, resumeAnalyzed:true
  };
  localStorage.setItem('skillmap_current', JSON.stringify(demo));
  window.location.href = 'dashboard.html';
}

/* ---- SIDEBAR USER ---- */
function initSidebarUser() {
  const user = getCurrentUser();
  if (!user) return;
  const el = document.getElementById('sbUser');
  if (el) el.textContent = '👤 ' + user.name;
}

/* ---- GREETING ---- */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ---- SKILL LEVEL ---- */
function getLevel(score) {
  if (score >= 70) return 'Advanced';
  if (score >= 40) return 'Intermediate';
  return 'Beginner';
}
function getSkillColor(score) {
  if (score >= 70) return '#69f0ae';
  if (score >= 40) return '#5b8af5';
  return '#ffd54f';
}

// Init sidebar on all dashboard pages
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.dashboard-page')) {
    requireAuth();
    initSidebarUser();
  }
});