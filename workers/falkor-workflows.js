// falkor-workflows v3.11.0 — Scheduled workflows + Jarvis-level autonomy + narrative brief
// Cron: 0 21 * * * (7am AEST), 30 21 * * * (7:30am AEST), * * * * * (every 1min — reactive alerts)
//
// Scheduled jobs:
//   1. PE Weather Alert (7:00am AEST) — Williamstown Primary conditions
//   2. Daily Falkor Briefing (7:30am AEST) — top priorities + weather + AFL + tipping
//   3. Smart Proactive Rules (every 2h daytime) — game day, race day, KBT, momentum
//
// REST endpoints:
//   POST /email                  — send ad-hoc email via Resend
//   POST /workflow/trigger       — manually trigger a named workflow
//   GET  /workflow/runs          — recent run log
//   POST /smart-alerts/trigger   — run smart alerts now
//   GET  /health                 — version + bindings status
//
// Bindings: DB (asgard-prod), PROJECTS_DB (project-hub-db), RESEND_API_KEY, AGENT_PIN, WEB_SERVICE (falkor-web)

const VERSION = '3.12.0';

// AI_WORKER_PIN getter — asgard-ai uses a separate PIN from AGENT_PIN
function getAiPin(env) {
  return env.AI_WORKER_PIN || env.AGENT_PIN || '';
}
const WORKER_NAME = 'falkor-workflows';
const PUSH_URL = 'https://falkor-push.luckdragon.io';
const SPORT_URL = 'https://falkor-sport.luckdragon.io';
const CALENDAR_URL = 'https://falkor-calendar.luckdragon.io';

const WPS_LAT = -37.8594;
const WPS_LON = 144.8750;
const PADDY_EMAIL = 'pgallivan@outlook.com';
const FROM_EMAIL = 'Falkor <workflows@luckdragon.io>';
const AI_URL = 'https://asgard-ai.luckdragon.io';
const KBT_URL = 'https://falkor-kbt.luckdragon.io';
const BRAIN_URL = 'https://falkor-brain.luckdragon.io';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Pin',
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}
function err(msg, status = 400) { return json({ ok: false, error: msg }, status); }
function pinOk(request, env) {
  const pin = request.headers.get('X-Pin') || '';
  if (!env.AGENT_PIN) return true;
  return pin === env.AGENT_PIN;
}

// ─── Email via Resend ─────────────────────────────────────────────────────────
async function sendEmail(env, { to, subject, html, text }) {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
  const body = { from: FROM_EMAIL, to: [to || PADDY_EMAIL], subject, html: html || '<p>' + (text||'') + '</p>' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + env.RESEND_API_KEY },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ': ' + (await r.text()).slice(0, 200));
  const d = await r.json();
  return { ok: true, id: d.id };
}

// ─── Push notification ────────────────────────────────────────────────────────
async function sendPush(env, { title, body, url = 'https://falkor.luckdragon.io', tag = 'falkor' }) {
  try {
    await fetch(PUSH_URL + '/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pin': env.AGENT_PIN },
      body: JSON.stringify({ title, body, url, tag }),
    });
  } catch (e) { console.warn('sendPush failed:', e.message); }
}

// ─── Weather fetch ────────────────────────────────────────────────────────────
async function getWeather(env, lat, lon) {
  const pin = env.AGENT_PIN || '';
  const r = await fetch(AI_URL + '/weather?lat=' + lat + '&lon=' + lon, { headers: { 'X-Pin': pin } });
  if (!r.ok) throw new Error('Weather fetch failed: ' + r.status);
  return r.json();
}

// ─── Venture priorities from project-hub-db ───────────────────────────────────
async function getTopVentures(env, limit = 5) {
  if (!env.PROJECTS_DB) return [];
  try {
    const rows = await env.PROJECTS_DB.prepare(
      'SELECT name, status, next, y1, income_priority, last_updated FROM project_hub WHERE income_priority <= 3 AND status NOT IN (\'archived\', \'paused\') ORDER BY income_priority ASC, y1 DESC LIMIT ?'
    ).bind(limit).all();
    return rows.results || [];
  } catch (e) { console.warn('getTopVentures:', e.message); return []; }
}

// ─── Log workflow run to D1 ───────────────────────────────────────────────────
async function logRun(env, workflow, result, error = null) {
  if (!env.DB) return;
  try {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS falkor_workflow_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, workflow TEXT NOT NULL, result TEXT, error TEXT, ran_at INTEGER DEFAULT (unixepoch()))').run();
    await env.DB.prepare('INSERT INTO falkor_workflow_runs (workflow, result, error) VALUES (?, ?, ?)').bind(workflow, JSON.stringify(result).slice(0, 1000), error?.slice(0, 500) || null).run();
  } catch (e) { console.error('Log run error:', e?.message); }
}

// ─── Dedup alert tracking ─────────────────────────────────────────────────────
async function checkAlertFired(env, key, windowMs = 86400000 * 2) {
  if (!env.DB) return false;
  try {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS falkor_smart_alerts (id TEXT PRIMARY KEY, fired_at INTEGER)').run();
    const row = await env.DB.prepare('SELECT id FROM falkor_smart_alerts WHERE id = ? AND fired_at > ?').bind(key, Date.now() - windowMs).first();
    return !!row;
  } catch { return false; }
}
async function markAlertFired(env, key) {
  if (!env.DB) return;
  try {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS falkor_smart_alerts (id TEXT PRIMARY KEY, fired_at INTEGER)').run();
    await env.DB.prepare('INSERT OR REPLACE INTO falkor_smart_alerts (id, fired_at) VALUES (?, ?)').bind(key, Date.now()).run();
  } catch {}
}

// ─── Workflow 1: PE Weather Alert ─────────────────────────────────────────────
async function runPEWeatherAlert(env) {
  const weather = await getWeather(env, WPS_LAT, WPS_LON);
  const c = weather.current;
  const today = weather.today;

  const issues = [];
  if (c.uv >= 9) issues.push('UV Index ' + c.uv + ' (extreme — sun protection mandatory)');
  if (c.temp > 36) issues.push('Temperature ' + c.temp + '°C (too hot for vigorous activity)');
  if (c.temp < 8) issues.push('Temperature ' + c.temp + '°C (cold — move indoors or warm up extended)');
  if (c.wind_kmh > 40) issues.push('Wind ' + c.wind_kmh + ' km/h (too windy for outdoor games)');
  if ((today.rain_mm || 0) > 5) issues.push('Rain ' + today.rain_mm + 'mm expected (wet conditions)');
  if (c.rain_chance > 60) issues.push('' + c.rain_chance + '% chance of rain');

  const suitable = issues.length === 0;

  await fetch(BRAIN_URL + '/remember', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Pin': env.AGENT_PIN || '' },
    body: JSON.stringify({
      text: 'PE Weather check ' + new Date().toLocaleDateString('en-AU') + ': ' + c.temp + '°C, ' + c.condition + ', UV ' + c.uv + ', wind ' + c.wind_kmh + 'km/h. ' + (suitable ? 'Suitable for outdoor PE.' : 'Issues: ' + issues.join('; ')),
      category: 'weather', tags: ['pe', 'weather', 'wps'],
    }),
  }).catch(() => {});

  if (!suitable) {
    const html = '<h2>PE Weather Alert — Williamstown Primary</h2>' +
      '<p><strong>Date:</strong> ' + new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Australia/Melbourne' }) + '</p>' +
      '<h3>Current Conditions</h3><ul>' +
      '<li>Temperature: ' + c.temp + '°C (feels like ' + c.feels_like + '°C)</li>' +
      '<li>Conditions: ' + c.condition + '</li>' +
      '<li>UV Index: ' + c.uv + '</li>' +
      '<li>Wind: ' + c.wind_kmh + ' km/h</li>' +
      '<li>Rain chance: ' + c.rain_chance + '%</li>' +
      '</ul><h3>Issues Detected</h3><ul>' +
      issues.map(function(i) { return '<li>' + i + '</li>'; }).join('') +
      '</ul><p><em>Falkor Workflows — falkor-workflows.luckdragon.io</em></p>';

    await sendEmail(env, { to: PADDY_EMAIL, subject: 'PE Alert: ' + issues[0], html });
    await sendPush(env, { title: 'PE Alert: ' + issues[0], body: 'Check conditions before outdoor PE. ' + issues.join(', '), tag: 'pe-weather' });
    return { sent: true, issues, temp: c.temp, uv: c.uv };
  }
  return { sent: false, suitable: true, temp: c.temp, uv: c.uv, condition: c.condition };
}

