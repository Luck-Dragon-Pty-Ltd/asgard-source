// asgard-ai v5.8.0-stream: multi-provider (Anthropic/OpenAI/Groq) streaming SSE, normalized tokens
const VERSION = '6.15.1';
const WORKER_NAME = "asgard-ai";

// --- PIN auth helper (v1.1.0 security patch) ---
// ─── SECURITY v24: Rate limiting + env PINs + session tokens ──────────────────
function getValidPins(env) {
  const pins = [];
  if (env.AGENT_PIN) pins.push(env.AGENT_PIN);  // fleet PIN (falkor workers)
  if (env.PADDY_PIN) pins.push(env.PADDY_PIN);
  if (env.JACKY_PIN) pins.push(env.JACKY_PIN);
  if (env.GEORGE_PIN) pins.push(env.GEORGE_PIN);
  if (!pins.length) { console.warn("No PINs configured"); }
  return pins;
}
async function getRateLimit(env, ip) {
  if (!env.RATE_LIMIT_KV) return { ok: true };
  const d = await env.RATE_LIMIT_KV.get('rl:'+ip,'json') || {count:0,locked_until:0};
  if (d.locked_until > Date.now()) return { ok:false, retry_after: Math.ceil((d.locked_until-Date.now())/1000) };
  return { ok:true, count: d.count||0 };
}
async function recordFailedPin(env, ip) {
  if (!env.RATE_LIMIT_KV) return;
  const d = await env.RATE_LIMIT_KV.get('rl:'+ip,'json') || {count:0,locked_until:0};
  const c = (d.count||0)+1;
  // 10 attempts before lockout, 5-min lockout (was 5 attempts, 15-min)
  await env.RATE_LIMIT_KV.put('rl:'+ip, JSON.stringify({count:c, locked_until: c>=10 ? Date.now()+300000 : d.locked_until}), {expirationTtl:300});
}
async function clearRateLimit(env, ip) {
  if (env.RATE_LIMIT_KV) await env.RATE_LIMIT_KV.delete('rl:'+ip);
}
async function createSession(env, pin) {
  if (!env.SESSIONS_KV) return null;
  const tok = Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b=>b.toString(16).padStart(2,'0')).join('');
  await env.SESSIONS_KV.put('sess:'+tok, pin, {expirationTtl:86400});
  return tok;
}
async function validateSession(env, tok) {
  return (env.SESSIONS_KV && tok) ? await env.SESSIONS_KV.get('sess:'+tok) : null;
}
async function pinOk(request, env) {
  // 2026-05-10: also accept ?pin= query param so browser-initiated GETs (OAuth flow, etc.) work
  let qpin = '';
  try { qpin = new URL(request.url).searchParams.get('pin') || ''; } catch {}
  const pin  = request.headers.get('X-Pin')||request.headers.get('X-PIN')||qpin||'';
  const stok = request.headers.get('X-Session-Token')||'';
  const ip   = request.headers.get('CF-Connecting-IP')||'unknown';
  if (stok) { const sp=await validateSession(env,stok); return (sp && getValidPins(env).includes(sp)); }
  const rl = await getRateLimit(env,ip);
  if (!rl.ok) return 'locked';
  if (getValidPins(env).includes(pin)) { await clearRateLimit(env,ip); return true; }
  await recordFailedPin(env,ip);
  return false;
}
function pinRequired(r) {
  const locked=(r==='locked');
  return new Response(JSON.stringify({ok:false,error:locked?'Too many failed attempts — locked 15 min':'Unauthorized — X-Pin required'}),
    {status:locked?429:401,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
}
// ────────────────────────────────────────────────────────────────────────────────



async function identifyPin(request, env) {
  const pin  = request.headers.get('X-Pin')||request.headers.get('X-PIN')||'';
  const stok = request.headers.get('X-Session-Token')||'';
  if (stok && env.SESSIONS_KV) {
    const sp = await env.SESSIONS_KV.get('sess:'+stok);
    if (sp) {
      if (env.PADDY_PIN && sp === env.PADDY_PIN) return 'paddy';
      if (env.JACKY_PIN && sp === env.JACKY_PIN) return 'jacky';
      if (env.GEORGE_PIN && sp === env.GEORGE_PIN) return 'george';
    }
    return null;
  }
  if (env.PADDY_PIN && pin === env.PADDY_PIN) return 'paddy';
  if (env.JACKY_PIN && pin === env.JACKY_PIN) return 'jacky';
  if (env.GEORGE_PIN && pin === env.GEORGE_PIN) return 'george';
  return null;
}
const ALLOWED_ORIGINS = [
  "https://asgard.luckdragon.io",
  "https://asgard-dev.luckdragon.io",
  "https://kbt-trial-9gu.pages.dev",
  "https://superleague-youth.luckdragon.io",
  "https://falkor.luckdragon.io",
  "https://falkor-ui.luckdragon.io",
];
function makeCors(origin) {
  const o = (origin && ALLOWED_ORIGINS.includes(origin)) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Session-Id, X-Pin, X-PIN, Authorization",
    "Vary": "Origin",
  };
}
const CORS = makeCors("https://asgard.luckdragon.io");
const SYSTEM_PROMPT = "You are Falkor AI for Paddy, Jacky, and George. Be direct, efficient, action-oriented. Be concrete, name projects, no fluff. You have persistent memory — use save_memory to record important facts (project states, decisions, warnings) and read_messages/send_message for team comms. CRITICAL: never claim a worker is down, broken, slow, looping, or in a bad state without first calling http_request to its /health URL OR get_worker_code(name) in THIS turn. If you have no tool-call evidence right now, say \"I haven\u2019t checked — want me to?\" instead of inventing an incident. Do NOT propose \"redeploy from last known good state\" unless a tool call this turn returned non-200. Hallucinated incidents cause real reverts.";

// Model registry: key = shorthand, value = {provider, full model id}
// CF AI Gateway base (auto-provisions "falkor" gateway on first request)
const CF_GATEWAY_BASE = "https://gateway.ai.cloudflare.com/v1/a6f47c17811ee2f8b6caeb8f38768c20/falkor";
const CF_ACCOUNT_ID   = "a6f47c17811ee2f8b6caeb8f38768c20";

const MODELS = {
  // ── Free tier first (Groq — 1000 req/day, OpenAI-compatible) ──────────────
  "groq-fast":  { provider: "groq", id: "llama-3.1-8b-instant" },       // ~200 tok/s, near-instant
  "groq":       { provider: "groq", id: "llama-3.3-70b-versatile" },    // best free quality
  "groq-think": { provider: "groq", id: "deepseek-r1-distill-llama-70b" }, // reasoning (distilled)
  // ── Anthropic (via AI Gateway) ────────────────────────────────────────────
  haiku:  { provider: "anthropic", id: "claude-haiku-4-5-20251001" },
  sonnet: { provider: "anthropic", id: "claude-sonnet-4-6" },
  opus:   { provider: "anthropic", id: "claude-opus-4-6" },
  // ── OpenAI (via AI Gateway) ───────────────────────────────────────────────
  "gpt-5":        { provider: "openai", id: "gpt-5" },
  "gpt-5-mini":   { provider: "openai", id: "gpt-5-mini" },
  "gpt-4.1":      { provider: "openai", id: "gpt-4.1" },
  "gpt-4o":       { provider: "openai", id: "gpt-4o" },
  "gpt-4o-mini":  { provider: "openai", id: "gpt-4o-mini" },
  "o3":           { provider: "openai", id: "o3" },
  "o3-mini":      { provider: "openai", id: "o3-mini" },
  // ── Google Gemini (via AI Gateway) ───────────────────────────────────────
  "gemini-2.5-pro":   { provider: "gemini", id: "gemini-2.5-pro" },
  "gemini-2.5-flash": { provider: "gemini", id: "gemini-2.5-flash" },
  "gemini-1.5-pro":   { provider: "gemini", id: "gemini-1.5-pro" },
};
const DEFAULT_MODEL = "groq-fast";  // Free first
// THUNDER_MEMORY constant removed 2026-04-23 — memory now in asgard-prod.facts
const ASGARD_BRAIN   = "https://asgard-brain.luckdragon.io";

// Compression tuning (from v9)
const COMPRESS_THRESHOLD = 30;
const COMPRESS_KEEP_RECENT = 10;
const ARCHIVE_AFTER_DAYS = 30;

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json", ...extra } });
}
function err(message, status = 500, extra = {}) {
  return json({ ok: false, error: message, ...extra }, status);
}

function resolveModel(input) {
  if (!input) return MODELS[DEFAULT_MODEL];
  const k = String(input).toLowerCase();
  if (MODELS[k]) return MODELS[k];
  // Auto-route by prefix
  if (k.startsWith("gpt-") || k.startsWith("o1") || k.startsWith("o3") || k.startsWith("o4")) {
    return { provider: "openai", id: input };
  }
  if (k.startsWith("gemini-")) {
    return { provider: "gemini", id: input };
  }
  if (k.startsWith("claude-")) {
    return { provider: "anthropic", id: input };
  }
  if (k.startsWith("groq-") || k.startsWith("llama-") || k.startsWith("mixtral-") || k.startsWith("qwen-")) {
    return { provider: "groq", id: input };
  }
  // Unknown → default to Anthropic with the given id
  return { provider: "anthropic", id: input };
}

function quickRoute(message) {
  if (!message) return DEFAULT_MODEL;
  const m = message.toLowerCase();
  // Hard tasks → Sonnet (paid, best quality)
  const hardTriggers = ["strategy","architect","design","plan ","refactor","debug","why does","explain why","tradeoff","pros and cons","compare","write code","generate code","fix the","review","audit","analyse","analyze","build me","implement","create a function","create an api"];
  if (hardTriggers.some(t => m.includes(t))) return "sonnet";
  // Creative writing → GPT-4o (outstanding prose, stories, scripts)
  const creativeTriggers = ["write a story","write me a story","write a poem","poem about","write a song","lyrics","screenplay","script","fiction","write an essay","write a blog","write a letter","write a speech","creative writing","tell me a story"];
  if (creativeTriggers.some(t => m.includes(t))) return "gpt-4o";
  // Reasoning/maths → Groq think (free deep reasoning)
  const thinkTriggers = ["step by step","reason through","logic","math","calculate","proof","theorem","deduce","infer"];
  if (thinkTriggers.some(t => m.includes(t))) return "groq-think";
  // Structured tasks → Gemini Flash (fast, great at lists/tables/translation)
  const structuredTriggers = ["list all","summarise","summarize","make a table","translate","convert","format this","extract","classify","categorize","give me a list","bullet point","schedule","itinerary","compare these","rank"];
  if (structuredTriggers.some(t => m.includes(t))) return "gemini-2.5-flash";
  // Longer messages → Groq versatile (free, handles context well)
  if (m.length > 400) return "groq";
  // Default: instant free response
  return "groq-fast";
}

// ---------- Provider adapters ----------
async function callAnthropic(env, { model, messages, system, max_tokens = 1024, tools, stream = false }) {
  if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY missing");
  const body = { model, max_tokens, system: system || SYSTEM_PROMPT, messages };
  if (tools && tools.length) body.tools = tools;
  if (stream) body.stream = true;
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(body),
  });
}

async function callOpenAI(env, { model, messages, system, max_tokens = 1024, stream = false }) {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
  const openaiMessages = [
    ...(system ? [{ role: "system", content: system }] : [{ role: "system", content: SYSTEM_PROMPT }]),
    ...messages,
  ];
  // GPT-5.x and o-series require max_completion_tokens instead of max_tokens
  const isNewParam = /^(gpt-5|o1|o3|o4)/.test(String(model));
  const body = { model, messages: openaiMessages };
  if (isNewParam) body.max_completion_tokens = max_tokens;
  else body.max_tokens = max_tokens;
  if (stream) body.stream = true;
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
    body: JSON.stringify(body),
  });
}

async function callGemini(env, { model, messages, system, max_tokens = 1024 }) {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
  }));
  const body = {
    contents,
    generationConfig: { maxOutputTokens: max_tokens },
    systemInstruction: system ? { parts: [{ text: system }] } : { parts: [{ text: SYSTEM_PROMPT }] },
  };
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Unified dispatcher: returns { ok, reply, usage, raw }
// ---------- Groq (free tier: 1000 req/day, OpenAI-compatible) ----------
async function callGroq(env, { model, messages, system, max_tokens = 1024, stream = false }) {
  if (!env.GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");
  const groqMessages = system
    ? [{ role: "system", content: system }].concat(messages)
    : messages;
  const body = { model, messages: groqMessages, max_tokens };
  if (stream) body.stream = true;
  // Direct Groq endpoint — fast, no gateway auth needed
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.GROQ_API_KEY },
    body: JSON.stringify(body),
  });
}


// Unified dispatcher: returns { ok, reply, usage, raw, provider_used }
async function generate(env, { provider, model, messages, system, max_tokens, tools }) {
  // ── Groq (free tier, 1000 req/day) ───────────────────────────────────────
  if (provider === "groq") {
    if (!env.GROQ_API_KEY) {
      console.log("[router] GROQ_API_KEY missing, falling back to haiku");
      return generate(env, { provider: "anthropic", model: "claude-haiku-4-5-20251001", messages, system, max_tokens, tools });
    }
    try {
      const r = await callGroq(env, { model, messages, system, max_tokens });
      if (r.status === 429 || r.status === 503) {
        console.log("[router] Groq quota/overload (" + r.status + "), falling back to haiku");
        return generate(env, { provider: "anthropic", model: "claude-haiku-4-5-20251001", messages, system, max_tokens, tools });
      }
      if (!r.ok) { const t = await r.text(); return { ok: false, error: "groq " + r.status + ": " + t.slice(0, 300) }; }
      const d = await r.json();
      const choice = d.choices && d.choices[0];
      const reply = (choice && choice.message && choice.message.content) || "";
      return { ok: true, reply, usage: d.usage || null, raw: d, provider_used: "groq" };
    } catch(e) {
      console.log("[router] Groq exception, falling back to haiku:", e.message);
      return generate(env, { provider: "anthropic", model: "claude-haiku-4-5-20251001", messages, system, max_tokens, tools });
    }
  }
  // ── OpenAI ────────────────────────────────────────────────────────────────
  if (provider === "openai") {
    const r = await callOpenAI(env, { model, messages, system, max_tokens });
    if (!r.ok) { const t = await r.text(); return { ok: false, error: "openai " + r.status + ": " + t.slice(0, 300) }; }
    const d = await r.json();
    const choice = d.choices && d.choices[0];
    const reply = (choice && choice.message && choice.message.content) || "";
    return { ok: true, reply, usage: d.usage || null, raw: d, provider_used: "openai" };
  }
  // ── Gemini ────────────────────────────────────────────────────────────────
  if (provider === "gemini") {
    const r = await callGemini(env, { model, messages, system, max_tokens });
    if (!r.ok) { const t = await r.text(); return { ok: false, error: "gemini " + r.status + ": " + t.slice(0, 300) }; }
    const d = await r.json();
    const cand = d.candidates && d.candidates[0];
    const parts = cand && cand.content && cand.content.parts;
    const reply = (parts && parts[0] && parts[0].text) || "";
    return { ok: true, reply, usage: d.usageMetadata || null, raw: d, provider_used: "gemini" };
  }
  // ── Anthropic (default) ───────────────────────────────────────────────────
  const r = await callAnthropic(env, { model, messages, system, max_tokens, tools });
  if (!r.ok) { const t = await r.text(); return { ok: false, error: "anthropic " + r.status + ": " + t.slice(0, 300) }; }
  const d = await r.json();
  const reply = (d.content && d.content[0] && d.content[0].text) || "";
  return { ok: true, reply, usage: d.usage || null, raw: d, provider_used: "anthropic" };
}

// ---------- helpers (unchanged from v9) ----------
async function slackPost(env, text, channel) {
  if (!env.SLACK_BOT_TOKEN) return { ok: false, error: "SLACK_BOT_TOKEN missing" };
  const r = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", "Authorization": "Bearer " + env.SLACK_BOT_TOKEN },
    body: JSON.stringify({ channel, text }),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: !!j.ok, error: j.error, raw: j };
}


// ---------- telegram helpers ----------
async function telegramSend(env, text, chatId) {
  if (!env.TELEGRAM_BOT_TOKEN) return { ok: false, error: "TELEGRAM_BOT_TOKEN missing" };
  const cid = chatId || env.TELEGRAM_CHAT_ID;
  if (!cid) return { ok: false, error: "No chat_id — call /telegram/setup first or set TELEGRAM_CHAT_ID" };
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: cid, text, parse_mode: "HTML" }),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: !!j.ok, error: j.description || null, message_id: j.result?.message_id };
}

async function telegramGetChatId(env) {
  if (!env.TELEGRAM_BOT_TOKEN) return { ok: false, error: "TELEGRAM_BOT_TOKEN missing" };
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getUpdates?limit=5`);
  const j = await r.json().catch(() => ({}));
  if (!j.ok || !j.result?.length) return { ok: false, error: "No messages yet — send a message to your bot first, then call this again" };
  const latest = j.result[j.result.length - 1];
  const chatId = latest.message?.chat?.id || latest.channel_post?.chat?.id;
  const name = latest.message?.chat?.first_name || latest.message?.chat?.title || "unknown";
  return { ok: true, chat_id: chatId, name };
}


// ---------- discord helpers (v22) ----------
function hexToBytes(hex) {
  const b = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) b[i/2] = parseInt(hex.substr(i,2),16);
  return b;
}

async function verifyDiscordSig(env, request) {
  const sig = request.headers.get("X-Signature-Ed25519");
  const ts  = request.headers.get("X-Signature-Timestamp");
  if (!sig || !ts || !env.DISCORD_PUBLIC_KEY) return { valid: false, body: null };
  const body = await request.text();
  try {
    const key = await crypto.subtle.importKey(
      "raw", hexToBytes(env.DISCORD_PUBLIC_KEY),
      { name: "Ed25519" }, false, ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "Ed25519", key, hexToBytes(sig),
      new TextEncoder().encode(ts + body)
    );
    return { valid, body: valid ? body : null };
  } catch { return { valid: false, body: null }; }
}

async function discordSend(env, message, channelId) {
  if (!env.DISCORD_BOT_TOKEN) return { ok: false, error: "DISCORD_BOT_TOKEN missing" };
  const cid = channelId || env.DISCORD_CHANNEL_ID;
  if (!cid) return { ok: false, error: "No channel_id — set DISCORD_CHANNEL_ID or pass channel_id in body" };
  const r = await fetch(`https://discord.com/api/v10/channels/${cid}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, id: j.id, error: j.message || null };
}

async function discordGet(env, channelId, messageId) {
  if (!env.DISCORD_BOT_TOKEN) return { ok: false, error: "DISCORD_BOT_TOKEN missing" };
  const cid = channelId || env.DISCORD_CHANNEL_ID;
  if (!cid) return { ok: false, error: "no channel id" };
  if (!messageId) return { ok: false, error: "message_id required" };
  const r = await fetch(`https://discord.com/api/v10/channels/${cid}/messages/${messageId}`, {
    headers: { "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}` },
  });
  const t = await r.text();
  let body = null;
  try { body = JSON.parse(t); } catch (e) {}
  return { ok: r.ok, status: r.status, channel_id: cid, message: body, body_len: t.length };
}

async function handleDiscordInteractions(request, env) {
  const { valid, body } = await verifyDiscordSig(env, request);
  if (!valid) return new Response("Invalid signature", { status: 401 });
  const ix = JSON.parse(body);
  // PING
  if (ix.type === 1) return new Response(JSON.stringify({ type: 1 }), { headers: { "Content-Type": "application/json" } });
  // SLASH COMMAND
  if (ix.type === 2) {
    const cmd = ix.data?.name;
    if (cmd === "status") {
      let msg = "🏰 **Asgard Status**\n";
      try {
        const h = await fetch("https://asgard-ai.luckdragon.io/health").then(r => r.json());
        msg += `Version: ${h.version || "?"}\n`;
        msg += `Drive: ${h.features?.drive ? "✅" : "❌"}  Discord: ✅  D1: ${h.features?.d1 ? "✅" : "❌"}`;
      } catch { msg += "Could not reach health endpoint"; }
      return new Response(JSON.stringify({ type: 4, data: { content: msg } }), { headers: { "Content-Type": "application/json" } });
    }
    if (cmd === "notify") {
      const msg = ix.data?.options?.find(o => o.name === "message")?.value || "(empty)";
      return new Response(JSON.stringify({ type: 4, data: { content: `📣 ${msg}` } }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ type: 4, data: { content: "❓ Unknown command" } }), { headers: { "Content-Type": "application/json" } });
  }
  return new Response("OK", { status: 200 });
}

async function handleDiscordRegisterCommands(env) {
  if (!env.DISCORD_BOT_TOKEN || !env.DISCORD_APP_ID) return { ok: false, error: "DISCORD_BOT_TOKEN or DISCORD_APP_ID missing" };
  const commands = [
    { name: "status", description: "Check Asgard system status" },
    { name: "notify", description: "Broadcast a message to this channel", options: [{ name: "message", description: "What to say", type: 3, required: true }] },
  ];
  const r = await fetch(`https://discord.com/api/v10/applications/${env.DISCORD_APP_ID}/commands`, {
    method: "PUT",
    headers: { "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, registered: j.length ?? j, error: j.message || null };
}

async function memoryFetch(env, path, init) {
  // Memory reads now come from asgard-prod.facts D1 table (migrated from thunder-memory 2026-04-23).
  // Same response shape as the old thunder-memory /facts endpoint so the dashboard modal stays intact.
  if ((path === "/facts" || path.startsWith("/facts?")) && env.DB) {
    try {
      const r = await env.DB.prepare(
        "SELECT name as key, content as value, updated_at as updated, type, description FROM facts ORDER BY updated_at DESC"
      ).all();
      return { ok: true, json: { facts: r.results || [] }, status: 200 };
    } catch (e) {
      return { ok: false, json: { error: String(e.message || e) }, status: 500 };
    }
  }
  if (path === "/health" && env.DB) {
    return { ok: true, json: { ok: true, worker: "asgard-ai (memory via D1)", via: "asgard-prod.facts" }, status: 200 };
  }
  // Other legacy paths (/save, /sync, /snapshot) — deprecated post-thunder retirement.
  return { ok: false, json: { error: "memory endpoint retired; write directly to asgard-prod.facts via asgard-brain /d1/write", path }, status: 410 };
}

async function compressIfNeeded(env, convId) {
  if (!env.DB || !convId) return;
  try {
    const conv = await env.DB.prepare("SELECT summary, message_count FROM conversations WHERE id = ?").bind(convId).first();
    if (!conv) return;
    const mc = conv.message_count || 0;
    if (mc <= COMPRESS_THRESHOLD) return;
    const takeCount = mc - COMPRESS_KEEP_RECENT;
    if (takeCount < 4) return;
    const oldRows = await env.DB.prepare(
      "SELECT id, role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?"
    ).bind(convId, takeCount).all();
    const oldMsgs = oldRows.results || [];
    if (oldMsgs.length === 0) return;
    const existingSummary = conv.summary || '';
    const transcript = oldMsgs.map(m => (m.role || 'unknown').toUpperCase() + ": " + (m.content || '')).join('\n\n');
    const userPrompt =
      (existingSummary ? "PREVIOUS SUMMARY:\n" + existingSummary + "\n\n" : "") +
      "NEW TURNS TO INCORPORATE:\n" + transcript + "\n\n" +
      "Produce a concise updated summary (max 300 words). Preserve names, decisions, facts, unresolved questions. Output only the summary.";
    const result = await generate(env, {
      provider: "anthropic", model: MODELS.haiku.id,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 600,
      system: "You are a conversation summarizer. Output only the summary text.",
    });
    if (!result.ok) return;
    const newSummary = result.reply;
    if (!newSummary) return;
    const oldIds = oldMsgs.map(m => m.id);
    await env.DB.prepare(
      "UPDATE conversations SET summary = ?, message_count = MAX(0, message_count - ?) WHERE id = ?"
    ).bind(newSummary, oldIds.length, convId).run();
    const placeholders = oldIds.map(() => "?").join(",");
    await env.DB.prepare("DELETE FROM messages WHERE id IN (" + placeholders + ")").bind(...oldIds).run();
  } catch {}
}

async function archiveStale(env) {
  if (!env.DB) return 0;
  try {
    const cutoff = Date.now() - (ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000);
    const r = await env.DB.prepare(
      "UPDATE conversations SET archived_at = ? WHERE updated_at < ? AND archived_at IS NULL"
    ).bind(Date.now(), cutoff).run();
    return (r && r.meta && r.meta.changes) || 0;
  } catch { return 0; }
}

// ---------- Spend logging (v1) ----------
const SPEND_PRICING = {
  // per-million tokens [input, output]
  "claude-haiku-4-5-20251001": [0.80, 4.00],
  "claude-haiku-4-5":          [0.80, 4.00],
  "claude-sonnet-4-6":         [3.00, 15.00],
  "claude-opus-4-6":           [15.00, 75.00],
  "gpt-5":                     [5.00, 20.00],
  "gpt-5-mini":                [0.50, 2.00],
  "gpt-4.1":                   [2.00, 8.00],
  "gpt-4o":                    [2.50, 10.00],
  "gpt-4o-mini":               [0.15, 0.60],
  "o3":                        [15.00, 60.00],
  "o3-mini":                   [1.10, 4.40],
  "gemini-2.5-pro":            [1.25, 5.00],
  "gemini-2.5-flash":          [0.075, 0.30],
  "gemini-1.5-pro":            [1.25, 5.00],
};
const SPEND_PER_IMAGE = { "dall-e-3": 0.040, "dall-e-2": 0.020, "gpt-image-1": 0.042 };
// USD per 1k characters of input text (TTS -- output text length proxy)
const SPEND_TTS_PER_1K = {
  "eleven_multilingual_v2": 0.30, "eleven_turbo_v2_5": 0.30,
  "tts-1": 0.015, "tts-1-hd": 0.030,
};
function spendTokenCost(model, p, c) {
  const r = SPEND_PRICING[model];
  if (!r) return 0;
  return (p / 1e6) * r[0] + (c / 1e6) * r[1];
}
function spendNormalizeUsage(provider, usage) {
  if (!usage) return { p: 0, c: 0 };
  if (provider === "anthropic") return { p: usage.input_tokens|0, c: usage.output_tokens|0 };
  if (provider === "openai")    return { p: usage.prompt_tokens|0, c: usage.completion_tokens|0 };
  if (provider === "gemini")    return { p: usage.promptTokenCount|0, c: usage.candidatesTokenCount|0 };
  return { p: (usage.prompt_tokens||usage.input_tokens||0)|0, c: (usage.completion_tokens||usage.output_tokens||0)|0 };
}
async function logSpend(env, row) {
  if (!env || !env.DB) return;
  try {
    await env.DB.prepare(
      "INSERT INTO spend_log (ts, provider, model, endpoint, prompt_tokens, completion_tokens, cost_usd, uid, sid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      new Date().toISOString(),
      row.provider || "unknown",
      row.model || "unknown",
      row.endpoint || null,
      row.prompt_tokens|0,
      row.completion_tokens|0,
      +row.cost_usd || 0,
      row.uid || null,
      row.sid || null,
    ).run();
  } catch (e) {
    console.error("spend_log insert failed:", e && (e.message || String(e)));
  }
}

function bgLog(env, payload) {
  const p = logSpend(env, payload);
  if (env && env.__ctx && typeof env.__ctx.waitUntil === "function") {
    env.__ctx.waitUntil(p.catch(e => console.error("bgLog:", e && (e.message || String(e)))));
    return undefined;
  }
  return p;
}

// ─── MEMORY SYSTEM ───────────────────────────────────────────────────────────
async function _ensureMemoryTables(env) {
  if (!env.DB) return;
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS memory (id INTEGER PRIMARY KEY AUTOINCREMENT, pin_user TEXT NOT NULL, project TEXT NOT NULL DEFAULT 'global', key TEXT NOT NULL, value TEXT NOT NULL, is_shared INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)`).run();
    await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS memory_upk ON memory (pin_user, project, key)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS msg_groups (id TEXT PRIMARY KEY, name TEXT NOT NULL, members TEXT NOT NULL, created_by TEXT NOT NULL, created_at INTEGER NOT NULL)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS msg_inbox (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id TEXT NOT NULL, from_user TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS msg_read_receipts (group_id TEXT NOT NULL, pin_user TEXT NOT NULL, last_read_at INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (group_id, pin_user))`).run();
  } catch (e) { console.error('_ensureMemoryTables:', e && (e.message||String(e))); }
}

async function loadMemories(env, pinUser, project) {
  if (!env.DB || !pinUser) return '';
  try {
    await _ensureMemoryTables(env);
    const personal = await env.DB.prepare("SELECT key, value, project FROM memory WHERE pin_user = ? AND is_shared = 0 ORDER BY updated_at DESC LIMIT 60").bind(pinUser).all();
    const shared = await env.DB.prepare("SELECT key, value, project, pin_user FROM memory WHERE is_shared = 1 ORDER BY updated_at DESC LIMIT 100").bind().all();
    const lines = [];
    if ((personal.results||[]).length) {
      lines.push('--- Your personal memory ---');
      for (const r of personal.results) lines.push(`[${r.project}] ${r.key}: ${r.value}`);
    }
    if ((shared.results||[]).length) {
      lines.push('--- Shared team memory ---');
      for (const r of shared.results) lines.push(`[${r.project}] ${r.key}: ${r.value}`);
    }
    return lines.join('\n');
  } catch (e) { console.error('loadMemories:', e && (e.message||String(e))); return ''; }
}

async function handleMemorySave(request, env, pinUser) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  await _ensureMemoryTables(env);
  const body = await request.json().catch(() => ({}));
  const { key, value, project, shared = false } = body;
  if (!key || value === undefined) return json({ ok: false, error: 'key and value required' }, 400);
  if (!project) return json({ ok: false, error: 'project is REQUIRED — no default. Pick a slug from project_hub (e.g. kbt, asgard-final-build, wps-curriculum). Cross-project writes were causing data loss; this is now enforced at the HTTP layer too.' }, 400);
  const now = Date.now();
  // VERSIONED write to memory_v2 — append-only, full history preserved, audit_log fires automatically
  const prev = await env.DB.prepare("SELECT MAX(version) AS v FROM memory_v2 WHERE pin_user=? AND project=? AND key=?").bind(pinUser, project, String(key)).first();
  const nextVersion = (prev && prev.v ? prev.v : 0) + 1;
  await env.DB.prepare("INSERT INTO memory_v2 (pin_user, project, key, value, version, is_current, is_shared, actor, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)")
    .bind(pinUser, project, String(key), String(value), nextVersion, shared ? 1 : 0, 'http:/memory/save', now).run();
  // Legacy mirror so existing reads keep working
  await env.DB.prepare("INSERT INTO memory (pin_user, project, key, value, is_shared, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(pin_user, project, key) DO UPDATE SET value=excluded.value, is_shared=excluded.is_shared, updated_at=excluded.updated_at")
    .bind(pinUser, project, String(key), String(value), shared ? 1 : 0, now).run();
  return json({ ok: true, key, project, version: nextVersion, shared, pin_user: pinUser });
}

async function handleMemoryList(request, env, pinUser) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  await _ensureMemoryTables(env);
  const url = new URL(request.url);
  const project = url.searchParams.get('project') || null;
  let personal, shared;
  if (project) {
    personal = await env.DB.prepare("SELECT key, value, project, updated_at FROM memory WHERE pin_user = ? AND is_shared = 0 AND project = ? ORDER BY updated_at DESC").bind(pinUser, project).all();
    shared = await env.DB.prepare("SELECT key, value, project, pin_user, updated_at FROM memory WHERE is_shared = 1 AND project = ? ORDER BY updated_at DESC").bind(project).all();
  } else {
    personal = await env.DB.prepare("SELECT key, value, project, updated_at FROM memory WHERE pin_user = ? AND is_shared = 0 ORDER BY updated_at DESC LIMIT 100").bind(pinUser).all();
    shared = await env.DB.prepare("SELECT key, value, project, pin_user, updated_at FROM memory WHERE is_shared = 1 ORDER BY updated_at DESC LIMIT 200").bind().all();
  }
  return json({ ok: true, personal: personal.results||[], shared: shared.results||[] });
}

