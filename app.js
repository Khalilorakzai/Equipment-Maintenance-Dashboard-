// QRI Maintenance Dashboard — JavaScript
// ══════════════════════════════════════════
// AUTH SYSTEM
// ══════════════════════════════════════════
var USERS = [
  {username:'admin',   password:'admin123', role:'Admin',   secQ:'What city were you born in?',       secA:'lahore'},
  {username:'manager', password:'qri2024',  role:'Manager', secQ:'What is your mother\'s maiden name?', secA:'khan'},
  {username:'lab1',    password:'lab1pass', role:'Lab User', secQ:'What was your first pet\'s name?',   secA:'tiger'}
];
var currentUser = null;
var forgotTarget = null;

function loadUsers(){
  var stored = localStorage.getItem('QRI_Users');
  if(stored) USERS = JSON.parse(stored);
}
function saveUsers(){ localStorage.setItem('QRI_Users', JSON.stringify(USERS)); }

function doLogin(){
  var u = document.getElementById('loginUser').value.trim();
  var p = document.getElementById('loginPass').value;
  var found = USERS.find(function(x){ return x.username===u && x.password===p; });
  if(!found){
    document.getElementById('loginErr').classList.add('show');
    document.getElementById('loginPass').value='';
    return;
  }
  document.getElementById('loginErr').classList.remove('show');
  currentUser = found;
  localStorage.setItem('QRI_Session', JSON.stringify({username:found.username, role:found.role}));
  document.getElementById('loginScreen').classList.add('hide');
  document.getElementById('userNameDisp').textContent = found.role+': '+found.username;
  document.getElementById('userAv').textContent = found.username[0].toUpperCase();
  loadData(); refreshAll(); tick();
}

function doLogout(){
  currentUser = null;
  localStorage.removeItem('QRI_Session');
  document.getElementById('loginScreen').classList.remove('hide');
  document.getElementById('loginUser').value='';
  document.getElementById('loginPass').value='';
  document.getElementById('userPill').classList.remove('open');
  closeModal('changePwdModal');
}

function toggleUserMenu(){
  document.getElementById('userPill').classList.toggle('open');
}
document.addEventListener('click', function(e){
  var pill = document.getElementById('userPill');
  if(pill && !pill.contains(e.target)) pill.classList.remove('open');
});

// ── FORGOT PASSWORD ──
function showForgot(){
  document.getElementById('loginScreen').classList.add('hide');
  document.getElementById('forgotScreen').classList.add('show');
  showForgotStep(1);
}
function backToLogin(){
  document.getElementById('forgotScreen').classList.remove('show');
  document.getElementById('loginScreen').classList.remove('hide');
  document.getElementById('forgotUser').value='';
  document.getElementById('secAnswer').value='';
  document.getElementById('newPass1').value='';
  document.getElementById('newPass2').value='';
  forgotTarget=null;
}
function showForgotStep(n){
  ['fStep1','fStep2','fStep3','fStep4'].forEach(function(id,i){
    document.getElementById(id).classList.toggle('active', i+1===n);
  });
}
function forgotStep1(){
  var u = document.getElementById('forgotUser').value.trim();
  forgotTarget = USERS.find(function(x){ return x.username===u; });
  if(!forgotTarget){
    document.getElementById('forgotErr1').classList.add('show'); return;
  }
  document.getElementById('forgotErr1').classList.remove('show');
  document.getElementById('secQText').textContent = forgotTarget.secQ;
  showForgotStep(2);
}
function forgotStep2(){
  var ans = document.getElementById('secAnswer').value.trim().toLowerCase();
  if(!forgotTarget || ans !== forgotTarget.secA){
    document.getElementById('forgotErr2').classList.add('show'); return;
  }
  document.getElementById('forgotErr2').classList.remove('show');
  showForgotStep(3);
}
function forgotStep3(){
  var p1 = document.getElementById('newPass1').value;
  var p2 = document.getElementById('newPass2').value;
  if(!p1 || p1.length < 6 || p1 !== p2){
    document.getElementById('forgotErr3').classList.add('show'); return;
  }
  document.getElementById('forgotErr3').classList.remove('show');
  var idx = USERS.findIndex(function(x){ return x.username===forgotTarget.username; });
  USERS[idx].password = p1;
  saveUsers();
  forgotTarget = null;
  showForgotStep(4);
}

// ── CHANGE PASSWORD ──
function openChangePwd(){
  document.getElementById('userPill').classList.remove('open');
  document.getElementById('cp-old').value='';
  document.getElementById('cp-new1').value='';
  document.getElementById('cp-new2').value='';
  document.getElementById('pwdBar2').style.width='0';
  var e=document.getElementById('changePwdErr');
  e.style.display='none'; e.textContent='';
  document.getElementById('changePwdModal').classList.add('show');
}
function doChangePwd(){
  var old=document.getElementById('cp-old').value;
  var n1=document.getElementById('cp-new1').value;
  var n2=document.getElementById('cp-new2').value;
  var e=document.getElementById('changePwdErr');
  if(!currentUser || old !== currentUser.password){
    e.textContent='Current password is incorrect.'; e.style.display='block'; return;
  }
  if(n1.length < 6){
    e.textContent='New password must be at least 6 characters.'; e.style.display='block'; return;
  }
  if(n1 !== n2){
    e.textContent='New passwords do not match.'; e.style.display='block'; return;
  }
  var idx=USERS.findIndex(function(x){return x.username===currentUser.username;});
  USERS[idx].password=n1; currentUser.password=n1;
  saveUsers();
  closeModal('changePwdModal');
  toast('Password changed successfully.','ok');
}
function checkPwdStrength(inputId, barId){
  var val=document.getElementById(inputId).value;
  var bar=document.getElementById(barId);
  var score=0;
  if(val.length>=6) score++;
  if(val.length>=10) score++;
  if(/[A-Z]/.test(val)) score++;
  if(/[0-9]/.test(val)) score++;
  if(/[^A-Za-z0-9]/.test(val)) score++;
  var pct=[0,20,40,60,80,100][score];
  var clr=['','#c0392b','#d97706','#d97706','#1a9e6f','#0d7a52'][score];
  bar.style.width=pct+'%'; bar.style.background=clr;
}

// ── AUTO-RESTORE SESSION ──
function restoreSession(){
  loadUsers();
  var sess = localStorage.getItem('QRI_Session');
  if(sess){
    try{
      var s=JSON.parse(sess);
      var found=USERS.find(function(x){return x.username===s.username;});
      if(found){
        currentUser=found;
        document.getElementById('loginScreen').classList.add('hide');
        document.getElementById('userNameDisp').textContent=found.role+': '+found.username;
        document.getElementById('userAv').textContent=found.username[0].toUpperCase();
        return true;
      }
    }catch(e){}
  }
  return false;
}

// ══════════════════════════════════════════
// HEALTH STATUS
// ══════════════════════════════════════════
var healthData = {}; // keyed by equipment id

function loadHealth(){
  var stored=localStorage.getItem('QRI_Health');
  if(stored) healthData=JSON.parse(stored);
}
function saveHealth2(){ localStorage.setItem('QRI_Health', JSON.stringify(healthData)); }

function healthClass(status){
  var m={Excellent:'excellent',Good:'good',Fair:'fair',Poor:'poor',Critical:'critical'};
  return m[status]||'na';
}
function healthIcon(status){
  var m={Excellent:'🟢',Good:'🟩',Fair:'🟡',Poor:'🟠',Critical:'🔴'};
  return m[status]||'—';
}