// ─── Workflow 2: Daily Falkor Briefing v2 ─────────────────────────────────────
async function runDailySummary(env) {
  const pin = env.AGENT_PIN || '';
  const now = new Date();
  const date = now.toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Australia/Melbourne'
  });

  // Fetch all data in parallel
  const [weather, kbtSummary, sportSummary, ventures, calToday, calTomorrow] = await Promise.allSettled([
    getWeather(env, WPS_LAT, WPS_LON),
    fetch(KBT_URL + '/summary', { headers: { 'X-Pin': pin } }).then(function(r) { return r.json(); }),
    fetch(SPORT_URL + '/summary', { headers: { 'X-Pin': pin } }).then(function(r) { return r.json(); }),
    getTopVentures(env, 5),
    fetch(CALENDAR_URL + '/today', { headers: { 'X-Pin': pin } }).then(function(r) { return r.json(); }).catch(function() { return null; }),
    fetch(CALENDAR_URL + '/tomorrow', { headers: { 'X-Pin': pin } }).then(function(r) { return r.json(); }).catch(function() { return null; }),
  ]);

  const w = weather.status === 'fulfilled' ? weather.value : null;
  const kbt = kbtSummary.status === 'fulfilled' ? kbtSummary.value : null;
  const sport = sportSummary.status === 'fulfilled' ? sportSummary.value : null;
  const topVentures = ventures.status === 'fulfilled' ? ventures.value : [];
  const calTodayData = calToday.status === 'fulfilled' ? calToday.value : null;
  const calTomorrowData = calTomorrow.status === 'fulfilled' ? calTomorrow.value : null;
  const todayEvents = (calTodayData && calTodayData.events) ? calTodayData.events : [];
  const tomorrowEvents = (calTomorrowData && calTomorrowData.events) ? calTomorrowData.events : [];

  const sections = [];

  // ── Weather ──
  if (w) {
    const c = w.current;
    const peNote = w.pe_note || (c.uv >= 9 ? 'High UV — hats mandatory.' : c.temp > 30 ? 'Hot one — consider indoor PE.' : c.rain_chance > 60 ? 'Rain likely today.' : 'All clear for outdoor PE.');
    sections.push(
      '<h3>Weather — Williamstown</h3>' +
      '<p>' + c.condition + ', <strong>' + c.temp + '°C</strong> (feels ' + c.feels_like + '°C) · UV <strong>' + c.uv + '</strong> · Wind ' + c.wind_kmh + 'km/h · Rain ' + c.rain_chance + '%</p>' +
      '<p><em>' + peNote + '</em></p>'
    );
  }

  // ── Calendar ──
  var calHtml = '<h3>Calendar</h3>';
  var hasCalContent = false;
  if (todayEvents.length > 0) {
    calHtml += '<p><strong>Today:</strong> ' + todayEvents.map(function(e) {
      return (e.time ? e.time + ' — ' : '') + (e.summary || e.title || String(e));
    }).join('; ') + '</p>';
    hasCalContent = true;
  } else {
    calHtml += '<p><em>Today: nothing scheduled</em></p>';
    hasCalContent = true;
  }
  if (tomorrowEvents.length > 0) {
    calHtml += '<p><strong>Tomorrow:</strong> ' + tomorrowEvents.map(function(e) {
      return (e.time ? e.time + ' — ' : '') + (e.summary || e.title || String(e));
    }).join('; ') + '</p>';
  }
  if (hasCalContent) sections.push(calHtml);

  // ── Top Venture Priorities ──
  if (topVentures.length > 0) {
    var rows = topVentures.map(function(v) {
      var age = v.last_updated ? Math.round((Date.now() - new Date(v.last_updated).getTime()) / 86400000) : null;
      var staleness = age !== null && age > 14 ? ' <span style="color:#e67e22">(stale ' + age + 'd)</span>' : '';
      return '<tr><td><strong>' + v.name + '</strong>' + staleness + '</td><td>' + (v.status || '') + '</td><td>$' + ((v.y1 || 0) / 1000).toFixed(0) + 'k</td><td>' + (v.next || '—') + '</td></tr>';
    }).join('');
    sections.push(
      '<h3>Top Priorities</h3>' +
      '<table style="border-collapse:collapse;width:100%">' +
      '<tr style="background:#f0f0f0"><th style="text-align:left;padding:4px 8px">Venture</th><th>Status</th><th>Y1</th><th>Next action</th></tr>' +
      rows + '</table>'
    );
  }

  // ── AFL & Tipping ──
  if (sport && sport.ok) {
    const tipping = sport.tipping_summary || {};
    var aflHtml = '<h3>AFL & Tipping</h3>';
    if (sport.round_description) aflHtml += '<p>' + sport.round_description + '</p>';
    if (sport.todays_games && sport.todays_games.length > 0) {
      sport.todays_games.forEach(function(game) {
        var score = game.score ? ' — <strong>' + game.score + '</strong>' : (game.time ? ' · ' + game.time : '');
        aflHtml += '<p>' + game.home + ' vs ' + game.away + score + '</p>';
      });
    } else if (sport.next_game) {
      const ng = sport.next_game;
      aflHtml += '<p>Next game: ' + ng.home + ' vs ' + ng.away + (ng.date ? ' — ' + ng.date : '') + '</p>';
    }
    if (tipping.leader) {
      aflHtml += '<p>Leaderboard: <strong>' + tipping.leader + '</strong> — ' + (tipping.leader_points || '?') + ' pts';
      if (tipping.paddy_rank) aflHtml += ' · Paddy #' + tipping.paddy_rank;
      aflHtml += '</p>';
    }
    if (sport.family_tips_due) aflHtml += '<p><strong>Family tips due today!</strong></p>';
    sections.push(aflHtml);
  }

  // ── KBT ──
  if (kbt && kbt.ok) {
    var kbtHtml = '<h3>KBT Trivia</h3>';
    kbtHtml += '<p>Upcoming: <strong>' + (kbt.upcoming_events || 0) + '</strong> events · Bank: <strong>' + (kbt.question_bank_size || '?') + '</strong> questions</p>';
    if (kbt.next_event) kbtHtml += '<p>Next: ' + kbt.next_event + '</p>';
    sections.push(kbtHtml);
  }

  // ── AI Opener (Groq) — punchy Jarvis-style greeting ──
  var opener = '';
  try {
    var briefFacts = 'Date: ' + date +
      (w ? '. Weather: ' + w.current.temp + '°C, ' + w.current.condition + ', UV ' + w.current.uv : '') +
      (todayEvents.length > 0 ? '. Calendar today: ' + todayEvents.map(function(e){return e.summary||e.title||'';}).join(', ') : '. Nothing on calendar today') +
      (sport && sport.ok && sport.round_description ? '. AFL: ' + sport.round_description : '') +
      (topVentures.length > 0 ? '. Ventures: ' + topVentures.length + ' active' : '');
    const aiResp = await fetch('https://asgard-ai.luckdragon.io/chat/smart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pin': getAiPin(env) },
      body: JSON.stringify({
        message: 'Write a sharp 2-sentence morning greeting for Paddy in Jarvis-from-Iron-Man style. Facts: ' + briefFacts + '. No emojis. Dry and confident. Address him as "Paddy". Max 35 words.',
        model: 'groq-fast',
        max_tokens: 80,
      }),
    });
    if (aiResp && aiResp.ok) {
      const aiData = await aiResp.json().catch(function() { return {}; });
      opener = aiData.reply || '';
    }
  } catch(e) { /* opener optional */ }

  const openerHtml = opener
    ? '<p style="font-style:italic;color:#444;font-size:1.05em;border-left:3px solid #999;padding-left:12px;margin:12px 0">' + opener + '</p>'
    : '';

  const html = '<h2>Good morning, Paddy! — ' + date + '</h2>' +
    openerHtml +
    sections.join('\n') +
    '<hr/><p><em>Falkor · <a href="https://falkor.luckdragon.io">falkor.luckdragon.io</a></em></p>';

  const pushParts = [];
  if (w) pushParts.push(w.current.temp + '°C UV' + w.current.uv);
  if (todayEvents.length > 0) pushParts.push(todayEvents.length + ' event' + (todayEvents.length > 1 ? 's' : '') + ' today');
  if (sport && sport.ok && sport.todays_games && sport.todays_games.length > 0) pushParts.push('Game day');
  const pushBody = pushParts.join(' · ') || 'Morning briefing ready.';

  await sendEmail(env, { to: PADDY_EMAIL, subject: 'Falkor Daily — ' + date, html });
  await sendPush(env, { title: 'Falkor — ' + date, body: pushBody, tag: 'daily-summary' });
  // ── Telegram morning brief v2 — Jarvis narrative (Phase 49) ─────────────────
  var tgSent = false;
  try {
    // Build rich context for the AI narrative
    var tgCtx = 'Date: ' + date;
    if (w) {
      var c2 = w.current;
      tgCtx += '. Weather: ' + c2.temp + 'C, ' + c2.condition + ', UV ' + c2.uv + ', rain ' + c2.rain_chance + '%';
      if (w.pe_suitable === false) tgCtx += ' (not suitable for outdoor PE)';
      else if (w.pe_suitable === true) tgCtx += ' (good for outdoor PE)';
    }
    if (todayEvents.length > 0) {
      tgCtx += '. Calendar today: ' + todayEvents.slice(0, 4).map(function(e) {
        return (e.time ? e.time + ' ' : '') + (e.summary || e.title || '');
      }).join('; ');
    } else {
      tgCtx += '. Nothing on the calendar today';
    }
    if (sport && sport.ok) {
      if (sport.todays_games && sport.todays_games.length > 0) {
        tgCtx += '. AFL today: ' + sport.todays_games.slice(0, 2).map(function(g) {
          return g.home + ' v ' + g.away + (g.score ? ' (' + g.score + ')' : '');
        }).join(', ');
      } else if (sport.next_game) {
        tgCtx += '. Next AFL game: ' + sport.next_game.home + ' v ' + sport.next_game.away + (sport.next_game.date ? ' on ' + sport.next_game.date : '');
      }
      var tip2 = sport.tipping_summary || {};
      if (tip2.leader) tgCtx += '. Tipping leader: ' + tip2.leader + (tip2.paddy_rank ? ', Paddy is #' + tip2.paddy_rank : '');
      if (sport.family_tips_due) tgCtx += '. IMPORTANT: family footy tips are due today';
      if (sport.nrl_round) tgCtx += '. NRL ' + sport.nrl_round;
      if (sport.nrl_tipping_leader) tgCtx += ', NRL tips leader: ' + sport.nrl_tipping_leader;
    }
    if (topVentures.length > 0) {
      tgCtx += '. Top venture needing attention: ' + topVentures[0].name + (topVentures[0].next ? ' — ' + topVentures[0].next : '');
    }
    // Call AI for narrative brief
    var tgNarrative = '';
    var tgAiResp = await fetch('https://asgard-ai.luckdragon.io/chat/smart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pin': getAiPin(env) },
      body: JSON.stringify({
        message: 'You are Falkor — a Jarvis-style AI for Paddy. Write a flowing morning briefing as a single paragraph of natural prose (no bullet points, no headers, no lists). Weave together the key facts naturally — mention the date, weather, anything on the calendar, sport news, and one venture callout if relevant. Sound like Jarvis briefing Tony Stark: sharp, dry wit, direct. Use "Good morning, Paddy" to open. No emojis. Under 900 characters total. Context: ' + tgCtx,
        model: 'groq-fast',
        max_tokens: 250,
      }),
    });
    if (tgAiResp && tgAiResp.ok) {
      var tgAiData = await tgAiResp.json().catch(function() { return {}; });
      tgNarrative = (tgAiData.reply || '').trim();
    }
    // Fallback to structured brief if AI fails
    if (!tgNarrative) {
      tgNarrative = 'Good morning, Paddy. ' + date + '. ' +
        (w ? w.current.temp + 'C, ' + w.current.condition + ', UV ' + w.current.uv + '. ' : '') +
        (todayEvents.length > 0 ? todayEvents.length + ' event' + (todayEvents.length > 1 ? 's' : '') + ' today. ' : '') +
        (sport && sport.ok && sport.family_tips_due ? 'Tips due today. ' : '');
    }
    if (tgNarrative.length > 1000) tgNarrative = tgNarrative.slice(0, 997) + '...';
    tgSent = await sendTelegram(env, tgNarrative);
  } catch(e2) { /* telegram optional */ }

  return { sent: true, date, sections: sections.length, ventures: topVentures.length, calendar_today: todayEvents.length, opener_generated: !!opener, tg_sent: tgSent };
}

// ─── Smart Proactive Rules Engine v2 ─────────────────────────────────────────

// ── Paddy state detector (AEST mode awareness) ───────────────────────────────
function getPaddyState() {
  const nowAEST = new Date(Date.now() + 10 * 60 * 60 * 1000);
  const h = nowAEST.getUTCHours();
  const d = nowAEST.getUTCDay(); // 0=Sun, 1=Mon, ... 5=Fri, 6=Sat
  const isWeekday = d >= 1 && d <= 5;
  if (h >= 23 || h < 6)  return { mode: 'sleep',   quiet: true,  label: 'asleep'                    };
  if (isWeekday && h >= 8  && h < 15) return { mode: 'school',  quiet: true,  label: 'at school (WPS)'          };
  if (isWeekday && h >= 7  && h < 8)  return { mode: 'commute', quiet: false, label: 'commuting to school'       };
  if (isWeekday && h >= 15 && h < 16) return { mode: 'commute', quiet: false, label: 'leaving school'            };
  return { mode: 'free', quiet: false, label: 'free' };
}

// ── Send Telegram message ─────────────────────────────────────────────────────
async function sendTelegram(env, text) {
  try {
    // Preferred: call Telegram API directly (avoids inter-worker AGENT_PIN sync)
    const token = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      });
      if (r.ok) {
        const d = await r.json().catch(() => ({}));
        if (d.result && d.result.message_id) return true;
      }
    }
    // Fallback: route via falkor-telegram proxy
    const tgUrl = (env.TELEGRAM_URL || 'https://falkor-telegram.luckdragon.io') + '/send';
    const r2 = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pin': env.AGENT_PIN || '' },
      body: JSON.stringify({ text, target: 'paddy', parse_mode: 'HTML' }),
    });
    if (!r2.ok) return false;
    const d2 = await r2.json().catch(() => ({}));
    return !!(d2.message_id || (d2.result && d2.result.message_id));
  } catch { return false; }
}