async function handleMemoryForget(request, env, pinUser) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  const body = await request.json().catch(() => ({}));
  const { key, project } = body;
  if (!key) return json({ ok: false, error: 'key required' }, 400);
  if (!project) return json({ ok: false, error: 'project required for forget_memory — cross-project forget is no longer allowed (was destroying data across projects)' }, 400);
  await env.DB.prepare("DELETE FROM memory WHERE pin_user = ? AND key = ? AND project = ?").bind(pinUser, key, project).run();
  await env.DB.prepare("UPDATE memory_v2 SET is_current = 0, superseded_at = ? WHERE pin_user = ? AND project = ? AND key = ? AND is_current = 1").bind(Date.now(), pinUser, project, key).run();
  return json({ ok: true, soft_deleted: key, project });
}

// ─── MESSAGING SYSTEM ────────────────────────────────────────────────────────
async function _resolveGroup(env, nameOrId, pinUser) {
  let row = await env.DB.prepare("SELECT * FROM msg_groups WHERE id = ? OR name = ?").bind(nameOrId, nameOrId).first();
  if (!row && pinUser) {
    const id = 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    await env.DB.prepare("INSERT INTO msg_groups (id, name, members, created_by, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, nameOrId, JSON.stringify([pinUser]), pinUser, Date.now()).run();
    row = { id, name: nameOrId, members: JSON.stringify([pinUser]), created_by: pinUser, created_at: Date.now() };
  }
  return row;
}

async function handleMsgGroupCreate(request, env, pinUser) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  await _ensureMemoryTables(env);
  const body = await request.json().catch(() => ({}));
  const { name, members = [] } = body;
  if (!name) return json({ ok: false, error: 'name required' }, 400);
  const allMembers = [...new Set([pinUser, ...members])];
  const id = 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
  await env.DB.prepare("INSERT OR REPLACE INTO msg_groups (id, name, members, created_by, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, name, JSON.stringify(allMembers), pinUser, Date.now()).run();
  return json({ ok: true, id, name, members: allMembers });
}

async function handleMsgGroupList(request, env, pinUser) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  await _ensureMemoryTables(env);
  const rows = await env.DB.prepare("SELECT id, name, members, created_by, created_at FROM msg_groups ORDER BY created_at DESC").all();
  const groups = (rows.results||[]).filter(g => { try { return JSON.parse(g.members||'[]').includes(pinUser); } catch { return false; } })
    .map(g => ({ ...g, members: JSON.parse(g.members||'[]') }));
  return json({ ok: true, groups });
}

async function handleMsgSend(request, env, pinUser) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  await _ensureMemoryTables(env);
  const body = await request.json().catch(() => ({}));
  const { group, message } = body;
  if (!group || !message) return json({ ok: false, error: 'group and message required' }, 400);
  const g = await _resolveGroup(env, group, pinUser);
  if (!g) return json({ ok: false, error: 'group not found' }, 404);
  const now = Date.now();
  await env.DB.prepare("INSERT INTO msg_inbox (group_id, from_user, body, created_at) VALUES (?, ?, ?, ?)").bind(g.id, pinUser, message, now).run();
  return json({ ok: true, group_id: g.id, group_name: g.name, from: pinUser, sent_at: now });
}

async function handleMsgRead(request, env, pinUser) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  await _ensureMemoryTables(env);
  const url = new URL(request.url);
  const groupNameOrId = url.searchParams.get('group');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  if (!groupNameOrId) return json({ ok: false, error: 'group param required' }, 400);
  const g = await env.DB.prepare("SELECT * FROM msg_groups WHERE id = ? OR name = ?").bind(groupNameOrId, groupNameOrId).first();
  if (!g) return json({ ok: false, error: 'group not found: ' + groupNameOrId }, 404);
  const rows = await env.DB.prepare("SELECT id, from_user, body, created_at FROM msg_inbox WHERE group_id = ? ORDER BY created_at DESC LIMIT ?").bind(g.id, limit).all();
  const now = Date.now();
  await env.DB.prepare("INSERT OR REPLACE INTO msg_read_receipts (group_id, pin_user, last_read_at) VALUES (?, ?, ?)").bind(g.id, pinUser, now).run();
  return json({ ok: true, group: { id: g.id, name: g.name, members: JSON.parse(g.members||'[]') }, messages: (rows.results||[]).reverse() });
}

async function handleMsgUnread(request, env, pinUser) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  await _ensureMemoryTables(env);
  const allGroups = await env.DB.prepare("SELECT id, name, members FROM msg_groups").all();
  const myGroups = (allGroups.results||[]).filter(g => { try { return JSON.parse(g.members||'[]').includes(pinUser); } catch { return false; } });
  let totalUnread = 0;
  const counts = [];
  for (const g of myGroups) {
    const rr = await env.DB.prepare("SELECT last_read_at FROM msg_read_receipts WHERE group_id = ? AND pin_user = ?").bind(g.id, pinUser).first();
    const since = rr ? rr.last_read_at : 0;
    const c = await env.DB.prepare("SELECT COUNT(*) as n FROM msg_inbox WHERE group_id = ? AND created_at > ? AND from_user != ?").bind(g.id, since, pinUser).first();
    const n = c ? c.n : 0;
    if (n > 0) counts.push({ group_id: g.id, name: g.name, unread: n });
    totalUnread += n;
  }
  return json({ ok: true, total_unread: totalUnread, groups: counts });
}
// ─────────────────────────────────────────────────────────────────────────────
// Tee an SSE stream and parse Anthropic-style usage events; log on flush.
function teeStreamForSpendLog(upstreamBody, env, opts) {
  const decoder = new TextDecoder();
  let buf = "";
  let prompt_tokens = 0;
  let completion_tokens = 0;
  const ts = new TransformStream({
    transform(chunk, ctrl) {
      ctrl.enqueue(chunk);
      try {
        buf += decoder.decode(chunk, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          const evt = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const m = evt.match(/^data:\s*(\{[\s\S]*\})\s*$/m);
          if (!m) continue;
          let d; try { d = JSON.parse(m[1]); } catch { continue; }
          if (d.message && d.message.usage) {
            if (d.message.usage.input_tokens)  prompt_tokens     = d.message.usage.input_tokens;
            if (d.message.usage.output_tokens) completion_tokens = d.message.usage.output_tokens;
          }
          if (d.usage) {
            if (d.usage.input_tokens)  prompt_tokens     = d.usage.input_tokens;
            if (d.usage.output_tokens) completion_tokens = d.usage.output_tokens;
          }
        }
      } catch {}
    },
    async flush() {
      try {
        const cost = spendTokenCost(opts.model, prompt_tokens, completion_tokens);
        await bgLog(env, { ...opts, prompt_tokens, completion_tokens, cost_usd: cost });
      } catch (e) { console.error("spend stream flush:", e && (e.message || String(e))); }
    }
  });
  return upstreamBody.pipeThrough(ts);
}

// ---------- route handlers ----------
async function handleChatSmart(request, env) {
  const body = await request.json().catch(() => ({}));
  const message = (body.message || "").toString();
  if (!message) return err("message required", 400);
  const uid = body.uid || request.headers.get("X-User-Id") || "paddy";
  const project = body.project || "global";
  const pinUser = await identifyPin(request, env) || uid;
  env._pinUser = pinUser;
  const modelKey = body.model || quickRoute(message);
  const resolved = resolveModel(modelKey);

  let convId = body.conversation_id || null;
  let history = Array.isArray(body.history) ? body.history : [];
  let summary = "";
  if (convId && env.DB) {
    try {
      const convRow = await env.DB.prepare(
        "SELECT summary FROM conversations WHERE id = ? AND (archived_at IS NULL OR archived_at = 0)"
      ).bind(convId).first();
      if (convRow) summary = convRow.summary || "";
      if (history.length === 0) {
        const rows = await env.DB.prepare(
          "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 50"
        ).bind(convId).all();
        history = (rows.results || []).map(r => ({ role: r.role, content: r.content }));
      }
    } catch {}
  }
  const messages = [...history, { role: "user", content: message }];
  const memCtx = await loadMemories(env, pinUser, project);
  let systemText = SYSTEM_PROMPT;
  if (memCtx) systemText += '\n\n--- Memory context ---\n' + memCtx + '\n--- End memory ---';
  if (summary) {
    systemText += "\n\n--- Summary of earlier turns ---\n" + summary + "\n--- End summary ---";
  }
  // v6.4.0: Honour caller-supplied system context (live context from falkor-agent)
  if (body.system) systemText += '\n\n--- Caller context (live data) ---\n' + body.system + '\n--- End caller context ---';
  if (body.context && Array.isArray(body.context)) {
    // Merge caller's context history into messages (override DB history if provided)
    if (body.context.length > 0) {
      const callerMessages = [...body.context, { role: "user", content: message }];
      messages.splice(0, messages.length, ...callerMessages);
    }
  }

  const result = await generate(env, {
    provider: resolved.provider, model: resolved.id,
    messages, system: systemText,
    max_tokens: body.max_tokens || 4096,
  });
  if (!result.ok) return err(result.error, 502);
  const reply = result.reply;

  const now = Date.now();
  if (env.DB) {
    try {
      if (!convId) {
        convId = "c_" + now + "_" + Math.random().toString(36).slice(2, 8);
        const title = message.slice(0, 80);
        await env.DB.prepare(
          "INSERT INTO conversations (id, uid, project, title, created_at, updated_at, message_count) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(convId, uid, project, title, now, now, 2).run();
      } else {
        await env.DB.prepare(
          "UPDATE conversations SET updated_at = ?, message_count = message_count + 2, archived_at = NULL WHERE id = ?"
        ).bind(now, convId).run();
      }
      await env.DB.prepare(
        "INSERT INTO messages (conversation_id, role, content, model, created_at) VALUES (?, 'user', ?, ?, ?)"
      ).bind(convId, message, resolved.id, now).run();
      await env.DB.prepare(
        "INSERT INTO messages (conversation_id, role, content, model, created_at) VALUES (?, 'assistant', ?, ?, ?)"
      ).bind(convId, reply, resolved.id, now + 1).run();
    } catch {}
    await compressIfNeeded(env, convId);
  }

  // spend log (fire-and-forget, never blocks response)
  try {
    const _u = spendNormalizeUsage(resolved.provider, result.usage);
    const _cost = spendTokenCost(resolved.id, _u.p, _u.c);
    await bgLog(env, {
      provider: resolved.provider, model: resolved.id, endpoint: "chat",
      prompt_tokens: _u.p, completion_tokens: _u.c, cost_usd: _cost,
      uid, sid: convId || null,
    });
  } catch (e) { console.error("spend log (chat):", e && (e.message || String(e))); }

  return json({
    ok: true, reply,
    provider: resolved.provider, model: resolved.id, model_key: modelKey,
    conversation_id: convId || ("c_" + now),
    usage: result.usage || null,
    compressed: !!summary,
  });
}

async function handleChatStream(request, env) {
  const body = await request.json().catch(() => ({}));

  // Accept pre-built messages array (from falkor-agent) or legacy {message, history} format
  let messages;
  const system = body.system || null;
  const max_tokens = body.max_tokens || 2048;

  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages;
  } else {
    const message = (body.message || body.text || "").toString();
    if (!message) return err("message required", 400);
    const history = Array.isArray(body.history) ? body.history : [];
    messages = [...history, { role: "user", content: message }];
  }

  const uid = body.uid || request.headers.get("X-User-Id") || "paddy";
  const sid = body.conversation_id || body.sid || request.headers.get("X-Session-Id") || null;
  const modelKey = body.model || "groq-fast";
  const resolved = resolveModel(modelKey);

  // Normalize any provider's SSE to: data: {"t":"<token>"}\n\n
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const enc = new TextEncoder();

  const writeToken = async (text) => {
    if (!text) return;
    await writer.write(enc.encode("data: " + JSON.stringify({ t: text }) + "\n\n"));
  };

  const parseSseStream = async (upstream, extractToken) => {
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const raw = trimmed.slice(5).trim();
        if (raw === "[DONE]") continue;
        try {
          const parsed = JSON.parse(raw);
          const token = extractToken(parsed);
          if (token) await writeToken(token);
        } catch {}
      }
    }
  };

  (async () => {
    try {
      if (resolved.provider === "groq") {
        const upstream = await callGroq(env, { model: resolved.id, messages, system, max_tokens, stream: true });
        if (!upstream.ok) { await writeToken("[AI error: " + upstream.status + "]"); return; }
        // OpenAI-compatible SSE: choices[0].delta.content
        await parseSseStream(upstream, p => p?.choices?.[0]?.delta?.content);
      } else if (resolved.provider === "openai") {
        const upstream = await callOpenAI(env, { model: resolved.id, messages, system, max_tokens, stream: true });
        if (!upstream.ok) { await writeToken("[AI error: " + upstream.status + "]"); return; }
        await parseSseStream(upstream, p => p?.choices?.[0]?.delta?.content);
      } else {
        // Anthropic: content_block_delta events
        const upstream = await callAnthropic(env, { model: resolved.id, messages, system: system || SYSTEM_PROMPT, max_tokens, stream: true });
        if (!upstream.ok) { const t = await upstream.text(); await writeToken("[AI error: " + upstream.status + "]"); return; }
        await parseSseStream(upstream, p => (p?.type === "content_block_delta" && p?.delta?.type === "text_delta") ? p.delta.text : null);
      }
    } catch (e) {
      await writeToken("[stream error: " + (e.message || String(e)) + "]");
    } finally {
      await writer.close().catch(() => {});
    }
  })();

  return new Response(readable, {
    status: 200,
    headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" },
  });
}

async function handleChatAgent(request, env) {
  const body = await request.json().catch(() => ({}));
  const message = (body.message || "").toString();
  if (!message) return err("message required", 400);
  try {
    let r;
    const payload = JSON.stringify({ task: message });
    if (env && env.ASGARD_BRAIN && typeof env.ASGARD_BRAIN.fetch === 'function') {
      r = await env.ASGARD_BRAIN.fetch(new Request("https://asgard-brain/run", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: payload,
      }));
    } else {
      r = await fetch(ASGARD_BRAIN + "/run", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: payload,
      });
    }
    const d = await r.json().catch(() => ({}));
    return json({ ok: !!d.ok, reply: d.result || d.answer || d.reply || "", model: "asgard-brain", agent: "brain-run", task: message });
  } catch (e) {
    return err("brain error: " + (e.message || String(e)), 502);
  }
}

// ---------- NEW: Vision (image + text) ----------
async function handleChatVision(request, env) {
  const body = await request.json().catch(() => ({}));
  const message = (body.message || "Describe this image").toString();
  const imageUrl = body.image_url;
  const imageBase64 = body.image_base64;
  const imageMime = body.image_mime || (function(){
    if (!body.image_base64) return "image/jpeg";
    const b = body.image_base64.slice(0, 16);
    if (b.startsWith("iVBORw0K")) return "image/png";
    if (b.startsWith("R0lGOD")) return "image/gif";
    if (b.startsWith("UklGR")) return "image/webp";
    if (b.startsWith("/9j/")) return "image/jpeg";
    return "image/jpeg";
  })();
  const modelKey = body.model || "sonnet";
  const resolved = resolveModel(modelKey);
  const uid = body.uid || request.headers.get("X-User-Id") || "paddy";
  const sid = body.conversation_id || body.sid || request.headers.get("X-Session-Id") || null;
  if (!imageUrl && !imageBase64) return err("image_url or image_base64 required", 400);

  if (resolved.provider === "anthropic") {
    if (!env.ANTHROPIC_API_KEY) return err("ANTHROPIC_API_KEY missing", 500);
    const imageBlock = imageBase64
      ? { type: "image", source: { type: "base64", media_type: imageMime, data: imageBase64 } }
      : { type: "image", source: { type: "url", url: imageUrl } };
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: resolved.id, max_tokens: 1024, system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: [imageBlock, { type: "text", text: message }] }],
      }),
    });
    if (!r.ok) { const t = await r.text(); return err("anthropic vision " + r.status + ": " + t.slice(0, 300), 502); }
    const d = await r.json();
    try {
      const _u = spendNormalizeUsage("anthropic", d.usage);
      const _cost = spendTokenCost(resolved.id, _u.p, _u.c);
      await bgLog(env, { provider: "anthropic", model: resolved.id, endpoint: "vision",
        prompt_tokens: _u.p, completion_tokens: _u.c, cost_usd: _cost, uid, sid });
    } catch (e) { console.error("spend log (vision anthropic):", e && (e.message || String(e))); }
    return json({ ok: true, reply: (d.content && d.content[0] && d.content[0].text) || "", model: resolved.id, provider: "anthropic", usage: d.usage });
  }
  if (resolved.provider === "openai") {
    if (!env.OPENAI_API_KEY) return err("OPENAI_API_KEY missing", 500);
    const imagePart = imageBase64
      ? { type: "image_url", image_url: { url: "data:" + imageMime + ";base64," + imageBase64 } }
      : { type: "image_url", image_url: { url: imageUrl } };
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
      body: JSON.stringify({
        model: resolved.id,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: [imagePart, { type: "text", text: message }] },
        ],
        max_tokens: 1024,
      }),
    });
    if (!r.ok) { const t = await r.text(); return err("openai vision " + r.status + ": " + t.slice(0, 300), 502); }
    const d = await r.json();
    try {
      const _u = spendNormalizeUsage("openai", d.usage);
      const _cost = spendTokenCost(resolved.id, _u.p, _u.c);
      await bgLog(env, { provider: "openai", model: resolved.id, endpoint: "vision",
        prompt_tokens: _u.p, completion_tokens: _u.c, cost_usd: _cost, uid, sid });
    } catch (e) { console.error("spend log (vision openai):", e && (e.message || String(e))); }
    return json({ ok: true, reply: d.choices[0].message.content, model: resolved.id, provider: "openai", usage: d.usage });
  }
  return err("vision not supported for provider " + resolved.provider, 400);
}

// ---------- NEW: Image generation (DALL-E) ----------
async function handleImageGenerate(request, env) {
  const body = await request.json().catch(() => ({}));
  const prompt = (body.prompt || "").toString();
  const size = body.size || "1024x1024";
  const model = body.model || "gpt-image-1";
  const uid = body.uid || request.headers.get("X-User-Id") || "paddy";
  const sid = body.conversation_id || body.sid || request.headers.get("X-Session-Id") || null;
  if (!prompt) return err("prompt required", 400);
  if (!env.OPENAI_API_KEY) return err("OPENAI_API_KEY missing", 500);
  // gpt-image-1: quality low/medium/high; dall-e-3: standard/hd
  const quality = body.quality || (model === "gpt-image-1" ? "medium" : "standard");
  const reqBody = { model, prompt, size, quality, n: 1 };
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
    body: JSON.stringify(reqBody),
  });
  if (!r.ok) { const t = await r.text(); return err("image-gen " + r.status + ": " + t.slice(0, 300), 502); }
  const d = await r.json();
  const image = d.data && d.data[0];
  // gpt-image-1 returns b64_json; dall-e-3 returns url
  let imageUrl = image && image.url;
  if (!imageUrl && image && image.b64_json) {
    imageUrl = "data:image/png;base64," + image.b64_json;
  }
  try {
    const _cost = SPEND_PER_IMAGE[model] || 0.042;
    await bgLog(env, { provider: "openai", model, endpoint: "image",
      prompt_tokens: 0, completion_tokens: 0, cost_usd: _cost, uid, sid });
  } catch (e) { console.error("spend log (image):", e && (e.message || String(e))); }
  return json({ ok: true, url: imageUrl, revised_prompt: image && image.revised_prompt, model });
}

// ---------- Image generate-and-store (DALL-E 3 / gpt-image-1 → Supabase permanent URL) ----------
async function handleImageGenerateAndStore(request, env) {
  const body = await request.json().catch(() => ({}));
  const prompt = (body.prompt || '').toString();
  const folder = (body.folder || 'general').replace(/[^a-z0-9_-]/gi, '-');
  const size = body.size || '1024x1024';
  const model = body.model || 'gpt-image-1';
  const style = body.style || 'vivid';
  const quality = body.quality || (model === 'gpt-image-1' ? 'medium' : 'standard');
  const uid = body.uid || 'paddy';
  const filename = body.filename || (Date.now() + '-' + Math.random().toString(36).slice(2,8) + '.png');

  if (!prompt) return err('prompt required', 400);
  if (!env.OPENAI_API_KEY) return err('OPENAI_API_KEY missing', 500);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return err('Supabase not configured', 500);

  // Step 1: Generate image (always request b64_json for storage)
  // gpt-image-1 doesn't support response_format (always b64_json)
  // dall-e-3 needs response_format: 'b64_json' explicitly
  const reqBody = { model, prompt, size, quality, n: 1 };
  if (model === 'dall-e-3') {
    reqBody.style = style;
    reqBody.response_format = 'b64_json';
  }
  const genRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + env.OPENAI_API_KEY },
    body: JSON.stringify(reqBody),
  });
  if (!genRes.ok) { const t = await genRes.text(); return err('image-gen ' + genRes.status + ': ' + t.slice(0,300), 502); }
  const genData = await genRes.json();
  const image = genData.data && genData.data[0];
  if (!image) return err('no image data returned', 502);
  // gpt-image-1 always returns b64_json; dall-e-3 returns b64_json when requested
  const b64 = image.b64_json || (image.url ? null : null);
  if (!image.b64_json && !image.url) return err('no image data in response', 502);

  // Step 2: Upload to Supabase generated-images bucket
  const path = folder + '/' + filename;
  // Get bytes: from b64_json directly, or fetch from temporary URL
  let bytes;
  if (image.b64_json) {
    const binary = atob(image.b64_json);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } else {
    // dall-e-3 without response_format returns a temporary URL — fetch and store
    const imgRes = await fetch(image.url);
    if (!imgRes.ok) return err('failed to fetch generated image URL', 502);
    bytes = new Uint8Array(await imgRes.arrayBuffer());
  }

  const uploadRes = await fetch(env.SUPABASE_URL + '/storage/v1/object/generated-images/' + path, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: bytes,
  });
  if (!uploadRes.ok) {
    const t = await uploadRes.text();
    return err('supabase-upload ' + uploadRes.status + ': ' + t.slice(0,200), 502);
  }

  // Step 3: Build permanent public URL
  const publicUrl = env.SUPABASE_URL + '/storage/v1/object/public/generated-images/' + path;

  // Log spend
  try {
    const _cost = SPEND_PER_IMAGE[model] || 0.040;
    await bgLog(env, { provider: 'openai', model, endpoint: 'image-store',
      prompt_tokens: 0, completion_tokens: 0, cost_usd: _cost, uid, sid: null });
  } catch(e) {}

  return json({
    ok: true,
    url: publicUrl,
    path,
    model,
    revised_prompt: image.revised_prompt,
    folder,
  });
}

// ---------- NEW: TTS via ElevenLabs ----------
async function handleSpeak(request, env) {
  const body = await request.json().catch(() => ({}));
  const text = (body.text || "").toString();
  if (!text) return err("text required", 400);
  const uid = body.uid || request.headers.get("X-User-Id") || "paddy";
  const sid = body.conversation_id || body.sid || request.headers.get("X-Session-Id") || null;
  // Default to OpenAI TTS — ElevenLabs free tier blocks CF Workers IPs as "proxy/VPN abuse"
  const provider = (body.provider || "openai").toLowerCase();
  if (provider === "openai") {
    if (!env.OPENAI_API_KEY) return err("OPENAI_API_KEY missing", 500);
    const voice = body.voice || "alloy";
    const model = body.model_id || "tts-1";
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
      body: JSON.stringify({ model, input: text, voice, response_format: "mp3" }),
    });
    if (!r.ok) { const t = await r.text(); return err("openai tts " + r.status + ": " + t.slice(0, 300), 502); }
    try {
      const rate = SPEND_TTS_PER_1K[model] || 0.015;
      const cost = (text.length / 1000) * rate;
      await bgLog(env, { provider: "openai", model, endpoint: "speak",
        prompt_tokens: text.length, completion_tokens: 0, cost_usd: cost, uid, sid });
    } catch (e) { console.error("spend log (speak openai):", e && (e.message || String(e))); }
    return new Response(r.body, { status: 200, headers: { ...CORS, "Content-Type": "audio/mpeg" } });
  }
  // ElevenLabs path (only useful on a paid plan)
  if (!env.ELEVENLABS_API_KEY) return err("ELEVENLABS_API_KEY missing", 500);
  const voice = body.voice || "21m00Tcm4TlvDq8ikWAM";
  const elevenModel = body.model_id || "eleven_turbo_v2_5";
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": env.ELEVENLABS_API_KEY, "Accept": "audio/mpeg" },
    body: JSON.stringify({ text, model_id: elevenModel, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!r.ok) { const t = await r.text(); return err("elevenlabs " + r.status + ": " + t.slice(0, 300), 502); }
  try {
    const rate = SPEND_TTS_PER_1K[elevenModel] || 0.30;
    const cost = (text.length / 1000) * rate;
    await bgLog(env, { provider: "elevenlabs", model: elevenModel, endpoint: "speak",
      prompt_tokens: text.length, completion_tokens: 0, cost_usd: cost, uid, sid });
  } catch (e) { console.error("spend log (speak elevenlabs):", e && (e.message || String(e))); }
  return new Response(r.body, { status: 200, headers: { ...CORS, "Content-Type": "audio/mpeg" } });
}

// ─── STT: Speech-to-Text via OpenAI Whisper (or Deepgram if key present) ─────
async function handleSTT(request, env) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return err("multipart/form-data with 'audio' field required", 400);
  const audioFile = formData.get('audio');
  if (!audioFile) return err("'audio' field missing", 400);
  const uid = formData.get('uid') || request.headers.get("X-User-Id") || "paddy";

  // Try Deepgram first (better accuracy) if key is present
  if (env.DEEPGRAM_API_KEY) {
    try {
      const audioBuffer = await audioFile.arrayBuffer();
      const mimeType = audioFile.type || 'audio/webm';
      const r = await fetch("https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true", {
        method: "POST",
        headers: {
          "Authorization": "Token " + env.DEEPGRAM_API_KEY,
          "Content-Type": mimeType,
        },
        body: audioBuffer,
      });
      if (r.ok) {
        const d = await r.json();
        const transcript = d?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
        if (transcript) return json({ ok: true, text: transcript, provider: "deepgram" });
      }
    } catch(e) { console.error("Deepgram STT error:", e?.message); }
  }

  // Fallback: OpenAI Whisper
  if (!env.OPENAI_API_KEY) return err("OPENAI_API_KEY missing — no STT provider available", 500);
  const fd = new FormData();
  fd.append("file", audioFile, audioFile.name || "audio.webm");
  fd.append("model", "whisper-1");
  fd.append("language", "en");
  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { "Authorization": "Bearer " + env.OPENAI_API_KEY },
    body: fd,
  });
  if (!r.ok) { const t = await r.text(); return err("whisper " + r.status + ": " + t.slice(0,300), 502); }
  const d = await r.json();
  return json({ ok: true, text: d.text || "", provider: "openai-whisper" });
}

// ─── Weather via Open-Meteo (free, no key) ─────────────────────────────────
async function handleWeather(request, env) {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat') || '-37.8';
  const lon = url.searchParams.get('lon') || '144.9';
  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation_probability,uv_index` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,sunrise,sunset` +
    `&hourly=precipitation_probability&wind_speed_unit=kmh&temperature_unit=celsius&timezone=Australia/Melbourne&forecast_days=3`
  );
  if (!r.ok) return err("open-meteo " + r.status, 502);
  const d = await r.json();
  // Build PE-friendly summary
  const c = d.current;
  const today = d.daily;
  const wmoDesc = (code) => {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Fog';
    if (code <= 57) return 'Drizzle';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Rain showers';
    if (code <= 86) return 'Snow showers';
    return 'Thunderstorm';
  };
  const suitable_for_pe = c.temperature_2m >= 8 && c.temperature_2m <= 36 &&
    c.wind_speed_10m < 40 && (today.precipitation_sum?.[0] || 0) < 5 &&
    (c.uv_index || 0) < 9;
  return json({
    ok: true,
    current: {
      temp: c.temperature_2m,
      feels_like: c.apparent_temperature,
      condition: wmoDesc(c.weather_code),
      wind_kmh: c.wind_speed_10m,
      uv: c.uv_index,
      rain_chance: c.precipitation_probability,
    },
    today: {
      max: today.temperature_2m_max?.[0],
      min: today.temperature_2m_min?.[0],
      rain_mm: today.precipitation_sum?.[0],
      sunrise: today.sunrise?.[0],
      sunset: today.sunset?.[0],
    },
    pe_suitable: suitable_for_pe,
    pe_note: suitable_for_pe
      ? "✅ Good conditions for outdoor PE"
      : `⚠️ Check before going outside — ${c.temperature_2m < 8 ? 'cold' : c.temperature_2m > 36 ? 'too hot' : (c.uv_index||0) >= 9 ? 'UV extreme' : 'rain risk'}`,
  });
}