function openHealthModal(eid){
  var eq=equipment.find(function(e){return e.id===eid;});
  if(!eq) return;
  document.getElementById('healthModalTitle').textContent='💊 Health Status: '+eq.name;
  document.getElementById('h-eid').value=eid;
  var h=healthData[eid]||{};
  document.getElementById('h-status').value=h.status||'Good';
  document.getElementById('h-score').value=h.score||'';
  document.getElementById('h-by').value=h.by||'';
  document.getElementById('h-date').value=h.date||new Date().toISOString().split('T')[0];
  document.getElementById('h-next').value=h.next||'';
  document.getElementById('h-notes').value=h.notes||'';
  document.getElementById('healthModal').classList.add('show');
}
function saveHealth(){
  var eid=document.getElementById('h-eid').value;
  var score=parseInt(document.getElementById('h-score').value)||null;
  healthData[eid]={
    status:document.getElementById('h-status').value,
    score:score,
    by:document.getElementById('h-by').value,
    date:document.getElementById('h-date').value,
    next:document.getElementById('h-next').value,
    notes:document.getElementById('h-notes').value
  };
  saveHealth2();
  closeModal('healthModal');
  renderTable();
  if(selectedEquipmentId===eid) viewHistory(eid);
  toast('Health status updated.','ok');
}

function healthBadgeHtml(eid){
  var h=healthData[eid];
  if(!h) return '<span class="health-badge na">Not Assessed</span>';
  var cls=healthClass(h.status);
  var score=h.score!=null?' ('+h.score+'/100)':'';
  return '<span class="health-badge '+cls+'">'+healthIcon(h.status)+' '+h.status+score+'</span>';
}

// ══════════════════════════════════════════
// ORIGINAL DASHBOARD STATE
// ══════════════════════════════════════════
// ── STATE ──
var equipment = [];
var mlog = [];
var editId = null;
var currentLab = 'all';
var sf = 'all';
var sortF = 'due';
var sortD = 1;
var page = 1;
var PG = 10;
var barC, pieC;
var selectedEquipmentId = null; 

var LABS = ['Chemical Lab','Microbiology Lab Hattar','Microbiology Lab Lahore','Calibration Lab','Physical Lab'];
var LAB_IDS = {'Chemical Lab':'CL','Microbiology Lab Hattar':'MH','Microbiology Lab Lahore':'ML','Calibration Lab':'CB','Physical Lab':'PL'};

function uid(){ return '_'+Math.random().toString(36).substr(2,9); }
function doff(n){var d=new Date();d.setDate(d.getDate()+n);return d.toISOString().split('T')[0];}
function dadd(iso,n){var d=new Date(iso);d.setDate(d.getDate()-n);return d.toISOString().split('T')[0];}

// ── PERSISTENCE ENGINE ──
function saveData() {
  localStorage.setItem('QRI_Equipment_Data', JSON.stringify(equipment));
  localStorage.setItem('QRI_Maintenance_Logs', JSON.stringify(mlog));
}
function manualSave(){
  saveData();
  saveHealth2();
  var btn=document.getElementById('saveDataBtn');
  if(btn){ btn.innerHTML='✔ Saved!'; btn.style.background='var(--green)'; btn.style.color='#fff';
    setTimeout(function(){ btn.innerHTML='💾 Save Data'; btn.style.background='var(--green-l)'; btn.style.color='var(--green)'; },2000);
  }
  toast('All data saved successfully.','ok');
}

function loadData() {
  var storedEq = localStorage.getItem('QRI_Equipment_Data');
  var storedLogs = localStorage.getItem('QRI_Maintenance_Logs');
  
  if(storedEq)   equipment=JSON.parse(storedEq); else equipment=[];
  if(storedLogs) mlog=JSON.parse(storedLogs);    else mlog=[];
}

function clearAllStoredData() {
  if(confirm("⚠️ WARNING: This will permanently delete ALL equipment records, maintenance logs and health data. This cannot be undone. Proceed?")){
    localStorage.removeItem('QRI_Equipment_Data');
    localStorage.removeItem('QRI_Maintenance_Logs');
    localStorage.removeItem('QRI_Health');
    document.getElementById('historySection').classList.remove('show');
    selectedEquipmentId = null;
    equipment=[]; mlog=[]; healthData={};
    refreshAll();
    toast('All data cleared.','warn');
  }
}

// ── SEED DATA (empty) ──
function seed(){
  equipment=[];
  mlog=[];
}

// ── AUX STATUS LOGIC ──
function getStatus(eq){
  if(eq.mtype==='Corrective') return 'corrective';
  var today=new Date(); today.setHours(0,0,0,0);
  var diff=Math.round((new Date(eq.due)-today)/86400000);
  if(diff<0) return 'overdue';
  if(diff<=30) return 'soon';
  return 'ok';
}
function daysLeft(eq){
  var today=new Date(); today.setHours(0,0,0,0);
  return Math.round((new Date(eq.due)-today)/86400000);
}
function fmtDate(iso){
  if(!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'});
}

// ── RENDERING STATS & KPIS ──
function updateCounts(){
  document.getElementById('cnt-all').textContent=equipment.length;
  var m={'CL':'Chemical Lab','MH':'Microbiology Lab Hattar','ML':'Microbiology Lab Lahore','CB':'Calibration Lab','PL':'Physical Lab'};
  Object.keys(m).forEach(function(k){
    var el=document.getElementById('cnt-'+k);
    if(el) el.textContent=equipment.filter(function(e){return e.lab===m[k];}).length;
  });
}

function updateKPIs(){
  var pool=currentLab==='all'?equipment:equipment.filter(function(e){return e.lab===currentLab;});
  var ss=pool.map(function(e){return getStatus(e);});
  document.getElementById('kpi-total').textContent=pool.length;
  document.getElementById('kpi-ok').textContent=ss.filter(function(s){return s==='ok';}).length;
  document.getElementById('kpi-soon').textContent=ss.filter(function(s){return s==='soon';}).length;
  document.getElementById('kpi-overdue').textContent=ss.filter(function(s){return s==='overdue';}).length;
  document.getElementById('kpi-corr').textContent=ss.filter(function(s){return s==='corrective';}).length;
}

function updateUpcoming(){
  var sorted=[].concat(equipment).filter(function(e){return e.mtype!=='Corrective';}).sort(function(a,b){return new Date(a.due)-new Date(b.due);}).slice(0,12);
  var g=document.getElementById('upcomingGrid');
  if(!sorted.length){g.innerHTML='<span style="color:var(--light);font-size:13px">No upcoming maintenance.</span>';return;}
  g.innerHTML=sorted.map(function(eq){
    var st=getStatus(eq);
    var dl=daysLeft(eq);
    var dlTxt=dl<0?'Overdue '+Math.abs(dl)+'d':dl===0?'Due Today':dl+'d left';
    return '<div class="uc '+st+'"><div class="uc-date">'+fmtDate(eq.due)+'</div><div class="uc-name" style="cursor:pointer; text-decoration:underline" onclick="viewHistory(\''+eq.id+'\')" title="View history: '+eq.name+'">'+eq.name+'</div><div class="uc-lab">'+eq.lab.replace('Microbiology Lab ','Micro ')+'</div><div class="uc-days">'+dlTxt+'</div></div>';
  }).join('');
}

function updateCharts(){
  var labData=LABS.map(function(lab){
    var eqs=equipment.filter(function(e){return e.lab===lab;});
    return{
      lab:lab.replace('Microbiology Lab ','Micro ').replace(' Lab',''),
      ok:eqs.filter(function(e){return getStatus(e)==='ok';}).length,
      soon:eqs.filter(function(e){return getStatus(e)==='soon';}).length,
      overdue:eqs.filter(function(e){return getStatus(e)==='overdue';}).length,
      corr:eqs.filter(function(e){return getStatus(e)==='corrective';}).length
    };
  });
  if(barC) barC.destroy();
  barC=new Chart(document.getElementById('barChart').getContext('2d'),{
    type:'bar',
    data:{
      labels:labData.map(function(d){return d.lab;}),
      datasets:[
        {label:'Compliant',data:labData.map(function(d){return d.ok;}),backgroundColor:'#1a9e6f99',borderColor:'#1a9e6f',borderWidth:1.5},
        {label:'Due Soon',data:labData.map(function(d){return d.soon;}),backgroundColor:'#d9770699',borderColor:'#d97706',borderWidth:1.5},
        {label:'Overdue',data:labData.map(function(d){return d.overdue;}),backgroundColor:'#c0392b99',borderColor:'#c0392b',borderWidth:1.5},
        {label:'Corrective',data:labData.map(function(d){return d.corr;}),backgroundColor:'#6d28d999',borderColor:'#6d28d9',borderWidth:1.5}
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:11},boxWidth:12}}},scales:{x:{ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{stepSize:1,font:{size:10}}}}}
  });
  var all=equipment.map(function(e){return getStatus(e);});
  var counts=['ok','soon','overdue','corrective'].map(function(s){return all.filter(function(x){return x===s;}).length;});
  if(pieC) pieC.destroy();
  pieC=new Chart(document.getElementById('pieChart').getContext('2d'),{
    type:'doughnut',
    data:{labels:['Compliant','Due Soon','Overdue','Corrective'],datasets:[{data:counts,backgroundColor:['#1a9e6f','#d97706','#c0392b','#6d28d9'],borderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{labels:{font:{size:11},boxWidth:12}}}}
  });
}

