const MOCK=[
  {name:'Priya Ramesh',college:'IIT Madras',department:'CSE',totalSkills:12,totalPoints:1240,overallLevel:'ADVANCED'},
  {name:'Karthik Selvam',college:'NIT Trichy',department:'IT',totalSkills:10,totalPoints:1080,overallLevel:'ADVANCED'},
  {name:'Deepa Krishnan',college:'VIT Vellore',department:'CSE',totalSkills:9,totalPoints:760,overallLevel:'INTERMEDIATE'},
  {name:'Rohit Nair',college:'SRM University',department:'ECE',totalSkills:6,totalPoints:680,overallLevel:'INTERMEDIATE'},
  {name:'Ananya Menon',college:'PSG Tech',department:'IT',totalSkills:8,totalPoints:620,overallLevel:'INTERMEDIATE'},
  {name:'Vikram Reddy',college:'SASTRA University',department:'CSE',totalSkills:5,totalPoints:540,overallLevel:'INTERMEDIATE'},
  {name:'Sneha Iyer',college:'Amrita University',department:'MCA',totalSkills:7,totalPoints:490,overallLevel:'INTERMEDIATE'},
  {name:'Arun Babu',college:'CEG Chennai',department:'IT',totalSkills:4,totalPoints:380,overallLevel:'BEGINNER'},
  {name:'Meera Suresh',college:'Madras Institute',department:'CSE',totalSkills:5,totalPoints:310,overallLevel:'BEGINNER'},
  {name:'Rajan Kumar',college:'Coimbatore IT',department:'ECE',totalSkills:3,totalPoints:220,overallLevel:'BEGINNER'},
];

document.addEventListener('DOMContentLoaded', async ()=>{
  requireAuth(); initSidebarUser();
  const user=getCurrentUser();
  let entries=[];

  try {
    if(getToken()){
      const res=await LeaderboardAPI.get();
      if(res&&res.success&&res.data.length) { entries=res.data; renderLeaderboard(entries, user); return; }
    }
  } catch(e){}

  // Fallback: merge mock + real user
  const board=[...MOCK];
  const exists=board.findIndex(s=>s.name===(user.fullName||user.name));
  const userSkills=(user.skills||[]).length;
  const userPts=user.totalPoints||100;
  const userLevel=userSkills?['BEGINNER','INTERMEDIATE','ADVANCED'][Math.min(2,Math.floor(userSkills/4))]:' BEGINNER';

  if(exists>=0){ board[exists].totalPoints=userPts; board[exists].totalSkills=userSkills; board[exists].overallLevel=userLevel; }
  else board.push({name:user.fullName||user.name||'You',college:user.college||'—',department:user.dept||user.department||'—',totalSkills:userSkills,totalPoints:userPts,overallLevel:userLevel,isCurrentUser:true});

  board.sort((a,b)=>b.totalPoints-a.totalPoints);
  entries=board.map((s,i)=>({...s,rank:i+1,isCurrentUser:(s.name===(user.fullName||user.name)||s.isCurrentUser)}));
  renderLeaderboard(entries, user);
});

function renderLeaderboard(entries, user){
  renderPodium(entries.slice(0,3));
  renderTable(entries, user);
}

function renderPodium(top){
  const display=[top[1],top[0],top[2]].filter(Boolean);
  const cls=['second','first','third'];
  const medals=['🥈','🥇','🥉'];
  document.getElementById('lbPodium').innerHTML=display.map((s,i)=>`
    <div class="lb-pod ${cls[i]}">
      <div class="lb-medal">${medals[i]}</div>
      <div class="lb-pod-name">${s.fullName||s.name}</div>
      <div class="lb-pod-college">${s.college||'—'}</div>
      <div class="lb-pod-pts">${s.totalPoints} pts</div>
    </div>`).join('');
}

function renderTable(entries, user){
  const lc={ADVANCED:'var(--accent5)',INTERMEDIATE:'var(--accent1)',BEGINNER:'var(--accent4)'};
  const curName=user.fullName||user.name;
  document.getElementById('lbBody').innerHTML=entries.map(s=>{
    const name=s.fullName||s.name;
    const isCur=s.isCurrentUser||(name===curName);
    return `<tr class="${isCur?'current-user':''}">
      <td class="lb-rank">${s.rank<=3?['🥇','🥈','🥉'][s.rank-1]:'#'+s.rank}</td>
      <td><div class="lb-avatar-cell">
        <div class="lb-mini-avatar">${name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
        <div><div style="font-weight:600">${name}${isCur?' <span style="color:var(--accent1);font-size:.72rem">(You)</span>':''}</div>
          <div style="font-size:.72rem;color:var(--text2)">${s.department||s.dept||''}</div></div>
      </div></td>
      <td style="color:var(--text2);font-size:.82rem">${s.college||'—'}</td>
      <td>${s.totalSkills||0}</td>
      <td class="lb-pts">${s.totalPoints}</td>
      <td><span style="color:${lc[s.overallLevel||s.level]||'var(--text2)'};font-weight:600;font-size:.8rem">${(s.overallLevel||'BEGINNER').charAt(0)+(s.overallLevel||'BEGINNER').slice(1).toLowerCase()}</span></td>
    </tr>`;
  }).join('');
}