async function handleFeatureRequest(request, env) {
  const body = await request.json().catch(() => ({}));
  const uid = body.uid || body.user || "unknown";
  const name = body.name || uid;
  const scope = body.scope || "-";
  const text = body.body || body.message || "";
  if (!text) return err("body required", 400);
  const slackText = "*Feature Request* from *" + name + "* (" + uid + ")\n*Scope:* " + scope + "\n*Request:* " + text + "\n_Logged: " + new Date().toISOString() + "_";
  const chain = [body.channel, "#asgard-feature-requests", "#asgard-alerts", "#general"].filter(Boolean);
  const attempts = [];
  for (const ch of chain) {
    const r = await slackPost(env, slackText, ch);
    attempts.push({ channel: ch, ok: r.ok, error: r.error || null });
    if (r.ok) return json({ ok: true, channel: ch, attempts });
  }
  return err("all slack channels failed", 502, { attempts });
}

async function handleMemoryGet(request, env) {
  const url = new URL(request.url);
    // /claude/messages proxy — injects API key from env
    if (url.pathname === '/claude/messages') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
      }
      const fwdHeaders = { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'x-api-key': env.ANTHROPIC_API_KEY };
      const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: fwdHeaders, body: request.body
      });
      const rh = new Headers(anthropicResp.headers);
      rh.set('Access-Control-Allow-Origin', '*');
      return new Response(anthropicResp.body, { status: anthropicResp.status, headers: rh });
    }

  const uid = url.searchParams.get("uid") || "paddy";
  const project = url.searchParams.get("project") || "shared";
  const qs = "?uid=" + encodeURIComponent(uid) + "&project=" + encodeURIComponent(project);
  const { ok, json: j, status } = await memoryFetch(env, "/facts" + qs);
  if (!ok) return json({ memory: { facts: [] }, upstream_status: status, upstream: j }, 200);
  const facts = Array.isArray(j.facts) ? j.facts : ((j.memory && j.memory.facts) || []);
  return json({ memory: { facts, count: facts.length } });
}

async function handleConversations(request, env) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid") || "paddy";
  const showArchived = url.searchParams.get("archived") === "1";
  if (!env.DB) return json({ conversations: [] });
  try {
    await archiveStale(env);
    const where = showArchived ? "AND archived_at IS NOT NULL" : "AND (archived_at IS NULL OR archived_at = 0)";
    const rows = await env.DB.prepare(
      "SELECT id, title, updated_at, message_count, summary, archived_at FROM conversations WHERE uid = ? " + where + " ORDER BY updated_at DESC LIMIT 50"
    ).bind(uid).all();
    const conversations = (rows.results || []).map(r => ({
      id: r.id, title: r.title, updated: new Date(r.updated_at).toISOString(),
      messages: r.message_count, compressed: !!r.summary, archived: !!r.archived_at,
    }));
    return json({ conversations, showing: showArchived ? "archived" : "active" });
  } catch (e) {
    return json({ conversations: [], error: e.message });
  }
}

async function handleHistory(request, env) {
  const url = new URL(request.url);
  const convId = url.searchParams.get("conv") || url.searchParams.get("conversation_id");
  const uid = url.searchParams.get("uid") || "paddy";
  if (!convId || !env.DB) return json({ messages: [] });
  try {
    const own = await env.DB.prepare("SELECT uid, summary, archived_at FROM conversations WHERE id = ?").bind(convId).first();
    if (!own || own.uid !== uid) return json({ messages: [] });
    const rows = await env.DB.prepare(
      "SELECT role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
    ).bind(convId).all();
    const messages = (rows.results || []).map(r => ({ role: r.role, content: r.content, ts: new Date(r.created_at).toISOString() }));
    return json({ messages, summary: own.summary || null, archived: !!own.archived_at });
  } catch (e) {
    return json({ messages: [], error: e.message });
  }
}

async function handleMemoryClear(request, env) {
  return json({ ok: false, error: "bulk memory clear not implemented upstream" }, 501);
}


// ---------- GitHub ----------
async function githubApi(env, method, path, body) {
  if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN missing");
  const r = await fetch("https://api.github.com" + path, {
    method,
    headers: {
      "Authorization": "Bearer " + env.GITHUB_TOKEN,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "asgard-ai",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 400) }; }
  return { ok: r.ok, status: r.status, data };
}

async function handleGithubRepos(request, env) {
  const r = await githubApi(env, "GET", "/user/repos?per_page=100&sort=updated");
  if (!r.ok) return err("github " + r.status + ": " + JSON.stringify(r.data).slice(0, 200), 502);
  return json({ ok: true, repos: (r.data || []).map(x => ({ name: x.full_name, private: x.private, updated: x.updated_at, default_branch: x.default_branch, url: x.html_url })) });
}

async function handleGithubReadFile(request, env) {
  const body = await request.json().catch(() => ({}));
  const { repo, path, ref } = body;
  if (!repo || !path) return err("repo and path required", 400);
  const r = await githubApi(env, "GET", "/repos/" + repo + "/contents/" + encodeURIComponent(path) + (ref ? "?ref=" + encodeURIComponent(ref) : ""));
  if (!r.ok) return err("github " + r.status + ": " + JSON.stringify(r.data).slice(0, 200), 502);
  const content = r.data.content ? atob(r.data.content.replace(/\n/g, "")) : "";
  return json({ ok: true, path: r.data.path, sha: r.data.sha, size: r.data.size, content });
}

async function handleGithubCommitFile(request, env) {
  const body = await request.json().catch(() => ({}));
  const { repo, path, content, message, branch } = body;
  if (!repo || !path || content === undefined || !message) return err("repo, path, content, message required", 400);
  // Find current sha (if exists)
  let sha;
  try {
    const cur = await githubApi(env, "GET", "/repos/" + repo + "/contents/" + encodeURIComponent(path) + (branch ? "?ref=" + encodeURIComponent(branch) : ""));
    if (cur.ok) sha = cur.data.sha;
  } catch {}
  const b64 = typeof btoa === "function" ? btoa(unescape(encodeURIComponent(content))) : Buffer.from(content).toString("base64");
  const payload = { message, content: b64, ...(sha ? { sha } : {}), ...(branch ? { branch } : {}) };
  const r = await githubApi(env, "PUT", "/repos/" + repo + "/contents/" + encodeURIComponent(path), payload);
  if (!r.ok) return err("github " + r.status + ": " + JSON.stringify(r.data).slice(0, 200), 502);
  return json({ ok: true, commit: r.data.commit && r.data.commit.sha, path, url: r.data.content && r.data.content.html_url });
}

async function handleGithubCreatePr(request, env) {
  const body = await request.json().catch(() => ({}));
  const { repo, title, head, base, body: prBody } = body;
  if (!repo || !title || !head || !base) return err("repo, title, head, base required", 400);
  const r = await githubApi(env, "POST", "/repos/" + repo + "/pulls", { title, head, base, body: prBody || "" });
  if (!r.ok) return err("github " + r.status + ": " + JSON.stringify(r.data).slice(0, 200), 502);
  return json({ ok: true, number: r.data.number, url: r.data.html_url });
}

async function handleGithubCreateIssue(request, env) {
  const body = await request.json().catch(() => ({}));
  const { repo, title, body: issueBody, labels } = body;
  if (!repo || !title) return err("repo and title required", 400);
  const r = await githubApi(env, "POST", "/repos/" + repo + "/issues", { title, body: issueBody || "", ...(labels ? { labels } : {}) });
  if (!r.ok) return err("github " + r.status + ": " + JSON.stringify(r.data).slice(0, 200), 502);
  return json({ ok: true, number: r.data.number, url: r.data.html_url });
}

async function handleDriveDelete(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  const _tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token" }).toString(),
  });
  if (!_tr.ok) { const te = await _tr.text(); return err("LD token refresh failed: " + te.slice(0,200), 502); }
  const { access_token: ldAccess } = await _tr.json();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return err("id required", 400);
  const r = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(id),
    { method: "DELETE", headers: { "Authorization": "Bearer " + ldAccess } });
  if (r.status === 204) return json({ ok: true, deleted: id });
  const text = await r.text();
  return err("drive " + r.status + ": " + text.slice(0, 300), 502);
}

// ---------- Vercel ----------
async function vercelApi(env, method, path, body) {
  if (!env.VERCEL_TOKEN) throw new Error("VERCEL_TOKEN missing — paste one from vercel.com/account/tokens");
  const r = await fetch("https://api.vercel.com" + path, {
    method,
    headers: { "Authorization": "Bearer " + env.VERCEL_TOKEN, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 400) }; }
  return { ok: r.ok, status: r.status, data };
}

async function handleVercelProjects(request, env) {
  try {
    const r = await vercelApi(env, "GET", "/v9/projects?limit=50");
    if (!r.ok) return err("vercel " + r.status + ": " + JSON.stringify(r.data).slice(0, 200), 502);
    return json({ ok: true, projects: (r.data.projects || []).map(p => ({ id: p.id, name: p.name, framework: p.framework, updated: p.updatedAt })) });
  } catch (e) { return err(e.message, 400); }
}

async function handleVercelDeployments(request, env) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("project");
  const q = projectId ? ("?projectId=" + encodeURIComponent(projectId) + "&limit=10") : "?limit=10";
  try {
    const r = await vercelApi(env, "GET", "/v6/deployments" + q);
    if (!r.ok) return err("vercel " + r.status + ": " + JSON.stringify(r.data).slice(0, 200), 502);
    return json({ ok: true, deployments: (r.data.deployments || []).map(d => ({ id: d.uid, url: d.url, state: d.state, created: d.created, project: d.name })) });
  } catch (e) { return err(e.message, 400); }
}

async function handleVercelRedeploy(request, env) {
  const body = await request.json().catch(() => ({}));
  const { deploymentId, projectId, name } = body;
  if (!deploymentId) return err("deploymentId required (from /vercel/deployments)", 400);
  try {
    const r = await vercelApi(env, "POST", "/v13/deployments", { name, deploymentId, target: "production" });
    if (!r.ok) return err("vercel " + r.status + ": " + JSON.stringify(r.data).slice(0, 200), 502);
    return json({ ok: true, id: r.data.id, url: r.data.url, status: r.data.readyState });
  } catch (e) { return err(e.message, 400); }
}

// ---------- Google Drive ----------
async function refreshGoogleToken(env) {
  if (!env.GOOGLE_REFRESH_TOKEN || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth secrets missing (need GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)");
  }
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }).toString(),
  });
  if (!r.ok) { const t = await r.text(); throw new Error("google refresh " + r.status + ": " + t.slice(0, 200)); }
  const j = await r.json();
  if (!j.access_token) throw new Error("google refresh: no access_token in response");
  return j.access_token;
}

async function driveFetch(env, tokenBox, url, init = {}, retried = false) {
  const token = tokenBox.token || env.GOOGLE_ACCESS_TOKEN;
  const headers = { ...(init.headers || {}), "Authorization": "Bearer " + token };
  const r = await fetch(url, { ...init, headers });
  if (r.status === 401 && !retried) {
    tokenBox.token = await refreshGoogleToken(env);
    return driveFetch(env, tokenBox, url, init, true);
  }
  return r;
}

async function handleDriveUpload(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  const _tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token" }).toString(),
  });
  if (!_tr.ok) { const te = await _tr.text(); return err("LD token refresh failed: " + te.slice(0,200), 502); }
  const { access_token: ldAccess } = await _tr.json();
  const url = new URL(request.url);
  const filename = url.searchParams.get("filename") || "upload.bin";
  const parent = url.searchParams.get("parent") || null;
  const mime = url.searchParams.get("mime") || request.headers.get("x-file-type") || "application/octet-stream";
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return err("empty body", 400);
  const boundary = "----asgard-" + Math.random().toString(36).slice(2);
  const metadata = parent ? { name: filename, parents: [parent] } : { name: filename };
  const enc = new TextEncoder();
  const head = enc.encode(
    "--" + boundary + "\r\n" +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) + "\r\n" +
    "--" + boundary + "\r\n" +
    "Content-Type: " + mime + "\r\n\r\n"
  );
  const tail = enc.encode("\r\n--" + boundary + "--\r\n");
  const body = new Uint8Array(head.byteLength + buf.byteLength + tail.byteLength);
  body.set(head, 0);
  body.set(new Uint8Array(buf), head.byteLength);
  body.set(tail, head.byteLength + buf.byteLength);
  const r = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,parents,size",
    { method: "POST", headers: { "Authorization": "Bearer " + ldAccess, "Content-Type": "multipart/related; boundary=" + boundary }, body }
  );
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 400) }; }
  if (!r.ok) return err("drive " + r.status + ": " + JSON.stringify(data).slice(0, 300), 502);
  return json({ ok: true, id: data.id, name: data.name, size: data.size, url: data.webViewLink, parents: data.parents });
}

async function handleDriveLdMkdir(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  const body = await request.json().catch(() => ({}));
  const { name, parent } = body;
  if (!name) return err("name required", 400);
  const tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }).toString(),
  });
  if (!tr.ok) { const t = await tr.text(); return err("ld refresh " + tr.status + ": " + t.slice(0,200), 502); }
  const tj = await tr.json();
  const access = tj.access_token;
  if (!access) return err("ld refresh: no access_token", 502);
  const metadata = { name, mimeType: "application/vnd.google-apps.folder", ...(parent ? { parents: [parent] } : {}) };
  const r = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,parents,webViewLink", {
    method: "POST",
    headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0,400) }; }
  if (!r.ok) return err("drive " + r.status + ": " + JSON.stringify(data).slice(0,300), 502);
  return json({ ok: true, id: data.id, name: data.name, parents: data.parents, url: data.webViewLink });
}


async function handleDriveLdShare(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  const body = await request.json().catch(() => ({}));
  const { file_id, email, role = "reader", sendNotificationEmail = false } = body;
  if (!file_id || !email) return err("file_id and email required", 400);
  const access = await _agentLdAccessToken(env);
  const r = await fetch(
    "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(file_id) + "/permissions?supportsAllDrives=true&sendNotificationEmail=" + (sendNotificationEmail ? "true" : "false"),
    { method: "POST",
      headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
      body: JSON.stringify({ role, type: "user", emailAddress: email }) }
  );
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 400) }; }
  if (!r.ok) return err("drive permissions " + r.status + ": " + JSON.stringify(data).slice(0, 300), 502);
  return json({ ok: true, file_id, email, role, permission_id: data.id, type: data.type });
}

async function handleDriveLdListRoots(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  const access = await _agentLdAccessToken(env);
  const q = "'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'";
  const r = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(q) + "&fields=files(id,name,modifiedTime,owners(emailAddress))&pageSize=200",
    { headers: { "Authorization": "Bearer " + access } }
  );
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 400) }; }
  if (!r.ok) return err("drive list-roots " + r.status + ": " + JSON.stringify(data).slice(0, 300), 502);
  return json({ ok: true, count: (data.files||[]).length, folders: data.files || [] });
}

async function handleDriveLdSearch(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  const url = new URL(request.url);
  let q = url.searchParams.get("q") || "trashed = false";
  // PATCH 2026-05-13: bare keywords like q=Asgard fail Drive's API; wrap them.
  if (q && !/\s(=|!=|<|>|<=|>=|contains|in)\s|\sand\s|\sor\s|^(trashed|starred|mimeType|name|fullText|parents|owners|sharedWithMe)\s*[=:]/i.test(q)) {
    const _safe = q.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    q = `name contains '${_safe}' and trashed = false`;
  }
  const tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }).toString(),
  });
  if (!tr.ok) { const t = await tr.text(); return err("ld refresh " + tr.status + ": " + t.slice(0,200), 502); }
  const tj = await tr.json();
  const access = tj.access_token;
  const fields = "files(id,name,mimeType,parents,webViewLink,size)";
  const pageSize = Math.min(1000, parseInt(url.searchParams.get("pageSize") || "50"));
  const orderBy = url.searchParams.get("orderBy") || "";
  const orderParam = orderBy ? "&orderBy=" + encodeURIComponent(orderBy) : "";
  const r = await fetch("https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(q) + "&fields=" + encodeURIComponent(fields) + "&pageSize=" + pageSize + orderParam, {
    headers: { "Authorization": "Bearer " + access },
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0,400) }; }
  if (!r.ok) return err("drive " + r.status + ": " + JSON.stringify(data).slice(0,300), 502);
  return json({ ok: true, files: data.files || [] });
}

async function handleDriveLdCopy(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  if (!env.GOOGLE_REFRESH_TOKEN) return err("GOOGLE_REFRESH_TOKEN missing", 400);
  const url = new URL(request.url);
  const srcId = url.searchParams.get("src_id");
  const parent = url.searchParams.get("parent");
  const filename = url.searchParams.get("filename");
  if (!srcId || !parent) return err("src_id and parent required", 400);
  // Step 1a: fetch metadata first to know if native Google format
  const tokenBox = { token: null };
  const metaResp = await driveFetch(env, tokenBox,
    "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(srcId) + "?fields=name,mimeType",
    { method: "GET" }
  );
  if (!metaResp.ok) { const t = await metaResp.text(); return err("meta " + metaResp.status + ": " + t.slice(0,200), 502); }
  const metaJson = await metaResp.json();
  const srcMime = metaJson.mimeType || "application/octet-stream";
  const googleNativeExports = {
    "application/vnd.google-apps.document": { mime: "text/markdown", ext: ".md" },
    "application/vnd.google-apps.spreadsheet": { mime: "text/csv", ext: ".csv" },
    "application/vnd.google-apps.presentation": { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", ext: ".pptx" },
    "application/vnd.google-apps.drawing": { mime: "image/png", ext: ".png" },
  };
  let dlResp, name, mime;
  if (googleNativeExports[srcMime]) {
    const exp = googleNativeExports[srcMime];
    dlResp = await driveFetch(env, tokenBox,
      "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(srcId) + "/export?mimeType=" + encodeURIComponent(exp.mime),
      { method: "GET" }
    );
    name = (filename || metaJson.name) + exp.ext;
    mime = exp.mime;
  } else {
    dlResp = await driveFetch(env, tokenBox,
      "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(srcId) + "?alt=media",
      { method: "GET" }
    );
    name = filename || metaJson.name;
    mime = srcMime;
  }
  if (!dlResp.ok) { const t = await dlResp.text(); return err("download " + dlResp.status + ": " + t.slice(0,200), 502); }
  const buf = await dlResp.arrayBuffer();
  // Step 2: mint LD access token
  const tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }).toString(),
  });
  if (!tr.ok) { const t = await tr.text(); return err("ld refresh " + tr.status + ": " + t.slice(0,200), 502); }
  const tj = await tr.json();
  const ldAccess = tj.access_token;
  if (!ldAccess) return err("ld refresh: no access_token", 502);
  // Step 3: upload to LD Drive as multipart
  const boundary = "----asgard-" + Math.random().toString(36).slice(2);
  const metadata = { name, parents: [parent] };
  const enc = new TextEncoder();
  const head = enc.encode(
    "--" + boundary + "\r\n" +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) + "\r\n" +
    "--" + boundary + "\r\n" +
    "Content-Type: " + mime + "\r\n\r\n"
  );
  const tail = enc.encode("\r\n--" + boundary + "--\r\n");
  const body = new Uint8Array(head.byteLength + buf.byteLength + tail.byteLength);
  body.set(head, 0);
  body.set(new Uint8Array(buf), head.byteLength);
  body.set(tail, head.byteLength + buf.byteLength);
  const upResp = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,parents,size", {
    method: "POST",
    headers: { "Authorization": "Bearer " + ldAccess, "Content-Type": "multipart/related; boundary=" + boundary },
    body,
  });
  const text = await upResp.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0,400) }; }
  if (!upResp.ok) return err("upload " + upResp.status + ": " + JSON.stringify(data).slice(0,300), 502);
  return json({ ok: true, src_id: srcId, new_id: data.id, name: data.name, size: data.size, url: data.webViewLink, parents: data.parents });
}

async function handleDriveSearch(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  const _tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token" }).toString(),
  });
  if (!_tr.ok) { const te = await _tr.text(); return err("LD token refresh failed: " + te.slice(0,200), 502); }
  const { access_token: ldAccess } = await _tr.json();
  const url = new URL(request.url);
  let q = url.searchParams.get("q") || "trashed = false";
  // PATCH 2026-05-13: bare keywords like q=Asgard fail Drive's API; wrap them.
  if (q && !/\s(=|!=|<|>|<=|>=|contains|in)\s|\sand\s|\sor\s|^(trashed|starred|mimeType|name|fullText|parents|owners|sharedWithMe)\s*[=:]/i.test(q)) {
    const _safe = q.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    q = `name contains '${_safe}' and trashed = false`;
  }
  const pageSize = Math.min(1000, parseInt(url.searchParams.get("pageSize") || "20"));
  const fields = "files(id,name,mimeType,modifiedTime,webViewLink,parents,size),nextPageToken";
  const apiUrl = "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(q) +
    "&pageSize=" + pageSize + "&fields=" + encodeURIComponent(fields) + "&supportsAllDrives=true";
  const r = await fetch(apiUrl, { headers: { "Authorization": "Bearer " + ldAccess } });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 400) }; }
  if (!r.ok) return err("drive " + r.status + ": " + JSON.stringify(data).slice(0, 300), 502);
  return json(data);
}

// ---------- Google OAuth rotation ----------
function googleConsentUrl(env, request, account) {
  const url = new URL(request.url);
  const callback = url.origin + "/google/oauth-callback";
  const isLD = account === "luckdragon";
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: callback,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: isLD ? "select_account consent" : "consent",
    include_granted_scopes: "true",
    ...(account ? { state: account } : {}),
    ...(isLD ? { login_hint: "hello@luckdragon.io" } : {}),
  });
  return "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}

async function handleOauthStart(request, env) {
  if (!env.GOOGLE_CLIENT_ID) return new Response("GOOGLE_CLIENT_ID missing", { status: 500, headers: { "Content-Type": "text/plain" } });
  const url = new URL(request.url);
  const account = url.searchParams.get("account") || "";
  const target = googleConsentUrl(env, request, account);
  return new Response("Redirecting to Google (" + (account || "default") + ")…\n\n" + target, { status: 302, headers: { "Location": target, "Content-Type": "text/plain" } });
}

async function handleOauthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");
  if (errorParam) return new Response("OAuth error: " + errorParam, { status: 400, headers: { "Content-Type": "text/plain" } });
  if (!code) return new Response("No code in callback", { status: 400, headers: { "Content-Type": "text/plain" } });
  const callback = url.origin + "/google/oauth-callback";
  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: callback,
      grant_type: "authorization_code",
    }).toString(),
  });
  const tokenJson = await tokenResp.json().catch(() => ({}));
  if (!tokenResp.ok) {
    return new Response("Token exchange failed (" + tokenResp.status + "):\n" + JSON.stringify(tokenJson, null, 2), { status: 502, headers: { "Content-Type": "text/plain" } });
  }
  const refresh = tokenJson.refresh_token;
  const access = tokenJson.access_token;
  const scope = tokenJson.scope || "";
  if (!refresh) {
    return new Response("No refresh_token returned. Scope: " + scope + "\nResponse: " + JSON.stringify(tokenJson, null, 2), { status: 500, headers: { "Content-Type": "text/plain" } });
  }
  if (!env.CF_ACCOUNT_ID || !env.CF_API_TOKEN) {
    return new Response("Got tokens but CF_API_TOKEN/CF_ACCOUNT_ID missing — can't persist.\nRefresh token: " + refresh, { status: 500, headers: { "Content-Type": "text/plain" } });
  }
  async function putSecret(name, text) {
    const r = await fetch("https://api.cloudflare.com/client/v4/accounts/" + env.CF_ACCOUNT_ID + "/workers/scripts/asgard-ai/secrets", {
      method: "PUT",
      headers: { "Authorization": "Bearer " + env.CF_API_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ name, text, type: "secret_text" }),
    });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, result: j };
  }
  const stateAcct = url.searchParams.get("state") || "";
  const isLD = stateAcct === "luckdragon";
  const refreshKey = isLD ? "LD_GOOGLE_REFRESH_TOKEN" : "GOOGLE_REFRESH_TOKEN";
  const accessKey = isLD ? "LD_GOOGLE_ACCESS_TOKEN" : "GOOGLE_ACCESS_TOKEN";
  const r1 = await putSecret(refreshKey, refresh);
  const r2 = await putSecret(accessKey, access);
  const msg =
    "Google OAuth complete for account: " + (stateAcct || "default") + "\n\n" +
    "Scope granted: " + scope + "\n" +
    refreshKey + " updated: " + r1.ok + "\n" +
    accessKey + " updated: " + r2.ok + "\n\n" +
    "You can close this tab.";
  return new Response(msg, { status: 200, headers: { "Content-Type": "text/plain" } });
}

// ---------- Google Calendar API (uses LD OAuth credentials) ----------
async function handleGoogleCalendarEvents(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return err("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing", 400);

  // Refresh the LD Google access token
  const _tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token" }).toString(),
  });
  if (!_tr.ok) { const te = await _tr.text(); return err("LD token refresh failed: " + te.slice(0,200), 502); }
  const { access_token } = await _tr.json();
  if (!access_token) return err("token refresh returned no access_token", 502);

  const url = new URL(request.url);
  const calendarId = url.searchParams.get("calendarId") || "primary";
  const days = parseInt(url.searchParams.get("days") || "7", 10);
  const AEST_OFFSET = 10 * 60 * 60 * 1000; // AEST = UTC+10
  const now = new Date();
  const timeMin = new Date(now.getTime()).toISOString();
  const timeMax = new Date(now.getTime() + days * 86400 * 1000).toISOString();

  const calUrl = "https://www.googleapis.com/calendar/v3/calendars/" +
    encodeURIComponent(calendarId) +
    "/events?timeMin=" + encodeURIComponent(timeMin) +
    "&timeMax=" + encodeURIComponent(timeMax) +
    "&singleEvents=true&orderBy=startTime&maxResults=50&fields=items(id,summary,start,end,location,description,status)";

  const calResp = await fetch(calUrl, {
    headers: { "Authorization": "Bearer " + access_token },
  });
  if (!calResp.ok) {
    const ce = await calResp.text();
    return err("Calendar API error " + calResp.status + ": " + ce.slice(0,300), calResp.status);
  }
  const { items = [] } = await calResp.json();

  const events = items
    .filter(e => e.status !== "cancelled")
    .map(e => {
      const startRaw = e.start.dateTime || e.start.date;
      const endRaw = e.end ? (e.end.dateTime || e.end.date) : null;
      const allDay = !!e.start.date && !e.start.dateTime;
      const startTs = new Date(startRaw).getTime();
      const aestDate = new Date(startTs + AEST_OFFSET).toISOString().substring(0,10);
      const aestTime = allDay ? null : new Date(startTs + AEST_OFFSET).toISOString().substring(11,16);
      const aestTimeEnd = (endRaw && !allDay)
        ? new Date(new Date(endRaw).getTime() + AEST_OFFSET).toISOString().substring(11,16)
        : null;
      return {
        id: e.id,
        title: e.summary || "Untitled",
        allDay,
        date: aestDate,
        time: aestTime,
        timeEnd: aestTimeEnd,
        location: e.location || null,
        description: e.description ? e.description.substring(0,200) : null,
      };
    });

  return json({ ok: true, count: events.length, calendarId, events });
}


// ---------- Confirmation gate helpers ----------
// A "proposal" flow: dashboard asks /chat/agent?dry_run=1 → gets plan; user confirms → re-call with execute=true
async function handleAgentPropose(request, env) {
  const body = await request.json().catch(() => ({}));
  const message = (body.message || "").toString();
  if (!message) return err("message required", 400);
  const system = "You are a planning assistant. When asked to do something, respond with a JSON object describing the plan: {summary: string, steps: [{action: string, risky: boolean}], risky: boolean}. Do NOT execute anything. Only describe.";
  const result = await generate(env, {
    provider: "anthropic", model: MODELS.sonnet.id,
    messages: [{ role: "user", content: message }],
    system, max_tokens: 2048,
  });
  if (!result.ok) return err(result.error, 502);
  let plan;
  try {
    const m = result.reply.match(/\{[\s\S]*\}/);
    plan = m ? JSON.parse(m[0]) : { summary: result.reply, steps: [], risky: false };
  } catch { plan = { summary: result.reply, steps: [], risky: false }; }
  return json({ ok: true, plan, raw_reply: result.reply });
}


async function handleDriveLdMove(request, env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN && !env.GOOGLE_REFRESH_TOKEN) return err("Neither LD_GOOGLE_REFRESH_TOKEN nor GOOGLE_REFRESH_TOKEN set — run /connect-drive", 400);
  const body = await request.json().catch(() => ({}));
  const { fileId, targetFolderId, sourceFolderId } = body;
  if (!fileId || !targetFolderId) return err("fileId and targetFolderId required", 400);
  const tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }).toString(),
  });
  if (!tr.ok) { const t = await tr.text(); return err("ld refresh " + tr.status + ": " + t.slice(0,200), 502); }
  const tj = await tr.json();
  const access = tj.access_token;
  if (!access) return err("ld refresh: no access_token", 502);

  // Get file metadata (name + current parents)
  const metaR = await fetch(
    "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "?fields=id,name,parents,mimeType",
    { headers: { "Authorization": "Bearer " + access } }
  );
  const meta = metaR.ok ? await metaR.json() : {};
  const currentParents = (meta.parents && meta.parents.length > 0) ? meta.parents : null;
  const removeParents = sourceFolderId || (currentParents ? currentParents.join(",") : null);

  // Try PATCH move first
  let url = "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) +
    "?addParents=" + encodeURIComponent(targetFolderId) + "&fields=id,name,parents&supportsAllDrives=true";
  if (removeParents) url += "&removeParents=" + encodeURIComponent(removeParents);
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
    body: "{}",
  });
  if (r.ok) {
    const data = await r.json();
    return json({ ok: true, method: "move", id: data.id, name: data.name, parents: data.parents });
  }
  const errText = await r.text();
  // If cannotAddParent (orphaned file), fall back to copy + trash
  if (r.status === 403 && errText.includes("cannotAddParent")) {
    // Copy to target folder
    const fname = meta.name || "unnamed";
    const copyR = await fetch(
      "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "/copy?fields=id,name,parents",
      {
        method: "POST",
        headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
        body: JSON.stringify({ name: fname, parents: [targetFolderId] }),
      }
    );
    if (!copyR.ok) { const ct = await copyR.text(); return err("copy " + copyR.status + ": " + ct.slice(0,300), 502); }
    const copyData = await copyR.json();
    // Trash original
    await fetch(
      "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "?supportsAllDrives=true",
      { method: "DELETE", headers: { "Authorization": "Bearer " + access } }
    );
    return json({ ok: true, method: "copy+trash", id: copyData.id, name: copyData.name, parents: copyData.parents, original_id: fileId });
  }
  return err("drive " + r.status + ": " + errText.slice(0,300), 502);
}



// =====================================================================
// /sync/state — simple per-uid blob storage for cross-device dashboard sync.
// Backed by D1; auto-creates table on first call.
// =====================================================================
async function _syncEnsureTable(env) {
  if (!env.DB) throw new Error("DB not bound");
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS asgard_sync_state (uid TEXT PRIMARY KEY, blob TEXT, ts INTEGER)").run();
}