async function runSmartAlerts(env) {
  const paddyState = getPaddyState();
  // Never alert during sleep hours
  if (paddyState.mode === 'sleep') return { fired: [], total: 0, skipped: 'sleep' };
  const fired = [];
  const now = Date.now();
  const utcHour = new Date(now).getUTCHours();
  const aestHour = (utcHour + 10) % 24;
  const dayOfWeek = new Date(now).getUTCDay(); // 0=Sun, 6=Sat

  if (aestHour < 6 || aestHour > 21) return { skipped: true, reason: 'outside hours', h: aestHour };

  // ── Rule 1: School sport event + rain forecast ───────────────────────────
  try {
    const calResp = await fetch(CALENDAR_URL + '/week', { headers: { 'X-Pin': env.AGENT_PIN } }).catch(() => null);
    if (calResp && calResp.ok) {
      const calData = await calResp.json();
      const events = calData.events || [];
      const today = new Date(now);
      const keywords = ['cross country', 'carnival', 'athletics', 'sports day', 'district'];

      for (var i = 0; i < events.length; i++) {
        var evt = events[i];
        var evtDate = new Date(evt.start || evt.date);
        var daysAway = Math.round((evtDate - today) / 86400000);
        var name = (evt.summary || '').toLowerCase();
        var isSchoolEvent = keywords.some(function(k) { return name.includes(k); });

        if (isSchoolEvent && daysAway >= 0 && daysAway <= 2) {
          var weatherResp = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=-37.86&longitude=144.90&daily=precipitation_probability_max&timezone=Australia%2FMelbourne&forecast_days=3'
          ).catch(() => null);
          if (weatherResp && weatherResp.ok) {
            var wx = await weatherResp.json();
            var rainChance = ((wx.daily && wx.daily.precipitation_probability_max) || [])[daysAway] || 0;
            if (rainChance >= 60) {
              var alertKey = 'school_event_rain_' + evt.summary + '_' + evtDate.toDateString();
              if (!(await checkAlertFired(env, alertKey))) {
                var title = '' + (evt.summary || 'School event') + ' — rain likely!';
                var body = daysAway === 0
                  ? 'Today: ' + rainChance + '% rain. Consider a backup plan.'
                  : 'In ' + daysAway + 'd: ' + rainChance + '% rain chance. Plan ahead!';
                await sendPush(env, { title, body, tag: 'school-weather' });
                await sendEmail(env, { to: PADDY_EMAIL, subject: title, html: '<p>' + body + '</p><p>Event: <strong>' + (evt.summary||'') + '</strong></p>' });
                await markAlertFired(env, alertKey);
                fired.push({ rule: 'school_event_rain', event: evt.summary, rain: rainChance });
              }
            }
          }
        }
      }
    }
  } catch (e) { console.warn('Rule 1 failed:', e.message); }

  // ── Rule 2: KBT event tomorrow ───────────────────────────────────────────
  try {
    const calResp = await fetch(CALENDAR_URL + '/tomorrow', { headers: { 'X-Pin': env.AGENT_PIN } }).catch(() => null);
    if (calResp && calResp.ok) {
      const calData = await calResp.json();
      const events = calData.events || [];
      const kbtKeywords = ['kbt', 'trivia', 'kow brainer', 'quiz night'];
      for (var i = 0; i < events.length; i++) {
        var evt = events[i];
        var nm = (evt.summary || '').toLowerCase();
        if (kbtKeywords.some(function(k) { return nm.includes(k); })) {
          var alertKey = 'kbt_reminder_' + evt.summary;
          if (!(await checkAlertFired(env, alertKey))) {
            await sendPush(env, { title: 'KBT tomorrow: ' + (evt.summary || 'Trivia night'), body: 'Prep your questions!', tag: 'kbt-reminder' });
            await markAlertFired(env, alertKey);
            fired.push({ rule: 'kbt_reminder', event: evt.summary });
          }
        }
      }
    }
  } catch (e) { console.warn('Rule 2 failed:', e.message); }

  // ── Rule 3: AFL game-day mode (Melbourne Demons) ─────────────────────────
  try {
    const sportResp = await fetch(SPORT_URL + '/today', { headers: { 'X-Pin': env.AGENT_PIN } }).catch(() => null);
    if (sportResp && sportResp.ok) {
      const sportData = await sportResp.json();
      const games = sportData.games || [];
      for (var i = 0; i < games.length; i++) {
        var g = games[i];
        var teams = ((g.hteam || '') + ' ' + (g.ateam || '')).toLowerCase();
        if (teams.includes('melbourne') || teams.includes('demons')) {
          var alertKey = 'afl_gameday_' + g.id;
          if (!(await checkAlertFired(env, alertKey, 86400000))) {
            var kickoff = g.localtime ? new Date(g.localtime).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Melbourne' }) : 'today';
            var opponent = teams.includes('melbourne') ? (g.hteam === 'Melbourne' ? g.ateam : g.hteam) : '?';
            await sendPush(env, {
              title: 'Dees on today vs ' + opponent,
              body: 'Kick-off ' + kickoff + ' — go Demons!',
              url: 'https://falkor.luckdragon.io',
              tag: 'afl-gameday',
            });
            await markAlertFired(env, alertKey);
            fired.push({ rule: 'afl_gameday', game: g.hteam + ' v ' + g.ateam });
          }
        }
      }
    }
  } catch (e) { console.warn('Rule 3 failed:', e.message); }

  // ── Rule 4: Saturday tipping reminder (8am–10am AEST) ────────────────────
  if (dayOfWeek === 6 && aestHour >= 8 && aestHour <= 10) {
    try {
      const alertKey = 'tipping_reminder_' + new Date(now).toDateString();
      if (!(await checkAlertFired(env, alertKey, 86400000))) {
        const sportResp = await fetch(SPORT_URL + '/tipping', { headers: { 'X-Pin': env.AGENT_PIN } }).catch(() => null);
        var tippingOpen = true;
        if (sportResp && sportResp.ok) {
          const td = await sportResp.json();
          tippingOpen = td.round_open !== false;
        }
        if (tippingOpen) {
          await sendPush(env, {
            title: 'Have you tipped yet?',
            body: 'AFL tips are open — get in before lockout!',
            url: 'https://falkor.luckdragon.io',
            tag: 'tipping-reminder',
          });
          await markAlertFired(env, alertKey);
          fired.push({ rule: 'tipping_reminder' });
        }
      }
    } catch (e) { console.warn('Rule 4 failed:', e.message); }
  }

  // ── Rule 5: Racing day alert (Melbourne Cup Carnival + feature races) ─────
  try {
    const sportResp = await fetch(SPORT_URL + '/racing/today', { headers: { 'X-Pin': env.AGENT_PIN } }).catch(() => null);
    if (sportResp && sportResp.ok) {
      const raceData = await sportResp.json();
      const featureRaces = (raceData.feature_races || []).filter(function(r) { return r.is_feature; });
      for (var i = 0; i < featureRaces.length; i++) {
        var race = featureRaces[i];
        var alertKey = 'race_day_' + (race.name || 'feature') + '_' + new Date(now).toDateString();
        if (!(await checkAlertFired(env, alertKey, 86400000))) {
          await sendPush(env, {
            title: (race.name || 'Feature race') + ' today!',
            body: (race.venue || 'Track') + ' · ' + (race.time || '') + (race.favourite ? ' · Fav: ' + race.favourite : ''),
            url: 'https://falkor.luckdragon.io',
            tag: 'race-day',
          });
          await markAlertFired(env, alertKey);
          fired.push({ rule: 'race_day', race: race.name });
        }
      }
    }
  } catch (e) { console.warn('Rule 5 failed:', e.message); }

  // ── Rule 6: Venture momentum nudge (high-priority, inactive 14+ days) ────
  if (aestHour >= 9 && aestHour <= 10) {
    try {
      var ventures = await getTopVentures(env, 10);
      var staleVentures = ventures.filter(function(v) {
        if (!v.last_updated) return false;
        var daysSince = (Date.now() - new Date(v.last_updated).getTime()) / 86400000;
        return daysSince >= 14;
      });
      if (staleVentures.length > 0) {
        var top = staleVentures[0];
        var daysSince = Math.round((Date.now() - new Date(top.last_updated).getTime()) / 86400000);
        var alertKey = 'venture_nudge_' + top.name + '_' + new Date(now).toDateString();
        if (!(await checkAlertFired(env, alertKey, 86400000 * 7))) {
          await sendPush(env, {
            title: top.name + ' needs attention',
            body: daysSince + ' days since last update. Next: ' + (top.next || 'check dashboard'),
            url: 'https://falkor-dashboard.luckdragon.io',
            tag: 'venture-nudge',
          });
          await markAlertFired(env, alertKey);
          fired.push({ rule: 'venture_nudge', venture: top.name, days: daysSince });
        }
      }
    } catch (e) { console.warn('Rule 6 failed:', e.message); }
  }


  // ── Rule: Essendon kickoff alert (push 10–35 mins before game) ───────────
  try {
    var essenResp = await fetch(SPORT_URL + '/afl/games', { headers: { 'X-Pin': env.AGENT_PIN } }).catch(() => null);
    if (essenResp && essenResp.ok) {
      var essenData = await essenResp.json();
      var gamesArr = Array.isArray(essenData) ? essenData : (essenData.games || []);
      for (var gi = 0; gi < gamesArr.length; gi++) {
        var g = gamesArr[gi];
        var ht = (g.hteam || '').toLowerCase();
        var at = (g.ateam || '').toLowerCase();
        if (ht.includes('essendon') || at.includes('essendon') || ht.includes('bombers') || at.includes('bombers')) {
          var kickoffMs = g.date ? new Date(g.date).getTime() : (g.localtime ? new Date(g.localtime).getTime() : 0);
          if (kickoffMs > 0) {
            var minsAway = (kickoffMs - Date.now()) / 60000;
            if (minsAway >= 10 && minsAway <= 35) {
              var kickKey = 'essendon_kickoff_' + (g.id || ht + at);
              if (!(await checkAlertFired(env, kickKey, 3 * 3600 * 1000))) {
                var opp = (ht.includes('essendon') || ht.includes('bombers')) ? g.ateam : g.hteam;
                await sendPush(env, {
                  title: 'Bombers about to kick off!',
                  body: 'Essendon vs ' + opp + ' — ' + Math.round(minsAway) + ' mins away. Go Bombers.',
                  tag: 'afl-kickoff', url: 'https://falkor.luckdragon.io',
                });
                await markAlertFired(env, kickKey);
                fired.push({ rule: 'essendon_kickoff', game: g.hteam + ' v ' + g.ateam });
              }
            }
          }
        }
      }
    }
  } catch (e) { console.warn('Essendon kickoff rule:', e.message); }

  // ── Rule: Footy tips deadline (Thursday 7–8pm AEST = 9–10am UTC) ─────────
  try {
    if (dayOfWeek === 4 && utcHour >= 9 && utcHour <= 10) {
      var tipKey = 'footy_tip_deadline_' + new Date(now).toDateString();
      if (!(await checkAlertFired(env, tipKey, 4 * 3600 * 1000))) {
        await sendPush(env, {
          title: ' Footy tips close tonight!',
          body: 'Get your tips in before the first Thursday game. Tick tock.',
          tag: 'tips-deadline', url: 'https://falkor.luckdragon.io',
        });
        await markAlertFired(env, tipKey);
        fired.push({ rule: 'footy_tip_deadline' });
      }
    }
  } catch (e) { console.warn('Tip deadline rule:', e.message); }

  // ── Rule: Calendar 15-min reminders ──────────────────────────────────────
  try {
    var calTodayResp = await fetch(CALENDAR_URL + '/today', { headers: { 'X-Pin': env.AGENT_PIN } }).catch(() => null);
    if (calTodayResp && calTodayResp.ok) {
      var calTodayData = await calTodayResp.json();
      var todayEvts = calTodayData.events || [];
      for (var ci = 0; ci < todayEvts.length; ci++) {
        var tevt = todayEvts[ci];
        var tevtMs = new Date(tevt.start || tevt.date).getTime();
        var minsTo = (tevtMs - now) / 60000;
        if (minsTo >= 10 && minsTo <= 20) {
          var calKey = 'cal_15min_' + (tevt.id || (tevt.summary || ci)) + '_' + Math.floor(tevtMs / 3600000);
          if (!(await checkAlertFired(env, calKey, 30 * 60 * 1000))) {
            await sendPush(env, {
              title: 'In ~' + Math.round(minsTo) + ' mins: ' + (tevt.summary || 'Event'),
              body: tevt.location ? 'At ' + tevt.location : 'Starting soon',
              tag: 'calendar-reminder', url: 'https://falkor.luckdragon.io',
            });
            await markAlertFired(env, calKey);
            fired.push({ rule: 'calendar_15min', event: tevt.summary });
          }
        }
      }
    }
  } catch (e) { console.warn('Calendar 15min rule:', e.message); }

  // ── Deliver fired alerts via email + Telegram ───────────────────────────
  if (fired.length > 0) {
    const state = paddyState || getPaddyState();

    // Email: send a consolidated summary (skip during school unless urgent)
    const urgentRules = ['afl_gameday', 'essendon_kickoff', 'calendar_15min'];
    const hasUrgent = fired.some(function(a) { return urgentRules.some(function(r) { return (a.rule||'').startsWith(r); }); });
    const skipEmailSchool = (state.mode === 'school') && !hasUrgent;

    if (!skipEmailSchool && env.RESEND_API_KEY) {
      try {
        const alertLines = fired.map(function(a) {
          return '<li><strong>' + (a.rule || 'alert') + '</strong>' + (a.event ? ': ' + a.event : '') + (a.rain ? ' (' + a.rain + '% rain)' : '') + '</li>';
        }).join('');
        const stateLabel = state.label || state.mode;
        await sendEmail(env, {
          to: PADDY_EMAIL,
          subject: 'Falkor: ' + fired.length + ' alert' + (fired.length > 1 ? 's' : '') + ' fired',
          html: '<h2>Falkor Smart Alerts</h2><ul>' + alertLines + '</ul><p style="color:#888;font-size:12px">Sent at ' + new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' }) + ' — you are: ' + stateLabel + '</p>',
        });
      } catch (emailErr) { console.warn('Email delivery failed:', emailErr.message); }
    }

    // Telegram: one message per alert (if configured)
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      for (const alert of fired) {
        const label = (alert.rule || 'alert') + (alert.event ? ': ' + alert.event : '');
        await sendTelegram(env, '\u{1F514} ' + label).catch(function() {});
      }
    }
  }

  // ── Phase 45: AI-powered Jarvis insight layer ──────────────────────────────
  // Runs once per 30 mins regardless of rule firings — adds ambient intelligence
  try {
    var aiInsightKey = 'ai_insights_' + Math.floor(Date.now() / (30 * 60 * 1000));
    if (!(await checkAlertFired(env, aiInsightKey, 29 * 60 * 1000))) {
      // Build compact context for AI
      var ctxParts = [];
      var nowAESTx = new Date(Date.now() + 10 * 3600 * 1000);
      ctxParts.push('Time: ' + nowAESTx.toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' }));
      ctxParts.push('Paddy is: ' + paddyState.label);

      // Weather
      var wxCtx = await getWeather(env, WPS_LAT, WPS_LON).catch(function() { return null; });
      if (wxCtx && wxCtx.current) { ctxParts.push('Weather: ' + wxCtx.current.temp + 'C ' + wxCtx.current.condition + ' UV' + wxCtx.current.uv + ' Rain' + wxCtx.current.rain_chance + '%'); }

      // Calendar
      var calCtxResp = await fetch(CALENDAR_URL + '/today', { headers: { 'X-Pin': env.AGENT_PIN } }).catch(function() { return null; });
      if (calCtxResp && calCtxResp.ok) {
        var calCtxData = await calCtxResp.json().catch(function() { return {}; });
        var evtNames = (calCtxData.events || []).map(function(e) { return (e.summary || e.title || ''); }).filter(Boolean);
        ctxParts.push(evtNames.length > 0 ? 'Calendar today: ' + evtNames.join(', ') : 'Calendar: nothing today');
      }

      // Sport
      var spCtxResp = await fetch(SPORT_URL + '/summary', { headers: { 'X-Pin': env.AGENT_PIN } }).catch(function() { return null; });
      if (spCtxResp && spCtxResp.ok) {
        var spCtx = await spCtxResp.json().catch(function() { return {}; });
        if (spCtx.round_description) ctxParts.push('AFL: ' + spCtx.round_description);
        var tipCtx = spCtx.tipping_summary || {};
        if (tipCtx.leader) ctxParts.push('Tipping leader: ' + tipCtx.leader + (tipCtx.paddy_rank ? ', Paddy rank: ' + tipCtx.paddy_rank : ''));
        if (spCtx.family_tips_due) ctxParts.push('AFL tips due today!');
      }

      // Top venture
      var vcCtx = await getTopVentures(env, 1).catch(function() { return []; });
      if (vcCtx && vcCtx.length > 0) { ctxParts.push('Top venture: ' + vcCtx[0].name + ' (' + (vcCtx[0].status || 'active') + '), next: ' + (vcCtx[0].next || 'TBD')); }

      // Recently fired rules
      if (fired.length > 0) { ctxParts.push('Rules just fired: ' + fired.map(function(a){ return a.rule; }).join(', ')); }

      var ctxStr = ctxParts.join('. ');
      var aiPrompt = 'You are Falkor, a Jarvis-style AI assistant. Based on this real-time context, generate 0-3 concise actionable insights for Paddy RIGHT NOW. Each insight must be specific, useful, and under 80 chars. Skip generic advice. If nothing is worth saying, return empty array. Context: ' + ctxStr + '. Respond ONLY with a JSON array of strings e.g. ["insight 1","insight 2"] or [].';

      var aiRes = await fetch('https://asgard-ai.luckdragon.io/chat/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Pin': getAiPin(env) },
        body: JSON.stringify({ message: aiPrompt, model: 'groq-fast', max_tokens: 200 }),
      }).catch(function() { return null; });

      if (aiRes && aiRes.ok) {
        var aiData = await aiRes.json().catch(function() { return {}; });
        var aiReply = aiData.reply || aiData.text || '';
        // Extract JSON array from reply
        var arrMatch = aiReply.match(/\[.*?\]/s);
        if (arrMatch) {
          var insights = JSON.parse(arrMatch[0]);
          if (Array.isArray(insights) && insights.length > 0) {
            var tgInsight = '\u{1F9E0} <b>Falkor Insights</b>\n' + insights.map(function(s, i) { return (i+1) + '. ' + s; }).join('\n');
            await sendTelegram(env, tgInsight).catch(function() {});
            await markAlertFired(env, aiInsightKey);
            fired.push({ rule: 'ai_insights', count: insights.length });
          }
        }
      }
    }
  } catch(aiErr) { console.warn('AI insights layer:', aiErr.message); }

  return { fired, total: fired.length };
}


