/**
 * Unified Asgard Platform Dashboard - FIXED
 * Main entry point at falkor.luckdragon.io
 */

const PROJECTS_DATA = [
  // Active Projects (from falkor-projects)
  { id: 'carnival-timing', name: 'Carnival Timing', url: 'https://carnivaltiming.com', repo: 'LuckDragonAsgard/district-sport', status: 'live', category: 'Platform', description: 'Carnival timing & scoring platform', type: 'active' },
  { id: 'ssp', name: 'School Sport Portal', url: 'https://schoolsportportal.com.au', repo: 'LuckDragonAsgard/ssp', status: 'live', category: 'SaaS', description: '$1/student/yr sports management', type: 'active' },
  { id: 'sportcarnival', name: 'SportCarnival', url: 'https://sportcarnival.com.au', repo: 'LuckDragonAsgard/sportcarnival', status: 'live', category: 'Platform', description: 'District sports carnival hub', type: 'active' },
  { id: 'lessonlab', name: 'LessonLab', url: 'https://lessonlab.com.au', repo: 'LuckDragonAsgard/lessonlab', status: 'live', category: 'SaaS', description: 'Education SaaS platform', type: 'active' },
  { id: 'kbt', name: 'KBT Trivia Tools', url: 'https://kbt-trial.vercel.app/host-app', repo: 'LuckDragonAsgard/kbt-trivia-tools', status: 'live', category: 'Tool', description: 'Trivia hosting & asset pipeline', type: 'active' },
  { id: 'bomber-boat', name: 'Bomber Boat', url: 'https://bomberboat.com.au', repo: 'LuckDragonAsgard/bomber-boat', status: 'live', category: 'Game', description: 'Boat spotting game', type: 'active' },
  { id: 'superleague', name: 'Superleague Yeah v4', url: 'https://superleague.streamlinewebapps.com', repo: 'LuckDragonAsgard/superleague-yeah-v4', status: 'live', category: 'Game', description: 'AFL fantasy draft', type: 'active' },
  // Legacy
  { id: 'bulldogs-boat', name: 'Bulldogs Boat', url: '', repo: 'PaddyGallivan/bulldogs-boat', status: 'archived', category: 'Game', description: 'Bulldogs version of boat game', type: 'legacy' },
  { id: 'long-range-tipping', name: 'Long Range Tipping', url: '', repo: '', status: 'archived', category: 'Game', description: 'AFL tipping competition', type: 'legacy' },
  // Ideas
  { id: 'neighbourgoods', name: 'NeighbourGoods', url: '', repo: '', status: 'idea', category: 'Platform', description: 'Neighbourhood sharing marketplace', type: 'idea' },
  { id: 'sidequest', name: 'SideQuest', url: '', repo: '', status: 'idea', category: 'Game', description: 'Gamified task/quest platform', type: 'idea' },
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Routes
    if (path === '/' || path === '/dashboard') return handleDashboard();
    if (path === '/api/projects') return handleProjects();
    if (path === '/api/agent/status') return handleAgentStatus();

    return new Response('Not found', { status: 404 });
  }
};