async function handleSyncState(request, env) {
  if (!env.DB) return json({ ok: false, error: "D1 DB not bound on asgard-ai" }, 500);
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid") || request.headers.get("X-User-Id") || "paddy";
  try {
    await _syncEnsureTable(env);
    if (request.method === "GET") {
      const row = await env.DB.prepare("SELECT blob, ts FROM asgard_sync_state WHERE uid = ?").bind(uid).first();
      if (!row) return json({ ok: true, uid, found: false });
      let parsed = null;
      try { parsed = JSON.parse(row.blob); } catch (e) {}
      return json({ ok: true, uid, found: true, ts: row.ts, blob: parsed });
    }
    // POST — store blob
    const body = await request.json().catch(() => ({}));
    const blobStr = JSON.stringify(body.blob !== undefined ? body.blob : body);
    if (blobStr.length > 4000000) return json({ ok: false, error: "blob too large (>4MB)" }, 413);
    const ts = Date.now();
    await env.DB.prepare("INSERT INTO asgard_sync_state (uid, blob, ts) VALUES (?, ?, ?) ON CONFLICT(uid) DO UPDATE SET blob = excluded.blob, ts = excluded.ts").bind(uid, blobStr, ts).run();
    return json({ ok: true, uid, ts, size: blobStr.length });
  } catch (e) {
    return json({ ok: false, error: "sync_state failed: " + e.message }, 500);
  }
}



async function handleAdminSpend(request, env) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);
  const sinceDate = new Date(Date.now() - (days * 86400000)).toISOString().slice(0,10);
  try {
    const [byProvider, byModel, byDay, totals] = await Promise.all([
      env.DB.prepare(
        "SELECT provider, COUNT(*) as calls, SUM(prompt_tokens) as prompt_tokens, SUM(completion_tokens) as completion_tokens, ROUND(SUM(cost_usd),6) as total_usd FROM spend_log WHERE ts >= ? GROUP BY provider ORDER BY total_usd DESC"
      ).bind(sinceDate).all(),
      env.DB.prepare(
        "SELECT provider, model, COUNT(*) as calls, SUM(prompt_tokens) as prompt_tokens, SUM(completion_tokens) as completion_tokens, ROUND(SUM(cost_usd),6) as total_usd FROM spend_log WHERE ts >= ? GROUP BY provider, model ORDER BY total_usd DESC LIMIT 30"
      ).bind(sinceDate).all(),
      env.DB.prepare(
        "SELECT substr(ts,1,10) as day, ROUND(SUM(cost_usd),6) as total_usd, COUNT(*) as calls FROM spend_log WHERE ts >= ? GROUP BY day ORDER BY day DESC LIMIT " + days
      ).bind(sinceDate).all(),
      env.DB.prepare(
        "SELECT ROUND(SUM(cost_usd),6) as all_time_usd, COUNT(*) as all_time_calls FROM spend_log"
      ).all(),
    ]);
    const total = (byProvider.results||[]).reduce((s,r) => s+(r.total_usd||0), 0);
    const allTime = (totals.results||[])[0] || {};
    return json({
      ok: true, days, since: sinceDate,
      period_usd: Math.round(total * 1000000) / 1000000,
      all_time_usd: allTime.all_time_usd || 0,
      all_time_calls: allTime.all_time_calls || 0,
      by_provider: byProvider.results || [],
      by_model: byModel.results || [],
      by_day: byDay.results || [],
    });
  } catch (e) {
    return json({ ok: false, error: e.message }, 500);
  }
}
async function handleAdminErrors(request, env) {
  if (!env.DB) return json({ ok: false, error: 'D1 not bound' }, 500);
  try {
    await _aiEnsureErrorsTable(env);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const since = parseInt(url.searchParams.get('since') || '0', 10);
    const row = await env.DB.prepare(
      "SELECT id, ts, worker, endpoint, message, detail FROM errors WHERE ts > ? ORDER BY ts DESC LIMIT ?"
    ).bind(since, Math.min(limit, 200)).all();
    return json({ ok: true, count: (row.results || []).length, errors: row.results || [] });
  } catch (e) {
    return json({ ok: false, error: e.message }, 500);
  }
}

// =====================================================================
// /chat/agentic — multi-provider agent loop (OpenAI tool_calls; Gemini functionCalls TBD)
// Tools: http_request, get_worker_code, deploy_worker, get_secret
// =====================================================================
const AGENTIC_ACCT = "a6f47c17811ee2f8b6caeb8f38768c20";

const AGENTIC_TOOLS_OPENAI = [
  // Network
  { type: "function", function: { name: "http_request", description: "HTTP request to any URL. Returns {status, ok, body}. Auto-adds a User-Agent.",
    parameters: { type: "object", properties: {
      url: { type: "string" }, method: { type: "string", enum: ["GET","POST","PUT","PATCH","DELETE"], default: "GET" },
      headers: { type: "object", additionalProperties: { type: "string" } },
      body: { type: "string", description: "Request body (JSON.stringify objects first)" }
    }, required: ["url"] } } },
  // Cloudflare Workers
  { type: "function", function: { name: "get_worker_code", description: "Read the JS source of a Cloudflare Worker by script name.",
    parameters: { type: "object", properties: { worker_name: { type: "string" }, main_module: { type: "string" } }, required: ["worker_name"] } } },
  { type: "function", function: { name: "deploy_worker", description: "Deploy a new version of a CF Worker. Provide complete updated JS source.",
    parameters: { type: "object", properties: { worker_name: { type: "string" }, code: { type: "string" }, main_module: { type: "string", default: "worker.js" } }, required: ["worker_name", "code"] } } },
  { type: "function", function: { name: "read_worker_section", description: "Read a section of a worker's source by finding a substring. Returns ~80 lines of context around the first match. Use this instead of get_worker_code when the worker is large (>100KB). Multiple sections can be read by calling again with a different needle.",
    parameters: { type: "object", properties: { worker_name: { type: "string" }, needle: { type: "string", description: "Exact substring to locate. The 80 lines around it will be returned." }, context_lines: { type: "number", default: 40, description: "Lines of context before AND after the match." } }, required: ["worker_name", "needle"] } } },
  { type: "function", function: { name: "replace_in_worker", description: "Surgical edit: in worker_name's source, replace ONE occurrence of `find` with `replace`. Auto commits to GitHub asgard-source/workers/<name>.js AND redeploys to Cloudflare with bindings preserved. Use this when the user wants a small change to a worker (e.g. remove a sidebar item, fix a typo, change a default). The `find` string must be unique in the source — if it appears 0 or 2+ times, the call fails safely.",
    parameters: { type: "object", properties: { worker_name: { type: "string" }, find: { type: "string", description: "Exact substring to find (must appear EXACTLY ONCE in the worker source)" }, replace: { type: "string", description: "Replacement text" }, commit_message: { type: "string", description: "Optional GitHub commit message" } }, required: ["worker_name", "find", "replace"] } } },
  { type: "function", function: { name: "multi_replace_in_worker", description: "Apply multiple find/replace edits to one worker in a single deploy. Each edit's `find` must appear exactly once after the previous edits are applied. Commits to GH + deploys to CF once at the end.",
    parameters: { type: "object", properties: { worker_name: { type: "string" }, edits: { type: "array", items: { type: "object", properties: { find: { type: "string" }, replace: { type: "string" } }, required: ["find", "replace"] } }, commit_message: { type: "string" } }, required: ["worker_name", "edits"] } } },
  // Secrets
  { type: "function", function: { name: "get_secret", description: "Read a secret from the Asgard vault.",
    parameters: { type: "object", properties: { key: { type: "string" } }, required: ["key"] } } },
  // Google Drive (paddy@luckdragon.io)
  { type: "function", function: { name: "drive_upload", description: "Upload a file to paddy@luckdragon.io's Google Drive. Default parent is the ASGARD folder.",
    parameters: { type: "object", properties: {
      filename: { type: "string" },
      content: { type: "string", description: "File content as plain text" },
      mime: { type: "string", default: "text/plain" },
      parent: { type: "string", description: "Drive folder ID. Defaults to ASGARD folder." }
    }, required: ["filename", "content"] } } },
  { type: "function", function: { name: "drive_search", description: "Search files in paddy@luckdragon.io's Google Drive by name fragment. Returns up to 20 matches.",
    parameters: { type: "object", properties: { query: { type: "string", description: "Substring to search for in file names" } }, required: ["query"] } } },
  { type: "function", function: { name: "drive_read", description: "Read text content of a Drive file by ID.",
    parameters: { type: "object", properties: { file_id: { type: "string" } }, required: ["file_id"] } } },
  // GitHub
  { type: "function", function: { name: "github_get_file", description: "Read a file from a GitHub repo. Returns {content, sha, size}.",
    parameters: { type: "object", properties: {
      owner: { type: "string", default: "LuckDragonAsgard" }, repo: { type: "string" }, path: { type: "string" }, branch: { type: "string", default: "main" }
    }, required: ["repo", "path"] } } },
  { type: "function", function: { name: "github_write_file", description: "Create or update a file in a GitHub repo. Auto-fetches current SHA for updates. Auto-commits.",
    parameters: { type: "object", properties: {
      owner: { type: "string", default: "LuckDragonAsgard" }, repo: { type: "string" }, path: { type: "string" }, content: { type: "string", description: "File content as plain text" }, message: { type: "string", description: "Commit message" }, branch: { type: "string", default: "main" }
    }, required: ["repo", "path"] } } },
  // Email via Resend
  { type: "function", function: { name: "send_email", description: "Send an email via Resend. From defaults to noreply@luckdragon.io.",
    parameters: { type: "object", properties: {
      to: { type: "string" }, subject: { type: "string" }, html: { type: "string" }, text: { type: "string" }, from: { type: "string" }
    }, required: ["to", "subject"] } } },
  // Vercel
  { type: "function", function: { name: "vercel_list_projects", description: "List Vercel projects in the team.",
    parameters: { type: "object", properties: { limit: { type: "number", default: 20 } } } } },
  { type: "function", function: { name: "vercel_list_deployments", description: "List recent Vercel deployments. Optionally filter by projectId.",
    parameters: { type: "object", properties: { projectId: { type: "string" }, limit: { type: "number", default: 10 }, target: { type: "string", enum: ["production", "preview"] } } } } },
  { type: "function", function: { name: "vercel_get_deployment", description: "Get full details of a Vercel deployment by id.",
    parameters: { type: "object", properties: { deployment_id: { type: "string" } }, required: ["deployment_id"] } } },
  { type: "function", function: { name: "vercel_redeploy", description: "Trigger a redeploy of an existing Vercel deployment.",
    parameters: { type: "object", properties: { deployment_id: { type: "string" }, name: { type: "string" } }, required: ["deployment_id"] } } },
  // Stripe
  { type: "function", function: { name: "stripe_list_products", description: "List Stripe products.",
    parameters: { type: "object", properties: { limit: { type: "number", default: 20 }, active: { type: "boolean" } } } } },
  { type: "function", function: { name: "stripe_list_payment_links", description: "List Stripe Payment Links.",
    parameters: { type: "object", properties: { limit: { type: "number", default: 20 } } } } },
  { type: "function", function: { name: "stripe_create_payment_link", description: "Create a Stripe Payment Link for an existing price.",
    parameters: { type: "object", properties: {
      price_id: { type: "string" }, quantity: { type: "number", default: 1 }, adjustable_quantity: { type: "boolean", default: false }
    }, required: ["price_id"] } } },
  // Supabase
  { type: "function", function: { name: "supabase_select", description: "SELECT from a Supabase table via PostgREST.",
    parameters: { type: "object", properties: {
      table: { type: "string" }, select: { type: "string", default: "*" }, query: { type: "string", description: "PostgREST query string e.g. id=eq.123" }, limit: { type: "number", default: 50 }
    }, required: ["table"] } } },
  { type: "function", function: { name: "supabase_insert", description: "INSERT a row into a Supabase table.",
    parameters: { type: "object", properties: {
      table: { type: "string" }, row: { type: "object", additionalProperties: true }
    }, required: ["table", "row"] } } },
  // Web search (Tavily)
  { type: "function", function: { name: "web_search", description: "Search the live web for up-to-date information. Returns top results with snippets.",
    parameters: { type: "object", properties: {
      query: { type: "string" }, max_results: { type: "number", default: 5 }, include_answer: { type: "boolean", default: true }
    }, required: ["query"] } } },
  // Discord
  { type: "function", function: { name: "drive_share", description: "Share a Drive file with another user via email. role: 'reader' (view only) | 'writer' (edit) | 'commenter'.",
    parameters: { type: "object", properties: { file_id: { type: "string" }, email: { type: "string" }, role: { type: "string", enum: ["reader","writer","commenter"], default: "reader" }, sendNotificationEmail: { type: "boolean", default: false } }, required: ["file_id", "email"] } } },
  { type: "function", function: { name: "drive_list_roots", description: "List top-level folders in paddy@luckdragon.io's Drive.",
    parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "discord_send", description: "Post a message to Paddy's Discord server. Defaults to the configured channel.",
    parameters: { type: "object", properties: {
      content: { type: "string" }, channel_id: { type: "string", description: "Optional channel override" }
    }, required: ["content"] } } },
  // Browser Rendering (asgard-browser worker)
  { type: "function", function: { name: "browser_screenshot", description: "Take a PNG screenshot of any URL. Returns a data: URL embedding the image.",
    parameters: { type: "object", properties: { url: { type: "string" }, full_page: { type: "boolean", default: false } }, required: ["url"] } } },
  { type: "function", function: { name: "browser_content", description: "Fetch the rendered HTML of any URL after JavaScript execution.",
    parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } } },
  { type: "function", function: { name: "browser_markdown", description: "Fetch any URL and return its content as clean markdown.",
    parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } } },
  { type: "function", function: { name: "browser_json", description: "Use AI extraction to pull structured data from a webpage. Provide a natural-language prompt describing what to extract.",
    parameters: { type: "object", properties: { url: { type: "string" }, prompt: { type: "string" } }, required: ["url", "prompt"] } } },
  { type: "function", function: { name: "browser_links", description: "Get all hyperlinks from a URL.",
    parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } } },
  { type: "function", function: { name: "browser_scrape", description: "Scrape elements matching a CSS selector from a URL. Returns text/HTML/coords for each match.",
    parameters: { type: "object", properties: { url: { type: "string" }, selector: { type: "string" } }, required: ["url", "selector"] } } },
  { type: "function", function: { name: "browser_pdf", description: "Render any URL as PDF and return as data: URL.",
    parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } } },
  // Chrome bridge — drives the user's REAL browser via the Asgard Chrome extension.
  { type: "function", function: { name: "chrome_navigate", description: "Navigate the user's active Chrome tab to a URL. Requires the Asgard Chrome extension to be installed and running.",
    parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } } },
  { type: "function", function: { name: "chrome_screenshot", description: "Take a screenshot of the user's active Chrome tab. Requires the Asgard Chrome extension. Returns image_data_url.",
    parameters: { type: "object", properties: { full_page: { type: "boolean", default: false } } } } },
  { type: "function", function: { name: "chrome_extract", description: "Get text or HTML content of the user's active Chrome tab.",
    parameters: { type: "object", properties: { selector: { type: "string", description: "Optional CSS selector to scope extraction" }, format: { type: "string", enum: ["text", "html"], default: "text" } } } } },
  { type: "function", function: { name: "chrome_click", description: "Click an element by CSS selector in the user's active Chrome tab.",
    parameters: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] } } },
  { type: "function", function: { name: "chrome_type", description: "Type text into an input/textarea in the user's active Chrome tab.",
    parameters: { type: "object", properties: { selector: { type: "string" }, text: { type: "string" }, submit: { type: "boolean", default: false } }, required: ["selector", "text"] } } },
  // Desktop bridge — controls user's native desktop via the asgard-desktop Python helper.
  { type: "function", function: { name: "desktop_screenshot", description: "Take a screenshot of the user's full desktop (all monitors). Returns PNG data URL. Requires asgard-desktop helper running.",
    parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "desktop_click", description: "Click at absolute screen coordinates (x, y).",
    parameters: { type: "object", properties: { x: { type: "number" }, y: { type: "number" }, button: { type: "string", enum: ["left","right","middle"], default: "left" }, double: { type: "boolean", default: false } }, required: ["x", "y"] } } },
  { type: "function", function: { name: "desktop_type", description: "Type text into the currently focused input on the desktop.",
    parameters: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } } },
  { type: "function", function: { name: "desktop_key", description: "Press a key combination (e.g. 'cmd+c', 'ctrl+v', 'enter', 'tab').",
    parameters: { type: "object", properties: { keys: { type: "string", description: "Plus-separated combo, e.g. 'cmd+shift+t'" } }, required: ["keys"] } } },
  { type: "function", function: { name: "desktop_run", description: "Run a shell command or open an app by name. Use 'open <app>' on Mac or full path on Windows.",
    parameters: { type: "object", properties: { command: { type: "string" } }, required: ["command"] } } },
  { type: "function", function: { name: "power_automate_trigger", description: "Kick off a Microsoft Power Automate flow via its HTTP webhook URL. Returns the flow's response. Build the flow in Power Automate Cloud with a 'When an HTTP request is received' trigger first.",
    parameters: { type: "object", properties: {
      webhook_url: { type: "string", description: "Full Power Automate HTTP webhook URL (from the flow's trigger config)" },
      payload: { type: "object", description: "JSON payload to send to the flow", additionalProperties: true }
    }, required: ["webhook_url"] } } },
  { type: "function", function: { name: "save_memory", description: "Save a versioned memory fact. project is REQUIRED — choose a project slug (e.g. 'kbt','asgard-final-build','wps-curriculum'). Every save creates a new VERSION; old versions preserved in memory_v2 and queryable. Audit log fires automatically. shared=true = all users see it.",
    parameters: { type: "object", properties: {
      key: { type: "string", description: "Short project-prefixed label, e.g. 'kbt_prod_url' or 'asgard_deploy_warning'. NEVER use generic keys like 'state'/'current'/'latest' — they collide across projects." },
      value: { type: "string", description: "The fact to remember" },
      project: { type: "string", description: "REQUIRED. Project slug from project_hub. No default. No 'global' fallback." },
      shared: { type: "boolean", description: "true = visible to all users" }
    }, required: ["key", "value", "project"] } } },
  { type: "function", function: { name: "forget_memory", description: "Soft-delete a memory fact (flips is_current=0 in memory_v2, history preserved). project is REQUIRED — cross-project deletes are blocked.",
    parameters: { type: "object", properties: {
      key: { type: "string" },
      project: { type: "string", description: "REQUIRED. Project slug — no default, no cross-project delete." }
    }, required: ["key", "project"] } } },
  { type: "function", function: { name: "send_message", description: "Send a message to a team group (Paddy, Jacky, George). Auto-creates the group if it doesn't exist. Use names like 'all', 'paddy-jacky', 'kbt-team'.",
    parameters: { type: "object", properties: {
      group: { type: "string", description: "Group name or ID" },
      message: { type: "string", description: "Message to send" }
    }, required: ["group", "message"] } } },
  { type: "function", function: { name: "read_messages", description: "Read messages in a team group thread.",
    parameters: { type: "object", properties: {
      group: { type: "string", description: "Group name or ID" },
      limit: { type: "number", description: "Max messages to return (default 20)" }
    }, required: ["group"] } } }
,
  // ─── Doc Rating ─────────────────────────────────────────────────────────
  { type: "function", function: {
    name: "rate_doc",
    description: "Rate a Google Drive file (1-5 stars) and optionally add notes. Stores in D1. Use to track doc quality, relevance, or usefulness.",
    parameters: { type: "object", properties: {
      file_id:   { type: "string", description: "Google Drive file ID" },
      file_name: { type: "string", description: "Human-readable name of the file" },
      rating:    { type: "number", description: "Rating 1-5 stars (1=poor, 5=excellent)" },
      notes:     { type: "string", description: "Optional notes about the document" },
      category:  { type: "string", description: "Optional category e.g. handover, brief, spec, idea" }
    }, required: ["file_id","rating"] }
  }},
  { type: "function", function: {
    name: "get_doc_ratings",
    description: "Get ratings for Drive docs. Can filter by file_id or category. Returns recent ratings from D1.",
    parameters: { type: "object", properties: {
      file_id:  { type: "string", description: "Filter by specific file ID (optional)" },
      category: { type: "string", description: "Filter by category (optional)" },
      limit:    { type: "number", description: "Max results, default 10" }
    }, required: [] }
  }},
  // ─── Doc Editing (Google Docs API) ──────────────────────────────────────
  { type: "function", function: {
    name: "docs_replace_text",
    description: "Find and replace text inside a Google Doc using the Docs API batchUpdate. Works on Google Docs (not plain Drive files).",
    parameters: { type: "object", properties: {
      doc_id:       { type: "string", description: "Google Docs document ID (from the URL)" },
      find:         { type: "string", description: "Text to find" },
      replace_with: { type: "string", description: "Text to replace it with" },
      match_case:   { type: "boolean", description: "Case-sensitive match (default false)" }
    }, required: ["doc_id","find","replace_with"] }
  }},
  { type: "function", function: {
    name: "docs_append_text",
    description: "Append text to the end of a Google Doc. Good for adding notes, summaries, or log entries.",
    parameters: { type: "object", properties: {
      doc_id: { type: "string", description: "Google Docs document ID" },
      text:   { type: "string", description: "Text to append (use \\n for newlines)" }
    }, required: ["doc_id","text"] }
  }},
  { type: "function", function: {
    name: "drive_patch",
    description: "Replace the full content of a Drive file (for plain text or markdown files, NOT Google Docs). Reads the file, applies your changes, writes back.",
    parameters: { type: "object", properties: {
      file_id:     { type: "string", description: "Drive file ID" },
      new_content: { type: "string", description: "The complete new content of the file" },
      mime_type:   { type: "string", description: "MIME type, e.g. text/markdown or text/plain (default text/plain)" }
    }, required: ["file_id","new_content"] }
  }},
  // New: create new Google Drive files (native Docs/Sheets/Slides/folders + plain)
  { type: "function", function: {
    name: "merge_projects",
    description: "Merge two project_hub entries. Source row's notes + detail_md + concept_md get appended to target's detail_md, then source.status is set to 'merged_into_<target_id>' so history is preserved (NOT deleted). Use when Paddy says 'merge project X into Y' or 'these two are duplicates'. Always confirm with Paddy before calling on production projects.",
    parameters: { type: "object", properties: {
      source_id: { type: "integer", description: "project_hub.id to absorb (will be marked merged_into_<target_id>)" },
      target_id: { type: "integer", description: "project_hub.id that keeps the merged content" }
    }, required: ["source_id","target_id"] }
  }},
  { type: "function", function: {
    name: "recall",
    description: "Search Paddy's stored memory (memory_v2 + memory) for facts and decisions matching a query. Use this when Paddy asks 'what did we say about X', 'remind me about Y', or you need stored context. Returns up to 10 matching memories with their key, value, project, and recency.",
    parameters: { type: "object", properties: {
      query: { type: "string", description: "Search query — what to look for in stored memory" },
      project: { type: "string", description: "Optional project slug to scope the search" },
      limit: { type: "integer", description: "Max results to return (default 10, max 25)" }
    }, required: ["query"] }
  }},
  { type: "function", function: {
    name: "drive_create_file",
    description: "Create a new Google Drive file. Use type='doc' for Google Doc, 'sheet' for Sheet, 'slides' for Slides, 'folder' for folder, 'text' for plain text. Returns id and webViewLink. Optional initial_text inserts content (Docs only) after creation.",
    parameters: { type: "object", properties: {
      name: { type: "string", description: "File or folder name" },
      type: { type: "string", description: "doc | sheet | slides | folder | text", default: "doc" },
      parent: { type: "string", description: "Drive folder ID. Defaults to ASGARD folder." },
      initial_text: { type: "string", description: "Optional initial text to insert (Doc only)" }
    }, required: ["name"] }
  }},
  { type: "function", function: {
    name: "sheets_write_values",
    description: "Write a 2D array of values to a range in an existing Google Sheet. Range example: 'Sheet1!A1' (top-left corner; will expand to fit values). Each row is an array of cells.",
    parameters: { type: "object", properties: {
      sheet_id: { type: "string", description: "Spreadsheet ID" },
      range: { type: "string", description: "A1 notation, e.g. Sheet1!A1" },
      values: { type: "array", description: "2D array of cell values: [[row1cell1,row1cell2],[row2cell1,row2cell2]]", items: { type: "array", items: { type: "string" } } }
    }, required: ["sheet_id","range","values"] }
  }},
  { type: "function", function: {
    name: "slides_batch_update",
    description: "Apply a Slides API batchUpdate to an existing presentation. Pass the requests array directly. Useful for adding slides, replacing text, etc.",
    parameters: { type: "object", properties: {
      presentation_id: { type: "string", description: "Presentation ID" },
      requests: { type: "array", description: "Slides batchUpdate requests array per Slides API spec", items: { type: "object" } }
    }, required: ["presentation_id","requests"] }
  }}
];

function _buildProjectSystemPrefix(proj, events, health, commits) {
  if (!proj) return '';
  const lines = [];
  lines.push('## ACTIVE PROJECT CONTEXT — Paddy is chatting about: ' + proj.project_name);
  lines.push('Category: ' + (proj.category||'—') + ' · Status: ' + (proj.status||'—') + ' · Progress: ' + (proj.progress_pct||0) + '%');
  if (proj.live_url) lines.push('Live URL: ' + proj.live_url);
  if (proj.cloudflare_worker) lines.push('Cloudflare Worker: ' + proj.cloudflare_worker);
  if (proj.cf_zone) lines.push('Cloudflare Zone: ' + proj.cf_zone);
  if (proj.github_url) lines.push('GitHub: ' + proj.github_url);
  if (proj.tech_stack) lines.push('Tech stack: ' + proj.tech_stack);
  if (proj.description) lines.push('Description: ' + proj.description);
  if (proj.next_action) lines.push('Next action: ' + proj.next_action);
  if (proj.notes) lines.push('Notes: ' + String(proj.notes).slice(0,500));
  if (commits && commits.length) {
    lines.push('Recent commits:');
    commits.forEach(c => lines.push('- ' + c.sha + ' (' + (c.date||'').slice(0,10) + ') ' + c.message));
  }
  if (events && events.length) {
    lines.push('Recent events:');
    events.slice(0,5).forEach(e => lines.push('- ' + (e.ts||'').slice(0,16) + ' ' + e.event + ': ' + (e.summary||'').slice(0,140)));
  }
  if (health) lines.push('Live /health: ' + JSON.stringify(health).slice(0,300));
  if (proj.cloudflare_worker || proj.github_url) {
    lines.push('## How to edit this project:');
    if (proj.cloudflare_worker && proj.github_url) {
      lines.push('1. Use github_get_file (' + proj.github_url + ') to read current code.');
      lines.push('2. Use github_write_file to commit edits.');
      lines.push('3. Use deploy_worker(name: "' + proj.cloudflare_worker + '") to push to Cloudflare.');
      lines.push('4. Use http_request to verify the live URL.');
    } else if (proj.cloudflare_worker) {
      lines.push('1. Use get_worker_code(name: "' + proj.cloudflare_worker + '") to read.');
      lines.push('2. Use deploy_worker to redeploy.');
    } else if (proj.github_url) {
      lines.push('1. Use github_get_file (' + proj.github_url + ') to read.');
      lines.push('2. Use github_write_file to commit. CI auto-deploys.');
    }
  }
  return lines.join('\n');
}

function _agSanitizeForGemini(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  const clean = {};
  for (const k in schema) {
    if (k === 'additionalProperties') continue;
    if (k === 'properties' && schema.properties) {
      clean.properties = {};
      for (const pk in schema.properties) clean.properties[pk] = _agSanitizeForGemini(schema.properties[pk]);
    } else if (Array.isArray(schema[k])) {
      clean[k] = schema[k].slice();
    } else if (typeof schema[k] === 'object') {
      clean[k] = _agSanitizeForGemini(schema[k]);
    } else {
      clean[k] = schema[k];
    }
  }
  return clean;
}
const AGENTIC_TOOLS_GEMINI = [{ function_declarations: AGENTIC_TOOLS_OPENAI.map(function(t){
  return { name: t.function.name, description: t.function.description, parameters: _agSanitizeForGemini(t.function.parameters) };
}) }];

async function agenticGetSecret(key, env) {
  if (env && env[key]) return env[key];
  try {
    const r = await fetch("https://asgard-vault.luckdragon.io/secret/" + encodeURIComponent(key),
      { headers: { "X-Pin": (env.PADDY_PIN || '') } });
    if (!r.ok) return null;
    return (await r.text()).trim();
  } catch (e) { return null; }
}

const ASGARD_DRIVE_FOLDER = "1SVbCqDwD7AztVXmijffRTPdCi_JoGQr6"; // paddy@luckdragon.io ASGARD folder

async function _agentLdAccessToken(env) {
  if (!env.LD_GOOGLE_REFRESH_TOKEN) throw new Error("LD_GOOGLE_REFRESH_TOKEN missing");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token"
    }).toString()
  });
  if (!r.ok) throw new Error("LD token refresh failed: " + (await r.text()).slice(0, 200));
  return (await r.json()).access_token;
}


// Full-scope Drive/Docs token (uses GOOGLE_REFRESH_TOKEN — has calendar+drive+docs write)
async function _agentFullAccessToken(env) {
  const refresh = env.GOOGLE_REFRESH_TOKEN || env.LD_GOOGLE_REFRESH_TOKEN;
  if (!refresh) throw new Error("GOOGLE_REFRESH_TOKEN missing");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID_ASGARD_AI || env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET_ASGARD_AI || env.GOOGLE_CLIENT_SECRET,
      refresh_token: refresh,
      grant_type: "refresh_token"
    }).toString()
  });
  if (!r.ok) throw new Error("Full token refresh failed: " + (await r.text()).slice(0,200));
  const d = await r.json();
  return d.access_token;
}


async function _aiEnsureErrorsTable(env) {
  if (!env.DB) return false;
  try { await env.DB.prepare("CREATE TABLE IF NOT EXISTS errors (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, worker TEXT, endpoint TEXT, message TEXT, detail TEXT, stack TEXT)").run(); return true; }
  catch (e) { return false; }
}