// ─── Phase 22: Autonomous Task Executor ──────────────────────────────────────
const WEB_URL = 'https://falkor-web.luckdragon.io';

async function createTask(env, { title, type = 'research', query, params = {}, userId = 'paddy', notify = 1 }) {
  if (!env.DB) throw new Error('DB not bound');
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS falkor_tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT DEFAULT \'paddy\', title TEXT NOT NULL, type TEXT DEFAULT \'research\', query TEXT, params TEXT, status TEXT DEFAULT \'pending\', result TEXT, error TEXT, notify INTEGER DEFAULT 1, created_at INTEGER DEFAULT (unixepoch()), started_at INTEGER, completed_at INTEGER)'
  ).run();
  const row = await env.DB.prepare(
    'INSERT INTO falkor_tasks (user_id, title, type, query, params, notify) VALUES (?, ?, ?, ?, ?, ?) RETURNING id'
  ).bind(userId, title, type, query || title, JSON.stringify(params), notify).first();
  return row ? row.id : null;
}

async function runTaskExecutor(env) {
  if (!env.DB) return { skipped: true, reason: 'no DB' };
  const pin = env.AGENT_PIN || '';

  // Ensure table exists
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS falkor_tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT DEFAULT \'paddy\', title TEXT NOT NULL, type TEXT DEFAULT \'research\', query TEXT, params TEXT, status TEXT DEFAULT \'pending\', result TEXT, error TEXT, notify INTEGER DEFAULT 1, created_at INTEGER DEFAULT (unixepoch()), started_at INTEGER, completed_at INTEGER)'
  ).run();

  // Pick ONE pending task
  const task = await env.DB.prepare(
    'SELECT * FROM falkor_tasks WHERE status = \'pending\' ORDER BY created_at ASC LIMIT 1'
  ).first();

  if (!task) return { ran: 0 };

  // Mark running
  await env.DB.prepare('UPDATE falkor_tasks SET status = \'running\', started_at = ? WHERE id = ?')
    .bind(Date.now(), task.id).run();

  const params = JSON.parse(task.params || '{}');
  let result = null;
  let error = null;

  try {
    switch (task.type) {

      // ── Research: try falkor-web (Tavily), fall back to DuckDuckGo ────────
      case 'research': {
        var searchAnswer = '';
        var searchResults = [];

        // Attempt 1: falkor-web via Service Binding (direct W2W, no network hop)
        try {
          var fwHeaders = { 'Content-Type': 'application/json', 'X-Pin': pin };
          var fwResp;
          if (env.WEB_SERVICE) {
            // Service binding: direct Worker-to-Worker call
            fwResp = await env.WEB_SERVICE.fetch('https://falkor-web.luckdragon.io/search', {
              method: 'POST',
              headers: fwHeaders,
              body: JSON.stringify({ query: task.query }),
            });
          } else {
            // Fallback: try workers.dev URL (avoids luckdragon.io proxy loop)
            fwResp = await fetch(WEB_URL + '/search', {
              method: 'POST',
              headers: fwHeaders,
              body: JSON.stringify({ query: task.query }),
            });
          }
          if (fwResp.ok) {
            var fwData = await fwResp.json();
            if (fwData && fwData.ok) {
              searchAnswer = fwData.answer || '';
              searchResults = fwData.results || [];
            }
          }
        } catch(e2) { console.warn('falkor-web search failed:', e2.message); }

        // Fallback: DuckDuckGo Instant Answer (no key needed)
        if (!searchAnswer && searchResults.length === 0) {
          try {
            var ddgUrl = 'https://api.duckduckgo.com/?q=' + encodeURIComponent(task.query) + '&format=json&no_html=1&skip_disambig=1';
            var ddgResp = await fetch(ddgUrl);
            if (ddgResp.ok) {
              var ddg = await ddgResp.json();
              searchAnswer = ddg.AbstractText || ddg.Answer || '';
              searchResults = (ddg.RelatedTopics || []).slice(0, 5).map(function(t2) {
                return { title: t2.Text ? t2.Text.slice(0,60) : '', snippet: t2.Text || '' };
              }).filter(function(t2) { return t2.snippet; });
            }
          } catch(e3) { console.warn('DDG fallback failed:', e3.message); }
        }

        if (!searchAnswer && searchResults.length === 0) {
          result = 'Could not fetch search results for: ' + task.query;
          break;
        }

        var topResults = searchResults.slice(0, 5).map(function(r2, i2) {
          return (i2+1) + '. ' + (r2.title || '') + '\n   ' + (r2.snippet || r2.content || '').slice(0, 180);
        }).join('\n');
        result = (task.query + '\n\n' + (searchAnswer ? searchAnswer + '\n\n' : '') + (topResults ? 'Top results:\n' + topResults : '')).slice(0, 1800);
        break;
      }

      // ── Tipping report: standings + email family ─────────────────────────
      case 'tipping_report': {
        const sportResp = await fetch('https://falkor-sport.luckdragon.io/tipping', {
          headers: { 'X-Pin': pin }
        });
        const sportData = sportResp.ok ? await sportResp.json() : null;
        if (sportData && sportData.ok) {
          const entries = (sportData.entries || []).slice(0, 10);
          result = 'Tipping standings:\n' + entries.map(function(e, i) {
            return (i+1) + '. ' + e.name + ' — ' + e.points + ' pts';
          }).join('\n');
          // Email family
          const to = params.to || 'pgallivan@outlook.com';
          await sendEmail(env, {
            to,
            subject: 'Tipping Report — ' + new Date().toLocaleDateString('en-AU'),
            html: '<h2>Family Tipping Standings</h2><ol>' + entries.map(function(e) {
              return '<li><strong>' + e.name + '</strong> — ' + e.points + ' pts</li>';
            }).join('') + '</ol>',
          });
        } else {
          result = 'Could not fetch tipping data.';
        }
        break;
      }

      // ── Venture report: top priorities + next actions ────────────────────
      case 'venture_report': {
        const ventures = await getTopVentures(env, 8);
        result = 'Top venture priorities:\n' + ventures.map(function(v, i) {
          return (i+1) + '. ' + v.name + ' [' + (v.status||'?') + '] — Next: ' + (v.next || '—');
        }).join('\n');
        await sendEmail(env, {
          to: 'pgallivan@outlook.com',
          subject: 'Venture Priorities — ' + new Date().toLocaleDateString('en-AU'),
          html: '<h2>Top Priorities</h2><table style=\"border-collapse:collapse\"><tr style=\"background:#f0f0f0\"><th style=\"padding:6px 12px;text-align:left\">Venture</th><th>Status</th><th>Next Action</th></tr>' +
            ventures.map(function(v) {
              return '<tr><td style=\"padding:6px 12px\"><strong>' + v.name + '</strong></td><td>' + (v.status||'—') + '</td><td>' + (v.next||'—') + '</td></tr>';
            }).join('') + '</table>',
        });
        break;
      }

      // ── KBT prep: generate trivia questions ──────────────────────────────
      case 'kbt_prep': {
        const topic = params.topic || task.query || 'general knowledge';
        const kbtResp = await fetch('https://falkor-kbt.luckdragon.io/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Pin': pin },
          body: JSON.stringify({ topic, count: params.count || 10 }),
        });
        const kbtData = kbtResp.ok ? await kbtResp.json() : null;
        if (kbtData && kbtData.questions) {
          result = 'Generated ' + kbtData.questions.length + ' questions on "' + topic + '"';
          await sendEmail(env, {
            to: 'pgallivan@outlook.com',
            subject: 'KBT Questions — ' + topic,
            html: '<h2>KBT Questions: ' + topic + '</h2><ol>' +
              kbtData.questions.map(function(q) {
                return '<li><strong>' + (q.question || q) + '</strong>' + (q.answer ? '<br><em>Answer: ' + q.answer + '</em>' : '') + '</li>';
              }).join('') + '</ol>',
          });
        } else {
          result = 'Could not generate KBT questions.';
        }
        break;
      }

      // ── Generic email ────────────────────────────────────────────────────
      case 'email': {
        await sendEmail(env, {
          to: params.to || 'pgallivan@outlook.com',
          subject: params.subject || task.title,
          html: '<p>' + (params.body || task.query) + '</p>',
        });
        result = 'Email sent to ' + (params.to || 'pgallivan@outlook.com');
        break;
      }

      default:
        result = 'Unknown task type: ' + task.type;
    }
  } catch (e) {
    error = e.message;
    result = 'Task failed: ' + e.message;
  }

  // Mark done
  await env.DB.prepare('UPDATE falkor_tasks SET status = ?, result = ?, error = ?, completed_at = ? WHERE id = ?')
    .bind(error ? 'failed' : 'done', result, error || null, Date.now(), task.id).run();

  // Notify via push + email
  if (task.notify) {
    await sendPush(env, {
      title: error ? 'Task failed: ' + task.title : ' Task done: ' + task.title,
      body: (result || '').slice(0, 120),
      url: 'https://falkor.luckdragon.io',
      tag: 'task-' + task.id,
    });
    if (!error) {
      await sendEmail(env, {
        to: 'pgallivan@outlook.com',
        subject: 'Falkor task done: ' + task.title,
        html: '<h2>' + task.title + '</h2><pre style=\"white-space:pre-wrap;font-family:sans-serif\">' + (result || '') + '</pre><p><em>Completed at ' + new Date().toLocaleString('en-AU', {timeZone:'Australia/Melbourne'}) + '</em></p>',
      }).catch(function() {});
    }
  }

  await logRun(env, 'task_executor', { taskId: task.id, type: task.type, title: task.title, ok: !error });
  return { ran: 1, taskId: task.id, type: task.type, ok: !error };
}

// ─── Score watcher ────────────────────────────────────────────────────────────
async function runScoreWatcher(env) {
  if (!env.DB) return { skipped: 'no DB' };
  try {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS live_scores_cache (game_id TEXT PRIMARY KEY, home_score INTEGER, away_score INTEGER, status TEXT, updated_at TEXT)').run();
  } catch (e) {}
  const year = new Date().getFullYear();
  for (let r = 1; r <= 24; r++) {
    try {
      const res = await fetch(SPORT_URL + '/afl/round?year=' + year + '&round=' + r + '&pin=' + env.AGENT_PIN);
      if (!res.ok) continue;
      const data = await res.json();
      const games = Array.isArray(data) ? data : (data.games || []);
      const liveGames = games.filter(function(g) { return g.status === 'live'; });
      if (liveGames.length === 0) {
        const allFinal = games.every(function(g) { return g.status === 'final'; });
        if (!allFinal && games.length > 0) break;
        continue;
      }
      const pushed = [];
      for (var i = 0; i < liveGames.length; i++) {
        var g = liveGames[i];
        var cached = null;
        try { cached = await env.DB.prepare('SELECT * FROM live_scores_cache WHERE game_id = ?').bind(String(g.id)).first(); } catch(e) {}
        var newHome = g.homeScore || 0;
        var newAway = g.awayScore || 0;
        if (!cached || cached.home_score !== newHome || cached.away_score !== newAway) {
          try { await env.DB.prepare('INSERT OR REPLACE INTO live_scores_cache (game_id, home_score, away_score, status, updated_at) VALUES (?, ?, ?, ?, ?)').bind(String(g.id), newHome, newAway, g.status, new Date().toISOString()).run(); } catch(e) {}
          if (cached) {
            try {
              await fetch(PUSH_URL + '/send-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Pin': env.AGENT_PIN },
                body: JSON.stringify({ title: g.home + ' vs ' + g.away, body: g.home + ' ' + newHome + ' – ' + newAway + ' ' + g.away, tag: 'afl-live-' + g.id, url: 'https://falkor.luckdragon.io/?intent=afl' }),
              });
              pushed.push(g.id);
            } catch(e) {}
          }
        }
      }
      return { ok: true, round: r, live: liveGames.length, pushed: pushed.length };
    } catch (e) { continue; }
  }
  return { ok: true, round: null, live: 0, pushed: 0 };
}