async function handleDashboard() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asgard Platform</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #0f0f11;
      --panel: #18181b;
      --border: #2a2a2e;
      --text: #e8e8ea;
      --muted: #888;
      --accent: #6c63ff;
      --accent2: #a78bfa;
    }
    body { 
      background: var(--bg); 
      color: var(--text); 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
      padding: 20px 40px;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .header h1 { font-size: 32px; font-weight: 700; letter-spacing: -1px; }
    .header p { font-size: 14px; opacity: 0.9; margin-top: 4px; }
    
    .nav-tabs {
      display: flex;
      gap: 0;
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      padding: 0 40px;
    }
    .nav-tab {
      padding: 16px 24px;
      border: none;
      background: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
    }
    .nav-tab:hover { color: var(--text); }
    .nav-tab.active { 
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
    
    .content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    
    .view { 
      display: none; 
      flex: 1; 
      overflow-y: auto; 
      padding: 40px;
      flex-direction: column;
    }
    .view.active { display: flex; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .card:hover {
      border-color: var(--accent);
      background: linear-gradient(135deg, rgba(108,99,255,0.05) 0%, rgba(167,139,250,0.05) 100%);
    }
    
    .card-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .card-desc { font-size: 13px; color: var(--muted); margin-bottom: 12px; line-height: 1.4; }
    .card-meta { font-size: 12px; color: var(--muted); display: flex; gap: 12px; }
    
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .status-live { background: #238636; color: white; }
    .status-dev { background: #6e40aa; color: white; }
    .status-archived { background: #444c56; color: #c9d1d9; }
    .status-idea { background: #3b434b; color: #8b949e; }
    
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      flex-direction: column;
      color: var(--muted);
    }
    .empty-state-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
    
    .footer {
      background: var(--panel);
      border-top: 1px solid var(--border);
      padding: 12px 40px;
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ Asgard Platform</h1>
    <p>Project management, chat, and automation hub</p>
  </div>
  
  <div class="nav-tabs">
    <button class="nav-tab active" onclick="switchView('projects')">📦 Projects</button>
    <button class="nav-tab" onclick="switchView('chat')">💬 Chat</button>
    <button class="nav-tab" onclick="switchView('agent')">🤖 Agent</button>
    <button class="nav-tab" onclick="switchView('tools')">🔧 Tools</button>
  </div>
  
  <div class="content">
    <div id="projects" class="view active">
      <div class="grid" id="projectsGrid">
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <p>Loading projects...</p>
        </div>
      </div>
    </div>
    
    <div id="chat" class="view">
      <h2 style="margin-bottom: 24px;">Falkor Chat</h2>
      <div style="flex: 1; border: 1px solid var(--border); border-radius: 12px; background: var(--panel); display: flex; align-items: center; justify-content: center;">
        <p style="color: var(--muted);">Chat interface connecting to Falkor Agent...</p>
      </div>
    </div>
    
    <div id="agent" class="view">
      <h2 style="margin-bottom: 24px;">Agent Status & Control</h2>
      <div style="background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 24px; flex: 1; overflow-y: auto;">
        <div id="agentStatus" style="font-family: monospace; white-space: pre-wrap;">
          Loading agent status...
        </div>
      </div>
    </div>
    
    <div id="tools" class="view">
      <h2 style="margin-bottom: 24px;">Tools & Utilities</h2>
      <div class="grid">
        <div class="card">
          <div class="card-title">🔍 Search</div>
          <div class="card-desc">Search projects and conversations</div>
        </div>
        <div class="card">
          <div class="card-title">📊 Analytics</div>
          <div class="card-desc">Project metrics and performance</div>
        </div>
        <div class="card">
          <div class="card-title">⚙️ Configuration</div>
          <div class="card-desc">System settings and preferences</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    Asgard v2.0 • Live Projects: 7 • Archived: 2 • Ideas: 2
  </div>

  <script>
    let projects = ${JSON.stringify(PROJECTS_DATA)};
    
    function switchView(viewName) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.getElementById(viewName).classList.add('active');
      event.target.classList.add('active');
    }
    
    function renderProjects() {
      const grid = document.getElementById('projectsGrid');
      if (!projects.length) {
        grid.innerHTML = '<div class="empty-state"><p>No projects found</p></div>';
        return;
      }
      
      grid.innerHTML = projects.map(p => \`
        <div class="card" onclick="window.open('\${p.url || '#'}', '_blank')">
          <div class="status-badge status-\${p.status}">\${p.status.toUpperCase()}</div>
          <div class="card-title">\${p.name}</div>
          <div class="card-desc">\${p.description}</div>
          <div class="card-meta">
            \${p.category ? \`<span>📁 \${p.category}</span>\` : ''}
            \${p.url ? \`<span>🌐 Live</span>\` : ''}
            \${p.repo ? \`<span>📦 GitHub</span>\` : ''}
          </div>
        </div>
      \`).join('');
    }
    
    async function loadAgentStatus() {
      try {
        const res = await fetch('/api/agent/status');
        const data = await res.json();
        document.getElementById('agentStatus').textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        document.getElementById('agentStatus').textContent = 'Agent status unavailable';
      }
    }
    
    // Initialize
    renderProjects();
    loadAgentStatus();
  </script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function handleProjects() {
  return Response.json({
    ok: true,
    projects: PROJECTS_DATA,
    count: PROJECTS_DATA.length
  });
}

async function handleAgentStatus() {
  try {
    const res = await fetch('https://falkor-agent.luckdragon.io/status', {
      headers: { 'X-Pin': '2967' }
    });
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ 
      ok: false,
      error: 'Agent unavailable',
      message: e.message 
    }, { status: 503 });
  }
}
