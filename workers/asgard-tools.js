// asgard-tools v1.3.0
// Agentic tool-calling worker — gives Claude in Asgard real infrastructure access
// v1.3.0: all Claude calls via CF AI Gateway (no direct Anthropic), /brief endpoint added
// Deploy as worker script name: asgard-tools
// Required bindings: CF_API_TOKEN (secret, optional — falls back to vault)

const VERSION = '1.3.0';
const ACCOUNT_ID = 'a6f47c17811ee2f8b6caeb8f38768c20';

const SYSTEM_PROMPT = `You are Asgard, Luck Dragon's infrastructure AI. You have REAL tools — when Paddy asks you to change something, you actually do it. Don't describe what to do; do it.

## Your tools

- **http_request** — call any URL. Use for: gh-push worker (deploy GitHub/CF Pages), asgard-brain (SQL), craftsman (build workers), Stripe API, Supabase REST, CF API, etc.
- **get_worker_code** — read current source of any CF Worker by name
- **deploy_worker** — deploy a new version of any CF Worker (secrets preserved automatically)
- **get_secret** — read a secret from the Asgard vault

## Key endpoints

| What | How |
|------|-----|
| Run SQL (write) | POST https://asgard-brain.pgallivan.workers.dev/d1/write — header X-Pin: {pin}, body {sql, params} |
| Run SQL (read) | POST https://asgard-brain.pgallivan.workers.dev/d1/query — header X-Pin: {pin}, body {sql, params} |
| Push to GitHub (auto-deploys CF Pages) | PUT https://api.github.com/repos/{owner}/{repo}/contents/{path} — Authorization: Bearer {GITHUB_TOKEN env} — body JSON {message, content (base64), branch:"main", sha:"<current sha if UPDATING existing file>"}. To UPDATE: first GET /contents/{path}?ref=main for current sha, then PUT with sha. To CREATE: omit sha. Returns 201 (created) or 200 (updated). |
| (deprecated) gh-push worker | https://gh-push.pgallivan.workers.dev returns CF 1042 — DO NOT use. |
| Build/deploy via Craftsman | POST https://craftsman.pgallivan.workers.dev/api/build — body {worker_name, task, context} |
| Vault read | GET https://asgard-vault.pgallivan.workers.dev/secret/{KEY} — header X-Pin: {pin} |
| CF API | https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/... — header Authorization: Bearer {CF_API_TOKEN} |

## Key facts
- CF Account ID: ${ACCOUNT_ID}
- Paddy's PIN: use get_secret("PADDY_PIN") if you need it, or pass 2967 for X-Pin headers
- All repos are under LuckDragonAsgard org on GitHub
- Bomber Boat API worker: bomber-boat-api | Bomber Boat Pages project: bomber-boat
- Asgard dashboard worker: asgard (main_module: asgard.js)
- gh-push base64 encodes file content — use btoa() or encode manually

## Workflow patterns

**Modify a CF Worker:**
1. get_worker_code(worker_name) — read current code
2. Plan your changes
3. deploy_worker(worker_name, updatedCode) — deploy

**Update a website (CF Pages via GitHub):**
1. Read current file if needed (http_request to raw.githubusercontent.com or get_worker_code)
2. Prepare new file content
3. http_request to gh-push with base64-encoded content
4. CF Pages auto-deploys on push

**Database change:**
1. http_request to asgard-brain /d1/write with SQL

Always confirm what you did — worker deployed, URL live, SQL executed etc. If something fails, diagnose and retry.`;

