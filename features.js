(() => {
  const actionStore = 'sitepulse-action-status';
  const getStatuses = () => JSON.parse(localStorage.getItem(actionStore) || '{}');
  const saveStatuses = (statuses) => localStorage.setItem(actionStore, JSON.stringify(statuses));

  function enrichReport() {
    const detail = document.querySelector('#report-detail');
    if (!detail || !detail.querySelector('.report-header')) return;

    const header = detail.querySelector('.report-header');
    if (!header.querySelector('#export-report')) {
      header.insertAdjacentHTML('beforeend', '<button id="export-report" class="report-export"><i data-lucide="printer"></i> Print / save PDF</button>');
      header.querySelector('#export-report').addEventListener('click', () => window.print());
    }

    const actionTitle = [...detail.querySelectorAll('h4')].find(h => h.textContent.trim().includes('RECOMMENDED ACTIONS'));
    const actionList = actionTitle?.nextElementSibling;
    if (!actionList || actionList.classList.contains('action-list')) return;
    const reportName = detail.querySelector('h2')?.textContent || 'report';
    const statuses = getStatuses();
    actionList.classList.add('action-list');
    [...actionList.children].forEach((item, index) => {
      const actionText = item.textContent.trim();
      const key = `${reportName}:${actionText}`;
      const checked = Boolean(statuses[key]);
      item.classList.toggle('done', checked);
      item.innerHTML = `<input type="checkbox" data-action-key="${encodeURIComponent(key)}" ${checked ? 'checked' : ''}><span>${actionText}</span>`;
      item.querySelector('input').addEventListener('change', (event) => {
        const actionKey = decodeURIComponent(event.target.dataset.actionKey);
        const next = getStatuses(); next[actionKey] = event.target.checked; saveStatuses(next);
        item.classList.toggle('done', event.target.checked);
      });
    });
    window.lucide?.createIcons();
  }

  function filterReports(query) {
    const items = [...document.querySelectorAll('.report-item')];
    const term = query.trim().toLowerCase();
    let visible = 0;
    items.forEach(item => {
      const show = item.textContent.toLowerCase().includes(term);
      item.hidden = !show;
      if (show) visible += 1;
    });
    document.querySelector('#report-result-count').textContent = `${visible} report${visible === 1 ? '' : 's'}`;
  }

  const search = document.querySelector('#report-search');
  search?.addEventListener('input', (event) => filterReports(event.target.value));
  filterReports('');
  new MutationObserver(enrichReport).observe(document.querySelector('#report-detail'), { childList: true, subtree: true });
  enrichReport();
})();
