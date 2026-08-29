(() => {
  const vendorKey = 'sitepulse-vendor-deliveries';
  const resolvedKey = 'sitepulse-resolved-issues';
  const seedVendors = [
    {projectId:'reliance', material:'LED panels · 20 units', vendor:'Lumos Electrical', due:'30 Aug', status:'Pending confirmation'},
    {projectId:'reliance', material:'HVAC grilles', vendor:'Airflow Systems', due:'01 Sep', status:'Scheduled'},
    {projectId:'loft', material:'Lobby stone slabs', vendor:'Artemis Stone', due:'31 Aug', status:'Delayed'},
    {projectId:'nexa', material:'Storefront signage', vendor:'BrightSign Co.', due:'30 Aug', status:'In transit'}
  ];
  const getVendors = () => JSON.parse(localStorage.getItem(vendorKey) || JSON.stringify(seedVendors));
  const saveVendors = data => localStorage.setItem(vendorKey, JSON.stringify(data));
  const getResolved = () => JSON.parse(localStorage.getItem(resolvedKey) || '{}');
  const saveResolved = data => localStorage.setItem(resolvedKey, JSON.stringify(data));
  let selected = state.projects[0].id;
  const sel = id => document.querySelector(id);
  const updates = () => state.updates.filter(u => u.projectId === selected);
  const signals = key => updates().flatMap(u => u[key]);
  function fillOptions(){ ['#insights-project-select'].forEach(id => sel(id).innerHTML=state.projects.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')); }
  function metric(label,value,caption){return `<article class="insight-metric"><p>${label}</p><strong>${value}</strong><small>${caption}</small></article>`}
  function renderInsights(){
    sel('#insights-project-select').value=selected;
    const complete=signals('completed'), progress=signals('inProgress'), risks=signals('risks'), materials=signals('materials');
    sel('#insight-metrics').innerHTML=[metric('Project progress',`${project(selected).progress}%`,'overall delivery health'),metric('Completed work',String(complete.length).padStart(2,'0'),'logged activities'),metric('Active risks',String(risks.length).padStart(2,'0'),risks.length?'requires review':'no elevated risk'),metric('Material signals',String(materials.length).padStart(2,'0'),'supply dependencies')].join('');
    const count=Math.max(complete.length,1); const bars=[2,3,1,4,3,5,complete.length].map((n,i)=>Math.min(100,Math.round(n/Math.max(count,5)*100))); const days=['Sat','Sun','Mon','Tue','Wed','Thu','Today'];
    sel('#completion-chart').innerHTML=bars.map((n,i)=>`<div class="chart-column"><span>${n===0?'':Math.round(n/20)}</span><i class="chart-bar" style="height:${Math.max(n,8)}%"></i><small>${days[i]}</small></div>`).join('');
    const high=risks.length, medium=signals('issues').length, low=Math.max(progress.length-high,0), max=Math.max(high,medium,low,1);
    sel('#risk-breakdown').innerHTML=[['High',high,''],['Medium',medium,'medium'],['Watch',low,'low']].map(([label,value,kind])=>`<div class="risk-band"><span>${label}</span><div class="risk-line"><i class="${kind}" style="width:${value/max*100}%"></i></div><strong>${String(value).padStart(2,'0')}</strong></div>`).join('');
    const p=project(selected); sel('#project-signals').innerHTML=[['Schedule health',p.status],['Current work',progress[0]||'No active work recorded'],['Next dependency',materials[0]||'No material issue recorded']].map(([a,b])=>`<div class="signal"><strong>${a}</strong><span>${b}</span></div>`).join('');
  }
  function renderLogistics(){
    const vendors=getVendors(), scope=vendors.filter(v=>v.projectId===selected); const materials=signals('materials'), rawIssues=updates().flatMap(u=>[...u.risks,...u.issues]); const resolved=getResolved(); const issues=rawIssues.filter(x=>!resolved[`${selected}:${x}`]);
    sel('#logistics-metrics').innerHTML=[metric('Tracked deliveries',String(scope.length).padStart(2,'0'),'current vendor records'),metric('Delayed deliveries',String(scope.filter(x=>x.status==='Delayed').length).padStart(2,'0'),'needs supplier follow-up'),metric('Material signals',String(materials.length).padStart(2,'0'),'from site updates'),metric('Open blockers',String(issues.length).padStart(2,'0'),'in issue register')].join('');
    sel('#vendor-list').innerHTML=scope.map((v,i)=>{const cls=v.status==='Delayed'?'delayed':v.status.includes('Pending')?'pending':'';return `<div class="vendor-row"><div><strong>${v.material}</strong><small>${v.vendor} · expected ${v.due}</small></div><div><span class="delivery-status ${cls}">${v.status.toUpperCase()}</span><select class="vendor-status" data-index="${vendors.indexOf(v)}"><option ${v.status==='Scheduled'?'selected':''}>Scheduled</option><option ${v.status==='In transit'?'selected':''}>In transit</option><option ${v.status==='Delivered'?'selected':''}>Delivered</option><option ${v.status==='Delayed'?'selected':''}>Delayed</option><option ${v.status==='Pending confirmation'?'selected':''}>Pending confirmation</option></select></div></div>`}).join('')||'<p class="muted">No vendor deliveries for this project.</p>';
    sel('#issue-count').textContent=`${issues.length} open`; sel('#issue-list').innerHTML=issues.map((issue,i)=>`<div class="issue-row ${i?'medium':''}"><strong>${issue}</strong><footer><small>${i?'MEDIUM':'HIGH'} · ${project(selected).name}</small><button class="resolve-issue" data-issue="${encodeURIComponent(issue)}">Mark resolved</button></footer></div>`).join('')||'<p class="muted">No unresolved site blockers. Great work.</p>';
    document.querySelectorAll('.vendor-status').forEach(input=>input.addEventListener('change',()=>{const all=getVendors();all[input.dataset.index].status=input.value;saveVendors(all);renderLogistics();}));
    document.querySelectorAll('.resolve-issue').forEach(btn=>btn.addEventListener('click',()=>{const r=getResolved();r[`${selected}:${decodeURIComponent(btn.dataset.issue)}`]=true;saveResolved(r);renderLogistics();showToast('Issue moved to resolved') }));
  }
  function addVendor(){const material=prompt('Material and quantity');if(!material?.trim())return;const vendor=prompt('Vendor name','New vendor')||'New vendor';const due=prompt('Expected delivery date','TBD')||'TBD';const data=getVendors();data.unshift({projectId:selected,material,vendor,due,status:'Scheduled'});saveVendors(data);renderLogistics();showToast('Vendor delivery added');}
  function renderAll(){renderInsights();renderLogistics();window.lucide?.createIcons();}
  fillOptions();renderAll();
  sel('#insights-project-select').addEventListener('change',e=>{selected=e.target.value;renderAll()});sel('#new-vendor').addEventListener('click',addVendor);
  sel('[data-view="insights"]').addEventListener('click',()=>{sel('#page-title').textContent='Portfolio insights';renderInsights()});sel('[data-view="logistics"]').addEventListener('click',()=>{sel('#page-title').textContent='Materials & vendors';renderLogistics()});
})();
