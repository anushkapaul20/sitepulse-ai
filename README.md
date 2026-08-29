# SitePulse AI

SitePulse AI turns construction and interior-site updates into structured progress reports. It gives site teams a clear view of completed work, active work, material shortages, risks, and next actions.

## Features

- Create daily site updates in plain English, with optional material notes, blockers, and photos.
- Extract completed, in-progress, pending, material, issue, risk, and action signals.
- Generate polished daily reports per project.
- Search report history by project, work activity, material, or issue.
- Track recommended actions with a persistent completion checklist.
- Print reports or save them as PDFs directly from the browser.
- View portfolio health, recent activity, material issues, and priority risks.
- Ask project-specific questions using saved updates, not generic answers.
- Keep demo data locally in the browser with no backend or API key required.

## Resume-ready highlights

- Built a responsive multi-project construction operations dashboard with vanilla JavaScript.
- Designed a local-first data model for site updates, reports, task ownership, milestone plans, safety checks, and backup/restore.
- Implemented explainable update analysis that turns unstructured site language into project signals and next actions.
- Added an interactive delivery workspace with task assignments, priority handling, schedule milestones, weekly manager digests, and report export.
- Built a logistics command center for vendor deliveries, material dependencies, and resolution-tracked issue registers.
- Added portfolio analytics with delivery pace, project signals, risk exposure, and operational KPIs.

## Run locally

From this folder:

```powershell
python -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173). Stop the server with `Ctrl + C`.

## Usage

1. Go to **Daily update** and choose a project.
2. Paste or write the supervisor's update in plain English.
3. Add material details, blockers, and optional photos.
4. Select **Analyze & create report**.
5. In **Reports**, use search, complete action checklist items, or select **Print / save PDF**.
6. Ask the assistant about urgent materials, delays, recent completed work, or tomorrow's priorities.

## Technology

- HTML, CSS, and vanilla JavaScript
- Browser `localStorage` for persistence
- Lucide icons

## Product modules

| Module | Capabilities |
| --- | --- |
| Overview | Portfolio KPI cards, active risks, recent site intelligence, project health |
| Daily update | Plain-language updates, photos, material and blocker capture, report generation |
| Reports | Searchable report archive, action checklist, printable/PDF-ready reports |
| Project planner | Milestones, owned tasks, priorities, safety checklist, AI weekly digest |
| Insights | Completion trend, risk distribution, project signals, delivery KPIs |
| Materials & vendors | Delivery status board, supplier tracking, material dependencies, issue register |

## Data handling

The demo is intentionally local-first. Project data, plans, vendor records, action completion, safety checks, and issue status are stored in browser `localStorage`. The **Backup data** and **Restore** controls in Project planner support moving a complete workspace between browsers.

## Production AI integration

This demo uses a transparent rules engine in `app.js` so it works without credentials. A production version can replace the `analyzeText` and `ask` functions with requests to a secure backend connected to an AI model, while retaining the same project-update structure.