async function _aiLogError(env, endpoint, message, detail) {
  if (!env.DB) return;
  try {
    await _aiEnsureErrorsTable(env);
    await env.DB.prepare("INSERT INTO errors (ts, worker, endpoint, message, detail, stack) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(Date.now(), 'asgard-ai', endpoint, String(message || '').slice(0, 1000), String(detail || '').slice(0, 4000), '').run();
  } catch (e) { console.error('errors log failed:', e); }
}

async function agenticExecuteTool(name, input, env) {
  try {
    if (name === "http_request") {
      const { url, method = "GET", headers = {}, body } = input || {};
      // Default User-Agent so APIs like GitHub don't 403 us
      const finalHeaders = Object.assign({ 'User-Agent': 'Asgard-Agent/1.0 (+https://asgard.luckdragon.io)' }, headers || {});
      const opts = { method, headers: finalHeaders };
      if (body !== undefined && body !== null) opts.body = body;
      // CF blocks worker-to-worker loopback within the same account → returns 1042.
      // Detect that URL pattern and short-circuit with a useful explanation so the model can pivot.
      const isLoopback = /^https?:\/\/[^\/]*\.luckdragon.io/i.test(String(url || ""));
      try {
        const r = await fetch(url, opts);
        const text = await r.text();
        if (isLoopback && (text.includes("error code: 1042") || text.includes("Worker threw"))) {
          return {
            status: r.status, ok: false,
            error: "CF worker-to-worker loopback blocked (error 1042). The host " + new URL(url).hostname + " is in the same Cloudflare account as this caller.",
            workaround: "For asgard workers use the dedicated tools instead: get_worker_code (read source), deploy_worker (push code), get_secret (vault). For external services, use their public custom domain (not workers.dev).",
            body: text.substring(0, 1000)
          };
        }
        return { status: r.status, ok: r.ok, body: text.substring(0, 8000) };
      } catch (e) {
        return { status: 0, ok: false, error: e.message, loopback_suspected: isLoopback };
      }
    }
    if (name === "get_worker_code") {
      const { worker_name } = input || {};
      if (!worker_name) return { error: "worker_name required" };
      const cfToken = env.CF_API_TOKEN_FULLOPS;
      const acct = env.CF_ACCOUNT_ID;
      if (!cfToken || !acct) return { error: "CF_API_TOKEN_FULLOPS or CF_ACCOUNT_ID not bound" };
      const resp = await fetch(
        "https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name,
        { headers: { "Authorization": "Bearer " + cfToken } }
      );
      if (!resp.ok) return { error: "CF API failed: " + resp.status, worker: worker_name };
      const text = await resp.text();
      const firstNL = text.indexOf("\r\n");
      const bnd = text.slice(0, firstNL).replace(/^--/, "");
      let codeBlock = null, foundModule = null;
      for (const mn of ["index.js", "worker.js"]) {
        const mk = 'name="' + mn + '"\r\n\r\n';
        const si = text.indexOf(mk);
        if (si !== -1) {
          const cs = si + mk.length;
          const ei = text.indexOf("\r\n--" + bnd, cs);
          codeBlock = text.slice(cs, ei === -1 ? undefined : ei);
          foundModule = mn;
          break;
        }
      }
      // fallback: first .js part
      if (!codeBlock) {
        const m = text.match(/name="([^"]+\.js)"\r\n\r\n/);
        if (m) {
          const si = text.indexOf(m[0]) + m[0].length;
          const ei = text.indexOf("\r\n--" + bnd, si);
          codeBlock = text.slice(si, ei === -1 ? undefined : ei);
          foundModule = m[1];
        }
      }
      if (!codeBlock) return { error: "could not find JS module in worker multipart", worker: worker_name };
      return { worker: worker_name, module: foundModule, code: codeBlock, code_length: codeBlock.length };
    }

    if (name === "deploy_worker") {
      const { worker_name, code: newCode, main_module: _mm } = input || {};
      if (!worker_name || !newCode) return { error: "worker_name and code required" };
      if (worker_name === "asgard-ai") return { error: "refusing to self-deploy asgard-ai via tool call" };
      const cfToken = env.CF_API_TOKEN_FULLOPS;
      const acct = env.CF_ACCOUNT_ID;
      if (!cfToken || !acct) return { error: "CF_API_TOKEN_FULLOPS or CF_ACCOUNT_ID not bound" };
      // Step 1: get current bindings from /versions/{latest}
      const verList = await fetch(
        "https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name + "/versions",
        { headers: { "Authorization": "Bearer " + cfToken } }
      );
      if (!verList.ok) return { error: "versions list failed: " + verList.status, worker: worker_name };
      const vl = await verList.json();
      const latestId = vl.result && vl.result.items && vl.result.items[0] && vl.result.items[0].id;
      let existingBindings = [];
      let compatDate = "2025-04-01";
      let mainModule = _mm || "index.js";
      if (latestId) {
        const vd = await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name + "/versions/" + latestId,
          { headers: { "Authorization": "Bearer " + cfToken } }
        );
        if (vd.ok) {
          const vj = await vd.json();
          existingBindings = vj.result && vj.result.resources && vj.result.resources.bindings || [];
          compatDate = (vj.result && vj.result.metadata && vj.result.metadata.compatibility_date) || compatDate;
          mainModule = (vj.result && vj.result.metadata && vj.result.metadata.main_module) || mainModule;
        }
      }
      // Step 2: convert to inherit-style metadata
      const bindingsMd = existingBindings.map(b => {
        if (b.type === "secret_text") return { name: b.name, type: "inherit", old_name: b.name };
        if (b.type === "d1") return { name: b.name, type: "d1", id: b.database_id || b.id };
        if (b.type === "kv_namespace") return { name: b.name, type: "kv_namespace", namespace_id: b.namespace_id };
        if (b.type === "vectorize") return { name: b.name, type: "vectorize", index_name: b.index_name };
        if (b.type === "ai") return { name: b.name, type: "ai" };
        if (b.type === "r2_bucket") return { name: b.name, type: "r2_bucket", bucket_name: b.bucket_name };
        return { name: b.name, type: "inherit", old_name: b.name };
      });
      const metadata = JSON.stringify({ main_module: mainModule, compatibility_date: compatDate, bindings: bindingsMd });
      // Step 3: multipart PUT
      const enc = new TextEncoder();
      const bnd = "----asgardtool" + Math.random().toString(36).slice(2,12);
      const CRLF = "\r\n";
      const parts = [
        enc.encode("--" + bnd + CRLF + 'Content-Disposition: form-data; name="metadata"; filename="metadata.json"' + CRLF + "Content-Type: application/json" + CRLF + CRLF),
        enc.encode(metadata),
        enc.encode(CRLF + "--" + bnd + CRLF + 'Content-Disposition: form-data; name="' + mainModule + '"; filename="' + mainModule + '"' + CRLF + "Content-Type: application/javascript+module" + CRLF + CRLF),
        enc.encode(newCode),
        enc.encode(CRLF + "--" + bnd + "--" + CRLF),
      ];
      const totalLen = parts.reduce((s, p) => s + p.byteLength, 0);
      const buf = new Uint8Array(totalLen);
      let off = 0; for (const p of parts) { buf.set(p, off); off += p.byteLength; }
      const deployResp = await fetch(
        "https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name,
        { method: "PUT", headers: { "Authorization": "Bearer " + cfToken, "Content-Type": "multipart/form-data; boundary=" + bnd }, body: buf }
      );
      const dt = await deployResp.text();
      let dj; try { dj = JSON.parse(dt); } catch { dj = { raw: dt.slice(0, 300) }; }
      return {
        ok: !!dj.success,
        deployment_id: dj.result && dj.result.deployment_id || null,
        bindings_count: bindingsMd.length,
        worker: worker_name,
        main_module: mainModule,
        errors: dj.errors || [],
      };
    }

    if (name === "get_secret") {
      const { key } = input || {};
      const v = await agenticGetSecret(key, env);
      return v ? { value: v, source: env[key] ? "env" : "vault" } : { error: "Secret not found: " + key };
    }
    if (name === "drive_upload") {
      const { filename, content, mime = "text/plain", parent } = input || {};
      const access = await _agentFullAccessToken(env);
      const parentId = parent || ASGARD_DRIVE_FOLDER;
      const boundary = "----asgard-agent-" + Math.random().toString(36).slice(2);
      const meta = JSON.stringify({ name: filename, parents: [parentId] });
      const enc = new TextEncoder();
      const head = enc.encode("--" + boundary + "\r\n" + "Content-Type: application/json; charset=UTF-8\r\n\r\n" + meta + "\r\n" + "--" + boundary + "\r\n" + "Content-Type: " + mime + "\r\n\r\n");
      const tail = enc.encode("\r\n--" + boundary + "--\r\n");
      const bodyBytes = enc.encode(String(content));
      const body = new Uint8Array(head.byteLength + bodyBytes.byteLength + tail.byteLength);
      body.set(head, 0); body.set(bodyBytes, head.byteLength); body.set(tail, head.byteLength + bodyBytes.byteLength);
      const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,size,webViewLink", {
        method: "POST",
        headers: { "Authorization": "Bearer " + access, "Content-Type": "multipart/related; boundary=" + boundary },
        body
      });
      if (!r.ok) return { error: "drive_upload " + r.status, detail: (await r.text()).slice(0, 500) };
      return await r.json();
    }
    if (name === "drive_search") {
      const { query } = input || {};
      const access = await _agentLdAccessToken(env);
      const q = encodeURIComponent("name contains '" + String(query).replace(/'/g, "\\'") + "' and trashed = false");
      const r = await fetch("https://www.googleapis.com/drive/v3/files?q=" + q + "&pageSize=20&fields=files(id,name,mimeType,size,modifiedTime,parents)&supportsAllDrives=true&includeItemsFromAllDrives=true", {
        headers: { "Authorization": "Bearer " + access }
      });
      if (!r.ok) return { error: "drive_search " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { count: (j.files || []).length, files: j.files || [] };
    }
    if (name === "drive_read") {
      const { file_id } = input || {};
      const access = await _agentLdAccessToken(env);
      const r = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(file_id) + "?alt=media&supportsAllDrives=true", {
        headers: { "Authorization": "Bearer " + access }
      });
      if (!r.ok) return { error: "drive_read " + r.status, detail: (await r.text()).slice(0, 300) };
      const t = await r.text();
      return { content: t.substring(0, 60000), length: t.length };
    }
    // ── v6.15.0: read_worker_section ─────────────────────────────────────────
    if (name === "read_worker_section") {
      const { worker_name, needle, context_lines = 40 } = input || {};
      if (!worker_name || !needle) return { error: "worker_name and needle required" };
      // Try GH first (cleaner source), fall back to CF
      const gh = env.GITHUB_TOKEN;
      let src = null;
      if (gh) {
        try {
          const r = await fetch("https://api.github.com/repos/Luck-Dragon-Pty-Ltd/asgard-source/contents/workers/" + worker_name + ".js?ref=main", {
            headers: { "Authorization": "Bearer " + gh, "Accept": "application/vnd.github+json", "User-Agent": "Asgard/1.0" }
          });
          if (r.ok) {
            const j = await r.json();
            if (j.content) src = atob(j.content.replace(/\n/g, ""));
          }
        } catch(e) {}
      }
      if (!src) {
        // Fallback: try CF Worker contents
        const cfToken = env.CF_API_TOKEN_FULLOPS;
        const acct = env.CF_ACCOUNT_ID;
        if (!cfToken || !acct) return { error: "could not load worker source (no GH match and no CF creds)" };
        const r = await fetch("https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name, { headers: { "Authorization": "Bearer " + cfToken } });
        if (!r.ok) return { error: "CF API: " + r.status };
        src = await r.text();
      }
      const idx = src.indexOf(needle);
      if (idx === -1) return { error: "needle not found", worker: worker_name, needle_preview: needle.slice(0, 80), source_length: src.length };
      // Find line boundaries
      const before = src.slice(0, idx);
      const lineNum = before.split("\n").length;
      const lines = src.split("\n");
      const startLine = Math.max(0, lineNum - context_lines - 1);
      const endLine = Math.min(lines.length, lineNum + context_lines);
      const section = lines.slice(startLine, endLine).map((l, i) => (startLine + i + 1) + ":" + l).join("\n");
      const total_matches = src.split(needle).length - 1;
      return { worker: worker_name, line: lineNum, total_matches, section, source_total_lines: lines.length };
    }
    // ── v6.15.0: replace_in_worker ───────────────────────────────────────────
    if (name === "replace_in_worker") {
      const { worker_name, find, replace, commit_message } = input || {};
      if (!worker_name || typeof find !== "string" || typeof replace !== "string") return { error: "worker_name, find, replace all required" };
      if (worker_name === "asgard-ai") return { error: "refusing to self-edit asgard-ai (use deploy_worker with full code if you really mean it)" };
      const gh = env.GITHUB_TOKEN;
      if (!gh) return { error: "GITHUB_TOKEN missing" };
      // 1. Fetch from GH
      const ghPath = "workers/" + worker_name + ".js";
      const ghRes = await fetch("https://api.github.com/repos/Luck-Dragon-Pty-Ltd/asgard-source/contents/" + ghPath + "?ref=main", {
        headers: { "Authorization": "Bearer " + gh, "Accept": "application/vnd.github+json", "User-Agent": "Asgard/1.0" }
      });
      if (!ghRes.ok) return { error: "GH fetch failed: " + ghRes.status, worker: worker_name };
      const ghMeta = await ghRes.json();
      const oldContent = atob(ghMeta.content.replace(/\n/g, ""));
      const count = oldContent.split(find).length - 1;
      if (count === 0) return { error: "find string not in worker source", worker: worker_name, find_preview: find.slice(0, 100) };
      if (count > 1) return { error: "find string appears " + count + " times; must be exactly 1 to be safe. Add more context to the find string.", worker: worker_name, find_preview: find.slice(0, 100) };
      const newContent = oldContent.replace(find, replace);
      // 2. Commit to GH
      const commitBody = JSON.stringify({
        message: commit_message || ("falkor edit: " + worker_name + " — replace_in_worker"),
        content: btoa(newContent),
        sha: ghMeta.sha,
        branch: "main"
      });
      const putRes = await fetch("https://api.github.com/repos/Luck-Dragon-Pty-Ltd/asgard-source/contents/" + ghPath, {
        method: "PUT", body: commitBody,
        headers: { "Authorization": "Bearer " + gh, "Accept": "application/vnd.github+json", "User-Agent": "Asgard/1.0" }
      });
      if (!putRes.ok) return { error: "GH commit failed: " + putRes.status, detail: (await putRes.text()).slice(0, 200) };
      const commitData = await putRes.json();
      const newSha = (commitData.commit || {}).sha || "";
      // 3. Deploy to CF
      const cfToken = env.CF_API_TOKEN_FULLOPS;
      const acct = env.CF_ACCOUNT_ID;
      if (!cfToken || !acct) return { ok: true, warning: "GH committed but CF token missing — not deployed", gh_sha: newSha.slice(0, 8) };
      // Get bindings
      const settingsRes = await fetch("https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name + "/settings", { headers: { "Authorization": "Bearer " + cfToken } });
      if (!settingsRes.ok) return { ok: true, warning: "GH committed but bindings fetch failed — manual CF deploy required", gh_sha: newSha.slice(0, 8) };
      const settingsData = await settingsRes.json();
      const bindings = (settingsData.result || {}).bindings || [];
      const secretBindings = bindings.filter(b => b.type === "secret_text").map(b => ({ type: "inherit", name: b.name }));
      const otherBindings = bindings.filter(b => b.type !== "secret_text");
      // Detect main_module from existing worker
      const detectRes = await fetch("https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name, { headers: { "Authorization": "Bearer " + cfToken } });
      const detectText = await detectRes.text();
      const moduleMatch = detectText.match(/name="(index\.js|worker\.js)"/);
      const mainModule = moduleMatch ? moduleMatch[1] : "index.js";
      const metadata = { main_module: mainModule, compatibility_date: "2025-04-01", bindings: [...secretBindings, ...otherBindings] };
      const bnd = "asgardedit" + Date.now();
      const CRLF = "\r\n";
      const enc = new TextEncoder();
      const parts = [
        enc.encode("--" + bnd + CRLF + 'Content-Disposition: form-data; name="metadata"' + CRLF + 'Content-Type: application/json' + CRLF + CRLF + JSON.stringify(metadata) + CRLF),
        enc.encode("--" + bnd + CRLF + 'Content-Disposition: form-data; name="' + mainModule + '"; filename="' + mainModule + '"' + CRLF + 'Content-Type: application/javascript+module' + CRLF + CRLF),
        enc.encode(newContent),
        enc.encode(CRLF + "--" + bnd + "--" + CRLF)
      ];
      const totalLen = parts.reduce((s, p) => s + p.byteLength, 0);
      const buf = new Uint8Array(totalLen);
      let off = 0; for (const p of parts) { buf.set(p, off); off += p.byteLength; }
      const deployRes = await fetch("https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name, {
        method: "PUT",
        headers: { "Authorization": "Bearer " + cfToken, "Content-Type": "multipart/form-data; boundary=" + bnd },
        body: buf
      });
      const deployData = await deployRes.json();
      return { ok: deployData.success === true, worker: worker_name, gh_sha: newSha.slice(0, 8), deploy_id: ((deployData.result || {}).deployment_id || "").slice(0, 12), find_preview: find.slice(0, 80), replace_preview: replace.slice(0, 80), errors: (deployData.errors || []).slice(0, 2) };
    }
    // ── v6.15.0: multi_replace_in_worker ─────────────────────────────────────
    if (name === "multi_replace_in_worker") {
      const { worker_name, edits, commit_message } = input || {};
      if (!worker_name || !Array.isArray(edits) || edits.length === 0) return { error: "worker_name and non-empty edits array required" };
      if (worker_name === "asgard-ai") return { error: "refusing to self-edit asgard-ai" };
      const gh = env.GITHUB_TOKEN;
      if (!gh) return { error: "GITHUB_TOKEN missing" };
      const ghPath = "workers/" + worker_name + ".js";
      const ghRes = await fetch("https://api.github.com/repos/Luck-Dragon-Pty-Ltd/asgard-source/contents/" + ghPath + "?ref=main", {
        headers: { "Authorization": "Bearer " + gh, "Accept": "application/vnd.github+json", "User-Agent": "Asgard/1.0" }
      });
      if (!ghRes.ok) return { error: "GH fetch failed: " + ghRes.status };
      const ghMeta = await ghRes.json();
      let content = atob(ghMeta.content.replace(/\n/g, ""));
      const applied = [];
      for (let i = 0; i < edits.length; i++) {
        const ed = edits[i];
        const c = content.split(ed.find).length - 1;
        if (c === 0) return { error: "edit " + i + ": find not found", find_preview: (ed.find || "").slice(0, 100), applied };
        if (c > 1) return { error: "edit " + i + ": find appears " + c + " times (must be exactly 1)", find_preview: (ed.find || "").slice(0, 100), applied };
        content = content.replace(ed.find, ed.replace);
        applied.push({ index: i, find_preview: (ed.find || "").slice(0, 60), replace_preview: (ed.replace || "").slice(0, 60) });
      }
      // Commit
      const putRes = await fetch("https://api.github.com/repos/Luck-Dragon-Pty-Ltd/asgard-source/contents/" + ghPath, {
        method: "PUT",
        body: JSON.stringify({ message: commit_message || ("falkor multi-edit: " + worker_name + " (" + edits.length + " edits)"), content: btoa(content), sha: ghMeta.sha, branch: "main" }),
        headers: { "Authorization": "Bearer " + gh, "Accept": "application/vnd.github+json", "User-Agent": "Asgard/1.0" }
      });
      if (!putRes.ok) return { error: "GH commit failed: " + putRes.status, detail: (await putRes.text()).slice(0, 200), applied };
      const commitData = await putRes.json();
      const newSha = (commitData.commit || {}).sha || "";
      // Deploy
      const cfToken = env.CF_API_TOKEN_FULLOPS;
      const acct = env.CF_ACCOUNT_ID;
      if (!cfToken || !acct) return { ok: true, warning: "GH committed but CF deploy skipped (no CF creds)", gh_sha: newSha.slice(0, 8), applied };
      const settingsRes = await fetch("https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name + "/settings", { headers: { "Authorization": "Bearer " + cfToken } });
      if (!settingsRes.ok) return { ok: true, warning: "GH committed but bindings fetch failed", gh_sha: newSha.slice(0, 8), applied };
      const settingsData = await settingsRes.json();
      const bindings = (settingsData.result || {}).bindings || [];
      const secretBindings = bindings.filter(b => b.type === "secret_text").map(b => ({ type: "inherit", name: b.name }));
      const otherBindings = bindings.filter(b => b.type !== "secret_text");
      const detectRes = await fetch("https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name, { headers: { "Authorization": "Bearer " + cfToken } });
      const detectText = await detectRes.text();
      const moduleMatch = detectText.match(/name="(index\.js|worker\.js)"/);
      const mainModule = moduleMatch ? moduleMatch[1] : "index.js";
      const metadata = { main_module: mainModule, compatibility_date: "2025-04-01", bindings: [...secretBindings, ...otherBindings] };
      const bnd2 = "asgardmedit" + Date.now();
      const CRLF = "\r\n";
      const enc = new TextEncoder();
      const parts = [
        enc.encode("--" + bnd2 + CRLF + 'Content-Disposition: form-data; name="metadata"' + CRLF + 'Content-Type: application/json' + CRLF + CRLF + JSON.stringify(metadata) + CRLF),
        enc.encode("--" + bnd2 + CRLF + 'Content-Disposition: form-data; name="' + mainModule + '"; filename="' + mainModule + '"' + CRLF + 'Content-Type: application/javascript+module' + CRLF + CRLF),
        enc.encode(content),
        enc.encode(CRLF + "--" + bnd2 + "--" + CRLF)
      ];
      const totalLen = parts.reduce((s, p) => s + p.byteLength, 0);
      const buf = new Uint8Array(totalLen);
      let off = 0; for (const p of parts) { buf.set(p, off); off += p.byteLength; }
      const deployRes = await fetch("https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts/" + worker_name, {
        method: "PUT",
        headers: { "Authorization": "Bearer " + cfToken, "Content-Type": "multipart/form-data; boundary=" + bnd2 },
        body: buf
      });
      const deployData = await deployRes.json();
      return { ok: deployData.success === true, worker: worker_name, gh_sha: newSha.slice(0, 8), edits_applied: applied.length, applied, errors: (deployData.errors || []).slice(0, 2) };
    }
        if (name === "github_get_file") {
      const { owner = "LuckDragonAsgard", repo, path, branch = "main" } = input || {};
      if (!env.GITHUB_TOKEN) return { error: "GITHUB_TOKEN missing" };
      const url = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path + "?ref=" + encodeURIComponent(branch);
      const r = await fetch(url, { headers: { "Authorization": "Bearer " + env.GITHUB_TOKEN, "Accept": "application/vnd.github+json", "User-Agent": "Asgard-Agent/1.0" } });
      if (!r.ok) return { error: "github_get_file " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      let content = "";
      try { content = atob((j.content || "").replace(/\n/g, "")); } catch (e) {}
      return { content: content.substring(0, 60000), sha: j.sha, size: j.size, html_url: j.html_url };
    }
    if (name === "github_write_file") {
      const { owner = "LuckDragonAsgard", repo, path, content, message, branch = "main" } = input || {};
      if (!env.GITHUB_TOKEN) return { error: "GITHUB_TOKEN missing" };
      const url = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path;
      let sha = null;
      try {
        const probe = await fetch(url + "?ref=" + encodeURIComponent(branch), { headers: { "Authorization": "Bearer " + env.GITHUB_TOKEN, "Accept": "application/vnd.github+json", "User-Agent": "Asgard-Agent/1.0" } });
        if (probe.ok) { const j0 = await probe.json(); sha = j0.sha; }
      } catch (e) {}
      const enc = new TextEncoder();
      const bytes = enc.encode(String(content || ""));
      let b64 = "";
      for (let i = 0; i < bytes.length; i++) b64 += String.fromCharCode(bytes[i]);
      b64 = btoa(b64);
      const body = { message: message || "asgard-agent: update " + path, content: b64, branch };
      if (sha) body.sha = sha;
      const r = await fetch(url, { method: "PUT", headers: { "Authorization": "Bearer " + env.GITHUB_TOKEN, "Accept": "application/vnd.github+json", "Content-Type": "application/json", "User-Agent": "Asgard-Agent/1.0" }, body: JSON.stringify(body) });
      if (!r.ok) return { error: "github_write_file " + r.status, detail: (await r.text()).slice(0, 500) };
      const j = await r.json();
      return { ok: true, action: sha ? "updated" : "created", commit: j.commit && j.commit.sha, html_url: j.content && j.content.html_url };
    }
    if (name === "send_email") {
      const { to, subject, html, text, from } = input || {};
      if (!env.RESEND_API_KEY) return { error: "RESEND_API_KEY missing" };
      const body = { from: from || "Asgard <noreply@luckdragon.io>", to: Array.isArray(to) ? to : [to], subject };
      if (html) body.html = html;
      if (text) body.text = text;
      if (!body.html && !body.text) body.text = subject;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) return { error: "resend " + r.status, detail: (await r.text()).slice(0, 300) };
      return await r.json();
    }
    if (name === "vercel_list_projects") {
      if (!env.VERCEL_TOKEN) return { error: "VERCEL_TOKEN missing" };
      const limit = (input && input.limit) || 20;
      const r = await fetch("https://api.vercel.com/v10/projects?teamId=team_qXLAiOqq0EztMXKK8CXX6JhT&limit=" + limit, {
        headers: { "Authorization": "Bearer " + env.VERCEL_TOKEN }
      });
      if (!r.ok) return { error: "vercel " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { count: (j.projects || []).length, projects: (j.projects || []).map(function(p){ return { id: p.id, name: p.name, framework: p.framework, latestDeployment: p.latestDeployments && p.latestDeployments[0] && p.latestDeployments[0].url }; }) };
    }
    if (name === "vercel_list_deployments") {
      if (!env.VERCEL_TOKEN) return { error: "VERCEL_TOKEN missing" };
      const limit = (input && input.limit) || 10;
      const params = ["teamId=team_qXLAiOqq0EztMXKK8CXX6JhT", "limit=" + limit];
      if (input && input.projectId) params.push("projectId=" + encodeURIComponent(input.projectId));
      if (input && input.target) params.push("target=" + encodeURIComponent(input.target));
      const r = await fetch("https://api.vercel.com/v6/deployments?" + params.join("&"), { headers: { "Authorization": "Bearer " + env.VERCEL_TOKEN } });
      if (!r.ok) return { error: "vercel " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { count: (j.deployments || []).length, deployments: (j.deployments || []).map(function(d){ return { uid: d.uid, name: d.name, url: d.url, state: d.state, target: d.target, created: d.created }; }) };
    }
    if (name === "vercel_get_deployment") {
      if (!env.VERCEL_TOKEN) return { error: "VERCEL_TOKEN missing" };
      const r = await fetch("https://api.vercel.com/v13/deployments/" + encodeURIComponent(input.deployment_id) + "?teamId=team_qXLAiOqq0EztMXKK8CXX6JhT", { headers: { "Authorization": "Bearer " + env.VERCEL_TOKEN } });
      if (!r.ok) return { error: "vercel " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { uid: j.id, name: j.name, url: j.url, state: j.readyState || j.state, target: j.target, created: j.createdAt, build: j.build, error: j.error };
    }
    if (name === "vercel_redeploy") {
      if (!env.VERCEL_TOKEN) return { error: "VERCEL_TOKEN missing" };
      const r = await fetch("https://api.vercel.com/v13/deployments?forceNew=1&teamId=team_qXLAiOqq0EztMXKK8CXX6JhT", {
        method: "POST",
        headers: { "Authorization": "Bearer " + env.VERCEL_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ name: input.name, deploymentId: input.deployment_id })
      });
      if (!r.ok) return { error: "vercel " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { uid: j.id, url: j.url, state: j.readyState };
    }
    if (name === "stripe_list_products") {
      if (!env.STRIPE_SECRET_KEY) return { error: "STRIPE_SECRET_KEY missing" };
      const limit = (input && input.limit) || 20;
      const params = ["limit=" + limit];
      if (input && typeof input.active === "boolean") params.push("active=" + input.active);
      const r = await fetch("https://api.stripe.com/v1/products?" + params.join("&"), { headers: { "Authorization": "Bearer " + env.STRIPE_SECRET_KEY } });
      if (!r.ok) return { error: "stripe " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { count: (j.data || []).length, products: (j.data || []).map(function(p){ return { id: p.id, name: p.name, active: p.active, default_price: p.default_price }; }) };
    }
    if (name === "stripe_list_payment_links") {
      if (!env.STRIPE_SECRET_KEY) return { error: "STRIPE_SECRET_KEY missing" };
      const limit = (input && input.limit) || 20;
      const r = await fetch("https://api.stripe.com/v1/payment_links?limit=" + limit, { headers: { "Authorization": "Bearer " + env.STRIPE_SECRET_KEY } });
      if (!r.ok) return { error: "stripe " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { count: (j.data || []).length, links: (j.data || []).map(function(l){ return { id: l.id, url: l.url, active: l.active }; }) };
    }
    if (name === "stripe_create_payment_link") {
      if (!env.STRIPE_SECRET_KEY) return { error: "STRIPE_SECRET_KEY missing" };
      const params = new URLSearchParams();
      params.append("line_items[0][price]", input.price_id);
      params.append("line_items[0][quantity]", String(input.quantity || 1));
      if (input.adjustable_quantity) {
        params.append("line_items[0][adjustable_quantity][enabled]", "true");
        params.append("line_items[0][adjustable_quantity][minimum]", "1");
      }
      const r = await fetch("https://api.stripe.com/v1/payment_links", {
        method: "POST",
        headers: { "Authorization": "Bearer " + env.STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });
      if (!r.ok) return { error: "stripe " + r.status, detail: (await r.text()).slice(0, 500) };
      const j = await r.json();
      return { id: j.id, url: j.url, active: j.active };
    }
    if (name === "supabase_select") {
      if (!env.SUPABASE_URL || !env.SUPABASE_KEY) return { error: "SUPABASE_URL or SUPABASE_KEY missing" };
      const limit = (input && input.limit) || 50;
      const select = (input && input.select) || "*";
      const url = env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + encodeURIComponent(input.table) + "?select=" + encodeURIComponent(select) + (input.query ? "&" + input.query : "") + "&limit=" + limit;
      const r = await fetch(url, { headers: { "apikey": env.SUPABASE_KEY, "Authorization": "Bearer " + env.SUPABASE_KEY } });
      if (!r.ok) return { error: "supabase " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { count: Array.isArray(j) ? j.length : 0, rows: j };
    }
    if (name === "supabase_insert") {
      if (!env.SUPABASE_URL || !env.SUPABASE_KEY) return { error: "SUPABASE_URL or SUPABASE_KEY missing" };
      const url = env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + encodeURIComponent(input.table);
      const r = await fetch(url, {
        method: "POST",
        headers: { "apikey": env.SUPABASE_KEY, "Authorization": "Bearer " + env.SUPABASE_KEY, "Content-Type": "application/json", "Prefer": "return=representation" },
        body: JSON.stringify(input.row)
      });
      if (!r.ok) return { error: "supabase " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { inserted: Array.isArray(j) ? j.length : 1, rows: j };
    }
    if (name === "web_search") {
      if (!env.TAVILY_API_KEY) return { error: "TAVILY_API_KEY missing" };
      const r = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: env.TAVILY_API_KEY,
          query: input.query,
          max_results: input.max_results || 5,
          include_answer: input.include_answer !== false,
          search_depth: "basic"
        })
      });
      if (!r.ok) return { error: "tavily " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return {
        answer: j.answer || null,
        results: (j.results || []).map(function(x){ return { title: x.title, url: x.url, content: (x.content || "").substring(0, 600) }; })
      };
    }
    if (name === "discord_send") {
      if (!env.DISCORD_BOT_TOKEN) return { error: "DISCORD_BOT_TOKEN missing" };
      const ch = input.channel_id || env.DISCORD_CHANNEL_ID;
      if (!ch) return { error: "channel_id missing and DISCORD_CHANNEL_ID not bound" };
      const r = await fetch("https://discord.com/api/v10/channels/" + ch + "/messages", {
        method: "POST",
        headers: { "Authorization": "Bot " + env.DISCORD_BOT_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.content })
      });
      if (!r.ok) return { error: "discord " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { ok: true, message_id: j.id, channel_id: j.channel_id };
    }
    // Browser Rendering family — proxied through asgard-browser worker (CF loopback ok because we use full domain via fetch from outside?)
    // Note: asgard-ai loops back to asgard-browser will hit 1042. Use direct REST API instead.
    if (name === "browser_screenshot" || name === "browser_content" || name === "browser_markdown" || name === "browser_json" || name === "browser_links" || name === "browser_scrape" || name === "browser_pdf") {
      const tok = env.CF_API_TOKEN_FULLOPS || env.CF_API_TOKEN;
      if (!tok) return { error: "CF_API_TOKEN_FULLOPS missing on asgard-ai" };
      const ACCT = "a6f47c17811ee2f8b6caeb8f38768c20";
      const ops = {
        browser_screenshot: { op: 'screenshot', body: { url: input.url, screenshotOptions: { fullPage: !!input.full_page } } },
        browser_content:    { op: 'content',    body: { url: input.url } },
        browser_markdown:   { op: 'markdown',   body: { url: input.url } },
        browser_json:       { op: 'json',       body: { url: input.url, prompt: input.prompt } },
        browser_links:      { op: 'links',      body: { url: input.url } },
        browser_scrape:     { op: 'scrape',     body: { url: input.url, elements: [{ selector: input.selector }] } },
        browser_pdf:        { op: 'pdf',        body: { url: input.url } }
      };
      const cfg = ops[name];
      const r = await fetch("https://api.cloudflare.com/client/v4/accounts/" + ACCT + "/browser-rendering/" + cfg.op, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
        body: JSON.stringify(cfg.body)
      });
      if (!r.ok) return { error: "browser " + r.status, detail: (await r.text()).slice(0, 500) };
      const ct = r.headers.get("Content-Type") || "";
      if (ct.includes("image/png")) {
        const ab = await r.arrayBuffer();
        const u8 = new Uint8Array(ab);
        let bin = ""; for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
        return { ok: true, url: input.url, image_data_url: "data:image/png;base64," + btoa(bin), size: u8.length };
      }
      if (ct.includes("application/pdf")) {
        const ab = await r.arrayBuffer();
        const u8 = new Uint8Array(ab);
        let bin = ""; for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
        return { ok: true, url: input.url, pdf_data_url: "data:application/pdf;base64," + btoa(bin), size: u8.length };
      }
      const j = await r.json();
      // Truncate long string results so they don't bloat the agent loop context.
      if (j && typeof j.result === "string" && j.result.length > 30000) j.result = j.result.substring(0, 30000) + "…[truncated]";
      return { ok: true, url: input.url, ...j };
    }
    if (name === "chrome_navigate" || name === "chrome_screenshot" || name === "chrome_extract" || name === "chrome_click" || name === "chrome_type") {
      const cmd = { type: name.replace("chrome_", ""), input };
      const r = await bridgeRunCommand(env, cmd, "paddy", 30000);
      return r;
    }
    if (name === "desktop_screenshot" || name === "desktop_click" || name === "desktop_type" || name === "desktop_key" || name === "desktop_run") {
      const cmd = { type: name.replace("desktop_", ""), input };
      const r = await bridgeRunCommand(env, cmd, "paddy-desktop", 30000);
      return r;
    }
    if (name === "power_automate_trigger") {
      const r = await fetch(input.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.payload || {})
      });
      const text = await r.text();
      let parsed = null;
      try { parsed = JSON.parse(text); } catch (e) {}
      return { ok: r.ok, status: r.status, response: parsed || text.substring(0, 4000) };
    }
    if (name === "drive_share") {
      if (!env.LD_GOOGLE_REFRESH_TOKEN) return { error: "LD_GOOGLE_REFRESH_TOKEN missing" };
      const access = await _agentFullAccessToken(env);
      const r = await fetch(
        "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(input.file_id) + "/permissions?supportsAllDrives=true&sendNotificationEmail=" + (input.sendNotificationEmail ? "true" : "false"),
        { method: "POST", headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
          body: JSON.stringify({ role: input.role || "reader", type: "user", emailAddress: input.email }) }
      );
      if (!r.ok) return { error: "drive_share " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { ok: true, file_id: input.file_id, email: input.email, role: input.role || "reader", permission_id: j.id };
    }
    if (name === "drive_list_roots") {
      if (!env.LD_GOOGLE_REFRESH_TOKEN) return { error: "LD_GOOGLE_REFRESH_TOKEN missing" };
      const access = await _agentLdAccessToken(env);
      const q = encodeURIComponent("'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'");
      const r = await fetch("https://www.googleapis.com/drive/v3/files?q=" + q + "&fields=files(id,name,modifiedTime)&pageSize=200",
        { headers: { "Authorization": "Bearer " + access } });
      if (!r.ok) return { error: "drive_list_roots " + r.status, detail: (await r.text()).slice(0, 300) };
      const j = await r.json();
      return { ok: true, count: (j.files||[]).length, folders: j.files || [] };
    }
    if (name === "save_memory") {
      const { key, value, project, shared = false } = input || {};
      if (!key || value === undefined) return { error: 'key and value required' };
      if (!project) return { error: 'project is REQUIRED — no default. Pick a slug from project_hub (e.g. kbt, asgard-final-build, wps-curriculum). Cross-project writes were causing data loss; this is now enforced.' };
      if (!env.DB) return { error: 'D1 not bound' };
      await _ensureMemoryTables(env);
      const pinUser = env._pinUser || 'shared';
      const now = Date.now();
      // VERSIONED write to memory_v2 — append-only, full history preserved, audit_log fires automatically
      const prev = await env.DB.prepare("SELECT MAX(version) AS v FROM memory_v2 WHERE pin_user=? AND project=? AND key=?").bind(pinUser, project, String(key)).first();
      const nextVersion = (prev && prev.v ? prev.v : 0) + 1;
      await env.DB.prepare("INSERT INTO memory_v2 (pin_user, project, key, value, version, is_current, is_shared, actor, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)")
        .bind(pinUser, project, String(key), String(value), nextVersion, shared ? 1 : 0, 'asgard-ai', now).run();
      // Legacy mirror to memory — destructive, but harmless because memory_v2 preserves history
      await env.DB.prepare("INSERT INTO memory (pin_user, project, key, value, is_shared, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(pin_user, project, key) DO UPDATE SET value=excluded.value, is_shared=excluded.is_shared, updated_at=excluded.updated_at")
        .bind(pinUser, project, String(key), String(value), shared ? 1 : 0, now).run();
      return { ok: true, saved: key, project, version: nextVersion, shared, user: pinUser };
    }
    if (name === "forget_memory") {
      const { key, project } = input || {};
      if (!key) return { error: 'key required' };
      if (!project) return { error: 'project is REQUIRED — cross-project forget is not allowed. The previous behavior deleted the key from EVERY project at once and caused data loss.' };
      if (!env.DB) return { error: 'D1 not bound' };
      const pinUser = env._pinUser || 'shared';
      const now = Date.now();
      // SOFT delete in memory_v2 (preserves history via is_current=0)
      await env.DB.prepare("UPDATE memory_v2 SET is_current = 0, superseded_at = ? WHERE pin_user = ? AND project = ? AND key = ? AND is_current = 1").bind(now, pinUser, project, key).run();
      // Hard delete in legacy memory (scoped to project)
      await env.DB.prepare("DELETE FROM memory WHERE pin_user = ? AND key = ? AND project = ?").bind(pinUser, key, project).run();
      return { ok: true, soft_deleted: key, project };
    }
    if (name === "send_message") {
      const { group, message } = input || {};
      if (!group || !message) return { error: 'group and message required' };
      if (!env.DB) return { error: 'D1 not bound' };
      await _ensureMemoryTables(env);
      const pinUser = env._pinUser || 'system';
      const g = await _resolveGroup(env, group, pinUser);
      if (!g) return { error: 'could not resolve group' };
      const now = Date.now();
      await env.DB.prepare("INSERT INTO msg_inbox (group_id, from_user, body, created_at) VALUES (?, ?, ?, ?)").bind(g.id, pinUser, message, now).run();
      return { ok: true, sent_to: g.name, from: pinUser };
    }
    if (name === "rate_doc") {
      const { file_id, file_name, rating, notes, category } = input || {};
      if (!file_id || !rating) return { error: "file_id and rating required" };
      if (rating < 1 || rating > 5) return { error: "rating must be 1-5" };
      if (!env.DB) return { error: "no DB binding" };
      await env.DB.prepare(
        "INSERT INTO doc_ratings (file_id, file_name, rating, notes, category) VALUES (?,?,?,?,?)"
      ).bind(file_id, file_name || null, Math.round(rating), notes || null, category || null).run();
      const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5-Math.round(rating));
      return { ok: true, file_id, rating, stars, notes, category, message: `Rated ${file_name||file_id}: ${stars}` };
    }
    if (name === "get_doc_ratings") {
      const { file_id, category, limit } = input || {};
      if (!env.DB) return { error: "no DB binding" };
      let sql = "SELECT * FROM doc_ratings WHERE 1=1";
      const params = [];
      if (file_id) { sql += " AND file_id=?"; params.push(file_id); }
      if (category) { sql += " AND category=?"; params.push(category); }
      sql += " ORDER BY created_at DESC LIMIT ?"; params.push(limit || 10);
      const rows = await env.DB.prepare(sql).bind(...params).all();
      const results = (rows.results||[]).map(r => ({
        ...r, stars: "★".repeat(r.rating) + "☆".repeat(5-r.rating)
      }));
      return { ok: true, count: results.length, ratings: results };
    }
    if (name === "docs_replace_text") {
      const { doc_id, find, replace_with, match_case } = input || {};
      if (!doc_id || find == null || replace_with == null) return { error: "doc_id, find, replace_with required" };
      const access = await _agentFullAccessToken(env);
      const body = {
        requests: [{ replaceAllText: {
          containsText: { text: find, matchCase: match_case || false },
          replaceText: replace_with
        }}]
      };
      const r = await fetch(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(doc_id)}:batchUpdate`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) {
        const err = await r.text();
        return { error: "docs_replace_text " + r.status, detail: err.slice(0,300) };
      }
      const data = await r.json();
      const count = (data.replies||[{}])[0]?.replaceAllText?.occurrencesChanged || 0;
      return { ok: true, doc_id, find, replace_with, occurrences_changed: count };
    }
    if (name === "docs_append_text") {
      const { doc_id, text } = input || {};
      if (!doc_id || !text) return { error: "doc_id and text required" };
      const access = await _agentFullAccessToken(env);
      // Get doc to find end index
      const docR = await fetch(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(doc_id)}`, {
        headers: { "Authorization": "Bearer " + access }
      });
      if (!docR.ok) return { error: "docs_append fetch doc " + docR.status };
      const doc = await docR.json();
      const endIdx = doc.body?.content?.slice(-1)[0]?.endIndex || 1;
      const body = {
        requests: [{ insertText: { location: { index: endIdx - 1 }, text: "\n" + text } }]
      };
      const r = await fetch(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(doc_id)}:batchUpdate`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) return { error: "docs_append batchUpdate " + r.status, detail: (await r.text()).slice(0,300) };
      return { ok: true, doc_id, chars_appended: text.length };
    }
    if (name === "drive_patch") {
      const { file_id, new_content, mime_type } = input || {};
      if (!file_id || !new_content) return { error: "file_id and new_content required" };
      const access = await _agentFullAccessToken(env);
      const mime = mime_type || "text/plain";
      const r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(file_id)}?uploadType=media&supportsAllDrives=true`, {
        method: "PATCH",
        headers: { "Authorization": "Bearer " + access, "Content-Type": mime },
        body: new_content
      });
      if (!r.ok) return { error: "drive_patch " + r.status, detail: (await r.text()).slice(0,300) };
      const data = await r.json();
      return { ok: true, file_id, size: new_content.length, name: data.name, modifiedTime: data.modifiedTime };
    }
    if (name === "merge_projects") {
      const { source_id, target_id } = input || {};
      if (!source_id || !target_id) return { error: "source_id and target_id required" };
      if (source_id === target_id) return { error: "source and target must differ" };
      if (!env.PROJECT_HUB) return { error: "PROJECT_HUB binding missing" };
      try {
        const src = await env.PROJECT_HUB.prepare("SELECT * FROM project_hub WHERE id = ?").bind(source_id).first();
        const tgt = await env.PROJECT_HUB.prepare("SELECT * FROM project_hub WHERE id = ?").bind(target_id).first();
        if (!src) return { error: "source id " + source_id + " not found" };
        if (!tgt) return { error: "target id " + target_id + " not found" };
        const header = "\n\n## Merged from \"" + src.project_name + "\" (was id " + source_id + ") \u2014 " + new Date().toISOString().slice(0,10);
        const body = "\nNotes: " + (src.notes || "") + "\n\nDetail: " + (src.detail_md || "") + (src.concept_md ? "\n\nConcept: " + src.concept_md : "");
        const newDetail = (tgt.detail_md || "") + header + body;
        await env.PROJECT_HUB.prepare("UPDATE project_hub SET detail_md = ? WHERE id = ?").bind(newDetail, target_id).run();
        await env.PROJECT_HUB.prepare("UPDATE project_hub SET status = ? WHERE id = ?").bind("merged_into_" + target_id, source_id).run();
        return { ok: true, source: { id: source_id, name: src.project_name }, target: { id: target_id, name: tgt.project_name }, action: "merged" };
      } catch(e) {
        return { error: "merge_projects failed: " + e.message };
      }
    }
    if (name === "recall") {
      const { query = '', project = '', limit = 10 } = input || {};
      if (!query) return { error: "query required" };
      const lim = Math.min(parseInt(limit) || 10, 25);
      const q = '%' + String(query).toLowerCase() + '%';
      try {
        let sql, params;
        if (project) {
          sql = "SELECT key, value, project, version, created_at, 'memory_v2' AS src FROM memory_v2 WHERE is_current=1 AND project=? AND (LOWER(key) LIKE ? OR LOWER(value) LIKE ?) ORDER BY created_at DESC LIMIT ?";
          params = [project, q, q, lim];
        } else {
          sql = "SELECT key, value, project, version, created_at, 'memory_v2' AS src FROM memory_v2 WHERE is_current=1 AND (LOWER(key) LIKE ? OR LOWER(value) LIKE ?) ORDER BY created_at DESC LIMIT ?";
          params = [q, q, lim];
        }
        const r = await env.DB.prepare(sql).bind(...params).all();
        const results = (r.results || []).map(x => ({
          key: x.key, value: String(x.value || '').slice(0, 600), project: x.project,
          version: x.version, when: x.created_at ? new Date(x.created_at).toISOString().slice(0,10) : '', source: x.src
        }));
        // Also search project_hub notes / detail_md / concept_md if PROJECT_HUB binding present
        let projectHits = [];
        if (env.PROJECT_HUB) {
          try {
            const ph = await env.PROJECT_HUB.prepare(
              "SELECT project_name, status, next_action, notes, concept_md, detail_md FROM project_hub WHERE LOWER(project_name) LIKE ? OR LOWER(notes) LIKE ? OR LOWER(detail_md) LIKE ? OR LOWER(concept_md) LIKE ? LIMIT 5"
            ).bind(q, q, q, q).all();
            projectHits = (ph.results || []).map(p => ({
              project_name: p.project_name, status: p.status,
              snippet: ((p.notes || '') + ' ' + (p.detail_md || '') + ' ' + (p.concept_md || '')).slice(0, 400)
            }));
          } catch(e) {}
        }
        return { ok: true, query, count: results.length, memories: results, project_matches: projectHits };
      } catch(e) {
        return { error: "recall failed: " + e.message };
      }
    }
    if (name === "drive_create_file") {
      const { name: fname, type = "doc", parent, initial_text } = input || {};
      if (!fname) return { error: "name required" };
      const MIMES = {
        doc: "application/vnd.google-apps.document",
        sheet: "application/vnd.google-apps.spreadsheet",
        slides: "application/vnd.google-apps.presentation",
        folder: "application/vnd.google-apps.folder",
        text: "text/plain"
      };
      const mime = MIMES[type] || MIMES.doc;
      const access = await _agentFullAccessToken(env);
      const tryCreate = async (parentId) => {
        const meta = parentId ? { name: fname, mimeType: mime, parents: [parentId] } : { name: fname, mimeType: mime };
        const r = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id,name,mimeType,webViewLink", {
          method: "POST",
          headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
          body: JSON.stringify(meta)
        });
        return r;
      };
      const desiredParent = parent || ASGARD_DRIVE_FOLDER;
      let r = await tryCreate(desiredParent);
      // Auto-fallback to Drive root if the desired parent is missing or inaccessible
      if (!r.ok && (r.status === 404 || r.status === 403)) {
        r = await tryCreate(null);
      }
      if (!r.ok) return { error: "drive_create_file " + r.status, detail: (await r.text()).slice(0,400) };
      const data = await r.json();
      // Optionally append initial text for Docs
      if (type === "doc" && initial_text) {
        try {
          const req = { requests: [{ insertText: { location: { index: 1 }, text: initial_text } }] };
          await fetch(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(data.id)}:batchUpdate`, {
            method: "POST",
            headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
            body: JSON.stringify(req)
          });
        } catch(e) { /* swallow — file still created */ }
      }
      return { ok: true, ...data, type };
    }
    if (name === "sheets_write_values") {
      const { sheet_id, range, values } = input || {};
      if (!sheet_id || !range || !Array.isArray(values)) return { error: "sheet_id, range, values (2D array) required" };
      const access = await _agentFullAccessToken(env);
      const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheet_id)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
        body: JSON.stringify({ values })
      });
      if (!r.ok) return { error: "sheets_write_values " + r.status, detail: (await r.text()).slice(0,400) };
      const data = await r.json();
      return { ok: true, updated_cells: data.updatedCells || 0, updated_range: data.updatedRange };
    }
    if (name === "slides_batch_update") {
      const { presentation_id, requests } = input || {};
      if (!presentation_id || !Array.isArray(requests)) return { error: "presentation_id and requests (array) required" };
      const access = await _agentFullAccessToken(env);
      const r = await fetch(`https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentation_id)}:batchUpdate`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + access, "Content-Type": "application/json" },
        body: JSON.stringify({ requests })
      });
      if (!r.ok) return { error: "slides_batch_update " + r.status, detail: (await r.text()).slice(0,400) };
      const data = await r.json();
      return { ok: true, replies_count: (data.replies || []).length };
    }
    if (name === "read_messages") {
      const { group, limit = 20 } = input || {};
      if (!group) return { error: 'group required' };
      if (!env.DB) return { error: 'D1 not bound' };
      await _ensureMemoryTables(env);
      const g = await env.DB.prepare("SELECT * FROM msg_groups WHERE id = ? OR name = ?").bind(group, group).first();
      if (!g) return { error: 'group not found: ' + group };
      const rows = await env.DB.prepare("SELECT from_user, body, created_at FROM msg_inbox WHERE group_id = ? ORDER BY created_at DESC LIMIT ?").bind(g.id, limit).all();
      return { ok: true, group: g.name, messages: (rows.results||[]).reverse() };
    }
    return { error: "Unknown tool: " + name };
  } catch (e) {
    try { await _aiLogError(env, 'tool:' + name, e.message, JSON.stringify(input || {}).substring(0, 500)); } catch {}
    return { error: e.message };
  }
}

async function handleChatAgentic(request, env) {
  const body = await request.json().catch(() => ({}));
  const message = (body.message || "").toString();
  if (!message) return json({ ok: false, error: "message required" }, 400);
  const modelId = body.model || "gpt-4o-mini";
  const _agUid = body.uid || request.headers.get("X-User-Id") || "paddy";
  const _agPinUser = await identifyPin(request, env) || _agUid;
  env._pinUser = _agPinUser;
  const _agProject = body.project || "global";
  const _agMemCtx = await loadMemories(env, _agPinUser, _agProject);
  const system = body.system || (_agMemCtx ? SYSTEM_PROMPT + '\n\n--- Memory context ---\n' + _agMemCtx + '\n--- End memory ---' : SYSTEM_PROMPT);
  // Resolve model to provider + real model ID using MODELS map
  const _requestedModel = modelId;
  let _resolved = MODELS[modelId] || (
    modelId.startsWith("claude") ? { provider: "anthropic", id: modelId } :
    modelId.startsWith("gemini") ? { provider: "gemini", id: modelId } :
    modelId.startsWith("groq") ? { provider: "groq", id: modelId } :
    { provider: "openai", id: modelId }
  );
  // groq-fast (8B) doesn't have enough context for agentic tool loops — use groq-70B instead
  if (_resolved.provider === "groq" && _resolved.id === "llama-3.1-8b-instant") {
    _resolved = MODELS["groq"]; // llama-3.3-70b-versatile
  }
  const provider = _resolved.provider;
  const resolvedModelId = _resolved.id;
  const messagesIn = Array.isArray(body.messages) ? body.messages : [];
  let messages = [...messagesIn, { role: "user", content: message }];

  const MAX_ITER = 12;
  let iter = 0;
  const toolsExecuted = [];
  let usage = null;
  let finalText = "";

  if (provider === "openai") {
    if (!env.OPENAI_API_KEY) return json({ ok: false, error: "OPENAI_API_KEY missing" }, 502);
    const oaiMessages = [{ role: "system", content: system }, ...messages];
    while (iter < MAX_ITER) {
      iter++;
      const _isNewParam = /^(gpt-5|o1|o3|o4)/.test(String(modelId));
      const _oaiBody = { model: resolvedModelId, messages: oaiMessages, tools: AGENTIC_TOOLS_OPENAI };
      if (_isNewParam) _oaiBody.max_completion_tokens = 4096;
      else _oaiBody.max_tokens = 4096;
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
        body: JSON.stringify(_oaiBody)
      });
      if (!r.ok) return json({ ok: false, error: "openai " + r.status + ": " + (await r.text()).slice(0, 300) }, 502);
      const d = await r.json();
      usage = d.usage || usage;
      const choice = d.choices && d.choices[0];
      if (!choice) return json({ ok: false, error: "no choice in OpenAI response" }, 502);
      const msg = choice.message || {};
      if (choice.finish_reason !== "tool_calls" || !msg.tool_calls || !msg.tool_calls.length) {
        finalText = msg.content || "";
        break;
      }
      // Append assistant message with tool_calls to history
      oaiMessages.push({ role: "assistant", content: msg.content || null, tool_calls: msg.tool_calls });
      for (const tc of msg.tool_calls) {
        let args = {};
        try { args = JSON.parse(tc.function.arguments || "{}"); } catch (e) { args = { _parse_error: e.message }; }
        const result = await agenticExecuteTool(tc.function.name, args, env);
        toolsExecuted.push({ tool: tc.function.name, input: args, result });
        oaiMessages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result).substring(0, 8000) });
      }
    }
  } else if (provider === "gemini") {
    if (!env.GEMINI_API_KEY) return json({ ok: false, error: "GEMINI_API_KEY missing" }, 502);
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }]
    }));
    while (iter < MAX_ITER) {
      iter++;
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(resolvedModelId) + ":generateContent?key=" + env.GEMINI_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          tools: AGENTIC_TOOLS_GEMINI,
          systemInstruction: { parts: [{ text: system }] },
          generationConfig: { maxOutputTokens: 4096 }
        })
      });
      if (!r.ok) return json({ ok: false, error: "gemini " + r.status + ": " + (await r.text()).slice(0, 300) }, 502);
      const d = await r.json();
      usage = d.usageMetadata || usage;
      const cand = d.candidates && d.candidates[0];
      const parts = (cand && cand.content && cand.content.parts) || [];
      const fnCalls = parts.filter(p => p.functionCall);
      if (!fnCalls.length) {
        finalText = parts.map(p => p.text).filter(Boolean).join("");
        break;
      }
      contents.push({ role: "model", parts });
      const responseParts = [];
      for (const p of fnCalls) {
        const fc = p.functionCall;
        const result = await agenticExecuteTool(fc.name, fc.args || {}, env);
        toolsExecuted.push({ tool: fc.name, input: fc.args, result });
        responseParts.push({ functionResponse: { name: fc.name, response: { result } } });
      }
      contents.push({ role: "user", parts: responseParts });
    }
  } else if (provider === "anthropic") {
    const ak = env.ANTHROPIC_API_KEY;
    if (!ak) return json({ ok: false, error: "ANTHROPIC_API_KEY missing on asgard-ai" }, 502);
    // Anthropic-shape tools converted from OpenAI-shape
    const anthropicTools = AGENTIC_TOOLS_OPENAI.map(function(t){
      return { name: t.function.name, description: t.function.description, input_schema: t.function.parameters };
    });
    const claudeReq = { model: resolvedModelId, max_tokens: 8192, system, messages, tools: anthropicTools };
    while (iter < MAX_ITER) {
      iter++;
      // v6.14: retry on transient upstream errors (524, 529, 502, 503, 504) with exponential backoff
      let r = null, attemptErr = '';
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          r = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": ak, "anthropic-version": "2023-06-01" },
            body: JSON.stringify(attempt > 0 ? { ...claudeReq, max_tokens: Math.max(2048, Math.floor(claudeReq.max_tokens / 2)) } : claudeReq),
            signal: AbortSignal.timeout(70000)
          });
          if (r.ok) break;
          if (![524, 529, 502, 503, 504].includes(r.status)) break;
          attemptErr = "anthropic " + r.status + " (attempt " + (attempt+1) + ")";
          await new Promise(res => setTimeout(res, 800 * (attempt + 1)));
        } catch (e) {
          attemptErr = "fetch error: " + (e.name || e.message || String(e)) + " (attempt " + (attempt+1) + ")";
          await new Promise(res => setTimeout(res, 800 * (attempt + 1)));
        }
      }
      if (!r || !r.ok) return json({ ok: false, error: attemptErr + (r ? ": " + (await r.text().catch(()=>'')).slice(0, 200) : '') }, 502);
      const d = await r.json();
      usage = d.usage || usage;
      if (d.stop_reason !== "tool_use") {
        const txt = (d.content || []).find(function(b){ return b.type === "text"; });
        finalText = txt ? txt.text : "";
        break;
      }
      const toolResults = [];
      for (const block of (d.content || [])) {
        if (block.type !== "tool_use") continue;
        const result = await agenticExecuteTool(block.name, block.input, env);
        toolsExecuted.push({ tool: block.name, input: block.input, result });
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result).substring(0, 8000) });
      }
      claudeReq.messages = [...claudeReq.messages, { role: "assistant", content: d.content }, { role: "user", content: toolResults }];
    }
  } else if (provider === "groq") {
    if (!env.GROQ_API_KEY) return json({ ok: false, error: "GROQ_API_KEY missing" }, 502);
    // Groq is OpenAI-compatible — same request format, different base URL + model IDs
    const groqMessages = [{ role: "system", content: system }, ...messages];
    while (iter < MAX_ITER) {
      iter++;
      // Groq: use a condensed tool set to fit context windows, and force tool_choice:auto
      const GROQ_TOOLS = AGENTIC_TOOLS_OPENAI.filter(t =>
        ["get_worker_code","deploy_worker","github_get_file","github_write_file",
         "http_request","get_secret","drive_search","drive_read","send_email"].includes(t.function.name)
      );
      const _groqBody = {
        model: resolvedModelId,
        messages: groqMessages,
        tools: GROQ_TOOLS,
        tool_choice: "auto",
        max_tokens: 2048,
      };
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.GROQ_API_KEY },
        body: JSON.stringify(_groqBody)
      });
      if (!r.ok) return json({ ok: false, error: "groq " + r.status + ": " + (await r.text()).slice(0, 300) }, 502);
      const d = await r.json();
      usage = d.usage || usage;
      const choice = d.choices && d.choices[0];
      if (!choice) return json({ ok: false, error: "no choice in Groq response" }, 502);
      const msg = choice.message || {};
      if (choice.finish_reason !== "tool_calls" || !msg.tool_calls || !msg.tool_calls.length) {
        finalText = msg.content || "";
        break;
      }
      groqMessages.push({ role: "assistant", content: msg.content || null, tool_calls: msg.tool_calls });
      for (const tc of msg.tool_calls) {
        let args = {};
        try { args = JSON.parse(tc.function.arguments || "{}"); } catch (e) { args = { _parse_error: e.message }; }
        const result = await agenticExecuteTool(tc.function.name, args, env);
        toolsExecuted.push({ tool: tc.function.name, input: args, result });
        groqMessages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result).substring(0, 8000) });
      }
    }
  } else {
    return json({ ok: false, error: "Unknown provider for model: " + modelId }, 400);
  }

  // Log agentic spend (fire-and-forget)
  if (usage && env.DB) {
    try {
      const _p = ((usage.prompt_tokens||usage.input_tokens||usage.promptTokenCount||0)|0);
      const _c = ((usage.completion_tokens||usage.output_tokens||usage.candidatesTokenCount||0)|0);
      const _cost = typeof computeTokenCost === "function" ? computeTokenCost(resolvedModelId, _p, _c) : 0;
      bgLog(env, {
        provider, model: resolvedModelId, endpoint: "chat/agentic",
        prompt_tokens: _p, completion_tokens: _c,
        cost_usd: _cost, uid: _agUid,
      }).catch(() => {});
    } catch(e) { /* spend logging failure should not crash agentic */ }
  }
  return json({
    ok: true,
    reply: finalText,
    response: finalText,
    text: finalText, content: finalText, message: finalText,
    provider, model: resolvedModelId, model_key: modelId,
    iterations: iter,
    tools_executed: toolsExecuted.map(t => t.tool),
    tool_results: toolsExecuted,
    usage
  });
}


// =====================================================================
// /bridge/* — Chrome extension queue, D1-backed.
// asgard-ai (chrome_* tools) writes commands; the extension polls and writes results back.
// =====================================================================
async function _bridgeEnsure(env) {
  if (!env.DB) throw new Error("D1 DB not bound on asgard-ai");
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS chrome_bridge (id TEXT PRIMARY KEY, uid TEXT, status TEXT, command TEXT, result TEXT, enqueued_at INTEGER, claimed_at INTEGER, finished_at INTEGER)").run();
}

async function handleBridgeEnqueue(request, env) {
  if (!env.DB) return json({ ok: false, error: "D1 DB not bound" }, 500);
  await _bridgeEnsure(env);
  const body = await request.json().catch(() => ({}));
  const uid = body.uid || "paddy";
  const id = "cmd_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  await env.DB.prepare(
    "INSERT INTO chrome_bridge (id, uid, status, command, enqueued_at) VALUES (?, ?, 'pending', ?, ?)"
  ).bind(id, uid, JSON.stringify(body.command || {}), Date.now()).run();
  return json({ ok: true, id, uid });
}

async function handleBridgePoll(request, env) {
  if (!env.DB) return json({ ok: false, error: "D1 DB not bound" }, 500);
  await _bridgeEnsure(env);
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid") || "paddy";
  // Atomically claim oldest pending
  const row = await env.DB.prepare(
    "SELECT id, command, enqueued_at FROM chrome_bridge WHERE uid = ? AND status = 'pending' ORDER BY enqueued_at ASC LIMIT 1"
  ).bind(uid).first();
  if (!row) return json({ ok: true, idle: true });
  await env.DB.prepare("UPDATE chrome_bridge SET status = 'in_flight', claimed_at = ? WHERE id = ?").bind(Date.now(), row.id).run();
  let cmd = {};
  try { cmd = JSON.parse(row.command); } catch (e) {}
  return json({ ok: true, idle: false, id: row.id, command: cmd });
}

async function handleBridgeResult(request, env) {
  if (!env.DB) return json({ ok: false, error: "D1 DB not bound" }, 500);
  await _bridgeEnsure(env);
  const body = await request.json().catch(() => ({}));
  if (!body.id) return json({ ok: false, error: "id required" }, 400);
  await env.DB.prepare(
    "UPDATE chrome_bridge SET status = 'done', result = ?, finished_at = ? WHERE id = ?"
  ).bind(JSON.stringify(body.result || {}), Date.now(), body.id).run();
  return json({ ok: true, id: body.id });
}

async function handleBridgeGetResult(request, env) {
  if (!env.DB) return json({ ok: false, error: "D1 DB not bound" }, 500);
  await _bridgeEnsure(env);
  const url = new URL(request.url);
  const id = url.pathname.replace("/bridge/result/", "");
  const row = await env.DB.prepare("SELECT id, status, result, enqueued_at, claimed_at, finished_at FROM chrome_bridge WHERE id = ?").bind(id).first();
  if (!row) return json({ ok: false, error: "not found" }, 404);
  let result = null;
  if (row.result) { try { result = JSON.parse(row.result); } catch (e) {} }
  return json({ ok: true, id, status: row.status, result, enqueued_at: row.enqueued_at, claimed_at: row.claimed_at, finished_at: row.finished_at });
}

// Helper: enqueue + poll for result (called by chrome_* tools)
async function bridgeRunCommand(env, command, uidArg, timeoutMs) {
  await _bridgeEnsure(env);
  const uid = uidArg || "paddy";
  const id = "cmd_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  await env.DB.prepare(
    "INSERT INTO chrome_bridge (id, uid, status, command, enqueued_at) VALUES (?, ?, 'pending', ?, ?)"
  ).bind(id, uid, JSON.stringify(command), Date.now()).run();
  const deadline = Date.now() + (timeoutMs || 30000);
  while (Date.now() < deadline) {
    const row = await env.DB.prepare("SELECT status, result FROM chrome_bridge WHERE id = ?").bind(id).first();
    if (row && row.status === "done") {
      let r = null; try { r = JSON.parse(row.result); } catch (e) {}
      return { ok: true, id, result: r };
    }
    await new Promise(res => setTimeout(res, 800));
  }
  return { ok: false, id, error: "Chrome bridge timeout — extension didn't respond. Is the Asgard Chrome extension installed and running?" };
}

export default {
  async fetch(request, env, ctx) {
    if (ctx) env.__ctx = ctx;
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") { const reqOrigin = request.headers.get("Origin") || ""; return new Response(null, { status: 204, headers: makeCors(reqOrigin) }); }
    try {
      if (path === "/admin/deploy" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.CF_API_TOKEN_FULLOPS) return err("CF_API_TOKEN_FULLOPS not bound", 500);
        if (!env.CF_ACCOUNT_ID) return err("CF_ACCOUNT_ID not bound", 500);
        const body = await request.json().catch(() => ({}));
        const { worker_name, code, compatibility_date, dry_run } = body;
        if (!worker_name) return err("worker_name required", 400);
        if (!code) return err("code required (the new worker source)", 400);
        if (worker_name === "asgard-ai") return err("refusing to self-deploy via /admin/deploy \u2014 use a separate session for asgard-ai changes", 400);
        const accountId = env.CF_ACCOUNT_ID;
        // Step 1: fetch current settings to get existing bindings
        // PATCH 2026-05-13: /settings is missing newer binding types (vectorize/ai/d1 sometimes).
        // Use /versions/{latest_id} which returns the FULL resources.bindings.
        const versionsListResp = await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/workers/scripts/" + worker_name + "/versions",
          { headers: { "Authorization": "Bearer " + env.CF_API_TOKEN_FULLOPS } }
        );
        if (!versionsListResp.ok) {
          const t = await versionsListResp.text();
          return err("versions list failed (" + versionsListResp.status + "): " + t.slice(0, 300), 502);
        }
        const versionsListJson = await versionsListResp.json();
        const items = (versionsListJson.result && versionsListJson.result.items) || [];
        if (!items.length) return err("no versions found for " + worker_name, 502);
        const latestVersionId = items[0].id;
        const versionResp = await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/workers/scripts/" + worker_name + "/versions/" + latestVersionId,
          { headers: { "Authorization": "Bearer " + env.CF_API_TOKEN_FULLOPS } }
        );
        if (!versionResp.ok) {
          const t = await versionResp.text();
          return err("version detail fetch failed (" + versionResp.status + "): " + t.slice(0, 300), 502);
        }
        const versionJson = await versionResp.json();
        const versionResources = (versionJson.result && versionJson.result.resources) || {};
        const existing = versionResources.bindings || [];
        // Also pick up compatibility settings from version metadata
        const versionCompat = (versionJson.result && versionJson.result.metadata && versionJson.result.metadata.compatibility_date) || null;
        const versionCompatFlags = (versionJson.result && versionJson.result.metadata && versionJson.result.metadata.compatibility_flags) || null;
        // Step 2: convert to inherit-style metadata
        const inheritBindings = existing.map(b => {
          if (b.type === "secret_text") return { name: b.name, type: "inherit", old_name: b.name };
          if (b.type === "d1") return { name: b.name, type: "d1", id: b.database_id };
          if (b.type === "kv_namespace") return { name: b.name, type: "kv_namespace", namespace_id: b.namespace_id };
          if (b.type === "plain_text") return { name: b.name, type: "plain_text", text: b.text };
          if (b.type === "durable_object_namespace") return { name: b.name, type: "durable_object_namespace", class_name: b.class_name, script_name: b.script_name };
          if (b.type === "service") return { name: b.name, type: "service", service: b.service, environment: b.environment || "production" };
          if (b.type === "queue") return { name: b.name, type: "queue", queue_name: b.queue_name };
          if (b.type === "r2_bucket") return { name: b.name, type: "r2_bucket", bucket_name: b.bucket_name };
          if (b.type === "ai") return { name: b.name, type: "ai" };
          if (b.type === "vectorize") return { name: b.name, type: "vectorize", index_name: b.index_name };
          // Fallback \u2014 try inherit by name for anything else (mostly secrets)
          return { name: b.name, type: "inherit", old_name: b.name };
        });
        const metadata = {
          main_module: "index.js",
          compatibility_date: compatibility_date || versionCompat || "2025-04-01",
          compatibility_flags: versionCompatFlags || [],
          bindings: inheritBindings,
        };
        if (dry_run) {
          return json({ ok: true, dry_run: true, worker_name, bindings_count: inheritBindings.length, metadata, code_length: code.length });
        }
        // Step 3: build multipart body manually \u2014 the filename in the part MUST be "index.js"
        const _hex = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => b.toString(16).padStart(2,"0")).join("");
        const bnd = "----asgardai" + _hex(16);
        const enc = new TextEncoder();
        const parts = [];
        parts.push(enc.encode("--" + bnd + "\r\n"));
        parts.push(enc.encode('Content-Disposition: form-data; name="metadata"; filename="metadata.json"\r\nContent-Type: application/json\r\n\r\n'));
        parts.push(enc.encode(JSON.stringify(metadata)));
        parts.push(enc.encode("\r\n--" + bnd + "\r\n"));
        parts.push(enc.encode('Content-Disposition: form-data; name="index.js"; filename="index.js"\r\nContent-Type: application/javascript+module\r\n\r\n'));
        parts.push(enc.encode(code));
        parts.push(enc.encode("\r\n--" + bnd + "--\r\n"));
        const totalLen = parts.reduce((s, p) => s + p.byteLength, 0);
        const buf = new Uint8Array(totalLen);
        let off = 0;
        for (const p of parts) { buf.set(p, off); off += p.byteLength; }
        const deployResp = await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/workers/scripts/" + worker_name,
          {
            method: "PUT",
            headers: {
              "Authorization": "Bearer " + env.CF_API_TOKEN_FULLOPS,
              "Content-Type": "multipart/form-data; boundary=" + bnd,
            },
            body: buf,
          }
        );
        const respText = await deployResp.text();
        let respJson;
        try { respJson = JSON.parse(respText); } catch { respJson = { raw: respText.slice(0, 500) }; }
        if (!deployResp.ok) {
          return json({ ok: false, status: deployResp.status, worker_name, response: respJson });
        }
        return json({
          ok: true,
          worker_name,
          bindings_count: inheritBindings.length,
          deployment_id: respJson.result && respJson.result.deployment_id,
          modified_on: respJson.result && respJson.result.modified_on,
          startup_time_ms: respJson.result && respJson.result.startup_time_ms,
        });
      }
      if (path === "/admin/worker-source" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.CF_API_TOKEN_FULLOPS) return err("CF_API_TOKEN_FULLOPS not bound", 500);
        const u = new URL(request.url);
        const worker_name = u.searchParams.get("name");
        if (!worker_name) return err("?name= required", 400);
        const accountId = env.CF_ACCOUNT_ID;
        const r = await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/workers/scripts/" + worker_name,
          { headers: { "Authorization": "Bearer " + env.CF_API_TOKEN_FULLOPS } }
        );
        if (!r.ok) return err("fetch failed " + r.status, 502);
        const text = await r.text();
        // Extract JS module from multipart — try index.js then worker.js then first .js module
        const firstNL = text.indexOf("\r\n");
        const boundaryStr = text.slice(0, firstNL).replace(/^--/, "");
        let codeBlock = null;
        let foundModule = null;
        for (const modName of ["index.js", "worker.js"]) {
          const mk = 'name="' + modName + '"\r\n\r\n';
          const si = text.indexOf(mk);
          if (si !== -1) {
            const cs = si + mk.length;
            const ei = text.indexOf("\r\n--" + boundaryStr, cs);
            codeBlock = text.slice(cs, ei === -1 ? undefined : ei);
            foundModule = modName;
            break;
          }
        }
        // Fallback: first form-data part with .js extension
        if (!codeBlock) {
          const jsMatch = text.match(/name="([^"]+\.js)"\r\n\r\n/);
          if (jsMatch) {
            const mk = jsMatch[0];
            const si = text.indexOf(mk);
            const cs = si + mk.length;
            const ei = text.indexOf("\r\n--" + boundaryStr, cs);
            codeBlock = text.slice(cs, ei === -1 ? undefined : ei);
            foundModule = jsMatch[1];
          }
        }
        if (!codeBlock) return json({ ok: false, error: "could not find JS module in multipart", raw_head: text.slice(0, 300) });
        return json({ ok: true, worker_name, module: foundModule, code_length: codeBlock.length, code: codeBlock });
      }
      if (path === "/admin/worker-settings" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.CF_API_TOKEN_FULLOPS) return err("CF_API_TOKEN_FULLOPS not bound", 500);
        const u = new URL(request.url);
        const worker_name = u.searchParams.get("name");
        if (!worker_name) return err("?name= required", 400);
        const accountId = env.CF_ACCOUNT_ID;
        const r = await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/workers/scripts/" + worker_name + "/settings",
          { headers: { "Authorization": "Bearer " + env.CF_API_TOKEN_FULLOPS } }
        );
        const text = await r.text();
        let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 400) }; }
        if (!r.ok) return json({ ok: false, status: r.status, data });
        return json({ ok: true, worker_name, settings: data.result });
      }

      // ===== CF management helpers (PATCH 2026-05-13) =====
      // cf() — minimal CF API wrapper used by /admin routes below
      const _cf = async (url, token, opts = {}) => {
        const headers = { "Authorization": "Bearer " + token, ...(opts.headers || {}) };
        if (opts.body && typeof opts.body === "object" && !(opts.body instanceof Uint8Array)) {
          headers["Content-Type"] = "application/json";
          opts = { ...opts, body: JSON.stringify(opts.body) };
        }
        const r = await fetch("https://api.cloudflare.com/client/v4" + url, { ...opts, headers });
        const text = await r.text();
        let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 400) }; }
        return { ok: r.ok, status: r.status, data };
      };
      const _accountId = env.CF_ACCOUNT_ID;
      const _fullops = env.CF_API_TOKEN_FULLOPS;
      const _general = env.CF_API_TOKEN; // has R2 scope
      const _ldZone = "ca610439808e918e36072fb3f66d9640"; // luckdragon.io zone

      // ===== D1 management =====
      if (path === "/admin/d1/list" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const r = await _cf("/accounts/" + _accountId + "/d1/database?per_page=100", _fullops);
        if (!r.ok) return json({ ok: false, status: r.status, data: r.data });
        return json({ ok: true, databases: r.data.result });
      }
      if (path === "/admin/d1/query" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const { database_id, sql, params } = body;
        if (!database_id || !sql) return err("database_id and sql required", 400);
        const r = await _cf("/accounts/" + _accountId + "/d1/database/" + database_id + "/query",
          _fullops, { method: "POST", body: { sql, params: params || [] } });
        return json({ ok: r.ok, status: r.status, data: r.data });
      }
      if (path === "/admin/d1/create" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const { name } = body;
        if (!name) return err("name required", 400);
        const r = await _cf("/accounts/" + _accountId + "/d1/database",
          _fullops, { method: "POST", body: { name } });
        return json({ ok: r.ok, status: r.status, data: r.data });
      }

      // ===== KV management =====
      if (path === "/admin/kv/namespaces" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const r = await _cf("/accounts/" + _accountId + "/storage/kv/namespaces?per_page=100", _fullops);
        if (!r.ok) return json({ ok: false, status: r.status, data: r.data });
        return json({ ok: true, namespaces: r.data.result });
      }
      if (path === "/admin/kv/create" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const { title } = body;
        if (!title) return err("title required", 400);
        const r = await _cf("/accounts/" + _accountId + "/storage/kv/namespaces",
          _fullops, { method: "POST", body: { title } });
        return json({ ok: r.ok, status: r.status, data: r.data });
      }
      if (path === "/admin/kv/get" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const u = new URL(request.url);
        const ns = u.searchParams.get("namespace_id");
        const k = u.searchParams.get("key");
        if (!ns || !k) return err("?namespace_id= and ?key= required", 400);
        const r = await fetch("https://api.cloudflare.com/client/v4/accounts/" + _accountId + "/storage/kv/namespaces/" + ns + "/values/" + encodeURIComponent(k),
          { headers: { "Authorization": "Bearer " + _fullops } });
        const text = await r.text();
        return json({ ok: r.ok, status: r.status, value: text });
      }
      if (path === "/admin/kv/put" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const { namespace_id, key, value } = body;
        if (!namespace_id || !key || value === undefined) return err("namespace_id, key, value required", 400);
        const r = await fetch("https://api.cloudflare.com/client/v4/accounts/" + _accountId + "/storage/kv/namespaces/" + namespace_id + "/values/" + encodeURIComponent(key),
          { method: "PUT", headers: { "Authorization": "Bearer " + _fullops, "Content-Type": "text/plain" }, body: String(value) });
        const text = await r.text();
        let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 200) }; }
        return json({ ok: r.ok, status: r.status, data });
      }
      if (path === "/admin/kv/list-keys" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const u = new URL(request.url);
        const ns = u.searchParams.get("namespace_id");
        const prefix = u.searchParams.get("prefix") || "";
        if (!ns) return err("?namespace_id= required", 400);
        const r = await _cf("/accounts/" + _accountId + "/storage/kv/namespaces/" + ns + "/keys?prefix=" + encodeURIComponent(prefix) + "&limit=1000", _fullops);
        return json({ ok: r.ok, status: r.status, keys: (r.data.result || []).map(k => k.name) });
      }

      // ===== Pages =====
      if (path === "/admin/pages/projects" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const r = await _cf("/accounts/" + _accountId + "/pages/projects?per_page=100", _fullops);
        if (!r.ok) return json({ ok: false, status: r.status, data: r.data });
        const projects = (r.data.result || []).map(p => ({
          name: p.name, subdomain: p.subdomain, domains: p.domains,
          production_branch: p.production_branch,
          latest_deployment: p.latest_deployment && {
            id: p.latest_deployment.id,
            url: p.latest_deployment.url,
            created_on: p.latest_deployment.created_on,
            stage: p.latest_deployment.latest_stage && p.latest_deployment.latest_stage.status,
          },
        }));
        return json({ ok: true, projects });
      }
      if (path === "/admin/pages/deployments" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const u = new URL(request.url);
        const name = u.searchParams.get("name");
        if (!name) return err("?name= required", 400);
        const r = await _cf("/accounts/" + _accountId + "/pages/projects/" + name + "/deployments?per_page=10", _fullops);
        return json({ ok: r.ok, status: r.status, deployments: (r.data.result || []).map(d => ({
          id: d.id, url: d.url, created_on: d.created_on,
          stage: d.latest_stage && d.latest_stage.status,
        })) });
      }
      if (path === "/admin/pages/retry" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const { project, deployment_id } = body;
        if (!project || !deployment_id) return err("project and deployment_id required", 400);
        const r = await _cf("/accounts/" + _accountId + "/pages/projects/" + project + "/deployments/" + deployment_id + "/retry",
          _fullops, { method: "POST" });
        return json({ ok: r.ok, status: r.status, data: r.data });
      }

      // ===== R2 (uses CF_API_TOKEN) =====
      if (path === "/admin/r2/buckets" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!_general) return err("CF_API_TOKEN not bound (needed for R2)", 500);
        const r = await _cf("/accounts/" + _accountId + "/r2/buckets", _general);
        return json({ ok: r.ok, status: r.status, buckets: (r.data.result && r.data.result.buckets) || [] });
      }
      if (path === "/admin/r2/create" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!_general) return err("CF_API_TOKEN not bound (needed for R2)", 500);
        const body = await request.json().catch(() => ({}));
        const { name } = body;
        if (!name) return err("name required", 400);
        const r = await _cf("/accounts/" + _accountId + "/r2/buckets",
          _general, { method: "POST", body: { name } });
        return json({ ok: r.ok, status: r.status, data: r.data });
      }

      // ===== Queues =====
      if (path === "/admin/queues" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const r = await _cf("/accounts/" + _accountId + "/queues?per_page=100", _fullops);
        return json({ ok: r.ok, status: r.status, queues: r.data.result || [] });
      }

      // ===== Workers fleet =====
      if (path === "/admin/workers/list" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const r = await _cf("/accounts/" + _accountId + "/workers/services?per_page=200", _fullops);
        const services = (r.data.result || []).map(s => ({
          id: s.id, default_environment: s.default_environment && s.default_environment.environment,
          created_on: s.created_on, modified_on: s.modified_on,
        }));
        return json({ ok: r.ok, status: r.status, count: services.length, services });
      }
      if (path === "/admin/workers/health-roll-call" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        // list all workers, then HEAD/GET each .workers.dev or known custom domain
        const sub = await _cf("/accounts/" + _accountId + "/workers/subdomain", _fullops);
        const subdomain = sub.data.result && sub.data.result.subdomain;
        const ws = await _cf("/accounts/" + _accountId + "/workers/services?per_page=200", _fullops);
        const services = (ws.data.result || []).map(s => s.id);
        const results = await Promise.all(services.slice(0, 50).map(async (name) => {
          const url = "https://" + name + "." + subdomain + ".workers.dev/health";
          try {
            const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
            const text = await r.text().catch(() => "");
            let parsed = null;
            try { parsed = JSON.parse(text); } catch {}
            return { name, status: r.status, ok: r.ok, version: parsed && parsed.version, health: parsed };
          } catch (e) { return { name, error: String(e).slice(0, 80) }; }
        }));
        return json({ ok: true, subdomain, total: services.length, sampled: results.length, results });
      }

      // ===== GitHub (uses GITHUB_TOKEN or GH_ADMIN_TOKEN) =====
      if (path === "/admin/github/commit" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const ghTok = env.GH_ADMIN_TOKEN || env.GITHUB_TOKEN;
        if (!ghTok) return err("no GitHub token bound", 500);
        const body = await request.json().catch(() => ({}));
        const { owner, repo, path: filePath, content, message, branch } = body;
        if (!owner || !repo || !filePath || !content) return err("owner, repo, path, content required", 400);
        const apiBase = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + filePath;
        const ghHeaders = { "Authorization": "Bearer " + ghTok, "Accept": "application/vnd.github+json", "User-Agent": "asgard-ai" };
        // Get current sha if file exists
        let sha = undefined;
        try {
          const cur = await fetch(apiBase + (branch ? "?ref=" + branch : ""), { headers: ghHeaders });
          if (cur.ok) { const j = await cur.json(); sha = j.sha; }
        } catch {}
        // Encode content as base64
        let b64Content;
        try {
          const bytes = new TextEncoder().encode(content);
          let bin = ""; for (const b of bytes) bin += String.fromCharCode(b);
          b64Content = btoa(bin);
        } catch (e) { return err("base64 encode failed: " + String(e).slice(0,100), 500); }
        const putBody = { message: message || "Update " + filePath, content: b64Content, ...(branch ? { branch } : {}), ...(sha ? { sha } : {}) };
        const r = await fetch(apiBase, { method: "PUT", headers: { ...ghHeaders, "Content-Type": "application/json" }, body: JSON.stringify(putBody) });
        const t = await r.text(); let d; try { d = JSON.parse(t); } catch { d = { raw: t.slice(0,400) }; }
        return json({ ok: r.ok, status: r.status, commit: d.commit && { sha: d.commit.sha, url: d.commit.html_url }, error: !r.ok ? d.message : null });
      }
      if (path === "/admin/github/read" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const ghTok = env.GH_ADMIN_TOKEN || env.GITHUB_TOKEN;
        if (!ghTok) return err("no GitHub token bound", 500);
        const u = new URL(request.url);
        const owner = u.searchParams.get("owner");
        const repo = u.searchParams.get("repo");
        const filePath = u.searchParams.get("path");
        const branch = u.searchParams.get("branch");
        if (!owner || !repo || !filePath) return err("?owner=&repo=&path= required", 400);
        const r = await fetch("https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + filePath + (branch ? "?ref=" + branch : ""),
          { headers: { "Authorization": "Bearer " + ghTok, "Accept": "application/vnd.github+json", "User-Agent": "asgard-ai" } });
        if (!r.ok) return json({ ok: false, status: r.status });
        const j = await r.json();
        let content = "";
        try {
          const bin = atob(j.content.replace(/\n/g, ""));
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          content = new TextDecoder().decode(bytes);
        } catch (e) {}
        return json({ ok: true, path: j.path, sha: j.sha, size: j.size, content });
      }

      // ===== Admin: capabilities map =====
      if (path === "/admin/capabilities" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const cap = {};
        const probes = [
          ["d1",        "/accounts/" + _accountId + "/d1/database?per_page=1",                _fullops],
          ["kv",        "/accounts/" + _accountId + "/storage/kv/namespaces?per_page=1",      _fullops],
          ["queues",    "/accounts/" + _accountId + "/queues?per_page=1",                     _fullops],
          ["pages",     "/accounts/" + _accountId + "/pages/projects?per_page=1",             _fullops],
          ["workers",   "/accounts/" + _accountId + "/workers/services?per_page=1",           _fullops],
          ["r2",        "/accounts/" + _accountId + "/r2/buckets",                            _general],
          ["vectorize", "/accounts/" + _accountId + "/vectorize/v2/indexes",                  _fullops],
          ["dns_ld",    "/zones/" + _ldZone + "/dns_records?per_page=1",                      _fullops],
        ];
        for (const [name, url, tok] of probes) {
          if (!tok) { cap[name] = { available: false, reason: "no token bound" }; continue; }
          const r = await _cf(url, tok);
          cap[name] = { available: r.ok, status: r.status };
        }
        return json({ ok: true, account_id: _accountId, capabilities: cap });
      }


      // ===== Direct Vectorize via binding (PATCH 2026-05-13) =====
      if (path === "/admin/vectorize/describe" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.MEMORY_VEC) return err("MEMORY_VEC binding not set (need to deploy with vectorize binding for falkor-memory)", 500);
        const desc = await env.MEMORY_VEC.describe();
        return json({ ok: true, index: desc });
      }
      if (path === "/admin/vectorize/query" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.MEMORY_VEC) return err("MEMORY_VEC binding not set", 500);
        const body = await request.json().catch(() => ({}));
        const { text, topK } = body;
        if (!text) return err("text required", 400);
        // Embed via Workers AI first
        if (!env.AI) return err("AI binding not set", 500);
        const embed = await env.AI.run("@cf/baai/bge-small-en-v1.5", { text: [text] });
        const vec = embed.data && embed.data[0];
        if (!vec) return err("embed failed", 500);
        const results = await env.MEMORY_VEC.query(vec, { topK: topK || 5, returnMetadata: true });
        return json({ ok: true, matches: results.matches });
      }

      // ===== Direct project-hub D1 via binding =====
      if (path === "/admin/projects/list" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.PROJECT_HUB) return err("PROJECT_HUB D1 binding not set", 500);
        const rs = await env.PROJECT_HUB.prepare(
          "SELECT id, project_name, category, status, progress_pct, live_url, last_updated, next_action, tech_stack, description, notes, domains, revenue_y1, revenue_y2, revenue_y3, income_priority, key_features, cost_monthly, detail_md, github_url, cloudflare_worker, cf_zone, concept_md, revenue_actual FROM project_hub ORDER BY income_priority ASC, sort_order ASC, id"
        ).all();
        return json({ ok: true, count: rs.results.length, projects: rs.results });
      }
      // Migrate-from-Claude — paste in a transcript, extract structured memory
      if (path === "/admin/migrate-chat" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const transcript = (body.transcript || "").toString();
        const defaultProject = body.default_project || "global";
        const dryRun = !!body.dry_run;
        if (!transcript || transcript.length < 50) return err("transcript required (min 50 chars)", 400);
        if (transcript.length > 200000) return err("transcript too large (max 200k chars)", 400);
        // Ask Haiku to extract structured info
        const extractPrompt = `You are extracting structured information from a CONTENT BLOB (could be a chat, a spec, notes, a doc, a project plan, anything) so it can be saved into Paddy's Asgard knowledge base. Read whatever's there and pull out the durable signal.

Read the content below and return a JSON object with these arrays:
- "facts": durable facts about Paddy / his projects / his world. Each: { project: slug-or-global, key: short-slug, value: "1-2 sentences", category: "preference"|"identity"|"decision"|"technical"|"family"|"work"|"misc" }
- "decisions": specific decisions made. Each: { project: slug, event: short-slug, summary: "1-2 sentences" }
- "state_updates": where each project is up to. Each: { project: slug, next_action: "1 sentence what's next", notes: "current state" }
- "concepts": high-level vision / plan. Each: { project: slug, concept_md: "1-3 paragraphs in markdown" }
- "rules": durable rules / playbooks ("always commit to GH first", "default model is Haiku"). Each: { project: slug-or-global, key: short-slug, value: "the rule, 1 sentence" }
- "links": URLs that matter (live URLs, dashboards, docs, references). Each: { project: slug-or-global, label: short, url: "https://..." }
- "repos": GitHub or other repo references. Each: { project: slug, repo_url: "https://github.com/...", notes: "what's there" }

Project slugs (use exact strings): asgard-final-build, falkor-chat-pwa, kbt, sportcarnival, save-my-seat, school-sport-portal, lessonlab, super-league, family-footy-tipping, personal-finance, my-betting-hq, long-range-tipping, horse-race-tipping, ideas, global (for facts not project-specific).

Return ONLY valid JSON. No prose. No code fences. Just {...}.

TRANSCRIPT:
${transcript.slice(0, 100000)}`;

        const llmRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 8192,
            messages: [{ role: "user", content: extractPrompt }]
          })
        });
        if (!llmRes.ok) {
          const t = await llmRes.text();
          return err("extract LLM call failed " + llmRes.status + ": " + t.slice(0,300), 502);
        }
        const llmData = await llmRes.json();
        const text = ((llmData.content || [{}])[0] || {}).text || "";
        // Strip code fences if any
        let jsonStr = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
        // Find first { ... last }
        const a = jsonStr.indexOf("{"), z = jsonStr.lastIndexOf("}");
        if (a >= 0 && z > a) jsonStr = jsonStr.slice(a, z + 1);
        let extracted;
        try { extracted = JSON.parse(jsonStr); }
        catch(e) { return json({ ok: false, error: "could not parse extracted JSON", raw_first_500: text.slice(0,500) }, 500); }

        const facts = Array.isArray(extracted.facts) ? extracted.facts : [];
        const decisions = Array.isArray(extracted.decisions) ? extracted.decisions : [];
        const states = Array.isArray(extracted.state_updates) ? extracted.state_updates : [];
        const concepts = Array.isArray(extracted.concepts) ? extracted.concepts : [];
        const rules = Array.isArray(extracted.rules) ? extracted.rules : [];
        const links = Array.isArray(extracted.links) ? extracted.links : [];
        const repos = Array.isArray(extracted.repos) ? extracted.repos : [];

        if (dryRun) {
          return json({ ok: true, dry_run: true, extracted: { facts_count: facts.length, decisions_count: decisions.length, states_count: states.length, concepts_count: concepts.length, rules_count: rules.length, links_count: links.length, repos_count: repos.length }, preview: extracted });
        }

        const _uid = (await identifyPin(request, env)) || "paddy";
        let saved = { facts: 0, decisions: 0, states: 0, concepts: 0, rules: 0, links: 0, repos: 0, errors: [] };

        // Save facts to memory_v2
        for (const f of facts) {
          try {
            const proj = (f.project || defaultProject).toString().slice(0,60);
            const key = (f.key || "fact_" + Date.now()).toString().slice(0,80);
            const val = (f.value || "").toString().slice(0,2000);
            if (!val) continue;
            await env.DB.prepare("INSERT INTO memory_v2 (pin_user, project, key, value, version, is_current, is_shared, actor, created_at) VALUES (?, ?, ?, ?, 1, ?, 0, ?, ?)").bind(_uid, proj, key, val, body.historical ? 0 : 1, body.source_tag || "migrate-from-claude", Date.now()).run();
            saved.facts++;
          } catch(e) { saved.errors.push("fact: " + e.message); }
        }

        // Save decisions to project_events
        for (const d of decisions) {
          try {
            const proj = (d.project || defaultProject).toString().slice(0,60);
            const ev = (d.event || "decision").toString().slice(0,80);
            const summary = (d.summary || "").toString().slice(0,2000);
            if (!summary) continue;
            await env.DB.prepare("INSERT INTO project_events (project, event, summary, source, uid) VALUES (?, ?, ?, ?, ?)").bind(proj, ev, summary, body.source_tag || "migrate-from-claude", _uid).run();
            saved.decisions++;
          } catch(e) { saved.errors.push("decision: " + e.message); }
        }

        // Update project_hub next_action + notes (only if PROJECT_HUB binding present)
        if (env.PROJECT_HUB) {
          for (const s of states) {
            try {
              const slug = (s.project || "").toString().toLowerCase().replace(/[^a-z0-9-]/g,'-');
              if (!slug) continue;
              const next = (s.next_action || "").toString().slice(0,2000);
              const notes = (s.notes || "").toString().slice(0,3000);
              const match = await env.PROJECT_HUB.prepare("SELECT id, project_name, notes FROM project_hub WHERE LOWER(REPLACE(project_name,' ','-')) = ? OR LOWER(project_name) LIKE ? LIMIT 1").bind(slug, '%' + slug.replace(/-/g,' ') + '%').first().catch(() => null);
              if (match) {
                const tag = body.historical ? "[historical-import " : "[migrate-from-claude ";
                const newNotes = (match.notes ? match.notes + "\n\n" : "") + tag + new Date().toISOString().slice(0,10) + "] " + notes;
                if (body.historical) {
                  // Don't overwrite next_action. Just append historical context to notes.
                  await env.PROJECT_HUB.prepare("UPDATE project_hub SET notes = ? WHERE id = ?").bind(newNotes, match.id).run();
                } else {
                  await env.PROJECT_HUB.prepare("UPDATE project_hub SET next_action = COALESCE(?, next_action), notes = ? WHERE id = ?").bind(next || null, newNotes, match.id).run();
                }
                saved.states++;
              }
            } catch(e) { saved.errors.push("state: " + e.message); }
          }
          for (const c of concepts) {
            try {
              const slug = (c.project || "").toString().toLowerCase().replace(/[^a-z0-9-]/g,'-');
              if (!slug) continue;
              const md = (c.concept_md || "").toString().slice(0,8000);
              if (!md) continue;
              const match = await env.PROJECT_HUB.prepare("SELECT id, concept_md FROM project_hub WHERE LOWER(REPLACE(project_name,' ','-')) = ? OR LOWER(project_name) LIKE ? LIMIT 1").bind(slug, '%' + slug.replace(/-/g,' ') + '%').first().catch(() => null);
              if (match) {
                const newConcept = (match.concept_md ? match.concept_md + "\n\n---\n\n" : "") + "[migrate-from-claude " + new Date().toISOString().slice(0,10) + "]\n" + md;
                await env.PROJECT_HUB.prepare("UPDATE project_hub SET concept_md = ? WHERE id = ?").bind(newConcept, match.id).run();
                saved.concepts++;
              }
            } catch(e) { saved.errors.push("concept: " + e.message); }
          }
        }

        // Save rules to memory_v2 with category=rule
        for (const r of rules) {
          try {
            const proj = (r.project || defaultProject).toString().slice(0,60);
            const key = "rule_" + (r.key || ("r_" + Date.now())).toString().slice(0,80);
            const val = (r.value || "").toString().slice(0,2000);
            if (!val) continue;
            await env.DB.prepare("INSERT INTO memory_v2 (pin_user, project, key, value, version, is_current, is_shared, actor, created_at) VALUES (?, ?, ?, ?, 1, ?, 0, ?, ?)").bind(_uid, proj, key, val, body.historical ? 0 : 1, body.source_tag || "migrate-import-rule", Date.now()).run();
            saved.rules++;
          } catch(e) { saved.errors.push("rule: " + e.message); }
        }
        // Save links to memory_v2 with category=link AND attempt to update project_hub.live_url
        for (const l of links) {
          try {
            const proj = (l.project || defaultProject).toString().slice(0,60);
            const label = (l.label || "link").toString().slice(0,120);
            const url = (l.url || "").toString().slice(0,500);
            if (!url) continue;
            const key = "link_" + label.toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,60);
            await env.DB.prepare("INSERT INTO memory_v2 (pin_user, project, key, value, version, is_current, is_shared, actor, created_at) VALUES (?, ?, ?, ?, 1, ?, 0, ?, ?)").bind(_uid, proj, key, label + ": " + url, body.historical ? 0 : 1, body.source_tag || "migrate-import-link", Date.now()).run();
            saved.links++;
            // If this looks like a live URL and project has none, set it
            if (env.PROJECT_HUB && (label.toLowerCase().includes("live") || label.toLowerCase().includes("url") || label.toLowerCase().includes("home"))) {
              const slug = proj.replace(/-/g,' ');
              await env.PROJECT_HUB.prepare("UPDATE project_hub SET live_url = ? WHERE LOWER(REPLACE(project_name,' ','-')) = ? AND (live_url IS NULL OR live_url='')").bind(url, proj).run().catch(() => {});
            }
          } catch(e) { saved.errors.push("link: " + e.message); }
        }
        // Save repos: update project_hub.github_url; also save as memory
        for (const r of repos) {
          try {
            const proj = (r.project || defaultProject).toString().slice(0,60);
            const url = (r.repo_url || "").toString().slice(0,500);
            const notes = (r.notes || "").toString().slice(0,500);
            if (!url) continue;
            await env.DB.prepare("INSERT INTO memory_v2 (pin_user, project, key, value, version, is_current, is_shared, actor, created_at) VALUES (?, ?, ?, ?, 1, ?, 0, ?, ?)").bind(_uid, proj, "repo_main", url + (notes ? " — " + notes : ""), body.historical ? 0 : 1, body.source_tag || "migrate-import-repo", Date.now()).run();
            saved.repos++;
            if (env.PROJECT_HUB) {
              await env.PROJECT_HUB.prepare("UPDATE project_hub SET github_url = ? WHERE LOWER(REPLACE(project_name,' ','-')) = ? AND (github_url IS NULL OR github_url='')").bind(url, proj).run().catch(() => {});
            }
          } catch(e) { saved.errors.push("repo: " + e.message); }
        }

        return json({ ok: true, saved, totals: { facts: facts.length, decisions: decisions.length, states: states.length, concepts: concepts.length, rules: rules.length, links: links.length, repos: repos.length } });
      }

      // Project context — full record + recent events + live worker health + recent GH commits
      if (path === "/admin/project-context" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.PROJECT_HUB) return err("PROJECT_HUB D1 binding not set", 500);
        const _url = new URL(request.url);
        const _name = (_url.searchParams.get('name') || '').trim();
        if (!_name) return err("name query param required", 400);
        const proj = await env.PROJECT_HUB.prepare(
          "SELECT * FROM project_hub WHERE LOWER(project_name) = LOWER(?) OR LOWER(id) = LOWER(?) LIMIT 1"
        ).bind(_name, _name).first().catch(() => null);
        if (!proj) return json({ ok: false, error: "project not found", name: _name }, 404);
        let events = [];
        try {
          const rs = await env.DB.prepare(
            "SELECT ts, event, summary, url, commit_sha, source FROM project_events WHERE LOWER(project) = LOWER(?) ORDER BY id DESC LIMIT 10"
          ).bind(proj.project_name).all();
          events = rs.results || [];
        } catch(e) {}
        let live_health = null;
        const hUrl = proj.live_url ? (String(proj.live_url).replace(/\/+$/,'') + '/health') : (proj.cloudflare_worker ? ('https://' + proj.cloudflare_worker + '.luckdragon.io/health') : null);
        if (hUrl) {
          try {
            const hr = await fetch(hUrl, { signal: AbortSignal.timeout(3000) });
            if (hr.ok) live_health = await hr.json().catch(() => null);
          } catch(e) {}
        }
        let recent_commits = [];
        if (proj.github_url) {
          try {
            const m = String(proj.github_url).match(/github\.com\/([^\/]+)\/([^\/?#]+)/);
            if (m) {
              const owner = m[1];
              const repo = m[2].replace(/\.git$/,'');
              const gr = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/commits?per_page=5', {
                headers: env.GITHUB_TOKEN ? { Authorization: 'Bearer ' + env.GITHUB_TOKEN, Accept: 'application/vnd.github+json' } : { Accept: 'application/vnd.github+json' },
                signal: AbortSignal.timeout(5000)
              });
              if (gr.ok) {
                const arr = await gr.json();
                recent_commits = (arr || []).slice(0, 5).map(c => ({
                  sha: (c.sha || '').slice(0,12),
                  message: (c.commit && c.commit.message || '').split('\n')[0].slice(0,140),
                  date: c.commit && c.commit.author && c.commit.author.date,
                  author: c.commit && c.commit.author && c.commit.author.name
                }));
              }
            }
          } catch(e) {}
        }
        return json({
          ok: true,
          project: proj,
          recent_events: events,
          live_health: live_health,
          recent_commits: recent_commits,
          system_prefix: _buildProjectSystemPrefix(proj, events, live_health, recent_commits)
        });
      }
      if (path === "/admin/projects/get" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.PROJECT_HUB) return err("PROJECT_HUB D1 binding not set", 500);
        const u = new URL(request.url);
        const id = u.searchParams.get("id");
        if (!id) return err("?id= required", 400);
        const row = await env.PROJECT_HUB.prepare("SELECT * FROM project_hub WHERE id = ?").bind(id).first();
        if (!row) return err("not found", 404);
        return json({ ok: true, project: row });
      }
      if (path === "/admin/projects/update" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.PROJECT_HUB) return err("PROJECT_HUB D1 binding not set", 500);
        const body = await request.json().catch(() => ({}));
        const { id, fields } = body;
        if (!id || !fields || typeof fields !== "object") return err("id and fields object required", 400);
        const allowed = ["project_name","category","status","progress_pct","next_action","notes","detail_md","cost_monthly","revenue_y1","live_url","github_url","tech_stack","key_features","scale_notes","cost_notes","domains","description","income_priority","sort_order","revenue_category"];
        const cols = []; const vals = [];
        for (const k of Object.keys(fields)) {
          if (allowed.includes(k)) { cols.push(k + " = ?"); vals.push(fields[k]); }
        }
        if (!cols.length) return err("no valid fields to update", 400);
        cols.push("last_updated = date('now')");
        vals.push(id);
        const r = await env.PROJECT_HUB.prepare("UPDATE project_hub SET " + cols.join(", ") + " WHERE id = ?").bind(...vals).run();
        return json({ ok: true, changes: r.meta.changes });
      }


      // ===== Secret-mirror to vault (PATCH 2026-05-13) =====
      // Mirrors a SPECIFIC named secret from the worker env to the vault.
      // Whitelisted to non-rotating keys. NEVER returns the value to the caller.
      if (path === "/admin/mirror-to-vault" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const { key } = body;
        if (!key) return err("key required", 400);
        // Whitelist: only API keys + tokens, never PINs or refresh tokens
        const WHITELIST = [
          "CF_API_TOKEN_FULLOPS",
          "OPENAI_API_KEY","GEMINI_API_KEY","GROQ_API_KEY",
          "ELEVENLABS_API_KEY","TAVILY_API_KEY","SERPER_API_KEY",
          "DISCORD_APP_ID","DISCORD_PUBLIC_KEY","DISCORD_CHANNEL_ID","DISCORD_GUILD_ID",
          "DISCORD_BOT_TOKEN","SLACK_BOT_TOKEN","VERCEL_TOKEN",
          "LD_GOOGLE_REFRESH_TOKEN",
        ];
        if (!WHITELIST.includes(key)) {
          return err("key not whitelisted for mirror (security): " + key, 403);
        }
        const value = env[key];
        if (!value) return err("env." + key + " not bound on this worker", 404);
        // PUT to vault. Vault accepts X-Pin auth, body is {value}
        const vaultUrl = "https://asgard-vault.pgallivan.workers.dev/secret/" + encodeURIComponent(key);
        const r = await fetch(vaultUrl, {
          method: "PUT",
          headers: { "X-Pin": "535554", "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });
        const t = await r.text();
        let d; try { d = JSON.parse(t); } catch { d = { raw: t.slice(0, 200) }; }
        return json({
          ok: r.ok, status: r.status, key,
          length_mirrored: String(value).length,
          vault_response: d,
          note: "value is never returned in this response; only its length is logged",
        });
      }
      // ===== CF token gap docs =====
      if (path === "/admin/cf-token-gaps" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        return json({
          ok: true,
          message: "Capabilities Falkor cannot reach with current tokens",
          gaps: [
            {
              capability: "Vectorize index management (list/create/delete indexes)",
              workaround: "Use env.MEMORY_VEC binding directly via /admin/vectorize/describe and /admin/vectorize/query. CRUD on indexes still needs dashboard.",
              token_to_create: "vectorize-admin",
              permissions_needed: "Account → Vectorize → Edit",
              dashboard_link: "https://dash.cloudflare.com/profile/api-tokens"
            },
            {
              capability: "DNS record management on luckdragon.io",
              workaround: "None — dashboard only.",
              token_to_create: "dns-admin",
              permissions_needed: "Zone → DNS → Edit (scoped to luckdragon.io)",
              dashboard_link: "https://dash.cloudflare.com/profile/api-tokens",
              after_creating: "Add to vault as CF_DNS_TOKEN via POST /admin/vault/put (also documented below)"
            },
            {
              capability: "User token CRUD (creating new tokens autonomously)",
              workaround: "Not possible — CF requires dashboard interaction or a token with User Tokens scope, which CF_FULLOPS_TOKEN lacks. By design.",
              recommendation: "Accept this gap. Token rotation is a deliberate human-in-the-loop step."
            }
          ],
          how_to_add_to_vault: {
            via_curl: "curl -X PUT -H \"X-Pin: 535554\" -H \"Content-Type: application/json\" -d '{\"name\":\"CF_DNS_TOKEN\",\"value\":\"<the_new_token>\"}' https://asgard-vault.pgallivan.workers.dev/secret/CF_DNS_TOKEN",
            via_falkor: "POST /admin/vault/put once that endpoint exists — currently goes direct to asgard-vault"
          }
        });
      }

      // ===== Broader OAuth one-shot (PATCH 2026-05-13) =====
      if (path === "/admin/oauth-broader-url" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        if (!env.GOOGLE_CLIENT_ID) return err("GOOGLE_CLIENT_ID not set", 500);
        const u = new URL(request.url);
        const origin = u.origin;
        const params = new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID,
          redirect_uri: origin + "/google/oauth-callback",
          response_type: "code",
          scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/cloud-platform.read-only https://www.googleapis.com/auth/service.management",
          access_type: "offline",
          prompt: "consent",
          state: "luckdragon-broader",
          login_hint: "paddy@luckdragon.io"
        });
        const consentUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
        return json({
          ok: true,
          consent_url: consentUrl,
          instructions: "Open this URL once in a browser logged in as paddy@luckdragon.io. After approval, the existing /google/oauth-callback handler stores the new refresh token. Then POST /admin/enable-google-api with token=GOOGLE_REFRESH_TOKEN to enable Calendar API.",
          scopes_requested: ["drive (full)", "calendar (full)", "cloud-platform.read-only", "service.management"]
        });
      }
      // ===== End of PATCH 2026-05-13 admin routes =====
      if (path === "/admin/google-probe" && method === "GET") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const out = {};
        const tokens = [
          { name: "LD_GOOGLE_REFRESH_TOKEN", val: env.LD_GOOGLE_REFRESH_TOKEN },
          { name: "GOOGLE_REFRESH_TOKEN", val: env.GOOGLE_REFRESH_TOKEN },
        ];
        for (const t of tokens) {
          if (!t.val) { out[t.name] = { present: false }; continue; }
          try {
            const r = await fetch("https://oauth2.googleapis.com/token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id: env.GOOGLE_CLIENT_ID,
                client_secret: env.GOOGLE_CLIENT_SECRET,
                refresh_token: t.val,
                grant_type: "refresh_token",
              }).toString(),
            });
            const j = await r.json();
            out[t.name] = {
              present: true, ok: r.ok,
              scope: j.scope || null,
              error: j.error || null,
              access_token_len: j.access_token ? j.access_token.length : 0,
            };
          } catch (e) { out[t.name] = { present: true, error: String(e).slice(0,200) }; }
        }
        return json(out);
      }
      if (path === "/admin/enable-google-api" && method === "POST") {
        const _pr = await pinOk(request, env); if (_pr !== true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const project = body.project || "205533966048";
        const service = body.service || "calendar-json.googleapis.com";
        const tokenName = body.token || "LD_GOOGLE_REFRESH_TOKEN";
        const rtok = env[tokenName];
        if (!rtok) return err(`No env.${tokenName}`, 400);
        const tr = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            refresh_token: rtok,
            grant_type: "refresh_token",
          }).toString(),
        });
        const tj = await tr.json();
        if (!tr.ok || !tj.access_token) return err("token refresh failed: " + JSON.stringify(tj).slice(0,300), 502);
        const er = await fetch(
          `https://serviceusage.googleapis.com/v1/projects/${project}/services/${service}:enable`,
          { method: "POST", headers: { "Authorization": "Bearer " + tj.access_token } }
        );
        const et = await er.text();
        let ej; try { ej = JSON.parse(et); } catch { ej = { raw: et.slice(0,400) }; }
        return json({ ok: er.ok, status: er.status, project, service, scopes: tj.scope, response: ej });
      }

      if (path === "/health") {
        return json({
          ok: true, worker: WORKER_NAME, version: VERSION,
          routes: ["/health","/chat/smart","/chat/stream","/chat/agent","/chat/agentic","/sync/state","/admin/errors","/bridge/enqueue","/bridge/poll","/bridge/result","/chat/vision","/image/generate","/image/generate-and-store","/speak","/tts","/stt","/weather","/feature-request","/conversations","/history","/memory","/memory/clear","/slack/post","/telegram/send","/telegram/setup","/discord/send","/discord/interactions","/discord/register-commands","/discord/invite","/prefs","/ranking","/presence","/github/*","/vercel/*","/drive/upload","/drive/search","/drive/delete","/drive/ld-mkdir","/drive/ld-search","/drive/ld-copy","/google/oauth-start","/google/oauth-callback","/google/calendar/events","/agent/propose"],
          models: Object.keys(MODELS),
          providers: {
            groq: !!env.GROQ_API_KEY,
            anthropic: !!env.ANTHROPIC_API_KEY,
            openai: !!env.OPENAI_API_KEY,
            gemini: !!env.GEMINI_API_KEY,
            elevenlabs: !!env.ELEVENLABS_API_KEY,
          },
          gateway: CF_GATEWAY_BASE,
          default_model: DEFAULT_MODEL,
          slack: !!env.SLACK_BOT_TOKEN,
          telegram: !!env.TELEGRAM_BOT_TOKEN,
          discord: !!env.DISCORD_BOT_TOKEN,
          compression: { threshold: COMPRESS_THRESHOLD, keep: COMPRESS_KEEP_RECENT, archive_after_days: ARCHIVE_AFTER_DAYS },
        });
      }
      if (path === "/models") {
        return json({ models: Object.keys(MODELS).map(k => ({ key: k, ...MODELS[k] })) });
      }
      if (path === "/manifest.json") {
        return new Response(JSON.stringify({
          name: "Asgard AI", short_name: "Asgard", start_url: "/", scope: "/", display: "standalone",
          background_color: "#0a0a1a", theme_color: "#e8c44d",
          icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
        }), { headers: { ...CORS, "Content-Type": "application/manifest+json" } });
      }
      if (path === "/sw.js") {
        const sw = "self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(clients.claim()));self.addEventListener('fetch',e=>e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>new Response('offline',{status:503}))));";
        return new Response(sw, { headers: { ...CORS, "Content-Type": "application/javascript", "Cache-Control": "no-store" } });
      }
      if (path === "/icon-192.png" || path === "/icon-512.png") {
        const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4zwAAAgEBAKrChTYAAAAASUVORK5CYII=";
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        return new Response(bytes, { headers: { ...CORS, "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
      }
            if (path === "/auth/token" && method === "POST") {
        const ip=request.headers.get('CF-Connecting-IP')||'unknown';
        const pin=request.headers.get('X-Pin')||request.headers.get('X-PIN')||'';
        const rl=await getRateLimit(env,ip);
        if (!rl.ok) return pinRequired('locked');
        if (!getValidPins(env).includes(pin)) { await recordFailedPin(env,ip); return pinRequired(false); }
        await clearRateLimit(env,ip);
        const token=await createSession(env,pin);
        if (!token) return json({ok:false,error:'SESSIONS_KV not bound'},{status:500});
        return json({ok:true,token,expires_in:86400});
      }
      if (path === "/chat/smart"   && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleChatSmart(request, env); }
      if (path === "/chat/stream"  && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleChatStream(request, env); }
      if (path === "/chat/agentic" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleChatAgentic(request, env); }
      if (path === "/sync/state" && (method === "GET" || method === "POST")) { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleSyncState(request, env); }
      if (path === "/admin/errors" && method === "GET") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleAdminErrors(request, env); }
      if (path === "/admin/spend"  && method === "GET") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleAdminSpend(request, env); }
      if (path === "/bridge/enqueue" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleBridgeEnqueue(request, env); }
      if (path === "/bridge/poll" && method === "GET")    { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleBridgePoll(request, env); }
      if (path === "/bridge/result" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleBridgeResult(request, env); }
      if (path.startsWith("/bridge/result/") && method === "GET") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleBridgeGetResult(request, env); }
      if (path === "/chat/agent"   && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleChatAgent(request, env); }
      if (path === "/chat/vision"  && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleChatVision(request, env); }
      if (path === "/image/generate" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleImageGenerate(request, env); }
      if (path === "/image/generate-and-store" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleImageGenerateAndStore(request, env); }
      if (path === "/speak"        && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleSpeak(request, env); }
      if (path === "/tts"          && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleSpeak(request, env); }
      if (path === "/stt"          && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleSTT(request, env); }
      if (path === "/weather"      && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleWeather(request, env); }
      if (path === "/feature-request" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleFeatureRequest(request, env); }
      if (path === "/memory"       && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleMemoryGet(request, env); }
      if (path === "/memory/clear" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleMemoryClear(request, env); }
      if (path === "/slack/post" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const channel = body.channel; const text = body.text || body.message;
        if (!channel || !text) return err("channel and text required", 400);
        const r = await slackPost(env, text, channel);
        return json({ ok: r.ok, error: r.error || null, channel });
      }
      if (path === "/telegram/send" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const text = body.text || body.message;
        if (!text) return err("text required", 400);
        const r = await telegramSend(env, text, body.chat_id || null);
        return json({ ok: r.ok, error: r.error || null, message_id: r.message_id });
      }
      if (path === "/telegram/setup" && method === "GET") {
        const r = await telegramGetChatId(env);
        return json(r);
      }
      if (path === "/discord/send" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr);
        const body = await request.json().catch(() => ({}));
        const message = body.message || body.text;
        if (!message) return err("message required", 400);
        const r = await discordSend(env, message, body.channel_id || null);
        return json(r);
      }
      if (path === "/discord/get" && method === "GET") {
        const messageId = url.searchParams.get("message_id");
        const channelId = url.searchParams.get("channel_id") || null;
        return json(await discordGet(env, channelId, messageId));
      }
      if (path === "/discord/interactions" && method === "POST") return handleDiscordInteractions(request, env);
      if (path === "/discord/register-commands" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr);
        const r = await handleDiscordRegisterCommands(env);
        return json(r);
      }
      if (path === "/discord/invite" && method === "GET") {
        const appId = env.DISCORD_APP_ID || "1497464108721766460";
        const url = `https://discord.com/api/oauth2/authorize?client_id=${appId}&permissions=67584&scope=bot%20applications.commands`;
        return json({ invite_url: url });
      }
      if (path === "/conversations" && method === "GET") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleConversations(request, env); }
      if (path === "/history"       && method === "GET") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleHistory(request, env); }
      if (path === "/prefs"         && method === "GET") return json({ prefs: {} });
      if (path === "/ranking"       && method === "GET") return json({ rankings: [] });
      if (path === "/presence"      && method === "GET") return json({ online: [] });
      if (path === "/" || path === "/chat") {
        return new Response("asgard-ai " + VERSION + " - multi-provider (Anthropic/OpenAI/Gemini/DALL-E/ElevenLabs).", { headers: { ...CORS, "Content-Type": "text/plain" } });
      }
      if (path === "/github/repos"        && method === "GET")  return handleGithubRepos(request, env);
      if (path === "/github/read-file"    && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleGithubReadFile(request, env); }
      if (path === "/github/commit-file"  && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleGithubCommitFile(request, env); }
      if (path === "/github/create-pr"    && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleGithubCreatePr(request, env); }
      if (path === "/github/create-issue" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleGithubCreateIssue(request, env); }
      if (path === "/vercel/projects"     && method === "GET")  return handleVercelProjects(request, env);
      if (path === "/vercel/deployments"  && method === "GET")  return handleVercelDeployments(request, env);
      if (path === "/vercel/redeploy"     && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleVercelRedeploy(request, env); }
      if (path === "/drive/upload"        && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleDriveUpload(request, env); }
      if (path === "/drive/delete"        && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleDriveDelete(request, env); }
      if (path === "/drive/ld-mkdir"      && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleDriveLdMkdir(request, env); }
      if (path === "/drive/ld-copy"       && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleDriveLdCopy(request, env); }
      if (path === "/drive/ld-search"     && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleDriveLdSearch(request, env); }
      if (path === "/drive/ld-move"       && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleDriveLdMove(request, env); }
      if (path === "/drive/ld-share"      && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleDriveLdShare(request, env); }
      if (path === "/drive/ld-list-roots" && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleDriveLdListRoots(request, env); }
      if (path === "/drive/search"        && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleDriveSearch(request, env); }
      if (path === "/drive/get"           && method === "GET")  {
        const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr);
        try {
          const u = new URL(request.url);
          const fileId = u.searchParams.get("id");
          if (!fileId) return json({ ok: false, error: "id required" }, 400);
          const tr = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token" }).toString()
          });
          const tj = await tr.json();
          // Get metadata
          const m = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "?fields=name,mimeType,size", { headers: { "Authorization": "Bearer " + tj.access_token } });
          const mj = await m.json();
          let content;
          if (mj.mimeType === "application/vnd.google-apps.document") {
            // Export Google Doc as plain text
            const c = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "/export?mimeType=text/plain", { headers: { "Authorization": "Bearer " + tj.access_token } });
            content = await c.text();
          } else {
            // Direct download
            const c = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "?alt=media", { headers: { "Authorization": "Bearer " + tj.access_token } });
            content = await c.text();
          }
          return new Response(content, { headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" } });
        } catch (e) { return json({ ok: false, error: e.message }, 500); }
      }
      if (path === "/drive/about"         && method === "GET")  {
        const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr);
        try {
          const tr = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token" }).toString()
          });
          const tj = await tr.json();
          const ab = await fetch("https://www.googleapis.com/drive/v3/about?fields=user(emailAddress,displayName),storageQuota", { headers: { "Authorization": "Bearer " + tj.access_token } });
          const aj = await ab.json();
          return json({ ok: ab.ok, about: aj });
        } catch (e) { return json({ ok: false, error: e.message }, 500); }
      }
      if (path === "/drive/whoami"        && method === "GET")  {
        const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr);
        // Refresh token, fetch /userinfo to see what account is bound
        try {
          const tr = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: env.LD_GOOGLE_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token" }).toString()
          });
          if (!tr.ok) return json({ ok: false, refresh_err: await tr.text() }, 502);
          const tj = await tr.json();
          const ui = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { "Authorization": "Bearer " + tj.access_token } });
          const uj = await ui.json();
          return json({ ok: true, scope: tj.scope, expires_in: tj.expires_in, user: uj });
        } catch (e) {
          return json({ ok: false, error: e.message }, 500);
        }
      }
      if (path === "/google/oauth-start"  && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleOauthStart(request, env); }
      if (path === "/google/oauth-callback" && method === "GET") return handleOauthCallback(request, env);
      if (path === "/google/calendar/events" && method === "GET") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleGoogleCalendarEvents(request, env); }
      if (path === "/agent/propose"       && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); return handleAgentPropose(request, env); }
      if (path === "/memory/save"     && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); const _pu=await identifyPin(request,env)||'paddy'; return handleMemorySave(request, env, _pu); }
      if (path === "/memory/list"     && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); const _pu=await identifyPin(request,env)||'paddy'; return handleMemoryList(request, env, _pu); }
      if (path === "/memory/forget"   && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); const _pu=await identifyPin(request,env)||'paddy'; return handleMemoryForget(request, env, _pu); }
      if (path === "/messages/groups" && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); const _pu=await identifyPin(request,env)||'paddy'; return handleMsgGroupCreate(request, env, _pu); }
      if (path === "/messages/groups" && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); const _pu=await identifyPin(request,env)||'paddy'; return handleMsgGroupList(request, env, _pu); }
      if (path === "/messages/send"   && method === "POST") { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); const _pu=await identifyPin(request,env)||'paddy'; return handleMsgSend(request, env, _pu); }
      if (path === "/messages/read"   && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); const _pu=await identifyPin(request,env)||'paddy'; return handleMsgRead(request, env, _pu); }
      if (path === "/messages/unread" && method === "GET")  { const _pr=await pinOk(request,env); if(_pr!==true) return pinRequired(_pr); const _pu=await identifyPin(request,env)||'paddy'; return handleMsgUnread(request, env, _pu); }
      return json({ ok: false, error: "Not Found", path }, 404);
    } catch (e) {
      return err("unhandled: " + (e.message || String(e)), 500);
    }
  },
};