// ── TABLE CONTROLS ──
function getFiltered(){
  var search=document.getElementById('searchInput').value.toLowerCase();
  var lf=document.getElementById('labFilter').value;
  var tf=document.getElementById('typeFilter').value;
  var data=[].concat(equipment);
  if(currentLab!=='all') data=data.filter(function(e){return e.lab===currentLab;});
  if(lf!=='all') data=data.filter(function(e){return e.lab===lf;});
  if(tf!=='all') data=data.filter(function(e){return e.type===tf;});
  if(sf!=='all') data=data.filter(function(e){return getStatus(e)===sf;});
  if(search) data=data.filter(function(e){return (e.name+e.code+e.lab+(e.model||'')).toLowerCase().indexOf(search)>-1;});
  data.sort(function(a,b){
    var va=sortF==='due'?a.due:(a[sortF]||'');
    var vb=sortF==='due'?b.due:(b[sortF]||'');
    return va<vb?-sortD:va>vb?sortD:0;
  });
  return data;
}

function renderTable(){
  var data=getFiltered();
  var total=data.length;
  var totalPg=Math.max(1,Math.ceil(total/PG));
  if(page>totalPg) page=1;
  var rows=data.slice((page-1)*PG,page*PG);

  document.getElementById('tblTitle').textContent=currentLab==='all'?'All Equipment':currentLab;
  document.getElementById('tblSub').textContent='Showing '+rows.length+' of '+total+' records · Click equipment name to open full audit history';

  var stLabel={ok:'✔ Compliant',soon:'⚠ Due Soon',overdue:'✖ Overdue',corrective:'🔧 Corrective'};
  var tbody=document.getElementById('tblBody');
  if(!rows.length){
    tbody.innerHTML='<tr><td colspan="10"><div class="empty"><p>No equipment yet. Click <strong>+ Add Equipment</strong> to add your first record.</p></div></td></tr>';
  } else {
    tbody.innerHTML=rows.map(function(eq){
      var st=getStatus(eq);
      var dl=daysLeft(eq);
      var dlH=eq.mtype==='Corrective'?'<span class="days-pill">—</span>':
        '<span class="days-pill'+(dl<0?' neg':dl<=30?' near':'')+'">'+
        (dl<0?'Exp '+Math.abs(dl)+'d':dl===0?'Today':dl+'d')+'</span>';
      return '<tr>'+
        '<td><div class="eq-link" onclick="viewHistory(\''+eq.id+'\')">'+eq.name+'</div><div class="eq-model">'+(eq.model||'')+'</div></td>'+
        '<td><span class="code-tag">'+eq.code+'</span></td>'+
        '<td style="font-size:12px;max-width:110px">'+eq.lab+'</td>'+
        '<td style="font-size:12px;color:var(--muted)">'+eq.type+'</td>'+
        '<td style="font-size:12px">'+fmtDate(eq.due)+'</td>'+
        '<td>'+dlH+'</td>'+
        '<td><span class="badge '+st+'">'+stLabel[st]+'</span></td>'+
        '<td>'+healthBadgeHtml(eq.id)+'</td>'+
        '<td style="font-size:12px;color:var(--muted)">'+fmtDate(eq.last)+'</td>'+
        '<td><div class="act-btns">'+
          '<button class="ico-btn edt" title="Edit Properties" onclick="openEditModal(\''+eq.id+'\')">✏</button>'+
          '<button class="ico-btn" title="Add New Maintenance Log" onclick="openLogModal(\''+eq.id+'\')">🔧</button>'+
          '<button class="ico-btn" title="Update Health Status" onclick="openHealthModal(\''+eq.id+'\')">💊</button>'+
          '<button class="ico-btn del" title="Delete Asset" onclick="delEq(\''+eq.id+'\')">🗑</button>'+
        '</div></td>'+
      '</tr>';
    }).join('');
  }
  document.getElementById('pgInfo').textContent='Page '+page+' of '+totalPg;
  var html='';
  for(var i=1;i<=totalPg;i++) html+='<button class="pg-btn'+(i===page?' on':'')+'" onclick="goPage('+i+')">'+i+'</button>';
  document.getElementById('pgBtns').innerHTML=html;
}

function goPage(p){page=p;renderTable();}
function colSort(f){ if(sortF===f) sortD=-sortD; else{sortF=f;sortD=1;} renderTable(); }
function applySortSel(){ sortF=document.getElementById('sortSel').value; sortD=1; renderTable(); }
function setSF(s){
  sf=s;
  document.querySelectorAll('.chip').forEach(function(c){ c.className='chip'+(c.dataset.st===s?' on-'+s:''); });
  page=1; renderTable();
}
function selectLab(lab){
  currentLab=lab;
  document.querySelectorAll('.lab-btn').forEach(function(b){ b.classList.toggle('active',b.dataset.lab===lab); });
  document.getElementById('labFilter').value=lab;
  page=1; updateKPIs(); renderTable();
}

// ── LOG ENGINE & RENDERERS ──
function renderLog(){
  var lb=document.getElementById('logBody');
  if(!mlog.length){lb.innerHTML='<p style="padding:14px 0;color:var(--light);font-size:13px">No maintenance logged yet.</p>';return;}
  var sorted=[].concat(mlog).sort(function(a,b){return new Date(b.date)-new Date(a.date);});
  lb.innerHTML=sorted.map(function(l){
    return '<div class="log-item">'+
      '<div class="log-dot '+l.type.toLowerCase()+'"></div>'+
      '<div style="flex:1"><span class="eq-link" onclick="viewHistory(\''+l.eid+'\')">'+l.ename+'</span> · <span style="color:var(--muted)">'+l.lab+'</span> <span class="badge '+l.type.toLowerCase()+'" style="padding:1px 6px; font-size:9px">'+l.type+'</span>'+
      '<div style="color:var(--muted);margin-top:2px">'+l.issue+' → <em>'+l.action+'</em></div></div>'+
      '<div style="text-align:right;flex-shrink:0; display:flex; gap:10px; align-items:center">'+
        '<div>'+
          '<div style="font-size:11px;color:var(--light)">'+fmtDate(l.date)+'</div>'+
          '<div style="font-size:11px;color:var(--muted)">'+(l.tech||'—')+'</div>'+
        '</div>'+
        '<button class="ico-btn edt" style="height:22px; width:22px; font-size:10px" title="Edit Log Entry" onclick="openEditLogModal(\''+l.id+'\')">✏</button>'+
      '</div>'+
    '</div>';
  }).join('');
  
  if(selectedEquipmentId) {
     buildHistoryTimeline(selectedEquipmentId);
  }
}

