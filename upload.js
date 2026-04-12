// upload.js — AI Resume Analysis Simulation
const SKILL_KEYWORDS = {
  'Java': ['java','java se','java ee','spring','hibernate','maven'],
  'JavaScript': ['javascript','js','node','nodejs','express','react','vue','angular'],
  'Web Development': ['html','css','web','frontend','backend','bootstrap','tailwind'],
  'Python': ['python','django','flask','pandas','numpy','scikit'],
  'MySQL': ['mysql','sql','database','postgresql','mongodb','nosql'],
  'Data Structures': ['data structures','algorithms','dsa','leetcode','competitive'],
  'Machine Learning': ['machine learning','ml','deep learning','tensorflow','pytorch','ai'],
  'Git': ['git','github','version control','gitlab','bitbucket'],
  'React': ['react','reactjs','redux','hooks','jsx'],
  'Spring Boot': ['spring boot','spring mvc','microservices','rest api','restful'],
  'Cloud': ['aws','azure','gcp','cloud','docker','kubernetes'],
  'C++': ['c++','cpp','stl','competitive programming'],
};

const CERT_KEYWORDS = ['oracle','microsoft','aws certified','google certified','coursera','udemy certificate','freeCodeCamp','nptel','hackerrank','certified'];
const PROJECT_KEYWORDS = ['project','application','system','website','app','developed','built','created','designed','implemented'];

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
    alert('Please upload a PDF or Word document.'); return;
  }
  if (file.size > 5 * 1024 * 1024) { alert('File size must be under 5MB.'); return; }

  document.getElementById('uploadZone').style.display = 'none';
  document.getElementById('analyzeProgress').style.display = 'block';

  const steps = ['step1','step2','step3','step4','step5'];
  const percents = [20, 40, 65, 85, 100];
  let current = 0;

  function nextStep() {
    if (current > 0) {
      document.getElementById(steps[current-1]).classList.remove('active');
      document.getElementById(steps[current-1]).classList.add('done');
      document.getElementById(steps[current-1]).textContent =
        '✅ ' + document.getElementById(steps[current-1]).textContent.replace(/^[^\s]+\s/,'');
    }
    if (current < steps.length) {
      document.getElementById(steps[current]).classList.add('active');
      document.getElementById('apBarFill').style.width = percents[current] + '%';
      current++;
      setTimeout(nextStep, 900 + Math.random() * 400);
    } else {
      // Done — show results
      setTimeout(() => showResults(file), 600);
    }
  }
  nextStep();
}

function simulateSkillExtraction(filename) {
  // Simulate AI extraction from filename hints + random selection
  const allSkills = Object.keys(SKILL_KEYWORDS);
  // Always include some base skills
  const base = ['Java','Web Development','MySQL','Data Structures','JavaScript','HTML & CSS','Git'];
  const extras = allSkills.filter(s => !base.includes(s));
  const selected = [...base];
  // Add 1-3 random extras
  const n = Math.floor(Math.random()*3)+1;
  for(let i=0;i<n;i++) {
    const r = extras[Math.floor(Math.random()*extras.length)];
    if (!selected.includes(r)) selected.push(r);
  }
  return selected.map(name => {
    const base = Math.floor(30 + Math.random()*60);
    return { name, score: Math.min(base, 95), level: getLevel(base), category: getCat(name) };
  });
}

function getCat(name) {
  const map = { 'Java':'Programming','JavaScript':'Web','Web Development':'Web','HTML & CSS':'Web',
    'Python':'Programming','MySQL':'Database','Data Structures':'CS Fundamentals',
    'Git':'Tools','React':'Web','Spring Boot':'Programming','Cloud':'Cloud','Machine Learning':'AI/ML','C++':'Programming' };
  return map[name] || 'Other';
}

function showResults(file) {
  document.getElementById('analyzeProgress').style.display = 'none';
  document.getElementById('analyzeResults').style.display = 'block';
  document.getElementById('arFileName').textContent = file.name;

  const skills = simulateSkillExtraction(file.name);
  const certs = ['Oracle Java SE Fundamentals','FreeCodeCamp Web Design','NPTEL Python'];
  const projects = ['E-commerce Website (Java, MySQL)','Portfolio Website (HTML, CSS, JS)','Student Management System','To-Do App (JavaScript)'];

  document.getElementById('arSkills').innerHTML = skills.map(s =>
    `<span class="ar-tag" style="border-color:${getSkillColor(s.score)}22;color:${getSkillColor(s.score)}">${s.name} · ${s.score}%</span>`
  ).join('');
  document.getElementById('arCerts').innerHTML = certs.slice(0,2+Math.floor(Math.random()*2)).map(c =>
    `<span class="ar-tag">📜 ${c}</span>`).join('');
  document.getElementById('arProjects').innerHTML = projects.slice(0,2+Math.floor(Math.random()*2)).map(p =>
    `<span class="ar-tag">💼 ${p}</span>`).join('');

  // Save to user profile
  const user = getCurrentUser();
  if (user) {
    user.skills = skills;
    user.certificates = certs.slice(0,3);
    user.projects = projects.slice(0,4);
    user.resumeAnalyzed = true;
    user.totalPoints = (user.totalPoints || 100) + 200;
    saveCurrentUser(user);
  }
}

function resetUpload() {
  document.getElementById('analyzeResults').style.display = 'none';
  document.getElementById('analyzeProgress').style.display = 'none';
  document.getElementById('uploadZone').style.display = 'block';
  document.getElementById('resumeFile').value = '';
  const steps = ['step1','step2','step3','step4','step5'];
  const labels = ['📤 Uploading file...','🔍 Extracting text...','🧠 Analyzing skills & projects...','📊 Calculating proficiency...','✅ Building your profile!'];
  steps.forEach((id,i) => {
    const el = document.getElementById(id);
    el.classList.remove('active','done');
    el.textContent = labels[i];
  });
  document.getElementById('apBarFill').style.width = '0';
}

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  initSidebarUser();
});