// ─── Weekly summary ───────────────────────────────────────────────────────────
async function runWeeklySummary(env) {
  var year = new Date().getFullYear();
  var weekOfYear = Math.floor((Date.now() - new Date(year, 0, 1).getTime()) / (7 * 24 * 3600 * 1000));
  var round = Math.max(1, Math.min(24, weekOfYear - 13));
  var compData = null, lastRoundGames = [], upcomingGames = [];
  try { var r1 = await fetch(SPORT_URL + '/afl/comp?year=' + year + '&round=' + round + '&pin=' + env.AGENT_PIN); compData = await r1.json(); } catch(e) {}
  try { var r2 = await fetch(SPORT_URL + '/afl/round?year=' + year + '&round=' + round + '&pin=' + env.AGENT_PIN); var d2 = await r2.json(); lastRoundGames = Array.isArray(d2) ? d2 : (d2.games || []); } catch(e) {}
  try { var r3 = await fetch(SPORT_URL + '/afl/round?year=' + year + '&round=' + (round+1) + '&pin=' + env.AGENT_PIN); var d3 = await r3.json(); upcomingGames = Array.isArray(d3) ? d3 : (d3.games || []); } catch(e) {}
  var season = (compData && compData.season) ? compData.season : [];
  var standingsRows = season.map(function(p, i) {
    var medal = i === 0 ? ' (1st)' : i === 1 ? ' (2nd)' : i === 2 ? ' (3rd)' : '';
    return '<tr style="background:' + (i%2===0?'#f9f9fc':'#fff') + '"><td style="padding:8px 12px">' + (i+1) + medal + '</td><td style="padding:8px 12px;font-weight:' + (i===0?'700':'400') + '">' + p.player + '</td><td style="padding:8px 12px;text-align:center;color:#22c55e;font-weight:600">' + p.correct + '</td><td style="padding:8px 12px;text-align:center">' + p.total + '</td><td style="padding:8px 12px;text-align:center;color:#72728a">' + p.pct + '%</td></tr>';
  }).join('');
  var resultsRows = lastRoundGames.filter(function(g){return g.status==='final';}).map(function(g) {
    return '<tr><td style="padding:6px 12px;font-weight:' + (g.winner===g.home?'700':'400') + '">' + g.home + '</td><td style="padding:6px 12px;text-align:center;color:#72728a">' + (g.homeScore||0) + ' – ' + (g.awayScore||0) + '</td><td style="padding:6px 12px;font-weight:' + (g.winner===g.away?'700':'400') + '">' + g.away + '</td></tr>';
  }).join('');
  var upcomingRows = upcomingGames.slice(0,6).map(function(g) {
    return '<tr><td style="padding:6px 12px">' + g.home + '</td><td style="padding:6px 12px;text-align:center;color:#72728a">vs</td><td style="padding:6px 12px">' + g.away + '</td><td style="padding:6px 4px;font-size:12px;color:#72728a">' + ((g.date||'').slice(0,10)) + '</td></tr>';
  }).join('');
  var html = '<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;background:#f4f4f8;margin:0;padding:24px"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)"><div style="background:linear-gradient(135deg,#6c63ff,#a78bfa);padding:28px 32px;color:#fff"><div style="font-size:28px;margin-bottom:4px"> Falkor</div><h1 style="margin:0;font-size:22px;font-weight:800">Weekly AFL Summary</h1><p style="margin:4px 0 0;opacity:.8">Round ' + round + ' wrap-up</p></div><div style="padding:28px 32px">'
    + (season.length ? '<h2 style="font-size:16px;font-weight:700;margin:0 0 12px">&#127942; Tips Leaderboard</h2><table style="width:100%;border-collapse:collapse;margin-bottom:28px"><thead><tr style="background:#f4f4f8"><th style="padding:8px 12px;text-align:left;font-size:12px;color:#72728a">#</th><th style="padding:8px 12px;text-align:left;font-size:12px;color:#72728a">Player</th><th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">Correct</th><th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">Total</th><th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">%</th></tr></thead><tbody>' + standingsRows + '</tbody></table>' : '')
    + (resultsRows ? '<h2 style="font-size:16px;font-weight:700;margin:0 0 12px">&#128203; Round ' + round + ' Results</h2><table style="width:100%;border-collapse:collapse;margin-bottom:28px"><tbody>' + resultsRows + '</tbody></table>' : '')
    + (upcomingRows ? '<h2 style="font-size:16px;font-weight:700;margin:0 0 12px">&#128197; Round ' + (round+1) + ' Fixtures</h2><table style="width:100%;border-collapse:collapse;margin-bottom:28px"><tbody>' + upcomingRows + '</tbody></table>' : '')
    + '<div style="background:#f4f4f8;border-radius:10px;padding:16px 20px"><p style="margin:0;font-size:13px;color:#72728a">Submit Round ' + (round+1) + ' tips: <a href="https://falkor.luckdragon.io/?intent=tips" style="color:#6c63ff;font-weight:600">falkor.luckdragon.io</a></p></div></div><div style="padding:16px 32px;background:#f4f4f8;text-align:center"><p style="margin:0;font-size:12px;color:#72728a">Sent by Falkor</p></div></div></body></html>';
  await sendEmail(env, { to: PADDY_EMAIL, subject: 'Falkor AFL Weekly — Round ' + round + ' wrap-up', html: html });
  return { ok: true, round: round, standings: season.length, results: lastRoundGames.filter(function(g){return g.status==='final';}).length };
}


// ─── Racing Weekly Summary (Phase 28A) ───────────────────────────────────────
async function runRacingWeeklySummary(env) {
  const pin = env.AGENT_PIN || '';

  // Get full leaderboard
  var lbResp = await fetch(SPORT_URL + '/racing/leaderboard', { headers: { 'X-Pin': pin } }).catch(function() { return null; });
  var leaderboard = [];
  if (lbResp && lbResp.ok) {
    var lbData = await lbResp.json();
    leaderboard = lbData.leaderboard || [];
  }

  if (leaderboard.length === 0) {
    return { ok: true, skipped: true, reason: 'no tips yet this season' };
  }

  var date = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Melbourne' });

  // Medal rows
  var lbRows = leaderboard.map(function(p, i) {
    var medal = i === 0 ? ' (1st)' : i === 1 ? ' (2nd)' : i === 2 ? ' (3rd)' : '';
    var isLeader = i === 0;
    return '<tr style="background:' + (i%2===0?'#f9f9fc':'#fff') + '">' +
      '<td style="padding:8px 12px">' + (i+1) + medal + '</td>' +
      '<td style="padding:8px 12px;font-weight:' + (isLeader?'700':'400') + '">' + p.player + '</td>' +
      '<td style="padding:8px 12px;text-align:center;color:#22c55e;font-weight:600">' + p.wins + '</td>' +
      '<td style="padding:8px 12px;text-align:center">' + p.total + '</td>' +
      '<td style="padding:8px 12px;text-align:center;color:#72728a">' + p.pct + '%</td>' +
      '<td style="padding:8px 12px;text-align:center;color:#72728a">' + p.days + 'd</td>' +
      '</tr>';
  }).join('');

  var leader = leaderboard[0];
  var html = '<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f4f8;margin:0;padding:24px">' +
    '<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">' +
    '<div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:28px 32px;color:#fff">' +
    '<div style="font-size:28px;margin-bottom:4px">Falkor Racing</div>' +
    '<h1 style="margin:0;font-size:22px;font-weight:800">Weekly Racing Leaderboard</h1>' +
    '<p style="margin:4px 0 0;opacity:.85">' + date + '</p></div>' +
    '<div style="padding:28px 32px">' +
    '<p style="margin:0 0 16px;color:#444">Leader this week: <strong>' + leader.player + '</strong> with ' + leader.wins + ' winner' + (leader.wins !== 1 ? 's' : '') + ' from ' + leader.total + ' tips (' + leader.pct + '% strike rate) </p>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:24px">' +
    '<thead><tr style="background:#f4f4f8">' +
    '<th style="padding:8px 12px;text-align:left;font-size:12px;color:#72728a">#</th>' +
    '<th style="padding:8px 12px;text-align:left;font-size:12px;color:#72728a">Player</th>' +
    '<th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">Wins</th>' +
    '<th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">Tips</th>' +
    '<th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">%</th>' +
    '<th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">Days</th>' +
    '</tr></thead><tbody>' + lbRows + '</tbody></table>' +
    '<div style="background:#f4f4f8;border-radius:10px;padding:16px 20px">' +
    '<p style="margin:0;font-size:13px;color:#72728a">Tip next Saturday races: ' +
    '<a href="https://falkor.luckdragon.io/?intent=racing" style="color:#f59e0b;font-weight:600">falkor.luckdragon.io</a></p>' +
    '</div></div>' +
    '<div style="padding:16px 32px;background:#f4f4f8;text-align:center">' +
    '<p style="margin:0;font-size:12px;color:#72728a">Sent by Falkor · Racing Tips</p>' +
    '</div></div></body></html>';

  await sendEmail(env, { to: PADDY_EMAIL, subject: 'Racing Leaderboard — ' + date, html: html });
  await sendPush(env, {
    title: 'Weekly racing wrap — ' + leader.player + ' leads!',
    body: leader.player + ': ' + leader.wins + ' wins from ' + leader.total + ' tips (' + leader.pct + '%)',
    url: 'https://falkor.luckdragon.io/?intent=racing',
    tag: 'racing-weekly',
  });

  await logRun(env, 'racing_weekly_summary', { date: date, players: leaderboard.length, leader: leader.player });
  return { ok: true, date: date, players: leaderboard.length, leader: leader.player };
}

// ─── Racing Results Scorer (Phase 27C) ───────────────────────────────────────
async function runRacingResults(env) {
  const pin = env.AGENT_PIN || '';
  const today = new Date().toISOString().slice(0, 10);

  // Score yesterday's tips (racing runs afternoon AEST, score at 9am UTC next day = 7pm AEST same day)
  var scoreResult = null;
  try {
    var scoreResp = await fetch(SPORT_URL + '/racing/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pin': pin },
      body: JSON.stringify({ date: today }),
    });
    if (scoreResp.ok) {
      scoreResult = await scoreResp.json();
    }
  } catch(e) { console.warn('runRacingResults score:', e.message); }

  // Get leaderboard
  var leaderboard = [];
  try {
    var lbResp = await fetch(SPORT_URL + '/racing/leaderboard', { headers: { 'X-Pin': pin } });
    if (lbResp.ok) {
      var lbData = await lbResp.json();
      leaderboard = lbData.leaderboard || [];
    }
  } catch(e) { console.warn('runRacingResults leaderboard:', e.message); }

  if (leaderboard.length === 0 && (!scoreResult || !scoreResult.scored)) {
    return { ok: true, skipped: true, reason: 'no tips to score' };
  }

  // Build email
  var lbRows = leaderboard.map(function(p, i) {
    var medal = i === 0 ? ' (1st)' : i === 1 ? ' (2nd)' : i === 2 ? ' (3rd)' : '';
    return '<tr style="background:' + (i%2===0?'#f9f9fc':'#fff') + '">' +
      '<td style="padding:8px 12px">' + (i+1) + medal + '</td>' +
      '<td style="padding:8px 12px;font-weight:' + (i===0?'700':'400') + '">' + p.player + '</td>' +
      '<td style="padding:8px 12px;text-align:center;color:#22c55e;font-weight:600">' + p.wins + '</td>' +
      '<td style="padding:8px 12px;text-align:center">' + p.total + '</td>' +
      '<td style="padding:8px 12px;text-align:center;color:#72728a">' + p.pct + '%</td>' +
      '<td style="padding:8px 12px;text-align:center;color:#72728a">' + p.days + 'd</td>' +
      '</tr>';
  }).join('');

  var scoreHtml = '';
  if (scoreResult && scoreResult.scored > 0) {
    scoreHtml = '<h3 style="font-size:15px;font-weight:700;margin:0 0 8px">Today\'s Results (' + today + ')</h3>' +
      '<p style="color:#444;margin:0 0 20px">Scored ' + scoreResult.scored + ' tips — ' +
      (scoreResult.winners || 0) + ' winners</p>';
  }

  var html = '<div style="font-family:-apple-system,sans-serif;max-width:580px;margin:0 auto">' +
    '<div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:24px 28px;border-radius:12px 12px 0 0;color:#fff">' +
    '<div style="font-size:24px;margin-bottom:4px">Falkor Racing</div>' +
    '<h1 style="margin:0;font-size:20px;font-weight:800">Racing Tips Update</h1>' +
    '<p style="margin:4px 0 0;opacity:.85">' + today + '</p></div>' +
    '<div style="background:#fff;padding:24px 28px;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,.08)">' +
    scoreHtml +
    (leaderboard.length > 0 ?
      '<h3 style="font-size:15px;font-weight:700;margin:0 0 12px">Season Leaderboard</h3>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">' +
      '<thead><tr style="background:#f4f4f8">' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:#72728a">#</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:#72728a">Player</th>' +
      '<th style="padding:8px 12px;text-align:center;font-size:11px;color:#72728a">Wins</th>' +
      '<th style="padding:8px 12px;text-align:center;font-size:11px;color:#72728a">Tips</th>' +
      '<th style="padding:8px 12px;text-align:center;font-size:11px;color:#72728a">%</th>' +
      '<th style="padding:8px 12px;text-align:center;font-size:11px;color:#72728a">Days</th>' +
      '</tr></thead><tbody>' + lbRows + '</tbody></table>'
      : '') +
    '<p style="margin:0;font-size:12px;color:#72728a">Tip tomorrow\'s races: ' +
    '<a href="https://falkor.luckdragon.io/?intent=racing" style="color:#f59e0b;font-weight:600">falkor.luckdragon.io</a></p>' +
    '</div></div>';

  // Push notification
  var leader = leaderboard[0];
  var pushBody = leader
    ? 'Leader: ' + leader.player + ' (' + leader.wins + ' wins, ' + leader.pct + '%)'
    : 'Check the leaderboard!';
  if (scoreResult && scoreResult.winners > 0) {
    pushBody = scoreResult.winners + ' winner' + (scoreResult.winners > 1 ? 's' : '') + ' today! ' + pushBody;
  }

  await sendPush(env, {
    title: 'Racing tips scored — ' + today,
    body: pushBody,
    url: 'https://falkor.luckdragon.io/?intent=racing',
    tag: 'racing-results',
  });

  await sendEmail(env, {
    to: PADDY_EMAIL,
    subject: 'Racing Tips Update — ' + today,
    html: html,
  });

  await logRun(env, 'racing_results', { date: today, scored: scoreResult ? scoreResult.scored : 0, leaderboard: leaderboard.length });
  return { ok: true, date: today, scored: scoreResult ? scoreResult.scored : 0, leaderboard: leaderboard.length };
}

// ─── Cron dispatcher ──────────────────────────────────────────────────────────

