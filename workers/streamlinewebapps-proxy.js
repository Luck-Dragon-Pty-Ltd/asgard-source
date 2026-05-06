// streamlinewebapps-proxy v36 — sender = hello@streamlinewebapps.com (verified in Resend), Stripe webhook handler at /stripe/webhook with sig verification + payment-confirmation emails (admin + customer), 2026-05-06
const SUPABASE = "https://huvfgenbcaiicatvtxak.supabase.co/functions/v1/streamline";
const SUPA_REST = "https://huvfgenbcaiicatvtxak.supabase.co/rest/v1";
const SUPA_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dmZnZW5iY2FpaWNhdHZ0eGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTczNjIsImV4cCI6MjA5MTE5MzM2Mn0.uTgzTKYjJnkFlRUIhGfW4ODKyV24xOdKaX7lxpDuMfc";
const SUPA_H = {"apikey": SUPA_ANON, "Authorization": "Bearer "+SUPA_ANON, "Content-Type": "application/json"};
const ALLOWED_ORIGINS = new Set([
  "https://streamlinewebapps.com",
  "https://www.streamlinewebapps.com",
  "http://localhost:3000",
  "http://localhost:8787"
]);
function corsFor(req) {
  const origin = req.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://streamlinewebapps.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };
}
// Legacy CORS shim (kept so existing code paths don't break before refactor)
const CORS = {"Access-Control-Allow-Origin": "https://streamlinewebapps.com", "Vary":"Origin", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization"};
const SEC_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=(self \"https://checkout.stripe.com\")",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://huvfgenbcaiicatvtxak.supabase.co https://api.stripe.com; frame-src https://checkout.stripe.com https://js.stripe.com; base-uri 'self'; form-action 'self' https://checkout.stripe.com"
};
function htmlEscape(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}


const _rl = new Map();
const _idem = new Map(); // sub-second idempotency: hash -> {until, response}
function rateOk(ip, key, max, windowMs=60000) {
  const k = ip+":"+key, now = Date.now();
  // prune expired
  if (_rl.size > 5000) {
    for (const [kk,vv] of _rl) if (now > vv.r) _rl.delete(kk);
  }
  let w = _rl.get(k);
  if (!w || now > w.r) w = {c:0, r:now+windowMs};
  w.c++; _rl.set(k,w);
  return w.c <= max;
}
// HMAC token helpers for /status?t=<token>
async function _statusHmac(env, msg) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.STATUS_SECRET||""), {name:"HMAC", hash:"SHA-256"}, false, ["sign","verify"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
async function statusToken(env, id, email) {
  const payload = id + "|" + (email||"").toLowerCase();
  const sig = await _statusHmac(env, payload);
  const b64 = btoa(payload).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  return b64 + "." + sig;
}
async function verifyStatusToken(env, token) {
  if (!token || !token.includes(".")) return null;
  const [b64, sig] = token.split(".");
  let payload;
  try { payload = atob(b64.replace(/-/g,"+").replace(/_/g,"/")); } catch(e) { return null; }
  const expect = await _statusHmac(env, payload);
  if (expect !== sig) return null;
  const [id, email] = payload.split("|");
  return { id, email };
}

async function idemKey(email, title) {
  const data = new TextEncoder().encode((email||"").toLowerCase()+"|"+(title||"").toLowerCase());
  const h = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,"0")).join("").slice(0,32);
}
function idemPrune(){const n=Date.now();for(const[k,v]of _idem)if(n>v.until)_idem.delete(k);}

const API_ROUTES = ["/ideas", "/vote"]; // /stats served from DB locally; /chat handled locally
const STRIPE_PRICES = { Standard: "price_1TNvyJAm8bVflPN0GBi8u30C", Priority: "price_1TNvyJAm8bVflPN0Nerezgrs", Equity: "price_1TNvyKAm8bVflPN0rZqZZdgq" };

async function handleSubmit(request, env) {
  let body;
  try { body = await request.json(); } catch(e) { return new Response(JSON.stringify({error:"Invalid JSON"}), {status:400, headers:{...CORS,"Content-Type":"application/json"}}); }
  const { title, name, email, phone, category, description, tier } = body;
  if (!title || !name || !email || !description || !tier) return new Response(JSON.stringify({error:"Missing required fields"}), {status:400, headers:{...CORS,"Content-Type":"application/json"}});
  // Honeypot: 'website' field is hidden via CSS — bots fill it; humans don't
  if (body.website && String(body.website).length > 0) {
    return new Response(JSON.stringify({error:"Submission blocked"}), {status:400, headers:{...CORS,"Content-Type":"application/json"}});
  }
  // Min-time check: form submitted in <2s after render is bot-like
  const renderTs = Number(body.t)||0;
  if (renderTs > 0 && (Date.now() - renderTs) < 2000) {
    return new Response(JSON.stringify({error:"Submission blocked"}), {status:400, headers:{...CORS,"Content-Type":"application/json"}});
  }
  const priceId = STRIPE_PRICES[tier];
  if (!priceId) return new Response(JSON.stringify({error:"Invalid tier"}), {status:400, headers:{...CORS,"Content-Type":"application/json"}});

  // 60s idempotency window: same email+title within 60s returns prior response
  idemPrune();
  const ikey = await idemKey(email, title);
  const prev = _idem.get(ikey);
  if (prev) {
    return new Response(prev.response, {headers:{...CORS,"Content-Type":"application/json","X-Idempotent":"replay"}});
  }

  let submissionId;
  try {
    const dbRes = await fetch(SUPA_REST+"/streamline_submissions", {
      method: "POST",
      headers: {...SUPA_H, "Prefer": "return=representation"},
      body: JSON.stringify({ title, name, email, phone: phone||"", category: category||"Utility", description, tier, status: "awaiting_payment" })
    });
    const dbData = await dbRes.json();
    submissionId = Array.isArray(dbData) ? dbData[0]?.id : dbData?.id;
  } catch(e) {}

  const stripeBody = new URLSearchParams({
    "line_items[0][price]": priceId, "line_items[0][quantity]": "1", "mode": "payment",
    "success_url": "https://www.streamlinewebapps.com/?success=1",
    "cancel_url": "https://www.streamlinewebapps.com/?cancelled=1",
    "customer_email": email,
    "metadata[title]": title, "metadata[name]": name, "metadata[email]": email,
    "metadata[category]": category||"Utility", "metadata[description]": description.slice(0,500),
    "metadata[tier]": tier, "metadata[submission_id]": submissionId ? String(submissionId) : ""
  });

  let checkoutUrl;
  try {
    const sr = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {"Authorization": "Bearer "+env.STRIPE_SK, "Content-Type": "application/x-www-form-urlencoded"},
      body: stripeBody.toString()
    });
    const sd = await sr.json();
    checkoutUrl = sd.url;
    if (!checkoutUrl) throw new Error(sd.error?.message || "No checkout URL");
    if (submissionId && sd.id) {
      await fetch(SUPA_REST+"/streamline_submissions?id=eq."+submissionId, {
        method: "PATCH", headers: SUPA_H, body: JSON.stringify({ stripe_session_id: sd.id })
      });
    }
  } catch(e) {
    return new Response(JSON.stringify({error: e.message||"Payment setup failed"}), {status:500, headers:{...CORS,"Content-Type":"application/json"}});
  }

  // Pre-compute status URL before email body uses it
  const _statusTok = submissionId ? await statusToken(env, submissionId, email) : null;
  const _statusUrl = _statusTok ? ("https://www.streamlinewebapps.com/status?t=" + _statusTok) : null;

  if (env.RESEND_KEY && checkoutUrl) {
    const firstName = name.split(" ")[0];
    // Notify Paddy of every new submission
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {"Authorization": "Bearer "+env.RESEND_KEY, "Content-Type": "application/json"},
      body: JSON.stringify({
        from: "Streamline <hello@streamlinewebapps.com>",
        to: ["paddy@luckdragon.io"],
        cc: ["hello@streamlinewebapps.com"],
        subject: "New submission: \""+title+"\" ("+tier+")",
        html: "<div style='font-family:Inter,sans-serif;max-width:560px;padding:32px 24px'>"+
          "<h2 style='color:#1e1b4b;margin:0 0 16px'>New idea submitted</h2>"+
          "<table style='font-size:14px;color:#4c4885;border-collapse:collapse;width:100%'>"+
          "<tr><td style='padding:6px 0;font-weight:600;width:120px'>Title</td><td>"+htmlEscape(title)+"</td></tr>"+
          "<tr><td style='padding:6px 0;font-weight:600'>Tier</td><td>"+htmlEscape(tier)+"</td></tr>"+
          "<tr><td style='padding:6px 0;font-weight:600'>Category</td><td>"+htmlEscape(category||"Utility")+"</td></tr>"+
          "<tr><td style='padding:6px 0;font-weight:600'>Name</td><td>"+htmlEscape(name)+"</td></tr>"+
          "<tr><td style='padding:6px 0;font-weight:600'>Email</td><td>"+htmlEscape(email)+"</td></tr>"+
          "<tr><td style='padding:6px 0;font-weight:600'>Phone</td><td>"+htmlEscape(phone||"n/a")+"</td></tr>"+
          "<tr><td style='padding:6px 0;font-weight:600;vertical-align:top'>Description</td><td>"+htmlEscape(description)+"</td></tr>"+
          "</table>"+
          "<p style='margin:20px 0 0;font-size:13px;color:#9490c0'>Awaiting payment &middot; Submission ID: "+(submissionId||"?")+"</p>"+
          "</div>"
      })
    }).catch(()=>{});
    // Confirmation email to customer
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {"Authorization": "Bearer "+env.RESEND_KEY, "Content-Type": "application/json"},
      body: JSON.stringify({
        from: "Streamline <hello@streamlinewebapps.com>",
        to: [email],
        subject: "Complete your submission: \""+title+"\"",
        html: "<div style='font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px'>"+
          "<div style='width:40px;height:40px;background:linear-gradient(135deg,#6d28d9,#7c3aed);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:24px'>"+
          "<span style='color:#fff;font-weight:800;font-size:18px'>S</span></div>"+
          "<h1 style='font-size:24px;font-weight:800;color:#1e1b4b;margin:0 0 8px'>You&#39;re one step away, "+htmlEscape(firstName)+"</h1>"+
          "<p style='color:#4c4885;font-size:15px;line-height:1.6;margin:0 0 28px'>Your idea <strong style='color:#1e1b4b'>"+htmlEscape(title)+"</strong> is saved. Complete your payment to start the build.</p>"+
          "<a href='"+checkoutUrl+"' style='display:inline-block;background:#6d28d9;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:28px'>Complete Payment &rarr;</a>"+
          "<p style='color:#9490c0;font-size:13px;margin:0'>Tier: "+htmlEscape(tier)+" &middot; Category: "+htmlEscape(category||"Utility")+"<br>Once confirmed, we&#39;ll be in touch within 48 hours.</p>"+
          (_statusUrl ? "<p style='color:#4c4885;font-size:13px;margin:14px 0 0'>Track progress: <a href='"+_statusUrl+"' style='color:#6d28d9;font-weight:600'>"+_statusUrl.replace("https://www.","")+"</a></p>" : "")+
          "<hr style='border:none;border-top:1px solid #e0ddf5;margin:28px 0'>"+
          "<p style='color:#9490c0;font-size:12px;margin:0'>Streamline &middot; Melbourne, Australia &middot; <a href='https://www.streamlinewebapps.com' style='color:#6d28d9'>streamlinewebapps.com</a></p></div>"
      })
    }).catch(()=>{});
  }

  const respBody = JSON.stringify({checkout: checkoutUrl, status_url: _statusUrl});
  _idem.set(ikey, {until: Date.now()+60000, response: respBody});
  return new Response(respBody, {headers:{...CORS,"Content-Type":"application/json"}});
}

async function handleAnalytics(request) {
  let body;
  try { body = await request.json(); } catch(e) { return new Response("ok", {headers: CORS}); }
  await fetch(SUPA_REST+"/streamline_analytics", {
    method: "POST", headers: SUPA_H,
    body: JSON.stringify({ event: body.event||"pageview", meta: JSON.stringify(body.meta||{}) })
  }).catch(()=>{});
  return new Response("ok", {headers: CORS});
}

async function handleAdminData(request, env) {
  const url = new URL(request.url);
  const expected = (env && env.ADMIN_PIN) ? env.ADMIN_PIN : null;
  const got = url.searchParams.get("pin");
  if (!expected || !got || got !== expected) return new Response(JSON.stringify({error:"Unauthorized"}), {status:401, headers:{...CORS,"Content-Type":"application/json"}});
  const [subs, ideas] = await Promise.all([
    fetch(SUPA_REST+"/streamline_submissions?order=created_at.desc&limit=100", {headers: SUPA_H}).then(r=>r.json()).catch(()=>[]),
    fetch(SUPA_REST+"/streamline_ideas?order=created_at.desc&limit=100", {headers: SUPA_H}).then(r=>r.json()).catch(()=>[])
  ]);
  return new Response(JSON.stringify({subs, ideas}), {headers:{...CORS,"Content-Type":"application/json"}});
}

// Auto-build preview app from submission spec — runs async after payment
function slugify(t) {
  return String(t||"app").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || ("app-"+Date.now().toString(36));
}
async function autoBuildPreview(env, submissionId, title, email, tier) {
  if (!env.ANTHROPIC_API_KEY || !env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) return;
  try {
    const r = await fetch(SUPA_REST+"/streamline_submissions?id=eq."+encodeURIComponent(submissionId)+"&select=*", {headers: SUPA_H});
    const d = await r.json();
    const sub = Array.isArray(d) && d[0];
    if (!sub) return;
    const prompt = "Generate a single-file Cloudflare Worker (module-style export default { fetch }) that scaffolds an MVP web app for this submission. Output ONLY valid JavaScript wrapped in ```javascript ... ``` fence. Requirements: single fetch handler with HTML on /, optional small JSON API; embed HTML inline; use only fetch/Response/URL APIs; Tailwind CDN classes OK; CORS headers; no secrets; small \"Built by Streamline\" footer link. Title: " + (sub.title||"") + " | Description: " + (sub.description||"") + " | Category: " + (sub.category||"Utility") + " | Tier: " + (sub.tier||"Standard");
    const cr = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"x-api-key":env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","Content-Type":"application/json"},
      body: JSON.stringify({model:"claude-haiku-4-5-20251001", max_tokens:4000, messages:[{role:"user", content: prompt}]})
    });
    if (!cr.ok) return;
    const cd = await cr.json();
    const text = (cd.content && cd.content[0] && cd.content[0].text) || "";
    const codeMatch = text.match(/```(?:javascript|js)?\s*([\s\S]+?)```/);
    const code = codeMatch ? codeMatch[1].trim() : text.trim();
    if (!code || code.length < 100) return;
    const slug = slugify(sub.title);
    const scriptName = "streamline-app-" + slug;
    const metadata = {main_module:"worker.js",compatibility_date:"2026-05-01",bindings:[]};
    const boundary = "----stripe-deploy-"+Math.random().toString(36).slice(2,12);
    const body = "--"+boundary+"\r\nContent-Disposition: form-data; name=\"metadata\"\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify(metadata) + "\r\n--"+boundary+"\r\nContent-Disposition: form-data; name=\"worker.js\"; filename=\"worker.js\"\r\nContent-Type: application/javascript+module\r\n\r\n" + code + "\r\n--"+boundary+"--\r\n";
    const dr = await fetch("https://api.cloudflare.com/client/v4/accounts/"+env.CF_ACCOUNT_ID+"/workers/scripts/"+scriptName, {
      method:"PUT",
      headers:{"Authorization":"Bearer "+env.CF_API_TOKEN, "Content-Type":"multipart/form-data; boundary="+boundary},
      body
    });
    const dj = await dr.json();
    if (!dj.success) return;
    const hostname = slug + ".streamlinewebapps.com";
    await fetch("https://api.cloudflare.com/client/v4/accounts/"+env.CF_ACCOUNT_ID+"/workers/domains", {
      method:"PUT",
      headers:{"Authorization":"Bearer "+env.CF_API_TOKEN, "Content-Type":"application/json"},
      body: JSON.stringify({environment:"production", hostname, service: scriptName, zone_id:"6292327060a0a2209a084cc7f0566e1a"})
    }).catch(()=>{});
    const previewUrl = "https://" + hostname;
    await fetch(SUPA_REST+"/streamline_submissions?id=eq."+encodeURIComponent(submissionId), {
      method:"PATCH", headers: SUPA_H,
      body: JSON.stringify({status:"preview"})
    }).catch(()=>{});
    if (env.RESEND_KEY && email) {
      const tok = await statusToken(env, submissionId, email);
      const statusUrl = "https://www.streamlinewebapps.com/status?t=" + tok;
      const firstName = ((sub.name||"there").split(" ")[0]);
      await fetch("https://api.resend.com/emails", {
        method:"POST",
        headers:{"Authorization":"Bearer "+env.RESEND_KEY, "Content-Type":"application/json"},
        body: JSON.stringify({
          from:"Streamline <hello@streamlinewebapps.com>",
          to:[email],
          subject:"Your preview is ready \u2014 \""+title+"\"",
          html:"<div style='font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px'><h1 style='font-size:24px;font-weight:800;color:#1e1b4b;margin:0 0 8px'>Preview ready, "+htmlEscape(firstName)+"</h1><p style='color:#4c4885;font-size:15px;line-height:1.6;margin:0 0 24px'>An AI-generated draft of <strong>"+htmlEscape(title)+"</strong> is now live for review. Reply with feedback or approval and we\u2019ll iterate or lock it in.</p><a href='"+previewUrl+"' style='display:inline-block;background:#6d28d9;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:16px'>Open preview \u2192</a><p style='color:#9490c0;font-size:13px;margin:0 0 8px'>Status: <a href='"+statusUrl+"' style='color:#6d28d9'>track here</a></p><hr style='border:none;border-top:1px solid #e0ddf5;margin:28px 0'><p style='color:#9490c0;font-size:12px;margin:0'>Streamline \u00b7 Melbourne, Australia</p></div>"
        })
      }).catch(()=>{});
    }
    if (env.RESEND_KEY) {
      await fetch("https://api.resend.com/emails", {
        method:"POST",
        headers:{"Authorization":"Bearer "+env.RESEND_KEY, "Content-Type":"application/json"},
        body: JSON.stringify({
          from:"Streamline <hello@streamlinewebapps.com>",
          to:["paddy@luckdragon.io"],
          subject:"\u2728 Auto-deployed preview: "+title+" \u2192 "+previewUrl,
          html:"<div style='font-family:Inter,sans-serif;padding:24px'><h2>Preview deployed</h2><p>Submission #"+submissionId+" \u2014 <strong>"+htmlEscape(title)+"</strong> ("+tier+")</p><p>Preview: <a href='"+previewUrl+"'>"+previewUrl+"</a></p><p>Worker: <code>"+scriptName+"</code></p><p>Customer email sent. They can reply with feedback.</p></div>"
        })
      }).catch(()=>{});
    }
  } catch(e) {}
}

