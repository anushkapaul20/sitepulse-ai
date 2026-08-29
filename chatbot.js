(() => {
  const historyKey = 'sitepulse-chat-history';
  const box = document.querySelector('#chat-messages');
  const projectSelect = document.querySelector('#chat-project-select');
  const input = document.querySelector('#chat-input');
  const esc = text => String(text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const histories = () => JSON.parse(localStorage.getItem(historyKey) || '{}');
  const saveHistories = h => localStorage.setItem(historyKey, JSON.stringify(h));
  const activeProject = () => projectSelect.value;
  const currentUpdates = () => state.updates.filter(u => u.projectId === activeProject());
  const projectName = () => project(activeProject()).name;
  function renderHistory(){
    const list = histories()[activeProject()] || [];
    document.querySelector('#chat-context-count').textContent = `${currentUpdates().length} update${currentUpdates().length===1?'':'s'} in context`;
    box.innerHTML = list.length ? list.map(m => `<div class="message ${m.role}">${m.role==='assistant'?'<span class="chat-avatar">✦</span>':''}<p>${esc(m.text)}<span class="chat-time">${m.time}</span></p></div>`).join('') : `<div class="chat-empty"><span class="chat-avatar">✦</span><strong>Ask about ${esc(projectName())}</strong><br>I’ll use its saved updates, materials, tasks, risks, and vendor deliveries.</div>`;
    box.scrollTop=box.scrollHeight;
  }
  function projectAnswer(question){
    const q=question.toLowerCase(), updates=currentUpdates(), all=key=>updates.flatMap(u=>u[key]||[]), plans=JSON.parse(localStorage.getItem('sitepulse-project-plans')||'{}'), plan=plans[activeProject()]||{tasks:[]}, vendors=JSON.parse(localStorage.getItem('sitepulse-vendor-deliveries')||'[]').filter(v=>v.projectId===activeProject());
    const risks=all('risks').concat(all('issues')), materials=all('materials'), actions=all('actions'), completed=all('completed'), progress=all('inProgress'), openTasks=plan.tasks.filter(t=>!t[5]), highTasks=openTasks.filter(t=>t[3]==='High');
    if(/hello|hi |hey/.test(q))return `Hi! I’m ready with ${projectName()}’s latest site intelligence. You can ask about delays, materials, tasks, vendors, or the project plan.`;
    if(/delay|risk|block|problem|issue/.test(q))return risks.length?`The current blockers are: ${risks.slice(0,3).join(' ')} ${highTasks.length?`There are also ${highTasks.length} open high-priority task(s): ${highTasks.map(t=>t[0]).join(', ')}.`:''}`:`I can’t find an active delay risk in the stored updates for ${projectName()}.`;
    if(/material|urgent|supply|vendor|delivery/.test(q)){const delayed=vendors.filter(v=>v.status==='Delayed'||v.status==='Pending confirmation'); return materials.length||delayed.length?`Materials needing attention: ${materials.slice(0,3).join(' ')} ${delayed.length?`Vendor status: ${delayed.map(v=>`${v.vendor} — ${v.material} (${v.status})`).join('; ')}.`:''}`:`No material dependency is currently logged for ${projectName()}.`;}
    if(/task|owner|assigned|who/.test(q))return openTasks.length?`Open work: ${openTasks.slice(0,4).map(t=>`${t[0]} — owner: ${t[1]}, due ${t[2]}`).join('; ')}.`:'All planned tasks are marked complete.';
    if(/complete|done|week|achieve/.test(q))return completed.length?`Recently completed: ${completed.slice(0,5).join(' · ')}.`:'No completed work has been recorded yet.';
    if(/tomorrow|next|priorit|focus/.test(q))return actions.length||highTasks.length?`Recommended next focus: ${[...highTasks.map(t=>t[0]),...actions].slice(0,4).join(' · ')}.`:'Start with a site walk-through, confirm current dependencies, and assign the next work package.';
    if(/progress|status|health/.test(q))return `${projectName()} is ${project(activeProject()).progress}% complete and marked ${project(activeProject()).status.toLowerCase()}. There are ${progress.length} active work item(s), ${risks.length} logged risk(s), and ${openTasks.length} open task(s).`;
    return `For ${projectName()}, I found ${updates.length} stored field update(s), ${completed.length} completed activity signal(s), ${progress.length} in-progress item(s), and ${materials.length} material dependency signal(s). Try asking “What is delaying this project?” or “What should we prioritize tomorrow?”`;
  }
  function send(question){
    const text=question.trim(); if(!text)return; const h=histories(), id=activeProject(); h[id] ||= []; h[id].push({role:'user',text,time:'Just now'}); saveHistories(h); renderHistory();
    box.insertAdjacentHTML('beforeend','<div class="chat-typing">SitePulse is reviewing project data…</div>'); box.scrollTop=box.scrollHeight;
    setTimeout(()=>{const next=histories();next[id].push({role:'assistant',text:projectAnswer(text),time:'Just now'});saveHistories(next);renderHistory();},350);
  }
  document.querySelector('#chat-form').addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();send(input.value);input.value='';},true);
  document.addEventListener('click',event=>{const button=event.target.closest('.question-suggestions button');if(!button)return;event.preventDefault();event.stopImmediatePropagation();send(button.textContent);},true);
  projectSelect.addEventListener('change',renderHistory);
  document.querySelector('#clear-chat').addEventListener('click',()=>{const h=histories();delete h[activeProject()];saveHistories(h);renderHistory();});
  renderHistory();
})();
