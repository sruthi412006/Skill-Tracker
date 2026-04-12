// leaderboard.js
const MOCK_STUDENTS = [
  {name:'Priya Ramesh',college:'IIT Madras',skills:12,points:1240,rank:1,level:'Advanced'},
  {name:'Karthik Selvam',college:'NIT Trichy',skills:10,points:1080,rank:2,level:'Advanced'},
  {name:'Arjun Sharma',college:'Anna University',skills:7,points:820,rank:3,level:'Intermediate'},
  {name:'Deepa Krishnan',college:'VIT Vellore',skills:9,points:760,rank:4,level:'Intermediate'},
  {name:'Rohit Nair',college:'SRM University',skills:6,points:680,rank:5,level:'Intermediate'},
  {name:'Ananya Menon',college:'PSG Tech',skills:8,points:620,rank:6,level:'Intermediate'},
  {name:'Vikram Reddy',college:'SASTRA University',skills:5,points:540,rank:7,level:'Intermediate'},
  {name:'Sneha Iyer',college:'Amrita University',skills:7,points:490,rank:8,level:'Intermediate'},
  {name:'Arun Babu',college:'CEG Chennai',skills:4,points:380,rank:9,level:'Beginner'},
  {name:'Meera Suresh',college:'Madras Institute',skills:5,points:310,rank:10,level:'Beginner'},
];

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  initSidebarUser();

  const user = getCurrentUser();
  // Merge real user into list
  const board = [...MOCK_STUDENTS];
  const existIdx = board.findIndex(s => s.name === user.name);
  if (existIdx >= 0) {
    board[existIdx].points = user.totalPoints || board[existIdx].points;
    board[existIdx].skills = (user.skills||[]).length || board[existIdx].skills;
  }
  board.sort((a,b) => b.points - a.points);
  board.forEach((s,i) => s.rank = i+1);

  renderPodium(board.slice(0,3));
  renderTable(board, user.name);
});

function renderPodium(top3) {
  const medals = ['🥇','🥈','🥉'];
  const classes = ['first','second','third'];
  const order = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd visual order
  const orderClasses = ['second','first','third'];
  const orderMedals = ['🥈','🥇','🥉'];

  document.getElementById('lbPodium').innerHTML = order.map((s,i) => `
    <div class="lb-pod ${orderClasses[i]}">
      <div class="lb-medal">${orderMedals[i]}</div>
      <div class="lb-pod-name">${s.name}</div>
      <div class="lb-pod-college">${s.college}</div>
      <div class="lb-pod-pts">${s.points} pts</div>
    </div>
  `).join('');
}

function renderTable(board, currentName) {
  const levelColor = {Advanced:'var(--accent5)',Intermediate:'var(--accent1)',Beginner:'var(--accent4)'};
  document.getElementById('lbBody').innerHTML = board.map(s => `
    <tr class="${s.name===currentName?'current-user':''}">
      <td class="lb-rank">${s.rank <= 3 ? ['🥇','🥈','🥉'][s.rank-1] : '#'+s.rank}</td>
      <td>
        <div class="lb-avatar-cell">
          <div class="lb-mini-avatar">${s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
          <div>
            <div style="font-weight:600">${s.name}${s.name===currentName?' (You)':''}</div>
          </div>
        </div>
      </td>
      <td style="color:var(--text2);font-size:.82rem">${s.college}</td>
      <td>${s.skills}</td>
      <td class="lb-pts">${s.points}</td>
      <td><span style="color:${levelColor[s.level]||'var(--text2)'};font-weight:600;font-size:.8rem">${s.level}</span></td>
    </tr>
  `).join('');
}