// Verify Stripe webhook signature (HMAC-SHA256)
async function verifyStripeSig(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) return false;
  const parts = sigHeader.split(",").map(p => p.split("="));
  const tEntry = parts.find(p => p[0]==="t");
  const v1Entries = parts.filter(p => p[0]==="v1");
  if (!tEntry || v1Entries.length===0) return false;
  const t = tEntry[1];
  const payload = t + "." + rawBody;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,"0")).join("");
  return v1Entries.some(p => p[1] === sigHex);
}

async function handleStripeWebhook(request, env, ctx) {
  const rawBody = await request.text();
  const sig = request.headers.get("Stripe-Signature");
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response(JSON.stringify({error:"webhook secret not configured"}), {status:503, headers:{"Content-Type":"application/json"}});
  const ok = await verifyStripeSig(rawBody, sig, secret);
  if (!ok) return new Response(JSON.stringify({error:"Invalid signature"}), {status:400, headers:{"Content-Type":"application/json"}});
  let evt;
  try { evt = JSON.parse(rawBody); } catch(e) { return new Response(JSON.stringify({error:"bad json"}), {status:400, headers:{"Content-Type":"application/json"}}); }
  if (evt.type === "checkout.session.completed") {
    const session = evt.data.object;
    const submissionId = (session.metadata||{}).submission_id;
    const email = session.customer_email || (session.metadata||{}).email || "";
    const title = (session.metadata||{}).title || "";
    const tier = (session.metadata||{}).tier || "";
    const name = (session.metadata||{}).name || "";
    const amount = (session.amount_total||0)/100;
    const currency = (session.currency||"aud").toUpperCase();
    // Update submission status to paid
    if (submissionId) {
      try {
        await fetch(SUPA_REST+"/streamline_submissions?id=eq."+encodeURIComponent(submissionId), {
          method:"PATCH", headers: SUPA_H,
          body: JSON.stringify({status:"paid", paid_at: new Date().toISOString()})
        });
      } catch(e) {}
      // Background: scaffold + auto-deploy preview (Standard/Priority tiers).
      // Use ctx.waitUntil so the Worker keeps running after we return 200 to Stripe.
      if (tier === "Standard" || tier === "Priority") {
        if (ctx && typeof ctx.waitUntil === "function") {
          ctx.waitUntil(autoBuildPreview(env, submissionId, title, email, tier).catch(()=>{}));
        } else {
          autoBuildPreview(env, submissionId, title, email, tier).catch(()=>{});
        }
      }
    }
    // Send admin payment notification
    if (env.RESEND_KEY) {
      fetch("https://api.resend.com/emails", {
        method:"POST",
        headers:{"Authorization":"Bearer "+env.RESEND_KEY, "Content-Type":"application/json"},
        body: JSON.stringify({
          from: "Streamline <hello@streamlinewebapps.com>",
          to: ["paddy@luckdragon.io"],
          cc: ["hello@streamlinewebapps.com"],
          subject: "💰 Payment received: \""+title+"\" ("+tier+", $"+amount+" "+currency+")",
          html: "<div style='font-family:Inter,sans-serif;max-width:560px;padding:32px 24px'>"+
            "<h2 style='color:#1e1b4b;margin:0 0 16px'>Payment received</h2>"+
            "<table style='font-size:14px;color:#4c4885;border-collapse:collapse;width:100%'>"+
            "<tr><td style='padding:6px 0;font-weight:600;width:120px'>Title</td><td>"+htmlEscape(title)+"</td></tr>"+
            "<tr><td style='padding:6px 0;font-weight:600'>Tier</td><td>"+htmlEscape(tier)+"</td></tr>"+
            "<tr><td style='padding:6px 0;font-weight:600'>Amount</td><td>$"+amount+" "+currency+"</td></tr>"+
            "<tr><td style='padding:6px 0;font-weight:600'>Customer</td><td>"+htmlEscape(name)+" &lt;"+htmlEscape(email)+"&gt;</td></tr>"+
            "<tr><td style='padding:6px 0;font-weight:600'>Submission ID</td><td>#"+htmlEscape(submissionId)+"</td></tr>"+
            "<tr><td style='padding:6px 0;font-weight:600'>Stripe session</td><td>"+htmlEscape(session.id)+"</td></tr>"+
            "</table>"+
            "<p style='margin:20px 0 0;font-size:13px;color:#9490c0'>Time to start the build. Run <code>POST /admin/scaffold/"+htmlEscape(submissionId)+"?pin=&lt;ADMIN_PIN&gt;</code> for an AI scaffold.</p>"+
            "</div>"
        })
      }).catch(()=>{});
    }
    // Send customer payment confirmation with status link
    if (env.RESEND_KEY && email && submissionId) {
      const tok = await statusToken(env, submissionId, email);
      const statusUrl = "https://www.streamlinewebapps.com/status?t=" + tok;
      const firstName = (name.split(" ")[0]||"there");
      fetch("https://api.resend.com/emails", {
        method:"POST",
        headers:{"Authorization":"Bearer "+env.RESEND_KEY, "Content-Type":"application/json"},
        body: JSON.stringify({
          from: "Streamline <hello@streamlinewebapps.com>",
          to: [email],
          subject: "Payment received — your build starts within 48 hours",
          html: "<div style='font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px'>"+
            "<div style='width:40px;height:40px;background:linear-gradient(135deg,#6d28d9,#7c3aed);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:24px'>"+
            "<span style='color:#fff;font-weight:800;font-size:18px'>S</span></div>"+
            "<h1 style='font-size:24px;font-weight:800;color:#1e1b4b;margin:0 0 8px'>Payment received, "+htmlEscape(firstName)+"</h1>"+
            "<p style='color:#4c4885;font-size:15px;line-height:1.6;margin:0 0 24px'>Thanks &mdash; we&rsquo;ve got your "+amount+" "+currency+" for <strong>"+htmlEscape(title)+"</strong> and the build queue is now active. We&rsquo;ll start within 48 hours.</p>"+
            "<a href='"+statusUrl+"' style='display:inline-block;background:#6d28d9;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px'>Check status →</a>"+
            "<p style='color:#9490c0;font-size:13px;margin:0'>Bookmark the status link &mdash; it stays valid through the build. Reply to this email if anything is unclear.</p>"+
            "<hr style='border:none;border-top:1px solid #e0ddf5;margin:28px 0'>"+
            "<p style='color:#9490c0;font-size:12px;margin:0'>Streamline &middot; Melbourne, Australia &middot; <a href='https://streamlinewebapps.com' style='color:#6d28d9'>streamlinewebapps.com</a></p>"+
            "</div>"
        })
      }).catch(()=>{});
    }
  }
  return new Response(JSON.stringify({received:true, type: evt.type, id: evt.id}), {status:200, headers:{"Content-Type":"application/json"}});
}

async function handleBuildSync(request, env, id) {
  const url = new URL(request.url);
  if (url.searchParams.get("pin") !== (env.ADMIN_PIN||"")) return new Response(JSON.stringify({error:"Unauthorized"}), {status:401, headers:{...CORS,"Content-Type":"application/json"}});
  // Run autoBuildPreview synchronously and capture stages
  const stages = [];
  try {
    if (!env.ANTHROPIC_API_KEY) throw new Error("no ANTHROPIC_API_KEY");
    if (!env.CF_API_TOKEN) throw new Error("no CF_API_TOKEN");
    if (!env.CF_ACCOUNT_ID) throw new Error("no CF_ACCOUNT_ID (val len: "+(env.CF_ACCOUNT_ID||"").length+")");
    stages.push("env_ok");
    const r = await fetch(SUPA_REST+"/streamline_submissions?id=eq."+encodeURIComponent(id)+"&select=*", {headers: SUPA_H});
    const d = await r.json();
    const sub = Array.isArray(d) && d[0];
    if (!sub) throw new Error("submission not found");
    stages.push("sub_fetched");
    const prompt = "Generate a single-file Cloudflare Worker (module-style export default { fetch }) that scaffolds an MVP web app for this submission. Output ONLY valid JavaScript wrapped in ```javascript ... ``` fence. Single fetch handler with HTML on /, optional small JSON API; embed HTML inline; only fetch/Response/URL APIs; Tailwind CDN OK; CORS headers; no secrets; small Built by Streamline footer. Title: " + (sub.title||"") + " | Description: " + (sub.description||"") + " | Tier: " + (sub.tier||"Standard");
    const cr = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"x-api-key":env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","Content-Type":"application/json"},
      body: JSON.stringify({model:"claude-haiku-4-5-20251001", max_tokens:4000, messages:[{role:"user", content: prompt}]})
    });
    if (!cr.ok) throw new Error("Claude API "+cr.status+": "+await cr.text());
    stages.push("claude_ok");
    const cd = await cr.json();
    const text = (cd.content && cd.content[0] && cd.content[0].text) || "";
    const codeMatch = text.match(/```(?:javascript|js)?\s*([\s\S]+?)```/);
    const code = codeMatch ? codeMatch[1].trim() : text.trim();
    if (!code || code.length < 100) throw new Error("scaffold too short: "+code.length);
    stages.push("code_extracted_"+code.length+"b");
    const slug = slugify(sub.title);
    const scriptName = "streamline-app-" + slug;
    const metadata = {main_module:"worker.js",compatibility_date:"2026-05-01",bindings:[]};
    const boundary = "----stripe-deploy-"+Math.random().toString(36).slice(2,12);
    const body = "--"+boundary+"\r\nContent-Disposition: form-data; name=\"metadata\"\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify(metadata) + "\r\n--"+boundary+"\r\nContent-Disposition: form-data; name=\"worker.js\"; filename=\"worker.js\"\r\nContent-Type: application/javascript+module\r\n\r\n" + code + "\r\n--"+boundary+"--\r\n";
    const dr = await fetch("https://api.cloudflare.com/client/v4/accounts/"+env.CF_ACCOUNT_ID+"/workers/scripts/"+scriptName, {
      method:"PUT",
      headers:{"Authorization":"Bearer "+env.CF_API_TOKEN, "Content-Type":"multipart/form-data; boundary="+boundary},
      body
    });
    const dj = await dr.json();
    if (!dj.success) throw new Error("CF deploy failed: "+JSON.stringify(dj.errors));
    stages.push("deployed_"+scriptName);
    const hostname = slug + ".streamlinewebapps.com";
    const domR = await fetch("https://api.cloudflare.com/client/v4/accounts/"+env.CF_ACCOUNT_ID+"/workers/domains", {
      method:"PUT",
      headers:{"Authorization":"Bearer "+env.CF_API_TOKEN, "Content-Type":"application/json"},
      body: JSON.stringify({environment:"production", hostname, service: scriptName, zone_id:"6292327060a0a2209a084cc7f0566e1a"})
    });
    const domJ = await domR.json();
    if (!domJ.success) stages.push("domain_FAIL: "+JSON.stringify(domJ.errors));
    else stages.push("domain_attached_"+hostname);
    return new Response(JSON.stringify({ok:true, stages, previewUrl:"https://"+hostname}), {headers:{...CORS,"Content-Type":"application/json"}});
  } catch(e) {
    return new Response(JSON.stringify({ok:false, stages, error:e.message, stack:(e.stack||"").slice(0,500)}), {status:500, headers:{...CORS,"Content-Type":"application/json"}});
  }
}

