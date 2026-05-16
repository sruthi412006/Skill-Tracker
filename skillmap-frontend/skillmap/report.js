document.addEventListener('DOMContentLoaded',()=>{ requireAuth(); initSidebarUser(); renderReport(); });

function renderReport() {
  const user = getCurrentUser();
  const skills = user.skills||[];
  const courses = user.courses||[];
  const avgScore = skills.length ? Math.round(skills.reduce((a,b)=>a+b.score,0)/skills.length) : 0;
  const overallLevel = avgScore>=65?'Advanced':avgScore>=40?'Intermediate':'Beginner';
  const completed = courses.filter(c=>c.progress===100||c.status==='Completed');
  const ongoing = courses.filter(c=>c.progress>0&&c.progress<100);
  const date = new Date().toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'});
  const levelColor = overallLevel==='Advanced'?'#69f0ae':overallLevel==='Intermediate'?'#5b8af5':'#ffd54f';
  const strong = skills.filter(s=>s.score>=65).map(s=>s.name);
  const warn = skills.filter(s=>s.score>=35&&s.score<65).map(s=>s.name);
  const missing = skills.filter(s=>s.score<35).map(s=>s.name);

  const el = document.getElementById('reportContent');
  if (!el) return;
  el.innerHTML = `
    <div class="report-header-card">
      <div class="rh-top">
        <div>
          <div class="rh-name">${user.name||'Student'}</div>
          <div class="rh-college">${user.college||''} · ${user.dept||''} · ${user.year||''}</div>
          <div class="rh-date">Generated: ${date}</div>
        </div>
        <div style="text-align:center">
          <div class="rh-overall" style="color:${levelColor}">${avgScore}%</div>
          <div class="rh-level">Overall Proficiency</div>
          <span class="level-badge ${overallLevel}" style="font-size:.82rem;padding:4px 14px;margin-top:8px;display:inline-block">${overallLevel}</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:20px;padding-top:20px;border-top:1px solid var(--border)">
        ${[['🛠',skills.length,'Skills'],['✅',completed.length,'Completed'],['⏳',ongoing.length,'Ongoing'],['📜',(user.certificates||[]).length,'Certs'],['💼',(user.projects||[]).length,'Projects']].map(([ic,v,lb])=>`
          <div style="text-align:center"><div style="font-size:1.2rem">${ic}</div><div style="font-family:Syne,sans-serif;font-size:1.4rem;font-weight:800">${v}</div><div style="font-size:.72rem;color:var(--text2)">${lb}</div></div>
        `).join('')}
      </div>
    </div>

    <!-- SKILL ANALYSIS OUTPUT -->
    <div class="report-section">
      <h3>📊 Skill Analysis</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px">
        <div style="background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.2);border-radius:10px;padding:14px">
          <div style="font-weight:700;color:#69f0ae;margin-bottom:8px">✔ Strong In</div>
          ${strong.length?strong.map(s=>`<div style="font-size:.82rem;padding:3px 0">${s}</div>`).join(''):'<div style="font-size:.82rem;color:var(--text2)">Keep practicing!</div>'}
        </div>
        <div style="background:rgba(255,193,7,.08);border:1px solid rgba(255,193,7,.2);border-radius:10px;padding:14px">
          <div style="font-weight:700;color:#ffd54f;margin-bottom:8px">⚠ Improve</div>
          ${warn.length?warn.map(s=>`<div style="font-size:.82rem;padding:3px 0">${s}</div>`).join(''):'<div style="font-size:.82rem;color:var(--text2)">None currently</div>'}
        </div>
        <div style="background:rgba(244,67,54,.08);border:1px solid rgba(244,67,54,.2);border-radius:10px;padding:14px">
          <div style="font-weight:700;color:#ef9a9a;margin-bottom:8px">❌ Missing / Weak</div>
          ${missing.length?missing.map(s=>`<div style="font-size:.82rem;padding:3px 0">${s}</div>`).join(''):(user.projects&&user.projects.length?'<div style="font-size:.82rem;color:var(--text2)">None detected!</div>':'<div style="font-size:.82rem;color:#ef9a9a">Projects</div>')}
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>🛠 Skill Proficiency Breakdown</h3>
      ${skills.length?skills.map(s=>{
        const c=getSkillColor(s.score);
        return `<div class="report-skill-row">
          <div class="rs-name">${s.name}<div style="font-size:.7rem;color:var(--text2)">${s.category||''}</div></div>
          <div class="rs-bar"><div class="rs-fill" style="width:${s.score}%;background:${c}"></div></div>
          <div class="rs-pct">${s.score}%</div>
          <span class="level-badge ${getLevel(s.score)}">${getLevel(s.score)}</span>
        </div>`;
      }).join(''):'<p style="color:var(--text2)">No skills. Upload resume first.</p>'}
    </div>

    ${courses.length?`
    <div class="report-section">
      <h3>📚 Course Progress</h3>
      ${courses.map(c=>`
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <div><span style="font-weight:600;font-size:.88rem">${c.name}</span> <span style="font-size:.74rem;color:var(--text2)">· ${c.platform||''}</span></div>
            <span style="color:var(--accent1);font-weight:700">${c.progress}%</span>
          </div>
          <div style="height:8px;background:var(--bg3);border-radius:4px;overflow:hidden">
            <div style="width:${c.progress}%;height:100%;background:linear-gradient(90deg,var(--accent2),var(--accent1));border-radius:4px"></div>
          </div>
          <div style="font-size:.72rem;color:var(--text2);margin-top:4px">${c.status||'In Progress'}</div>
        </div>`).join('')}
    </div>`:''}

    ${(user.certificates||[]).length?`
    <div class="report-section">
      <h3>📜 Certifications</h3>
      <div style="display:flex;flex-wrap:wrap;gap:10px">${user.certificates.map(c=>`<span class="ar-tag">📜 ${c}</span>`).join('')}</div>
    </div>`:''}

    ${(user.projects||[]).length?`
    <div class="report-section">
      <h3>💼 Projects</h3>
      <div style="display:flex;flex-wrap:wrap;gap:10px">${user.projects.map(p=>`<span class="ar-tag">💻 ${p}</span>`).join('')}</div>
    </div>`:''}

    <div class="report-section">
      <h3>🎯 Personalized Recommendations</h3>
      ${generateRecs(skills, completed).map(r=>`
        <div style="padding:14px;background:var(--bg3);border-radius:8px;margin-bottom:10px;border-left:3px solid var(--accent1)">
          <div style="font-weight:700;margin-bottom:4px">${r.title}</div>
          <div style="font-size:.83rem;color:var(--text2)">${r.desc}</div>
        </div>`).join('')}
    </div>

    <div class="report-section">
      <h3>🎖 Achievements</h3>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        ${computeAchievements(user).filter(b=>b.unlocked).map(b=>`
          <div style="display:flex;align-items:center;gap:8px;background:rgba(255,213,79,.06);border:1px solid rgba(255,213,79,.2);border-radius:8px;padding:8px 14px;font-size:.82rem">
            <span style="font-size:1.2rem">${b.icon}</span><div><div style="font-weight:600">${b.text}</div><div style="font-size:.7rem;color:var(--text2)">${b.sub}</div></div>
          </div>`).join('')}
      </div>
    </div>`;
}

