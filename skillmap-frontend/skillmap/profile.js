document.addEventListener('DOMContentLoaded',()=>{ requireAuth(); initSidebarUser(); loadProfile(); });

function loadProfile() {
  const user = getCurrentUser();
  // Avatar
  const avatarEl = document.getElementById('profileAvatar');
  if (user.avatar) avatarEl.innerHTML=`<img src="${user.avatar}" alt="avatar"/>`;
  else avatarEl.textContent = user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : '??';

  // Name & college
  setText('pName', user.name||'');
  setText('pCollege', `${user.college||''} · ${user.dept||''} · ${user.year||''}`);

  // Level badge
  const skills = user.skills||[];
  const avg = skills.length?Math.round(skills.reduce((a,b)=>a+b.score,0)/skills.length):0;
  const level = getLevel(avg);
  const levelColors = {Advanced:'rgba(76,175,80,.15)',Intermediate:'rgba(91,138,245,.15)',Beginner:'rgba(255,193,7,.15)'};
  const levelText = {Advanced:'#69f0ae',Intermediate:'#5b8af5',Beginner:'#ffd54f'};
  const lb = document.getElementById('pLevel');
  lb.textContent = `🏆 ${level} Developer · ${avg}%`;
  lb.style.background = levelColors[level];
  lb.style.color = levelText[level];

  // Mini stats
  const courses = user.courses||[];
  const completed = courses.filter(c=>c.progress===100||c.status==='Completed').length;
  const el = document.getElementById('pMiniStats');
  el.innerHTML = `
    <div class="pms-item"><div class="pms-val">${skills.length}</div><div class="pms-lbl">Skills</div></div>
    <div class="pms-item"><div class="pms-val">${completed}</div><div class="pms-lbl">Done</div></div>
    <div class="pms-item"><div class="pms-val">${user.totalPoints||0}</div><div class="pms-lbl">Pts</div></div>`;

  // Detail view
  setText('dvName', user.name||'—');
  setText('dvEmail', user.email||'—');
  setText('dvCollege', user.college||'—');
  setText('dvDept', user.dept||'—');
  setText('dvYear', user.year||'—');
  setText('dvJoined', user.joined ? new Date(user.joined).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'}) : '—');

  // Edit fields pre-fill
  setVal('editName', user.name||'');
  setVal('editCollege', user.college||'');
  setVal('editDept', user.dept||'CSE');
  setVal('editYear', user.year||'1st Year');
  setVal('updateEmail', user.email||'');

  // Top 5 skills
  const top5 = skills.sort((a,b)=>b.score-a.score).slice(0,5);
  const s5el = document.getElementById('profileTopSkills');
  if (!top5.length) { s5el.innerHTML='<p style="font-size:.82rem;color:var(--text2)">No skills yet. <a href="upload.html">Upload resume →</a></p>'; }
  else s5el.innerHTML = top5.map(s=>`
    <div class="p-skill-row">
      <div class="p-skill-header"><strong>${s.name}</strong><span class="level-badge ${getLevel(s.score)}">${getLevel(s.score)}</span></div>
      <div class="p-skill-bar"><div class="p-skill-fill" style="width:${s.score}%;background:${getSkillColor(s.score)}"></div></div>
      <div style="font-size:.72rem;color:var(--text2);margin-top:3px;text-align:right">${s.score}%</div>
    </div>`).join('');

  // Achievements
  const badges = computeAchievements(user);
  const ael = document.getElementById('profileAchievements');
  ael.innerHTML = badges.filter(b=>b.unlocked).slice(0,6).map(b=>`
    <div class="profile-ach-item"><span class="ab-icon">${b.icon}</span><div><div style="font-weight:600">${b.text}</div><div style="font-size:.72rem;color:var(--text2)">${b.sub}</div></div></div>
  `).join('') || '<p style="font-size:.82rem;color:var(--text2)">Complete activities to earn badges!</p>';

  // Theme switch sync
  const sw = document.getElementById('themeSwitch');
  if (sw) sw.checked = (localStorage.getItem('skillmap_theme')||'dark')==='light';
}

function setText(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }
function setVal(id, val) { const el=document.getElementById(id); if(el) el.value=val; }

function toggleEdit(section) {
  const view = document.getElementById(section+'View');
  const edit = document.getElementById(section+'Edit');
  const isEdit = edit.style.display==='block';
  view.style.display = isEdit?'block':'none';
  edit.style.display = isEdit?'none':'block';
}

function savePersonal() {
  const name = document.getElementById('editName').value.trim();
  const college = document.getElementById('editCollege').value.trim();
  const dept = document.getElementById('editDept').value;
  const year = document.getElementById('editYear').value;
  if (!name) { showNotif('Name cannot be empty.','error'); return; }
  const user = getCurrentUser();
  user.name=name; user.college=college; user.dept=dept; user.year=year;
  saveCurrentUser(user);
  toggleEdit('personal');
  loadProfile();
  showNotif('✅ Profile updated successfully!','success');
}

function updateEmail() {
  const newEmail = document.getElementById('updateEmail').value.trim();
  if (!newEmail||!newEmail.includes('@')) { showNotif('Enter a valid email.','error'); return; }
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('skillmap_users')||'[]');
  if (users.find(u=>u.email===newEmail&&u.email!==user.email)) { showNotif('Email already in use.','error'); return; }
  user.email=newEmail;
  saveCurrentUser(user);
  showNotif('✅ Email updated!','success');
  setText('dvEmail', newEmail);
}

function changePassword() {
  const cur = document.getElementById('curPass').value;
  const np1 = document.getElementById('newPassA').value;
  const np2 = document.getElementById('newPassB').value;
  const user = getCurrentUser();
  if (cur !== user.password) { showNotif('Current password is incorrect.','error'); return; }
  if (np1.length<6) { showNotif('New password must be at least 6 characters.','error'); return; }
  if (np1!==np2) { showNotif('New passwords do not match.','error'); return; }
  user.password=np1;
  saveCurrentUser(user);
  document.getElementById('curPass').value='';
  document.getElementById('newPassA').value='';
  document.getElementById('newPassB').value='';
  showNotif('✅ Password changed successfully!','success');
}

function uploadAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size>2*1024*1024) { alert('Image must be under 2MB.'); return; }
  const reader = new FileReader();
  reader.onload = function(ev) {
    const user = getCurrentUser();
    user.avatar = ev.target.result;
    saveCurrentUser(user);
    document.getElementById('profileAvatar').innerHTML=`<img src="${ev.target.result}" alt="avatar"/>`;
  };
  reader.readAsDataURL(file);
}

function deleteAccount() {
  if (!confirm('Are you absolutely sure? This will permanently delete your account and all data.')) return;
  if (!confirm('This action CANNOT be undone. Type OK to confirm.')) return;
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('skillmap_users')||'[]');
  const filtered = users.filter(u=>u.email!==user.email);
  localStorage.setItem('skillmap_users',JSON.stringify(filtered));
  localStorage.removeItem('skillmap_current');
  window.location.href='index.html';
}

function showNotif(msg, type) {
  const el = document.getElementById(type==='error'?'profileError':'profileNotif');
  const other = document.getElementById(type==='error'?'profileNotif':'profileError');
  other.style.display='none';
  el.textContent=msg; el.style.display='block';
  setTimeout(()=>el.style.display='none',3500);
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
}