// ── AUDIT HISTORY EXPLORER VIEW ──
function viewHistory(id) {
  var eq = equipment.find(function(e){return e.id === id;});
  if(!eq) return;
  selectedEquipmentId = id;
  
  var section = document.getElementById('historySection');
  document.getElementById('historyTitle').textContent = "🔧 Comprehensive Profile & Logs: " + eq.name;
  
  var metaBox = document.getElementById('historyMeta');
  var h=healthData[id]||null;
  var healthSection = h ? '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)"><div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--light);margin-bottom:8px">Health Status</div><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div class="health-score-ring '+healthClass(h.status)+'">'+(h.score!=null?h.score:'—')+'</div><div><span class="health-badge '+healthClass(h.status)+'">'+healthIcon(h.status)+' '+h.status+'</span><div style="font-size:11px;color:var(--muted);margin-top:3px">Assessed: '+fmtDate(h.date)+(h.by?' by '+h.by:'')+'</div></div></div>'+(h.notes?'<div style="font-size:11px;color:var(--muted);font-style:italic">'+h.notes+'</div>':'')+(h.next?'<div style="font-size:11px;color:var(--muted);margin-top:4px">Next assessment: '+fmtDate(h.next)+'</div>':'')+'</div>' : '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)"><div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--light);margin-bottom:6px">Health Status</div><span class="health-badge na">Not Assessed</span><br><button class="btn" style="font-size:11px;padding:5px 10px;margin-top:8px" onclick="openHealthModal(\''+id+'\')">+ Add Assessment</button></div>';
  metaBox.innerHTML = `
    <h4>Technical Profile</h4>
    <div class="meta-field"><span class="meta-label">Unique Code</span><strong>${eq.code}</strong></div>
    <div class="meta-field"><span class="meta-label">Allocation Lab</span>${eq.lab}</div>
    <div class="meta-field"><span class="meta-label">Classification</span>${eq.type}</div>
    <div class="meta-field"><span class="meta-label">Make / Model</span>${eq.model || '—'}</div>
    <div class="meta-field"><span class="meta-label">Custodian</span>${eq.person || '—'}</div>
    <div class="meta-field"><span class="meta-label">Execution Cycle</span>${eq.freq}</div>
    <div class="meta-field"><span class="meta-label">Target Next PM Date</span>${fmtDate(eq.due)}</div>
    <div class="meta-field"><span class="meta-label">Operational Notes</span><small style="color:var(--muted)">${eq.notes || 'No remarks added.'}</small></div>
    ${healthSection}
    <button class="btn" style="font-size:11px;padding:5px 10px;margin-top:12px;width:100%" onclick="openHealthModal('${id}')">💊 Update Health</button>
  `;
  
  buildHistoryTimeline(id);
  section.classList.add('show');
  section.scrollIntoView({ behavior: 'smooth' });
}