// ─── Phase 47: End-of-school Telegram check-in ───────────────────────────────
async function runAfterSchoolCheckin(env) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return { skipped: true, reason: 'no telegram' };

  // Only on weekdays
  var nowAEST = new Date(Date.now() + 10 * 3600 * 1000);
  var dayOfWeek = nowAEST.getUTCDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return { skipped: true, reason: 'weekend' };

  var checkinKey = 'after_school_checkin_' + nowAEST.toDateString();
  if (await checkAlertFired(env, checkinKey, 4 * 3600 * 1000)) return { skipped: true, reason: 'already sent today' };

  // Gather context for a personalised message
  var pin = env.AGENT_PIN || '';
  var calResp = await fetch(CALENDAR_URL + '/today', { headers: { 'X-Pin': pin } }).catch(function() { return null; });
  var todayEvts = [];
  if (calResp && calResp.ok) {
    var calData = await calResp.json().catch(function() { return {}; });
    todayEvts = calData.events || [];
  }

  var wxResp = await getWeather(env, WPS_LAT, WPS_LON).catch(function() { return null; });

  // Build a Jarvis-style check-in message
  var msgParts = [];
  msgParts.push('Afternoon, Paddy.');

  // Weather note
  if (wxResp && wxResp.current) {
    var wx = wxResp.current;
    if (wx.rain_chance > 50) {
      msgParts.push('Looks like it got wet out there — ' + wx.temp + 'C and ' + wx.rain_chance + '% rain chance.');
    } else if (wx.temp > 32) {
      msgParts.push('Hot one today — ' + wx.temp + 'C. Hope the kids survived the heat.');
    } else if (wx.uv >= 9) {
      msgParts.push('UV was brutal today (' + wx.uv + '). Hats and sunscreen mandatory.');
    } else {
      msgParts.push('Decent day for it — ' + wx.temp + 'C, UV ' + wx.uv + '.');
    }
  }

  // School event note
  var schoolEventNames = todayEvts.map(function(e) { return (e.summary || e.title || ''); }).filter(function(n) {
    return n && ['cross country', 'carnival', 'athletics', 'sports day', 'district', 'pe', 'sport', 'assembly'].some(function(k) { return n.toLowerCase().includes(k); });
  });
  if (schoolEventNames.length > 0) {
    msgParts.push('You had: ' + schoolEventNames.join(', ') + ' on today. How did that go?');
  } else {
    msgParts.push('How was school today?');
  }

  var tgMsg = msgParts.join(' ');
  var sent = await sendTelegram(env, tgMsg);
  if (sent) await markAlertFired(env, checkinKey);
  return { sent, message: tgMsg };
}

async function runScheduled(cron, env) {
  const hour = new Date().getUTCHours();
  const minute = new Date().getUTCMinutes();

  // Smart rules run every cron tick
  await runSmartAlerts(env).catch(function(e) { console.warn('smart alerts:', e.message); });

  // Score watcher — runs every tick, active only during live games
  await runScoreWatcher(env).catch(function(e) { console.warn('score watcher:', e.message); });

  // Racing weekly summary — Sunday 10pm UTC = Monday 8am AEST
  if (dayOfWeek === 0 && hour === 22 && minute < 15) {
    var rwSum = await runRacingWeeklySummary(env).catch(function(e) { return { ok: false, error: e.message }; });
    await logRun(env, 'racing_weekly_summary', rwSum);
  }

  // Racing results — 11pm UTC = 9am AEST next day (after afternoon/evening races settled)
  if (hour === 23 && minute < 15) {
    var racingRes = await runRacingResults(env).catch(function(e) { return { ok: false, error: e.message }; });
    await logRun(env, 'racing_results', racingRes);
  }

  // Weekly summary — Monday 10pm UTC = Tuesday 8am AEST
  var dayOfWeek = new Date().getUTCDay();
  if (dayOfWeek === 1 && hour === 22 && minute < 15) {
    var wSum = await runWeeklySummary(env).catch(function(e) { return { ok: false, error: e.message }; });
    await logRun(env, 'weekly_summary', wSum);
  }
  // Phase 57: NRL weekly email — Thursday 10pm UTC = Friday 8am AEST
  if (dayOfWeek === 4 && hour === 22 && minute < 15) {
    var nrlSum = await runNRLWeeklySummary(env).catch(function(e) { return { ok: false, error: e.message }; });
    await logRun(env, 'nrl_weekly_summary', nrlSum);
  }

  // Task executor runs every tick — picks up 1 pending task
  await runTaskExecutor(env).catch(function(e) { console.warn('task executor:', e.message); });

  // 9pm UTC = 7am AEST → PE Weather Alert
  if (hour === 21 && minute < 15) {
    const result = await runPEWeatherAlert(env);
    await logRun(env, 'pe_weather_alert', result);
    return result;
  }

  // 9:30pm UTC = 7:30am AEST → Daily Briefing
  if (hour === 21 && minute >= 30) {
    const result = await runDailySummary(env);
    await logRun(env, 'daily_summary', result);
    return result;
  }

  // 5:30am UTC = 3:30pm AEST, Mon-Fri → After-school check-in
  var cDow = new Date().getUTCDay();
  if (cDow === 4 && hour === 0 && minute < 15) {
      await runTipSuggestions(env).then(function(r){ logRun(env, 'tip_suggestions', r); }).catch(function(){});
    }
    if (cDow === 2 && hour === 0 && minute < 15) {
      await runNRLTipSuggestions(env).then(function(r){ logRun(env, 'nrl_tip_suggestions', r); }).catch(function(){});
    }
    // Phase 52: AFL tips deadline — Wed 10pm UTC = Thu 8am AEST
    if (cDow === 3 && hour === 22 && minute < 15) {
      await runTipsDeadlineCheck(env).then(function(r){ logRun(env, 'tips_deadline_check', r); }).catch(function(){});
    }
    // Phase 53: Essendon result reaction — runs every hour to catch game completion
    if (minute < 5) {
      await runEssendonResultReaction(env).then(function(r){ logRun(env, 'essendon_result', r); }).catch(function(){});
    }
    // Phase 54A: Racing comp Saturday recap — Fri 10pm UTC = Sat 8am AEST
    if (cDow === 5 && hour === 22 && minute < 15) {
      await runRacingCompRecap(env).then(function(r){ logRun(env, 'racing_comp_recap', r); }).catch(function(){});
    }
    // Phase 54B: NRL tips deadline — Mon 10pm UTC = Tue 8am AEST
    if (cDow === 1 && hour === 22 && minute < 15) {
      await runNRLTipsDeadlineCheck(env).then(function(r){ logRun(env, 'nrl_tips_deadline_check', r); }).catch(function(){});
    }
    if (hour === 5 && minute >= 30 && minute < 45 && cDow >= 1 && cDow <= 5) {
    var checkinRes = await runAfterSchoolCheckin(env).catch(function(e) { return { ok: false, error: e.message }; });
    await logRun(env, 'after_school_checkin', checkinRes);
  }

  return { skipped: true, hour, minute };
}

// ─── Main Worker ──────────────────────────────────────────────────────────────



// ─── Phase 54A: Racing Comp Saturday Recap ────────────────────────────────────
async function runRacingCompRecap(env) {
  try {
    var alertKey = 'racing_comp_recap_' + new Date().toISOString().slice(0, 10);
    if (await checkAlertFired(env, alertKey, 20 * 60 * 60 * 1000)) {
      return { sent: false, reason: 'Already sent racing recap today' };
    }

    // Get leaderboard
    var lbResp = await fetch(SPORT_URL + '/racing/leaderboard', {
      headers: { 'X-Pin': env.AGENT_PIN }
    }).catch(function() { return null; });
    if (!lbResp || !lbResp.ok) return { sent: false, reason: 'Could not fetch leaderboard' };
    var lbData = await lbResp.json().catch(function() { return {}; });
    var board = lbData.leaderboard || [];
    if (!board.length) return { sent: false, reason: 'No racing tips submitted yet' };

    // Get today's comp tips
    var today = new Date().toISOString().slice(0, 10);
    var compResp = await fetch(SPORT_URL + '/racing/comp?date=' + today, {
      headers: { 'X-Pin': env.AGENT_PIN }
    }).catch(function() { return null; });
    var todayTips = [];
    if (compResp && compResp.ok) {
      var compData = await compResp.json().catch(function() { return {}; });
      todayTips = compData.tips || [];
    }

    var boardStr = board.slice(0, 5).map(function(p, i) {
      return (i + 1) + '. ' + p.player + ' — ' + p.wins + ' wins from ' + p.total + ' tips';
    }).join('\n');

    var todayStr = todayTips.length > 0
      ? '\nToday\'s picks: ' + todayTips.map(function(t) { return t.player + ' → ' + t.selection + ' (' + t.race_name + ')'; }).join(', ')
      : '\nNo tips submitted for today yet.';

    var msg = 'Racing comp standings:\n\n' + boardStr + '\n' + todayStr + '\n\nSubmit picks: falkor.luckdragon.io';

    await markAlertFired(env, alertKey);
    var tgSent = await sendTelegram(env, msg);
    return { sent: tgSent, leaders: board.length, today_tips: todayTips.length };
  } catch(e) {
    return { sent: false, error: e.message };
  }
}

// ─── Phase 54B: NRL Tips Deadline Reminder ───────────────────────────────────
async function runNRLTipsDeadlineCheck(env) {
  var season = new Date().getFullYear();
  try {
    // 1. Find the current NRL round (first fully upcoming round)
    var targetRound = null;
    for (var r = 1; r <= 27; r++) {
      var resp = await fetch(SPORT_URL + '/nrl/draw?season=' + season + '&round=' + r, {
        headers: { 'X-Pin': env.AGENT_PIN }
      }).catch(function() { return null; });
      if (!resp || !resp.ok) break;
      var data = await resp.json().catch(function() { return {}; });
      var fixtures = data.fixtures || [];
      if (!fixtures.length) break;
      var hasUpcoming = fixtures.some(function(f) { return f.matchState === 'Upcoming'; });
      var hasStarted = fixtures.some(function(f) { return f.matchState !== 'Upcoming'; });
      if (hasUpcoming) { targetRound = r; break; }
    }
    if (!targetRound) return { sent: false, reason: 'Could not detect current NRL round' };

    // 2. Rate limit: once per round
    var alertKey = 'nrl_tips_deadline_r' + targetRound + '_' + season;
    if (await checkAlertFired(env, alertKey, 6 * 24 * 60 * 60 * 1000)) {
      return { sent: false, reason: 'Already sent NRL deadline reminder for round ' + targetRound };
    }

    // 3. Check if Paddy has submitted NRL tips this round
    var tipsResp = await fetch(SPORT_URL + '/nrl/tips?season=' + season + '&round=' + targetRound, {
      headers: { 'X-Pin': env.AGENT_PIN }
    }).catch(function() { return null; });
    if (tipsResp && tipsResp.ok) {
      var tipsData = await tipsResp.json().catch(function() { return {}; });
      var paddyTips = (tipsData.tips || []).filter(function(t) {
        return (t.player || '').toLowerCase() === 'paddy';
      });
      if (paddyTips.length > 0) {
        return { sent: false, reason: 'Paddy has already submitted NRL Round ' + targetRound + ' tips' };
      }
    }

    var msg = 'Reminder: NRL Round ' + targetRound + ' tips not submitted yet. Get them in before the first game locks. Submit: falkor.luckdragon.io';
    await markAlertFired(env, alertKey);
    var tgSent = await sendTelegram(env, msg);
    return { sent: tgSent, round: targetRound };
  } catch(e) {
    return { sent: false, error: e.message };
  }
}


