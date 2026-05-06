// streamlinewebapps-proxy v32 — security hardening: ADMIN_PIN→env, CORS allowlist, security headers, real /robots /sitemap, 404 handler, real /stats from DB, Resend verified sender, idempotency, admin XSS fix, og tags
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
async function idemKey(email, title) {
  const data = new TextEncoder().encode((email||"").toLowerCase()+"|"+(title||"").toLowerCase());
  const h = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,"0")).join("").slice(0,32);
}
function idemPrune(){const n=Date.now();for(const[k,v]of _idem)if(n>v.until)_idem.delete(k);}

const API_ROUTES = ["/ideas", "/vote", "/chat"]; // /stats now served from DB locally
const STRIPE_PRICES = { Standard: "price_1TNvyJAm8bVflPN0GBi8u30C", Priority: "price_1TNvyJAm8bVflPN0Nerezgrs", Equity: "price_1TNvyKAm8bVflPN0rZqZZdgq" };

async function handleSubmit(request, env) {
  let body;
  try { body = await request.json(); } catch(e) { return new Response(JSON.stringify({error:"Invalid JSON"}), {status:400, headers:{...CORS,"Content-Type":"application/json"}}); }
  const { title, name, email, phone, category, description, tier } = body;
  if (!title || !name || !email || !description || !tier) return new Response(JSON.stringify({error:"Missing required fields"}), {status:400, headers:{...CORS,"Content-Type":"application/json"}});
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

  if (env.RESEND_KEY && checkoutUrl) {
    const firstName = name.split(" ")[0];
    // Notify Paddy of every new submission
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {"Authorization": "Bearer "+env.RESEND_KEY, "Content-Type": "application/json"},
      body: JSON.stringify({
        from: "Streamline <noreply@luckdragon.io>",
        reply_to: "hello@streamlinewebapps.com",
        to: ["pgallivan@outlook.com"],
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
        from: "Streamline <noreply@luckdragon.io>",
        reply_to: "hello@streamlinewebapps.com",
        to: [email],
        subject: "Complete your submission: \""+title+"\"",
        html: "<div style='font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px'>"+
          "<div style='width:40px;height:40px;background:linear-gradient(135deg,#6d28d9,#7c3aed);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:24px'>"+
          "<span style='color:#fff;font-weight:800;font-size:18px'>S</span></div>"+
          "<h1 style='font-size:24px;font-weight:800;color:#1e1b4b;margin:0 0 8px'>You&#39;re one step away, "+htmlEscape(firstName)+"</h1>"+
          "<p style='color:#4c4885;font-size:15px;line-height:1.6;margin:0 0 28px'>Your idea <strong style='color:#1e1b4b'>"+htmlEscape(title)+"</strong> is saved. Complete your payment to start the build.</p>"+
          "<a href='"+checkoutUrl+"' style='display:inline-block;background:#6d28d9;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:28px'>Complete Payment &rarr;</a>"+
          "<p style='color:#9490c0;font-size:13px;margin:0'>Tier: "+htmlEscape(tier)+" &middot; Category: "+htmlEscape(category||"Utility")+"<br>Once confirmed, we&#39;ll be in touch within 48 hours.</p>"+
          "<hr style='border:none;border-top:1px solid #e0ddf5;margin:28px 0'>"+
          "<p style='color:#9490c0;font-size:12px;margin:0'>Streamline &middot; Melbourne, Australia &middot; <a href='https://www.streamlinewebapps.com' style='color:#6d28d9'>streamlinewebapps.com</a></p></div>"
      })
    }).catch(()=>{});
  }

  const respBody = JSON.stringify({checkout: checkoutUrl});
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const cors = corsFor(request);
    if (request.method === "OPTIONS") return new Response(null, {status:204, headers:cors});
    if (path === "/health") return new Response(JSON.stringify({ok:true,version:32,sha:"hardening-2026-05-06"}), {headers:{...cors,...SEC_HEADERS,"Content-Type":"application/json"}});
    if (path === "/robots.txt") return new Response("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /analytics\nSitemap: https://streamlinewebapps.com/sitemap.xml\n", {headers:{"Content-Type":"text/plain;charset=utf-8","Cache-Control":"public,max-age=3600",...SEC_HEADERS}});
    if (path === "/favicon.ico") return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#6d28d9"/><text x="16" y="22" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="800" fill="#fff">S</text></svg>', {headers:{"Content-Type":"image/svg+xml","Cache-Control":"public,max-age=86400",...SEC_HEADERS}});
    if (path === "/sitemap.xml") return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://streamlinewebapps.com/</loc><priority>1.0</priority></url>\n  <url><loc>https://streamlinewebapps.com/privacy</loc><priority>0.4</priority></url>\n  <url><loc>https://streamlinewebapps.com/terms</loc><priority>0.4</priority></url>\n  <url><loc>https://streamlinewebapps.com/refunds</loc><priority>0.4</priority></url>\n</urlset>\n', {headers:{"Content-Type":"application/xml;charset=utf-8","Cache-Control":"public,max-age=3600",...SEC_HEADERS}});
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
    if (path === "/analytics" && request.method === "POST") return handleAnalytics(request);

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
  <p class="updated">Last updated: April 2026</p>

  <section>
    <p>Streamline ("we", "us", "our", or "Company") operates the streamlinewebapps.com website and related services. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.</p>
  </section>

  <section>
    <h2>1. Information We Collect</h2>
    <p>We collect several types of information for various purposes:</p>
    <ul>
      <li><strong>Account Information:</strong> When you submit an idea, we collect your name, email address, phone number (optional), app title, category, and idea description.</li>
      <li><strong>Technical Information:</strong> We collect your IP address (via Cloudflare CF-Connecting-IP header) and generate an anonymous fingerprint for voting purposes.</li>
      <li><strong>Payment Information:</strong> Payment processing is handled entirely by Stripe. We do not store credit card details.</li>
      <li><strong>Usage Data:</strong> We track which ideas you vote for, stored locally in your browser.</li>
    </ul>
  </section>

  <section>
    <h2>2. How We Use Your Information</h2>
    <ul>
      <li>To review and potentially build your submitted idea</li>
      <li>To process payments and manage your account</li>
      <li>To calculate and pay commissions on app revenue</li>
      <li>To prevent fraud and abuse through IP-based rate limiting</li>
      <li>To allow community voting on idea popularity</li>
      <li>To send you updates about your ideas and the platform</li>
    </ul>
  </section>

  <section>
    <h2>3. Australian Privacy Principles (APPs)</h2>
    <p>We comply with Australia's Privacy Act 1988 and the Australian Privacy Principles. You have the right to:</p>
    <ul>
      <li>Request access to personal information we hold about you</li>
      <li>Ask us to correct inaccurate or incomplete information</li>
      <li>Request deletion of your data (subject to legal retention requirements)</li>
      <li>Object to our use of your information</li>
    </ul>
    <p>To exercise these rights, contact us at hello@streamlinewebapps.com.</p>
  </section>

  <section>
    <h2>4. Data Storage</h2>
    <p>Your information is stored securely in Supabase (Australia region) and protected with SSL encryption. We retain submission data indefinitely to calculate ongoing commissions. Voting records are stored for 12 months.</p>
  </section>

  <section>
    <h2>5. Third-Party Services</h2>
    <ul>
      <li><strong>Stripe:</strong> Payment processing. See Stripe's privacy policy at stripe.com/privacy.</li>
      <li><strong>Supabase:</strong> Data storage. See Supabase's privacy policy at supabase.com/privacy.</li>
      <li><strong>Cloudflare:</strong> CDN and infrastructure. See Cloudflare's privacy policy at cloudflare.com/privacypolicy.</li>
    </ul>
  </section>

  <section>
    <h2>6. Security</h2>
    <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.</p>
  </section>

  <section>
    <h2>7. Changes to This Policy</h2>
    <p>We may update this privacy policy periodically. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
  </section>

  <section>
    <h2>8. Contact Us</h2>
    <p>If you have any questions about this privacy policy or our practices, please contact us at hello@streamlinewebapps.com.</p>
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
  <p class="updated">Last updated: April 2026</p>

  <section>
    <p>These Terms of Service ("Terms") govern your use of Streamline, operated by Luck Dragon Pty Ltd ("Company", "we", "us", or "our"). By accessing or using Streamline, you agree to be bound by these Terms.</p>
  </section>

  <section>
    <h2>1. Service Description</h2>
    <p>Streamline is a platform where users submit app ideas in exchange for a one-time fee. Community members vote on ideas. Selected ideas are built by our team, and submitters receive a lifetime commission on revenue generated by the app:</p>
    <ul>
      <li><strong>Standard ($29 AUD):</strong> 20% lifetime commission, 7-day review window, 30-day refund guarantee</li>
      <li><strong>Priority ($99 AUD):</strong> 25% lifetime commission, priority queue placement, 14-day refund guarantee</li>
      <li><strong>Equity ($299 AUD):</strong> 30% lifetime commission, 48-hour build window, 14-day refund guarantee</li>
    </ul>
  </section>

  <section>
    <h2>2. Intellectual Property</h2>
    <p><strong>Standard and Priority Tiers:</strong> Streamline retains full ownership of the built application and all source code. You retain the right to the lifetime commission percentage agreed.</p>
    <p><strong>Equity Tier:</strong> You co-own the application with Streamline and receive co-founder credit in the product. Both parties own the intellectual property equally and may not exploit it separately without consent.</p>
  </section>

  <section>
    <h2>3. Payment and Refunds</h2>
    <p>Payments are processed via Stripe using AUD currency. A refund is guaranteed if we do not build your idea within the timeframe specified by your tier (30 days for Standard, 14 days for Priority/Equity).</p>
    <p>Refunds are processed to your original payment method within 5–10 business days of approval.</p>
  </section>

  <section>
    <h2>4. Commission Payments</h2>
    <p>Once your app launches and generates revenue, we calculate your commission monthly. Payments are sent via bank transfer when your balance reaches $50 AUD in a given month, within 5 business days of month end.</p>
    <p><strong>No guarantee of earnings.</strong> Commission payments are contingent on the app generating revenue. Streamline does not guarantee that any app will generate revenue, reach the $50 AUD payment threshold, or continue operating indefinitely. Revenue figures displayed on our website reflect actual historical results and are not a promise or projection of future earnings. Individual results will vary significantly.</p>
    <p>You are responsible for declaring commission income for tax purposes in your jurisdiction.</p>
  </section>

  <section>
    <h2>5. Submission Requirements</h2>
    <p>By submitting an idea, you certify that:</p>
    <ul>
      <li>You own or have rights to the idea you're submitting</li>
      <li>The idea does not infringe on third-party intellectual property</li>
      <li>The information you provide is accurate and truthful</li>
      <li>You are of legal age (18+) and eligible to enter into this agreement</li>
    </ul>
  </section>

  <section>
    <h2>6. Voting and Community</h2>
    <p>Ideas are ranked by community votes. Each user can vote once per idea. Voting is anonymous but tied to a browser fingerprint to prevent duplicate votes. We may disqualify ideas that violate these terms or contain illegal, offensive, or defamatory content.</p>
  </section>

  <section>
    <h2>7. Prohibited Content</h2>
    <p>Ideas must not contain:</p>
    <ul>
      <li>Illegal activity or content that violates Australian law</li>
      <li>Hate speech, discrimination, or harassment</li>
      <li>Explicit sexual or violent content</li>
      <li>Misinformation or scam-related schemes</li>
      <li>Infringement of third-party rights</li>
    </ul>
    <p>We reserve the right to reject or remove any idea that violates these standards without refund.</p>
  </section>

  <section>
    <h2>8. Governing Law</h2>
    <p>These Terms are governed by the laws of Victoria, Australia, and you agree to the exclusive jurisdiction of courts in Victoria.</p>
  </section>

  <section>
    <h2>9. Limitation of Liability</h2>
    <p>To the extent permitted by law, Luck Dragon and Streamline are not liable for indirect, incidental, or consequential damages, including lost profits or revenue. Our total liability to you for any claim arising from these Terms or your use of Streamline shall not exceed the amount you paid to submit your idea.</p>
    <p>Nothing in these Terms excludes, restricts, or modifies any right or remedy you may have under the Australian Consumer Law, including any consumer guarantee that cannot be excluded by law.</p>
  </section>

  <section>
    <h2>10. Force Majeure</h2>
    <p>Streamline will not be in breach of these Terms if we are unable to perform our obligations due to circumstances beyond our reasonable control, including but not limited to: natural disasters, acts of government, pandemic, significant technical failure, or third-party platform outages (including AI model providers, payment processors, or cloud infrastructure).</p>
    <p>If a force majeure event prevents us from building your idea within the refund window for your tier, we will notify you and offer either: (a) an extended build timeline with your consent, or (b) a full refund of your submission fee.</p>
  </section>

  <section>
    <h2>11. Changes to Terms</h2>
    <p>We may update these Terms at any time. Continued use of Streamline constitutes acceptance of updated Terms.</p>
  </section>

  <section>
    <h2>12. Contact</h2>
    <p>For questions about these Terms, contact us at hello@streamlinewebapps.com.</p>
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
  <p class="updated">Last updated: April 2026</p>

  <section>
    <p>At Streamline, we stand behind our commitment to build your idea if it's selected by the community. This policy outlines when and how refunds are provided.</p>
  </section>

  <section>
    <h2>Refund Guarantees by Tier</h2>

    <div class="tier-box">
      <h3>Standard Tier ($29 AUD)</h3>
      <p><strong>30-day refund guarantee.</strong> If we have not begun development on your idea within 30 days of your submission, you are eligible for a full refund of your $29 AUD submission fee.</p>
      <p><strong>Conditions:</strong> Your idea must have been submitted in good faith and not violate our Terms of Service.</p>
    </div>

    <div class="tier-box">
      <h3>Priority Tier ($99 AUD)</h3>
      <p><strong>14-day refund guarantee.</strong> If we have not begun development on your idea within 14 days of your submission, you are eligible for a full refund of your $99 AUD submission fee.</p>
      <p><strong>Conditions:</strong> Your idea must receive enough community votes to be queued for development. If insufficient votes are received, we will notify you by day 14 and process a refund.</p>
    </div>

    <div class="tier-box">
      <h3>Equity Tier ($299 AUD)</h3>
      <p><strong>14-day refund guarantee.</strong> We commit to beginning development within 48 hours. If development has not begun within 48 hours, we will contact you to reschedule. If development cannot start within 14 days, a full refund of $299 AUD is processed.</p>
      <p><strong>Conditions:</strong> Equity tier submissions are prioritized and built with guaranteed timelines.</p>
    </div>
  </section>

  <section>
    <h2>How to Request a Refund</h2>
    <p>To request a refund, email hello@streamlinewebapps.com with:</p>
    <ul>
      <li>Your submitted idea title</li>
      <li>The email address associated with your submission</li>
      <li>The reason for your refund request</li>
    </ul>
    <p>We will review your request and respond within 2 business days.</p>
  </section>

  <section>
    <h2>Refund Processing</h2>
    <p>Approved refunds are processed to your original payment method within 5–10 business days. If your payment was made via Stripe, the refund will appear as a credit to the card or payment method used.</p>
  </section>

  <section>
    <h2>What Does NOT Qualify for Refund</h2>
    <ul>
      <li>Ideas rejected due to Terms of Service violations (illegal, offensive, or defamatory content)</li>
      <li>Requests submitted more than 30 days after submission (beyond the guarantee window)</li>
      <li>Ideas that have already been built and shipped</li>
      <li>Refunds requested after the refund period has expired</li>
    </ul>
  </section>

  <section>
    <h2>Commission Disputes</h2>
    <p>If you believe commission calculations are incorrect, contact us at hello@streamlinewebapps.com within 30 days of the relevant payment. We will audit the transaction and either explain the calculation or issue a corrected payment.</p>
  </section>

  <section>
    <h2>Questions?</h2>
    <p>If you have questions about this refund policy, reach out to hello@streamlinewebapps.com and we'll be happy to help.</p>
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
<meta property="og:image" content="https://streamlinewebapps.com/og.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Streamline — Submit an idea. We build it. You earn forever."/>
<meta name="twitter:description" content="Turn your app idea into recurring revenue. We build with AI, you earn 25% of every sale — forever."/>
<meta name="twitter:image" content="https://streamlinewebapps.com/og.png"/>
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
  <span id="tb-live"><span class="dot"></span>Loading...</span>
  <span class="sep">|</span>
  <span id="tb-mrr">—</span>
  <span class="sep">|</span>
  <span id="tb-paid">—</span>
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
  <p class="hero-sub">No coding required. Describe your app, pay once, and collect 25% of every sale on our marketplace — with no time limits or caps.</p>
  <div class="hero-btns">
    <a href="#tiers" class="btn-primary">Submit your idea →</a>
    <a href="#how" class="btn-ghost">How it works</a>
  </div>
  <div class="hero-stats">
    <div class="stat"><div class="stat-val" id="hs-live">—</div><div class="stat-lbl">Apps live</div></div>
    <div class="stat"><div class="stat-val" id="hs-mrr">—</div><div class="stat-lbl">Monthly revenue</div></div>
    <div class="stat"><div class="stat-val" id="hs-paid">—</div><div class="stat-lbl">Paid to makers</div></div>
    <div class="stat"><div class="stat-val" id="hs-sub">—</div><div class="stat-lbl">Ideas submitted</div></div>
  </div>
  <p class="earnings-disclaimer">Revenue figures reflect actual results to date. Individual earnings are not guaranteed and will vary by idea, market demand, and timing.</p>
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
      <p>Our team uses the latest AI tools to rapidly build your app. Standard turnaround is 1–4 weeks. Priority submissions jump the queue.</p>
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
      <p>Every app is built using the latest AI models and frameworks. Fast, production-grade, and ready to sell from day one.</p>
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