function buildHistoryTimeline(eid) {
  var tbody = document.getElementById('historyTableBody');
  var records = mlog.filter(function(l){ return l.eid === eid; });
  records.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
  
  if(!records.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--light)">No logged historical actions found for this asset.</td></tr>';
    return;
  }
  
  tbody.innerHTML = records.map(function(r) {
    return `<tr>
      <td><strong>${fmtDate(r.date)}</strong></td>
      <td><span class="badge ${r.type.toLowerCase()}">${r.type}</span></td>
      <td><div style="max-width:240px; white-space:normal; word-break:break-word;">${r.issue}</div></td>
      <td><div style="max-width:240px; font-style:italic; color:var(--muted); white-space:normal; word-break:break-word;">${r.action}</div></td>
      <td>${r.tech || '—'}</td>
      <td>
        <div class="act-btns">
          <button class="ico-btn edt" title="Modify Log" onclick="openEditLogModal('${r.id}')">✏</button>
          <button class="ico-btn del" title="Purge Entry" onclick="deleteLogEntry('${r.id}')">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── SAVE MODAL PIPEWAYS ──
function openAddModal(){
  editId=null;
  document.getElementById('eqModalTitle').textContent='➕ Add Equipment';
  document.getElementById('eqSaveBtn').textContent='Save Equipment';
  ['f-name','f-code','f-due','f-last','f-person','f-model','f-notes'].forEach(function(id){document.getElementById(id).value='';});
  document.getElementById('f-lab').value='';
  document.getElementById('eqModal').classList.add('show');
}

function openEditModal(id){
  var eq=equipment.find(function(e){return e.id===id;});
  if(!eq) return;
  editId=id;
  document.getElementById('eqModalTitle').textContent='✏ Edit Equipment';
  document.getElementById('eqSaveBtn').textContent='Update Equipment';
  document.getElementById('f-name').value=eq.name;
  document.getElementById('f-code').value=eq.code;
  document.getElementById('f-lab').value=eq.lab;
  document.getElementById('f-type').value=eq.type;
  document.getElementById('f-due').value=eq.due;
  document.getElementById('f-last').value=eq.last||'';
  document.getElementById('f-freq').value=eq.freq;
  document.getElementById('f-mtype').value=eq.mtype;
  document.getElementById('f-person').value=eq.person||'';
  document.getElementById('f-model').value=eq.model||'';
  document.getElementById('f-notes').value=eq.notes||'';
  document.getElementById('eqModal').classList.add('show');
}

function saveEquipment(){
  var name=document.getElementById('f-name').value.trim();
  var code=document.getElementById('f-code').value.trim();
  var lab=document.getElementById('f-lab').value;
  var due=document.getElementById('f-due').value;
  if(!name||!code||!lab||!due){toast('Fill required fields (*)','warn');return;}
  
  var eq={
    id:editId||uid(),name:name,code:code,lab:lab,
    type:document.getElementById('f-type').value,
    due:due,last:document.getElementById('f-last').value,
    freq:document.getElementById('f-freq').value,
    mtype:document.getElementById('f-mtype').value,
    person:document.getElementById('f-person').value,
    model:document.getElementById('f-model').value,
    notes:document.getElementById('f-notes').value
  };
  
  if(editId){
    var idx=equipment.findIndex(function(e){return e.id===editId;});
    equipment[idx]=eq;
    toast('Equipment data updated.','ok');
  } else {
    equipment.push(eq);
    toast('Equipment registered.','ok');
  }
  
  saveData(); // Commit into LocalStorage
  closeModal('eqModal');
  refreshAll();
}

function delEq(id){
  if(!confirm('Are you sure you want to completely remove this equipment from service?')) return;
  equipment=equipment.filter(function(e){return e.id!==id;});
  if (selectedEquipmentId === id) {
     document.getElementById('historySection').classList.remove('show');
  }
  saveData(); // Sync changes
  toast('Asset purged from active directory.','warn');
  refreshAll();
}

function openLogModal(eid){
  document.getElementById('log-id').value=''; 
  document.getElementById('log-eid').value=eid;
  document.getElementById('logModalTitle').textContent='🔧 Log Maintenance Action';
  document.getElementById('logSaveBtn').textContent='Save Log Entry';
  document.getElementById('log-issue').value='';
  document.getElementById('log-action').value='';
  document.getElementById('log-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('log-tech').value='';
  document.getElementById('log-type').value='Corrective';
  document.getElementById('logModal').classList.add('show');
}

function openEditLogModal(logId) {
  var logItem = mlog.find(function(l){ return l.id === logId; });
  if(!logItem) return;
  
  document.getElementById('log-id').value=logItem.id;
  document.getElementById('log-eid').value=logItem.eid;
  document.getElementById('logModalTitle').textContent='✏ Edit Historical Maintenance Log';
  document.getElementById('logSaveBtn').textContent='Update Log Entry';
  document.getElementById('log-issue').value=logItem.issue;
  document.getElementById('log-action').value=logItem.action;
  document.getElementById('log-date').value=logItem.date;
  document.getElementById('log-tech').value=logItem.tech || '';
  document.getElementById('log-type').value=logItem.type;
  document.getElementById('logModal').classList.add('show');
}

function saveLog(){
  var logId = document.getElementById('log-id').value;
  var eid=document.getElementById('log-eid').value;
  var issue=document.getElementById('log-issue').value.trim();
  var action=document.getElementById('log-action').value.trim();
  var logDate = document.getElementById('log-date').value;
  var tech = document.getElementById('log-tech').value.trim();
  var type = document.getElementById('log-type').value;
  
  if(!issue||!action||!logDate){toast('Fill description, action, and date fields.','warn');return;}
  var eq=equipment.find(function(e){return e.id===eid;});
  
  if(logId) {
    var idx = mlog.findIndex(function(l){ return l.id === logId; });
    if(idx !== -1) {
       mlog[idx].issue = issue;
       mlog[idx].action = action;
       mlog[idx].date = logDate;
       mlog[idx].tech = tech;
       mlog[idx].type = type;
       toast('Maintenance record revised.','ok');
    }
  } else {
    mlog.push({
      id:uid(), eid:eid, ename:eq?eq.name:'', lab:eq?eq.lab:'',
      type:type, date:logDate, issue:issue, action:action, tech:tech
    });
    toast('New maintenance log added.','ok');
  }
  
  saveData(); // Commit modifications
  closeModal('logModal');
  refreshAll();
}

function deleteLogEntry(logId) {
  if(!confirm('Permanently drop this log entry from logs?')) return;
  mlog = mlog.filter(function(l){ return l.id !== logId; });
  saveData(); // Save state
  toast('Log entry deleted.','warn');
  renderLog();
}

function closeModal(id){ document.getElementById(id).classList.remove('show'); }

// ── IMPORT & EXPORT LOGIC ──
function exportJSON(){
  dl(JSON.stringify({equipment:equipment,maintenanceLog:mlog,healthData:healthData},null,2),'QRI_Maintenance.json','application/json');
  toast('JSON exported.','ok');
}

function importJSON(ev){
  var file=ev.target.files[0];
  if(!file) return;
  var r=new FileReader();
  r.onload=function(e){
    try{
      var d=JSON.parse(e.target.result);
      if(d.equipment) equipment=d.equipment;
      if(d.maintenanceLog) mlog=d.maintenanceLog;
      if(d.healthData) healthData=d.healthData;
      document.getElementById('historySection').classList.remove('show');
      selectedEquipmentId = null;
      saveData(); // Write imported records to localStorage
      refreshAll();
      toast('External JSON Data Imported.','ok');
    }catch(err){toast('Invalid JSON structure.','err');}
  };
  r.readAsText(file);
  ev.target.value='';
}

function downloadCSV(){
  var data=getFiltered();
  var h=['Name','Code','Lab','Type','PM Due','Last PM','Status','Days Left','Frequency','Maint Type','Person','Model','Notes'];
  var rows=data.map(function(eq){return[eq.name,eq.code,eq.lab,eq.type,eq.due,eq.last||'',getStatus(eq),daysLeft(eq),eq.freq,eq.mtype,eq.person||'',eq.model||'',eq.notes||''];});
  var csv=[h].concat(rows).map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  dl(csv,'QRI_Equipment.csv','text/csv');
  toast('CSV downloaded.','ok');
}

function exportLog(){
  var h=['Date','Equipment','Lab','Type','Issue','Action','Technician'];
  var rows=mlog.map(function(l){return[l.date,l.ename,l.lab,l.type,l.issue,l.action,l.tech||''];});
  var csv=[h].concat(rows).map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  dl(csv,'QRI_Maintenance_Log.csv','text/csv');
  toast('Log exported.','ok');
}

function printReport(){
  var data=getFiltered();
  var lines=data.map(function(eq){
    return eq.name+' | '+eq.code+' | '+eq.lab+' | Due: '+eq.due+' | '+getStatus(eq).replace('_',' ');
  }).join('\n');
  var html='<html><head><title>QRI Report</title><style>body{font-family:Arial;padding:20px;font-size:12px}h1{color:#0f4c81;font-size:18px}h2{font-size:12px;color:#6b7698;margin-bottom:16px}pre{line-height:1.8;font-size:11px}</style></head><body><h1>Qarshi Research International</h1><h2>Equipment Maintenance Report — '+new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})+'</h2><pre>'+lines+'</pre></body></html>';
  var w=window.open('','_blank');
  if(w){w.document.write(html);w.document.close();setTimeout(function(){w.print();},400);}
  toast('Report opened.','ok');
}

function dl(text,filename,type){
  var blob=new Blob([text],{type:type});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// ── UTILITIES ──
var toastTmr;
function toast(msg,type){
  var el=document.getElementById('toast');
  el.textContent=(type==='ok'?'✔ ':type==='warn'?'⚠ ':'✖ ')+msg;
  el.className='show '+(type||'ok');
  clearTimeout(toastTmr);
  toastTmr=setTimeout(function(){el.className='';},3000);
}

function tick(){
  document.getElementById('clock').textContent=new Date().toLocaleString('en-PK',{weekday:'short',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function refreshAll(){
  updateCounts();
  updateKPIs();
  updateUpcoming();
  updateCharts();
  renderTable();
  renderLog();
}

// ══════════════════════════════════════════
// PM CALENDAR
// ══════════════════════════════════════════
var calYear = new Date().getFullYear();
var calHalf = new Date().getMonth() < 6 ? 1 : 2;
var calLabFilter = 'all';
var calSelectedDay = null;

var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAY_LABELS  = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function showCalendarView() {
  // Hide main dashboard panels, show calendar
  document.querySelectorAll('.kpi-row,.upcoming-section,.charts-row,.toolbar,.tbl-wrap,.history-section,.log-section').forEach(function(el){ el.style.display='none'; });
  document.getElementById('calSection').style.display='block';
  // Sidebar active state
  document.querySelectorAll('.lab-btn').forEach(function(b){ b.classList.remove('active'); });
  document.getElementById('calNavBtn').classList.add('active');
  calYear = new Date().getFullYear();
  renderCalLabFilters();
  renderCalendar();
}

function hideCal() {
  document.getElementById('calSection').style.display='none';
  document.querySelectorAll('.kpi-row,.upcoming-section,.charts-row,.toolbar,.tbl-wrap,.log-section').forEach(function(el){ el.style.display=''; });
}

// Override selectLab to hide calendar when a lab is picked
var _origSelectLab = selectLab;
selectLab = function(lab) {
  hideCal();
  _origSelectLab(lab);
};

function calPrevYear(){ calYear--; calSelectedDay=null; document.getElementById('calEqPanel').classList.remove('show'); renderCalendar(); }
function calNextYear(){ calYear++; calSelectedDay=null; document.getElementById('calEqPanel').classList.remove('show'); renderCalendar(); }

function setCalHalf(h){
  calHalf=h;
  calSelectedDay=null;
  document.getElementById('calEqPanel').classList.remove('show');
  document.getElementById('calH1Tab').className='cal-half-tab'+(h===1?' on':'');
  document.getElementById('calH2Tab').className='cal-half-tab'+(h===2?' on':'');
  renderCalendar();
}

function renderCalLabFilters(){
  var LABS=['Chemical Lab','Microbiology Lab Hattar','Microbiology Lab Lahore','Calibration Lab','Physical Lab'];
  var html='<span class="cal-lab-chip'+(calLabFilter==='all'?' on':'')+'" onclick="setCalLab(\'all\')">All Labs</span>';
  LABS.forEach(function(lab){
    var short=lab.replace('Microbiology Lab ','Micro ').replace(' Lab','');
    html+='<span class="cal-lab-chip'+(calLabFilter===lab?' on':'')+'" onclick="setCalLab(\''+lab+'\')">'+short+'</span>';
  });
  document.getElementById('calLabFilters').innerHTML=html;
}

function setCalLab(lab){
  calLabFilter=lab;
  calSelectedDay=null;
  document.getElementById('calEqPanel').classList.remove('show');
  renderCalLabFilters();
  renderCalendar();
}

function getCalEquipment(){
  // Only preventive, bi-annually means PM shows up twice/year
  return equipment.filter(function(e){
    return e.mtype!=='Corrective' && (calLabFilter==='all' || e.lab===calLabFilter);
  });
}

// For bi-annual equipment, compute ALL due dates in calYear
// Primary due = e.due; second due = 6 months apart
function getPMDatesForYear(eq, year){
  var dates=[];
  if(!eq.due) return dates;
  var primary = new Date(eq.due);
  // Generate candidate dates: primary + every 6 months going forward/backward to cover the year
  for(var offset=-4; offset<=4; offset++){
    var d=new Date(primary);
    d.setMonth(d.getMonth() + offset*6);
    if(d.getFullYear()===year){
      dates.push(new Date(d));
    }
  }
  return dates;
}

// Build a map: "YYYY-MM-DD" → array of equipment objects
function buildPMDateMap(){
  var map={};
  var pool=getCalEquipment();
  pool.forEach(function(eq){
    var isBiAnnual = (eq.freq==='Bi-annually');
    var dates = isBiAnnual ? getPMDatesForYear(eq, calYear) : [];
    // For non-bi-annual, still show the single due date if it falls in calYear
    if(!isBiAnnual){
      if(eq.due){
        var d=new Date(eq.due);
        if(d.getFullYear()===calYear) dates.push(d);
      }
    }
    dates.forEach(function(d){
      var key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      if(!map[key]) map[key]=[];
      map[key].push(eq);
    });
  });
  return map;
}

function dayStatus(dateStr){
  // dateStr = "YYYY-MM-DD"
  var today=new Date(); today.setHours(0,0,0,0);
  var d=new Date(dateStr);
  var diff=Math.round((d-today)/86400000);
  if(diff<0) return 'pm-overdue';
  if(diff<=30) return 'pm-soon';
  return 'pm-ok';
}

function renderCalendar(){
  document.getElementById('calYearLabel').textContent=calYear;
  var pmMap=buildPMDateMap();
  var startMonth=calHalf===1?0:6;
  var months=[];
  for(var m=startMonth;m<startMonth+6;m++) months.push(m);
  var today=new Date(); today.setHours(0,0,0,0);

  // Summary counts for this half-year
  var sumTotal=0,sumOk=0,sumSoon=0,sumOver=0;
  Object.keys(pmMap).forEach(function(key){
    var month=parseInt(key.split('-')[1])-1;
    if(months.indexOf(month)<0) return;
    var cnt=pmMap[key].length;
    sumTotal+=cnt;
    var st=dayStatus(key);
    if(st==='pm-ok') sumOk+=cnt;
    else if(st==='pm-soon') sumSoon+=cnt;
    else sumOver+=cnt;
  });
  document.getElementById('calSummary').innerHTML=
    '<div class="cal-sum-box total"><div class="sv">'+sumTotal+'</div><div class="sl">Total PM</div></div>'+
    '<div class="cal-sum-box ok"><div class="sv">'+sumOk+'</div><div class="sl">Compliant</div></div>'+
    '<div class="cal-sum-box soon"><div class="sv">'+sumSoon+'</div><div class="sl">Due Soon</div></div>'+
    '<div class="cal-sum-box overdue"><div class="sv">'+sumOver+'</div><div class="sl">Overdue</div></div>';

  // Render 6 month grids
  var gridHtml='';
  months.forEach(function(m){
    var firstDay=new Date(calYear,m,1).getDay(); // 0=Sun
    var daysInMonth=new Date(calYear,m+1,0).getDate();
    var monthKey=String(m+1).padStart(2,'0');
    // Count PMs in this month
    var monthPMCount=0;
    for(var dd=1;dd<=daysInMonth;dd++){
      var key=calYear+'-'+monthKey+'-'+String(dd).padStart(2,'0');
      if(pmMap[key]) monthPMCount+=pmMap[key].length;
    }
    var hdrColor=m<6?'var(--primary)':'#1a5fa8';
    gridHtml+='<div class="cal-month">';
    gridHtml+='<div class="cal-month-hdr" style="background:'+hdrColor+'">'+MONTH_NAMES[m]+' '+calYear;
    if(monthPMCount>0) gridHtml+='<span class="cal-month-count">'+monthPMCount+' PM</span>';
    gridHtml+='</div>';
    gridHtml+='<div class="cal-month-body">';
    // Day labels
    gridHtml+='<div class="cal-week-row">';
    DAY_LABELS.forEach(function(dl){ gridHtml+='<div class="cal-day-label">'+dl+'</div>'; });
    gridHtml+='</div>';
    // Days
    gridHtml+='<div class="cal-week-row">';
    for(var e2=0;e2<firstDay;e2++) gridHtml+='<div class="cal-day empty"></div>';
    var cellCount=firstDay;
    for(var d2=1;d2<=daysInMonth;d2++){
      var key=calYear+'-'+monthKey+'-'+String(d2).padStart(2,'0');
      var hasPM=!!pmMap[key];
      var isToday=(today.getFullYear()===calYear && today.getMonth()===m && today.getDate()===d2);
      var cls='cal-day';
      if(isToday) cls+=' today';
      if(hasPM){ cls+=' has-pm '+dayStatus(key); }
      var clickAttr=hasPM?'onclick="calDayClick(\''+key+'\')"':'';
      gridHtml+='<div class="'+cls+'" '+clickAttr+'>'+d2+(hasPM&&!isToday?'<span class="cal-day-dot"></span>':'')+'</div>';
      cellCount++;
      if(cellCount%7===0 && d2<daysInMonth){
        gridHtml+='</div><div class="cal-week-row">';
      }
    }
    // fill trailing empties
    var remaining=(7-(cellCount%7))%7;
    for(var r=0;r<remaining;r++) gridHtml+='<div class="cal-day empty"></div>';
    gridHtml+='</div></div></div>';
  });
  document.getElementById('calGrid').innerHTML=gridHtml;
}

function calDayClick(dateKey){
  calSelectedDay=dateKey;
  var pmMap=buildPMDateMap();
  var eqs=pmMap[dateKey]||[];
  var d=new Date(dateKey);
  var label=MONTH_NAMES[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();
  document.getElementById("calEqPanelTitle").textContent="Equipment with PM Due — "+label;
  document.getElementById("calEqPanelSub").textContent=eqs.length+" equipment record"+(eqs.length!==1?"s":"")+" found";
  var stLabel={ok:"✔ Compliant",soon:"⚠ Due Soon",overdue:"✖ Overdue",corrective:"[CM] Corrective"};
  var tbody=document.getElementById("calEqTbody");
  var emptyDiv=document.getElementById("calEqEmpty");
  if(!eqs.length){
    tbody.innerHTML=""; emptyDiv.style.display="block";
  } else {
    emptyDiv.style.display="none";
    tbody.innerHTML=eqs.map(function(eq,i){
      var st=getStatus(eq);
      var h=healthData[eq.id]||null;
      var hHtml=h?"<span class=\"health-badge "+healthClass(h.status)+"\">"+healthIcon(h.status)+" "+h.status+"</span>":"<span class=\"health-badge na\">Not Assessed</span>";
      return "<tr>"
        +"<td class=\"sn-col\">"+(i+1)+"</td>"
        +"<td><span class=\"pm-eq-link\" onclick=\"viewHistory('"+eq.id+"')\">"+eq.name+"</span></td>"
        +"<td><span class=\"code-tag\">"+eq.code+"</span></td>"
        +"<td style=\"font-size:12px;white-space:nowrap\">"+eq.lab+"</td>"
        +"<td style=\"font-size:12px;color:var(--muted)\">"+eq.type+"</td>"
        +"<td style=\"font-size:12px\">"+(eq.person||"—")+"</td>"
        +"<td style=\"font-size:12px;color:var(--muted)\">"+(eq.model||"—")+"</td>"
        +"<td style=\"font-size:12px;white-space:nowrap\">"+fmtDate(eq.last)+"</td>"
        +"<td style=\"font-size:12px\">"+eq.freq+"</td>"
        +"<td><span class=\"badge "+st+"\">"+stLabel[st]+"</span></td>"
        +"<td>"+hHtml+"</td>"
        +"<td style=\"font-size:11px;color:var(--muted);max-width:140px\">"+(eq.notes||"—")+"</td>"
        +"</tr>";
    }).join("");
  }
  document.getElementById("calEqPanel").classList.add("show");
  setTimeout(function(){ document.getElementById("calEqPanel").scrollIntoView({behavior:"smooth",block:"start"}); },80);
}

function exportDayCSV(){
  if(!calSelectedDay) return;
  var pmMap=buildPMDateMap(); var eqs=pmMap[calSelectedDay]||[];
  var stLabel={ok:"Compliant",soon:"Due Soon",overdue:"Overdue",corrective:"Corrective"};
  var headers=["#","Equipment Name","Code","Laboratory","Type","Custodian","Make/Model","Last PM Date","Frequency","PM Status","Health","Notes"];
  var rows=eqs.map(function(eq,i){
    var h=healthData[eq.id]||null;
    return [i+1,eq.name,eq.code,eq.lab,eq.type,eq.person||"",eq.model||"",eq.last||"",eq.freq,stLabel[getStatus(eq)]||"",h?h.status:"Not Assessed",eq.notes||""];
  });
  var csv=[headers].concat(rows).map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(",");}).join("\n");
  dl(csv,"QRI_PM_Due_"+calSelectedDay+".csv","text/csv");
  toast("CSV exported.","ok");
}

function exportDayPDF(){
  if(!calSelectedDay) return;
  var pmMap=buildPMDateMap(); var eqs=pmMap[calSelectedDay]||[];
  var d=new Date(calSelectedDay);
  var dateLabel=MONTH_NAMES[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();
  var stLabel={ok:"Compliant",soon:"Due Soon",overdue:"Overdue",corrective:"Corrective"};
  var stColor={ok:"#1a9e6f",soon:"#d97706",overdue:"#c0392b",corrective:"#6d28d9"};
  var stBg={ok:"#e4f6f0",soon:"#fef3e2",overdue:"#fbeaea",corrective:"#f4f0ff"};
  var logoEl=document.querySelector(".hdr-logo img");
  var logoSrc=logoEl?logoEl.src:"";
  var printDate=new Date().toLocaleDateString("en-PK",{day:"2-digit",month:"long",year:"numeric"});
  var printUser=currentUser?currentUser.role+": "+currentUser.username:"—";
  var labText=calLabFilter==="all"?"All Labs":calLabFilter;
  var cntOk=0,cntSoon=0,cntOver=0,cntCorr=0;
  eqs.forEach(function(eq){var s=getStatus(eq);if(s==="ok")cntOk++;else if(s==="soon")cntSoon++;else if(s==="overdue")cntOver++;else cntCorr++;});
  var TD="padding:8px 9px;border:1px solid #dde2ee;vertical-align:middle;";
  var TH="padding:9px 10px;border:1px solid #2d7dd2;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;";
  function sBox(lbl,val,bg,col){return "<td style='padding:0 5px 0 0'><div style='background:"+bg+";border:1px solid "+col+"44;border-radius:7px;padding:9px 14px;text-align:center;min-width:78px'><div style='font-size:20px;font-weight:800;color:"+col+"'>"+val+"</div><div style='font-size:9px;font-weight:700;text-transform:uppercase;color:"+col+";opacity:.8;margin-top:1px'>"+lbl+"</div></div></td>";}
  var tableRows=eqs.map(function(eq,i){
    var st=getStatus(eq); var h=healthData[eq.id]||null;
    var hTxt=h?h.status:"Not Assessed";
    var hCol=h?({"Excellent":"#0d7a52","Good":"#388e3c","Fair":"#f57c00","Poor":"#d84315","Critical":"#c0392b"}[h.status]||"#6b7698"):"#9aa3bf";
    var bg=i%2===0?"#fff":"#f8f9fc";
    return "<tr style='background:"+bg+"'><td style='"+TD+"text-align:center;width:28px;color:#9aa3bf;font-weight:700;font-size:11px'>"+(i+1)+"</td>"
      +"<td style='"+TD+"font-weight:600;color:#1a2340;font-size:12px'>"+eq.name+"</td>"
      +"<td style='"+TD+"font-family:monospace;font-size:11px;color:#0f4c81;background:#e8f0fa'>"+eq.code+"</td>"
      +"<td style='"+TD+"font-size:11px'>"+eq.lab+"</td>"
      +"<td style='"+TD+"font-size:11px;color:#6b7698'>"+eq.type+"</td>"
      +"<td style='"+TD+"font-size:11px'>"+(eq.person||"—")+"</td>"
      +"<td style='"+TD+"font-size:11px;color:#6b7698'>"+(eq.model||"—")+"</td>"
      +"<td style='"+TD+"font-size:11px;white-space:nowrap'>"+fmtDate(eq.last)+"</td>"
      +"<td style='"+TD+"font-size:11px'>"+eq.freq+"</td>"
      +"<td style='"+TD+"text-align:center'><span style='background:"+stBg[st]+";color:"+stColor[st]+";font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;border:1px solid "+stColor[st]+"44'>"+stLabel[st]+"</span></td>"
      +"<td style='"+TD+"text-align:center;font-size:11px;font-weight:700;color:"+hCol+"'>"+hTxt+"</td>"
      +"<td style='"+TD+"font-size:10px;color:#6b7698'>"+(eq.notes||"—")+"</td></tr>";
  }).join("");
  var html="<!DOCTYPE html><html><head><meta charset='UTF-8'><title>QRI PM — "+dateLabel+"</title>"
    +"<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1a2340;padding:20px}"
    +"@media print{body{padding:0}@page{size:A3 landscape;margin:8mm}}</style></head><body>"
    +"<table style='width:100%;margin-bottom:14px;border:2px solid #0f4c81;border-radius:8px;overflow:hidden'><tr>"
    +"<td style='width:68px;background:#0f4c81;padding:10px;text-align:center;vertical-align:middle'>"+(logoSrc?"<img src='"+logoSrc+"' style='width:50px;height:50px;object-fit:contain;border-radius:5px'>":" QRI ")+"</td>"
    +"<td style='padding:12px 18px;background:#f4f6fb;vertical-align:middle'><div style='font-size:17px;font-weight:700;color:#0f4c81'>Qarshi Research International (Pvt.) Ltd.</div>"
    +"<div style='font-size:11px;color:#6b7698;margin-top:3px'>Quality Assurance Department — Equipment Maintenance Division</div></td>"
    +"<td style='padding:12px 18px;background:#f4f6fb;text-align:right;vertical-align:middle;white-space:nowrap'>"
    +"<div style='font-size:10px;color:#9aa3bf;text-transform:uppercase;letter-spacing:.06em'>Document Type</div>"
    +"<div style='font-size:14px;font-weight:700;color:#0f4c81;margin-top:2px'>PM Schedule Report</div>"
    +"<div style='font-size:10px;color:#9aa3bf;margin-top:4px'>Printed: "+printDate+"</div></td></tr></table>"
    +"<div style='background:linear-gradient(135deg,#0f4c81,#2d7dd2);color:#fff;border-radius:8px;padding:14px 20px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between'>"
    +"<div><div style='font-size:16px;font-weight:700;margin-bottom:4px'>PM Due Date: "+dateLabel+"</div>"
    +"<div style='font-size:11px;opacity:.75'>Preventive maintenance schedule | Lab: "+labText+"</div></div>"
    +"<div style='background:rgba(255,255,255,.18);border-radius:8px;padding:10px 20px;text-align:center'>"
    +"<div style='font-size:28px;font-weight:800'>"+eqs.length+"</div><div style='font-size:10px;opacity:.8'>Equipment</div></div></div>"
    +"<table style='margin-bottom:14px'><tr>"
    +"<td style='padding-right:10px'><div style='background:#f4f6fb;border:1px solid #dde2ee;border-radius:7px;padding:9px 14px;min-width:110px'>"
    +"<div style='font-size:9px;font-weight:700;text-transform:uppercase;color:#9aa3bf'>Generated By</div>"
    +"<div style='font-size:13px;font-weight:600;color:#1a2340;margin-top:3px'>"+printUser+"</div></div></td>"
    +"<td style='padding-right:10px'><div style='background:#f4f6fb;border:1px solid #dde2ee;border-radius:7px;padding:9px 14px;min-width:110px'>"
    +"<div style='font-size:9px;font-weight:700;text-transform:uppercase;color:#9aa3bf'>Lab Filter</div>"
    +"<div style='font-size:13px;font-weight:600;color:#1a2340;margin-top:3px'>"+labText+"</div></div></td>"
    +"<td><table><tr>"+sBox("Compliant",cntOk,"#e4f6f0","#1a9e6f")+sBox("Due Soon",cntSoon,"#fef3e2","#d97706")+sBox("Overdue",cntOver,"#fbeaea","#c0392b")+sBox("Corrective",cntCorr,"#f4f0ff","#6d28d9")+"</tr></table></td></tr></table>"
    +"<table style='width:100%;border-collapse:collapse;margin-bottom:18px'>"
    +"<thead><tr style='background:#0f4c81;color:#fff'>"
    +"<th style='"+TH+"text-align:center;width:28px'>#</th><th style='"+TH+"'>Equipment Name</th><th style='"+TH+"'>Code</th>"
    +"<th style='"+TH+"'>Laboratory</th><th style='"+TH+"'>Type</th><th style='"+TH+"'>Custodian</th>"
    +"<th style='"+TH+"'>Make / Model</th><th style='"+TH+"'>Last PM Date</th><th style='"+TH+"'>Frequency</th>"
    +"<th style='"+TH+"text-align:center'>PM Status</th><th style='"+TH+"text-align:center'>Health</th><th style='"+TH+"'>Notes</th>"
    +"</tr></thead><tbody>"+tableRows+"</tbody>"
    +"<tfoot><tr style='background:#f0f2f7'><td colspan='12' style='padding:7px 10px;border:1px solid #dde2ee;font-size:10px;color:#6b7698;font-style:italic'>"
    +"Total: "+eqs.length+" record"+(eqs.length!==1?"s":"")+" | PM Date: "+dateLabel+" | Lab: "+labText+"</td></tr></tfoot></table>"
    +"<table style='width:100%'><tr>"
    +"<td style='width:33%;padding:6px 18px;border-top:2px solid #1a2340;text-align:center;font-size:10px;color:#6b7698'><div style='font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:26px'>Prepared By</div>Name &amp; Designation / Date</td>"
    +"<td style='width:33%;padding:6px 18px;border-top:2px solid #1a2340;text-align:center;font-size:10px;color:#6b7698'><div style='font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:26px'>Reviewed By</div>QA Manager / Date</td>"
    +"<td style='width:33%;padding:6px 18px;border-top:2px solid #1a2340;text-align:center;font-size:10px;color:#6b7698'><div style='font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:26px'>Approved By</div>Head of Department / Date</td>"
    +"</tr></table>"
    +"<div style='margin-top:14px;padding-top:8px;border-top:1px solid #dde2ee;display:flex;justify-content:space-between;font-size:9px;color:#9aa3bf'>"
    +"<span>Qarshi Research International (Pvt.) Ltd. — Confidential — For Internal Use Only</span>"
    +"<span>Printed: "+printDate+" | User: "+printUser+"</span></div></body></html>";
  var w=window.open("","_blank");
  if(w){w.document.write(html);w.document.close();setTimeout(function(){w.focus();w.print();},700);}
  toast("PDF opened for printing.","ok");
}
function exportCalCSV(){
  var pmMap=buildPMDateMap();
  var startMonth=calHalf===1?0:6;
  var rows=[['Date','Month','Equipment Name','Code','Lab','Type','Frequency','PM Status']];
  var today=new Date(); today.setHours(0,0,0,0);
  for(var m=startMonth;m<startMonth+6;m++){
    var daysInMonth=new Date(calYear,m+1,0).getDate();
    for(var d=1;d<=daysInMonth;d++){
      var key=calYear+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      if(pmMap[key]){
        pmMap[key].forEach(function(eq){
          var diff=Math.round((new Date(key)-today)/86400000);
          var st=diff<0?'Overdue':diff<=30?'Due Soon':'Compliant';
          rows.push([key,MONTH_NAMES[m],eq.name,eq.code,eq.lab,eq.type,eq.freq,st]);
        });
      }
    }
  }
  var csv=rows.map(function(r){return r.map(function(c){return'"'+String(c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  dl(csv,'QRI_PM_Calendar_'+calYear+'_H'+calHalf+'.csv','text/csv');
  toast('Calendar exported to CSV.','ok');
}

// ── KEYBOARD SHORTCUT ──
document.addEventListener('keydown',function(e){ if((e.ctrlKey||e.metaKey)&&e.key==='s'){ e.preventDefault(); if(currentUser) manualSave(); } });

// ── LIFECYCLE INITIALIZER ──
loadHealth();
var sessionRestored = restoreSession();
if(sessionRestored){
  loadData();
  refreshAll();
  tick();
}
setInterval(tick,60000);