// ─── Phase 57: NRL Weekly Summary Email ──────────────────────────────────────
async function runNRLWeeklySummary(env) {
  var season = new Date().getFullYear();

  // 1. Find current/most recent NRL round
  var targetRound = null;
  var roundFixtures = [];
  for (var r = 27; r >= 1; r--) {
    try {
      var resp = await fetch(SPORT_URL + '/nrl/draw?season=' + season + '&round=' + r, {
        headers: { 'X-Pin': env.AGENT_PIN }
      });
      if (!resp.ok) continue;
      var data = await resp.json();
      var fixtures = data.fixtures || [];
      if (!fixtures.length) continue;
      var hasPlayed = fixtures.some(function(f) { return f.matchState === 'Final' || f.matchState === 'FullTime'; });
      if (hasPlayed) { targetRound = r; roundFixtures = fixtures; break; }
    } catch(e) { continue; }
  }
  if (!targetRound) return { ok: false, reason: 'No completed NRL round found' };

  // 2. Get tipping summary
  var tippingData = null;
  try {
    var tResp = await fetch(SPORT_URL + '/nrl/tipping?season=' + season, {
      headers: { 'X-Pin': env.AGENT_PIN }
    });
    if (tResp.ok) tippingData = await tResp.json();
  } catch(e) {}

  // 3. Get NRL ladder
  var ladderData = null;
  try {
    var lResp = await fetch(SPORT_URL + '/nrl/ladder', { headers: { 'X-Pin': env.AGENT_PIN } });
    if (lResp.ok) ladderData = await lResp.json();
  } catch(e) {}

  var ladder = (ladderData && ladderData.ladder) ? ladderData.ladder : [];
  var season_standings = (tippingData && tippingData.leaderboard && tippingData.leaderboard.leaderboard) ? tippingData.leaderboard.leaderboard : [];

  // 4. Build HTML email
  var finishedGames = roundFixtures.filter(function(f) { return f.matchState === 'Final' || f.matchState === 'FullTime'; });
  var upcomingGames = roundFixtures.filter(function(f) { return f.matchState === 'Upcoming'; });

  var resultsRows = finishedGames.map(function(g) {
    var homeScore = g.homeScore || g.homeTeamScore || 0;
    var awayScore = g.awayScore || g.awayTeamScore || 0;
    var homeWon = homeScore > awayScore;
    return '<tr><td style="padding:6px 12px;font-weight:' + (homeWon?'700':'400') + '">' + g.homeTeam + '</td>' +
           '<td style="padding:6px 12px;text-align:center;color:#72728a">' + homeScore + ' – ' + awayScore + '</td>' +
           '<td style="padding:6px 12px;font-weight:' + (!homeWon?'700':'400') + '">' + g.awayTeam + '</td></tr>';
  }).join('');

  var upcomingRows = upcomingGames.slice(0, 6).map(function(g) {
    return '<tr><td style="padding:6px 12px">' + g.homeTeam + '</td>' +
           '<td style="padding:6px 12px;text-align:center;color:#72728a">vs</td>' +
           '<td style="padding:6px 12px">' + g.awayTeam + '</td>' +
           '<td style="padding:6px 4px;font-size:12px;color:#72728a">' + (g.venue || '') + '</td></tr>';
  }).join('');

  var tippingRows = season_standings.map(function(p, i) {
    var medal = i === 0 ? ' (1st)' : i === 1 ? ' (2nd)' : i === 2 ? ' (3rd)' : '';
    return '<tr style="background:' + (i%2===0?'#f9f9fc':'#fff') + '"><td style="padding:8px 12px">' + (i+1) + medal + '</td>' +
           '<td style="padding:8px 12px;font-weight:' + (i===0?'700':'400') + '">' + p.player + '</td>' +
           '<td style="padding:8px 12px;text-align:center;color:#22c55e;font-weight:600">' + (p.correct||p.correct_tips||0) + '</td>' +
           '<td style="padding:8px 12px;text-align:center">' + (p.total||p.total_tips||0) + '</td>' +
           '<td style="padding:8px 12px;text-align:center;color:#72728a">' + (p.pct||0) + '%</td></tr>';
  }).join('');

  var ladderRows = ladder.slice(0, 8).map(function(t, i) {
    return '<tr style="background:' + (i%2===0?'#f9f9fc':'#fff') + '"><td style="padding:6px 12px">' + (i+1) + '</td>' +
           '<td style="padding:6px 12px;font-weight:' + (i<4?'600':'400') + '">' + (t.team||t.name||'?') + '</td>' +
           '<td style="padding:6px 12px;text-align:center">' + (t.wins||0) + '</td>' +
           '<td style="padding:6px 12px;text-align:center">' + (t.losses||0) + '</td>' +
           '<td style="padding:6px 12px;text-align:center;color:#72728a">' + (t.points||t.pts||0) + ' pts</td></tr>';
  }).join('');

  var nextRound = targetRound + 1;
  var html = '<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;background:#f4f4f8;margin:0;padding:24px">' +
    '<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">' +
    '<div style="background:linear-gradient(135deg,#1a1a2e,#e8302a);padding:28px 32px;color:#fff">' +
    '<div style="font-size:28px;margin-bottom:4px">Falkor</div>' +
    '<h1 style="margin:0;font-size:22px;font-weight:800">NRL Weekly — Round ' + targetRound + '</h1>' +
    '<p style="margin:4px 0 0;opacity:.8">Season ' + season + '</p></div>' +
    '<div style="padding:28px 32px">' +
    (tippingRows ? '<h2 style="font-size:16px;font-weight:700;margin:0 0 12px">Tips Leaderboard</h2>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:28px"><thead><tr style="background:#f4f4f8">' +
    '<th style="padding:8px 12px;text-align:left;font-size:12px;color:#72728a">#</th>' +
    '<th style="padding:8px 12px;text-align:left;font-size:12px;color:#72728a">Player</th>' +
    '<th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">Correct</th>' +
    '<th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">Total</th>' +
    '<th style="padding:8px 12px;text-align:center;font-size:12px;color:#72728a">%</th></tr></thead>' +
    '<tbody>' + tippingRows + '</tbody></table>' : '') +
    (resultsRows ? '<h2 style="font-size:16px;font-weight:700;margin:0 0 12px">Round ' + targetRound + ' Results</h2>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:28px"><tbody>' + resultsRows + '</tbody></table>' : '') +
    (ladderRows ? '<h2 style="font-size:16px;font-weight:700;margin:0 0 12px">NRL Ladder (Top 8)</h2>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:28px"><thead><tr style="background:#f4f4f8">' +
    '<th style="padding:6px 12px;text-align:left;font-size:12px;color:#72728a">#</th>' +
    '<th style="padding:6px 12px;text-align:left;font-size:12px;color:#72728a">Team</th>' +
    '<th style="padding:6px 12px;text-align:center;font-size:12px;color:#72728a">W</th>' +
    '<th style="padding:6px 12px;text-align:center;font-size:12px;color:#72728a">L</th>' +
    '<th style="padding:6px 12px;text-align:center;font-size:12px;color:#72728a">Pts</th></tr></thead>' +
    '<tbody>' + ladderRows + '</tbody></table>' : '') +
    (upcomingRows ? '<h2 style="font-size:16px;font-weight:700;margin:0 0 12px">Round ' + nextRound + ' Fixtures</h2>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:28px"><tbody>' + upcomingRows + '</tbody></table>' : '') +
    '<div style="background:#f4f4f8;border-radius:10px;padding:16px 20px">' +
    '<p style="margin:0;font-size:13px;color:#72728a">Submit Round ' + nextRound + ' tips: <a href="https://falkor.luckdragon.io/?intent=nrl" style="color:#e8302a;font-weight:600">falkor.luckdragon.io</a></p></div>' +
    '</div><div style="padding:16px 32px;background:#f4f4f8;text-align:center"><p style="margin:0;font-size:12px;color:#72728a">Sent by Falkor</p></div></div></body></html>';

  await sendEmail(env, {
    to: PADDY_EMAIL,
    subject: 'Falkor NRL Weekly — Round ' + targetRound + ' wrap-up',
    html: html
  });

  return { ok: true, round: targetRound, results: finishedGames.length, standings: season_standings.length };
}

// ─── Phase 52: AFL Tips Deadline Reminder ────────────────────────────────────
async function runTipsDeadlineCheck(env) {
  var year = new Date().getFullYear();
  try {
    // 1. Find current AFL round (first round with any incomplete/upcoming games)
    var targetRound = null;
    for (var r = 1; r <= 24; r++) {
      var resp = await fetch(SPORT_URL + '/afl/round?year=' + year + '&round=' + r, {
        headers: { 'X-Pin': env.AGENT_PIN }
      }).catch(function() { return null; });
      if (!resp || !resp.ok) break;
      var data = await resp.json().catch(function() { return {}; });
      var games = Array.isArray(data) ? data : (data.games || []);
      if (!games.length) break;
      var hasUpcoming = games.filter(function(g) { return g.status === 'upcoming'; });
      if (hasUpcoming.length > 0) { targetRound = r; break; }
      var allFinal = games.every(function(g) { return g.status === 'final'; });
      if (!allFinal) { targetRound = r; break; }
    }
    if (!targetRound) return { sent: false, reason: 'Could not detect current round' };

    // 2. Rate limit: once per round
    var alertKey = 'tips_deadline_r' + targetRound + '_' + year;
    if (await checkAlertFired(env, alertKey, 6 * 24 * 60 * 60 * 1000)) {
      return { sent: false, reason: 'Already sent deadline reminder for round ' + targetRound };
    }

    // 3. Check if Paddy has already submitted tips this round
    var compResp = await fetch(SPORT_URL + '/afl/comp?year=' + year + '&round=' + targetRound, {
      headers: { 'X-Pin': env.AGENT_PIN }
    }).catch(function() { return null; });
    if (compResp && compResp.ok) {
      var compData = await compResp.json().catch(function() { return {}; });
      var players = compData.players || {};
      var paddyTips = players['Paddy'] || players['paddy'];
      if (paddyTips && paddyTips.tips && paddyTips.tips.length > 0) {
        return { sent: false, reason: 'Paddy has already submitted Round ' + targetRound + ' tips' };
      }
    }

    // 4. Get the round fixtures so we can name the Essendon game if present
    var roundGames = [];
    try {
      var rgResp = await fetch(SPORT_URL + '/afl/round?year=' + year + '&round=' + targetRound, {
        headers: { 'X-Pin': env.AGENT_PIN }
      });
      var rgData = await rgResp.json();
      roundGames = Array.isArray(rgData) ? rgData : (rgData.games || []);
    } catch(e) {}

    var essendonGame = roundGames.find(function(g) {
      return (g.home||'').toLowerCase().includes('essendon') || (g.away||'').toLowerCase().includes('essendon') ||
             (g.hteam||'').toLowerCase().includes('essendon') || (g.ateam||'').toLowerCase().includes('essendon');
    });
    var essendonNote = essendonGame
      ? ' Essendon are playing ' + (((essendonGame.home||essendonGame.hteam||'').toLowerCase().includes('essendon')) ? (essendonGame.away||essendonGame.ateam||'') : (essendonGame.home||essendonGame.hteam||'')) + ' this round.'
      : '';

    var msg = 'Reminder: you have not submitted your Round ' + targetRound + ' AFL tips yet. First game locks soon — get them in at falkor.luckdragon.io.' + essendonNote;

    await markAlertFired(env, alertKey);
    var tgSent = await sendTelegram(env, msg);
    return { sent: tgSent, round: targetRound, essendon: !!essendonGame };
  } catch(e) {
    return { sent: false, error: e.message };
  }
}

// ─── Phase 53: Essendon Result Reaction ──────────────────────────────────────
async function runEssendonResultReaction(env) {
  var year = new Date().getFullYear();
  try {
    // 1. Find the most recent completed round
    var targetRound = null;
    var essendonGame = null;
    for (var r = 24; r >= 1; r--) {
      var resp = await fetch(SPORT_URL + '/afl/round?year=' + year + '&round=' + r, {
        headers: { 'X-Pin': env.AGENT_PIN }
      }).catch(function() { return null; });
      if (!resp || !resp.ok) continue;
      var data = await resp.json().catch(function() { return {}; });
      var games = Array.isArray(data) ? data : (data.games || []);
      if (!games.length) continue;
      // Look for a just-finished Essendon game
      for (var i = 0; i < games.length; i++) {
        var g = games[i];
        if (g.status !== 'final') continue;
        var ht = (g.home || g.hteam || '').toLowerCase();
        var at = (g.away || g.ateam || '').toLowerCase();
        if (!ht.includes('essendon') && !at.includes('essendon') && !ht.includes('bombers') && !at.includes('bombers')) continue;
        var reactionKey = 'essendon_result_r' + r + '_g' + (g.id || i) + '_' + year;
        if (await checkAlertFired(env, reactionKey, 30 * 24 * 60 * 60 * 1000)) continue; // already reacted
        targetRound = r;
        essendonGame = g;
        // Mark immediately to avoid double-fire
        await markAlertFired(env, reactionKey);
        break;
      }
      if (essendonGame) break;
      // If any game in this round is still upcoming/live, stop searching earlier rounds
      var hasActive = games.some(function(g) { return g.status === 'upcoming' || g.status === 'live'; });
      if (hasActive) break;
    }

    if (!essendonGame) return { sent: false, reason: 'No new Essendon result to react to' };

    var g = essendonGame;
    var homeTeam = g.home || g.hteam || '';
    var awayTeam = g.away || g.ateam || '';
    var homeScore = g.homeScore || g.hscore || 0;
    var awayScore = g.awayScore || g.ascore || 0;
    var isHome = homeTeam.toLowerCase().includes('essendon') || homeTeam.toLowerCase().includes('bombers');
    var essendonScore = isHome ? homeScore : awayScore;
    var oppScore = isHome ? awayScore : homeScore;
    var opponent = isHome ? awayTeam : homeTeam;
    var won = essendonScore > oppScore;
    var margin = Math.abs(essendonScore - oppScore);

    var aiPrompt = 'You are Falkor — Jarvis-style AI. Paddy supports Essendon (the Bombers) in the AFL. They just ' + (won ? 'won' : 'lost') + ' against ' + opponent + ' by ' + margin + ' points (final score ' + essendonScore + ' to ' + oppScore + '). Write a single punchy Jarvis-style reaction (1-2 sentences max, no emojis, no bullet points). ' + (won ? 'Celebratory but dry wit.' : 'Commiserating but darkly funny — acknowledge the loss without being too brutal.');

    var reaction = '';
    var aiResp = await fetch(AI_URL + '/chat/smart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pin': getAiPin(env) },
      body: JSON.stringify({ message: aiPrompt, model: 'groq-fast', max_tokens: 100 })
    }).catch(function() { return null; });
    if (aiResp && aiResp.ok) {
      var aiData = await aiResp.json().catch(function() { return {}; });
      reaction = (aiData.reply || '').trim();
    }

    if (!reaction) {
      reaction = won
        ? 'Essendon ' + essendonScore + ' def ' + opponent + ' ' + oppScore + '. The Bombers get up by ' + margin + '.'
        : 'Essendon go down to ' + opponent + ', ' + essendonScore + '-' + oppScore + '. Margin: ' + margin + '.';
    }

    var msg = 'Essendon R' + targetRound + ' result: ' + (won ? 'WIN' : 'LOSS') + ' vs ' + opponent + ' (' + essendonScore + '-' + oppScore + ')\n\n' + reaction;
    var tgSent = await sendTelegram(env, msg);
    return { sent: tgSent, round: targetRound, won: won, margin: margin, opponent: opponent };
  } catch(e) {
    return { sent: false, error: e.message };
  }
}

