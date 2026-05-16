document.addEventListener('DOMContentLoaded',()=>{ requireAuth(); initSidebarUser(); loadStoredCerts(); });

function switchTab(tab,btn){
  document.querySelectorAll('.utab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  document.getElementById('tabResume').style.display=tab==='resume'?'block':'none';
  document.getElementById('tabCert').style.display=tab==='cert'?'block':'none';
  if(tab==='cert') loadStoredCerts();
}

function handleDrop(e,type){
  e.preventDefault();
  const zone=type==='resume'?document.getElementById('uploadZone'):document.getElementById('certUploadZone');
  zone.classList.remove('dragover');
  const file=e.dataTransfer.files[0];
  if(file) processFile(file,type);
}
function handleFileSelect(e,type){ const file=e.target.files[0]; if(file) processFile(file,type); }

async function processFile(file,type){
  if(type==='cert'){ await storeCertificate(file); return; }
  const allowed=['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if(!allowed.includes(file.type)&&!file.name.match(/\.(pdf|doc|docx)$/i)){ alert('Upload a PDF or Word document.'); return; }
  if(file.size>10*1024*1024){ alert('Max file size is 10MB.'); return; }

  document.getElementById('uploadZone').style.display='none';
  document.getElementById('analyzeProgress').style.display='block';

  const steps=['step1','step2','step3','step4','step5'];
  const percents=[20,40,65,85,100];
  const labels=['📤 Uploading file...','🔍 Extracting text...','🧠 Analyzing skills & projects...','📊 Calculating proficiency...','✅ Building your profile!'];
  let cur=0;

  function next(){
    if(cur>0){ const prev=document.getElementById(steps[cur-1]); prev.classList.remove('active'); prev.classList.add('done'); prev.textContent='✅ '+prev.textContent.replace(/^[^\s]+\s/,''); }
    if(cur<steps.length){ document.getElementById(steps[cur]).classList.add('active'); document.getElementById('apBarFill').style.width=percents[cur]+'%'; cur++; setTimeout(next,800+Math.random()*400); }
    else setTimeout(()=>doAnalysis(file),400);
  }
  next();
}

async function doAnalysis(file){
  try {
    let result=null;
    // Try real backend
    if(getToken()){
      try {
        const res=await ResumeAPI.upload(file);
        if(res&&res.success) result=res.data;
      } catch(e){ console.log('Backend unavailable, simulating analysis'); }
    }
    if(!result) result=simulateAnalysis(file.name);

    showResults(file.name, result);

    // Sync to local storage
    const user=getCurrentUser();
    if(result.detectedSkills&&result.detectedSkills.length){
      user.skills=result.detectedSkills.map(s=>({...s,score:s.proficiencyScore||s.score||0}));
    }
    if(result.detectedCertifications) user.certificates=result.detectedCertifications;
    if(result.detectedProjects) user.projects=result.detectedProjects;
    user.resumeAnalyzed=true;
    user.totalPoints=(user.totalPoints||100)+200;
    saveCurrentUser(user);
  } catch(e){
    alert('Analysis failed: '+e.message);
    resetUpload();
  }
}

function simulateAnalysis(filename){
  const skills=[
    {name:'Java',proficiencyScore:78,category:'Programming',level:'INTERMEDIATE'},
    {name:'Web Development',proficiencyScore:65,category:'Web',level:'INTERMEDIATE'},
    {name:'Data Structures',proficiencyScore:50,category:'CS Fundamentals',level:'INTERMEDIATE'},
    {name:'MySQL',proficiencyScore:40,category:'Database',level:'INTERMEDIATE'},
    {name:'JavaScript',proficiencyScore:60,category:'Web',level:'INTERMEDIATE'},
    {name:'HTML & CSS',proficiencyScore:72,category:'Web',level:'INTERMEDIATE'},
    {name:'Git',proficiencyScore:45,category:'Tools',level:'BEGINNER'},
  ];
  const extras=[{name:'Python',proficiencyScore:55,category:'Programming',level:'INTERMEDIATE'},{name:'React',proficiencyScore:38,category:'Web',level:'BEGINNER'}];
  if(Math.random()>0.5) skills.push(extras[0]); else skills.push(extras[1]);
  const avg=Math.round(skills.reduce((a,b)=>a+b.proficiencyScore,0)/skills.length);
  const certs=['Oracle Java SE Fundamentals','FreeCodeCamp Responsive Web Design','NPTEL Python'];
  const projects=['E-commerce Website (Java, MySQL)','Portfolio Website (HTML,CSS,JS)','Student Management System'];
  const strength=Math.min(95,Math.round(skills.length*5+2*8+3*5));
  return { detectedSkills:skills, detectedCertifications:certs.slice(0,2), detectedProjects:projects.slice(0,2),
    resumeStrength:strength, strengthCategory:strength>=75?'Strong':strength>=50?'Good':'Needs Work',
    overallProficiency:avg, strongSkills:skills.filter(s=>s.proficiencyScore>=65).map(s=>s.name),
    improvementAreas:skills.filter(s=>s.proficiencyScore>=35&&s.proficiencyScore<65).map(s=>s.name),
    missingSkills:skills.filter(s=>s.proficiencyScore<35).map(s=>s.name) };
}

function showResults(filename, result){
  document.getElementById('analyzeProgress').style.display='none';
  document.getElementById('analyzeResults').style.display='block';
  document.getElementById('arFileName').textContent=filename;
  const strength=result.resumeStrength||0;
  document.getElementById('rsStrengthMini').innerHTML=`Resume Strength<br><span style="font-size:1.6rem;color:var(--accent1)">${strength}%</span>`;
  const skills=result.detectedSkills||[];
  document.getElementById('arSkills').innerHTML=skills.map(s=>`<span class="ar-tag" style="color:${getSkillColor(s.proficiencyScore||s.score||0)}">${s.name} · ${s.proficiencyScore||s.score||0}%</span>`).join('');
  document.getElementById('arCerts').innerHTML=(result.detectedCertifications||[]).map(c=>`<span class="ar-tag">📜 ${c}</span>`).join('');
  document.getElementById('arProjects').innerHTML=(result.detectedProjects||[]).map(p=>`<span class="ar-tag">💼 ${p}</span>`).join('');
}

async function storeCertificate(file){
  if(file.size>5*1024*1024){ alert('Max 5MB.'); return; }
  try {
    if(getToken()){
      const certName=prompt('Certificate name (optional):','') || file.name;
      const issuer=prompt('Issuer (optional):','') || '';
      const res=await CertAPI.upload(file,certName,issuer);
      if(res&&res.success){ alert('✅ Certificate stored!'); loadStoredCerts(); return; }
    }
  } catch(e){}
  // local fallback
  const reader=new FileReader();
  reader.onload=ev=>{
    const user=getCurrentUser();
    user.storedCerts=user.storedCerts||[];
    user.storedCerts.push({name:file.name,date:new Date().toLocaleDateString('en-IN'),size:Math.round(file.size/1024)+'KB'});
    saveCurrentUser(user); loadStoredCerts(); alert('✅ Certificate stored locally!');
  };
  reader.readAsDataURL(file);
}

async function loadStoredCerts(){
  const el=document.getElementById('certsList'); if(!el) return;
  let certs=[];
  try {
    if(getToken()){ const res=await CertAPI.getAll(); if(res&&res.success) certs=res.data||[]; }
  } catch(e){}
  if(!certs.length){
    const user=getCurrentUser();
    certs=(user.storedCerts||[]).map((c,i)=>({id:i,certName:c.name,originalFilename:c.name,uploadedAt:c.date}));
  }
  if(!certs.length){ el.innerHTML='<p style="color:var(--text2);font-size:.85rem;margin-top:16px">No certificates uploaded yet.</p>'; return; }
  el.innerHTML='<h4 style="font-size:.9rem;margin-bottom:12px;margin-top:20px">📂 Stored Certificates</h4>'
    +certs.map((c,i)=>`
      <div class="cert-stored-item">
        <div><div style="font-weight:600">${c.certName||c.originalFilename||'Certificate'}</div>
          <div style="font-size:.72rem;color:var(--text2)">${c.uploadedAt||''}</div></div>
        <button class="sc-action-btn" style="color:var(--danger)" onclick="deleteCert(${c.id||i})">✕</button>
      </div>`).join('');
}

async function deleteCert(id){
  try {
    if(getToken()){ await CertAPI.delete(id); loadStoredCerts(); return; }
  } catch(e){}
  const user=getCurrentUser();
  if(user.storedCerts) user.storedCerts.splice(id,1);
  saveCurrentUser(user); loadStoredCerts();
}

function resetUpload(){
  document.getElementById('analyzeResults').style.display='none';
  document.getElementById('analyzeProgress').style.display='none';
  document.getElementById('uploadZone').style.display='block';
  document.getElementById('resumeFile').value='';
  const steps=['step1','step2','step3','step4','step5'];
  const labels=['📤 Uploading file...','🔍 Extracting text...','🧠 Analyzing skills & projects...','📊 Calculating proficiency...','✅ Building your profile!'];
  steps.forEach((id,i)=>{ const el=document.getElementById(id); el.classList.remove('active','done'); el.textContent=labels[i]; });
  document.getElementById('apBarFill').style.width='0';
}