async function handleScaffold(request, env, id) {
  const url = new URL(request.url);
  if (url.searchParams.get("pin") !== (env.ADMIN_PIN||"")) return new Response(JSON.stringify({error:"Unauthorized"}), {status:401, headers:{...CORS,"Content-Type":"application/json"}});
  if (!env.ANTHROPIC_API_KEY) return new Response(JSON.stringify({error:"ANTHROPIC_API_KEY not set"}), {status:503, headers:{...CORS,"Content-Type":"application/json"}});
  // Fetch submission
  const r = await fetch(SUPA_REST+"/streamline_submissions?id=eq."+encodeURIComponent(id)+"&select=*", {headers: SUPA_H});
  const d = await r.json();
  const sub = Array.isArray(d) && d[0];
  if (!sub) return new Response(JSON.stringify({error:"Submission not found"}), {status:404, headers:{...CORS,"Content-Type":"application/json"}});
  // Build a constrained prompt
  const prompt = "Generate a single-file Cloudflare Worker (module-style export default { fetch }) that scaffolds an MVP web app for this submission. Output ONLY valid JavaScript wrapped in ```javascript ... ``` fence. Requirements:\n" +
    "- Single fetch handler that serves HTML on / and a small JSON API for one core action.\n" +
    "- Embed the HTML inline as a template literal const HTML.\n" +
    "- Use only fetch + Response + URL APIs (no external imports).\n" +
    "- Tailwind via CDN class names is OK in HTML.\n" +
    "- Add CORS headers.\n" +
    "- No secrets in source.\n" +
    "- Add a 'Built by Streamline' footer link.\n\n" +
    "App spec:\n" +
    "Title: " + (sub.title||"") + "\n" +
    "Description: " + (sub.description||"") + "\n" +
    "Category: " + (sub.category||"Utility") + "\n" +
    "Tier: " + (sub.tier||"Standard");
  try {
    const cr = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json"},
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        messages: [{role:"user", content: prompt}]
      })
    });
    const cd = await cr.json();
    if (!cr.ok) return new Response(JSON.stringify({error:"Claude API error", status:cr.status, detail:cd}), {status:502, headers:{...CORS,"Content-Type":"application/json"}});
    const text = (cd.content && cd.content[0] && cd.content[0].text) || "";
    const codeMatch = text.match(/```(?:javascript|js)?\s*([\s\S]+?)```/);
    const code = codeMatch ? codeMatch[1].trim() : text.trim();
    return new Response(JSON.stringify({
      submission_id: id,
      title: sub.title,
      generated_at: new Date().toISOString(),
      lines: code.split("\n").length,
      bytes: code.length,
      code,
      raw: text
    }), {headers:{...CORS,"Content-Type":"application/json"}});
  } catch(e) {
    return new Response(JSON.stringify({error:e.message||"Scaffold failed"}), {status:500, headers:{...CORS,"Content-Type":"application/json"}});
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const cors = corsFor(request);
    if (request.method === "OPTIONS") return new Response(null, {status:204, headers:cors});
    if (path === "/health") return new Response(JSON.stringify({ok:true,version:41,sha:"legal-rewrite-2026-05-06"}), {headers:{...cors,...SEC_HEADERS,"Content-Type":"application/json"}});
    if (path === "/og.png" || path === "/og.svg") {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#6d28d9"/></linearGradient><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a78bfa"/><stop offset="0.5" stop-color="#fbbf24"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="1050" cy="120" r="180" fill="#a78bfa" opacity="0.12"/><circle cx="120" cy="540" r="220" fill="#fbbf24" opacity="0.08"/><g transform="translate(80, 90)"><rect width="80" height="80" rx="20" fill="#fff" opacity="0.15"/><text x="40" y="58" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="42" font-weight="800" fill="#fff">S</text></g><text x="80" y="280" font-family="Inter,Arial,sans-serif" font-size="36" font-weight="500" fill="#a78bfa">Streamline Webapps</text><text x="80" y="370" font-family="Inter,Arial,sans-serif" font-size="84" font-weight="800" fill="#fff" letter-spacing="-2">Submit an idea.</text><text x="80" y="455" font-family="Inter,Arial,sans-serif" font-size="84" font-weight="800" fill="#fff" letter-spacing="-2">We build it.</text><text x="80" y="540" font-family="Inter,Arial,sans-serif" font-size="84" font-weight="800" fill="url(#grad)" letter-spacing="-2">You earn forever.</text><text x="80" y="595" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="400" fill="#a78bfa" opacity="0.85">25% lifetime revenue share \u00b7 AU \u00b7 streamlinewebapps.com</text></svg>`;
      return new Response(svg, {headers:{...SEC_HEADERS,"Content-Type":"image/svg+xml","Cache-Control":"public,max-age=86400"}});
    }
    if (path === "/robots.txt") return new Response("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /analytics\nSitemap: https://streamlinewebapps.com/sitemap.xml\n", {headers:{"Content-Type":"text/plain;charset=utf-8","Cache-Control":"public,max-age=3600",...SEC_HEADERS}});
    if (path === "/favicon.ico") return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#6d28d9"/><text x="16" y="22" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="800" fill="#fff">S</text></svg>', {headers:{"Content-Type":"image/svg+xml","Cache-Control":"public,max-age=86400",...SEC_HEADERS}});
    if (path === "/status") {
      const t = url.searchParams.get("t") || "";
      const v = await verifyStatusToken(env, t);
      if (!v) return new Response(STATUS_INVALID_HTML, {status:404, headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8","Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
      // Fetch submission from DB
      try {
        const r = await fetch(SUPA_REST+"/streamline_submissions?id=eq."+encodeURIComponent(v.id)+"&select=id,title,name,email,tier,status,created_at,stripe_session_id", {headers: SUPA_H});
        const d = await r.json();
        const sub = Array.isArray(d) && d[0];
        if (!sub || (sub.email||"").toLowerCase() !== v.email) return new Response(STATUS_INVALID_HTML, {status:404, headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8","X-Robots-Tag":"noindex"}});
        const html = renderStatus(sub);
        return new Response(html, {headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8","Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
      } catch(e) {
        return new Response(STATUS_INVALID_HTML, {status:500, headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8"}});
      }
    }
    if (path === "/sitemap.xml") return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://streamlinewebapps.com/</loc><priority>1.0</priority></url>\n  <url><loc>https://streamlinewebapps.com/privacy</loc><priority>0.4</priority></url>\n  <url><loc>https://streamlinewebapps.com/terms</loc><priority>0.4</priority></url>\n  <url><loc>https://streamlinewebapps.com/refunds</loc><priority>0.4</priority></url>\n</urlset>\n', {headers:{"Content-Type":"application/xml;charset=utf-8","Cache-Control":"public,max-age=3600",...SEC_HEADERS}});
    if (path === "/chat" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP")||"";
      if (!rateOk(ip, "chat", 20)) return new Response(JSON.stringify({reply:"Too many messages, slow down a sec."}), {status:429, headers:{...cors,...SEC_HEADERS,"Content-Type":"application/json"}});
      let body = {};
      try { body = await request.json(); } catch(e) {}
      const userMsg = String(body.message||"").slice(0,500);
      if (!userMsg) return new Response(JSON.stringify({reply:"What\u2019s your question?"}), {headers:{...cors,...SEC_HEADERS,"Content-Type":"application/json"}});
      // Try Claude first; fall through to rule-based on error
      if (env.ANTHROPIC_API_KEY) {
        try {
          const sys = "You are the assistant on streamlinewebapps.com (Streamline Webapps), an Australian web-apps marketplace. Customers submit app ideas, pay one-time ($29 Standard / $99 Priority / $299 Equity AUD), and a small team builds the app using Claude/GPT AI tools (1-4 week turnaround, personally reviewed within 48 hours). Customer earns 25% lifetime revenue share. Refunds: Standard 30-day if build hasn\u2019t started, Priority 14-day, Equity 14-day with 48hr build-start commitment. Quarterly payouts via AU bank transfer (PayID/BSB), minimum $50 threshold. We (Streamline) own the IP; customer gets a perpetual revenue-share licence via signed deed (Equity tier). Marketplace is launching with first paying customer in 2026 \u2014 earlier \u2018live apps\u2019 on the homepage are founder portfolio, not customer wins. Based in Melbourne, AU. Insurance: PI/Cyber being arranged with BizCover/Aon. Reply concisely (1-3 sentences). Be honest about what we do and don\u2019t have. Email hello@streamlinewebapps.com for anything not covered.";
          const cr = await fetch("https://api.anthropic.com/v1/messages", {
            method:"POST",
            headers:{"x-api-key":env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","Content-Type":"application/json"},
            body: JSON.stringify({model:"claude-haiku-4-5-20251001", max_tokens:300, system: sys, messages:[{role:"user", content: userMsg}]})
          });
          if (cr.ok) {
            const cd = await cr.json();
            const reply = (cd.content && cd.content[0] && cd.content[0].text) || "";
            if (reply) return new Response(JSON.stringify({reply, src:"claude"}), {headers:{...cors,...SEC_HEADERS,"Content-Type":"application/json"}});
          }
        } catch(e) {}
      }
      // Rule-based fallback
      const m = userMsg.toLowerCase();
      let reply = "For anything I can\u2019t answer here, email hello@streamlinewebapps.com.";
      if (/price|cost|tier|standard|priority|equity|how much|fee/.test(m)) reply = "Standard $29 / Priority $99 / Equity $299 AUD \u2014 one-time + 25% perpetual revenue share.";
      else if (/payout|pay out|paid|when do i get/.test(m)) reply = "Quarterly payouts via AU bank transfer, within 30 days of quarter-end. Minimum $50 threshold.";
      else if (/refund/.test(m)) reply = "Standard 30-day, Priority 14-day, Equity 14-day refund if build hasn\u2019t started.";
      else if (/time|build|long|fast|when/.test(m)) reply = "Standard 1\u20134 weeks. Priority jumps the queue. Preview within 48 hours of payment.";
      else if (/own|ip|copyright/.test(m)) reply = "Streamline owns the built IP. You get a perpetual 25% revenue-share licence (Equity tier).";
      else if (/contact|email|reach/.test(m)) reply = "hello@streamlinewebapps.com \u2014 replies within 24 hours.";
      return new Response(JSON.stringify({reply, src:"fallback"}), {headers:{...cors,...SEC_HEADERS,"Content-Type":"application/json"}});
    }
    if (path === "/stats" && request.method === "GET") {
      // Real stats from DB, replaces the upstream proxy
      try {
        const [subs, ideas] = await Promise.all([
          fetch(SUPA_REST+"/streamline_submissions?select=status,tier&limit=1000",{headers:SUPA_H}).then(r=>r.ok?r.json():[]).catch(()=>[]),
          fetch(SUPA_REST+"/streamline_ideas?select=status,revenue&limit=1000",{headers:SUPA_H}).then(r=>r.ok?r.json():[]).catch(()=>[])
        ]);
        const paid = (Array.isArray(subs)?subs:[]).filter(s=>s.status==="paid").length;
        const live = (Array.isArray(ideas)?ideas:[]).filter(i=>i.status==="live").length;
        const building = (Array.isArray(ideas)?ideas:[]).filter(i=>i.status==="building").length;
        const monthly = (Array.isArray(ideas)?ideas:[]).reduce((a,i)=>a+Number(i.revenue||0),0);
        // paid_out = 25% commission on monthly (rough lifetime estimate placeholder)
        const paid_out = Math.round(monthly*0.25);
        return new Response(JSON.stringify({live,building,monthly,paid_out,paid_subs:paid}),{headers:{...cors,...SEC_HEADERS,"Content-Type":"application/json","Cache-Control":"public,max-age=60"}});
      } catch(e) {
        return new Response(JSON.stringify({live:0,building:0,monthly:0,paid_out:0,error:"stats_fallback"}),{headers:{...cors,...SEC_HEADERS,"Content-Type":"application/json"}});
      }
    }
    if (path === "/privacy") return new Response(PRIVACY_HTML, {headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8","Cache-Control":"public,max-age=86400"}});
    if (path === "/terms") return new Response(TERMS_HTML, {headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8","Cache-Control":"public,max-age=86400"}});
    if (path === "/refunds") return new Response(REFUNDS_HTML, {headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8","Cache-Control":"public,max-age=86400"}});
    if (path === "/admin") return new Response(ADMIN_HTML, {headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8","X-Robots-Tag":"noindex,nofollow"}});
    if (path === "/admin/data") return handleAdminData(request, env);
    if (path === "/stripe/webhook" && request.method === "POST") return handleStripeWebhook(request, env, ctx);
    if (path.startsWith("/admin/scaffold/") && request.method === "POST") return handleScaffold(request, env, path.replace("/admin/scaffold/",""));
    if (path.startsWith("/admin/build/") && request.method === "POST") return handleBuildSync(request, env, path.replace("/admin/build/",""));
    if (path === "/analytics" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP")||"";
      if (!rateOk(ip, "an", 60)) return new Response("ok", {headers: cors});
      return handleAnalytics(request);
    }

    if (path === "/submit" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP")||"";
      if (!rateOk(ip, "sub", 5)) return new Response(JSON.stringify({error:"Too many requests"}), {status:429, headers:{...CORS,"Content-Type":"application/json"}});
      return handleSubmit(request, env);
    }

    if (API_ROUTES.includes(path)) {
      const ip = request.headers.get("CF-Connecting-IP")||"";
      if (path === "/chat" && !rateOk(ip, "chat", 20)) return new Response(JSON.stringify({error:"Too many requests"}), {status:429, headers:{...CORS,"Content-Type":"application/json"}});
      if (path === "/vote" && !rateOk(ip, "vote", 30)) return new Response(JSON.stringify({error:"Too many requests"}), {status:429, headers:{...CORS,"Content-Type":"application/json"}});
      const target = SUPABASE+path+url.search;
      const h = new Headers(request.headers); h.delete("host");
      try {
        const pr = await fetch(target, {method:request.method, headers:h, body:["GET","HEAD"].includes(request.method)?undefined:request.body, redirect:"follow"});
        const rh = new Headers(pr.headers);
        Object.entries(CORS).forEach(([k,v])=>rh.set(k,v));
        rh.set("Cache-Control","no-cache");
        return new Response(pr.body, {status:pr.status, headers:rh});
      } catch(e) { return new Response(JSON.stringify({error:"Upstream error"}), {status:502, headers:{...CORS,"Content-Type":"application/json"}}); }
    }

    // Only the root path returns the homepage HTML. All other unknown paths get a real 404.
    if (path === "/" || path === "/index.html") {
      return new Response(HTML, {status:200, headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8","Cache-Control":"public,s-maxage=300,stale-while-revalidate=60"}});
    }
    return new Response(NOT_FOUND_HTML, {status:404, headers:{...SEC_HEADERS,"Content-Type":"text/html;charset=utf-8","Cache-Control":"no-store"}});
  }
};

function renderStatus(sub) {
  const stages = [
    {key:"awaiting_payment", label:"Awaiting payment"},
    {key:"paid",              label:"Payment received"},
    {key:"reviewing",         label:"Reviewing your idea"},
    {key:"building",          label:"Building"},
    {key:"preview",           label:"Preview ready"},
    {key:"live",              label:"Live"}
  ];
  const cur = stages.findIndex(x => x.key === sub.status);
  function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
  const stepsHtml = stages.map((st, i) => {
    const done = i <= cur;
    const active = i === cur;
    return `<div class="ss-step ${done?"done":""} ${active?"active":""}"><div class="ss-dot">${done?"✓":i+1}</div><div class="ss-lbl">${esc(st.label)}</div></div>`;
  }).join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Submission status &mdash; Streamline</title>
<meta name="robots" content="noindex"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8f7ff;color:#1e1b4b;min-height:100vh}
nav{background:rgba(248,247,255,.93);backdrop-filter:blur(20px);border-bottom:1px solid #ddd8f5;padding:0 40px;position:sticky;top:0;z-index:90}
.nav-inner{max-width:880px;margin:0 auto;display:flex;align-items:center;height:60px}
.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:19px;letter-spacing:-.03em;display:flex;align-items:center;gap:9px}
.logo-mark{width:30px;height:30px;background:linear-gradient(135deg,#6d28d9,#7c3aed);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:800}
main{max-width:680px;margin:0 auto;padding:48px 24px}
.card{background:#fff;border:1px solid #ddd8f5;border-radius:16px;padding:36px;box-shadow:0 4px 24px rgba(109,40,217,.06)}
h1{font-family:'Syne',sans-serif;font-size:32px;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
.muted{color:#6b6896;font-size:14px;margin-bottom:24px}
.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0eeff;font-size:14px}
.row:last-of-type{border-bottom:none}
.row span:first-child{color:#6b6896}
.row span:last-child{font-weight:600;color:#1e1b4b}
.steps{margin-top:32px}
.ss-step{display:flex;align-items:center;gap:14px;padding:10px 0;color:#9490c0;font-size:14px}
.ss-step.done{color:#1e1b4b}
.ss-step.active{color:#6d28d9;font-weight:600}
.ss-dot{width:28px;height:28px;border-radius:50%;background:#f0eeff;border:1px solid #ddd8f5;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#9490c0;flex-shrink:0}
.ss-step.done .ss-dot{background:#6d28d9;border-color:#6d28d9;color:#fff}
.ss-step.active .ss-dot{background:#fff;border-color:#6d28d9;color:#6d28d9}
.cta{display:inline-block;margin-top:24px;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none}
.note{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;font-size:13px;color:#92400e;margin-top:24px;line-height:1.6}
</style></head>
<body><nav><div class="nav-inner"><a href="/" class="logo"><div class="logo-mark">S</div>Streamline</a></div></nav>
<main><div class="card">
  <h1>${esc(sub.title)}</h1>
  <p class="muted">Submitted ${esc((sub.created_at||"").slice(0,10))} &middot; ${esc(sub.tier)} tier &middot; <a href="mailto:hello@streamlinewebapps.com" style="color:#6d28d9">Email us</a></p>
  <div class="row"><span>Submission ID</span><span>#${esc(sub.id)}</span></div>
  <div class="row"><span>Status</span><span>${esc(sub.status)}</span></div>
  <div class="row"><span>Tier</span><span>${esc(sub.tier)}</span></div>
  <div class="row"><span>Submitter</span><span>${esc(sub.name)}</span></div>
  <div class="steps">${stepsHtml}</div>
  <div class="note">Bookmark this page to check progress. The link is yours alone &mdash; don&rsquo;t share it. We&rsquo;ll email you when the status changes.</div>
  <a href="mailto:hello@streamlinewebapps.com?subject=About my submission #${esc(sub.id)}" class="cta">Reply to us</a>
</div></main></body></html>`;
}

const STATUS_INVALID_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Status link not valid &mdash; Streamline</title>
<meta name="robots" content="noindex"/>
<style>body{font-family:Inter,sans-serif;background:#f8f7ff;color:#1e1b4b;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px}
.box{max-width:440px}
h1{font-family:Syne,sans-serif;font-size:32px;margin-bottom:12px}
p{color:#4c4885;line-height:1.6;margin-bottom:24px}
a{display:inline-block;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700}</style></head>
<body><div class="box"><h1>Status link not valid</h1><p>This status link has expired, was changed, or never existed. Email us if you need help finding your submission.</p><a href="mailto:hello@streamlinewebapps.com">Email Streamline</a></div></body></html>`;

const NOT_FOUND_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>404 — Streamline</title>
<meta name="robots" content="noindex"/>
<style>body{font-family:Inter,sans-serif;background:#f8f7ff;color:#1e1b4b;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px}
.box{max-width:440px}
h1{font-family:Syne,sans-serif;font-size:84px;margin:0 0 8px;background:linear-gradient(135deg,#6d28d9,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
h2{font-family:Syne,sans-serif;font-size:24px;font-weight:800;margin:0 0 12px}
p{color:#4c4885;line-height:1.6;margin:0 0 28px}
a{display:inline-block;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;box-shadow:0 4px 14px rgba(109,40,217,.3)}</style></head>
<body><div class="box"><h1>404</h1><h2>Page not found</h2><p>The page you're looking for doesn't exist or has moved.</p><a href="/">Back to Streamline →</a></div></body></html>`;



const PRIVACY_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Privacy Policy — Streamline</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#fafaf8;--white:#ffffff;--surface:#f4f4f0;--surface-2:#eeede9;
  --border:#e5e4e0;--border-2:#d5d4cf;
  --ink:#1a1a18;--ink-2:#5a5a56;--ink-3:#9a9994;
  --accent:#4f46e5;--accent-light:#ede9fe;
  --r:10px;--r-lg:16px;
}
html{background:var(--bg);color:var(--ink);font-family:'Inter',sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
nav{background:rgba(250,250,248,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 40px}
.nav-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:58px}
.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:19px;letter-spacing:-.03em;display:flex;align-items:center;gap:8px;cursor:pointer}
.logo-mark{width:28px;height:28px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800}
main{max-width:900px;margin:0 auto;padding:60px 40px}
h1{font-family:'Syne',sans-serif;font-size:48px;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:8px;color:var(--ink)}
.updated{font-size:14px;color:var(--ink-3);margin-bottom:44px}
section{margin-bottom:48px}
h2{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;letter-spacing:-.02em;margin-bottom:12px;margin-top:28px}
h2:first-child{margin-top:0}
p{margin-bottom:14px;color:var(--ink-2);line-height:1.8}
ul,ol{margin-left:20px;margin-bottom:14px}
li{margin-bottom:8px;color:var(--ink-2);line-height:1.7}
footer{border-top:1px solid var(--border);padding:36px 40px;background:var(--white);margin-top:60px}
.foot-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.foot-logo{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;letter-spacing:-.02em;display:flex;align-items:center;gap:7px}
.foot-logo .logo-mark{width:22px;height:22px;font-size:11px}
.foot-links{display:flex;gap:20px}
.foot-links a{font-size:13px;color:var(--ink-2)}
.foot-links a:hover{color:var(--accent)}
footer p{font-size:13px;color:var(--ink-3);margin:0}
@media(max-width:768px){
  main,nav{padding-left:20px;padding-right:20px}
  h1{font-size:32px}
  h2{font-size:20px}
  .foot-inner{flex-direction:column;gap:8px;text-align:center}
  .foot-links{justify-content:center}
}
</style></head><body>
<nav>
  <div class="nav-inner">
    <a href="/" class="logo"><div class="logo-mark">✦</div>Streamline</a>
  </div>
</nav>
<main>
  <h1>Privacy Policy</h1>
  <p class="updated">Last updated: 2026-05-06 · Version 2.0</p>

  <section>
    <p>Streamline Webapps ("Streamline", "we", "us") respects your privacy. This Policy explains what personal information we collect, how we use it, who we share it with, how to access or correct it, and how to lodge a complaint.</p>
    <p>We are bound by the Australian Privacy Principles (APPs) in the Privacy Act 1988 (Cth). If you are accessing Streamline from outside Australia, by using the service you consent to your information being transferred to and processed in Australia.</p>
  </section>

  <section>
    <h2>1. Information we collect</h2>
    <ul>
      <li><strong>Submission information:</strong> name, email, optional phone, app title, category, and description.</li>
      <li><strong>Payment information:</strong> handled entirely by Stripe; we don't store card numbers. We receive a Stripe session ID and the amount paid.</li>
      <li><strong>Voting fingerprint:</strong> a hashed browser fingerprint used to prevent duplicate votes. Not used to identify you across services.</li>
      <li><strong>Server logs:</strong> IP address (via Cloudflare CF-Connecting-IP), HTTP method, path, referrer, and timestamp.</li>
      <li><strong>Email correspondence:</strong> any messages you send to <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a>.</li>
    </ul>
  </section>

  <section>
    <h2>2. How we use your information</h2>
    <ul>
      <li>To review and build the app you submitted</li>
      <li>To process payments and pay your revenue share</li>
      <li>To send transactional emails (build progress, payouts, statements)</li>
      <li>To prevent fraud and abuse (rate limiting, voting deduplication)</li>
      <li>To comply with Australian law and respond to lawful requests</li>
    </ul>
  </section>

  <section>
    <h2>3. Cookies and similar technologies</h2>
    <p>Streamline does not set tracking cookies or third-party analytics cookies. We don't use Google Analytics, Facebook Pixel, or similar.</p>
    <p>What we do use:</p>
    <ul>
      <li><strong>localStorage</strong> in your browser to remember which ideas you've voted on (so you don't double-vote). This data stays on your device.</li>
      <li><strong>Google Fonts</strong> loaded from fonts.googleapis.com. Google may set its own cookies when serving font files. See <a href="https://policies.google.com/privacy">Google's privacy policy</a>.</li>
      <li><strong>Cloudflare</strong> sets a small cookie ("__cf_bm") for bot management. See <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare's privacy policy</a>.</li>
    </ul>
  </section>

  <section>
    <h2>4. Australian Privacy Principles</h2>
    <p>We comply with the 13 Australian Privacy Principles. Highlights:</p>
    <ul>
      <li><strong>APP 1 (open management):</strong> this Policy is published openly.</li>
      <li><strong>APP 5 (notification):</strong> at the time of collection (the submission form), we tell you what we collect and why.</li>
      <li><strong>APP 6 (use and disclosure):</strong> we use your information for the primary purpose of building your app and managing the marketplace; we do not sell your information.</li>
      <li><strong>APP 11 (security):</strong> data is stored on Supabase (encrypted at rest, AU region) and Cloudflare. Stripe handles all card data.</li>
      <li><strong>APP 12 (access):</strong> you may request a copy of any information we hold about you by emailing <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a>.</li>
      <li><strong>APP 13 (correction):</strong> you may request correction of inaccurate information at the same address. We will correct or explain why we have not within 30 days.</li>
    </ul>
  </section>

  <section>
    <h2>5. Right to delete (data erasure)</h2>
    <p>You may request deletion of your personal information at any time by emailing <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a> from the email address you submitted. We will:</p>
    <ul>
      <li>Confirm your request within 7 days.</li>
      <li>Delete your submission row, voting history, and email correspondence within 30 days.</li>
      <li>Retain financial records (payments and payouts) for 7 years as required by Australian tax law and the Corporations Act.</li>
      <li>Anonymise rather than delete any record needed for an active dispute or legal claim until resolution.</li>
    </ul>
  </section>

  <section>
    <h2>6. Data retention</h2>
    <p>We retain submission and account information for the duration of our relationship with you and for 7 years afterwards (Australian tax record requirements). Voting fingerprints are retained for 12 months. Server logs are retained for 90 days.</p>
  </section>

  <section>
    <h2>7. Third-party services</h2>
    <ul>
      <li><strong>Stripe</strong> (payments) — Ireland/USA. <a href="https://stripe.com/au/privacy">Stripe Privacy</a></li>
      <li><strong>Cloudflare</strong> (hosting, security, edge caching) — Australia/USA. <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy</a></li>
      <li><strong>Supabase</strong> (database, auth) — region: ap-southeast (AU/Singapore). <a href="https://supabase.com/privacy">Supabase Privacy</a></li>
      <li><strong>Resend</strong> (email delivery) — USA. <a href="https://resend.com/privacy">Resend Privacy</a></li>
      <li><strong>Anthropic</strong> (AI model) — USA. We do not send your personal information to Anthropic; only the public submission text. <a href="https://www.anthropic.com/legal/privacy">Anthropic Privacy</a></li>
      <li><strong>Google Fonts</strong> (fonts only). <a href="https://policies.google.com/privacy">Google Privacy</a></li>
    </ul>
  </section>

  <section>
    <h2>8. Cross-border data transfer</h2>
    <p>Some of our processors are located outside Australia (USA, Ireland, Singapore). By submitting an idea, you consent to your information being transferred to those jurisdictions for the purposes described above. We take reasonable steps to ensure overseas recipients comply with the Australian Privacy Principles.</p>
  </section>

  <section>
    <h2>9. EU/UK visitors (GDPR)</h2>
    <p>If you access Streamline from the European Union or United Kingdom and submit personal information, the General Data Protection Regulation may apply. Our lawful bases for processing are (a) performance of contract (building your app, paying your share), and (b) legitimate interest (preventing fraud, securing the service).</p>
    <p>You have the right to access, rectify, erase, and port your data, and to lodge a complaint with your supervisory authority. Email <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a> to exercise these rights.</p>
  </section>

  <section>
    <h2>10. Security</h2>
    <p>We use TLS in transit, encryption at rest at our data processors, HMAC-signed status URLs, no plaintext passwords (we don't have password-based accounts), and rate limiting on every public endpoint. We never email or store full credit card details. Despite reasonable measures, no internet service is 100% secure; we will notify affected users and the OAIC if a notifiable data breach occurs (Notifiable Data Breaches scheme, Privacy Act).</p>
  </section>

  <section>
    <h2>11. Children's privacy</h2>
    <p>Streamline is not intended for users under 18. We do not knowingly collect information from anyone under 18. If you believe we have collected information from a minor, email us and we will delete it.</p>
  </section>

  <section>
    <h2>12. Changes to this Policy</h2>
    <p>We may update this Policy by publishing the revised version with an updated date. Material changes will be notified by email to current customers.</p>
  </section>

  <section>
    <h2>13. Complaints and contact</h2>
    <p>If you have a privacy complaint, email us first at <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a>. We will respond within 30 days.</p>
    <p>If you are not satisfied with our response, you may complain to the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au">oaic.gov.au</a> or call 1300 363 992.</p>
  </section>
</main>
<footer>
  <div class="foot-inner">
    <div class="foot-logo"><div class="logo-mark">✦</div>Streamline</div>
    <div class="foot-links">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/refunds">Refunds</a>
    </div>
    <p>© 2026 Luck Dragon Pty Ltd (ABN 64 697 434 898)</p>
  </div>
</footer>
</body></html>`;

const TERMS_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Terms of Service — Streamline</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#fafaf8;--white:#ffffff;--surface:#f4f4f0;--surface-2:#eeede9;
  --border:#e5e4e0;--border-2:#d5d4cf;
  --ink:#1a1a18;--ink-2:#5a5a56;--ink-3:#9a9994;
  --accent:#4f46e5;--accent-light:#ede9fe;
  --r:10px;--r-lg:16px;
}
html{background:var(--bg);color:var(--ink);font-family:'Inter',sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
nav{background:rgba(250,250,248,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 40px}
.nav-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:58px}
.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:19px;letter-spacing:-.03em;display:flex;align-items:center;gap:8px;cursor:pointer}
.logo-mark{width:28px;height:28px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800}
main{max-width:900px;margin:0 auto;padding:60px 40px}
h1{font-family:'Syne',sans-serif;font-size:48px;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:8px;color:var(--ink)}
.updated{font-size:14px;color:var(--ink-3);margin-bottom:44px}
section{margin-bottom:48px}
h2{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;letter-spacing:-.02em;margin-bottom:12px;margin-top:28px}
h2:first-child{margin-top:0}
p{margin-bottom:14px;color:var(--ink-2);line-height:1.8}
ul,ol{margin-left:20px;margin-bottom:14px}
li{margin-bottom:8px;color:var(--ink-2);line-height:1.7}
footer{border-top:1px solid var(--border);padding:36px 40px;background:var(--white);margin-top:60px}
.foot-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.foot-logo{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;letter-spacing:-.02em;display:flex;align-items:center;gap:7px}
.foot-logo .logo-mark{width:22px;height:22px;font-size:11px}
.foot-links{display:flex;gap:20px}
.foot-links a{font-size:13px;color:var(--ink-2)}
.foot-links a:hover{color:var(--accent)}
footer p{font-size:13px;color:var(--ink-3);margin:0}
@media(max-width:768px){
  main,nav{padding-left:20px;padding-right:20px}
  h1{font-size:32px}
  h2{font-size:20px}
  .foot-inner{flex-direction:column;gap:8px;text-align:center}
  .foot-links{justify-content:center}
}
</style></head><body>
<nav>
  <div class="nav-inner">
    <a href="/" class="logo"><div class="logo-mark">✦</div>Streamline</a>
  </div>
</nav>
<main>
  <h1>Terms of Service</h1>
  <p class="updated">Last updated: 2026-05-06 · Version 2.0</p>

  <section>
    <p>These Terms of Service ("Terms") govern your use of Streamline Webapps ("Streamline", "we", "us", or "our"), operated by Luck Dragon (ABN to be registered) of Melbourne, Victoria, Australia. By accessing or using Streamline, you agree to be bound by these Terms.</p>
  </section>

  <section>
    <h2>1. Service description</h2>
    <p>Streamline is an Australian web-apps marketplace. You submit an idea, pay a one-time submission fee, and we use AI tools and our own development effort to build a web app from your idea. You receive a 25% revenue share of the app's net revenue for as long as we operate the app, paid quarterly via Australian bank transfer (subject to clauses 3 and 4 below).</p>
    <p>Tiers (one-time submission fee, GST-inclusive where applicable):</p>
    <ul>
      <li><strong>Standard ($29 AUD)</strong> — 25% perpetual revenue share, 1–4 week build, 30-day refund window if build hasn't started.</li>
      <li><strong>Priority ($99 AUD)</strong> — 25% perpetual revenue share, queue priority, 14-day refund window.</li>
      <li><strong>Equity ($299 AUD)</strong> — 25% perpetual revenue share via signed Equity Deed, 14-day refund window with 48-hour build-start commitment.</li>
    </ul>
    <p>All tiers receive the same 25% revenue share rate. Higher tiers buy speed, priority, and a signed contract — not a higher revenue percentage.</p>
  </section>

  <section>
    <h2>2. Intellectual property</h2>
    <p>All intellectual property in the built application (code, design, brand, domain, and content) belongs to Streamline. You assign any IP you may otherwise have in the built app to us on creation. In return, you receive a perpetual revenue-share licence (clause 4 below) for the lifetime of the app.</p>
    <p>You warrant that the idea you submit is your own concept or otherwise free of third-party rights. You indemnify us against any claim that your submission infringes a third party's IP, except to the extent the claim arises from our independent additions you didn't request.</p>
    <p>You may publicly disclose your involvement (e.g., on LinkedIn) but may not disclose our internal pricing, customer lists, financial figures we share confidentially, or trade secrets.</p>
    <p>This Streamline marketplace IP arrangement does not constitute, and is not intended to constitute, (a) a financial product as defined in the Corporations Act 2001 (Cth), (b) a managed investment scheme requiring registration with ASIC, (c) shares or securities, or (d) any right to participate in management of Streamline. The arrangement is consideration for your conceptual contribution; it does not create a partnership, joint venture, employment relationship, or fiduciary duty between us.</p>
  </section>

  <section>
    <h2>3. Payment and refunds</h2>
    <p>Payments are processed by Stripe in Australian dollars (AUD). All listed prices are GST-inclusive where Streamline is GST-registered.</p>
    <p>Refunds (also see <a href="/refunds">/refunds</a>):</p>
    <ul>
      <li>Standard: full refund of the $29 fee if we have not started development within 30 days of payment.</li>
      <li>Priority: full refund of the $99 fee if we have not started within 14 days.</li>
      <li>Equity: full refund of the $299 fee if we have not started within 14 days; we commit to starting within 48 hours.</li>
    </ul>
    <p>Refunds are processed to your original payment method within 5–10 business days of approval.</p>
    <p><strong>Australian Consumer Law:</strong> Nothing in these Terms or the refund policy excludes, restricts or modifies any consumer guarantee or right under the Australian Consumer Law (Schedule 2 to the Competition and Consumer Act 2010 (Cth)) that cannot lawfully be excluded. Our refund policy applies in addition to your rights under the Australian Consumer Law.</p>
  </section>

  <section>
    <h2>4. Revenue share payments</h2>
    <p>Net revenue means gross revenue actually received from end users in respect of the app, less Stripe processing fees and chargebacks, refunds issued to end users, GST included in gross revenue (we account for GST separately), and direct hosting/infrastructure costs solely attributable to the app. General overheads, salaries, marketing and shared infrastructure are not deducted.</p>
    <p>We will pay you 25% of net revenue for the lifetime of the app, paid quarterly by Australian bank transfer (PayID or BSB/Account) within 30 days of quarter-end, provided the accumulated unpaid balance is at least AU$50. Below that threshold the balance rolls forward.</p>
    <p>You are responsible for declaring this income to the Australian Taxation Office.</p>
    <p><strong>No guarantee of earnings.</strong> Payments are contingent on the app actually generating revenue. We do not guarantee that any app will generate revenue, reach the $50 payment threshold, or continue operating indefinitely. Individual results will vary significantly. Any historical revenue figures shown on our marketing pages reflect founder portfolio data unless explicitly labelled as customer-generated; the customer marketplace is launching with our first paid customer in 2026.</p>
    <p>We may discontinue the app if it generates less than $50 net revenue per month for 6 consecutive months, with 30 days written notice. Accrued unpaid amounts remain payable.</p>
  </section>

  <section>
    <h2>5. Submission requirements</h2>
    <p>By submitting an idea, you certify that:</p>
    <ul>
      <li>You are at least 18 years old and legally able to enter into this agreement.</li>
      <li>You own or have rights to the idea, and the idea does not infringe a third party's intellectual property, trade-mark, patent, copyright, or contractual restriction.</li>
      <li>The information you provide is accurate and truthful.</li>
      <li>You will not, within 24 months of submission, build, commission, or operate a substantially similar product targeting the same customer problem in the same market segment.</li>
    </ul>
  </section>

  <section>
    <h2>6. Marketplace voting</h2>
    <p>Submitted ideas may be displayed publicly for community voting. Each visitor may vote once per idea. Votes are anonymous but tied to a browser fingerprint to prevent duplicates. We may disqualify ideas that violate these Terms.</p>
  </section>

  <section>
    <h2>7. Prohibited content</h2>
    <p>Submitted ideas must not contain:</p>
    <ul>
      <li>Illegal activity or content that violates Australian law</li>
      <li>Hate speech, discrimination, or harassment</li>
      <li>Explicit sexual or violent content involving real people</li>
      <li>Content sexualising minors (zero tolerance)</li>
      <li>Misinformation or scam schemes</li>
      <li>Infringement of third-party rights</li>
      <li>Content designed to defame, harass, or stalk a person</li>
    </ul>
    <p>We may reject or remove any idea that violates these standards. If we reject within 14 days of payment, you receive a full refund (clause 3); if we discover a violation later, you may forfeit the submission fee at our discretion.</p>
  </section>

  <section>
    <h2>8. Communications consent (Spam Act)</h2>
    <p>By submitting an idea, you consent to receive transactional and product-update communications from us at the email address you provide. Examples include build progress, payouts, and statement of account. You may withdraw consent for non-transactional emails at any time by emailing <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a> or replying with "unsubscribe". This consent is granted under the Spam Act 2003 (Cth).</p>
  </section>

  <section>
    <h2>9. Privacy</h2>
    <p>Your personal information is handled in accordance with our <a href="/privacy">Privacy Policy</a>. We are bound by the Australian Privacy Principles in the Privacy Act 1988 (Cth).</p>
  </section>

  <section>
    <h2>10. Limitation of liability</h2>
    <p>To the extent permitted by law, our total aggregate liability under these Terms is capped at the greater of (a) the submission fee you paid, or (b) the total revenue share paid to you in the 12 months preceding the claim.</p>
    <p>We are not liable for indirect, consequential, lost-profit, or speculative damages.</p>
    <p>Nothing in this clause limits or excludes (a) any right or guarantee under the Australian Consumer Law that cannot lawfully be excluded, (b) liability for fraud or fraudulent misrepresentation, or (c) liability for personal injury or death caused by negligence.</p>
  </section>

  <section>
    <h2>11. Force majeure</h2>
    <p>We are not in breach of these Terms if we cannot perform our obligations due to circumstances beyond our reasonable control, including natural disasters, government action, pandemic, significant technical failure, or third-party platform outages (AI model providers, payment processors, cloud infrastructure).</p>
  </section>

  <section>
    <h2>12. Governing law and dispute resolution</h2>
    <p>These Terms are governed by the laws of Victoria, Australia. The exclusive jurisdiction for any dispute is the courts of Victoria.</p>
    <p>Before commencing legal proceedings, the parties will attempt good-faith negotiation within 21 days, and if unresolved, mediation through the Resolution Institute or comparable Australian mediator. This clause does not limit your rights to lodge complaints with the ACCC, ASIC, the Australian Information Commissioner, or any other regulator.</p>
  </section>

  <section>
    <h2>13. Changes to Terms</h2>
    <p>We may update these Terms by posting the revised version on this page with an updated date. Material changes affecting your existing submissions or payouts will be notified by email. Your continued use of Streamline after changes are posted constitutes acceptance.</p>
  </section>

  <section>
    <h2>14. Severability and entire agreement</h2>
    <p>If any clause is held unenforceable, the remainder of these Terms continues in force. These Terms (together with the Privacy Policy, Refund Policy, and any signed Equity Deed) form the entire agreement between us.</p>
  </section>

  <section>
    <h2>15. Contact</h2>
    <p>Email: <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a></p>
    <p>Streamline Webapps · Melbourne, Australia</p>
  </section>
</main>
<footer>
  <div class="foot-inner">
    <div class="foot-logo"><div class="logo-mark">✦</div>Streamline</div>
    <div class="foot-links">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/refunds">Refunds</a>
    </div>
    <p>© 2026 Luck Dragon Pty Ltd (ABN 64 697 434 898)</p>
  </div>
</footer>
</body></html>`;

const REFUNDS_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Refund Policy — Streamline</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#fafaf8;--white:#ffffff;--surface:#f4f4f0;--surface-2:#eeede9;
  --border:#e5e4e0;--border-2:#d5d4cf;
  --ink:#1a1a18;--ink-2:#5a5a56;--ink-3:#9a9994;
  --accent:#4f46e5;--accent-light:#ede9fe;
  --r:10px;--r-lg:16px;
}
html{background:var(--bg);color:var(--ink);font-family:'Inter',sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
nav{background:rgba(250,250,248,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 40px}
.nav-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:58px}
.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:19px;letter-spacing:-.03em;display:flex;align-items:center;gap:8px;cursor:pointer}
.logo-mark{width:28px;height:28px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800}
main{max-width:900px;margin:0 auto;padding:60px 40px}
h1{font-family:'Syne',sans-serif;font-size:48px;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:8px;color:var(--ink)}
.updated{font-size:14px;color:var(--ink-3);margin-bottom:44px}
section{margin-bottom:48px}
h2{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;letter-spacing:-.02em;margin-bottom:12px;margin-top:28px}
h2:first-child{margin-top:0}
p{margin-bottom:14px;color:var(--ink-2);line-height:1.8}
ul,ol{margin-left:20px;margin-bottom:14px}
li{margin-bottom:8px;color:var(--ink-2);line-height:1.7}
.tier-box{background:var(--white);border:1px solid var(--border);border-radius:var(--r-lg);padding:24px;margin:16px 0}
.tier-box h3{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:8px;color:var(--ink)}
footer{border-top:1px solid var(--border);padding:36px 40px;background:var(--white);margin-top:60px}
.foot-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.foot-logo{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;letter-spacing:-.02em;display:flex;align-items:center;gap:7px}
.foot-logo .logo-mark{width:22px;height:22px;font-size:11px}
.foot-links{display:flex;gap:20px}
.foot-links a{font-size:13px;color:var(--ink-2)}
.foot-links a:hover{color:var(--accent)}
footer p{font-size:13px;color:var(--ink-3);margin:0}
@media(max-width:768px){
  main,nav{padding-left:20px;padding-right:20px}
  h1{font-size:32px}
  h2{font-size:20px}
  .foot-inner{flex-direction:column;gap:8px;text-align:center}
  .foot-links{justify-content:center}
}
</style></head><body>
<nav>
  <div class="nav-inner">
    <a href="/" class="logo"><div class="logo-mark">✦</div>Streamline</a>
  </div>
</nav>
<main>
  <h1>Refund Policy</h1>
  <p class="updated">Last updated: 2026-05-06 · Version 2.0</p>

  <section>
    <p style="background:#fffbeb;border:1px solid #fde68a;padding:14px 18px;border-radius:10px;color:#92400e"><strong>Australian Consumer Law:</strong> Nothing in this policy excludes, restricts, or modifies any consumer guarantee or right under the Australian Consumer Law (Schedule 2 to the Competition and Consumer Act 2010 (Cth)) that cannot lawfully be excluded. Our refund commitments below apply <em>in addition to</em> your rights under the ACL.</p>
  </section>

  <section>
    <h2>Refund guarantees by tier</h2>

    <div class="tier-box">
      <h3>Standard ($29 AUD) — 30-day refund</h3>
      <p>Full refund of the $29 submission fee if we have not started development on your idea within 30 days of payment. Conditions: idea submitted in good faith and not in breach of our Terms of Service.</p>
    </div>

    <div class="tier-box">
      <h3>Priority ($99 AUD) — 14-day refund</h3>
      <p>Full refund of the $99 submission fee if we have not started development within 14 days of payment.</p>
    </div>

    <div class="tier-box">
      <h3>Equity ($299 AUD) — 14-day refund + 48-hour build-start commitment</h3>
      <p>We commit to starting development within 48 hours of payment. If we have not started within 14 days, full refund of the $299 fee is processed.</p>
    </div>
  </section>

  <section>
    <h2>How to request a refund</h2>
    <p>Email <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a> with the subject line "Refund request — submission #ID" (your submission ID is in the email you received after paying, or visible on your /status page). Include the reason for the request.</p>
    <p>We will acknowledge within 2 business days and process eligible refunds to your original payment method within 5–10 business days.</p>
  </section>

  <section>
    <h2>Refund processing</h2>
    <p>Refunds are issued to the original Stripe payment method (card or other). Your bank may take an additional 3–5 business days to reflect the refund.</p>
  </section>

  <section>
    <h2>What does <em>not</em> qualify for refund</h2>
    <ul>
      <li>Once we have started development on your idea (passed the per-tier window above).</li>
      <li>Submissions in breach of our Terms (illegal content, third-party IP infringement, hate speech, etc.).</li>
      <li>Change of mind after the per-tier window has passed and development has begun.</li>
      <li>Dissatisfaction with the marketing performance of a launched app — revenue share is contingent on actual sales, which we do not guarantee.</li>
    </ul>
    <p>For any of the above, the per-tier window has lapsed and we have begun the work — the submission fee is non-refundable.</p>
  </section>

  <section>
    <h2>Revenue share / commission disputes</h2>
    <p>Quarterly statements are emailed to you. If you believe a payout is incorrect, email <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a> within 30 days of receiving the statement. We will provide source documents (Stripe transaction IDs, gross revenue, deductions) and correct any error within 30 days of confirming.</p>
  </section>

  <section>
    <h2>Australian Consumer Law guarantees</h2>
    <p>Our service comes with consumer guarantees that cannot be excluded under the Australian Consumer Law, including (where applicable):</p>
    <ul>
      <li>The service will be provided with due care and skill.</li>
      <li>The service will be reasonably fit for any disclosed purpose.</li>
      <li>The service will be supplied within a reasonable time.</li>
    </ul>
    <p>If we fail to meet a consumer guarantee, you may be entitled to additional remedies (a re-supply or refund) regardless of the per-tier window above. Contact us first; if unresolved, you may contact the ACCC or your state consumer affairs office.</p>
  </section>

  <section>
    <h2>Questions?</h2>
    <p>Email <a href="mailto:hello@streamlinewebapps.com">hello@streamlinewebapps.com</a>.</p>
  </section>
</main>
<footer>
  <div class="foot-inner">
    <div class="foot-logo"><div class="logo-mark">✦</div>Streamline</div>
    <div class="foot-links">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/refunds">Refunds</a>
    </div>
    <p>© 2026 Luck Dragon Pty Ltd (ABN 64 697 434 898)</p>
  </div>
</footer>
</body></html>`;

const ADMIN_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Streamline Admin</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,sans-serif;background:#0f0e1a;color:#e8e6fa;min-height:100vh;padding:32px}
h1{font-size:24px;font-weight:800;margin-bottom:24px;color:#fff}
h2{font-size:16px;font-weight:700;margin-bottom:16px;color:#a78bfa}
.login{max-width:360px;margin:80px auto;background:#1a1830;border:1px solid #2d2a50;border-radius:16px;padding:40px}
.login h1{text-align:center;margin-bottom:8px}
.login p{text-align:center;color:#9490c0;font-size:14px;margin-bottom:28px}
input{width:100%;padding:11px 14px;background:#0f0e1a;border:1px solid #2d2a50;border-radius:9px;color:#fff;font-size:15px;margin-bottom:14px;outline:none}
input:focus{border-color:#6d28d9}
button{width:100%;padding:12px;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border-radius:9px;font-size:15px;font-weight:600;cursor:pointer;border:none}
.dash{display:none}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
.stat-box{background:#1a1830;border:1px solid #2d2a50;border-radius:12px;padding:20px}
.stat-box .val{font-size:28px;font-weight:800;color:#a78bfa;font-family:Syne,sans-serif}
.stat-box .lbl{font-size:12px;color:#9490c0;margin-top:4px}
table{width:100%;border-collapse:collapse;background:#1a1830;border-radius:12px;overflow:hidden;margin-bottom:32px}
th{padding:12px 16px;text-align:left;font-size:12px;font-weight:700;color:#9490c0;letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid #2d2a50;background:#12112b}
td{padding:12px 16px;font-size:13px;border-bottom:1px solid #1e1c3a;vertical-align:top}
tr:last-child td{border-bottom:none}
.badge{padding:2px 8px;border-radius:5px;font-size:11px;font-weight:600}
.b-paid{background:rgba(5,150,105,.15);color:#34d399}
.b-pending{background:rgba(217,119,6,.15);color:#fbbf24}
.b-await{background:rgba(109,40,217,.15);color:#a78bfa}
.err{color:#f87171;font-size:14px;padding:16px 0}
</style></head><body>
<div id="login-view" class="login">
  <h1>Streamline</h1>
  <p>Admin access — enter your PIN</p>
  <input id="pin-input" type="password" placeholder="Enter PIN" onkeydown="if(event.key==='Enter')doLogin()"/>
  <button onclick="doLogin()">Sign in</button>
  <p id="login-err" style="color:#f87171;font-size:13px;margin-top:12px;text-align:center"></p>
</div>
<div id="dash-view" class="dash">
  <h1>Streamline Admin</h1>
  <div class="stats" id="admin-stats"></div>
  <h2>Recent Submissions</h2>
  <div id="subs-table"></div>
  <h2>Ideas</h2>
  <div id="ideas-table"></div>
</div>
<script>
var PIN="";
function doLogin(){
  PIN=document.getElementById("pin-input").value;
  fetch("/admin/data?pin="+PIN)
  .then(function(r){if(!r.ok)throw new Error("bad");return r.json();})
  .then(function(d){
    document.getElementById("login-view").style.display="none";
    document.getElementById("dash-view").style.display="block";
    renderDash(d);
  })
  .catch(function(){document.getElementById("login-err").textContent="Invalid PIN";});
}
function renderDash(d){
  var subs=d.subs||[],ideas=d.ideas||[];
  var paid=subs.filter(function(x){return x.status==="paid";}).length;
  document.getElementById("admin-stats").innerHTML=
    "<div class='stat-box'><div class='val'>"+subs.length+"</div><div class='lbl'>Total submissions</div></div>"+
    "<div class='stat-box'><div class='val'>"+paid+"</div><div class='lbl'>Paid submissions</div></div>"+
    "<div class='stat-box'><div class='val'>"+ideas.length+"</div><div class='lbl'>Ideas in DB</div></div>"+
    "<div class='stat-box'><div class='val'>"+ideas.filter(function(x){return x.status==="live";}).length+"</div><div class='lbl'>Live apps</div></div>";
  function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});}
  var sh="<table><tr><th>ID</th><th>Title</th><th>Name</th><th>Email</th><th>Tier</th><th>Status</th><th>Date</th></tr>";
  subs.slice(0,50).forEach(function(s){
    var bc=s.status==="paid"?"b-paid":s.status==="awaiting_payment"?"b-await":"b-pending";
    sh+="<tr><td>"+esc(s.id)+"</td><td>"+esc(s.title)+"</td><td>"+esc(s.name)+"</td><td>"+esc(s.email)+"</td><td>"+esc(s.tier)+"</td><td><span class='badge "+bc+"'>"+esc(s.status)+"</span></td><td>"+esc((s.created_at||"").slice(0,10))+"</td></tr>";
  });
  sh+="</table>";
  document.getElementById("subs-table").innerHTML=sh;
  var ih="<table><tr><th>ID</th><th>Title</th><th>Category</th><th>Votes</th><th>Status</th><th>Revenue/mo</th></tr>";
  ideas.slice(0,50).forEach(function(x){
    var bc=x.status==="live"?"b-paid":x.status==="building"?"b-pending":"b-await";
    ih+="<tr><td>"+esc(x.id)+"</td><td>"+esc(x.title)+"</td><td>"+esc(x.category||"—")+"</td><td>"+esc(x.votes)+"</td><td><span class='badge "+bc+"'>"+esc(x.status)+"</span></td><td>"+(x.revenue?("$"+esc(x.revenue)):"—")+"</td></tr>";
  });
  ih+="</table>";
  document.getElementById("ideas-table").innerHTML=ih;
}
window.addEventListener("load",function(){var fr=document.getElementById("f-rendered"); if(fr) fr.value=Date.now();});
</script>
</body></html>`;


const HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Streamline — Submit an idea. We build it. You earn forever.</title>
<meta name="description" content="Turn your app idea into recurring revenue. We build with AI, you earn 25% of every sale — forever."/>
<link rel="canonical" href="https://streamlinewebapps.com/"/>
<link rel="icon" type="image/svg+xml" href="/favicon.ico"/>
<meta property="og:title" content="Streamline — Submit an idea. We build it. You earn forever."/>
<meta property="og:description" content="Turn your app idea into recurring revenue. We build with AI, you earn 25% of every sale — forever."/>
<meta property="og:url" content="https://streamlinewebapps.com/"/>
<meta property="og:type" content="website"/>
<meta property="og:image" content="https://streamlinewebapps.com/og.svg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Streamline — Submit an idea. We build it. You earn forever."/>
<meta name="twitter:description" content="Turn your app idea into recurring revenue. We build with AI, you earn 25% of every sale — forever."/>
<meta name="twitter:image" content="https://streamlinewebapps.com/og.svg"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#f8f7ff;--white:#ffffff;--surface:#f0eeff;--surface-2:#e6e2fa;
  --border:#ddd8f5;--border-2:#ccc6ec;
  --ink:#1e1b4b;--ink-2:#4c4885;--ink-3:#9490c0;
  --accent:#6d28d9;--accent-light:#ede9fe;--accent-mid:#7c3aed;
  --gold:#d97706;--gold-bg:#fffbeb;--gold-border:#fde68a;
  --green:#059669;--green-bg:#ecfdf5;--green-border:#a7f3d0;
  --amber:#d97706;--amber-bg:#fffbeb;
  --r:10px;--r-lg:16px;--r-xl:24px;
}
html{background:var(--bg);color:var(--ink);font-family:"Inter",sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}button{cursor:pointer;font-family:inherit;background:none;border:none;color:inherit}
input,textarea,select{font-family:inherit}

/* ── TOPBAR ── */
.topbar{background:var(--ink);color:#fff;padding:9px 24px;display:flex;align-items:center;justify-content:center;gap:20px;font-size:12.5px;font-weight:400;overflow-x:auto;white-space:nowrap}
.topbar .dot{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;margin-right:5px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.topbar .sep{opacity:.25}
.topbar b{font-weight:600}

/* ── NAV ── */
nav{background:rgba(248,247,255,.93);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 40px;position:sticky;top:0;z-index:90}
.nav-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:60px}
.logo{font-family:"Syne",sans-serif;font-weight:800;font-size:19px;letter-spacing:-.03em;display:flex;align-items:center;gap:9px;color:var(--ink)}
.logo-mark{width:30px;height:30px;background:linear-gradient(135deg,#6d28d9,#7c3aed);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:800;box-shadow:0 2px 8px rgba(109,40,217,.35)}
.nav-links{display:flex;align-items:center;gap:2px}
.nav-links a{padding:6px 13px;font-size:14px;font-weight:500;color:var(--ink-2);border-radius:7px;transition:.15s}
.nav-links a:hover{color:var(--ink);background:var(--surface)}
.nav-cta{padding:9px 20px;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border-radius:9px;font-size:14px;font-weight:600;transition:.15s;box-shadow:0 2px 8px rgba(109,40,217,.3)}
.nav-cta:hover{box-shadow:0 4px 16px rgba(109,40,217,.4);transform:translateY(-1px)}

/* ── LAYOUT ── */
main{max-width:1080px;margin:0 auto;padding:0 40px}
.section{padding:80px 0}
.section-header{text-align:center;margin-bottom:56px}
.section-label{display:inline-block;padding:4px 14px;background:var(--accent-light);border-radius:999px;font-size:11.5px;font-weight:700;color:var(--accent);letter-spacing:.07em;text-transform:uppercase;margin-bottom:14px}
h1{font-family:"Syne",sans-serif;font-size:clamp(40px,6vw,72px);font-weight:800;letter-spacing:-.04em;line-height:1.0;margin-bottom:22px;color:var(--ink)}
h2{font-family:"Syne",sans-serif;font-size:clamp(26px,3.8vw,44px);font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:12px;color:var(--ink)}
.grad{background:linear-gradient(135deg,#6d28d9 0%,#a855f7 55%,#d97706 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

/* ── HERO ── */
.hero{padding:96px 0 80px;text-align:center;background:radial-gradient(ellipse 80% 50% at 50% -5%,rgba(109,40,217,.1) 0%,transparent 65%)}
.hero-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;background:var(--white);border:1px solid var(--border);border-radius:999px;font-size:13px;font-weight:500;color:var(--ink-2);margin-bottom:28px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.hero-pill-dot{width:22px;height:22px;background:linear-gradient(135deg,#6d28d9,#7c3aed);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800}
.hero-sub{font-size:18px;color:var(--ink-2);font-weight:300;max-width:520px;margin:0 auto 36px;line-height:1.7}
.hero-btns{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:56px}
.btn-primary{padding:14px 28px;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border-radius:10px;font-size:15px;font-weight:600;transition:.2s;box-shadow:0 4px 16px rgba(109,40,217,.35);display:inline-block}
.btn-primary:hover{box-shadow:0 6px 24px rgba(109,40,217,.45);transform:translateY(-2px)}
.btn-ghost{padding:14px 24px;background:var(--white);border:1px solid var(--border-2);color:var(--ink);border-radius:10px;font-size:15px;font-weight:500;transition:.15s}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-light)}
.hero-stats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--border);border-radius:var(--r-xl);overflow:hidden;background:var(--white);max-width:620px;margin:0 auto 16px;box-shadow:0 2px 16px rgba(109,40,217,.08)}
.stat{padding:20px 16px;text-align:center;border-right:1px solid var(--border)}
.stat:last-child{border-right:none}
.stat-val{font-family:"Syne",sans-serif;font-size:24px;font-weight:800;color:var(--ink);letter-spacing:-.02em;margin-bottom:3px}
.stat-lbl{font-size:11px;font-weight:500;color:var(--ink-3);letter-spacing:.04em;text-transform:uppercase}
.earnings-disclaimer{font-size:11px;color:var(--ink-3);max-width:500px;margin:0 auto;line-height:1.5;text-align:center}

/* ── HOW IT WORKS ── */
.steps-wrap{position:relative}
.steps-grid{display:grid;grid-template-columns:1fr 48px 1fr 48px 1fr;align-items:start;margin-top:48px}
.step-arrow{display:flex;align-items:center;justify-content:center;padding-top:48px;color:var(--border-2);font-size:20px}
.step{background:var(--white);border:1px solid var(--border);border-radius:var(--r-xl);padding:36px 28px;transition:.2s;text-align:left}
.step:hover{border-color:var(--border-2);box-shadow:0 8px 28px rgba(109,40,217,.08);transform:translateY(-3px)}
.step-num{font-family:"Syne",sans-serif;font-size:42px;font-weight:800;background:linear-gradient(135deg,#6d28d9,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:12px}
.step-icon{font-size:30px;margin-bottom:14px}
.step h3{font-family:"Syne",sans-serif;font-size:19px;font-weight:700;margin-bottom:8px;color:var(--ink)}
.step p{font-size:14px;color:var(--ink-2);font-weight:300;line-height:1.65}
.step .step-tag{display:inline-block;margin-top:16px;padding:3px 10px;background:var(--accent-light);border-radius:6px;font-size:11.5px;font-weight:600;color:var(--accent)}
.step:nth-child(5) .step-num{background:linear-gradient(135deg,#d97706,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.step:nth-child(5) .step-tag{background:var(--gold-bg);color:var(--gold)}

/* ── FEATURES ── */
.feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.feat-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r-xl);padding:40px;transition:.2s}
.feat-card:hover{box-shadow:0 8px 28px rgba(109,40,217,.08);transform:translateY(-2px)}
.feat-card.main{background:linear-gradient(160deg,#1e1b4b 0%,#2d1b69 100%);color:#fff;border-color:transparent}
.feat-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:.05em;margin-bottom:16px}
.feat-tag.live{background:var(--green-bg);color:var(--green)}
.feat-card.main .feat-tag.live{background:rgba(167,243,208,.15);color:#4ade80}
.feat-card h3{font-family:"Syne",sans-serif;font-size:28px;font-weight:800;letter-spacing:-.03em;margin-bottom:10px;line-height:1.1}
.feat-card p{font-size:14px;font-weight:300;line-height:1.65;margin-bottom:24px;color:var(--ink-2)}
.feat-card.main p{color:rgba(255,255,255,.6)}
.feat-chips{display:flex;gap:7px;flex-wrap:wrap}
.feat-chip{padding:5px 12px;background:var(--surface);border:1px solid var(--border);border-radius:7px;font-size:12px;font-weight:500;color:var(--ink-2)}
.feat-card.main .feat-chip{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15);color:rgba(255,255,255,.7)}

/* ── TESTIMONIALS ── */
.testi-section{background:linear-gradient(160deg,var(--accent-light) 0%,var(--bg) 60%);border-radius:var(--r-xl);padding:64px 48px;margin:0}
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}
.testi{background:var(--white);border:1px solid var(--border);border-radius:var(--r-lg);padding:28px;transition:.2s}
.testi:hover{box-shadow:0 6px 20px rgba(109,40,217,.08);transform:translateY(-2px)}
.testi-stars{color:var(--gold);font-size:15px;margin-bottom:14px;letter-spacing:2px}
.testi-quote{font-size:15px;line-height:1.7;color:var(--ink);font-weight:300;margin-bottom:22px;font-style:italic}
.testi-author{display:flex;align-items:center;gap:12px}
.testi-av{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--accent-light),var(--surface-2));display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--accent);font-family:"Syne",sans-serif;font-size:16px;border:2px solid var(--border)}
.testi-name{font-size:14px;font-weight:600;color:var(--ink)}
.testi-loc{font-size:12px;color:var(--ink-3);margin-top:1px}

/* ── IDEAS BOARD ── */
.filters{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:24px}
.chip{padding:6px 16px;background:var(--white);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:500;color:var(--ink-2);cursor:pointer;transition:.15s}
.chip:hover{border-color:var(--border-2);color:var(--ink)}
.chip.active{background:var(--ink);border-color:var(--ink);color:#fff}
.ideas-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(295px,1fr));gap:12px}
.idea{background:var(--white);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px;display:flex;flex-direction:column;transition:.15s}
.idea:hover{border-color:var(--border-2);box-shadow:0 2px 12px rgba(109,40,217,.07)}
.idea-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.idea-icon{width:40px;height:40px;background:var(--surface);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;border:1px solid var(--border)}
.vote-btn{display:flex;flex-direction:column;align-items:center;gap:1px;padding:7px 11px;background:var(--surface);border:1px solid var(--border);border-radius:8px;min-width:46px;cursor:pointer;transition:.15s}
.vote-btn:hover{border-color:var(--accent);background:var(--accent-light)}
.vote-btn.voted{background:var(--accent-light);border-color:var(--accent)}
.vote-arr{font-size:10px;color:var(--ink-3)}
.vote-cnt{font-size:14px;font-weight:700;font-family:"Syne",sans-serif;color:var(--ink)}
.vote-btn.voted .vote-arr,.vote-btn.voted .vote-cnt{color:var(--accent)}
.idea h4{font-family:"Syne",sans-serif;font-size:15px;font-weight:700;margin-bottom:5px;letter-spacing:-.01em}
.idea-desc{font-size:13px;color:var(--ink-2);font-weight:300;line-height:1.55;flex:1;margin-bottom:14px}
.idea-foot{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.share-btn{padding:4px 10px;background:var(--surface);border:1px solid var(--border);border-radius:7px;font-size:12px;cursor:pointer;transition:.15s;color:var(--ink-2);position:relative}
.share-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-light)}
.share-tooltip{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:4px 8px;border-radius:5px;font-size:11px;white-space:nowrap;pointer-events:none;opacity:0;transition:.2s;margin-bottom:6px}
.share-tooltip.show{opacity:1}
.badge{padding:3px 9px;border-radius:6px;font-size:11px;font-weight:600;border:1px solid transparent}
.b-live{background:var(--green-bg);border-color:var(--green-border);color:var(--green)}
.b-building{background:var(--amber-bg);border-color:var(--gold-border);color:var(--amber)}
.b-queued{background:var(--surface);border-color:var(--border);color:var(--ink-3)}
.b-rev{background:var(--gold-bg);border-color:var(--gold-border);color:var(--gold)}
/* Skeleton */
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.sk-line{background:linear-gradient(90deg,var(--surface) 25%,var(--surface-2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px}
.sk-title{height:18px;width:65%;margin-bottom:10px}
.sk-body{height:13px;width:88%;margin-bottom:6px}
.sk-foot{height:13px;width:45%}

/* ── TIERS ── */
.tiers-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:start}
.tier{background:var(--white);border:1px solid var(--border);border-radius:var(--r-xl);padding:32px;display:flex;flex-direction:column;cursor:pointer;transition:.2s;position:relative;overflow:hidden}
.tier:hover{box-shadow:0 8px 32px rgba(109,40,217,.1);border-color:var(--border-2);transform:translateY(-3px)}
.tier.featured{background:linear-gradient(160deg,#1e1b4b,#2d1b69);border-color:transparent;color:#fff}
.tier.equity{border-color:var(--gold-border);box-shadow:0 0 0 1px var(--gold-border)}
.tier.equity:hover{box-shadow:0 8px 32px rgba(217,119,6,.15),0 0 0 1px var(--gold-border)}
.tier-popular{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.06em;padding:4px 14px;border-radius:0 0 9px 9px}
.tier-name{font-size:11px;font-weight:700;color:var(--ink-3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px}
.tier.featured .tier-name{color:rgba(255,255,255,.45)}
.tier.equity .tier-name{color:var(--gold)}
.tier-price{font-family:"Syne",sans-serif;font-size:54px;font-weight:800;letter-spacing:-.04em;line-height:1;margin-bottom:4px}
.tier-price sup{font-size:.36em;font-weight:600;vertical-align:super;opacity:.55}
.tier-comm{font-size:13px;font-weight:600;color:var(--accent);margin:8px 0 24px;display:flex;align-items:center;gap:5px}
.tier.featured .tier-comm{color:#a78bfa}
.tier.equity .tier-comm{color:var(--gold)}
.tier-feat{font-size:13.5px;color:var(--ink-2);padding:9px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:9px;font-weight:400}
.tier.featured .tier-feat{color:rgba(255,255,255,.6);border-color:rgba(255,255,255,.1)}
.tier.equity .tier-feat{border-color:rgba(217,119,6,.15)}
.tier-feat:last-of-type{border-bottom:none}
.tier-feat::before{content:"✓";color:var(--accent);font-weight:700;flex-shrink:0}
.tier.featured .tier-feat::before{color:#a78bfa}
.tier.equity .tier-feat::before{color:var(--gold)}
.tier-btn{margin-top:24px;padding:12px;border-radius:10px;font-size:14px;font-weight:600;text-align:center;transition:.15s;border:1px solid var(--border-2);background:var(--surface);color:var(--ink)}
.tier:hover .tier-btn{background:var(--ink);border-color:var(--ink);color:#fff}
.tier.featured .tier-btn{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff}
.tier.featured:hover .tier-btn{background:#fff;color:var(--ink)}
.tier.equity .tier-btn{background:var(--gold-bg);border-color:var(--gold-border);color:var(--gold)}
.tier.equity:hover .tier-btn{background:var(--gold);border-color:var(--gold);color:#fff}

/* ── SUBMIT FORM ── */
.form-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r-xl);padding:48px;box-shadow:0 4px 24px rgba(109,40,217,.07)}
.form-card h2{margin-bottom:6px}
.form-sub{font-size:15px;color:var(--ink-2);margin-bottom:28px;font-weight:300}
.sel-tier-bar{padding:12px 18px;background:var(--accent-light);border:1px solid #c4b5fd;border-radius:10px;font-size:14px;font-weight:500;color:var(--accent);margin-bottom:24px;display:flex;justify-content:space-between;align-items:center}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.form-group{margin-bottom:14px}
label{display:block;font-size:13px;font-weight:600;color:var(--ink-2);margin-bottom:6px;letter-spacing:.01em}
input,textarea,select{width:100%;padding:11px 14px;border:1px solid var(--border-2);border-radius:9px;font-size:14px;font-weight:400;background:var(--white);color:var(--ink);transition:.15s;outline:none}
input:focus,textarea:focus,select:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(109,40,217,.1)}
textarea{resize:vertical;min-height:110px;line-height:1.55}
.age-check{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--ink-2);margin-bottom:18px;line-height:1.5;cursor:pointer}
.age-check input{width:16px;height:16px;cursor:pointer;flex-shrink:0;margin-top:2px;accent-color:var(--accent)}
.age-check a{color:var(--accent);text-decoration:underline}
.submit-btn{width:100%;padding:14px;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border-radius:10px;font-size:15px;font-weight:700;transition:.2s;box-shadow:0 4px 14px rgba(109,40,217,.3)}
.submit-btn:hover{box-shadow:0 6px 22px rgba(109,40,217,.45);transform:translateY(-1px)}
.submit-btn:disabled{opacity:.6;transform:none;cursor:not-allowed}

/* ── FAQ ── */
.faq-wrap{max-width:720px;margin:0 auto}
.faq-item{border-bottom:1px solid var(--border)}
.faq-item:first-child{border-top:1px solid var(--border)}
.faq-q{width:100%;text-align:left;padding:20px 0;font-size:16px;font-weight:500;display:flex;justify-content:space-between;align-items:center;gap:16px;cursor:pointer;color:var(--ink);transition:.15s}
.faq-q:hover{color:var(--accent)}
.faq-icon{font-size:22px;color:var(--ink-3);transition:.25s;flex-shrink:0;line-height:1}
.faq-item.open .faq-icon{transform:rotate(45deg);color:var(--accent)}
.faq-a{max-height:0;overflow:hidden;transition:max-height .35s ease}
.faq-item.open .faq-a{max-height:220px}
.faq-a p{padding-bottom:20px;font-size:14px;color:var(--ink-2);line-height:1.75;font-weight:300}

/* ── FOOTER ── */
footer{background:var(--ink);color:rgba(255,255,255,.55);padding:56px 40px 36px;margin-top:80px}
.foot-inner{max-width:1080px;margin:0 auto}
.foot-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
.foot-brand .logo{color:#fff;margin-bottom:14px}
.foot-brand p{font-size:13.5px;line-height:1.7;max-width:240px}
.foot-col h4{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:16px}
.foot-col a{display:block;font-size:14px;color:rgba(255,255,255,.5);padding:4px 0;transition:.15s}
.foot-col a:hover{color:rgba(255,255,255,.9)}
.foot-bottom{border-top:1px solid rgba(255,255,255,.1);padding-top:28px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.foot-copy{font-size:12.5px}
.foot-legal{display:flex;gap:20px;font-size:12.5px}
.foot-legal a{color:rgba(255,255,255,.4);transition:.15s}
.foot-legal a:hover{color:rgba(255,255,255,.8)}
.foot-disclaimer{font-size:11px;color:rgba(255,255,255,.3);margin-top:16px;line-height:1.6;border-top:1px solid rgba(255,255,255,.06);padding-top:16px}

/* ── CHAT ── */
.chat-bubble{position:fixed;bottom:24px;right:24px;width:52px;height:52px;background:linear-gradient(135deg,#6d28d9,#7c3aed);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(109,40,217,.4);z-index:80;transition:.2s;color:#fff;font-size:20px}
.chat-bubble:hover{transform:scale(1.07);box-shadow:0 6px 22px rgba(109,40,217,.5)}
.chat-panel{position:fixed;bottom:88px;right:24px;width:340px;background:var(--white);border:1px solid var(--border);border-radius:var(--r-xl);box-shadow:0 8px 40px rgba(0,0,0,.15);z-index:80;display:none;flex-direction:column;overflow:hidden;max-height:480px}
.chat-panel.open{display:flex}
.chat-head{padding:16px 20px;background:linear-gradient(135deg,#1e1b4b,#2d1b69);color:#fff;display:flex;align-items:center;justify-content:space-between}
.chat-head h4{font-size:15px;font-weight:600}
.chat-close{background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;font-size:18px;line-height:1;padding:2px}
.chat-close:hover{color:#fff}
.chat-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.msg{padding:10px 14px;border-radius:12px;font-size:13.5px;line-height:1.55;max-width:85%}
.msg.bot{background:var(--surface);color:var(--ink);align-self:flex-start}
.msg.user{background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;align-self:flex-end}
.chat-foot{padding:12px;border-top:1px solid var(--border);display:flex;gap:8px}
.chat-foot input{flex:1;padding:9px 14px;border:1px solid var(--border-2);border-radius:8px;font-size:13.5px;outline:none}
.chat-foot input:focus{border-color:var(--accent)}
.chat-send{padding:9px 16px;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border-radius:8px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:.15s}
.chat-send:hover{opacity:.9}

/* ── TOAST ── */
#toast-container{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none}
.toast{background:var(--ink);color:#fff;padding:13px 22px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,.2);transform:translateY(20px);opacity:0;transition:all .3s ease;max-width:360px;text-align:center}
.toast.show{transform:translateY(0);opacity:1}
.toast.t-success{background:#059669}
.toast.t-error{background:#dc2626}
.toast.t-info{background:var(--accent)}

/* ── RESPONSIVE ── */
@media(max-width:860px){
  nav{padding:0 20px}main{padding:0 20px}
  .steps-grid{grid-template-columns:1fr;gap:16px}
  .step-arrow{display:none}
  .feat-grid,.tiers-grid,.testi-grid{grid-template-columns:1fr}
  .foot-top{grid-template-columns:1fr 1fr}
  h1{font-size:38px}
  .form-row{grid-template-columns:1fr}
  .hero{padding:64px 0 56px}
  .hero-stats{grid-template-columns:repeat(2,1fr)}
  .hero-stats .stat:nth-child(2){border-right:none}
  .hero-stats .stat:nth-child(1),.hero-stats .stat:nth-child(2){border-bottom:1px solid var(--border)}
  .testi-section{padding:40px 24px}
  footer{padding:40px 20px 28px}
}
</style>
</head>
<body>

<!-- TOPBAR -->
<div class="topbar">
  <span><span class="dot"></span><b>Marketplace launching</b> &mdash; be one of the first paid customers</span>
  <span class="sep">|</span>
  <span id="tb-live">Founder portfolio loading…</span>
  <span class="sep">|</span>
  <span>🇦🇺 Melbourne, Australia</span>
</div>

<!-- NAV -->
<nav>
  <div class="nav-inner">
    <a href="/" class="logo"><div class="logo-mark">S</div>Streamline</a>
    <div class="nav-links">
      <a href="#how">How it works</a>
      <a href="#ideas">Browse ideas</a>
      <a href="#tiers">Pricing</a>
      <a href="mailto:hello@streamlinewebapps.com">Contact</a>
    </div>
    <a href="#tiers" class="nav-cta">Submit idea →</a>
  </div>
</nav>

<!-- MAIN -->
<main>

<!-- HERO -->
<section class="hero">
  <div class="hero-pill"><div class="hero-pill-dot">✦</div><span id="hero-pill-txt">Join makers turning ideas into income</span></div>
  <h1>Your idea.<br>Built with AI.<br><span class="grad">Earning forever.</span></h1>
  <p class="hero-sub">No coding required. Describe your app, pay once, and collect 25% of every sale your app generates &mdash; for as long as we run it. Marketplace launches with the first customer apps in 2026.</p>
  <div class="hero-btns">
    <a href="#tiers" class="btn-primary">Submit your idea →</a>
    <a href="#how" class="btn-ghost">How it works</a>
  </div>
  <div class="hero-stats">
    <div class="stat"><div class="stat-val" id="hs-live">—</div><div class="stat-lbl">Founder portfolio</div></div>
    <div class="stat"><div class="stat-val" id="hs-customer">0</div><div class="stat-lbl">Customer apps live</div></div>
    <div class="stat"><div class="stat-val" id="hs-paid">$0</div><div class="stat-lbl">Paid to makers</div></div>
    <div class="stat"><div class="stat-val" id="hs-sub">—</div><div class="stat-lbl">Ideas in queue</div></div>
  </div>
  <p class="earnings-disclaimer">Marketplace launching 2026. Stats above show our founder&rsquo;s pre-Streamline portfolio and current submission queue. Customer earnings are not guaranteed and depend entirely on whether your app finds buyers.</p>
</section>

<!-- HOW IT WORKS -->
<section class="section" id="how">
  <div class="section-header">
    <div class="section-label">The process</div>
    <h2>From idea to income<br><span class="grad">in three steps</span></h2>
    <p style="font-size:17px;color:var(--ink-2);font-weight:300;max-width:480px;margin:0 auto">No technical skills needed. Just a good idea and 5 minutes of your time.</p>
  </div>
  <div class="steps-grid">
    <div class="step">
      <div class="step-icon">💡</div>
      <div class="step-num">01</div>
      <h3>Submit your idea</h3>
      <p>Describe what you want built — who it's for, what problem it solves, and why people would pay for it. Takes about 5 minutes.</p>
      <span class="step-tag">5 min to submit</span>
    </div>
    <div class="step-arrow">→</div>
    <div class="step">
      <div class="step-icon">⚡</div>
      <div class="step-num">02</div>
      <h3>We build with AI</h3>
      <p>Personally reviewed within 48 hours, then built with AI by our team. Standard turnaround is 1–4 weeks. Priority submissions jump the queue.</p>
      <span class="step-tag">1–4 week build</span>
    </div>
    <div class="step-arrow">→</div>
    <div class="step">
      <div class="step-icon">💰</div>
      <div class="step-num">03</div>
      <h3>You earn forever</h3>
      <p>Your app goes live on our marketplace. You earn 25% of every sale, every month — no time limits, no earning caps, no expiry.</p>
      <span class="step-tag">25% forever</span>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="section" id="features" style="padding-top:0">
  <div class="feat-grid">
    <div class="feat-card main">
      <span class="feat-tag live">● LIVE</span>
      <h3>AI-powered builds</h3>
      <p>Every app is reviewed by our team and built using the latest AI models and frameworks. Fast, production-grade, and ready to sell from day one.</p>
      <div class="feat-chips">
        <span class="feat-chip">Claude</span><span class="feat-chip">GPT-4o</span><span class="feat-chip">Supabase</span><span class="feat-chip">Stripe</span><span class="feat-chip">Cloudflare</span>
      </div>
    </div>
    <div class="feat-card">
      <span class="feat-tag live">● LIVE</span>
      <h3>Revenue share, forever</h3>
      <p>Once your app is live, 25% of every sale goes straight to you. Quarterly payouts, no minimums, no expiry — ever.</p>
      <div class="feat-chips">
        <span class="feat-chip">25% per sale</span><span class="feat-chip">Quarterly payouts</span><span class="feat-chip">No minimums</span><span class="feat-chip">Forever</span>
      </div>
    </div>
  </div>
</section>

<!-- WHY TRUST US — replaces premature testimonials -->
<div class="testi-section">
  <div style="text-align:center">
    <div class="section-label">Why trust us</div>
    <h2>Built apps people actually use, before Streamline existed</h2>
    <p style="font-size:15px;color:var(--ink-2);font-weight:300;max-width:540px;margin:8px auto 0">No customer testimonials yet &mdash; the marketplace is launching. Below: real apps shipped by our founder before Streamline. The same person and AI stack will build yours.</p>
  </div>
  <div class="testi-grid">
    <div class="testi">
      <div style="font-family:Syne,sans-serif;font-size:30px;font-weight:800;color:var(--accent);margin-bottom:8px">26+</div>
      <p class="testi-quote" style="font-style:normal">Apps shipped by the founder &mdash; education, sport, finance, trivia, family tools. Same stack you&rsquo;ll get: Cloudflare Workers + Supabase + Stripe + Anthropic AI.</p>
    </div>
    <div class="testi">
      <div style="font-family:Syne,sans-serif;font-size:30px;font-weight:800;color:var(--accent);margin-bottom:8px">2026</div>
      <p class="testi-quote" style="font-style:normal">Launched. We&rsquo;re actively building the customer marketplace. First five Standard-tier customers receive priority queue and a personal post-launch review.</p>
    </div>
    <div class="testi">
      <div style="font-family:Syne,sans-serif;font-size:30px;font-weight:800;color:var(--accent);margin-bottom:8px">25%</div>
      <p class="testi-quote" style="font-style:normal">Of every sale your app generates &mdash; signed deed, no expiry while we run the app, no caps. Quarterly payouts via Australian bank transfer. <a href="/refunds" style="color:var(--accent);font-weight:600">See our refund policy.</a></p>
    </div>
  </div>
</div>

<!-- IDEAS BOARD -->
<section class="section" id="ideas">
  <div class="section-header">
    <div class="section-label">Founder portfolio + idea queue</div>
    <h2>What we&rsquo;ve built &mdash; and what&rsquo;s next</h2>
    <p style="font-size:16px;color:var(--ink-2);font-weight:300;max-width:560px;margin:0 auto">Below is a mix of the founder&rsquo;s pre-Streamline portfolio (proof we ship) plus customer-submitted ideas waiting to be built. Customer marketplace apps launch with the first paying customer.</p>
  </div>
  <div class="filters">
    <button class="chip active" data-cat="all">All</button>
    <button class="chip" data-cat="Utility">Utility</button>
    <button class="chip" data-cat="Finance">Finance</button>
    <button class="chip" data-cat="Health">Health</button>
    <button class="chip" data-cat="Education">Education</button>
    <button class="chip" data-cat="Business">Business</button>
    <button class="chip" data-cat="Productivity">Productivity</button>
  </div>
  <div class="ideas-grid" id="ideas">
    <div class="idea skeleton"><div class="sk-line sk-title"></div><div class="sk-line sk-body"></div><div class="sk-line sk-foot"></div></div>
    <div class="idea skeleton"><div class="sk-line sk-title"></div><div class="sk-line sk-body"></div><div class="sk-line sk-foot"></div></div>
    <div class="idea skeleton"><div class="sk-line sk-title"></div><div class="sk-line sk-body"></div><div class="sk-line sk-foot"></div></div>
  </div>
</section>

<!-- PRICING -->
<section class="section" id="tiers">
  <div class="section-header">
    <div class="section-label">Pricing</div>
    <h2>Pick your tier</h2>
    <p style="font-size:17px;color:var(--ink-2);font-weight:300;max-width:440px;margin:0 auto">One payment to get your app built. Earn 25% of every sale forever.</p>
  </div>
  <div class="tiers-grid">
    <div class="tier" data-tier="Standard">
      <div class="tier-name">Standard</div>
      <div class="tier-price"><sup>$</sup>29</div>
      <div class="tier-comm">+ 25% revenue share forever</div>
      <div class="tier-feat">Fully functional web app</div>
      <div class="tier-feat">1–4 week delivery</div>
      <div class="tier-feat">Listed on marketplace (when launched)</div>
      <div class="tier-feat">Quarterly payouts</div>
      <div class="tier-btn">Select Standard</div>
    </div>
    <div class="tier featured" data-tier="Priority">
      <div class="tier-popular">MOST POPULAR</div>
      <div class="tier-name">Priority</div>
      <div class="tier-price"><sup>$</sup>99</div>
      <div class="tier-comm">+ 25% revenue share forever</div>
      <div class="tier-feat">Everything in Standard</div>
      <div class="tier-feat">Jump the build queue</div>
      <div class="tier-feat">Weekly progress updates</div>
      <div class="tier-feat">Direct Slack access</div>
      <div class="tier-btn">Select Priority</div>
    </div>
    <div class="tier equity" data-tier="Equity">
      <div class="tier-name">Equity</div>
      <div class="tier-price"><sup>$</sup>299</div>
      <div class="tier-comm" style="color:var(--gold)">+ 25% revenue share + co-ownership</div>
      <div class="tier-feat">Everything in Priority</div>
      <div class="tier-feat">Equity-tier signed deed (25% perpetual)</div>
      <div class="tier-feat">Dedicated build team</div>
      <div class="tier-feat">Custom domain + branding</div>
      <div class="tier-btn">Select Equity</div>
    </div>
  </div>
</section>

<!-- SUBMIT FORM -->
<section class="section" id="submit" style="padding-top:0">
  <div class="form-card">
    <div class="section-label">Submit your idea</div>
    <h2>Tell us what to build</h2>
    <p class="form-sub">Fill in the details below. We save your idea and take you straight to payment.</p>
    <div class="sel-tier-bar" id="sel-tier"><span>Select a pricing tier above to get started</span><a href="#tiers" style="font-size:13px;color:var(--accent);font-weight:600">Choose tier →</a></div>
    <div class="form-row">
      <div class="form-group"><label>App title *</label><input id="f-title" placeholder="e.g. Café Roster Manager" maxlength="120"/></div><input type="text" name="website" id="f-website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;height:0;width:0;opacity:0" aria-hidden="true"/><input type="hidden" id="f-rendered" value=""/>
      <div class="form-group"><label>Category *</label>
        <select id="f-cat">
          <option value="Utility">Utility</option><option value="Finance">Finance</option><option value="Health">Health</option>
          <option value="Education">Education</option><option value="Business">Business</option><option value="Productivity">Productivity</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Your name *</label><input id="f-name" placeholder="Jane Smith"/></div>
      <div class="form-group"><label>Email address *</label><input id="f-email" type="email" placeholder="jane@example.com"/></div>
    </div>
    <div class="form-group"><label>Phone (optional)</label><input id="f-phone" placeholder="+61 400 000 000"/></div>
    <div class="form-group"><label>Describe your idea *</label><textarea id="f-desc" placeholder="Who is this app for? What problem does it solve? Why would someone pay for it? Include any must-have features." style="min-height:130px"></textarea></div>
    <label class="age-check"><input type="checkbox" id="age-confirm"/> I am 18 or older and agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/refunds" target="_blank">Refund Policy</a></label>
    <button class="submit-btn" onclick="submitIdea()">Continue to payment →</button>
  </div>
</section>

<!-- FAQ -->
<section class="section" id="faq">
  <div class="section-header">
    <div class="section-label">FAQ</div>
    <h2>Common questions</h2>
  </div>
  <div class="faq-wrap">
    <div class="faq-item">
      <button class="faq-q" onclick="faqToggle(this)">How long does the build take?<span class="faq-icon">+</span></button>
      <div class="faq-a"><p>Standard submissions typically take 1–4 weeks depending on complexity. Priority submissions jump the queue and usually ship in under 2 weeks. You will receive progress updates throughout.</p></div>
    </div>
    <div class="faq-item">
      <button class="faq-q" onclick="faqToggle(this)">What kinds of apps can I submit?<span class="faq-icon">+</span></button>
      <div class="faq-a"><p>Web apps with a clear use case — tools, dashboards, calculators, booking systems, workflow automation, niche SaaS, anything people would pay for. The clearer the problem and the audience, the better the outcome.</p></div>
    </div>
    <div class="faq-item">
      <button class="faq-q" onclick="faqToggle(this)">What does "25% forever" actually mean?<span class="faq-icon">+</span></button>
      <div class="faq-a"><p>Once your app is live on our marketplace, you receive 25% of every sale — no time limit, no caps, no expiry. Payouts are made quarterly via bank transfer. You keep earning as long as the app keeps selling.</p></div>
    </div>
    <div class="faq-item">
      <button class="faq-q" onclick="faqToggle(this)">Can I submit more than one idea?<span class="faq-icon">+</span></button>
      <div class="faq-a"><p>Absolutely. Each idea is a separate submission with its own build timeline and earning stream. Many of our most successful makers have submitted multiple ideas.</p></div>
    </div>
    <div class="faq-item">
      <button class="faq-q" onclick="faqToggle(this)">What if my idea already exists?<span class="faq-icon">+</span></button>
      <div class="faq-a"><p>We check before starting any build. If your idea conflicts with an existing submission or product, we will let you know before any work begins and offer a refund or the chance to refine your angle.</p></div>
    </div>
    <div class="faq-item">
      <button class="faq-q" onclick="faqToggle(this)">What if I am unhappy with the result?<span class="faq-icon">+</span></button>
      <div class="faq-a"><p>We offer revisions as part of the build process. If we genuinely cannot deliver what was agreed, you are covered under our Refund Policy — including force majeure situations. See <a href="/refunds" style="color:var(--accent)">Refund Policy</a> for full details.</p></div>
    </div>
    <div class="faq-item">
      <button class="faq-q" onclick="faqToggle(this)">Do I need an ABN to receive earnings?<span class="faq-icon">+</span></button>
      <div class="faq-a"><p>For Australian residents receiving regular payments, an ABN is recommended and may be required for payouts above the withholding threshold. We will guide you through this when your app goes live.</p></div>
    </div>
    <div class="faq-item">
      <button class="faq-q" onclick="faqToggle(this)">Who owns the intellectual property?<span class="faq-icon">+</span></button>
      <div class="faq-a"><p>For Standard and Priority tiers, Luck Dragon Pty Ltd retains ownership of the codebase, with you holding a perpetual revenue share. The Equity tier includes co-ownership via a formal IP deed — contact us for details.</p></div>
    </div>
  </div>
</section>

</main>

<!-- FOOTER -->
<footer>
  <div class="foot-inner">
    <div class="foot-top">
      <div class="foot-brand">
        <div class="logo" style="color:#fff;margin-bottom:14px"><div class="logo-mark">S</div>Streamline</div>
        <p>Turn your app idea into recurring revenue. We build with AI, you earn forever.</p>
      </div>
      <div class="foot-col">
        <h4>Product</h4>
        <a href="#how">How it works</a>
        <a href="#ideas">Browse ideas</a>
        <a href="#tiers">Pricing</a>
        <a href="#submit">Submit idea</a>
      </div>
      <div class="foot-col">
        <h4>Legal</h4>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/refunds">Refund Policy</a>
      </div>
      <div class="foot-col">
        <h4>Company</h4>
        <a href="mailto:hello@streamlinewebapps.com">Contact us</a>
        <a href="#faq">FAQ</a>
        <span style="font-size:13px;color:rgba(255,255,255,.3)">Melbourne, Australia</span>
      </div>
    </div>
    <div class="foot-bottom">
      <p class="foot-copy">© 2026 Luck Dragon Pty Ltd (ABN 64 697 434 898) · Melbourne, Australia · <a href="mailto:hello@streamlinewebapps.com" style="color:rgba(255,255,255,.5)">hello@streamlinewebapps.com</a></p>
      <div class="foot-legal">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/refunds">Refunds</a>
      </div>
    </div>
    <div class="foot-disclaimer">Apps are built using AI tools. Earnings are not guaranteed — results vary. See <a href="/terms" style="color:rgba(255,255,255,.45)">Terms</a> for full details. You must be 18+ to submit. This site collects anonymised usage data — see <a href="/privacy" style="color:rgba(255,255,255,.45)">Privacy Policy</a>.</div>
  </div>
</footer>

<!-- CHAT -->
<div class="chat-bubble" onclick="oc()" title="Ask a question">💬</div>
<div class="chat-panel" id="chat-panel">
  <div class="chat-head"><h4>Ask Streamline</h4><button class="chat-close" onclick="cc()">✕</button></div>
  <div class="chat-body" id="chat-body">
    <div class="msg bot">Hi! Ask me anything about how Streamline works, pricing, or what kinds of apps we build. 👋</div>
  </div>
  <div class="chat-foot">
    <input id="chat-input" placeholder="Ask a question..." maxlength="500"/>
    <button class="chat-send" onclick="sc()">Send</button>
  </div>
</div>

<!-- TOASTS -->
<div id="toast-container"></div>

<script>
var selTier=null,busy=false;
var TIERS={Standard:{label:"Standard — $29",price:"$29"},Priority:{label:"Priority — $99",price:"$99"},Equity:{label:"Equity — $299",price:"$299"}};

function toast(msg,type){
  var c=document.getElementById("toast-container");
  var t=document.createElement("div");
  t.className="toast t-"+(type||"info");
  t.textContent=msg;
  c.appendChild(t);
  setTimeout(function(){t.classList.add("show");},10);
  setTimeout(function(){t.classList.remove("show");setTimeout(function(){t.remove();},350);},3800);
}

function faqToggle(btn){
  var item=btn.parentElement;
  var wasOpen=item.classList.contains("open");
  document.querySelectorAll(".faq-item.open").forEach(function(x){x.classList.remove("open");});
  if(!wasOpen) item.classList.add("open");
}

function fmt(n){if(n>=1000)return Math.round(n/100)/10+"k";return n;}

function animCount(el,target,pre,suf){
  if(!el)return;
  var start=0,dur=1200,step=16;
  var inc=target/Math.ceil(dur/step);
  var iv=setInterval(function(){
    start=Math.min(start+inc,target);
    el.textContent=pre+(start>=1000?fmt(Math.round(start)):Math.round(start))+suf;
    if(start>=target)clearInterval(iv);
  },step);
}

async function loadStats(){
  try{
    var r=await fetch("/stats");
    var d=await r.json();
    if(!d||d.error)return;
    var live=d.live||0,mrr=d.monthly||0,paid=d.paid_out||3677,building=d.building||0;
    var total=d.total_ideas||0;
    var tbEl = document.getElementById("tb-live");
    if (tbEl) tbEl.innerHTML = "<b>"+live+"</b> founder apps shipped";
    animCount(document.getElementById("hs-live"), live, "", "");
    var hsCust = document.getElementById("hs-customer"); if (hsCust) hsCust.textContent = "0";
    var hsPaid = document.getElementById("hs-paid"); if (hsPaid) hsPaid.textContent = "$0";
    animCount(document.getElementById("hs-sub"), total||0, "", "");
    if(live>0) document.getElementById("hero-pill-txt").textContent=live+" apps live and earning";
  }catch(e){}
}

async function loadIdeas(){
  try{
    var r=await fetch("/ideas");
    var d=await r.json();
    if(!d||!d.ideas||!d.ideas.length){document.getElementById("ideas").innerHTML="<p style=\"color:var(--ink-3);font-size:14px\">No ideas yet — be the first to submit!</p>";return;}
    renderIdeas(d.ideas.map(function(x){return{id:x.id,title:x.title,desc:x.description||"",cat:x.category||"Utility",emoji:x.emoji||"💡",votes:x.votes||0,status:x.status||"queued",rev:x.revenue||0};}));
  }catch(e){document.getElementById("ideas").innerHTML="<p style=\"color:var(--ink-3);font-size:14px\">Could not load ideas.</p>";}
}

function renderIdeas(IDEAS){
  var g=document.getElementById("ideas"),s=IDEAS.slice().sort(function(a,b){return b.votes-a.votes;}),h="";
  var voted=JSON.parse(localStorage.getItem("slv")||"[]");
  for(var i=0;i<s.length;i++){
    var x=s[i],bc=x.status==="live"?"b-live":x.status==="building"?"b-building":"b-queued";
    var bt=x.status==="live"?"● Live":x.status==="building"?"◐ Building":"○ Queued";
    var rv=x.rev>0?"<span class=\"badge b-rev\">$"+x.rev.toLocaleString()+"/mo</span>":"";
    var iv=voted.indexOf(x.id)!==-1;
    h+="<div class=\"idea\" data-cat=\""+x.cat+"\">"+
       "<div class=\"idea-top\"><div class=\"idea-icon\">"+x.emoji+"</div>"+
       "<button class=\"vote-btn"+(iv?" voted":"")+"\" id=\"vb-"+x.id+"\" onclick=\"vt("+x.id+")\">"+
       "<span class=\"vote-arr\">▲</span><span class=\"vote-cnt\" id=\"vc-"+x.id+"\">"+x.votes+"</span></button></div>"+
       "<h4>"+x.title+"</h4>"+
       "<p class=\"idea-desc\">"+x.desc.slice(0,100)+(x.desc.length>100?"...":"")+"</p>"+
       "<div class=\"idea-foot\"><span class=\"badge "+bc+"\">"+bt+"</span>"+rv+
       "<button class=\"share-btn\" onclick=\"sh("+x.id+")\">Share<span class=\"share-tooltip\" id=\"st-"+x.id+"\">Copied!</span></button></div></div>";
  }
  g.innerHTML=h;
}

async function vt(id){
  var voted=JSON.parse(localStorage.getItem("slv")||"[]");
  if(voted.indexOf(id)!==-1){toast("Already voted for this idea","info");return;}
  var btn=document.getElementById("vb-"+id),cnt=document.getElementById("vc-"+id);
  if(btn)btn.classList.add("voted");
  if(cnt)cnt.textContent=parseInt(cnt.textContent)+1;
  voted.push(id);localStorage.setItem("slv",JSON.stringify(voted));
  try{await fetch("/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idea_id:id,fingerprint:fp()})});}catch(e){}
  toast("Vote recorded! ✓","success");
}

function sh(id){
  var url=window.location.origin+"/?idea="+id;
  navigator.clipboard.writeText(url).then(function(){
    var tt=document.getElementById("st-"+id);
    if(tt){tt.classList.add("show");setTimeout(function(){tt.classList.remove("show");},1600);}
    toast("Link copied to clipboard","success");
  }).catch(function(){});
}

function fp(){var f=localStorage.getItem("sl_fp");if(!f){f=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem("sl_fp",f);}return f;}

function setTier(n){
  selTier=n;
  var t=TIERS[n];
  document.getElementById("sel-tier").innerHTML="<span>Selected: <strong>"+n+"</strong> — "+t.price+"</span><button onclick=\"document.getElementById(\'sel-tier\').innerHTML=\"<span>Select a pricing tier above to get started</span>\";selTier=null;\" style=\"font-size:12px;color:var(--accent);background:none;border:none;cursor:pointer\">Change</button>";
  document.getElementById("submit").scrollIntoView({behavior:"smooth"});
  toast(n+" tier selected","info");
}

document.addEventListener("click",function(e){
  var t=e.target.closest(".tier");
  if(t&&t.dataset.tier){setTier(t.dataset.tier);}
  var ch=e.target.closest(".chip");
  if(ch){
    var c=ch.getAttribute("data-cat");
    document.querySelectorAll(".chip").forEach(function(x){x.classList.remove("active");});
    ch.classList.add("active");
    document.querySelectorAll(".idea").forEach(function(x){x.style.display=(c==="all"||x.dataset.cat===c)?"flex":"none";});
  }
});

function submitIdea(){
  var title=document.getElementById("f-title").value.trim();
  var name=document.getElementById("f-name").value.trim();
  var email=document.getElementById("f-email").value.trim();
  var desc=document.getElementById("f-desc").value.trim();
  var cat=document.getElementById("f-cat").value;
  var phone=document.getElementById("f-phone").value.trim();
  if(!title||!name||!email||!desc){toast("Please fill in all required fields","error");return;}
  if(!selTier){toast("Please select a pricing tier above","error");document.getElementById("tiers").scrollIntoView({behavior:"smooth"});return;}
  if(!document.getElementById("age-confirm").checked){toast("Please confirm you are 18 or older","error");return;}
  var btn=document.querySelector(".submit-btn");btn.textContent="Saving...";btn.disabled=true;
  fetch("/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:title,name:name,email:email,phone:phone,category:cat,description:desc,tier:selTier,website:(document.getElementById("f-website")||{}).value||"",t:(document.getElementById("f-rendered")||{}).value||0})})
  .then(function(r){return r.json();})
  .then(function(d){
    if(d.checkout){toast("Redirecting to payment...","success");setTimeout(function(){window.location.href=d.checkout;},600);}
    else{toast("Error: "+(d.error||"Unknown error"),"error");btn.textContent="Continue to payment →";btn.disabled=false;}
  })
  .catch(function(){toast("Network error. Please try again.","error");btn.textContent="Continue to payment →";btn.disabled=false;});
}

var chatBusy=false;
function oc(){document.getElementById("chat-panel").classList.add("open");}
function cc(){document.getElementById("chat-panel").classList.remove("open");}
function am(t,w){var b=document.getElementById("chat-body"),d=document.createElement("div");d.className="msg "+w;d.textContent=t;b.appendChild(d);b.scrollTop=b.scrollHeight;}
function sc(){
  if(chatBusy)return;
  var i=document.getElementById("chat-input"),t=i.value.trim();
  if(!t)return;i.value="";am(t,"user");chatBusy=true;
  var thinking=document.createElement("div");thinking.className="msg bot";thinking.textContent="Thinking...";
  document.getElementById("chat-body").appendChild(thinking);
  fetch("/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:t,fingerprint:fp()})})
  .then(function(r){return r.json();})
  .then(function(d){thinking.textContent=d.reply||"Sorry, I could not answer that.";chatBusy=false;document.getElementById("chat-body").scrollTop=9999;})
  .catch(function(){thinking.textContent="Sorry, something went wrong.";chatBusy=false;});
}
document.getElementById("chat-input").addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sc();}});

// Handle success/cancel params
(function(){
  var p=new URLSearchParams(location.search);
  if(p.get("success")){toast("Payment confirmed! We will be in touch within 48 hours. 🎉","success");history.replaceState({},"","/");}
  if(p.get("cancelled")){toast("Payment cancelled — your idea is saved, try again anytime.","info");history.replaceState({},"","/");}
})();

// Analytics
fetch("/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:"pageview",meta:{ref:document.referrer,path:location.pathname}})}).catch(function(){});

loadStats();
loadIdeas();
</script>
</body></html>`;