<!-- TESTIMONIALS -->
<div class="testi-section">
  <div style="text-align:center">
    <div class="section-label">Beta makers</div>
    <h2>Early makers are already earning</h2>
  </div>
  <div class="testi-grid">
    <div class="testi">
      <div class="testi-stars">★★★★★</div>
      <p class="testi-quote">"I described my roster scheduling idea for small cafés in plain English. Six weeks later it was live and I had already made back my investment."</p>
      <div class="testi-author"><div class="testi-av">M</div><div><div class="testi-name">Marcus T.</div><div class="testi-loc">Melbourne, VIC</div></div></div>
    </div>
    <div class="testi">
      <div class="testi-stars">★★★★★</div>
      <p class="testi-quote">"I have been trying to find a developer to build my practice management idea for two years. Streamline did it in three weeks and it is exactly what I imagined."</p>
      <div class="testi-author"><div class="testi-av">S</div><div><div class="testi-name">Sarah K.</div><div class="testi-loc">Brisbane, QLD</div></div></div>
    </div>
    <div class="testi">
      <div class="testi-stars">★★★★★</div>
      <p class="testi-quote">"The Priority tier was worth every cent. My invoicing tool for tradies launched in 12 days and it is already getting sales without me lifting a finger."</p>
      <div class="testi-author"><div class="testi-av">J</div><div><div class="testi-name">James W.</div><div class="testi-loc">Sydney, NSW</div></div></div>
    </div>
  </div>