function generateRecs(skills, completed) {
  const recs = [];
  const weak = skills.filter(s=>s.score<50);
  const mid = skills.filter(s=>s.score>=50&&s.score<70);
  if (weak.length) recs.push({title:`⚡ Focus on: ${weak[0].name}`,desc:`Score: ${weak[0].score}%. Dedicate 30 min/day to reach Intermediate. Try GeeksForGeeks or YouTube tutorials.`});
  if (mid.length) recs.push({title:`📈 Level up: ${mid[0].name}`,desc:`You're at ${mid[0].score}% — push to 70%+ by building a real project using ${mid[0].name}.`});
  if (!skills.find(s=>s.name==='React')) recs.push({title:'🚀 Add React to your skillset',desc:'React is the #1 front-end library. Start with react.dev and build 2 small projects.'});
  if (!skills.find(s=>s.name==='System Design')) recs.push({title:'🏗 Learn System Design',desc:'Critical for placements. Watch Gaurav Sen on YouTube and read Grokking System Design.'});
  if (completed.length<3) recs.push({title:'✅ Complete more courses',desc:`You've completed ${completed.length} course(s). Aim for 5 completed to unlock the "5 Courses" badge and boost your rank.`});
  recs.push({title:'💻 Build a GitHub portfolio',desc:'Upload all projects to GitHub with clear READMEs. Recruiters actively check GitHub profiles.'});
  return recs;
}

