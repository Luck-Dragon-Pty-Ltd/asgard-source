const FALKOR_VERSION = '9.40.0-hotfix';
const AGENT_URL = 'https://falkor-agent.luckdragon.io';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Falkor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #0a0e27; 
      color: #e0e0e0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      overflow: hidden;
    }
    .container { height: 100vh; display: flex; flex-direction: column; }
    .login-screen { 
      flex: 1; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 20px;
    }
    .login-card { 
      background: #1a1f3a; 
      border: 1px solid #3a4155; 
      border-radius: 12px; 
      padding: 40px; 
      max-width: 380px; 
      width: 100%;
    }
    .logo { font-size: 48px; text-align: center; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px; }
    .subtitle { text-align: center; color: #888; font-size: 14px; margin-bottom: 30px; }
    input { 
      width: 100%; 
      padding: 12px; 
      background: #0a0e27; 
      border: 1px solid #3a4155; 
      border-radius: 8px; 
      color: #e0e0e0; 
      font-size: 16px;
      margin-bottom: 15px;
      text-align: center;
      letter-spacing: 4px;
    }
    button { 
      width: 100%; 
      padding: 12px; 
      background: #6c63ff; 
      border: none; 
      border-radius: 8px; 
      color: white; 
      font-size: 16px; 
      font-weight: 600; 
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #ff6b6b; font-size: 13px; margin-bottom: 15px; text-align: center; }
    .users { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 30px; }
    .user-card { 
      background: #1a1f3a; 
      border: 2px solid #3a4155; 
      border-radius: 10px; 
      padding: 20px; 
      text-align: center; 
      cursor: pointer;
      transition: all 0.2s;
    }
    .user-card:hover { border-color: #6c63ff; }
    .user-avatar { font-size: 36px; margin-bottom: 8px; }
    .user-name { font-weight: 600; font-size: 15px; }
    .user-role { font-size: 12px; color: #888; text-transform: uppercase; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div id="app"></div>
  </div>
  <script>
    const USERS = [
      { id: 'paddy', name: 'Paddy', avatar: '👨‍💼', role: 'lead' },
      { id: 'jacky', name: 'Jacky', avatar: '⚡', role: 'team' },
      { id: 'george', name: 'George', avatar: '🎯', role: 'team' },
      { id: 'aeneas', name: 'Aeneas', avatar: '🐕', role: 'team' }
    ];

    function render() {
      const app = document.getElementById('app');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (user && user.pin) {
        // Show chat placeholder
        app.innerHTML = '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:#888;font-size:18px;">Chat loading...</div>';
        return;
      }

      // Show login
      app.innerHTML = \`
        <div class="login-screen">
          <div class="login-card">
            <div class="logo">🐕</div>
            <div class="title">Falkor</div>
            <div class="subtitle">Who's this?</div>
            <div class="users">
              \${USERS.map(u => \`
                <div class="user-card" onclick="selectUser('\${u.id}', '\${u.name}')">
                  <div class="user-avatar">\${u.avatar}</div>
                  <div class="user-name">\${u.name}</div>
                  <div class="user-role">\${u.role}</div>
                </div>
              \`).join('')}
            </div>
            <div id="pin-form" style="display:none;margin-top:20px;">
              <div class="subtitle">Enter PIN</div>
              <input type="password" id="pin-input" inputmode="numeric" placeholder="PIN" maxlength="6" />
              <div id="error" class="error"></div>
              <button onclick="verifyPin()">Enter</button>
              <button onclick="selectUser(null)" style="background:#3a4155;margin-top:10px;">Back</button>
            </div>
          </div>
        </div>
      \`;
    }

    window.selectUser = function(id, name) {
      if (!id) {
        localStorage.removeItem('selected');
        render();
        return;
      }
      localStorage.setItem('selected', JSON.stringify({id, name}));
      document.getElementById('pin-form').style.display = 'block';
      document.getElementById('pin-input').focus();
    };

    window.verifyPin = function() {
      const pin = document.getElementById('pin-input').value;
      const selected = JSON.parse(localStorage.getItem('selected') || '{}');
      
      const validPins = ['535554', '2967', '297'];
      if (validPins.includes(pin)) {
        localStorage.setItem('user', JSON.stringify({id: selected.id, name: selected.name, pin}));
        render();
        // Connect to chat (future)
      } else {
        document.getElementById('error').textContent = 'Invalid PIN';
      }
    };

    document.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && document.getElementById('pin-form').style.display !== 'none') {
        verifyPin();
      }
    });

    render();
  </script>
</body>
</html>`;

export default { async fetch(request) {
  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'max-age=300' }
  });
}};