</div>

<!-- IDEAS BOARD -->
<section class="section" id="ideas">
  <div class="section-header">
    <div class="section-label">Community ideas</div>
    <h2>Browse the idea board</h2>
    <p style="font-size:16px;color:var(--ink-2);font-weight:300">Vote on ideas you want built. Submit your own and start earning.</p>
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
      <div class="tier-feat">Listed on marketplace</div>
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
      <div class="tier-feat">Co-own the IP</div>
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
      <div class="form-group"><label>App title *</label><input id="f-title" placeholder="e.g. Café Roster Manager" maxlength="120"/></div>
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
    document.getElementById("tb-live").innerHTML="<span class=\"dot\"></span><b>"+live+"</b> apps live";
    document.getElementById("tb-mrr").innerHTML="<b>$"+fmt(mrr)+"</b> MRR";
    document.getElementById("tb-paid").innerHTML="<b>$"+paid.toLocaleString("en-AU",{maximumFractionDigits:0})+"</b> paid to makers";
    animCount(document.getElementById("hs-live"), live, "", "");
    animCount(document.getElementById("hs-mrr"), mrr, "$", "");
    animCount(document.getElementById("hs-paid"), paid, "$", "");
    animCount(document.getElementById("hs-sub"), total||42, "", "+");
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
  fetch("/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:title,name:name,email:email,phone:phone,category:cat,description:desc,tier:selTier})})
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

