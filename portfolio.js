(() => {
  const storageKey = 'sitepulse-project-plans';
  const defaultPlans = {
    reliance: { milestones:[['Site handover', 'Completed', '20 Aug', true],['Ceiling & electrical rough-in','Completed','27 Aug',true],['Flooring and lighting','In progress','31 Aug',false],['Final inspection','Upcoming','04 Sep',false]], tasks:[['Confirm LED panel delivery','Rohan','30 Aug','High','Waiting',false],['Complete Zone C flooring','Manoj','30 Aug','High','In progress',false],['Verify ceiling finish - Zone A','Aditi','29 Aug','Medium','Ready',true],['Book final inspection','Anushka','03 Sep','Low','Not started',false]] },
    loft: { milestones:[['Waterproofing', 'Completed', '24 Aug', true],['Bathroom tiling','In progress','31 Aug',false],['Lobby stone cladding','Blocked','03 Sep',false],['Client walkthrough','Upcoming','08 Sep',false]], tasks:[['Obtain stone dispatch note','Karan','29 Aug','High','Waiting',false],['Complete bathroom tiles','Sanjay','31 Aug','Medium','In progress',false],['Review waterproofing test','Aditi','29 Aug','Low','Ready',true]] },
    nexa: { milestones:[['Joinery installation', 'Completed', '26 Aug', true],['Signage installation','In progress','30 Aug',false],['Visual merchandising','Upcoming','01 Sep',false],['Store opening','Upcoming','05 Sep',false]], tasks:[['Finish storefront signage','Ishaan','30 Aug','High','In progress',false],['Schedule final cleaning','Anushka','31 Aug','Medium','Not started',false],['Test cash counter','Neha','29 Aug','Low','Ready',true]] }
  };
  const getPlans = () => JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(defaultPlans));
  const savePlans = plans => localStorage.setItem(storageKey, JSON.stringify(plans));
  let selected = state.projects[0].id;

  function options() { document.querySelector('#planner-project-select').innerHTML = state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join(''); }
  function planFor(id) { const plans = getPlans(); return plans[id] || { milestones:[], tasks:[] }; }
  function relatedUpdates(id) { return state.updates.filter(u => u.projectId === id); }
  function renderPlanner() {
    const plan = planFor(selected), updates = relatedUpdates(selected), completed = plan.tasks.filter(t => t[5]).length, atRisk = plan.tasks.filter(t => t[3] === 'High' && !t[5]).length;
    document.querySelector('#planner-project-select').value = selected;
    document.querySelector('#planner-metrics').innerHTML = [
      ['Delivery progress', `${project(selected).progress}%`, 'portfolio health'],
      ['Open tasks', String(plan.tasks.length - completed).padStart(2,'0'), 'assigned to site team'],
      ['High priority', String(atRisk).padStart(2,'0'), 'need attention'],
      ['Updates logged', String(updates.length).padStart(2,'0'), 'project history']
    ].map(([label,value,sub]) => `<article class="planner-metric"><p>${label}</p><strong>${value}</strong><span>${sub}</span></article>`).join('');
    const milestoneDone = plan.milestones.filter(m => m[3]).length;
    document.querySelector('#milestone-progress').textContent = `${Math.round(milestoneDone / Math.max(plan.milestones.length,1) * 100)}% complete`;
    document.querySelector('#milestone-list').innerHTML = plan.milestones.map(m => `<div class="milestone"><span class="milestone-dot ${m[3]?'':'pending'}"><i data-lucide="${m[3]?'check':'circle'}"></i></span><div><strong>${m[0]}</strong><small>${m[1]}</small></div><time>${m[2]}</time></div>`).join('') || '<p class="muted">Add a milestone to begin planning.</p>';
    document.querySelector('#task-list').innerHTML = plan.tasks.map((t, i) => `<tr class="${t[5]?'done':''}"><td><input class="task-check" data-task="${i}" type="checkbox" ${t[5]?'checked':''}></td><td><strong>${t[0]}</strong></td><td>${t[1]}</td><td>${t[2]}</td><td><span class="priority ${t[3].toLowerCase()}">${t[3].toUpperCase()}</span></td><td><span class="status-chip ${t[4]==='Waiting'?'waiting':''}">${t[5]?'DONE':t[4].toUpperCase()}</span></td></tr>`).join('') || '<tr><td colspan="6" class="muted">No tasks planned yet.</td></tr>';
    document.querySelector('#task-open-count').textContent = `${plan.tasks.length - completed} open`;
    document.querySelectorAll('.task-check').forEach(box => box.addEventListener('change', () => { const plans=getPlans(); plans[selected].tasks[box.dataset.task][5]=box.checked; savePlans(plans); renderPlanner(); window.lucide?.createIcons(); }));
    window.lucide?.createIcons();
  }
  function renderSafety() {
    const checks=['PPE verified for all active crews','Work area and exits are clear','Electrical work permit is reviewed','Toolbox talk completed before shift'];
    const saved=JSON.parse(localStorage.getItem(`sitepulse-safety-${selected}`)||'{}');
    document.querySelector('#safety-list').innerHTML=checks.map((text,i)=>`<label class="safety-item"><input class="safety-check" data-check="${i}" type="checkbox" ${saved[i]?'checked':''}><span>${text}</span></label>`).join('');
  }
  function renderAll(){renderPlanner();renderSafety();}
  function makeDigest(){ const updates=relatedUpdates(selected), plan=planFor(selected), complete=updates.flatMap(u=>u.completed).slice(0,3), risks=updates.flatMap(u=>u.risks).slice(0,2), open=plan.tasks.filter(t=>!t[5]&&t[3]==='High').map(t=>t[0]); const output=document.querySelector('#digest-output'); output.hidden=false; output.innerHTML=`<strong>${project(selected).name} — weekly stand-up</strong><br><br><strong>Wins:</strong> ${complete.length?complete.join(' · '):'No completed work is logged yet.'}<br><strong>Risks:</strong> ${risks.length?risks.join(' '):'No active risks logged.'}<br><strong>Next focus:</strong> ${open.length?open.join(' · '):'Keep in-progress tasks moving and close the next milestone.'}`; }
  function addTask(){ const title=prompt('Task title'); if(!title?.trim())return; const owner=prompt('Task owner','Site supervisor')||'Site supervisor'; const due=prompt('Due date','31 Aug')||'TBD'; const priority=prompt('Priority: High, Medium, or Low','Medium')||'Medium'; const plans=getPlans(); if(!plans[selected])plans[selected]={milestones:[],tasks:[]}; plans[selected].tasks.unshift([title.trim(),owner,due,['High','Medium','Low'].includes(priority)?priority:'Medium','Not started',false]);savePlans(plans);renderPlanner();showToast('Task added to the execution board'); }
  function backup(){ const data={sitepulseData:state,plans:getPlans(),exportedAt:new Date().toISOString()}; const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})); const a=document.createElement('a');a.href=url;a.download='sitepulse-backup.json';a.click();URL.revokeObjectURL(url); }
  function restore(file){ const reader=new FileReader(); reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!data.sitepulseData||!data.plans)throw new Error();localStorage.setItem('sitepulse-data',JSON.stringify(data.sitepulseData));localStorage.setItem(storageKey,JSON.stringify(data.plans));location.reload()}catch{showToast('That backup file could not be restored')}};reader.readAsText(file); }
  options(); renderAll();
  document.querySelector('#planner-project-select').addEventListener('change',e=>{selected=e.target.value;renderAll()});
  document.querySelector('#new-task').addEventListener('click',addTask);document.querySelector('#generate-digest').addEventListener('click',makeDigest);document.querySelector('#backup-workspace').addEventListener('click',backup);document.querySelector('#restore-workspace').addEventListener('change',e=>e.target.files[0]&&restore(e.target.files[0]));
  document.querySelector('#save-safety').addEventListener('click',()=>{const completed={};document.querySelectorAll('.safety-check').forEach(c=>completed[c.dataset.check]=c.checked);localStorage.setItem(`sitepulse-safety-${selected}`,JSON.stringify(completed));showToast('Safety check saved for today')});
  document.querySelector('[data-view="planner"]').addEventListener('click',()=>{document.querySelector('#page-title').textContent='Project planner';renderAll()});
})();