const TOOLS = [
  {
    name: 'http_request',
    description: 'Make an HTTP request to any URL. Use this to call Asgard workers (gh-push, asgard-brain, craftsman), Cloudflare API, GitHub API, Stripe, Supabase, or any other service. For JSON APIs pass Content-Type: application/json and a JSON-stringified body.',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Full URL to request' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'GET' },
        headers: {
          type: 'object',
          description: 'HTTP headers as string key-value pairs',
          additionalProperties: { type: 'string' }
        },
        body: { type: 'string', description: 'Request body — for JSON APIs, JSON.stringify the object first' }
      },
      required: ['url']
    }
  },
  {
    name: 'get_worker_code',
    description: 'Get the current JavaScript source code of a Cloudflare Worker by script name. Returns the raw JS.',
    input_schema: {
      type: 'object',
      properties: {
        worker_name: { type: 'string', description: 'CF Worker script name, e.g. "asgard", "bomber-boat-api", "gh-push"' }
      },
      required: ['worker_name']
    }
  },
  {
    name: 'deploy_worker',
    description: 'Deploy a new version of a Cloudflare Worker. Provide the complete updated JavaScript source. All existing secret bindings are preserved automatically — you only need to set non-secret bindings if they changed.',
    input_schema: {
      type: 'object',
      properties: {
        worker_name: { type: 'string', description: 'CF Worker script name to deploy to' },
        code: { type: 'string', description: 'Complete JavaScript source (ES module with export default { async fetch(request, env) {...} })' },
        main_module: { type: 'string', description: 'Filename for the main module. Use "asgard.js" for the asgard worker, "worker.js" for everything else. Default: worker.js' }
      },
      required: ['worker_name', 'code']
    }
  },
  {
    name: 'get_secret',
    description: 'Read a secret value from the Asgard vault. Use for API keys, tokens, passwords.',
    input_schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Secret key name, e.g. "CF_API_TOKEN", "GITHUB_TOKEN", "STRIPE_SECRET_KEY", "ANTHROPIC_API_KEY", "PADDY_PIN"' }
      },
      required: ['key']
    }
  }
];

async function getPin(env) {
  return env.PADDY_PIN || '2967';
}

async function getFromVault(key, pin) {
  const r = await fetch(`https://asgard-vault.pgallivan.workers.dev/secret/${key}`, {
    headers: { 'X-Pin': pin }
  });
  if (!r.ok) throw new Error(`Vault ${r.status} for ${key}`);
  return r.text();
}

async function getCfToken(env) {
  if (env.CF_API_TOKEN) return env.CF_API_TOKEN;
  const pin = await getPin(env);
  return getFromVault('CF_API_TOKEN', pin);
}

async function getAnthropicKey(env) {
  if (env.ANTHROPIC_API_KEY) return env.ANTHROPIC_API_KEY;
  const pin = await getPin(env);
  return getFromVault('ANTHROPIC_API_KEY', pin);
}

