// ============================================================
// SKILLMAP — API SERVICE
// Connects frontend to Spring Boot backend
// ============================================================

const API_BASE = 'http://localhost:8080/api';

// ── Token Management ─────────────────────────────────────────
function getToken() { return localStorage.getItem('skillmap_jwt'); }
function setToken(token) { localStorage.setItem('skillmap_jwt', token); }
function clearToken() { localStorage.removeItem('skillmap_jwt'); localStorage.removeItem('skillmap_current'); }

// ── Base fetch with auth ─────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + endpoint, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = 'login.html';
    return;
  }
  const data = await res.json();
  if (!data.success && !options.allowError) {
    throw new Error(data.message || 'API error');
  }
  return data;
}

// ── Multipart (file upload) ──────────────────────────────────
async function apiUpload(endpoint, formData) {
  const token = getToken();
  const res = await fetch(API_BASE + endpoint, {
    method: 'POST',
    headers: token ? { 'Authorization': 'Bearer ' + token } : {},
    body: formData
  });
  if (res.status === 401) { clearToken(); window.location.href = 'login.html'; return; }
  return res.json();
}

// ============================================================
// AUTH
// ============================================================
const AuthAPI = {
  async register(data) {
    const res = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data), allowError: true });
    if (res.success) { setToken(res.data.token); saveCurrentUser(res.data.user); }
    return res;
  },
  async login(email, password) {
    const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), allowError: true });
    if (res.success) { setToken(res.data.token); saveCurrentUser(res.data.user); }
    return res;
  },
  async logout() {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch(e) {}
    clearToken();
    window.location.href = 'index.html';
  },
  async resetPassword(email, newPassword, confirmPassword) {
    const params = new URLSearchParams({ email, newPassword, confirmPassword });
    return apiFetch('/auth/reset-password?' + params, { method: 'POST', allowError: true });
  }
};

// ============================================================
// USER / DASHBOARD
// ============================================================
const UserAPI = {
  async getMe() { return apiFetch('/users/me'); },
  async getDashboard() { return apiFetch('/users/dashboard'); },
  async updateProfile(data) { return apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data), allowError: true }); },
  async changePassword(data) { return apiFetch('/users/me/password', { method: 'PUT', body: JSON.stringify(data), allowError: true }); },
  async deleteAccount() { return apiFetch('/users/me', { method: 'DELETE', allowError: true }); }
};

// ============================================================
// SKILLS
// ============================================================
const SkillAPI = {
  async getAll(level, search) {
    let url = '/skills?';
    if (level && level !== 'all') url += 'level=' + level + '&';
    if (search) url += 'search=' + encodeURIComponent(search);
    return apiFetch(url);
  },
  async add(data) { return apiFetch('/skills', { method: 'POST', body: JSON.stringify(data), allowError: true }); },
  async update(id, data) { return apiFetch('/skills/' + id, { method: 'PUT', body: JSON.stringify(data), allowError: true }); },
  async delete(id) { return apiFetch('/skills/' + id, { method: 'DELETE', allowError: true }); },
  async getWeak() { return apiFetch('/skills/weak'); },
  async getHistory(skillName) { return apiFetch('/skills/history' + (skillName ? '?skillName=' + encodeURIComponent(skillName) : '')); }
};

// ============================================================
// COURSES
// ============================================================
const CourseAPI = {
  async getAll(status, search) {
    let url = '/courses?';
    if (status && status !== 'all') url += 'status=' + status + '&';
    if (search) url += 'search=' + encodeURIComponent(search);
    return apiFetch(url);
  },
  async add(data) { return apiFetch('/courses', { method: 'POST', body: JSON.stringify(data), allowError: true }); },
  async update(id, data) { return apiFetch('/courses/' + id, { method: 'PUT', body: JSON.stringify(data), allowError: true }); },
  async delete(id) { return apiFetch('/courses/' + id, { method: 'DELETE', allowError: true }); }
};

// ============================================================
// RESUME
// ============================================================
const ResumeAPI = {
  async upload(file) {
    const fd = new FormData();
    fd.append('file', file);
    return apiUpload('/resume/upload', fd);
  },
  async getHistory() { return apiFetch('/resume/history'); }
};

// ============================================================
// CERTIFICATES
// ============================================================
const CertAPI = {
  async getAll() { return apiFetch('/certificates'); },
  async upload(file, certName, issuer) {
    const fd = new FormData();
    fd.append('file', file);
    if (certName) fd.append('certName', certName);
    if (issuer) fd.append('issuer', issuer);
    return apiUpload('/certificates/upload', fd);
  },
  async delete(id) { return apiFetch('/certificates/' + id, { method: 'DELETE', allowError: true }); }
};

// ============================================================
// LEADERBOARD
// ============================================================
const LeaderboardAPI = {
  async get() { return apiFetch('/leaderboard'); }
};

// ============================================================
// PROGRESS
// ============================================================
const ProgressAPI = {
  async get() { return apiFetch('/progress'); },
  async getSkillHistory(skillName) { return apiFetch('/progress/skill/' + encodeURIComponent(skillName)); }
};

// ── Helpers ─────────────────────────────────────────────────
function saveCurrentUser(user) {
  localStorage.setItem('skillmap_current', JSON.stringify(user));
}
function getCurrentUser() {
  const u = localStorage.getItem('skillmap_current');
  return u ? JSON.parse(u) : null;
}
function isLoggedIn() {
  return !!getToken() && !!getCurrentUser();
}

// ── Export check (redirect if not authed) ───────────────────
function requireAuthAPI() {
  if (!isLoggedIn()) { window.location.href = 'login.html'; }
}