// ─── Phase 51: NRL Smart Tip Suggestions ─────────────────────────────────────
async function runNRLTipSuggestions(env) {
  var season = new Date().getFullYear();
  try {
    // 1. Find the next fully upcoming NRL round (try rounds 1-27)
    var targetRound = null;
    var targetFixtures = [];
    for (var r = 1; r <= 27; r++) {
      var resp = await fetch(SPORT_URL + '/nrl/draw?season=' + season + '&round=' + r, {
        headers: { 'X-Pin': env.AGENT_PIN }
      }).catch(function() { return null; });
      if (!resp || !resp.ok) break;
      var data = await resp.json().catch(function() { return {}; });
      var fixtures = data.fixtures || [];
      if (!fixtures.length) break;
      // Check if all games are upcoming
      var anyStarted = fixtures.filter(function(f) { return f.matchState !== 'Upcoming'; });
      var allUpcoming = fixtures.filter(function(f) { return f.matchState === 'Upcoming'; });
      if (anyStarted.length === 0 && allUpcoming.length > 0) {
        targetRound = r;
        targetFixtures = allUpcoming;
        break;
      }
    }
    if (!targetRound) return { sent: false, reason: 'No fully upcoming NRL round found' };

    // 2. Rate-limit: once per round
    var alertKey = 'nrl_tips_r' + targetRound + '_' + season;
    if (await checkAlertFired(env, alertKey, 6 * 24 * 60 * 60 * 1000)) {
      return { sent: false, reason: 'Already sent for NRL round ' + targetRound };
    }

    // 3. Get NRL ladder for context
    var ladderResp = await fetch(SPORT_URL + '/nrl/ladder', {
      headers: { 'X-Pin': env.AGENT_PIN }
    }).catch(function() { return null; });
    var ladderData = (ladderResp && ladderResp.ok) ? await ladderResp.json().catch(function() { return {}; }) : {};
    var ladder = ladderData.ladder || [];
    var ladderStr = ladder.slice(0, 8).map(function(t, i) {
      return (i+1) + '. ' + (t.team || t.name || '?') + ' (' + (t.wins||0) + 'W-' + (t.losses||0) + 'L)';
    }).join(', ');

    // 4. Build game list with venue
    var gameList = targetFixtures.map(function(f) {
      return f.homeTeam + ' v ' + f.awayTeam + (f.venue ? ' at ' + f.venue : '');
    }).join('; ');

    // 5. AI tip generation
    var aiPrompt = 'You are Falkor, the NRL tipping assistant. NRL Round ' + targetRound + ' ' + season + ' fixtures. Generate tip recommendations — for each game, state the tip and one punchy reason (form, venue, ladder position, recent results). Max 10 words per game. Note if Panthers or Warriors are playing (they are top of ladder). Current ladder top 8: ' + ladderStr + '. Fixtures: ' + gameList + '. No emojis, write as plain list with one game per line.';

    var narrative = '';
    var aiResp = await fetch(AI_URL + '/chat/smart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pin': getAiPin(env) },
      body: JSON.stringify({ message: aiPrompt, model: 'groq-fast', max_tokens: 400 })
    }).catch(function() { return null; });
    if (aiResp && aiResp.ok) {
      var aiData = await aiResp.json().catch(function() { return {}; });
      narrative = (aiData.reply || '').trim();
    }

    if (!narrative) {
      narrative = targetFixtures.map(function(f) {
        return f.homeTeam + ' v ' + f.awayTeam;
      }).join('\n');
    }

    var msg = '<b>NRL Round ' + targetRound + ' Tip Suggestions</b>\n\n' + narrative + '\n\nSubmit: falkor.luckdragon.io';
    if (msg.length > 4096) msg = msg.slice(0, 4093) + '...';

    await markAlertFired(env, alertKey);
    var tgSent = await sendTelegram(env, msg);
    return { sent: tgSent, round: targetRound, games: targetFixtures.length, ai_generated: !!narrative };
  } catch(e) {
    return { sent: false, error: e.message };
  }
}


// ─── Phase 50: AFL Smart Tip Suggestions ─────────────────────────────────────
async function runTipSuggestions(env) {
  var year = new Date().getFullYear();
  try {
    // 1. Get all incomplete games to find the next fully upcoming round
    var gamesResp = await fetch(SPORT_URL + '/afl/round?year=' + year, {
      headers: { 'X-Pin': env.AGENT_PIN }
    }).catch(function() { return null; });
    if (!gamesResp || !gamesResp.ok) return { sent: false, reason: 'Could not fetch games' };
    var games = await gamesResp.json().catch(function() { return []; });
    if (!Array.isArray(games) || !games.length) return { sent: false, reason: 'No game data' };

    // 2. Find next fully upcoming round (no games started yet)
    var upcoming = games.filter(function(g) { return (g.complete || 0) < 100; });
    var rounds = [...new Set(upcoming.map(function(g) { return g.round; }))].sort(function(a,b) { return a-b; });
    var targetRound = null;
    for (var i = 0; i < rounds.length; i++) {
      var r = rounds[i];
      var rGames = upcoming.filter(function(g) { return g.round === r; });
      var started = rGames.filter(function(g) { return (g.complete || 0) > 0; });
      if (started.length === 0) { targetRound = r; break; }
    }
    if (!targetRound) return { sent: false, reason: 'No fully upcoming round found' };

    // 3. Rate-limit: once per round
    var alertKey = 'tip_suggestions_r' + targetRound + '_' + year;
    if (await checkAlertFired(env, alertKey, 6 * 24 * 60 * 60 * 1000)) {
      return { sent: false, reason: "Already sent for round " + targetRound };
    }

    // 4. Get Squiggle model tips for this round
    var tipsResp = await fetch(SPORT_URL + '/afl/tips?year=' + year + '&round=' + targetRound, {
      headers: { 'X-Pin': env.AGENT_PIN }
    }).catch(function() { return null; });
    var tips = (tipsResp && tipsResp.ok) ? await tipsResp.json().catch(function() { return []; }) : [];

    // 5. Get fixtures for this specific round
    var roundGames = upcoming.filter(function(g) { return g.round === targetRound; });

    // 6. Match tips to games by ID
    var tipMap = {};
    if (Array.isArray(tips)) {
      tips.forEach(function(t) { tipMap[t.gameId] = t; });
    }

    var gameTips = roundGames.map(function(g) {
      var t = tipMap[g.id];
      return {
        home: g.home || '?',
        away: g.away || '?',
        date: (g.date || '').substring(0, 10),
        tip: t ? t.tip : null,
        confidence: t ? Math.round(parseFloat(t.confidence)) : null
      };
    }).sort(function(a, b) { return a.date > b.date ? 1 : -1; });

    // 7. Call AI for narrative tip pack
    var gameList = gameTips.map(function(g) {
      return g.home + ' v ' + g.away + ' (' + g.date + ')' + (g.tip ? ': model tips ' + g.tip + ' at ' + g.confidence + '%' : '');
    }).join('; ');

    var aiPrompt = 'You are Falkor, Paddy is the AFL tipping assistant. Round ' + targetRound + ' AFL fixtures with model predictions. Write a concise tipping guide — for each game, state the recommended tip and one punchy reason (form, venue, recent results, head-to-head). Max 12 words per game. If Essendon are playing, flag it. No emojis, no bullet symbols, write it as a plain list with each game on its own line. Fixtures: ' + gameList;

    var tgNarrative = '';
    var aiResp2 = await fetch(AI_URL + '/chat/smart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pin': getAiPin(env) },
      body: JSON.stringify({ message: aiPrompt, model: 'groq-fast', max_tokens: 400 })
    }).catch(function() { return null; });
    if (aiResp2 && aiResp2.ok) {
      var aiData2 = await aiResp2.json().catch(function() { return {}; });
      tgNarrative = (aiData2.reply || '').trim();
    }

    // Fallback to plain list
    if (!tgNarrative) {
      tgNarrative = gameTips.map(function(g) {
        return g.home + ' v ' + g.away + (g.tip ? ': ' + g.tip + ' (' + g.confidence + '%)' : '');
      }).join('\n');
    }

    var msg = '<b>Round ' + targetRound + ' AFL Tip Suggestions</b>\n\n' + tgNarrative + '\n\nSubmit: falkor.luckdragon.io';
    if (msg.length > 4096) msg = msg.slice(0, 4093) + '...';

    await markAlertFired(env, alertKey);
    var tgSent2 = await sendTelegram(env, msg);
    return { sent: tgSent2, round: targetRound, games: gameTips.length, ai_generated: !!tgNarrative };
  } catch(e) {
    return { sent: false, error: e.message };
  }
}

export default {
  
async scheduled(event, env, ctx) {
    ctx.waitUntil(runScheduled(event.cron, env).catch(function(e) {
      console.error('Scheduled error:', e?.message);
      logRun(env, 'cron', null, e?.message);
    }));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (path === '/health') {
      let dbOk = false, projectsDbOk = false;
      try { if (env.DB) { await env.DB.prepare('SELECT 1').run(); dbOk = true; } } catch {}
      try { if (env.PROJECTS_DB) { await env.PROJECTS_DB.prepare('SELECT 1').run(); projectsDbOk = true; } } catch {}
      return json({ ok: true, worker: WORKER_NAME, version: VERSION, db: dbOk, projects_db: projectsDbOk, resend: !!env.RESEND_API_KEY });
    }

    if (!pinOk(request, env)) return err('Unauthorized', 401);

    if (path === '/workflow/trigger' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { workflow } = body;
      let result;
      try {
        switch (workflow) {
          case 'pe_weather_alert': result = await runPEWeatherAlert(env); break;
          case 'daily_summary':    result = await runDailySummary(env); break;
          case 'tip_suggestions':  result = await runTipSuggestions(env); break;
          case 'nrl_tip_suggestions': result = await runNRLTipSuggestions(env); break;
          case 'tips_deadline_check': result = await runTipsDeadlineCheck(env); break;
          case 'essendon_result': result = await runEssendonResultReaction(env); break;
          case 'racing_comp_recap': result = await runRacingCompRecap(env); break;
          case 'nrl_tips_deadline_check': result = await runNRLTipsDeadlineCheck(env); break;
          case 'nrl_weekly_summary': result = await runNRLWeeklySummary(env); break;
          case 'smart_alerts':     result = await runSmartAlerts(env); break;
          case 'racing_results':   result = await runRacingResults(env); break;
          case 'racing_weekly':    result = await runRacingWeeklySummary(env); break;
          default: return err('Unknown workflow: ' + workflow + '. Options: pe_weather_alert, daily_summary, smart_alerts, racing_results');
        }
        await logRun(env, workflow, result);
        return json({ ok: true, workflow, result });
      } catch (e) {
        await logRun(env, workflow, null, e?.message);
        return err('Workflow failed: ' + e?.message, 500);
      }
    }

    if (path === '/score-watch' && method === 'POST') {
      const result = await runScoreWatcher(env);
      return json({ ok: true, ...result });
    }

    if (path === '/weekly-summary' && method === 'POST') {
      const result = await runWeeklySummary(env);
      return json({ ok: true, ...result });
    }

    if (path === '/racing-weekly' && method === 'POST') {
      const result = await runRacingWeeklySummary(env);
      return json({ ok: true, ...result });
    }

    if (path === '/racing-results' && method === 'POST') {
      const result = await runRacingResults(env);
      return json({ ok: true, ...result });
    }

    if (path === '/smart-alerts/trigger' && method === 'POST') {
      const result = await runSmartAlerts(env).catch(function(e) { return { error: e.message }; });
      return json({ ok: true, result });
    }

    if (path === '/email' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { to, subject, text, html } = body;
      if (!subject) return err('subject required');
      if (!text && !html) return err('text or html required');
      try {
        const result = await sendEmail(env, { to, subject, text, html });
        return json({ ok: true, ...result });
      } catch (e) {
        return err('Email failed: ' + e?.message, 500);
      }
    }

    if (path === '/workflow/runs' && method === 'GET') {
      if (!env.DB) return err('DB not bound', 500);
      try {
        await env.DB.prepare('CREATE TABLE IF NOT EXISTS falkor_workflow_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, workflow TEXT, result TEXT, error TEXT, ran_at INTEGER DEFAULT (unixepoch()))').run();
        const rows = await env.DB.prepare('SELECT workflow, result, error, ran_at FROM falkor_workflow_runs ORDER BY ran_at DESC LIMIT 20').all();
        return json({ ok: true, runs: rows.results });
      } catch (e) { return err(e?.message, 500); }
    }

    // Task queue endpoints
    if (path === '/tasks' && method === 'GET') {
      if (!env.DB) return err('DB not bound', 500);
      try {
        await env.DB.prepare('CREATE TABLE IF NOT EXISTS falkor_tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT DEFAULT \'paddy\', title TEXT NOT NULL, type TEXT DEFAULT \'research\', query TEXT, params TEXT, status TEXT DEFAULT \'pending\', result TEXT, error TEXT, notify INTEGER DEFAULT 1, created_at INTEGER DEFAULT (unixepoch()), started_at INTEGER, completed_at INTEGER)').run();
        const rows = await env.DB.prepare('SELECT id, user_id, title, type, status, result, error, created_at, completed_at FROM falkor_tasks ORDER BY created_at DESC LIMIT 30').all();
        return json({ ok: true, tasks: rows.results });
      } catch (e) { return err(e?.message, 500); }
    }

    if (path === '/tasks' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { title, type, query, params, notify } = body;
      if (!title) return err('title required');
      try {
        const id = await createTask(env, { title, type: type || 'research', query: query || title, params: params || {}, notify: notify !== false ? 1 : 0 });
        return json({ ok: true, id, message: 'Task queued — Falkor will handle it.' });
      } catch (e) { return err(e?.message, 500); }
    }

    if (path === '/tasks/run' && method === 'POST') {
      const result = await runTaskExecutor(env).catch(function(e) { return { error: e.message }; });
      return json({ ok: true, result });
    }

    return json({ error: 'Not found', path }, 404);
  },
};