function downloadReport() {
  const user = getCurrentUser();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const skills = user.skills||[];
  const courses = user.courses||[];
  const avgScore = skills.length?Math.round(skills.reduce((a,b)=>a+b.score,0)/skills.length):0;
  const date = new Date().toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'});

  // Header
  doc.setFillColor(27,35,80); doc.rect(0,0,210,40,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(22); doc.setFont('helvetica','bold');
  doc.text('SkillMap — Progress Report', 14, 16);
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text(`Student: ${user.name||''}   |   ${user.college||''}   |   ${user.dept||''}`, 14, 26);
  doc.text(`Generated: ${date}`, 14, 33);

  let y = 52;
  // Overall Score
  doc.setTextColor(30,30,80); doc.setFontSize(14); doc.setFont('helvetica','bold');
  doc.text('Overall Proficiency: '+avgScore+'%   Level: '+getLevel(avgScore), 14, y); y+=10;

  // Stats
  const completed = courses.filter(c=>c.progress===100||c.status==='Completed').length;
  doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(60,60,100);
  doc.text(`Total Skills: ${skills.length}   |   Completed Courses: ${completed}   |   Certifications: ${(user.certificates||[]).length}   |   Projects: ${(user.projects||[]).length}`, 14, y); y+=12;

  // Skill Analysis
  doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(30,30,80);
  doc.text('Skill Analysis', 14, y); y+=8;
  const strong = skills.filter(s=>s.score>=65).map(s=>s.name);
  const warn2 = skills.filter(s=>s.score>=35&&s.score<65).map(s=>s.name);
  const missing = skills.filter(s=>s.score<35).map(s=>s.name);
  doc.setFontSize(9); doc.setFont('helvetica','normal');
  doc.setTextColor(0,150,80); doc.text('Strong: '+(strong.join(', ')||'None'), 14, y); y+=6;
  doc.setTextColor(180,120,0); doc.text('Improve: '+(warn2.join(', ')||'None'), 14, y); y+=6;
  doc.setTextColor(200,50,50); doc.text('Missing/Weak: '+(missing.join(', ')||'None'), 14, y); y+=10;

  // Skills
  doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(30,30,80);
  doc.text('Skills Breakdown', 14, y); y+=8;
  skills.forEach(s=>{
    if (y>270) { doc.addPage(); y=20; }
    doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(40,40,80);
    doc.text(`${s.name} (${s.category||''})`, 14, y);
    doc.text(`${s.score}% — ${getLevel(s.score)}`, 150, y);
    doc.setFillColor(220,225,240); doc.rect(14, y+2, 120, 3,'F');
    const c = s.score>=70?[105,240,174]:s.score>=40?[91,138,245]:[255,213,79];
    doc.setFillColor(...c); doc.rect(14, y+2, s.score*1.2, 3,'F');
    y += 9;
  });

  // Courses
  if (courses.length) {
    y+=4;
    if (y>265) { doc.addPage(); y=20; }
    doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(30,30,80);
    doc.text('Course Progress', 14, y); y+=8;
    courses.forEach(c=>{
      if (y>270) { doc.addPage(); y=20; }
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(40,40,80);
      doc.text(`${c.name} (${c.platform||''})`, 14, y);
      doc.text(`${c.progress}% — ${c.status||'In Progress'}`, 150, y);
      doc.setFillColor(220,225,240); doc.rect(14,y+2,120,3,'F');
      doc.setFillColor(91,138,245); doc.rect(14,y+2,c.progress*1.2,3,'F');
      y+=9;
    });
  }

  // Achievements
  const badges = computeAchievements(user).filter(b=>b.unlocked);
  if (badges.length) {
    y+=4; if (y>265) { doc.addPage(); y=20; }
    doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(30,30,80);
    doc.text('Achievements', 14, y); y+=8;
    doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(60,60,100);
    doc.text(badges.map(b=>b.text).join('   |   '), 14, y, {maxWidth:180}); y+=10;
  }

  // Footer
  doc.setFontSize(8); doc.setTextColor(150,150,180);
  doc.text('Generated by SkillMap — skillmap.app', 14, 288);
  doc.text('Page 1', 190, 288, {align:'right'});

  doc.save(`SkillMap_Report_${(user.name||'Student').replace(/ /g,'_')}.pdf`);
}

function generateResumePDF() {
  const user = getCurrentUser();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const skills = user.skills||[];
  const courses = user.courses||[];

  let y = 20;
  // Name header
  doc.setFontSize(20); doc.setFont('helvetica','bold'); doc.setTextColor(27,35,80);
  doc.text(user.name||'Your Name', 14, y); y+=8;
  doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(80,80,130);
  doc.text(`${user.email||''}   |   ${user.college||''}   |   ${user.dept||''}   |   ${user.year||''}`, 14, y); y+=6;
  doc.setDrawColor(91,138,245); doc.line(14,y,196,y); y+=8;

  // Skills Summary
  doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(27,35,80);
  doc.text('TECHNICAL SKILLS', 14, y); y+=7;
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(50,50,80);
  const advanced=skills.filter(s=>s.score>=70).map(s=>s.name);
  const inter=skills.filter(s=>s.score>=40&&s.score<70).map(s=>s.name);
  const beg=skills.filter(s=>s.score<40).map(s=>s.name);
  if (advanced.length) { doc.setFont('helvetica','bold'); doc.text('Advanced: ',14,y); doc.setFont('helvetica','normal'); doc.text(advanced.join(', '),36,y); y+=6; }
  if (inter.length) { doc.setFont('helvetica','bold'); doc.text('Intermediate: ',14,y); doc.setFont('helvetica','normal'); doc.text(inter.join(', '),44,y); y+=6; }
  if (beg.length) { doc.setFont('helvetica','bold'); doc.text('Beginner: ',14,y); doc.setFont('helvetica','normal'); doc.text(beg.join(', '),38,y); y+=6; }
  y+=4;

  // Projects
  if ((user.projects||[]).length) {
    doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(27,35,80);
    doc.text('PROJECTS', 14, y); y+=7;
    user.projects.forEach(p=>{
      doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(40,40,80);
      doc.text('• '+p, 14, y); y+=6;
    });
    y+=4;
  }

  // Education / Certifications
  if ((user.certificates||[]).length) {
    doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(27,35,80);
    doc.text('CERTIFICATIONS', 14, y); y+=7;
    user.certificates.forEach(c=>{
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(50,50,80);
      doc.text('• '+c, 14, y); y+=6;
    });
    y+=4;
  }

  // Courses completed
  const completedC = courses.filter(c=>c.progress===100||c.status==='Completed');
  if (completedC.length) {
    doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(27,35,80);
    doc.text('COMPLETED COURSES', 14, y); y+=7;
    completedC.forEach(c=>{
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(50,50,80);
      doc.text(`• ${c.name} (${c.platform||''})`, 14, y); y+=6;
    });
  }

  doc.setFontSize(8); doc.setTextColor(150,150,180);
  doc.text('Generated by SkillMap Resume Builder', 14, 288);
  doc.save(`Resume_${(user.name||'Student').replace(/ /g,'_')}.pdf`);
}