async function executeTool(toolName, toolInput, env) {
  const pin = await getPin(env);

  try {
    switch (toolName) {

      case 'http_request': {
        const { url, method = 'GET', headers = {}, body } = toolInput;
        const opts = { method, headers };
        if (body !== undefined && body !== null) opts.body = body;
        const res = await fetch(url, opts);
        const text = await res.text();
        return { status: res.status, ok: res.ok, body: text.substring(0, 20000) };
      }

      case 'get_worker_code': {
        const { worker_name, main_module } = toolInput;
        const cfToken = await getCfToken(env);
        const r = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${worker_name}`,
          { headers: { 'Authorization': `Bearer ${cfToken}` } }
        );
        if (!r.ok) {
          return { error: `CF API ${r.status}`, detail: (await r.text()).substring(0, 500) };
        }
        const ct = r.headers.get('Content-Type') || '';
        const text = await r.text();

        // Classic (non-module) worker: raw JS body
        if (ct.startsWith('application/javascript') && !ct.includes('multipart')) {
          return { code: text.substring(0, 60000), length: text.length, format: 'classic' };
        }

        // Module worker: multipart/form-data — extract the JS part by boundary + Content-Disposition
        const boundaryMatch = ct.match(/boundary=([^;]+)/);
        if (!boundaryMatch) {
          return { error: 'No boundary in CF response Content-Type', ct, raw_preview: text.substring(0, 800) };
        }
        const boundary = boundaryMatch[1].trim().replace(/^"|"$/g, '');
        const delim = '--' + boundary;
        const parts = text.split(delim).slice(1, -1); // drop preamble + closing

        const candidates = [];
        for (const raw of parts) {
          let p = raw.replace(/^\r?\n/, '');
          let sepIdx = p.indexOf('\r\n\r\n');
          let sepLen = 4;
          if (sepIdx === -1) { sepIdx = p.indexOf('\n\n'); sepLen = 2; }
          if (sepIdx === -1) continue;
          const headers = p.substring(0, sepIdx);
          let body = p.substring(sepIdx + sepLen);
          // Strip trailing CRLF before next boundary
          body = body.replace(/\r?\n$/, '');
          const fn = headers.match(/filename="([^"]+)"/);
          const nm = headers.match(/name="([^"]+)"/);
          const filename = fn ? fn[1] : (nm ? nm[1] : '');
          candidates.push({ filename, headers, body });
        }

        // Prefer main_module match, else the first .js/.mjs part, else the first non-metadata part
        const wantMain = main_module || 'worker.js';
        let pick = candidates.find(c => c.filename === wantMain)
                || candidates.find(c => /\.m?js$/i.test(c.filename))
                || candidates.find(c => c.filename && c.filename !== 'metadata');

        if (!pick) {
          return {
            error: 'No JS part found in multipart response',
            ct,
            parts_count: candidates.length,
            filenames: candidates.map(c => c.filename),
            raw_preview: text.substring(0, 800)
          };
        }
        return {
          code: pick.body.substring(0, 60000),
          length: pick.body.length,
          format: 'module',
          part_name: pick.filename
        };
      }

      case 'deploy_worker': {
        const { worker_name, code, main_module = 'worker.js' } = toolInput;
        const cfToken = await getCfToken(env);

        const metadata = JSON.stringify({
          main_module,
          keep_bindings: ['secret_text', 'plain_text', 'kv_namespace', 'd1', 'service']
        });

        const CRLF = String.fromCharCode(13, 10);
        const boundary = 'AsgardToolsBoundary' + Date.now();
        const bodyStr = '--' + boundary + CRLF +
          'Content-Disposition: form-data; name="metadata"' + CRLF +
          'Content-Type: application/json' + CRLF + CRLF +
          metadata + CRLF +
          '--' + boundary + CRLF +
          'Content-Disposition: form-data; name="' + main_module + '"; filename="' + main_module + '"' + CRLF +
          'Content-Type: application/javascript+module' + CRLF + CRLF +
          code + CRLF +
          '--' + boundary + '--';

        const r = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${worker_name}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${cfToken}`,
              'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: bodyStr
          }
        );
        const j = await r.json();
        return { ok: j.success, errors: j.errors, worker: j.result?.id };
      }

      case 'get_secret': {
        const { key } = toolInput;
        // Prefer direct env binding (works from CF worker context, fast)
        if (env && env[key]) return { value: env[key], source: 'env' };
        // Fall back to vault (note: vault may 404 for some keys when called from CF worker context)
        const r = await fetch(`https://asgard-vault.pgallivan.workers.dev/secret/${key}`, {
          headers: { 'X-Pin': pin }
        });
        if (!r.ok) return { error: `Vault ${r.status} for ${key}; not in env either` };
        const val = await r.text();
        return { value: val, source: 'vault' };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (e) {
    return { error: e.message, stack: e.stack?.substring(0, 500) };
  }
}

async function handleChatSmart(request, env, corsHeaders) {
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders }); }

  try {
  const {
    message,
    messages = [],
    model = 'claude-sonnet-4-5',
    use_tools = true,
    system
  } = body;

  const msgs = [...messages];
  if (message) msgs.push({ role: 'user', content: message });
  if (!msgs.length) return Response.json({ error: 'No messages' }, { status: 400, headers: corsHeaders });

  // ---------- Multi-provider routing ----------
  // Claude models keep the full agent loop with tools. Other providers go through asgard-ai (chat-only, no tools yet).
  const isClaude = String(model).toLowerCase().startsWith('claude');
  if (!isClaude) {
    const pin = await getPin(env);
    const aiBody = { message, messages, model };
    if (system) aiBody.system = system;
    try {
      const aiRes = await fetch('https://asgard-ai.pgallivan.workers.dev/chat/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Pin': pin },
        body: JSON.stringify(aiBody)
      });
      const data = await aiRes.json();
      if (!aiRes.ok) {
        return Response.json({ error: 'asgard-ai ' + aiRes.status, detail: data }, { status: 502, headers: corsHeaders });
      }
      const text = data.reply || data.response || data.text || data.content || data.message || '';
      return Response.json({
        response: text,
        text, content: text, message: text,
        model: data.model || model,
        provider: data.provider || 'unknown',
        usage: data.usage || null,
        iterations: 0,
        tools_executed: [],
        note: 'Routed through asgard-ai (chat-only, no agent tools for non-Claude models yet)'
      }, { headers: corsHeaders });
    } catch (e) {
      return Response.json({ error: 'asgard-ai forward failed', detail: e.message }, { status: 502, headers: corsHeaders });
    }
  }
  // ---------- end multi-provider ----------

  const claudeReq = {
    model,
    max_tokens: 8192,
    system: system || SYSTEM_PROMPT,
    messages: msgs,
    ...(use_tools !== false ? { tools: TOOLS } : {})
  };

  let finalResponse = null;
  let iterations = 0;
  const MAX_ITER = 25;
  const toolsExecuted = [];

  while (iterations < MAX_ITER) {
    iterations++;

    // Call Anthropic API directly — key read from vault
    const anthropicKey = await getAnthropicKey(env);
    const r = await fetch('https://gateway.ai.cloudflare.com/v1/a6f47c17811ee2f8b6caeb8f38768c20/falkor/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeReq)
    });

    if (!r.ok) {
      const err = await r.text();
      return Response.json({ error: `Anthropic ${r.status}`, detail: err }, { status: 502, headers: corsHeaders });
    }

    finalResponse = await r.json();
    if (finalResponse.stop_reason !== 'tool_use') break;

    // Execute all tool calls
    const toolResults = [];
    for (const block of finalResponse.content) {
      if (block.type !== 'tool_use') continue;
      console.log(`[asgard-tools] tool=${block.name} input=${JSON.stringify(block.input).substring(0, 300)}`);
      const result = await executeTool(block.name, block.input, env);
      toolsExecuted.push({ tool: block.name, input: block.input, result });
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result)
      });
    }

    claudeReq.messages = [
      ...claudeReq.messages,
      { role: 'assistant', content: finalResponse.content },
      { role: 'user', content: toolResults }
    ];
  }

  const text = finalResponse?.content?.find(b => b.type === 'text')?.text ?? '';

  return Response.json({
    response: text,
    text: text,        // alias for dashboards expecting `text`
    content: text,     // alias for dashboards expecting `content`
    message: text,     // alias for dashboards expecting `message`
    model: finalResponse?.model,
    usage: finalResponse?.usage,
    iterations,
    tools_executed: toolsExecuted.map(t => t.tool)
  }, { headers: corsHeaders });
  } catch(e) {
    return Response.json({ error: 'Internal error', detail: e.message, stack: e.stack?.substring(0, 500) }, { status: 500, headers: corsHeaders });
  }
}

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Pin, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const { pathname } = new URL(request.url);

    if (pathname === '/health' || pathname === '/ready') {
      return Response.json({ ok: true, worker: 'asgard-tools', version: VERSION }, { headers: cors });
    }

    if (pathname === '/chat/smart' && request.method === 'POST') {
      return handleChatSmart(request, env, cors);
    }

    // /admin/projects — live CF inventory
    if (pathname === '/admin/projects' && request.method === 'GET') {
      try {
        const cfToken = await getCfToken(env);
        const ACCT = 'a6f47c17811ee2f8b6caeb8f38768c20';
        const [w, p] = await Promise.all([
          fetch('https://api.cloudflare.com/client/v4/accounts/'+ACCT+'/workers/scripts', { headers: { Authorization: 'Bearer '+cfToken } }).then(r=>r.json()),
          fetch('https://api.cloudflare.com/client/v4/accounts/'+ACCT+'/pages/projects', { headers: { Authorization: 'Bearer '+cfToken } }).then(r=>r.json())
        ]);
        return Response.json({
          workers: (w.result||[]).map(x=>x.id).sort(),
          pages: (p.result||[]).map(x=>({name:x.name, subdomain:x.subdomain, domains:x.domains||[]})),
          generated_at: new Date().toISOString()
        }, { headers: cors });
      } catch(e) { return Response.json({error:e.message}, { status:500, headers:cors }); }
    }

    // /admin/patch — find/replace on a worker source, then redeploy. POST {worker_name, find, replace, main_module}
    if (pathname === '/admin/patch' && request.method === 'POST') {
      const pin = request.headers.get('X-Pin');
      const _validPins_patch = [env.PADDY_PIN || '2967', env.AGENT_PIN].filter(Boolean);
      if (!_validPins_patch.includes(pin)) return Response.json({error:'Forbidden'}, {status:403, headers:cors});
      let body; try { body = await request.json(); } catch { return Response.json({error:'Invalid JSON'}, {status:400, headers:cors}); }
      const { worker_name, find, replace, main_module='worker.js' } = body;
      if (!worker_name || typeof find !== 'string' || typeof replace !== 'string') return Response.json({error:'worker_name, find, replace required'}, {status:400, headers:cors});
      const cur = await executeTool('get_worker_code', { worker_name }, env);
      if (cur.error) return Response.json(cur, { status:500, headers:cors });
      const code = cur.code;
      const occurrences = code.split(find).length - 1;
      if (occurrences === 0) return Response.json({error:'find string not found', find_preview: find.substring(0,100)}, {status:404, headers:cors});
      if (occurrences > 1) return Response.json({error:'find string matches '+occurrences+' times — must be unique', occurrences}, {status:409, headers:cors});
      const patched = code.replace(find, replace);
      const result = await executeTool('deploy_worker', { worker_name, code: patched, main_module }, env);
      return Response.json({ deployed: result.ok === true, occurrences, before_len: code.length, after_len: patched.length, ...result }, { headers: cors });
    }

    // /admin/deploy — direct deploy endpoint for large payloads (no LLM in the loop)
    // POST { worker_name, code_b64, main_module? }  X-Pin: <pin>
    if (pathname === '/admin/deploy' && request.method === 'POST') {
      const pin = request.headers.get('X-Pin');
      const _validPins_deploy = [env.PADDY_PIN || '2967', env.AGENT_PIN].filter(Boolean);
      if (!_validPins_deploy.includes(pin)) {
        return Response.json({ error: 'Forbidden' }, { status: 403, headers: cors });
      }
      let payload;
      try { payload = await request.json(); }
      catch { return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: cors }); }
      const { worker_name, code_b64, main_module = 'worker.js' } = payload;
      if (!worker_name || !code_b64) {
        return Response.json({ error: 'worker_name and code_b64 required' }, { status: 400, headers: cors });
      }
      let code;
      try {
        // atob returns binary string; convert to UTF-8 properly
        const binary = atob(code_b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        code = new TextDecoder('utf-8').decode(bytes);
      } catch (e) {
        return Response.json({ error: 'Invalid base64', detail: e.message }, { status: 400, headers: cors });
      }
      try {
        const result = await executeTool('deploy_worker', { worker_name, code, main_module }, env);
        return Response.json({ deployed: result.ok === true, ...result }, { headers: cors });
      } catch (e) {
        return Response.json({ error: 'Deploy failed', detail: e.message }, { status: 500, headers: cors });
      }
    }


    // /brief — morning brief: falkor-agent health, workflows health, worker fleet
    // GET /brief?pin=<VAULT_PIN>  OR  X-Pin header
    if (pathname === '/brief' && request.method === 'GET') {
      const qpin = new URL(request.url).searchParams.get('pin');
      const pin = qpin || request.headers.get('X-Pin');
      const validPins = [env.VAULT_PIN || '535554', env.AGENT_PIN].filter(Boolean);
      if (!validPins.includes(pin)) {
        return Response.json({ error: 'Forbidden' }, { status: 403, headers: cors });
      }
      try {
        const APIN = env.AGENT_PIN;
        const [agentRes, wfRes, toolsRes] = await Promise.allSettled([
          fetch('https://falkor-agent.luckdragon.io/health', { headers: { 'X-Pin': APIN } }).then(r => r.json()),
          fetch('https://falkor-workflows.luckdragon.io/health', { headers: { 'X-Pin': APIN } }).then(r => r.json()),
          fetch('https://falkor-brain.luckdragon.io/health', { headers: { 'X-Pin': APIN } }).then(r => r.json())
        ]);
        const agentHealth = agentRes.status === 'fulfilled' ? agentRes.value : { error: 'unreachable' };
        const wfHealth = wfRes.status === 'fulfilled' ? wfRes.value : { error: 'unreachable' };
        const brainHealth = toolsRes.status === 'fulfilled' ? toolsRes.value : { error: 'unreachable' };

        // Route through asgard-ai (holds ANTHROPIC_API_KEY binding + CF AI Gateway)
        const briefPrompt = 'Give a concise Falkor status brief (4-6 bullets). Flag anything wrong. Today: ' +
          new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
          '\n\nAgent: ' + JSON.stringify(agentHealth) +
          '\nWorkflows: ' + JSON.stringify(wfHealth) +
          '\nBrain: ' + JSON.stringify(brainHealth);
        const llmRes = await fetch('https://asgard-ai.luckdragon.io/chat/smart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Pin': APIN },
          body: JSON.stringify({ model: 'haiku', message: briefPrompt, use_tools: false })
        });
        const llmData = await llmRes.json();
        const brief = llmData.response || llmData.text || llmData.content || llmData.message || 'LLM unavailable.';
        return Response.json({
          brief,
          raw: { agent: agentHealth, workflows: wfHealth, brain: brainHealth },
          generated_at: new Date().toISOString()
        }, { headers: cors });
      } catch (e) {
        return Response.json({ error: 'Brief failed', detail: e.message }, { status: 500, headers: cors });
      }
    }

    return new Response('Not found', { status: 404, headers: cors });
  }
};