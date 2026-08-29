const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const today = '29 Aug 2026';
const seed = {
  projects: [
    { id: 'reliance', name: 'Reliance Office – Delhi', location: 'Delhi NCR', progress: 68, status: 'On track', color: 'blue' },
    { id: 'loft', name: 'The Loft Residences', location: 'Gurugram', progress: 42, status: 'At risk', color: 'orange' },
    { id: 'nexa', name: 'Nexa Retail Fitout', location: 'Noida', progress: 84, status: 'On track', color: 'green' }
  ],
  updates: [
    { id:'u1', projectId:'reliance', date:today, summary:'False ceiling completed in Zone A. Electrical conduits installed in Zone B. Flooring is ongoing in Zone C.', completed:['False ceiling completed in Zone A','Electrical conduits installed in Zone B'], inProgress:['Flooring work in Zone C'], pending:['LED panel installation in Zone B'], materials:['20 LED panels pending from Lumos Electrical'], issues:['Vendor delivery confirmation is awaited'], risks:['Electrical work may be delayed if LED panels do not arrive tomorrow.'], actions:['Follow up with Lumos Electrical vendor','Confirm LED panel delivery by 10 AM','Schedule installation after materials arrive'] },
    { id:'u2', projectId:'loft', date:today, summary:'Bathroom waterproofing is complete. Tile work is in progress, but the stone shipment is delayed by two days.', completed:['Bathroom waterproofing completed'], inProgress:['Bathroom tile installation'], pending:['Stone cladding in lobby'], materials:['Lobby stone shipment delayed by 2 days'], issues:['Supplier has not shared revised dispatch note'], risks:['Lobby handover milestone is at risk due to late stone delivery.'], actions:['Escalate revised delivery commitment','Resequence lobby work with contractor'] },
    { id:'u3', projectId:'nexa', date:today, summary:'All joinery installation completed. Storefront signage is being installed.', completed:['Joinery installation completed','Cash counter testing completed'], inProgress:['Storefront signage installation'], pending:['Final cleaning and visual merchandising'], materials:[], issues:[], risks:[], actions:['Plan final cleaning crew','Confirm VM team arrival'] },
    { id:'u4', projectId:'reliance', date:'28 Aug 2026', summary:'Painting completed in meeting rooms. HVAC grille delivery is pending.', completed:['Meeting room painting completed'], inProgress:['HVAC balancing'], pending:['HVAC grille installation'], materials:['HVAC grilles pending'], issues:[], risks:['HVAC commissioning may shift if grilles remain unavailable.'], actions:['Check HVAC grille supplier status'] }
  ]
};
let state = JSON.parse(localStorage.getItem('sitepulse-data') || 'null') || seed;
let selectedReport = state.updates[0].id;
const save = () => localStorage.setItem('sitepulse-data', JSON.stringify(state));
const project = (id) => state.projects.find(p => p.id === id);
const esc = (text) => String(text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
function fillSelects(){
  const options = state.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
  $('#project-select').innerHTML=options; $('#chat-project-select').innerHTML=options;
  $('#report-project-filter').innerHTML='<option value="all">All projects</option>'+options;
}
function icon(name){return `<i data-lucide="${name}"></i>`}
function renderDashboard(){
  const todayUpdates=state.updates.filter(u=>u.date===today); const all=u=>u.completed.length; const materials=state.updates.flatMap(u=>u.materials); const risks=state.updates.flatMap(u=>u.risks);
  $('#stat-projects').textContent=String(state.projects.length).padStart(2,'0'); $('#stat-updates').textContent=String(todayUpdates.length).padStart(2,'0'); $('#stat-completed').textContent=state.updates.reduce((n,u)=>n+all(u),0).toString().padStart(2,'0'); $('#stat-materials').textContent=String(materials.length).padStart(2,'0');
  $('#recent-updates').innerHTML=state.updates.slice(0,4).map((u,i)=>`<div class="update-row"><span class="project-dot ${i===1?'orange-dot':i===2?'green-dot':''}"></span><div><strong>${esc(project(u.projectId).name)}</strong><small>${esc(u.completed[0] || u.inProgress[0] || u.summary.slice(0,60))}</small></div><time>${u.date===today?'TODAY':u.date.slice(0,6).toUpperCase()}</time></div>`).join('');
  const riskEntries=state.updates.flatMap(u=>u.risks.map(r=>({r,u}))).slice(0,3); $('#risk-count').textContent=`${String(riskEntries.length).padStart(2,'0')} open`;
  $('#risk-list').innerHTML=riskEntries.length ? riskEntries.map(({r,u},i)=>`<div class="risk-item"><div><strong>${esc(project(u.projectId).name)}</strong><span class="severity ${i?'med':''}">${i?'MEDIUM':'HIGH'} RISK</span></div><p>${esc(r)}</p></div>`).join('') : '<p class="muted">No open risks. Great work.</p>';
  $('#project-health').innerHTML=state.projects.map(p=>{const us=state.updates.filter(u=>u.projectId===p.id); return `<div class="health-item"><div class="health-top"><strong>${esc(p.name)}</strong><span>${p.progress}%</span></div><div class="progress-bar"><span style="width:${p.progress}%;background:${p.status==='At risk'?'#ec8b2d':'#3458ee'}"></span></div><small>${p.status} · ${us.flatMap(u=>u.risks).length} active risk${us.flatMap(u=>u.risks).length===1?'':'s'}</small></div>`}).join('');
}
function renderReports(){
  const filter=$('#report-project-filter').value; const list=state.updates.filter(u=>filter==='all'||u.projectId===filter); if(!list.some(u=>u.id===selectedReport))selectedReport=list[0]?.id;
  $('#report-list').innerHTML=list.map(u=>`<button class="report-item ${u.id===selectedReport?'active':''}" data-report="${u.id}"><strong>${esc(project(u.projectId).name)}</strong><span>${u.date} · ${u.completed.length+u.inProgress.length} work signals</span></button>`).join('') || '<p class="muted">No reports in this project.</p>';
  const u=state.updates.find(x=>x.id===selectedReport); if(!u){$('#report-detail').innerHTML='<p class="muted">Choose a report to view it here.</p>';return}
  const sections=[['Completed',u.completed,'circle-check-big'],['In progress',u.inProgress,'loader-circle'],['Pending',u.pending,'clock-3'],['Material issues',u.materials,'package-x'],['Site issues',u.issues,'triangle-alert'],['Risks',u.risks,'shield-alert'],['Recommended actions',u.actions,'list-todo']].filter(([,a])=>a.length);
  $('#report-detail').innerHTML=`<div class="report-header"><div class="report-logo"><span>site<span style="color:#3458ee">pulse</span> / DAILY REPORT</span><span>${u.date}</span></div><h2>${esc(project(u.projectId).name)}</h2><p>${esc(project(u.projectId).location)} · Generated from field update</p></div>${sections.map(([name,items,ic])=>`<div class="report-section ${name==='Risks'?'risk':''}"><h4>${icon(ic)} ${name.toUpperCase()}</h4><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}`;
  $$('.report-item').forEach(b=>b.onclick=()=>{selectedReport=b.dataset.report;renderReports();lucide.createIcons()});
}
function renderProjects(){ $('#project-cards').innerHTML=state.projects.map(p=>{const us=state.updates.filter(u=>u.projectId===p.id);const c=us.reduce((a,u)=>a+u.completed.length,0);return `<article class="project-card panel"><header><span class="project-dot ${p.color==='green'?'green-dot':p.color==='orange'?'orange-dot':''}"></span><span class="badge" style="${p.status==='At risk'?'background:#fff0dc;color:#c77a1d':''}">${p.status.toUpperCase()}</span></header><h3>${esc(p.name)}</h3><p>${esc(p.location)}</p><div class="progress-bar"><span style="width:${p.progress}%;background:${p.status==='At risk'?'#ec8b2d':'#3458ee'}"></span></div><footer><span>${p.progress}% complete</span><span>${c} tasks completed</span></footer></article>`}).join('')}
function analyzeText(text, material, issue){
  const sentences=(text+' '+material+' '+issue).split(/[.\n;]+/).map(s=>s.trim()).filter(Boolean); let completed=[],inProgress=[],pending=[],materials=[],issues=[];
  sentences.forEach(s=>{const l=s.toLowerCase(); if(/completed|finished|installed|done|ready/.test(l)&&!/not\s+(completed|done|ready)/.test(l))completed.push(s); else if(/in progress|ongoing|started|being |work is/.test(l))inProgress.push(s); else if(/pending|awaited|not arrived|not received|waiting|to be/.test(l))pending.push(s); if(/material|vendor|delivery|panel|cement|tile|stone|shipment|supply|shortage/.test(l)) materials.push(s); if(/delay|issue|blocker|unable|rain|damage|safety|slip/.test(l))issues.push(s)});
  if(material.trim()&&!materials.includes(material.trim()))materials.push(material.trim()); if(issue.trim()&&!issues.includes(issue.trim()))issues.push(issue.trim());
  if(!completed.length)completed=['No completed work explicitly identified in today’s update']; if(!inProgress.length)inProgress=['No in-progress work explicitly identified'];
  const risks=[]; if(materials.length)risks.push(`Dependent work may be delayed if ${materials[0].replace(/[.]+$/,'').toLowerCase()} is not resolved promptly.`); if(issues.length)risks.push(`Schedule certainty is reduced because: ${issues[0]}`); if(!risks.length&&pending.length)risks.push(`Pending activity needs confirmation to protect the next workday plan.`);
  const actions=[]; if(materials.length)actions.push('Follow up with the concerned vendor and confirm a delivery time'); if(issues.length)actions.push('Assign an owner and recovery plan for the reported site issue'); if(inProgress.length)actions.push('Review in-progress work at tomorrow’s morning site coordination'); if(pending.length)actions.push('Confirm prerequisites and schedule the pending work');
  return {completed,inProgress,pending,materials,issues,risks,actions:actions.length?actions:['Review the update with the site supervisor and plan tomorrow’s activities']};
}
function showToast(text){$('#toast span').textContent=text;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),3000)}
function ask(question){
  const pid=$('#chat-project-select').value, us=state.updates.filter(u=>u.projectId===pid), q=question.toLowerCase(); const all=k=>us.flatMap(u=>u[k]); let answer;
  if(/delay|risk|block/.test(q)){const r=all('risks').concat(all('issues'));answer=r.length?`The key blockers are: ${r.slice(0,3).join(' ')}`:'There are no logged delay risks for this project right now.'}
  else if(/material|urgent|supply|vendor/.test(q)){const m=all('materials');answer=m.length?`The materials needing attention: ${m.slice(0,3).join(' ')}`:'No material shortages are logged in the stored updates.'}
  else if(/completed|this week|done/.test(q)){const c=all('completed');answer=c.length?`Recent completed work: ${c.slice(0,5).join(' ')}`:'No completed tasks have been logged yet.'}
  else if(/tomorrow|priorit|next/.test(q)){const a=all('actions');answer=a.length?`Tomorrow’s priority actions: ${a.slice(0,3).join(' ')}`:'Start with a site walk-through and confirm pending activities.'}
  else {const progress=project(pid).progress;answer=`${project(pid).name} is ${progress}% complete. Latest update: ${us[0]?.summary||'No update recorded yet.'}`}
  $('#chat-messages').insertAdjacentHTML('beforeend',`<div class="message user"><p>${esc(question)}</p></div><div class="message assistant"><span class="chat-avatar">✦</span><p>${esc(answer)}</p></div>`); $('#chat-messages').scrollTop=99999;
}
function goView(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===view));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#page-title').textContent=view==='dashboard'?'Good morning, Anushka':view==='updates'?'Daily site update':view==='reports'?'Progress reports':'Project directory';window.scrollTo(0,0)}
function init(){fillSelects();renderDashboard();renderReports();renderProjects();lucide.createIcons();
  $$('.nav-item').forEach(b=>b.onclick=()=>goView(b.dataset.view));$$('[data-go-update]').forEach(b=>b.onclick=()=>goView('updates'));$$('[data-view-link]').forEach(b=>b.onclick=()=>goView(b.dataset.viewLink));$('#report-project-filter').onchange=renderReports;
  $$('.prompt-chip').forEach(b=>b.onclick=()=>{$('#work-update').value+=($('#work-update').value?'\n':'')+b.dataset.prompt});
  $('#photo-input').onchange=e=>{$('#photo-preview').innerHTML=[...e.target.files].slice(0,10).map(f=>`<img src="${URL.createObjectURL(f)}" alt="Site photo preview">`).join('')};
  $('#update-form').onsubmit=e=>{e.preventDefault();const pid=$('#project-select').value,summary=$('#work-update').value.trim(), a=analyzeText(summary,$('#material-update').value,$('#issue-update').value);const u={id:'u'+Date.now(),projectId:pid,date:today,summary,...a};state.updates.unshift(u);save();selectedReport=u.id;renderDashboard();renderReports();renderProjects();lucide.createIcons();e.target.reset();$('#photo-preview').innerHTML='';showToast('Update analyzed and report created');goView('reports')};
  $('#chat-form').onsubmit=e=>{e.preventDefault();const q=$('#chat-input').value.trim();if(q){ask(q);$('#chat-input').value=''}};$$('.question-suggestions button').forEach(b=>b.onclick=()=>ask(b.textContent));
  $('#new-project').onclick=()=>{const name=prompt('Project name');if(name?.trim()){const id='p'+Date.now();state.projects.push({id,name:name.trim(),location:'New site',progress:0,status:'On track',color:'blue'});save();fillSelects();renderDashboard();renderProjects();showToast('Project created')}};
}
init();
