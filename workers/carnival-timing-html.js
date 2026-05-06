// Carnival Timing v8.7.0 — slit camera video finish Falkor auto-AI (race summaries + flag times on publish)
const HTML = `<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#0d1117">
  <title>Carnival Timing</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0d1117;
      --surface: #161b22;
      --surface2: #21262d;
      --surface3: #30363d;
      --accent: #14b8a6;
      --accent2: #0891b2;
      --text: #f0f6fc;
      --muted: #8b949e;
      --success: #3fb950;
      --warn: #d29922;
      --danger: #f85149;
      --border: #30363d;
    }

    html, body {
      height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      overflow-x: hidden;
    }

    /* ── Screens ── */
    .screen { display: none; min-height: 100vh; }
    .screen.active { display: block; }

    /* ── Header ── */
    .header {
      background: var(--surface);
      border-bottom: 1px solid var(--surface3);
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo-badge {
      width: 30px; height: 30px;
      background: var(--accent);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 900; color: #000;
      flex-shrink: 0;
      letter-spacing: -1px;
    }
    .header-title { font-weight: 700; font-size: 1rem; }
    .header-sub { font-size: 0.75rem; color: var(--muted); }
    .header-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
    .conn-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--muted); flex-shrink: 0;
    }
    .conn-dot.live { background: var(--success); box-shadow: 0 0 6px var(--success); }

    /* ── Content ── */
    .content { padding: 16px; }

    /* ── Home Screen ── */
    .home-hero {
      text-align: center;
      padding: 52px 24px 32px;
      background: linear-gradient(180deg, rgba(20,184,166,0.05) 0%, transparent 100%);
    }
    .home-logo {
      width: 80px; height: 80px;
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
      border-radius: 22px;
      display: flex; align-items: center; justify-content: center;
      font-size: 34px; font-weight: 900; color: #000;
      margin: 0 auto 24px;
      box-shadow: 0 12px 40px rgba(20,184,166,0.35);
      letter-spacing: -2px;
    }
    .home-title {
      font-size: 2.2rem; font-weight: 900;
      background: linear-gradient(135deg, var(--accent) 0%, #67e8f9 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px; letter-spacing: -1px;
    }
    .home-tagline { color: var(--muted); font-size: 1rem; margin-bottom: 12px; }
    .home-sports {
      display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;
      margin-bottom: 36px;
    }
    .home-sport-pill {
      background: var(--surface2);
      border: 1px solid var(--surface3);
      border-radius: 20px;
      padding: 5px 12px;
      font-size: 0.8rem;
      color: var(--muted);
    }
    .home-sport-pill span { margin-right: 5px; }

    /* ── Buttons ── */
    .btn {
      display: block; width: 100%;
      padding: 14px 20px;
      border: none; border-radius: 10px;
      font-size: 1rem; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
      text-align: center; text-decoration: none;
      -webkit-tap-highlight-color: transparent;
      font-family: inherit;
    }
    .btn:active { transform: scale(0.97); }
    .btn-primary { background: var(--accent); color: #000; }
    .btn-primary:hover { filter: brightness(0.9); }
    .btn-secondary {
      background: var(--surface2); color: var(--text);
      border: 1px solid var(--surface3);
    }
    .btn-secondary:hover { background: var(--surface3); }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-success { background: var(--success); color: #000; }
    .btn-go {
      background: var(--success); color: #000;
      font-size: 1.5rem; font-weight: 900;
      padding: 22px;
    }
    .btn-stop {
      background: var(--danger); color: #fff;
      font-size: 1.6rem; font-weight: 900;
      padding: 0; min-height: 130px;
      border-radius: 14px; border: none;
      cursor: pointer; width: 100%;
      -webkit-tap-highlight-color: transparent;
      transition: all 0.1s;
      font-family: inherit;
    }
    .btn-stop:active { transform: scale(0.97); }
    .btn-tap {
      background: var(--accent); color: #000;
      font-weight: 900; padding: 0;
      min-height: 220px; border-radius: 18px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 6px; width: 100%; border: none;
      cursor: pointer; -webkit-tap-highlight-color: transparent;
      transition: all 0.08s; user-select: none;
      font-family: inherit;
    }
    .btn-tap:active { transform: scale(0.96); filter: brightness(0.85); }
    .btn-tap .tap-main { font-size: 2.4rem; font-weight: 900; line-height: 1; }
    .btn-tap .tap-sub { font-size: 1rem; font-family: 'Menlo','SF Mono',monospace; opacity: 0.75; }
    .btn-sm { padding: 8px 14px; font-size: 0.85rem; width: auto; display: inline-block; }
    .btn-icon {
      background: var(--surface2); border: 1px solid var(--surface3);
      color: var(--text); padding: 8px 12px;
      width: auto; display: inline-flex; align-items: center; gap: 5px;
      font-size: 0.82rem; border-radius: 8px;
      font-family: inherit;
    }
    .btn[disabled] { opacity: 0.38; pointer-events: none; }

    /* ── Form ── */
    .form-group { margin-bottom: 16px; }
    label {
      display: block; font-size: 0.78rem; font-weight: 600;
      color: var(--muted); text-transform: uppercase;
      letter-spacing: 0.06em; margin-bottom: 6px;
    }
    input[type=text], input[type=number], select, textarea {
      width: 100%; background: var(--surface2);
      border: 1.5px solid var(--surface3); border-radius: 8px;
      color: var(--text); padding: 12px 14px;
      font-size: 1rem; font-family: inherit;
      outline: none; transition: border-color 0.15s;
    }
    input:focus, select:focus { border-color: var(--accent); }
    select option { background: var(--surface2); }

    /* ── Sport Picker ── */
    .sport-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .sport-btn {
      background: var(--surface2); border: 2px solid var(--surface3);
      border-radius: 12px; padding: 16px 12px;
      text-align: center; cursor: pointer;
      transition: all 0.15s; -webkit-tap-highlight-color: transparent;
    }
    .sport-btn.active { border-color: var(--accent); background: rgba(20,184,166,0.1); }
    .sport-btn .s-icon { font-size: 2.2rem; margin-bottom: 6px; }
    .sport-btn .s-label { font-size: 0.85rem; font-weight: 700; }
    .sport-btn .s-desc { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }

    /* ── Tier Pills ── */
    .pill-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .pill {
      padding: 6px 14px; border-radius: 20px;
      border: 1.5px solid var(--surface3); background: var(--surface2);
      font-size: 0.8rem; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .pill.active { border-color: var(--accent); color: var(--accent); background: rgba(20,184,166,0.1); }

    /* ── Card ── */
    .card {
      background: var(--surface); border: 1px solid var(--surface3);
      border-radius: 12px; padding: 16px; margin-bottom: 12px;
    }
    .card-title {
      font-size: 0.73rem; font-weight: 700; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 10px;
    }

    /* ── Badge ── */
    .badge {
      display: inline-block; padding: 3px 9px;
      border-radius: 20px; font-size: 0.7rem;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .badge-live { background: rgba(63,185,80,0.15); color: var(--success); border: 1px solid rgba(63,185,80,0.3); }
    .badge-armed { background: rgba(210,153,34,0.15); color: var(--warn); border: 1px solid rgba(210,153,34,0.3); }
    .badge-idle { background: rgba(139,148,158,0.15); color: var(--muted); border: 1px solid rgba(139,148,158,0.2); }
    .badge-done { background: rgba(20,184,166,0.15); color: var(--accent); border: 1px solid rgba(20,184,166,0.3); }

    /* ── Clock ── */
    .clock {
      font-family: 'Menlo','SF Mono','Courier New',monospace;
      font-size: 4.2rem; font-weight: 700;
      letter-spacing: -3px; color: var(--accent);
      text-align: center; line-height: 1; padding: 14px 0;
    }
    .clock.stopped { color: var(--muted); }

    /* ── Lane Row ── */
    .lane-row {
      display: flex; align-items: center;
      padding: 10px 12px; background: var(--surface2);
      border-radius: 8px; margin-bottom: 6px; gap: 10px;
    }
    .lane-num {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--surface3);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
    }
    .lane-name { flex: 1; font-weight: 500; }
    .lane-time { font-family: 'Menlo',monospace; font-weight: 700; font-size: 1.05rem; }
    .conf-HIGH { color: var(--success); font-size: 0.7rem; }
    .conf-OK { color: var(--accent); font-size: 0.7rem; }
    .conf-CHECK { color: var(--warn); font-size: 0.7rem; }
    .conf-LOW { color: var(--danger); font-size: 0.7rem; }

    /* ── Place Row (XC) ── */
    .place-row {
      display: flex; align-items: center;
      padding: 10px 12px; background: var(--surface2);
      border-radius: 8px; margin-bottom: 6px; gap: 10px;
    }
    .medal {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.9rem; flex-shrink: 0;
    }
    .medal.p1 { background: #FFD700; color: #000; }
    .medal.p2 { background: #C0C0C0; color: #000; }
    .medal.p3 { background: #CD7F32; color: #fff; }
    .medal.pN { background: var(--surface3); color: var(--muted); }

    /* ── Tap Counter ── */
    .tap-counter { text-align: center; padding: 16px 0 8px; }
    .tap-place {
      font-size: 5.5rem; font-weight: 900; line-height: 1;
      color: var(--accent);
      font-family: 'Menlo','SF Mono',monospace;
    }
    .tap-label { font-size: 0.78rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }

    /* ── Role Grid ── */
    .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .role-card {
      background: var(--surface2); border: 2px solid var(--surface3);
      border-radius: 12px; padding: 20px 12px; text-align: center;
      cursor: pointer; transition: all 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .role-card:hover, .role-card:active { border-color: var(--accent); background: rgba(20,184,166,0.08); }
    .role-card .r-icon { font-size: 2.2rem; margin-bottom: 8px; }
    .role-card .r-label { font-weight: 700; font-size: 0.9rem; }
    .role-card .r-desc { font-size: 0.73rem; color: var(--muted); margin-top: 3px; }
    .role-card.full { grid-column: 1 / -1; }

    /* ── Video Finish (slit camera) ── */
    .vf-canvas  { width:100%; aspect-ratio:16/9; background:#111; border-radius:12px; display:block; touch-action:none; cursor:ew-resize; }
    .vf-slit-wrap { position:relative; overflow:hidden; border-radius:10px; border:1px solid var(--border); background:#000; margin-top:12px; }
    .vf-slit-display { width:100%; height:140px; display:block; background:#111; cursor:default; }
    .vf-mark-btn  { padding:6px 14px; font-size:0.8rem; border-radius:8px; background:var(--surface); border:1.5px solid var(--border); font-weight:600; cursor:pointer; }
    .vf-mark-btn:active { background:var(--accent); color:#fff; border-color:var(--accent); }
    .vf-rec { display:inline-flex; align-items:center; gap:6px; font-size:0.82rem; font-weight:700; color:#ef4444; }
    .vf-rec-dot { width:10px; height:10px; border-radius:50%; background:#ef4444; animation:vf-pulse 1s infinite; }
    @keyframes vf-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

    /* ── Countdown Overlay ── */
    #countdown-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(13,17,23,0.97); z-index: 200;
      flex-direction: column; align-items: center; justify-content: center;
    }
    #countdown-overlay.active { display: flex; }
    #countdown-num {
      font-size: 11rem; font-weight: 900;
      font-family: 'Menlo','SF Mono',monospace;
      line-height: 1; transition: color 0.1s;
    }
    #countdown-label {
      font-size: 1.1rem; color: var(--muted);
      margin-top: 16px; text-transform: uppercase; letter-spacing: 0.15em;
    }

    /* ── Flash Overlay ── */
    #flash-overlay {
      display: none; position: fixed; inset: 0;
      z-index: 250; pointer-events: none;
    }
    #flash-overlay.recall { background: rgba(248,81,73,0.82); display: block; }
    #flash-overlay.go { background: rgba(63,185,80,0.45); display: block; }
    #tap-flash {
      display: none; position: fixed; inset: 0;
      background: rgba(20,184,166,0.28); z-index: 199; pointer-events: none;
    }
    #tap-flash.show { display: block; }

    /* ── Join Code ── */
    .join-code {
      font-size: 3.2rem; font-family: 'Menlo',monospace;
      font-weight: 900; color: var(--accent);
      text-align: center; letter-spacing: 12px; padding: 20px;
    }
    .qr-wrap { text-align: center; padding: 12px 0; }
    .qr-wrap img { border-radius: 10px; max-width: 180px; }

    /* ── Modal ── */
    .modal-backdrop {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.72); z-index: 400;
      align-items: flex-end;
    }
    .modal-backdrop.active { display: flex; }
    .modal {
      background: var(--surface); border-radius: 20px 20px 0 0;
      padding: 24px 20px 44px; width: 100%;
      border-top: 1px solid var(--surface3);
    }
    .modal-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; }
    .modal-body { color: var(--muted); margin-bottom: 20px; font-size: 0.95rem; }

    /* ── Toast ── */
    #toast {
      position: fixed; bottom: 28px; left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: var(--surface); border: 1px solid var(--surface3);
      border-radius: 24px; padding: 10px 20px;
      font-size: 0.9rem; font-weight: 500;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
      z-index: 350; white-space: nowrap;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    #toast.show { transform: translateX(-50%) translateY(0); }

    /* ── Utility ── */
    .stack { display: flex; flex-direction: column; gap: 10px; }
    .row { display: flex; gap: 10px; }
    .row > .btn { flex: 1; }
    .divider { border: none; border-top: 1px solid var(--surface3); margin: 16px 0; }
    .text-center { text-align: center; }
    .text-muted { color: var(--muted); }
    .text-sm { font-size: 0.85rem; }
    .text-xs { font-size: 0.75rem; }
    .font-mono { font-family: 'Menlo','SF Mono',monospace; }
    .mt-8 { margin-top: 8px; }
    .mt-16 { margin-top: 16px; }
    .mt-24 { margin-top: 24px; }
    .mt-32 { margin-top: 32px; }
    .hidden { display: none !important; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .gap-8 { gap: 8px; }

    /* ── XC name input inline ── */
    .xc-name-input {
      background: transparent; border: none;
      border-bottom: 1px dashed var(--surface3);
      border-radius: 0; padding: 2px 0;
      font-size: 0.95rem; font-family: inherit;
      color: var(--text); width: 100%; outline: none;
    }
    .xc-name-input:focus { border-bottom-color: var(--accent); }

    /* ── Admin Lane Input Row ── */
    .status-btn {
  padding: 3px 7px; border-radius: 6px; font-size: .72rem; font-weight: 700;
  border: 1.5px solid var(--border); background: var(--surface2); color: var(--muted);
  cursor: pointer; letter-spacing: .04em; transition: all .15s;
}
.status-btn.active-dns { background: rgba(245,158,11,.18); color: #f59e0b; border-color: #f59e0b; }
.status-btn.active-dnf { background: rgba(239,68,68,.18); color: #ef4444; border-color: #ef4444; }
.admin-lane-row {
      display: flex; align-items: center;
      gap: 8px; padding: 6px 0;
      border-bottom: 1px solid var(--surface3);
    }
    .admin-lane-row:last-child { border-bottom: none; }
    .admin-lane-num {
      width: 24px; height: 24px; border-radius: 50%;
      background: var(--surface3);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
      color: var(--muted);
    }
    .admin-lane-name-input {
      flex: 1; background: transparent; border: none;
      border-radius: 0; padding: 6px 0;
      font-size: 0.95rem; font-family: inherit;
      color: var(--text); outline: none;
    }

    @media (max-width: 430px) {
      .clock { font-size: 3.4rem; }
      .tap-place { font-size: 4.5rem; }
      #countdown-num { font-size: 9rem; }
    }

    /* ── Demo Card ── */
    .demo-card {
      display: flex; align-items: center; gap: 14px;
      background: linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.06) 100%);
      border: 1.5px solid rgba(245,158,11,0.35);
      border-radius: 14px; padding: 16px;
      cursor: pointer; transition: all 0.15s;
      -webkit-tap-highlight-color: transparent;
      margin-top: 20px;
    }
    .demo-card:active { transform: scale(0.98); filter: brightness(0.93); }
    .demo-card-icon { font-size: 2rem; flex-shrink: 0; }
    .demo-card-title { font-weight: 700; font-size: 0.95rem; color: #f59e0b; }
    .demo-card-desc { font-size: 0.78rem; color: var(--muted); margin-top: 2px; }
    .demo-card-arrow { margin-left: auto; font-size: 1.3rem; color: #f59e0b; flex-shrink: 0; }

    /* ── Demo Banner (admin screen) ── */
    .demo-banner {
      background: rgba(245,158,11,0.10);
      border: 1.5px solid rgba(245,158,11,0.30);
      border-radius: 12px; padding: 14px 16px;
      margin-bottom: 14px;
    }
    .demo-banner-top {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
    }
    .demo-code-pill {
      font-family: 'Menlo','SF Mono',monospace;
      font-size: 1.6rem; font-weight: 900; letter-spacing: 4px;
      color: #f59e0b; background: rgba(245,158,11,0.12);
      border: 1.5px solid rgba(245,158,11,0.3);
      border-radius: 8px; padding: 4px 14px;
      cursor: pointer; transition: all 0.15s; display: inline-block;
    }
    .demo-code-pill:active { transform: scale(0.96); }
    .demo-banner-hint { font-size: 0.78rem; color: var(--muted); }
    .demo-banner-hint strong { color: var(--text); }
    .demo-qr { margin-top: 10px; }
  
    /* ── XC Photo Burst + Finish Card ── */
    .finish-photo-wrap {
      width:100%;background:var(--surface3);border-radius:10px;
      overflow:hidden;margin-bottom:8px;position:relative;
      aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;
    }
    .finish-photo-wrap img { width:100%;height:100%;object-fit:cover;display:block; }
    .finish-photo-capturing {
      color:var(--muted);font-size:0.8rem;text-align:center;padding:16px;
    }
    .finish-photo-wrap .ocr-badge {
      position:absolute;top:6px;right:6px;
      background:rgba(20,184,166,0.9);color:#fff;
      font-size:0.7rem;font-weight:700;padding:3px 7px;border-radius:20px;
    }
    .bib-scan-row { display:flex;gap:6px;margin-bottom:8px; }
    /* Qualifier badge */
    .qualifier-chip {
      display:inline-flex;align-items:center;gap:4px;
      background:rgba(234,179,8,0.2);color:#eab308;
      font-size:0.65rem;font-weight:700;padding:2px 7px;border-radius:20px;
      border:1px solid rgba(234,179,8,0.4);
    }
    /* Finish card share overlay */
    #finish-card-overlay {
      position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9990;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:16px;gap:12px;
    }
    #finish-card-overlay canvas,
    #finish-card-overlay img { max-width:min(320px,85vw);border-radius:12px; }
    #finish-card-overlay .card-actions { display:flex;gap:10px;flex-wrap:wrap;justify-content:center; }

  
    /* v8.5.1 — auto-detect */
    #xc-line-setup-overlay {
      display:none;position:fixed;inset:0;z-index:9996;background:#000;
      flex-direction:column;
    }
    #xc-line-setup-overlay video {
      width:100%;height:100%;object-fit:cover;position:absolute;inset:0;
    }
    #xc-line-canvas-overlay {
      position:absolute;inset:0;width:100%;height:100%;touch-action:none;
    }
    #xc-line-instruction {
      position:absolute;top:16px;left:0;right:0;text-align:center;
      color:#fff;font-size:1rem;font-weight:600;
      background:rgba(0,0,0,.65);padding:10px;pointer-events:none;
    }
    #xc-line-setup-btns {
      position:absolute;bottom:0;left:0;right:0;
      display:flex;gap:10px;padding:16px;background:rgba(0,0,0,.7);
    }
    .xc-detect-bar {
      display:flex;align-items:center;gap:10px;
      padding:8px 14px;background:var(--surface-2);border-bottom:1px solid var(--border);
    }
    .xc-detect-pulse {
      width:12px;height:12px;border-radius:50%;background:#ef4444;flex-shrink:0;
      animation:xcpulse 1s infinite;
    }
    @keyframes xcpulse {
      0%,100%{opacity:1;transform:scale(1)}
      50%{opacity:.4;transform:scale(.8)}
    }
    .xc-auto-countdown {
      display:inline-block;width:28px;height:28px;border-radius:50%;
      background:var(--accent);color:#fff;font-size:.75rem;font-weight:700;
      text-align:center;line-height:28px;flex-shrink:0;
    }

    
/* CT paywall */
.ct-paywall-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px}
.ct-paywall-overlay.hidden{display:none}
.ct-paywall-box{background:#fff;border-radius:18px;padding:28px 24px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.ct-paywall-logo{font-size:2rem;text-align:center;margin-bottom:6px}
.ct-paywall-title{font-size:1.15rem;font-weight:800;text-align:center;color:#0d1b3e;margin-bottom:4px}
.ct-paywall-sub{font-size:.85rem;text-align:center;color:#64748b;margin-bottom:20px}
.ct-plan-row{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
.ct-plan-btn{display:block;padding:14px 18px;border-radius:10px;text-decoration:none;border:2px solid #e2e8f0;cursor:pointer;transition:border-color .15s,background .15s;text-align:left}
.ct-plan-btn:hover{border-color:#1a56db;background:#f0f5ff}
.ct-plan-btn.primary{background:#0d1b3e;border-color:#0d1b3e;color:#fff}
.ct-plan-btn.primary:hover{background:#1a3a6e;border-color:#1a3a6e}
.ct-plan-label{font-size:.95rem;font-weight:700}
.ct-plan-price{font-size:1.1rem;font-weight:900}
.ct-plan-desc{font-size:.78rem;opacity:.75;margin-top:2px}
.ct-divider{text-align:center;font-size:.8rem;color:#94a3b8;margin:4px 0 12px}
.ct-code-row{display:flex;gap:8px}
.ct-code-input{flex:1;padding:11px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;font-family:monospace;text-transform:uppercase;letter-spacing:.1em;outline:none}
.ct-code-input:focus{border-color:#1a56db}
.ct-code-submit{padding:11px 18px;background:#1a56db;color:#fff;border:none;border-radius:8px;font-size:.9rem;font-weight:700;cursor:pointer;white-space:nowrap}
.ct-code-submit:disabled{opacity:.5;cursor:default}
.ct-code-error{font-size:.82rem;color:#dc2626;margin-top:6px;min-height:18px}
.ct-access-badge{display:inline-flex;align-items:center;gap:5px;background:#dcfce7;color:#15803d;border-radius:6px;font-size:.75rem;font-weight:700;padding:3px 8px}
</style>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a56db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='6'/><path d='M15.477 12.89 17 22l-5-3-5 3 1.523-9.11'/></svg>"><meta name="robots" content="index, follow">
<link rel="canonical" href="https://carnivaltiming.com/"><meta property="og:title" content="Carnival Timing — Live Race Management for School Carnivals"><meta property="og:description" content="Real-time race timing for school athletics, swimming and cross country carnivals. Multi-device, live results, QR pairing. Free to use."><meta property="og:url" content="https://carnivaltiming.com/"><meta property="og:type" content="website"><meta property="og:locale" content="en_AU"><meta property="og:site_name" content="Carnival Timing"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Carnival Timing — Live Race Management for School Carnivals"><meta name="twitter:description" content="Real-time race timing for school athletics, swimming and cross country carnivals. Multi-device, live results, QR pairing. Free to use."><script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Carnival Timing",
  "alternateName": "Sport Portal",
  "url": "https://carnivaltiming.com",
  "logo": "https://carnivaltiming.com/favicon.svg",
  "description": "School sport management platform — carnivals, live timing, district hub, parent-facing results.",
  "address": {"@type": "PostalAddress", "addressCountry": "AU", "addressRegion": "VIC"},
  "founder": {"@type": "Person", "name": "Paddy Gallivan"},
  "legalName": "Luck Dragon Pty Ltd",
  "taxID": "ABN 64 697 434 898",
  "email": "info@sportportal.com.au",
  "areaServed": {"@type": "Country", "name": "Australia"},
  "knowsAbout": ["School sport", "Athletics carnivals", "Swimming carnivals", "Cross country", "Live event timing"]
}</script><script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
</head>
<body>

<!-- XC photo burst camera elements -->
<video id="xc-cam" autoplay playsinline muted style="display:none;position:absolute;width:1px;height:1px"></video>
<canvas id="xc-cap" style="display:none"></canvas>

<div id="reconnect-banner" style="display:none;position:fixed;top:0;left:0;right:0;z-index:9999;background:#f59e0b;color:#000;text-align:center;padding:8px 16px;font-size:.9rem;font-weight:600;letter-spacing:.02em;">
  ⚡ Reconnecting…
</div>

<!-- ════════════════════════════════════════
     SCREEN: HOME
════════════════════════════════════════ -->
<div id="screen-home" class="screen active">
  <div class="home-hero">
    <div class="home-logo">CT</div>
    <div class="home-title">Carnival Timing</div>
    <div class="home-tagline">Real-time race timing — no stopwatches, no paper, no chaos</div>
    <div style="font-size:0.72rem;color:rgba(255,255,255,0.3);text-align:center;margin-top:6px;letter-spacing:0.08em;text-transform:uppercase">Track · Swimming · Cross Country</div>
    <div class="home-sports">
      <div class="home-sport-pill"><span><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><polyline points='22 12 18 12 15 21 9 3 6 12 2 12'/></svg></span>Track & Field</div>
      <div class="home-sport-pill"><span><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><path d='M2 20s2-2 5-2 5 2 7 2 5-2 7-2 3 1 3 1M2 16s2-2 5-2 5 2 7 2 5-2 7-2 3 1 3 1'/><circle cx='14' cy='5' r='2'/></svg></span>Swimming</div>
      <div class="home-sport-pill"><span><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><path d='M12 22V8M5 8l7-6 7 6M3 22h18M9 22V16h6v6'/></svg></span>Cross Country</div>
    </div>
  </div>
  <div class="content">
    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:20px 0 4px;padding:0 8px">
      <div style="font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:5px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>No app install</div>
      <div style="font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:5px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Any phone or tablet</div>
      <div style="font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:5px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Real-time sync</div>
      <div style="font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:5px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Live demo free</div>
    </div>
    <div class="stack">
      <button class="btn btn-primary" onclick="showScreen('setup')"><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><rect width='20' height='14' x='2' y='6' rx='2'/><line x1='2' x2='22' y1='10' y2='10'/><path d='M9 6V2h6v4'/></svg> New Carnival</button>
      <button class="btn btn-secondary" onclick="showScreen('join-screen')"><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><rect x='5' y='2' width='14' height='20' rx='2'/><path d='M12 18h.01'/></svg> Join Carnival</button>
    </div>

    <div class="demo-card" onclick="startDemo()">
      <div class="demo-card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div style="flex:1">
        <div class="demo-card-title">Live demo</div>
        <div class="demo-card-desc">Runs a real carnival with 8 athletes. No sign-up.</div>
      </div>
      <div class="demo-card-arrow">→</div>
    </div>

    <!-- ── How it works ── -->
    <div style="margin-top:32px">
      <div style="font-size:0.8rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;text-align:center">How it works</div>

      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</div>
          <div>
            <div style="font-weight:600;font-size:0.9rem">Race Control creates a carnival</div>
            <div style="font-size:0.78rem;color:var(--muted);margin-top:2px">Takes 10 seconds. You get a 4-letter code.</div>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</div>
          <div>
            <div style="font-weight:600;font-size:0.9rem">Everyone joins on their phone</div>
            <div style="font-size:0.78rem;color:var(--muted);margin-top:2px">Open carnivaltiming.com, tap Join Carnival, enter the code. Pick a role — Timer, Observer, Starter or XC Marshal.</div>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</div>
          <div>
            <div style="font-weight:600;font-size:0.9rem">Race Control arms &amp; fires GO</div>
            <div style="font-size:0.78rem;color:var(--muted);margin-top:2px">All timers start simultaneously. Tap STOP when your athlete finishes.</div>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">4</div>
          <div>
            <div style="font-weight:600;font-size:0.9rem">Times sync instantly — publish when ready</div>
            <div style="font-size:0.78rem;color:var(--muted);margin-top:2px">Race Control sees all splits live and publishes the averaged result.</div>
          </div>
        </div>
      </div>

      <!-- Roles -->
      <div style="margin-top:20px;background:var(--surface);border-radius:12px;padding:14px 16px">
        <div style="font-size:0.78rem;font-weight:700;margin-bottom:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em">Roles</div>
        <div style="display:flex;flex-direction:column;gap:7px;font-size:0.82rem">
          <div style="display:flex;gap:8px"><span style="font-weight:700;min-width:110px">Race Control</span><span style="color:var(--muted)">Arms races, fires GO/RECALL, publishes results. One per carnival.</span></div>
          <div style="display:flex;gap:8px"><span style="font-weight:700;min-width:110px">Timer</span><span style="color:var(--muted)">Taps STOP for one lane. Bring 2–3 per lane for accuracy.</span></div>
          <div style="display:flex;gap:8px"><span style="font-weight:700;min-width:110px">Starter</span><span style="color:var(--muted)">Fires GO from the start line (optional — Race Control can do it).</span></div>
          <div style="display:flex;gap:8px"><span style="font-weight:700;min-width:110px">Observer</span><span style="color:var(--muted)">Watches live splits on any device. Read-only.</span></div>
          <div style="display:flex;gap:8px"><span style="font-weight:700;min-width:110px">XC Marshal</span><span style="color:var(--muted)">Taps finishers in order at the cross country finish chute.</span></div>
        </div>
      </div>

      <!-- Timer accuracy -->
      <div style="margin-top:10px;background:var(--surface);border-radius:12px;padding:14px 16px">
        <div style="font-size:0.78rem;font-weight:700;margin-bottom:8px;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em">How many timers per lane?</div>
        <div style="font-size:0.82rem;display:flex;flex-direction:column;gap:5px">
          <div style="display:flex;gap:8px"><span style="min-width:70px;font-weight:700">1 timer</span><span style="color:var(--muted)">That time is used directly.</span></div>
          <div style="display:flex;gap:8px"><span style="min-width:70px;font-weight:700">2 timers</span><span style="color:var(--muted)">Average of both.</span></div>
          <div style="display:flex;gap:8px"><span style="min-width:70px;font-weight:700">3+ timers</span><span style="color:var(--muted)">Trimmed mean — fastest and slowest dropped, rest averaged. <strong>Recommended for accuracy.</strong></span></div>
        </div>
        <div style="margin-top:8px;font-size:0.78rem;color:var(--muted)">No hard limit on timers. More timers per lane = more accurate result.</div>
      </div>
    </div>


    <!-- ── School Sport Portal upsell ── -->
    <div style="margin-top:24px;background:linear-gradient(135deg,#0d1b3e 0%,#1a3a6e 60%,#1a56db 100%);border-radius:14px;padding:18px 20px;color:#fff">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:1.1rem">🏅</span>
        <span style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#fcd34d">School Sport Portal</span>
      </div>
      <div style="font-size:0.98rem;font-weight:700;margin-bottom:6px;line-height:1.3">Want persistent results, house points &amp; district qualifiers?</div>
      <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);margin-bottom:14px;line-height:1.5">Carnival Timing is free and always will be. School Sport Portal adds automatic house point tallies, event program builder, district qualifier tracking and permanent public results pages — for $1/student/year.</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a href="https://schoolsportportal.com.au" target="_blank" style="background:#f59e0b;color:#0d1b3e;padding:9px 18px;border-radius:7px;font-size:0.85rem;font-weight:700;text-decoration:none;display:inline-block">See School Sport Portal →</a>
        <a href="https://schoolsportportal.com.au#demo" target="_blank" style="border:1.5px solid rgba(255,255,255,0.3);color:#fff;padding:8px 16px;border-radius:7px;font-size:0.85rem;font-weight:600;text-decoration:none;display:inline-block">Live demo</a>
      </div>
    </div>

    <div class="text-center text-muted text-xs mt-32">
      Auto-reconnects · No app install · Join &amp; observe free<br>
      <span style="opacity:0.5">Carnival Timing · carnivaltiming.com</span>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: SETUP (New Carnival)
════════════════════════════════════════ -->
<div id="screen-setup" class="screen">
  <div class="header">
    <div class="logo-badge">SP</div>
    <div class="header-title">New Carnival</div>
    <div class="header-right">
      <button class="btn btn-icon btn-sm" onclick="showScreen('home')">← Back</button>
    </div>
  </div>
  <div class="content">
    <div class="form-group">
      <label>School Name</label>
      <input type="text" id="setup-school" placeholder="e.g. Williamstown Primary School">
    </div>
    <div class="form-group">
      <label>Carnival / Event Name</label>
      <input type="text" id="setup-name" placeholder="e.g. Winter Sport 2026">
    </div>
    <div class="form-group">
      <label>Sport Type</label>
      <div class="sport-grid">
        <div class="sport-btn active" data-sport="track" onclick="selectSport('track')">
          <div class="s-icon"><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><polyline points='22 12 18 12 15 21 9 3 6 12 2 12'/></svg></div>
          <div class="s-label">Track & Field</div>
          <div class="s-desc">Lane timing</div>
        </div>
        <div class="sport-btn" data-sport="swim" onclick="selectSport('swim')">
          <div class="s-icon"><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><path d='M2 20s2-2 5-2 5 2 7 2 5-2 7-2 3 1 3 1M2 16s2-2 5-2 5 2 7 2 5-2 7-2 3 1 3 1'/><circle cx='14' cy='5' r='2'/></svg></div>
          <div class="s-label">Swimming</div>
          <div class="s-desc">Lane timing</div>
        </div>
        <div class="sport-btn" data-sport="xc" onclick="selectSport('xc')">
          <div class="s-icon"><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><path d='M12 22V8M5 8l7-6 7 6M3 22h18M9 22V16h6v6'/></svg></div>
          <div class="s-label">Cross Country</div>
          <div class="s-desc">Finish order tap</div>
        </div>
        <div class="sport-btn" data-sport="mixed" onclick="selectSport('mixed')">
          <div class="s-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></div>
          <div class="s-label">Mixed Events</div>
          <div class="s-desc">All modes</div>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label>Competition Tier</label>
      <div class="pill-row">
        <div class="pill active" data-tier="school" onclick="selectTier('school')">School</div>
        <div class="pill" data-tier="district" onclick="selectTier('district')">District</div>
        <div class="pill" data-tier="region" onclick="selectTier('region')">Region</div>
        <div class="pill" data-tier="state" onclick="selectTier('state')">State</div>
      </div>
    </div>
    <div class="form-group">
      <label>Accent Colour <span style="font-weight:400;text-transform:none;font-size:0.85em">(optional)</span></label>
      <input type="text" id="setup-colour" placeholder="#14b8a6 — leave blank for teal">
    </div>
        <div class="form-group">
      <label>Houses <span style="color:var(--muted);font-size:.8rem;font-weight:400">(optional — for points tally)</span></label>
      <input type="text" id="setup-houses" placeholder="Red, Blue, Green, Yellow">
      <div style="color:var(--muted);font-size:.75rem;margin-top:4px">Comma-separated. Leave blank to skip house points.</div>
    </div>
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <label style="margin:0">Event Program <span style="color:var(--muted);font-size:.8rem;font-weight:400">(optional)</span></label>
        <button type="button" class="btn btn-secondary" style="padding:4px 10px;font-size:.8rem" onclick="addProgramRow()">+ Add Event</button>
      </div>
      <div id="program-rows" style="max-height:240px;overflow-y:auto"></div>
      <div style="color:var(--muted);font-size:.75rem;margin-top:4px">Pre-load your day's schedule. Use "Next Event →" in Race Control to auto-advance.</div>
    </div>
    <button class="btn btn-primary mt-8" onclick="createCarnival()">Create Carnival →</button>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: JOIN
════════════════════════════════════════ -->
<div id="screen-join-screen" class="screen">
  <div class="header">
    <div class="logo-badge">SP</div>
    <div class="header-title">Join Carnival</div>
    <div class="header-right">
      <button class="btn btn-icon btn-sm" onclick="showScreen('home')">← Back</button>
    </div>
  </div>
  <div class="content">
    <div class="form-group">
      <label>4-Letter Code</label>
      <input type="text" id="join-code-input" placeholder="ABCD"
        maxlength="6"
        style="font-family:'Menlo',monospace;font-size:1.8rem;text-transform:uppercase;letter-spacing:8px;text-align:center">
    </div>
    <div class="form-group">
      <label>Your Name</label>
      <input type="text" id="join-name-input" placeholder="e.g. Alex">
    </div>
    <button class="btn btn-primary" onclick="joinCarnival()">Join →</button>
    <div id="join-error" class="text-center text-muted mt-16 hidden" style="color:var(--danger)"></div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: ROLE PICKER
════════════════════════════════════════ -->
<div id="screen-role" class="screen">
  <div class="header">
    <div class="logo-badge">SP</div>
    <div>
      <div class="header-title" id="role-school-name">Choose Role</div>
      <div class="header-sub" id="role-carnival-name"></div>
    </div>
  </div>
  <div class="content">
    <div class="card">
      <div class="card-title">Carnival</div>
      <div style="font-size:1rem;font-weight:700" id="role-joined-name"></div>
      <div class="text-xs text-muted mt-8 font-mono" id="role-joined-code"></div>
      <div class="text-xs text-muted mt-4" id="role-expires-note" style="display:none"></div>
    </div>
    <div id="role-grid" class="role-grid"></div>
    <div id="role-lane-picker" class="hidden mt-16">
      <label style="font-size:1.1rem;font-weight:700;display:block;margin-bottom:12px">Which lane are you timing?</label>
      <div id="lane-pick-btns" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px"></div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: TIMER (Lane)
════════════════════════════════════════ -->
<div id="screen-timer" class="screen">
  <div class="header">
    <div class="conn-dot" id="timer-dot"></div><span id="timer-dot-lbl" style="font-size:0.65rem;font-weight:700;letter-spacing:.05em;color:var(--muted)"></span>
    <div>
      <div class="header-title" id="timer-lane-label">Lane 1</div>
      <div class="header-sub" id="timer-event-label"></div>
    </div>
    <div class="header-right" id="timer-badge-wrap"></div>
  </div>
  <div class="content">
    <div class="card" id="timer-athlete-card">
      <div class="card-title" id="timer-athlete-event">Event</div>
      <div id="timer-athlete-name" style="font-size:1.5rem;font-weight:700">—</div>
      <div id="timer-athlete-note" class="text-muted text-sm"></div>
    </div>

    <div id="timer-recall-banner" class="hidden" style="background:#7f1d1d;color:#fca5a5;border-radius:10px;padding:10px 14px;text-align:center;font-weight:700;font-size:1.05rem;margin-bottom:8px;">FALSE START — Race Recalled</div>

    <div class="clock" id="timer-clock">0:00.00</div>

    <div class="form-group" id="timer-name-gate">
      <label>Your name (needed to stop)</label>
      <input type="text" id="timer-name-input" placeholder="e.g. Alex">
    </div>

    <button class="btn btn-stop" id="timer-stop-btn" onclick="timerStop()" disabled>STOP</button>

    <div id="timer-my-split" class="hidden mt-16">
      <div class="card">
        <div class="card-title">Your time</div>
        <div id="timer-my-time" class="font-mono" style="font-size:2.2rem;font-weight:700;color:var(--accent)"></div>
      </div>
    </div>

    <div id="timer-splits-card" class="card mt-8 hidden">
      <div class="card-title">All timers this lane</div>
      <div class="text-xs text-muted" style="padding:0 4px 6px;line-height:1.4;">Race Control publishes a <strong>trimmed mean</strong> — with 3+ timers the fastest and slowest are dropped.</div>
      <div id="timer-splits-list"></div>
    </div>

    <div id="timer-waiting-msg" class="text-center text-muted mt-32">
      <div style="font-size:2.5rem"><svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><circle cx='12' cy='13' r='8'/><path d='M12 9v4l2 2M9 2h6'/></svg></div>
      <div class="mt-8">Waiting for race to be armed...</div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: ADMIN (Lane Race)
════════════════════════════════════════ -->
<div id="screen-admin" class="screen">
  <div class="header">
    <div class="conn-dot" id="admin-dot"></div><span id="admin-dot-lbl" style="font-size:0.65rem;font-weight:700;letter-spacing:.05em;color:var(--muted)"></span>
    <div class="header-title">Race Control</div>
    <div class="header-right"><span class="text-muted text-xs" id="admin-school-lbl"></span></div>
  </div>
  <div class="content">

    <!-- Demo banner (shown when isDemo=true) -->
    <div id="admin-demo-banner" class="demo-banner hidden">
      <div class="demo-banner-top">
        <span style="font-size:1.1rem;font-weight:700;color:#f59e0b">Demo Carnival</span>
        <span class="badge" style="background:rgba(245,158,11,0.15);color:#f59e0b;border-color:rgba(245,158,11,0.3)">DEMO</span>
      </div>
      <div class="demo-banner-hint" style="margin-bottom:10px">
        <strong>Share this code</strong> — open carnivaltiming.com on another device and tap "Join Carnival"
      </div>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span class="demo-code-pill" id="demo-code-display" onclick="copyDemoCode()" title="Tap to copy">????</span>
        <button class="btn btn-icon btn-sm" onclick="copyDemoCode()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy code</button>
      </div>
      <div class="demo-qr">
        <div style="font-size:0.72rem;color:var(--muted);margin-bottom:6px">Or scan to join from phone:</div>
        <div id="demo-qr-canvas" style="display:inline-block;background:#fff;padding:6px;border-radius:6px"></div>
      </div>
    </div>

    <!-- Setup panel -->
    <div id="admin-setup-panel">
      <div class="card">
        <div class="card-title">Race Setup</div>
        <div class="form-group">
          <label>Age Group</label>
          <select id="admin-age-sel"></select>
        </div>
        <div class="form-group">
          <label>Gender</label>
          <div class="pill-row">
            <div class="pill active" data-ag="boys" onclick="selectAdminGender('boys')">Boys</div>
            <div class="pill" data-ag="girls" onclick="selectAdminGender('girls')">Girls</div>
            <div class="pill" data-ag="mixed" onclick="selectAdminGender('mixed')">Mixed</div>
          </div>
        </div>
        <div class="form-group mb-0">
          <label>Event</label>
          <select id="admin-event-sel"></select>
        </div>
      </div>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div class="card-title" style="margin:0">Lane Assignments</div>
          <button type="button" class="btn btn-secondary" style="padding:4px 12px;font-size:.78rem" onclick="openRosterModal()">📋 Paste Roster</button>
        </div>
        <div id="admin-lane-inputs"></div>
      </div>
      <div class="card" id="admin-house-card" style="display:none">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div class="card-title" style="margin:0">House Points</div>
          <button type="button" class="btn btn-secondary" style="padding:4px 10px;font-size:.78rem;color:#ef4444;border-color:#ef4444" onclick="adminResetHousePoints()">Reset</button>
        </div>
        <div id="admin-house-standings"></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="adminArm()" style="flex:1">ARM RACE →</button>
        <button class="btn btn-secondary" id="admin-next-event-btn" onclick="adminNextEvent()" style="flex:1;display:none">Next Event →</button>
      </div>
    </div>

    <!-- Live panel -->
    <div id="admin-live-panel" class="hidden">
      <div class="card">
        <div class="flex items-center gap-8" style="margin-bottom:6px">
          <div id="admin-race-lbl" style="font-weight:700;font-size:1.05rem;flex:1"></div>
          <span id="admin-state-badge" class="badge badge-armed">ARMED</span>
        </div>
        <div class="clock" id="admin-live-clock" style="font-size:3rem;padding:8px 0">0:00.00</div>
      </div>
      <div class="row">
        <button class="btn btn-go" id="admin-go-btn" onclick="adminGo()">GO</button>
        <button class="btn btn-secondary" onclick="adminRecall()">RECALL</button>
      </div>
      <div class="row mt-8">
        <button class="btn btn-secondary" onclick="adminClear()">CLEAR SPLITS</button>
        <button class="btn btn-secondary" onclick="adminAbandon()">ABANDON</button>
      </div>
      <div class="row mt-8">
        <button class="btn btn-secondary" onclick="adminRenameLanes()" style="flex:1"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit Names</button>
      </div>
      <hr class="divider">
      <div class="card-title">Live Splits</div>
      <div class="text-xs text-muted" style="padding:0 4px 8px;line-height:1.4;">Published time = <strong>trimmed mean</strong>. 3+ timers: drop fastest &amp; slowest, mean the rest. 2 timers: plain mean. 1 timer: that value.</div>
      <div id="admin-splits-list"></div>
      <button class="btn btn-primary mt-16 hidden" id="admin-publish-btn" onclick="adminPublish()"><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><rect x='8' y='2' width='8' height='4' rx='1' ry='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/></svg> Publish Results</button>
      <div id="admin-export-btns" class="hidden" style="display:none;gap:8px;margin-top:8px">
        <button class="btn btn-secondary" style="flex:1" onclick="adminExportCSV()">⬇ Export CSV</button>
        <button class="btn btn-secondary" style="flex:1" onclick="adminPrintResults()">🖨 Print</button>
      </div>
    </div>

    <!-- Done panel -->
    <div id="admin-done-panel" class="hidden">
      <div class="card">
        <div class="card-title">Published Results</div>
        <div id="admin-results-list"></div>
      </div>
      <div class="row mt-8">
        <button class="btn btn-primary" id="admin-done-publish-btn" onclick="adminPublishFromDone()">Publish Results</button>
        <button class="btn btn-secondary" onclick="adminNewRace()">+ New Race</button>
        <button class="btn btn-secondary" onclick="exportCSV()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export CSV</button>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: STARTER
════════════════════════════════════════ -->
<div id="screen-starter" class="screen">
  <div class="header">
    <div class="conn-dot" id="starter-dot"></div><span id="starter-dot-lbl" style="font-size:0.65rem;font-weight:700;letter-spacing:.05em;color:var(--muted)"></span>
    <div class="header-title">Starter</div>
    <div class="header-right"><span id="starter-event-lbl" class="text-muted text-xs"></span></div>
  </div>
  <div class="content">
    <div id="starter-waiting" class="text-center" style="padding-top:60px">
      <div style="font-size:3.5rem"><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'/><path d='M10.3 21a1.94 1.94 0 0 0 3.4 0'/></svg></div>
      <div class="text-muted mt-16">Waiting for Race Control to arm...</div>
    </div>
    <div id="starter-armed" class="hidden">
      <div class="card text-center">
        <div id="starter-race-info" class="text-muted text-sm"></div>
        <div class="clock mt-8" id="starter-clock">0:00.00</div>
      </div>

      <!-- Gun detection panel -->
      <div style="margin-top:16px;padding:16px;background:var(--surface-2);border-radius:12px">
        <!-- Idle state -->
        <div id="starter-listen-idle">
          <div style="font-size:0.8rem;color:var(--muted);text-align:center;margin-bottom:12px">Point mic toward the starting pistol</div>
          <button class="btn btn-primary" style="width:100%;font-size:1.1rem;padding:16px" onclick="starterListenStart()">
            🎙️ Listen for Gun
          </button>
        </div>
        <!-- Listening state -->
        <div id="starter-listen-active" class="hidden">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <div style="width:10px;height:10px;border-radius:50%;background:#ef4444;animation:vf-pulse 0.8s infinite;flex-shrink:0"></div>
            <div style="font-size:0.9rem;font-weight:700;color:#ef4444;flex:1">Listening…</div>
            <div id="starter-cal-lbl" style="font-size:0.72rem;color:var(--muted)">Calibrating</div>
          </div>
          <!-- Volume bar -->
          <div style="background:var(--surface);border-radius:4px;height:14px;overflow:hidden;margin-bottom:10px">
            <div id="starter-vol-bar" style="height:100%;width:0%;background:var(--accent);border-radius:4px;transition:width 0.04s"></div>
          </div>
          <!-- Sensitivity -->
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
            <span style="font-size:0.75rem;color:var(--muted)">Sensitivity:</span>
            <button class="btn btn-secondary" style="font-size:0.75rem;padding:4px 10px" data-sens="high" onclick="starterSetSens('high')">High</button>
            <button class="btn btn-primary"   style="font-size:0.75rem;padding:4px 10px" data-sens="med"  onclick="starterSetSens('med')">Med</button>
            <button class="btn btn-secondary" style="font-size:0.75rem;padding:4px 10px" data-sens="low"  onclick="starterSetSens('low')">Low</button>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary" style="flex:1;font-size:0.85rem" onclick="starterListenStop()">Stop Listening</button>
            <button class="btn btn-secondary" style="font-size:0.85rem;padding:8px 12px" title="Recalibrate noise floor" onclick="starterRecalibrate()">↺ Recal</button>
          </div>
        </div>
      </div>

      <!-- Manual fallback + recall -->
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-secondary" style="flex:1;font-size:0.85rem" id="starter-go-btn" onclick="starterGo()">Manual GO</button>
        <button class="btn btn-secondary" style="flex:1;font-size:0.85rem;color:var(--danger);border-color:var(--danger)" onclick="starterRecall()">RECALL</button>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: OBSERVER (Lane Race)
════════════════════════════════════════ -->
<div id="screen-observer" class="screen">
  <div class="header">
    <div class="conn-dot" id="observer-dot"></div><span id="observer-dot-lbl" style="font-size:0.65rem;font-weight:700;letter-spacing:.05em;color:var(--muted)"></span>
    <div class="header-title">Live Results</div>
    <div class="header-right"><span id="observer-event-lbl" class="text-muted text-xs"></span></div>
  </div>
  <div class="content">
    <div class="clock" id="observer-clock" style="font-size:2.8rem">0:00.00</div>
    <div id="observer-lanes-list"></div>
    <div id="observer-waiting" class="text-center text-muted mt-32">
      <div style="opacity:0.35;margin-bottom:8px"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12" y2="20"/></svg></div>
      <div class="mt-8">Waiting for next race...</div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: XC MARSHAL
════════════════════════════════════════ -->
<div id="screen-marshal" class="screen">
  <div class="header">
    <div class="conn-dot" id="marshal-dot"></div><span id="marshal-dot-lbl" style="font-size:0.65rem;font-weight:700;letter-spacing:.05em;color:var(--muted)"></span>
    <div class="header-title">Finish Marshal</div>
    <div class="header-right"><span id="marshal-event-lbl" class="text-xs text-muted"></span></div>
  </div>
  <div class="content" style="padding:0">
    <!-- WAITING -->
    <div id="marshal-waiting" class="text-center" style="padding:60px 20px 0">
      <div id="marshal-wait-msg" class="text-muted mt-16">Waiting for race to start...</div>
    </div>

    <!-- LIVE -->
    <div id="marshal-live" class="hidden" style="display:flex;flex-direction:column;height:100%">
      
      <!-- Auto-detect toggle bar -->
      <div id="xc-auto-bar" style="display:none" class="xc-detect-bar">
        <div class="xc-detect-pulse"></div>
        <div style="flex:1;font-size:.85rem;font-weight:600;color:var(--text)" id="xc-detect-status">Setting up…</div>
        <input type="range" id="xc-sensitivity" min="8" max="55" value="22"
          style="width:70px" title="Sensitivity"
          oninput="xcDiffThreshold=+this.value;document.getElementById('xc-sens-val').textContent=this.value"
          >
        <span id="xc-sens-val" style="font-size:.7rem;color:var(--muted);min-width:18px">22</span>
        <button class="btn btn-secondary btn-sm" onclick="xcStopAutoMode()" style="font-size:.7rem">✕ Off</button>
      </div>
      <!-- Auto-detect mode button -->
      <button id="xc-auto-mode-btn" class="btn btn-secondary btn-sm"
        style="width:100%;border-radius:0;border-left:none;border-right:none;border-top:none;padding:8px;font-size:.8rem"
        onclick="xcStartAutoMode()">🎯 Switch to Auto-Detect (no tapping)</button>
      <!-- Finisher list -->
      <div style="flex:1;overflow-y:auto;padding:10px 16px" id="marshal-finishes-wrap">
        <div id="marshal-finishes-list"></div>
        <div class="text-center mt-8">
          <button class="btn btn-icon btn-sm" onclick="marshalUndo()">↩ Undo last</button>
        </div>
      </div>

      <!-- Inline bib numpad -->
      <div id="marshal-bib-pad" class="hidden"
        style="flex-shrink:0;padding:14px 16px 16px;background:var(--surface-2);border-top:2px solid var(--accent)">
        <!-- Finish photo preview -->
        <div class="finish-photo-wrap" id="finish-photo-wrap">
          <div class="finish-photo-capturing" id="finish-photo-status">📷 Capturing…</div>
          <img id="finish-photo-img" src="" style="display:none">
        </div>
        <!-- Bib label + OCR row -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="font-size:0.82rem;font-weight:700;color:var(--text);flex:1"
            id="marshal-bib-for">Enter bib for 1st place</div>
          <button class="btn btn-secondary btn-sm" id="ocr-btn" onclick="runBibOCR()" style="flex-shrink:0;font-size:0.72rem">🔍 Auto</button>
        </div>
        <div style="font-size:2.2rem;font-weight:700;color:var(--accent);letter-spacing:0.12em;min-height:2.6rem;margin-bottom:8px"
          id="marshal-bib-display">_</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:280px">
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('1')">1</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('2')">2</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('3')">3</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('4')">4</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('5')">5</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('6')">6</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('7')">7</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('8')">8</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('9')">9</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem;color:var(--danger)" onclick="bibBack()">⌫</button>
          <button class="btn btn-secondary" style="padding:14px;font-size:1.1rem" onclick="bibDigit('0')">0</button>
          <button class="btn btn-primary" style="padding:14px;font-size:1.1rem" onclick="bibConfirm()">✓</button>
        </div>
        <button class="btn btn-secondary btn-sm" style="width:100%;max-width:280px;margin-top:8px" onclick="bibSkip()">Skip — bib unknown</button>
      </div>
      <!-- Big tap button — always at bottom (thumb zone), tappable even while bib pad is open -->
      <button class="btn-tap" id="marshal-tap-btn" onclick="marshalTap()"
        style="flex-shrink:0;border-radius:0;margin:0;width:100%">
        <span class="tap-main" id="marshal-clock-mini">0:00.00</span>
        <span class="tap-sub" id="marshal-tap-sub">TAP FINISH</span>
      </button>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: XC ADMIN
════════════════════════════════════════ -->
<div id="screen-admin-xc" class="screen">
  <div class="header">
    <div class="conn-dot" id="xc-admin-dot"></div><span id="xc-admin-dot-lbl" style="font-size:0.65rem;font-weight:700;letter-spacing:.05em;color:var(--muted)"></span>
    <div class="header-title">XC Race Control</div>
    <div class="header-right"><span class="text-xs text-muted" id="xc-admin-school-lbl"></span></div>
  </div>
  <div class="content">

    <!-- Setup -->
    <div id="xc-setup-panel">
      <div class="card">
        <div class="card-title">Race Setup</div>
        <div class="form-group">
          <label>Age Group</label>
          <select id="xc-age-sel"></select>
        </div>
        <div class="form-group">
          <label>Gender</label>
          <div class="pill-row">
            <div class="pill active" data-xcg="boys" onclick="selectXCGender('boys')">Boys</div>
            <div class="pill" data-xcg="girls" onclick="selectXCGender('girls')">Girls</div>
            <div class="pill" data-xcg="mixed" onclick="selectXCGender('mixed')">Mixed</div>
          </div>
        </div>
        <div class="form-group mb-0">
          <label>Race / Distance</label>
          <select id="xc-event-sel"></select>
        </div>
      </div>
      <button class="btn btn-primary" onclick="xcAdminArm()">ARM RACE →</button>
    </div>

    <!-- Live -->
    <div id="xc-live-panel" class="hidden">
      <div class="card">
        <div class="flex items-center gap-8" style="margin-bottom:6px">
          <div id="xc-race-lbl" style="font-weight:700;font-size:1.05rem;flex:1"></div>
          <span id="xc-state-badge" class="badge badge-armed">ARMED</span>
        </div>
        <div class="clock" id="xc-admin-clock" style="font-size:3rem;padding:8px 0">0:00.00</div>
      </div>
      <div class="row">
        <button class="btn btn-go" id="xc-go-btn" onclick="xcAdminGo()">GO</button>
        <button class="btn btn-secondary" onclick="xcAdminRecall()">RECALL</button>
      </div>
      <div class="row mt-8">
        <button class="btn btn-secondary" onclick="xcAdminAbandon()">ABANDON</button>
        <button class="btn btn-primary hidden" id="xc-publish-btn" onclick="xcAdminPublish()"><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><rect x='8' y='2' width='8' height='4' rx='1' ry='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/></svg> Publish Results</button>
      </div>
      <hr class="divider">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div class="card-title" style="margin-bottom:0;flex:1">Finishers <span id="xc-count-lbl" class="text-muted text-xs"></span></div>
        <label style="font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:6px">
          🏅 Qual spots
          <input type="number" id="xc-qual-spots" value="10" min="0" max="99"
            style="width:52px;background:var(--surface3);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:3px 6px;font-size:0.82rem;text-align:center">
        </label>
      </div>
      <div id="xc-finishers-list"></div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: XC OBSERVER
════════════════════════════════════════ -->
<div id="screen-observer-xc" class="screen">
  <div class="header">
    <div class="conn-dot" id="xc-observer-dot"></div>
    <div class="header-title">XC Live Results</div>
    <div class="header-right"><span id="xc-observer-event-lbl" class="text-xs text-muted"></span></div>
  </div>
  <div class="content">
    <div class="clock" id="xc-observer-clock" style="font-size:2.8rem">0:00.00</div>
    <div id="xc-observer-places"></div>
    <div id="xc-observer-waiting" class="text-center text-muted mt-32">
      <div style="font-size:2.5rem"><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' style='vertical-align:middle'><path d='M12 22V8M5 8l7-6 7 6M3 22h18M9 22V16h6v6'/></svg></div>
      <div class="mt-8">Waiting for race to start...</div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: VIDEO FINISH
════════════════════════════════════════ -->
<div id="screen-video-finish" class="screen">
  <div class="header">
    <div class="conn-dot" id="vf-dot"></div><span id="vf-dot-lbl" style="font-size:0.65rem;font-weight:700;letter-spacing:.05em;color:var(--muted)"></span>
    <div>
      <div class="header-title">Video Finish</div>
      <div class="header-sub" id="vf-header-sub">Slit camera timing</div>
    </div>
    <div class="header-right">
      <span id="vf-badge" class="badge" style="display:none"></span>
      <button class="btn btn-icon btn-sm" onclick="vfExit()">← Back</button>
    </div>
  </div>
  <div class="content">

    <!-- Live camera with draggable slit line -->
    <canvas id="vf-live-canvas" class="vf-canvas" title="Drag to position slit line over finish line"></canvas>
    <video id="vf-video-preview" style="display:none" autoplay muted playsinline></video>

    <!-- Status bar -->
    <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
      <div id="vf-status-dot" style="width:10px;height:10px;border-radius:50%;background:var(--muted);flex-shrink:0"></div>
      <div id="vf-race-status" style="font-size:0.85rem;font-weight:600;color:var(--text);flex:1">Starting camera…</div>
      <div id="vf-detect-count" style="font-size:0.78rem;color:var(--muted)"></div>
    </div>

    <!-- Slit image (finish line photo) -->
    <div class="vf-slit-wrap">
      <canvas id="vf-slit-canvas" class="vf-slit-display"></canvas>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:3px">
      <span id="vf-slit-lbl-left" style="font-size:0.7rem;color:var(--muted)">← earlier</span>
      <span style="font-size:0.7rem;color:var(--muted);font-weight:600">FINISH LINE PHOTO</span>
      <span id="vf-slit-lbl-right" style="font-size:0.7rem;color:var(--muted)">now →</span>
    </div>

    <!-- Controls -->
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center">
      <button id="vf-cam-flip-btn" class="btn btn-secondary" style="font-size:0.8rem;padding:6px 10px" title="Switch camera" onclick="vfFlipCamera()">📷↕</button>
      <div style="display:flex;align-items:center;gap:6px;flex:1">
        <span style="font-size:0.78rem;color:var(--muted);white-space:nowrap">Sensitivity</span>
        <input type="range" id="vf-sensitivity" min="1" max="10" value="6" style="flex:1;accent-color:var(--accent)">
        <span id="vf-sens-val" style="font-size:0.78rem;color:var(--muted);min-width:16px">6</span>
      </div>
      <button class="btn btn-secondary" style="font-size:0.78rem;padding:6px 10px" onclick="vfExportSlit()" title="Save finish line photo">💾 Photo</button>
    </div>

    <!-- Offset -->
    <div style="display:flex;align-items:center;gap:8px;margin-top:10px;padding:8px 10px;background:var(--surface-2);border-radius:8px">
      <div style="flex:1;font-size:0.76rem;color:var(--muted)">Camera lag offset (ms)</div>
      <input type="number" id="vf-offset-input" value="0" min="0" max="999"
        style="width:52px;padding:4px 6px;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:0.85rem;text-align:center">
      <div style="font-size:0.76rem;color:var(--muted)">Progress top</div>
      <input type="number" id="vf-progress-input" value="2" min="1" max="8"
        style="width:42px;padding:4px 6px;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:0.85rem;text-align:center">
    </div>

    <!-- Results -->
    <div style="margin-top:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">Finishes</div>
        <button class="btn btn-secondary" style="font-size:0.72rem;padding:4px 10px" onclick="vfManualAdd()">+ Add Manual</button>
      </div>
      <div id="vf-mark-list"><div class="text-muted text-sm text-center mt-8">Waiting for race…</div></div>
    </div>

    <!-- Publish -->
    <div style="margin-top:16px">
      <button id="vf-publish-btn" class="btn btn-primary" style="width:100%" onclick="vfPublish()">Publish Times →</button>
    </div>

  </div>
</div>
<!-- ════════════════════════════════════════
     SCREEN: JOIN PAGE (QR)
════════════════════════════════════════ -->
<div id="screen-share" class="screen">
  <div class="header">
    <div class="logo-badge">SP</div>
    <div class="header-title" id="share-school-name">Join Page</div>
    <div class="header-right">
      <button class="btn btn-icon btn-sm" onclick="enterRole('role')">← Back</button>
    </div>
  </div>
  <div class="content text-center">
    <div class="card">
      <div class="card-title">Scan to Join</div>
      <div class="qr-wrap"><div id="share-qr" style="width:180px;height:180px;padding:8px;background:#161b22;border-radius:6px;"></div></div>
      <div class="text-muted text-sm mt-8" id="share-carnival-name"></div>
    </div>
    <div class="card-title text-muted mt-8">Or enter this code</div>
    <div class="join-code" id="share-join-code"></div>
    <div class="text-muted text-xs mt-8">Open carnivaltiming.com and tap "Join Carnival"</div>
  </div>
</div>

<!-- ════════════════════════════════════════
     SCREEN: RESULTS
════════════════════════════════════════ -->
<div id="screen-results" class="screen">
  <div class="header">
    <div class="logo-badge">SP</div>
    <div class="header-title">Results</div>
    <div class="header-right">
      <button class="btn btn-icon btn-sm" onclick="exportCSV()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> CSV</button>
    </div>
  </div>
  <div class="content">
    <div id="results-all" class="text-muted text-center mt-32">Loading...</div>
  </div>
</div>

<!-- ════════════════════════════════════════
     OVERLAYS
════════════════════════════════════════ -->
<div id="countdown-overlay">
  <div id="countdown-num" style="color:var(--text)">3</div>
  <div id="countdown-label">Get set...</div>
</div>

<div id="flash-overlay"></div>
<div id="tap-flash"></div>
<div id="toast"></div>

<div class="modal-backdrop" id="modal-bd">
  <div class="modal">
    <div class="modal-title" id="modal-ttl"></div>
    <div class="modal-body" id="modal-bdy"></div>
    <div class="stack" id="modal-btns-wrap"></div>
  </div>
</div>

<!-- ════════════════════════════════════════
     FIREBASE SDK
════════════════════════════════════════ -->
<script>
    // Inlined QRCode generator (davidshimjs/qrcodejs 1.0.0) — no external dependency
    var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();
  </script>

<!-- ════════════════════════════════════════
     APP SCRIPT
════════════════════════════════════════ -->
<script>
'use strict';

// ── WebSocket shim (replaces Firebase + Realtime DB) ─────────────────────
// ── WebSocket shim (replaces Firebase Realtime Database) ──────
// v4: hibernatable DO backend + seq-based gap detection
const WS_HOST = 'ws.carnivaltiming.com'; // Add CNAME ws→carnival-timing-ws.pgallivan.workers.dev in CF dashboard
let _ws=null,_wsCode=null,_wsReady=false,_reqId=0,_msgBuf=[];
let _pendingReqs=new Map(), _subscriptions=new Map(), _reconnTimer=null;
// seq tracking: last seq seen per path; if incoming seq > lastSeq+1 we missed
// updates — re-subscribe to force a fresh snapshot from the DO.
const _lastSeq=new Map();

function _nextId(){ return String(++_reqId); }

// ── Pending-split safety net ──────────────────────────────────────────────
function _savePendingSplit(lane, key, payload) {
  try {
    const q = JSON.parse(localStorage.getItem('_pendingSplits') || '[]');
    if (!q.find(e => e.key === key)) q.push({ lane, key, payload, carnivalCode });
    localStorage.setItem('_pendingSplits', JSON.stringify(q));
  } catch(e) {}
}
function _clearPendingSplit(key) {
  try {
    const q = JSON.parse(localStorage.getItem('_pendingSplits') || '[]');
    localStorage.setItem('_pendingSplits', JSON.stringify(q.filter(e => e.key !== key)));
  } catch(e) {}
}
async function _retryPendingSplits() {
  try {
    const q = JSON.parse(localStorage.getItem('_pendingSplits') || '[]');
    if (!q.length) return;
    for (const e of q) {
      if (e.carnivalCode !== carnivalCode) continue;
      try {
        await cRef(\`race/current/splits/\${e.lane}/\${e.key}\`).set(e.payload);
        _clearPendingSplit(e.key);
        toast('Saved split sent ✓');
      } catch(err) {}
    }
  } catch(e) {}
}

function _wsConnectTo(code){
  if(_ws && _wsCode===code && (_ws.readyState===0||_ws.readyState===1)) return;
  if(_ws){try{_ws.onclose=null;_ws.close();}catch{}}
  _wsCode=code; _wsReady=false;
  _ws=new WebSocket(\`wss://\${WS_HOST}/ws/\${code}\`);
  _ws.onopen=()=>{
    _wsReady=true; clearTimeout(_reconnTimer);
    // Replay any writes buffered while disconnected
    _msgBuf.splice(0).forEach(m=>_ws.send(m));
    // Retry any splits that were lost during a previous disconnect
    setTimeout(_retryPendingSplits, 300);
    // Re-subscribe to all paths — DO sends a fresh snapshot for each,
    // which handles any gap accumulated during the disconnection.
    for(const p of _subscriptions.keys()) if(!p.startsWith('__'))
      _ws.send(JSON.stringify({type:'subscribe',path:p}));
    _notifyConn(true);
  };
  _ws.onclose=_ws.onerror=()=>{
    _wsReady=false; _notifyConn(false);
    for(const [,r] of _pendingReqs){clearTimeout(r.timer);r.reject(new Error('ws closed'));}
    _pendingReqs.clear();
    if(_wsCode) _reconnTimer=setTimeout(()=>_wsConnectTo(_wsCode),2500);
  };
  _ws.onmessage=({data})=>{
    const msg=JSON.parse(data);
    // Resolve pending request (get/set/update/push/etc.)
    if(msg.id && _pendingReqs.has(msg.id)){
      const r=_pendingReqs.get(msg.id);
      clearTimeout(r.timer);_pendingReqs.delete(msg.id);r.resolve(msg);
    }
    if(msg.type==='snapshot' && msg.path!=null){
      // Gap detection: if seq jumped, we re-subscribe to get authoritative state.
      // (Snapshots already carry full state so the re-subscribe snapshot fixes it.)
      if(msg.seq!=null){
        const last=_lastSeq.get(msg.path);
        if(last!=null && msg.seq > last+1 && _wsReady){
          // Gap detected — re-subscribe immediately for a guaranteed fresh snapshot
          _ws.send(JSON.stringify({type:'subscribe',path:msg.path}));
        }
        _lastSeq.set(msg.path, msg.seq);
      }
      const cbs=_subscriptions.get(msg.path);
      if(cbs){const s=_snap(msg.path,msg.data);cbs.forEach(c=>c(s));}
    }
  };
}
function _wsReady2(){ return new Promise((res,rej)=>{ if(_wsReady)return res(); const t=setTimeout(()=>rej(new Error('ws timeout')),8000); const iv=setInterval(()=>{if(_wsReady){clearTimeout(t);clearInterval(iv);res();}},50); }); }
function _notifyConn(v){
  const banner = document.getElementById('reconnect-banner');
  if (banner) banner.style.display = v ? 'none' : 'block';
  const cbs=_subscriptions.get('__connected__');if(cbs){const s=_snap('connected',v);cbs.forEach(c=>c(s));}
}
function _snap(path,data){ return {val:()=>data, exists:()=>data!=null, key:path.split('/').pop()}; }
function _send(msg){ return new Promise((res,rej)=>{ const id=_nextId();msg.id=id;const str=JSON.stringify(msg);const timer=setTimeout(()=>{_pendingReqs.delete(id);rej(new Error('ws timeout'));},10000);_pendingReqs.set(id,{resolve:res,reject:rej,timer}); if(_wsReady)_ws.send(str);else _msgBuf.push(str); }); }
function _ref(path){ return { once:()=>_send({type:'get',path}).then(r=>_snap(path,r.data)), set:(v)=>_send({type:'set',path,data:v}), update:(v)=>_send({type:'update',path,data:v}), push:(v)=>_send({type:'push',path,data:v}).then(r=>({key:r.key})), remove:()=>_send({type:'remove',path}), on:(ev,cb)=>{ if(!_subscriptions.has(path))_subscriptions.set(path,new Set()); _subscriptions.get(path).add(cb); if(_wsReady)_ws.send(JSON.stringify({type:'subscribe',path})); _send({type:'get',path}).then(r=>cb(_snap(path,r.data))).catch(()=>{}); }, off:()=>{ _subscriptions.delete(path); if(_wsReady)_ws.send(JSON.stringify({type:'unsubscribe',path})); } }; }
const firebase={database:{ServerValue:{TIMESTAMP:{'.sv':'timestamp'}}}};
const db={ref:(path)=>{
  if(path==='.info/serverTimeOffset') return {once:async()=>{const r=await _send({type:'servertime'});return _snap(path,r.ts-Date.now());}};
  if(path==='.info/connected') return {on:(ev,cb)=>{ if(!_subscriptions.has('__connected__'))_subscriptions.set('__connected__',new Set()); _subscriptions.get('__connected__').add(cb); cb(_snap(path,_wsReady)); }};
  return _ref(path);
}};
const __fbAuthReady = Promise.resolve();

// ── State ──
let _carnivalCodeVal = '';
Object.defineProperty(window, 'carnivalCode', {
  get: () => _carnivalCodeVal,
  set: (v) => { _carnivalCodeVal = v; if(v) _wsConnectTo(v); }
});
let carnivalMeta = null;
let myName = localStorage.getItem('fl_name') || '';
let myId   = localStorage.getItem('fl_id') || genId(8);
localStorage.setItem('fl_id', myId);
let myLane = 0;
let serverOffset = 0;
let wakeLock = null;
let rafId = null;
let raceState = null;
let xcState   = null;
let adminGender = 'boys';
let xcGender    = 'boys';
let selSport = 'track';
let selTier  = 'school';
let activeListeners = [];
let countdownRunning = false;
let dqSet = new Set();
let dnsSet = new Set();
let dnfSet = new Set();
let programIndex = 0;
// Program builder rows
const programRows = [];
function addProgramRow(age='', gender='boys', event='') {
  const id = Date.now() + Math.random();
  programRows.push(id);
  const container = document.getElementById('program-rows');
  if (!container) return;
  const row = document.createElement('div');
  row.id = \`prog-row-\${id}\`;
  row.style.cssText = 'display:grid;grid-template-columns:1fr 90px 1fr 28px;gap:5px;margin-bottom:6px;align-items:center';
  row.innerHTML = \`<input class="prog-age" data-pid="\${id}" placeholder="9 Years" value="\${age}"
      style="padding:7px 8px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:.82rem;width:100%">
    <select class="prog-gender" data-pid="\${id}"
      style="padding:7px 6px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:.82rem;width:100%">
      <option value="boys" \${gender==='boys'?'selected':''}>Boys</option>
      <option value="girls" \${gender==='girls'?'selected':''}>Girls</option>
      <option value="mixed" \${gender==='mixed'?'selected':''}>Mixed</option>
    </select>
    <input class="prog-event" data-pid="\${id}" placeholder="100m" value="\${event}"
      style="padding:7px 8px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:.82rem;width:100%">
    <button type="button" onclick="removeProgramRow(\${id})"
      style="background:none;border:none;color:var(--muted);font-size:1rem;cursor:pointer;padding:4px;border-radius:6px">✕</button>\`;
  container.appendChild(row);
}
function removeProgramRow(id) {
  const idx = programRows.indexOf(id);
  if (idx > -1) programRows.splice(idx, 1);
  document.getElementById(\`prog-row-\${id}\`)?.remove();
}
function getProgramData() {
  return programRows.map(id => ({
    age: document.querySelector(\`.prog-age[data-pid="\${id}"]\`)?.value.trim()||'',
    gender: document.querySelector(\`.prog-gender[data-pid="\${id}"]\`)?.value||'boys',
    event: document.querySelector(\`.prog-event[data-pid="\${id}"]\`)?.value.trim()||''
  })).filter(r => r.age && r.event);
} // lanes DQ'd in current done panel

// ── Event Lists ──
const EVENTS = {
  track: ['100m Sprint','200m Sprint','400m','800m','1500m','4×100m Relay','Long Jump','Triple Jump','High Jump','Shot Put','Discus','Javelin'],
  swim:  ['50m Freestyle','50m Backstroke','50m Breaststroke','50m Butterfly','100m Freestyle','100m Backstroke','100m Breaststroke','200m Freestyle','4×50m Freestyle Relay','4×50m Medley Relay'],
  xc:    ['Cross Country 2km','Cross Country 3km','Cross Country 4km','Cross Country 5km','Fun Run 1km','Fun Run 2km','Fun Run 3km'],
  mixed: ['100m Sprint','200m Sprint','400m','800m','50m Freestyle','50m Backstroke','Cross Country 2km','Cross Country 3km','Long Jump','High Jump']
};
const AGE_GROUPS = ['9 Years','10 Years','11 Years','12/13 Years','Open','Year 3/4','Year 5/6','Year 3–6'];
const LANE_COUNT = 8;

// ════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════
function genId(n=8) {
  return Math.random().toString(36).substring(2, 2+n).toUpperCase();
}

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let c = '';
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function fmtMs(ms) {
  if (ms == null || ms < 0) return '—';
  const totalCs = Math.floor(ms / 10);
  const cs  = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  if (min > 0) return \`\${min}:\${pad(sec)}.\${pad(cs)}\`;
  return \`\${sec}.\${pad(cs)}\`;
}

function fmtSec(ms) {
  if (ms == null) return '—';
  return (ms / 1000).toFixed(2) + 's';
}

function pad(n) { return String(n).padStart(2,'0'); }

function nowServer() { return Date.now() + serverOffset; }

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function trimmedMean(values) {
  if (!values || values.length === 0) return null;
  if (values.length <= 2) return values.reduce((a,b)=>a+b,0)/values.length;
  const sorted = [...values].sort((a,b)=>a-b);
  const inner = sorted.slice(1,-1);
  return inner.reduce((a,b)=>a+b,0)/inner.length;
}

function confidenceFor(splitsObj) {
  const vals = Object.values(splitsObj||{}).map(s=>s.elapsedMs).filter(Boolean);
  if (vals.length === 0) return { cls:'LOW', label:'No timers' };
  if (vals.length === 1) return { cls:'CHECK', label:'1 timer' };
  const spread = Math.max(...vals) - Math.min(...vals);
  if (vals.length >= 3 && spread < 300) return { cls:'HIGH', label:'HIGH' };
  if (vals.length >= 2 && spread < 600) return { cls:'OK', label:'OK' };
  if (spread < 1500) return { cls:'CHECK', label:'CHECK' };
  return { cls:'LOW', label:'DISAGREE' };
}

function fbEnc(s) {
  return String(s).replace(/\\./g,'__D__').replace(/\\//g,'__S__')
    .replace(/\\[/g,'__LB__').replace(/\\]/g,'__RB__')
    .replace(/#/g,'__H__').replace(/\\$/g,'__$__');
}

// ── UI helpers ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (el) { el.classList.add('active'); window.scrollTo(0,0); }
}

function toast(msg, dur=2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), dur);
}

function modal(title, body, buttons) {
  document.getElementById('modal-ttl').textContent = title;
  document.getElementById('modal-bdy').textContent = body;
  const wrap = document.getElementById('modal-btns-wrap');
  wrap.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (b.cls||'btn-secondary');
    btn.textContent = b.label;
    btn.onclick = () => { closeModal(); b.fn && b.fn(); };
    wrap.appendChild(btn);
  });
  document.getElementById('modal-bd').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-bd').classList.remove('active');
}

function vibrate(pat) { try { navigator.vibrate && navigator.vibrate(pat); } catch(e){} }

function flash(type, dur=450) {
  const el = document.getElementById('flash-overlay');
  el.className = type;
  setTimeout(()=>el.className='', dur);
}

function tapFlash() {
  const el = document.getElementById('tap-flash');
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 180);
}

// ── Clock sync ──
async function syncClock() {
  const snap = await db.ref('.info/serverTimeOffset').once('value');
  serverOffset = snap.val() || 0;
}

async function getServerTime() {
  const snap = await db.ref('.info/serverTimeOffset').once('value');
  return Date.now() + (snap.val() || 0);
}

// ── Wake lock ──
async function requestWakeLock() {
  try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); }
  catch(e){}
}

// Re-acquire wake lock when tab comes back to foreground
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestWakeLock();
});

// Warn before closing if race is live
window.addEventListener('beforeunload', e => {
  if (raceState?.state === 'live') {
    e.preventDefault();
    e.returnValue = 'A race is currently live — timing data may be lost if you leave.';
  }
});

// ── Firebase helpers ──
function cRef(path) { return db.ref(path); }

function cleanListeners() {
  activeListeners.forEach(fn=>fn());
  activeListeners = [];
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

function watchConn(dotId) {
  db.ref('.info/connected').on('value', snap => {
    const el  = document.getElementById(dotId);
    const txt = document.getElementById(dotId + '-lbl');
    const live = snap.val() === true;
    if (el)  el.classList.toggle('live', live);
    if (txt) { txt.textContent = live ? 'LIVE' : 'OFFLINE'; txt.style.color = live ? 'var(--success)' : 'var(--danger)'; }
  });
}

// ════════════════════════════════════════
// SETUP SCREEN
// ════════════════════════════════════════
function selectSport(s) {
  selSport = s;
  document.querySelectorAll('.sport-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector(\`.sport-btn[data-sport="\${s}"]\`).classList.add('active');
}

function selectTier(t) {
  selTier = t;
  document.querySelectorAll('.pill[data-tier]').forEach(p=>p.classList.remove('active'));
  document.querySelector(\`.pill[data-tier="\${t}"]\`).classList.add('active');
}

// ════════════════════════════════════════
// DEMO MODE
// ════════════════════════════════════════
const DEMO_ATHLETES = ['Aiden Smith','Ben Carter','Chris Lee','Dana Park','Emma White','Finn Taylor','Gus Brown','Harper Jones'];

async function startDemo() {
  toast('Setting up demo…');
  let code, snap;
  do {
    code = genCode();
    carnivalCode = code; await _wsReady2(); snap = await db.ref('meta').once('value');
  } while (snap.exists());

  carnivalCode = code;
  carnivalMeta = {
    school: 'Demo Carnival',
    name: '100m Sprint Demo',
    sport: 'track',
    tier: 'school',
    colour: '#f59e0b',
    isDemo: true,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  };
  applyAccent('#f59e0b');
  await db.ref('meta').set(carnivalMeta);
  localStorage.setItem('fl_last_code', code);

  showScreen('admin');
  initAdminView();

  // Pre-fill athlete names and scroll demo banner into view
  setTimeout(() => {
    document.querySelectorAll('.admin-lane-name-input').forEach((inp, i) => {
      if (DEMO_ATHLETES[i]) inp.value = DEMO_ATHLETES[i];
    });
    const banner = document.getElementById('admin-demo-banner');
    if (banner) banner.scrollIntoView({behavior:'smooth', block:'start'});
    toast(\`Demo ready — \${code}. Share the code or QR with your timers, then arm the race.\`);
  }, 300);
}

function copyDemoCode() {
  const code = document.getElementById('demo-code-display').textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => toast('Code copied'));
  } else {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = code; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    toast('Code copied');
  }
}

function initDemoBanner() {
  if (!carnivalMeta?.isDemo) return;
  const banner = document.getElementById('admin-demo-banner');
  if (!banner) return;
  banner.classList.remove('hidden');

  const codeEl = document.getElementById('demo-code-display');
  if (codeEl) codeEl.textContent = carnivalCode;

  const joinUrl = \`https://carnivaltiming.com/?join=\${carnivalCode}\`;
  const qrEl = document.getElementById('demo-qr-canvas');
  if (qrEl && typeof QRCode !== 'undefined') {
    qrEl.innerHTML = '';
    new QRCode(qrEl, { text: joinUrl, width: 128, height: 128,
      colorDark: '#000000', colorLight: '#ffffff' });
  }
}

async function createCarnival() {
  const school = document.getElementById('setup-school').value.trim();
  const name   = document.getElementById('setup-name').value.trim();
  if (!school || !name) { toast('Enter school name and event name'); return; }

  const colour = document.getElementById('setup-colour').value.trim() || '#14b8a6';
  applyAccent(colour);

  // Find unique code
  let code, snap;
  do {
    code = genCode();
    carnivalCode = code; await _wsReady2(); snap = await db.ref('meta').once('value');
  } while (snap.exists());

  carnivalCode = code;
  const housesRaw = document.getElementById('setup-houses')?.value.trim()||'';
  const houses = housesRaw ? housesRaw.split(',').map(h=>h.trim()).filter(Boolean) : [];
  const program = getProgramData();
  carnivalMeta = { school, name, sport:selSport, tier:selTier, colour,
    houses, program,
    createdAt: firebase.database.ServerValue.TIMESTAMP };

  await db.ref('meta').set(carnivalMeta);
  localStorage.setItem('fl_last_code', code);

  toast(\`Carnival created — \${code}\`);
  showRolePicker();
  // Admin auto-navigates to their control panel
  setTimeout(() => enterRole('admin'), 600);
}

function applyAccent(colour) {
  if (!colour || !/^#[0-9a-fA-F]{3,6}$/.test(colour)) return;
  document.documentElement.style.setProperty('--accent', colour);
}

// ════════════════════════════════════════
// JOIN
// ════════════════════════════════════════
async function joinCarnival(roleHint) {
  const code = document.getElementById('join-code-input').value.trim().toUpperCase();
  const name = document.getElementById('join-name-input').value.trim();
  const isObserver = roleHint === 'observer';
  if (code.length < 4) { toast('Enter 4-letter code'); return; }
  if (!name && !isObserver) { toast('Enter your name'); return; }

  carnivalCode = code; await _wsReady2(); const snap = await db.ref('meta').once('value');
  const errEl = document.getElementById('join-error');
  if (!snap.exists()) {
    errEl.textContent = 'Carnival not found — check the code';
    errEl.classList.remove('hidden');
    return;
  }
  errEl.classList.add('hidden');

  carnivalCode = code;
  carnivalMeta = snap.val();
  myName = name;
  localStorage.setItem('fl_name', name);
  localStorage.setItem('fl_last_code', code);
  if (carnivalMeta.colour) applyAccent(carnivalMeta.colour);

  if (isObserver) { enterRole('observer'); return; }
  showRolePicker();
}

// ════════════════════════════════════════
// ROLE PICKER
// ════════════════════════════════════════
function showRolePicker() {
  document.getElementById('role-school-name').textContent = carnivalMeta?.school || 'Carnival Timing';
  document.getElementById('role-carnival-name').textContent = carnivalMeta?.name || '';
  document.getElementById('role-joined-name').textContent = carnivalMeta?.name || '';
  document.getElementById('role-joined-code').textContent = \`Code: \${carnivalCode}\`;
  const expiresNote = document.getElementById('role-expires-note');
  if (expiresNote && carnivalMeta?.expiresAt) {
    const daysLeft = Math.ceil((carnivalMeta.expiresAt - Date.now()) / 86400000);
    if (daysLeft > 0) {
      expiresNote.textContent = \`Expires in \${daysLeft} day\${daysLeft===1?'':'s'}\`;
      expiresNote.style.display = '';
    } else {
      expiresNote.textContent = 'This carnival has expired';
      expiresNote.style.color = 'var(--warn)';
      expiresNote.style.display = '';
    }
  }

  const sport = carnivalMeta?.sport || 'track';
  const grid = document.getElementById('role-grid');
  const roles = [];

  if (['track','swim','mixed'].includes(sport)) {
    roles.push({ id:'timer',    icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>', label:'Timer',        desc:'Time a lane' });
    roles.push({ id:'admin',    icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>', label:'Race Control', desc:'Arm & manage races' });
    roles.push({ id:'starter',  icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>', label:'Starter',      desc:'Fire the gun' });
    roles.push({ id:'observer', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>', label:'Observer',     desc:'Watch live results' });
  }
  if (['xc','mixed'].includes(sport)) {
    roles.push({ id:'marshal',   icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><path d="M12 22V8M5 8l7-6 7 6M3 22h18M9 22V16h6v6"/></svg>', label:'Finish Marshal', desc:'Tap each finisher',     full: sport==="xc" });
    roles.push({ id:'admin-xc',  icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>', label:'XC Control',    desc:'Arm & manage XC races', full: sport==='xc' });
    roles.push({ id:'observer-xc',icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',label:'XC Observer',   desc:'Watch finish order',    full: sport==='xc' });
  }
  if (['track','swim','mixed'].includes(sport)) {
    roles.push({ id:'video-finish', icon:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>', label:'Video Finish', desc:'Slit camera — pro finish line photo + auto-detect + Roster pre-load', full:true });
  }
  roles.push({ id:'share',   icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>', label:'Join Page',  desc:'QR code for participants', full:true });
  roles.push({ id:'results', icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', label:'Results',    desc:'View all results',          full:true });

  grid.innerHTML = roles.map(r => \`
    <div class="role-card\${r.full?' full':''}" onclick="enterRole('\${r.id}')">
      <div class="r-icon">\${r.icon}</div>
      <div class="r-label">\${r.label}</div>
      <div class="r-desc">\${r.desc}</div>
    </div>\`).join('');

  showScreen('role');
}


// ═══════════════════════════════════════════
// ADMIN PIN
// ═══════════════════════════════════════════
function _checkAdminPin(onSuccess) {
  const storedPin = carnivalMeta?.adminPin;
  if (!storedPin) {
    // No PIN set client-side — server will auto-grant; offer to set one after entry
    _send({type:'auth', pin: null})
      .then(r => { if (r.type === 'auth_ok') { onSuccess(); _offerSetPin(); } })
      .catch(() => { onSuccess(); _offerSetPin(); }); // fallback if WS not ready
    return;
  }
  _pinModal('Enter Admin PIN', async (entered) => {
    if (entered === null) return; // cancelled
    try {
      const r = await _send({type: 'auth', pin: String(entered)});
      if (r.type === 'auth_ok') {
        onSuccess();
      } else if (r.message === 'too_many_attempts') {
        toast('Too many failed attempts — reconnect and try again.');
      } else {
        toast('Incorrect PIN');
      }
    } catch {
      toast('Connection error — try again.');
    }
  });
}

async function _offerSetPin() {
  // Non-blocking nudge — shown after admin loads, uses custom modal (no confirm())
  setTimeout(() => {
    if (carnivalMeta?.adminPin) return; // already set by now
    const el = document.createElement('div');
    el.id = 'offer-pin-modal';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    el.innerHTML = \`
      <div style="background:var(--surface);border-radius:16px;padding:20px;max-width:300px;width:100%;text-align:center">
        <div style="font-weight:700;font-size:1rem;margin-bottom:8px">Protect Race Control?</div>
        <div style="color:var(--muted);font-size:.85rem;margin-bottom:16px">Set a 4-digit PIN so only you can access Race Control on this carnival.</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" style="flex:1" onclick="document.getElementById('offer-pin-modal')?.remove()">Skip</button>
          <button class="btn btn-primary" style="flex:1" onclick="document.getElementById('offer-pin-modal')?.remove();_pinModal('Choose a 4-digit PIN',async(pin)=>{if(pin===null||pin.length<1)return;carnivalMeta={...(carnivalMeta||{}),adminPin:String(pin)};await cRef('meta').update({adminPin:String(pin)});toast('PIN set ✓');},true)">Set PIN</button>
        </div>
      </div>\`;
    document.body.appendChild(el);
  }, 800);
}

function _pinModal(title, callback, isNew) {
  const el = document.createElement('div');
  el.id = 'pin-modal';
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  el.innerHTML = \`
    <div style="background:var(--surface);border-radius:16px;padding:20px;max-width:280px;width:100%;text-align:center">
      <div style="font-weight:700;font-size:1rem;margin-bottom:12px">\${title}</div>
      <div id="pin-display" style="font-size:2rem;letter-spacing:.4em;font-family:monospace;min-height:2.5rem;margin-bottom:12px">____</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px">
        \${[1,2,3,4,5,6,7,8,9].map(n=>\`<button class="btn btn-secondary" style="font-size:1.2rem;padding:12px 0" onclick="_pinKey('\${n}')">\${n}</button>\`).join('')}
        <button class="btn btn-secondary" style="font-size:1rem;padding:12px 0" onclick="_pinKey('del')">⌫</button>
        <button class="btn btn-secondary" style="font-size:1.2rem;padding:12px 0" onclick="_pinKey('0')">0</button>
        <button class="btn btn-secondary" style="font-size:1rem;padding:12px 0" onclick="_pinKey('ok')">OK</button>
      </div>
      <button class="btn btn-secondary" style="width:100%;margin-top:4px" onclick="_pinKey('cancel')">Cancel</button>
    </div>\`;
  document.body.appendChild(el);
  let pinVal = '';
  function refresh() {
    const disp = document.getElementById('pin-display');
    if (disp) disp.textContent = pinVal.split('').map(()=>'●').join(' ').padEnd(7,'_').replace(/ _ /g,' _ ') || '____';
  }
  window._pinKey = (k) => {
    if (k === 'cancel') { el.remove(); delete window._pinKey; callback(null); return; }
    if (k === 'del') { pinVal = pinVal.slice(0,-1); refresh(); return; }
    if (k === 'ok') {
      if (pinVal.length === 0) return;
      el.remove(); delete window._pinKey; callback(pinVal); return;
    }
    if (pinVal.length < 8) { pinVal += k; refresh(); }
    if (pinVal.length === 4 && !isNew) { el.remove(); delete window._pinKey; callback(pinVal); }
  };
}

function enterRole(role) {
  cleanListeners();
  if (role === 'timer') {
    document.getElementById('role-grid').style.display = 'none';
    const picker = document.getElementById('role-lane-picker');
    picker.classList.remove('hidden');
    picker.style.marginTop = '0';
    const btns = document.getElementById('lane-pick-btns');
    btns.innerHTML =
      \`<button class="btn btn-secondary" style="width:100%;margin-bottom:12px;font-size:0.9rem" onclick="showRolePicker()">← Back to roles</button>\` +
      Array.from({length:LANE_COUNT},(_,i)=>i+1)
        .map(n=>\`<button class="btn btn-primary" style="min-height:64px;font-size:1.2rem;font-weight:700;flex:1;min-width:80px" onclick="enterTimerLane(\${n})">Lane \${n}</button>\`)
        .join('');
    setTimeout(() => picker.scrollIntoView({behavior:'smooth', block:'start'}), 50);
    return;
  }
  if (role === 'share')   { showSharePage(); return; }
  if (role === 'admin')   { _checkAdminPin(() => { showScreen('admin'); initAdminView(); }); return; }
  if (role === 'starter') { showScreen('starter');     initStarterView();    return; }
  if (role === 'observer'){ showScreen('observer');    initObserverView();   return; }
  if (role === 'marshal') { showScreen('marshal');     initMarshalView();    return; }
  if (role === 'admin-xc'){ _checkAdminPin(() => { showScreen('admin-xc'); initXCAdminView(); }); return; }
  if (role === 'observer-xc'){ showScreen('observer-xc'); initXCObserverView(); return; }
  if (role === 'results')      { showScreen('results');      initResultsView();   return; }
  if (role === 'video-finish') { showScreen('video-finish'); initVideoFinish();   return; }
  if (role === 'role')         { showRolePicker();            return; }
}

function enterTimerLane(n) {
  myLane = n;
  cleanListeners();
  showScreen('timer');
  initTimerView(n);
}

// ════════════════════════════════════════
// TIMER VIEW (Lane Race)
// ════════════════════════════════════════
function initTimerView(lane) {
  requestWakeLock();
  syncClock();
  watchConn('timer-dot');

  document.getElementById('timer-lane-label').textContent = \`Lane \${lane}\`;

  // Name gate
  const nameInput = document.getElementById('timer-name-input');
  const stopBtn   = document.getElementById('timer-stop-btn');
  if (myName) { nameInput.value = myName; stopBtn.removeAttribute('disabled'); document.getElementById('timer-name-gate').style.display='none'; }
  nameInput.addEventListener('input', ()=>{
    myName = nameInput.value.trim();
    localStorage.setItem('fl_name', myName);
    myName ? stopBtn.removeAttribute('disabled') : stopBtn.setAttribute('disabled','');
  });

  const raceRef = cRef('race/current');
  raceRef.on('value', snap => { raceState = snap.val(); renderTimerView(lane, raceState); });
  activeListeners.push(()=>raceRef.off());

  cRef('recall').on('value', snap => { if (snap.val()?.active) flashRecall(); });
  activeListeners.push(()=>cRef('recall').off());

  function tick() {
    if (raceState?.state==='live' && raceState.startedAtServer) {
      const el = document.getElementById('timer-clock');
      if (el) el.textContent = fmtMs(nowServer() - raceState.startedAtServer);
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
}

function renderTimerView(lane, race) {
  const waiting  = document.getElementById('timer-waiting-msg');
  const mySplit  = document.getElementById('timer-my-split');
  const splitsCard = document.getElementById('timer-splits-card');
  const stopBtn  = document.getElementById('timer-stop-btn');
  const badge    = document.getElementById('timer-badge-wrap');

  const recallBanner = document.getElementById('timer-recall-banner');

  if (!race || race.state==='idle') {
    waiting.classList.remove('hidden');
    mySplit.classList.add('hidden');
    splitsCard.classList.add('hidden');
    if (recallBanner) recallBanner.classList.add('hidden');
    document.getElementById('timer-clock').textContent = '0:00.00';
    badge.innerHTML = \`<span class="badge badge-idle">IDLE</span>\`;
    return;
  }
  waiting.classList.add('hidden');

  if (recallBanner) {
    race.recalled ? recallBanner.classList.remove('hidden') : recallBanner.classList.add('hidden');
  }

  const sportLabel = carnivalMeta?.sport==="swim" ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><path d="M2 20s2-2 5-2 5 2 7 2 5-2 7-2 3 1 3 1M2 16s2-2 5-2 5 2 7 2 5-2 7-2 3 1 3 1"/><circle cx="14" cy="5" r="2"/></svg>' : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>';
  document.getElementById('timer-athlete-event').innerHTML =
    \`\${sportLabel} \${race.age||''} \${race.gender||''} · \${race.event||''}\`;

  const laneData = race.lanes?.[lane];
  document.getElementById('timer-athlete-name').textContent = laneData?.name || \`Lane \${lane}\`;
  document.getElementById('timer-athlete-note').textContent = laneData?.note || '';

  if (race.state==='armed') {
    badge.innerHTML = \`<span class="badge badge-armed">ARMED</span>\`;
    document.getElementById('timer-clock').textContent = '0:00.00';
  } else if (race.state==='live') {
    badge.innerHTML = \`<span class="badge badge-live">LIVE</span>\`;
  } else if (race.state==='done') {
    badge.innerHTML = \`<span class="badge badge-done">DONE</span>\`;
  }

  // My split
  const myRec = race.splits?.[lane]?.[fbEnc(myId)];
  if (myRec) {
    document.getElementById('timer-my-time').textContent = fmtSec(myRec.elapsedMs);
    mySplit.classList.remove('hidden');
    stopBtn.textContent = 'Stopped';
    stopBtn.setAttribute('disabled','');
  } else {
    mySplit.classList.add('hidden');
    if (race.state==='live') { stopBtn.textContent = 'STOP'; stopBtn.removeAttribute('disabled'); }
    const expBtns = document.getElementById('admin-export-btns');
    if (expBtns) { if (race.state==='done') { expBtns.style.display='flex'; expBtns.classList.remove('hidden'); } else { expBtns.style.display='none'; } }
  }

  // All splits this lane
  const laneSplits = race.splits?.[lane] || {};
  const splitVals = Object.values(laneSplits);
  if (splitVals.length) {
    splitsCard.classList.remove('hidden');
    document.getElementById('timer-splits-list').innerHTML = splitVals.map(s=>\`
      <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--surface3)">
        <span class="text-muted text-sm">\${s.name||'?'}</span>
        <span class="font-mono" style="font-weight:700">\${fmtSec(s.elapsedMs)}</span>
      </div>\`).join('');
  } else { splitsCard.classList.add('hidden'); }
}

async function timerStop() {
  if (!raceState || raceState.state!=='live') { toast('Race not live'); return; }
  if (!myName) { toast('Enter your name first'); return; }
  const elapsed = nowServer() - raceState.startedAtServer;
  if (elapsed < 500) { toast('Too quick — check start'); return; }
  const key = fbEnc(myId);
  const splitPayload = { name: myName, elapsedMs: elapsed, stopAt: firebase.database.ServerValue.TIMESTAMP };
  _savePendingSplit(myLane, key, splitPayload);
  const splitBtn = document.getElementById('timer-stop-btn');
  if (splitBtn) { splitBtn.textContent = 'Sending…'; splitBtn.setAttribute('disabled',''); }
  try {
    await cRef(\`race/current/splits/\${myLane}/\${key}\`).set(splitPayload);
    _clearPendingSplit(key);
    if (splitBtn) { splitBtn.textContent = 'Sent ✓'; }
  } catch(err) {
    if (splitBtn) { splitBtn.textContent = '⚠ Queued'; }
    toast('WiFi issue — split saved, will retry');
  }
  vibrate([100]);
  flash('go', 300);
  toast(\`Stopped — \${fmtSec(elapsed)}\`);
  // 3-second undo window
  _showTimerUndo(myLane, key, elapsed);
}

// ════════════════════════════════════════
// ADMIN VIEW (Lane Race)
// ════════════════════════════════════════

// ── Roster pre-load modal ─────────────────────────────────────────────────
function openRosterModal() {
  const el = document.createElement('div');
  el.id = 'roster-modal';
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:16px;padding-top:60px;overflow-y:auto';
  const ph = '1, Jake Smith, Red\n2, Sam Jones, Blue\n3, Mia Brown, Green';
  el.innerHTML = '<div style="background:var(--surface);border-radius:16px;padding:20px;max-width:420px;width:100%">'
    + '<div style="font-weight:700;font-size:1rem;margin-bottom:4px">Paste Athlete Roster</div>'
    + '<div style="color:var(--muted);font-size:.8rem;margin-bottom:10px">One per line: <strong>Lane, Name, House</strong><br>'
    + 'E.g. <code style="color:var(--accent)">1, Jake Smith, Red</code></div>'
    + '<textarea id="roster-text" placeholder="' + ph + '" style="width:100%;min-height:160px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:.85rem;font-family:monospace;resize:vertical"></textarea>'
    + '<div style="display:flex;gap:8px;margin-top:12px">'
    + '<button class="btn btn-primary" style="flex:1" onclick="applyRoster()">Apply to Lanes</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'roster-modal\').remove()">Cancel</button>'
    + '</div></div>';
  document.body.appendChild(el);
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
}

function applyRoster() {
  const text = document.getElementById('roster-text')?.value.trim();
  if (!text) return;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let applied = 0;
  lines.forEach(line => {
    const parts = line.split(',').map(p => p.trim());
    const lane = parseInt(parts[0]);
    const name = parts[1] || '';
    const house = parts[2] || '';
    if (!lane || !name) return;
    const nameInp = document.querySelector('.admin-lane-name-input[data-lane="' + lane + '"]');
    if (nameInp) { nameInp.value = name; applied++; }
    if (house) {
      const houseInp = document.querySelector('.admin-lane-house[data-lane="' + lane + '"]');
      if (houseInp) {
        const opts = Array.from(houseInp.options);
        const match = opts.find(o => o.value.toLowerCase() === house.toLowerCase());
        if (match) houseInp.value = match.value;
      }
    }
  });
  document.getElementById('roster-modal')?.remove();
  toast('\u2705 ' + applied + ' athlete' + (applied !== 1 ? 's' : '') + ' loaded into lanes');
  const age = document.getElementById('admin-age-sel')?.value;
  const event = document.getElementById('admin-event-sel')?.value;
  if (age && event) {
    const savedLanes = {};
    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      const l = parseInt(parts[0]); const n = parts[1]||''; const h = parts[2]||'';
      if (l && n) savedLanes[l] = { name:n, ...(h?{house:h}:{}) };
    });
    _saveLaneNames(age, adminGender, event, savedLanes);
  }
}

function initAdminView() {
  requestWakeLock(); syncClock();
  watchConn('admin-dot');
  document.getElementById('admin-school-lbl').textContent = carnivalMeta?.school||'';

  // Show carnival code in header + Share button
  const codeEl = document.getElementById('admin-code-lbl');
  if (codeEl) {
    codeEl.textContent = carnivalCode;
    codeEl.onclick = () => { try { navigator.clipboard.writeText(carnivalCode); toast('Code copied!'); } catch(e){} };
  }

  // Demo banner
  const banner = document.getElementById('admin-demo-banner');
  if (banner) banner.classList.add('hidden');
  if (carnivalMeta?.isDemo) initDemoBanner();

  // Populate dropdowns
  const ageSel = document.getElementById('admin-age-sel');
  ageSel.innerHTML = AGE_GROUPS.map(a=>\`<option>\${a}</option>\`).join('');
  const evSel = document.getElementById('admin-event-sel');
  const sport = carnivalMeta?.sport||'track';
  const evList = EVENTS[sport] || EVENTS.track;
  evSel.innerHTML = evList.map(e=>\`<option>\${e}</option>\`).join('');

  // Lane inputs
  const houses = carnivalMeta?.houses||[];
  const container = document.getElementById('admin-lane-inputs');
  container.innerHTML = Array.from({length:LANE_COUNT},(_,i)=>i+1).map(n=>\`
    <div class="admin-lane-row" id="alr-\${n}">
      <div class="admin-lane-num">\${n}</div>
      <input class="admin-lane-name-input" data-lane="\${n}"
        placeholder="Name or Bib #" type="text" style="flex:1">
      \${houses.length ? \`<select class="admin-lane-house" data-lane="\${n}"
          style="padding:6px 8px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:.82rem;max-width:90px">
          <option value="">House</option>
          \${houses.map(h=>\`<option value="\${h}">\${h}</option>\`).join('')}
        </select>\` : ''}
      <div style="display:flex;gap:4px">
        <button type="button" class="status-btn" data-lane="\${n}" data-stype="dns" onclick="toggleLaneStatus(\${n},'dns')">DNS</button>
        <button type="button" class="status-btn" data-lane="\${n}" data-stype="dnf" onclick="toggleLaneStatus(\${n},'dnf')">DNF</button>
      </div>
    </div>\`).join('');
  dnsSet.clear(); dnfSet.clear();
  // House standings
  const houseCard = document.getElementById('admin-house-card');
  if (houses.length && houseCard) {
    houseCard.style.display = '';
    const hpRef = cRef('housePoints');
    hpRef.on('value', snap => {
      const pts = snap.val()||{};
      const sorted = [...houses].map(h=>({h, pts:pts[h]||0})).sort((a,b)=>b.pts-a.pts);
      const total = sorted.reduce((s,r)=>s+r.pts,0);
      document.getElementById('admin-house-standings').innerHTML = sorted.map((r,i)=>\`
        <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:.9rem;min-width:18px">\${i===0&&total>0?'🥇':i===1&&total>0?'🥈':i===2&&total>0?'🥉':''}</span>
          <span style="flex:1;font-weight:\${i===0&&total>0?'700':'400'}">\${r.h}</span>
          <span style="font-weight:700;font-size:1.05rem;color:\${i===0&&total>0?'var(--accent)':'var(--text)'}">\${r.pts}</span>
        </div>\`).join('');
    });
    activeListeners.push(()=>hpRef.off());
  } else if (houseCard) { houseCard.style.display = 'none'; }
  // Program "Next Event" button
  const prog = carnivalMeta?.program||[];
  const nextBtn = document.getElementById('admin-next-event-btn');
  if (prog.length && nextBtn) { nextBtn.style.display = ''; programIndex = 0; }
  else if (nextBtn) { nextBtn.style.display = 'none'; }

  const raceRef = cRef('race/current');
  raceRef.on('value', snap=>{raceState=snap.val(); renderAdminView(raceState);});
  activeListeners.push(()=>raceRef.off());

  function tick() {
    if (raceState?.state==='live' && raceState.startedAtServer) {
      const el=document.getElementById('admin-live-clock');
      if(el) el.textContent=fmtMs(nowServer()-raceState.startedAtServer);
    }
    rafId=requestAnimationFrame(tick);
  }
  rafId=requestAnimationFrame(tick);
}

function selectAdminGender(g) {
  adminGender = g;
  document.querySelectorAll('[data-ag]').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll(\`[data-ag="\${g}"]\`).forEach(p=>p.classList.add('active'));
}

function renderAdminView(race) {
  const setup = document.getElementById('admin-setup-panel');
  const live  = document.getElementById('admin-live-panel');
  const done  = document.getElementById('admin-done-panel');

  if (!race || race.state==='idle') {
    setup.classList.remove('hidden'); live.classList.add('hidden'); done.classList.add('hidden'); return;
  }
  setup.classList.add('hidden');

  if (race.state==='done') {
    live.classList.add('hidden'); done.classList.remove('hidden');
    renderAdminDone(race); return;
  }

  live.classList.remove('hidden'); done.classList.add('hidden');
  document.getElementById('admin-race-lbl').textContent = \`\${race.age||''} \${race.gender||''} · \${race.event||''}\`;

  const badge  = document.getElementById('admin-state-badge');
  const goBtn  = document.getElementById('admin-go-btn');
  const pubBtn = document.getElementById('admin-publish-btn');

  if (race.state==='armed') {
    badge.className='badge badge-armed'; badge.textContent='ARMED';
    goBtn.removeAttribute('disabled'); pubBtn.classList.add('hidden');
    document.getElementById('admin-live-clock').textContent='0:00.00';
  } else if (race.state==='live') {
    badge.className='badge badge-live'; badge.textContent='LIVE';
    goBtn.setAttribute('disabled','');
  }

  // Splits
  const lanes = race.lanes||{};
  const splits = race.splits||{};
  let allTimed = Object.keys(lanes).length>0;

  document.getElementById('admin-splits-list').innerHTML = Array.from({length:LANE_COUNT},(_,i)=>i+1).map(n=>{
    if (!lanes[n]) return '';
    const laneSplits = splits[n]||{};
    const vals = Object.values(laneSplits).map(s=>s.elapsedMs).filter(Boolean);
    const mean = vals.length ? trimmedMean(vals) : null;
    const conf = confidenceFor(laneSplits);
    if (!mean) allTimed = false;
    return \`<div class="lane-row">
      <div class="lane-num">\${n}</div>
      <div class="lane-name">\${lanes[n]?.name||\`Lane \${n}\`}</div>
      \${mean ? \`<div><span class="lane-time">\${fmtSec(mean)}</span> <span class="conf-\${conf.cls}">\${conf.label}</span></div>\`
             : \`<span class="text-muted text-xs">\${race.state==='live'?'waiting…':'—'}</span>\`}
    </div>\`;
  }).join('');

  if (race.state==='live' && allTimed) pubBtn.classList.remove('hidden');
}

function toggleLaneStatus(lane, type) {
  const l = String(lane);
  const setA = type==='dns' ? dnsSet : dnfSet;
  const setB = type==='dns' ? dnfSet : dnsSet;
  if (setA.has(l)) { setA.delete(l); } else { setA.add(l); setB.delete(l); }
  // Update button styles
  document.querySelectorAll(\`.status-btn[data-lane="\${lane}"]\`).forEach(btn => {
    const t = btn.dataset.stype;
    btn.classList.remove('active-dns','active-dnf');
    if (t==='dns' && dnsSet.has(l)) btn.classList.add('active-dns');
    if (t==='dnf' && dnfSet.has(l)) btn.classList.add('active-dnf');
  });
}
function adminNextEvent() {
  const prog = carnivalMeta?.program||[];
  if (!prog.length) return;
  if (programIndex >= prog.length) { toast('🏁 Program complete!'); return; }
  const ev = prog[programIndex];
  // Set age
  const ageSel = document.getElementById('admin-age-sel');
  if (ageSel) ageSel.value = ev.age;
  selectAdminGender(ev.gender||'boys');
  // Set event
  const evSel = document.getElementById('admin-event-sel');
  if (evSel) evSel.value = ev.event;
  // Load saved lane names
  _loadLaneNames(ev.age, ev.gender||'boys', ev.event);
  const num = programIndex + 1;
  programIndex++;
  const remaining = prog.length - programIndex;
  const nextBtn = document.getElementById('admin-next-event-btn');
  if (nextBtn) nextBtn.textContent = remaining > 0 ? \`Next Event (\${remaining} left) →\` : 'Program Done';
  toast(\`Event \${num}/\${prog.length}: \${ev.age} \${ev.gender} — \${ev.event}\`);
}
async function adminResetHousePoints() {
  if (!await _confirmModal('Reset house points?', 'This will clear all accumulated house points for this carnival.', 'Reset')) return;
  await cRef('housePoints').remove();
  toast('House points reset');
}
async function adminArm() {
  if (!await _confirmModal('Arm this race?', 'All connected timers and the Starter will be notified.', 'ARM RACE →')) return;
  const age   = document.getElementById('admin-age-sel').value;
  const event = document.getElementById('admin-event-sel').value;
  const lanes = {};
  document.querySelectorAll('.admin-lane-name-input').forEach(inp=>{
    const n = inp.dataset.lane;
    const v = inp.value.trim();
    if (!v) return;
    const house = document.querySelector(\`.admin-lane-house[data-lane="\${n}"]\`)?.value||'';
    const status = dnsSet.has(n) ? 'dns' : dnfSet.has(n) ? 'dnf' : '';
    lanes[n] = { name:v, ...(house?{house}:{}), ...(status?{status}:{}) };
  });
  dnsSet.clear(); dnfSet.clear();
  // Persist lane names for this age/gender/event
  _saveLaneNames(age, adminGender, event, lanes);
  await cRef('race/current').set({
    raceId: genId(6), age, gender:adminGender, event,
    state:'armed', lanes, splits:{},
    armedAt: firebase.database.ServerValue.TIMESTAMP
  });
  toast('Race armed');
}

async function adminGo() {
  if (!raceState || raceState.state!=='armed') return;
  document.getElementById('admin-go-btn').setAttribute('disabled','');
  showCountdown(async ()=>{
    await cRef('race/current').update({ state:'live', startedAtServer:firebase.database.ServerValue.TIMESTAMP });
  });
}

async function adminRecall() {
  await cRef('race/current').update({ state:'armed', startedAtServer:null });
  broadcastRecall();
}

function broadcastRecall() {
  cRef('recall').set({ active:true, at:firebase.database.ServerValue.TIMESTAMP });
  setTimeout(()=>cRef('recall').set({active:false}), 2500);
  flashRecall();
}

async function adminClear() {
  modal('Clear Splits','Remove all timer splits for this race?',[
    { label:'Clear', cls:'btn-danger', fn: async ()=>{
      await cRef('race/current/splits').set({});
      toast('Splits cleared');
    }},
    { label:'Cancel' }
  ]);
}

async function adminAbandon() {
  modal('Abandon Race','Return to setup and discard this race?',[
    { label:'Abandon', cls:'btn-danger', fn: async ()=>{
      await cRef('race/current').set({state:'idle'});
    }},
    { label:'Cancel' }
  ]);
}

async function adminPublish() {
  if (!raceState) return;
  // Heat picker
  _promptHeat(async (heatSuffix) => {
    const lanes  = raceState.lanes||{};
    const splits = raceState.splits||{};
    const results = [];
    let place = 1;
    // Build sorted non-DQ first to assign places
    const allRows = [];
    Object.keys(lanes).forEach(lane=>{
      const laneData = lanes[lane];
      const status = laneData?.status;
      const house  = laneData?.house||'';
      if (status === 'dns' || status === 'dnf') {
        allRows.push({ lane:parseInt(lane), name:laneData?.name||\`Lane \${lane}\`,
          timeMs:null, dq:false, status, house });
        return;
      }
      const vals = Object.values(splits[lane]||{}).map(s=>s.elapsedMs).filter(Boolean);
      const mean = vals.length ? trimmedMean(vals) : null;
      if (mean!=null) allRows.push({ lane:parseInt(lane), name:laneData?.name||\`Lane \${lane}\`,
        timeMs:mean, dq: dqSet.has(String(lane)), house, status:'' });
    });
    allRows.sort((a,b)=> {
      const ord = r => r.status==='dns' ? 4 : r.status==='dnf' ? 3 : r.dq ? 2 : 0;
      if (ord(a) !== ord(b)) return ord(a) - ord(b);
      return (a.timeMs||0) - (b.timeMs||0);
    });
    const PTS = [8,6,5,4,3,2,1];
    const houseDeltas = {};
    allRows.forEach(r => {
      if (!r.dq && !r.status) {
        r.place = place++;
        if (r.house) houseDeltas[r.house] = (houseDeltas[r.house]||0) + (PTS[r.place-1]||0);
      }
    });
    const eventName = raceState.event + heatSuffix;
    const key = fbEnc(\`\${raceState.age}-\${raceState.gender}-\${eventName}-\${raceState.raceId}\`);
    await cRef(\`results/\${key}\`).set({
      type:'lane', age:raceState.age, gender:raceState.gender, event:eventName,
      raceId:raceState.raceId, results:allRows,
      publishedAt:firebase.database.ServerValue.TIMESTAMP
    });
    // Accumulate house points
    if (Object.keys(houseDeltas).length) {
      const hpRef = cRef('housePoints');
      const snap = await hpRef.once('value');
      const existing = snap.val()||{};
      const merged = {...existing};
      Object.entries(houseDeltas).forEach(([h,pts]) => { merged[h] = (merged[h]||0) + pts; });
      await hpRef.set(merged);
    }
    await cRef('race/current').update({state:'done'});
    dqSet.clear();
    // Falkor auto-AI: race summary + flag times (fire-and-forget)
    (async()=>{
      try{
        const _r=allRows.filter(r=>r.timeMs&&!r.dq&&!r.status).map(r=>({lane:r.lane,athlete:r.name,school:r.house||'',time:+(r.timeMs/1000).toFixed(2)}));
        if(_r.length>=2){
          const _s=await fetch('https://falkor-ct-ai.luckdragon.io/summarize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:eventName,results:_r})});
          if(_s.ok){const{summary}=await _s.json();if(summary)await cRef('results/'+key+'/ai_summary').set({text:summary,ts:Date.now()});}
          const _f=await fetch('https://falkor-ct-ai.luckdragon.io/flag-times',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:eventName,results:Object.keys(lanes).map(l=>({lane:+l,athlete:lanes[l]?.name||'Lane '+l,school:lanes[l]?.house||'',splits:Object.values(splits[l]||{}).map(s=>+(s.elapsedMs/1000).toFixed(2)),published:allRows.find(r=>r.lane===+l)?.timeMs?+(allRows.find(r=>r.lane===+l).timeMs/1000).toFixed(2):null}))})});
          if(_f.ok){const{flags}=await _f.json();if(flags&&flags.length)await cRef('results/'+key+'/ai_flags').set({flags,ts:Date.now()});}
        }
      }catch(_e){console.warn('Falkor AI:',_e);}
    })();
    toast('<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg> Results published!');
  });
}

function _promptHeat(callback) {
  const el = document.createElement('div');
  el.id = 'heat-modal';
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  el.innerHTML = \`
    <div style="background:var(--surface);border-radius:16px;padding:20px;max-width:300px;width:100%;text-align:center">
      <div style="font-weight:700;font-size:1rem;margin-bottom:4px">Heat / Round</div>
      <div style="color:var(--muted);font-size:.82rem;margin-bottom:14px">Label this result (optional)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <button class="btn btn-secondary" onclick="_heatPick(' — Heat 1')">Heat 1</button>
        <button class="btn btn-secondary" onclick="_heatPick(' — Heat 2')">Heat 2</button>
        <button class="btn btn-secondary" onclick="_heatPick(' — Heat 3')">Heat 3</button>
        <button class="btn btn-secondary" onclick="_heatPick(' — Final')">Final</button>
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="_heatPick('')">No label — publish as-is</button>
    </div>\`;
  document.body.appendChild(el);
  window._heatPick = (suffix) => { el.remove(); delete window._heatPick; callback(suffix); };
}

async function adminEditTime(idx) {
  // Load current published results for this race and let admin correct a single time.
  const raceId = raceState && raceState.raceId;
  if (!raceId) { toast('No race loaded'); return; }
  const key = fbEnc(\`\${raceState.age}-\${raceState.gender}-\${raceState.event}-\${raceState.raceId}\`);
  const snap = await cRef(\`results/\${key}\`).once('value');
  const pub = snap.val();
  if (!pub || !Array.isArray(pub.results) || !pub.results[idx]) { toast('Cannot edit: result not found'); return; }
  const row = pub.results[idx];
  const currentSec = (row.timeMs/1000).toFixed(2);
  const newStr = prompt(\`Edit time for \${row.name||'Lane '+row.lane} (seconds, e.g. 14.82):\`, currentSec);
  if (newStr===null) return;
  const newSec = parseFloat(newStr);
  if (!isFinite(newSec) || newSec<=0) { toast('Invalid time'); return; }
  pub.results[idx].timeMs = Math.round(newSec*1000);
  pub.results[idx].edited = true;
  pub.results[idx].editedAt = Date.now();
  // Re-sort + re-place
  pub.results.sort((a,b)=>a.timeMs-b.timeMs);
  pub.results.forEach((r,i)=>r.place=i+1);
  pub.editedAt = firebase.database.ServerValue.TIMESTAMP;
  await cRef(\`results/\${key}\`).set(pub);
  toast('Time updated');
}

function adminNewRace() {
  dqSet.clear();
  cRef('race/current').set({state:'idle'});
  document.querySelectorAll('.admin-lane-name-input').forEach(inp=>inp.value='');
  // Try to reload saved names for current selection
  const age   = document.getElementById('admin-age-sel')?.value;
  const event = document.getElementById('admin-event-sel')?.value;
  if (age && event) _loadLaneNames(age, adminGender, event);
}

async function adminPublishFromDone() {
  if (!raceState || raceState.state !== 'done') return;
  const btn = document.getElementById('admin-done-publish-btn');
  if (btn) { btn.setAttribute('disabled',''); btn.textContent = 'Publishing…'; }
  await adminPublish();
  if (btn) { btn.removeAttribute('disabled'); btn.textContent = 'Publish Results'; }
}

function renderAdminDone(race) {
  const splits = race.splits||{};
  const lanes  = race.lanes||{};
  const results = [];
  Object.keys(lanes).forEach(lane=>{
    const laneData = lanes[lane];
    const status = laneData?.status;
    if (status === 'dns' || status === 'dnf') {
      results.push({ lane, name:laneData?.name, timeMs:null, status });
      return;
    }
    const vals = Object.values(splits[lane]||{}).map(s=>s.elapsedMs).filter(Boolean);
    const mean = vals.length ? trimmedMean(vals) : null;
    if (mean) results.push({ lane, name:laneData?.name, timeMs:mean, status:'' });
  });
  results.sort((a,b)=>{
    const ord = r => r.status==='dns' ? 4 : r.status==='dnf' ? 3 : 0;
    if (ord(a)!==ord(b)) return ord(a)-ord(b);
    return (a.timeMs||0)-(b.timeMs||0);
  });
  // Re-number non-DQ places
  let place = 1;
  const placed = results.map(r => {
    const isDQ = dqSet.has(String(r.lane));
    const isSpec = isDQ || r.status==='dns' || r.status==='dnf';
    return { ...r, isDQ, place: isSpec ? null : place++ };
  });
  document.getElementById('admin-results-list').innerHTML = placed.map((r,i)=>\`
    <div class="lane-row" style="opacity:\${r.isDQ?0.45:1};transition:opacity .15s">
      <div class="medal \${r.isDQ?'pN':r.status==='dns'?'pN':r.status==='dnf'?'pN':medalCls(r.place)}" style="\${r.isDQ?'background:var(--warn);color:#fff':r.status?'background:var(--muted);color:#fff':''}">\${r.isDQ?'DQ':r.status?r.status.toUpperCase():(r.place)}</div>
      <div class="lane-name" onclick="\${!r.status?\`adminEditTime(\${i})\`:''}" style="flex:1;\${!r.status?'cursor:pointer':''}" \${!r.status?'title="Tap to edit time"':''}>\${r.name||\`Lane \${r.lane}\`}\${r.isDQ?'<span style="font-size:.7rem;color:var(--warn);margin-left:6px">DQ</span>':r.status?\`<span style="font-size:.7rem;color:var(--muted);margin-left:6px">\${r.status.toUpperCase()}</span>\`:''}</div>
      <div class="lane-time font-mono" onclick="adminEditTime(\${i})" style="cursor:pointer">\${r.isDQ?'—':fmtSec(r.timeMs)}</div>
      <button class="btn btn-sm" style="margin-left:6px;padding:2px 8px;font-size:.7rem;border:1px solid \${r.isDQ?'var(--warn)':'var(--border)'};color:\${r.isDQ?'var(--warn)':'var(--muted)'};background:transparent;border-radius:6px" onclick="adminToggleDQ('\${r.lane}')">\${r.isDQ?'✕ DQ':'DQ'}</button>
    </div>\`).join('') || '<div class="text-muted text-sm">No timed athletes</div>';
}

function adminToggleDQ(lane) {
  const k = String(lane);
  if (dqSet.has(k)) dqSet.delete(k); else dqSet.add(k);
  if (raceState) renderAdminDone(raceState);
}

function medalCls(p) { return p===1?'p1':p===2?'p2':p===3?'p3':'pN'; }

// ════════════════════════════════════════
// STARTER VIEW
// ════════════════════════════════════════
// ── Starter audio state ──────────────────────────────────────────────────────
let starterAudioCtx    = null;
let starterAnalyser    = null;
let starterMicStream   = null;
let starterListening   = false;
let starterNoiseFloor  = 0;
let starterNoiseCount  = 0;
let starterSensitivity = 'med';
let starterListenRafId = null;
const STARTER_SENS_MULT = { high:3, med:5, low:9 };

function initStarterView() {
  watchConn('starter-dot');
  const raceRef = cRef('race/current');
  raceRef.on('value', snap=>{
    const race = snap.val();
    const w = document.getElementById('starter-waiting');
    const a = document.getElementById('starter-armed');
    if (!race || race.state==='idle') {
      w.classList.remove('hidden'); a.classList.add('hidden');
      starterListenStop(); return;
    }
    if (race.state==='armed') {
      w.classList.add('hidden'); a.classList.remove('hidden');
      document.getElementById('starter-race-info').textContent =
        \`\${race.age||''} \${race.gender||''} · \${race.event||''}\`;
    } else {
      w.classList.remove('hidden'); a.classList.add('hidden');
      starterListenStop();
    }
  });
  activeListeners.push(()=>raceRef.off());
}

// ── Manual GO (with countdown) ────────────────────────────────────────────────
function starterGo() {
  document.getElementById('starter-go-btn').setAttribute('disabled','');
  showCountdown(async ()=>{
    await cRef('race/current').update({ state:'live', startedAtServer:firebase.database.ServerValue.TIMESTAMP });
  });
}
function starterRecall() { starterListenStop(); broadcastRecall(); }

// ── Gun detection ─────────────────────────────────────────────────────────────
function starterSetSens(s) {
  starterSensitivity = s;
  document.querySelectorAll('[data-sens]').forEach(b => {
    const active = b.dataset.sens === s;
    b.className = active ? 'btn btn-primary' : 'btn btn-secondary';
    b.style.fontSize = '0.75rem'; b.style.padding = '4px 10px';
  });
}

async function starterListenStart() {
  try {
    starterMicStream = await navigator.mediaDevices.getUserMedia({audio:true, video:false});
    starterAudioCtx  = new (window.AudioContext||window.webkitAudioContext)();
    const source = starterAudioCtx.createMediaStreamSource(starterMicStream);
    starterAnalyser  = starterAudioCtx.createAnalyser();
    starterAnalyser.fftSize = 256;
    source.connect(starterAnalyser);
    starterListening  = true;
    starterNoiseFloor = 0;
    starterNoiseCount = 0;
    document.getElementById('starter-listen-idle').classList.add('hidden');
    document.getElementById('starter-listen-active').classList.remove('hidden');
    document.getElementById('starter-cal-lbl').textContent = 'Calibrating…';
    starterListenRafId = requestAnimationFrame(starterListenLoop);
  } catch(e) {
    toast('Microphone access denied');
  }
}

function starterListenStop() {
  starterListening = false;
  if (starterListenRafId) { cancelAnimationFrame(starterListenRafId); starterListenRafId=null; }
  if (starterMicStream)   { starterMicStream.getTracks().forEach(t=>t.stop()); starterMicStream=null; }
  if (starterAudioCtx)    { starterAudioCtx.close().catch(()=>{}); starterAudioCtx=null; }
  const idle   = document.getElementById('starter-listen-idle');
  const active = document.getElementById('starter-listen-active');
  const bar    = document.getElementById('starter-vol-bar');
  if (idle)   idle.classList.remove('hidden');
  if (active) active.classList.add('hidden');
  if (bar)    bar.style.width = '0%';
}

function starterListenLoop() {
  starterListenRafId = null;
  if (!starterListening || !starterAnalyser) return;

  const data = new Uint8Array(starterAnalyser.frequencyBinCount);
  starterAnalyser.getByteTimeDomainData(data);

  // RMS
  let sum = 0;
  for (let i=0; i<data.length; i++) { const v=(data[i]-128)/128; sum+=v*v; }
  const rms = Math.sqrt(sum / data.length);

  // Volume bar (0-100%)
  const bar = document.getElementById('starter-vol-bar');
  if (bar) bar.style.width = Math.min(100, Math.round(rms*500)) + '%';

  if (starterNoiseCount < 40) {
    // First ~0.7s: calibrate noise floor
    starterNoiseFloor = (starterNoiseFloor * starterNoiseCount + rms) / (starterNoiseCount + 1);
    starterNoiseCount++;
    if (starterNoiseCount >= 40) {
      const calLbl = document.getElementById('starter-cal-lbl');
      const nfPct  = Math.round(Math.min(100, starterNoiseFloor * 2000));
      if (calLbl) calLbl.textContent = \`Ready (noise: \${nfPct}%)\`;
    }
  } else {
    const mult      = STARTER_SENS_MULT[starterSensitivity] || 5;
    const threshold = Math.max(0.06, starterNoiseFloor * mult);
    if (rms > threshold) {
      // GUN DETECTED — show 1-second cancellable countdown
      starterListenStop();
      starterGunCountdown();
      return;
    }
  }

  starterListenRafId = requestAnimationFrame(starterListenLoop);
}

// ════════════════════════════════════════
// OBSERVER VIEW (Lane Race)
// ════════════════════════════════════════
function renderObserverResults(data) {
  const board = document.getElementById('observer-results-board');
  const list  = document.getElementById('observer-results-list');
  if (!board || !list) return;
  if (!data || !Object.keys(data).length) { board.style.display='none'; return; }
  board.style.display = 'block';

  const events = Object.values(data).sort((a,b) => (b.publishedAt||0) - (a.publishedAt||0));
  list.innerHTML = events.map(ev => {
    const isXC = ev.type === 'xc';
    const places = isXC ? (ev.places||[]) : (ev.results||[]);
    const rows = places.slice(0,6).map((r,i) => {
      const isDQ = !isXC && r.dq;
      const pos  = isXC ? r.place : (isDQ ? null : (i+1));
      const name = r.name || (isXC ? '' : \`Lane \${r.lane}\`);
      const time = fmtSec(isXC ? r.elapsedMs : r.timeMs);
      return \`<div class="lane-row" style="padding:6px 4px;\${isDQ?'opacity:.45':''}" >
        <div class="medal \${isDQ?'pN':medalCls(pos)}" style="font-size:.8rem;\${isDQ?'background:var(--warn);color:#fff':''}">\${isDQ?'DQ':(pos)}</div>
        <div class="lane-name" style="font-size:.9rem">\${name}</div>
        <div class="lane-time font-mono" style="font-size:.9rem">\${isDQ?'—':time}</div>
      </div>\`;
    }).join('');
    return \`<div class="card" style="margin-bottom:8px;padding:10px 12px">
      <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:6px">\${ev.age||''} \${ev.gender||''} · \${ev.event||''}</div>
      \${rows}
      \${ev.ai_summary?'<div style="margin-top:8px;padding:8px 10px;background:rgba(99,102,241,.1);border-radius:8px;font-size:.82rem;font-style:italic;color:var(--text)">🤖 '+ev.ai_summary.text+'</div>':''}
      \${ev.ai_flags&&ev.ai_flags.flags&&ev.ai_flags.flags.some(f=>f.severity==='error'||f.severity==='warn')?'<div style="margin-top:4px;padding:6px 10px;background:rgba(245,158,11,.15);border-radius:8px;font-size:.78rem;color:var(--warn)">⚠️ '+ev.ai_flags.flags.filter(f=>f.severity!=='info').map(f=>'Lane '+f.lane+': '+f.issue).join(' · ')+'</div>':''}
    </div>\`;
  }).join('');
}

function initObserverView() {
  watchConn('observer-dot');
  const raceRef = cRef('race/current');
  raceRef.on('value', snap=>{ raceState=snap.val(); renderObserverView(raceState); });
  activeListeners.push(()=>raceRef.off());

  // Published results board
  const resRef = cRef('results');
  resRef.on('value', snap => { renderObserverResults(snap.val()); });
  activeListeners.push(()=>resRef.off());

  function tick() {
    if (raceState?.state==='live' && raceState.startedAtServer) {
      const el=document.getElementById('observer-clock');
      if(el) el.textContent=fmtMs(nowServer()-raceState.startedAtServer);
    }
    rafId=requestAnimationFrame(tick);
  }
  rafId=requestAnimationFrame(tick);
}

function renderObserverView(race) {
  const waiting = document.getElementById('observer-waiting');
  const list    = document.getElementById('observer-lanes-list');
  if (!race || race.state==='idle') {
    waiting.classList.remove('hidden'); list.innerHTML='';
    document.getElementById('observer-event-lbl').textContent=''; return;
  }
  waiting.classList.add('hidden');
  document.getElementById('observer-event-lbl').textContent=
    \`\${race.age||''} \${race.gender||''} · \${race.event||''}\`;

  const lanes  = race.lanes||{};
  const splits = race.splits||{};
  const data = Object.keys(lanes).map(n=>{
    const vals = Object.values(splits[n]||{}).map(s=>s.elapsedMs).filter(Boolean);
    const mean = vals.length ? trimmedMean(vals) : null;
    const conf = confidenceFor(splits[n]||{});
    return { n:parseInt(n), name:lanes[n]?.name||\`Lane \${n}\`, mean, conf };
  });
  const ranked = [...data].filter(d=>d.mean!=null).sort((a,b)=>a.mean-b.mean);
  const rankMap={};
  ranked.forEach((d,i)=>rankMap[d.n]=i+1);

  list.innerHTML = data.sort((a,b)=>a.n-b.n).map(d=>{
    const place = rankMap[d.n];
    const numStyle = place===1?'background:#FFD700;color:#000':place===2?'background:#C0C0C0;color:#000':place===3?'background:#CD7F32;color:#fff':'';
    return \`<div class="lane-row">
      <div class="lane-num" style="\${numStyle}">\${place||d.n}</div>
      <div class="lane-name">\${d.name}</div>
      \${d.mean
        ? \`<div><span class="lane-time font-mono">\${fmtSec(d.mean)}</span> <span class="conf-\${d.conf.cls}">\${d.conf.label}</span></div>\`
        : \`<span class="text-muted text-xs">\${race.state==='live'?'…':'—'}</span>\`}
    </div>\`;
  }).join('');
}

// ════════════════════════════════════════
// COUNTDOWN
// ════════════════════════════════════════
function showCountdown(onGo) {
  if (countdownRunning) return;
  countdownRunning = true;
  const overlay = document.getElementById('countdown-overlay');
  const numEl   = document.getElementById('countdown-num');
  const lblEl   = document.getElementById('countdown-label');
  overlay.classList.add('active');

  [
    { n:'3', l:'Get set…',      d:0 },
    { n:'2', l:'Ready…',        d:1000 },
    { n:'1', l:'On your marks…',d:2000 },
    { n:'GO',l:'',              d:3000, go:true }
  ].forEach(({n,l,d,go})=>{
    setTimeout(()=>{
      numEl.textContent = n;
      numEl.style.color = go ? 'var(--success)' : 'var(--text)';
      lblEl.textContent = l;
      vibrate(go ? [200,60,200] : [40]);
      if (go) { flash('go',600); onGo && onGo(); }
    }, d);
  });

  setTimeout(()=>{ overlay.classList.remove('active'); countdownRunning=false; }, 3900);
}

function flashRecall() {
  const overlay = document.getElementById('countdown-overlay');
  const numEl   = document.getElementById('countdown-num');
  const lblEl   = document.getElementById('countdown-label');
  overlay.classList.add('active');
  numEl.innerHTML = '<span style="display:inline-block;width:0.8em;height:0.8em;background:var(--danger);border-radius:50%;vertical-align:middle"></span>';
  numEl.style.color  = 'var(--danger)';
  lblEl.textContent  = 'FALSE START — RECALL';
  vibrate([200,80,200,80,200]);
  flash('recall', 1800);
  setTimeout(()=>overlay.classList.remove('active'), 2000);
}

// ════════════════════════════════════════
// CROSS COUNTRY — MARSHAL VIEW
// ════════════════════════════════════════
let bibPendingKey   = null;
let bibPendingQueue = [];    // [{key, place, elapsed}]
let bibValue        = '';
let xcCamStream     = null;  // active getUserMedia stream
const xcPhotos      = new Map(); // key → dataURL of best burst frame
let _ocrWorker      = null;  // reusable Tesseract worker

async function xcInitCamera() {
  if (xcCamStream) return;
  try {
    xcCamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    const v = document.getElementById('xc-cam');
    v.srcObject = xcCamStream;
    await v.play().catch(()=>{});
  } catch(e) {
    xcCamStream = null; // camera unavailable (deny or no camera) — silently degrade
  }
}

async function xcCapturePhoto(key) {
  // Start camera if not running
  if (!xcCamStream) xcInitCamera(); // fire and forget — first tap may miss
  xcPhotos.set(key, null); // placeholder

  const video  = document.getElementById('xc-cam');
  const canvas = document.getElementById('xc-cap');
  const ctx    = canvas.getContext('2d');

  // Give video a moment, then burst 3 frames
  await new Promise(r => setTimeout(r, 80));
  const frames = [];
  for (let i = 0; i < 3; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 180));
    if (video.readyState >= 2 && xcCamStream) {
      canvas.width = 400; canvas.height = 300;
      ctx.drawImage(video, 0, 0, 400, 300);
      frames.push(canvas.toDataURL('image/jpeg', 0.55));
    }
  }
  // Use last frame (runner most likely cleared the line)
  if (frames.length) xcPhotos.set(key, frames[frames.length-1]);
}

async function runBibOCR() {
  const photoDataUrl = xcPhotos.get(bibPendingKey);
  if (!photoDataUrl) { toast('No photo captured'); return; }
  const btn = document.getElementById('ocr-btn');
  if (btn) btn.textContent = '⏳';
  try {
    if (!_ocrWorker) {
      _ocrWorker = await Tesseract.createWorker('eng');
      await _ocrWorker.setParameters({ tessedit_char_whitelist: '0123456789' });
    }
    const { data: { text, confidence } } = await _ocrWorker.recognize(photoDataUrl);
    const digits = text.replace(/\\D/g,'').slice(0,4);
    if (digits && confidence > 55) {
      bibValue = digits;
      document.getElementById('marshal-bib-display').textContent = bibValue;
      if (btn) btn.textContent = '✓ ' + digits;
      toast('Bib ' + digits + ' detected (' + Math.round(confidence) + '% conf)');
    } else {
      if (btn) btn.textContent = '🔍 Auto';
      toast('Could not read bib — enter manually');
    }
  } catch(e) {
    if (btn) btn.textContent = '🔍 Auto';
    toast('OCR error');
  }
}

function initMarshalView() {
  requestWakeLock(); syncClock();
  watchConn('marshal-dot');
  xcInitCamera(); // warm up camera in background

  const xcRef = cRef('xc/current');
  xcRef.on('value', snap => { xcState=snap.val(); renderMarshalView(xcState); });
  activeListeners.push(() => xcRef.off());

  cRef('recall').on('value', snap => { if(snap.val()?.active) flashRecall(); });
  activeListeners.push(() => cRef('recall').off());

  function tick() {
    if (xcState?.state==='live' && xcState.startedAtServer) {
      const t = fmtMs(nowServer()-xcState.startedAtServer);
      const el = document.getElementById('marshal-clock-mini');
      if (el) el.textContent = t;
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
}

function renderMarshalView(xc) {
  const waiting = document.getElementById('marshal-waiting');
  const live    = document.getElementById('marshal-live');
  if (!xc || xc.state!=='live') {
    live.classList.add('hidden'); waiting.classList.remove('hidden');
    const msg = document.getElementById('marshal-wait-msg');
    if (xc?.state==='armed') {
      msg.innerHTML = \`Race armed — waiting for GO<br>
        <span style="color:var(--accent);font-weight:700;font-size:1.1rem">\${xc.age||''} \${xc.gender||''} · \${xc.event||''}</span>\`;
    } else { msg.textContent='Waiting for race to start...'; }
    return;
  }
  live.classList.remove('hidden'); waiting.classList.add('hidden');
  document.getElementById('marshal-event-lbl').textContent = \`\${xc.age||''} \${xc.gender||''} · \${xc.event||''}\`;
  renderMarshalFinishes(xc);
}

function renderMarshalFinishes(xc) {
  const list = document.getElementById('marshal-finishes-list');
  const finishes = xc?.finishes || {};
  const entries = Object.entries(finishes)
    .sort((a,b)=>(a[1].tapAt||0)-(b[1].tapAt||0));

  if (!entries.length) {
    list.innerHTML = '<div class="text-muted text-sm text-center" style="padding:12px 0">No finishes yet — tap above</div>';
    return;
  }

  list.innerHTML = entries.map(([k,f],i) => \`
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">
      <span class="place-badge" style="flex-shrink:0">\${ordinal(i+1)}</span>
      <span style="font-weight:700;min-width:72px">\${fmtMs(f.elapsedMs)}</span>
      \${f.bib
        ? \`<span style="color:var(--accent);font-weight:700;font-size:0.9rem">Bib \${f.bib}</span>\`
        : \`<button class="btn btn-secondary btn-sm" onclick="marshalEditBib('\${k}',\${i+1},\${f.elapsedMs})">+ Bib</button>\`}
      <span style="flex:1;font-size:0.75rem;color:var(--muted);text-align:right">\${f.marshalName||''}</span>
    </div>\`).join('');
}

async function marshalTap() {
  if (!xcState || xcState.state!=='live') { toast('Race not live'); return; }
  const elapsed = nowServer() - xcState.startedAtServer;
  const count   = Object.keys(xcState.finishes||{}).length;
  const place   = count + 1;

  tapFlash(); vibrate([70]);

  // Client-side key
  const key = myId.slice(0,4) + '-' + Date.now().toString(36);
  xcCapturePhoto(key); // fire-and-forget photo burst

  await cRef(\`xc/current/finishes/\${key}\`).set({
    marshalId:   myId,
    marshalName: myName || 'Marshal',
    bib:         '',
    name:        '',
    elapsedMs:   elapsed,
    tapAt:       firebase.database.ServerValue.TIMESTAMP
  });

  toast(\`\${ordinal(place)} — \${fmtMs(elapsed)}\`);

  // Queue bib entry
  bibPendingQueue.push({ key, place, elapsed });
  updateTapBtnLabel();
  if (!bibPendingKey) showNextBib();
}

let _xcAutoConfirmTimer = null; // FIX 2: auto-confirm countdown handle

function xcCancelAutoConfirm() {
  if (_xcAutoConfirmTimer) { clearInterval(_xcAutoConfirmTimer); _xcAutoConfirmTimer = null; }
  const btn = document.getElementById('ocr-btn');
  if (btn) btn.textContent = '🔍 Auto';
}

function showNextBib() {
  xcCancelAutoConfirm(); // clear any running countdown
  if (!bibPendingQueue.length) { hideBibPad(); return; }
  const { key, place, elapsed, autoDetected } = bibPendingQueue[0];
  bibPendingKey = key;
  bibValue      = '';
  document.getElementById('marshal-bib-for').textContent     = \`\${autoDetected ? '🤖 Auto-detected' : 'Bib for'} \${ordinal(place)} — \${fmtMs(elapsed)}\`;
  document.getElementById('marshal-bib-display').textContent = '_';
  document.getElementById('marshal-bib-pad').classList.remove('hidden');
  document.getElementById('marshal-finishes-wrap').style.paddingBottom = '0';

  // Show photo (may arrive async), then auto-OCR if autoDetected
  const updatePhoto = () => {
    const photo = xcPhotos.get(key);
    const img   = document.getElementById('finish-photo-img');
    const ph    = document.getElementById('finish-photo-status');
    if (!img) return;
    if (photo) {
      img.src = photo; img.style.display = 'block';
      if (ph) ph.style.display = 'none';
      const btn = document.getElementById('ocr-btn');
      if (btn) btn.textContent = '🔍 Auto';
      // FIX 2: auto-fire OCR for auto-detected finishes
      if (autoDetected) xcAutoOCRAndConfirm(key);
    } else if (photo === null) {
      if (ph) { ph.style.display=''; ph.textContent='📷 Capturing…'; }
      img.style.display = 'none';
      setTimeout(updatePhoto, 350);
    } else {
      if (ph) { ph.style.display=''; ph.textContent='No camera'; }
      img.style.display = 'none';
      // No photo — still auto-confirm after delay for autoDetected (bib unknown)
      if (autoDetected) xcStartAutoConfirmCountdown(null);
    }
  };
  updatePhoto();
}

async function xcAutoOCRAndConfirm(key) {
  // Try OCR on the finish photo
  const photoDataUrl = xcPhotos.get(key);
  if (!photoDataUrl) { xcStartAutoConfirmCountdown(null); return; }
  const btn = document.getElementById('ocr-btn');
  if (btn) btn.textContent = '⏳ OCR…';
  try {
    if (!_ocrWorker) {
      _ocrWorker = await Tesseract.createWorker('eng');
      await _ocrWorker.setParameters({ tessedit_char_whitelist: '0123456789' });
    }
    const { data: { text, confidence } } = await _ocrWorker.recognize(photoDataUrl);
    const digits = text.replace(/\\D/g,'').slice(0,4);
    if (digits && confidence > 55) {
      bibValue = digits;
      document.getElementById('marshal-bib-display').textContent = bibValue;
      if (btn) btn.textContent = '✓ ' + digits;
      xcStartAutoConfirmCountdown(digits);
    } else {
      if (btn) btn.textContent = '🔍 Auto';
      xcStartAutoConfirmCountdown(null); // no bib read — still auto-confirm (skip)
    }
  } catch(e) {
    if (btn) btn.textContent = '🔍 Auto';
    xcStartAutoConfirmCountdown(null);
  }
}

function xcStartAutoConfirmCountdown(detectedBib) {
  let secs = 4;
  const btn = document.getElementById('ocr-btn');
  _xcAutoConfirmTimer = setInterval(() => {
    secs--;
    if (secs > 0) {
      if (btn && detectedBib) btn.textContent = \`✓ \${detectedBib} (\${secs}s)\`;
      else if (btn) btn.textContent = \`Skip (\${secs}s)\`;
    } else {
      xcCancelAutoConfirm();
      // Marshal didn't intervene — auto-confirm (or auto-skip if no bib)
      if (bibPendingKey) bibConfirm();
    }
  }, 1000);
}

function hideBibPad() {
  document.getElementById('marshal-bib-pad').classList.add('hidden');
  bibPendingKey = null;
  updateTapBtnLabel();
}

function updateTapBtnLabel() {
  const sub = document.getElementById('marshal-tap-sub');
  if (!sub) return;
  const n = bibPendingQueue.length;
  sub.textContent = n > 0 ? \`TAP FINISH  ·  +\${n} queued\` : 'TAP FINISH';
}

function bibDigit(d) {
  xcCancelAutoConfirm(); // marshal is intervening — stop countdown
  if (bibValue.length >= 4) return;
  bibValue += d;
  document.getElementById('marshal-bib-display').textContent = bibValue || '_';
}

function bibBack() {
  xcCancelAutoConfirm(); // marshal is intervening — stop countdown
  bibValue = bibValue.slice(0,-1);
  document.getElementById('marshal-bib-display').textContent = bibValue || '_';
}

async function bibConfirm() {
  if (bibPendingKey) {
    const updates = {};
    if (bibValue) updates.bib = bibValue;
    // Save compressed photo to Firebase (base64 JPEG ~15-20KB)
    const photo = xcPhotos.get(bibPendingKey);
    if (photo) updates.photo = photo;
    if (Object.keys(updates).length) {
      await cRef(\`xc/current/finishes/\${bibPendingKey}\`).update(updates);
    }
  }
  bibPendingQueue.shift();
  bibPendingKey = null;
  showNextBib();
  updateTapBtnLabel();
}

function bibSkip() {
  bibPendingQueue.shift();
  bibPendingKey = null;
  showNextBib();
  updateTapBtnLabel();
}

function marshalEditBib(key, place, elapsed) {
  // Edit bib for an already-tapped finisher
  bibPendingQueue.unshift({ key, place, elapsed });
  if (!bibPendingKey) showNextBib();
}

async function marshalUndo() {
  if (!xcState) return;
  const finishes = xcState.finishes||{};
  const mine = Object.entries(finishes)
    .filter(([k,f])=>f.marshalId===myId)
    .sort((a,b)=>(b[1].tapAt||0)-(a[1].tapAt||0));
  if (!mine.length) { toast('Nothing to undo'); return; }
  const [key, last] = mine[0];
  const total = Object.keys(finishes).length;
  modal('Undo last tap',
    \`Remove tap at \${fmtMs(last.elapsedMs)}? (\${total} total finishers)\`,
    [
      { label:'Undo', cls:'btn-danger', fn: async ()=>{
        await cRef(\`xc/current/finishes/\${key}\`).remove();
        // Remove from bib queue if pending
        bibPendingQueue = bibPendingQueue.filter(q=>q.key!==key);
        if (bibPendingKey===key) { bibPendingKey=null; showNextBib(); }
        toast('Removed');
      }},
      { label:'Cancel' }
    ]);
}

// ════════════════════════════════════════
// CROSS COUNTRY — ADMIN VIEW
// ════════════════════════════════════════
function initXCAdminView() {
  requestWakeLock(); syncClock();
  watchConn('xc-admin-dot');
  document.getElementById('xc-admin-school-lbl').textContent = carnivalMeta?.school||'';

  const ageSel=document.getElementById('xc-age-sel');
  ageSel.innerHTML=AGE_GROUPS.map(a=>\`<option>\${a}</option>\`).join('');
  const evSel=document.getElementById('xc-event-sel');
  evSel.innerHTML=EVENTS.xc.map(e=>\`<option>\${e}</option>\`).join('');

  const xcRef=cRef('xc/current');
  xcRef.on('value', snap=>{ xcState=snap.val(); renderXCAdminView(xcState); });
  activeListeners.push(()=>xcRef.off());

  function tick() {
    if (xcState?.state==='live' && xcState.startedAtServer) {
      const el=document.getElementById('xc-admin-clock');
      if(el) el.textContent=fmtMs(nowServer()-xcState.startedAtServer);
    }
    rafId=requestAnimationFrame(tick);
  }
  rafId=requestAnimationFrame(tick);
}

function selectXCGender(g) {
  xcGender=g;
  document.querySelectorAll('[data-xcg]').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll(\`[data-xcg="\${g}"]\`).forEach(p=>p.classList.add('active'));
}

async function xcAdminArm() {
  if (!await _confirmModal('Arm this XC race?', 'All connected timers and the Starter will be notified.', 'ARM RACE →')) return;
  const age  = document.getElementById('xc-age-sel').value;
  const event= document.getElementById('xc-event-sel').value;
  await cRef('xc/current').set({
    raceId:genId(6), age, gender:xcGender, event,
    state:'armed', finishes:{},
    armedAt:firebase.database.ServerValue.TIMESTAMP
  });
  toast('XC Race armed');
}

async function xcAdminGo() {
  if (!xcState || xcState.state!=='armed') return;
  document.getElementById('xc-go-btn').setAttribute('disabled','');
  showCountdown(async ()=>{
    await cRef('xc/current').update({state:'live', startedAtServer:firebase.database.ServerValue.TIMESTAMP});
  });
}

async function xcAdminRecall() {
  await cRef('xc/current').update({state:'armed', startedAtServer:null});
  broadcastRecall();
}

async function xcAdminAbandon() {
  modal('Abandon Race','Return to setup?',[
    { label:'Abandon', cls:'btn-danger', fn:async()=>{
      await cRef('xc/current').set({state:'idle'});
    }},
    { label:'Cancel' }
  ]);
}

async function xcAdminPublish() {
  if (!xcState) return;
  const finishes = xcState.finishes||{};
  const sorted   = Object.entries(finishes).sort((a,b)=>(a[1].tapAt||0)-(b[1].tapAt||0));

  const numQual = parseInt(document.getElementById('xc-qual-spots')?.value)||0;

  if (!await _confirmModal(
    'Publish XC Results',
    \`\${sorted.length} finisher\${sorted.length!==1?'s':''} · \${numQual} qualifier spot\${numQual!==1?'s':''}\`,
    'PUBLISH →'
  )) return;

  toast('Publishing & generating cards…');

  // Generate finish cards for finishers with photos
  const cards = {};
  for (let i = 0; i < sorted.length; i++) {
    const [k, f] = sorted[i];
    const place = i + 1;
    try {
      cards[place] = await generateFinishCard({
        place, name: f.name || (f.bib ? 'Bib ' + f.bib : 'Finisher ' + place),
        elapsedMs: f.elapsedMs, photo: f.photo||null,
        age: xcState.age, gender: xcState.gender,
        event: xcState.event, school: carnivalMeta?.school||''
      });
    } catch(e) { /* skip bad frames */ }
  }

  const key = fbEnc(\`xc-\${xcState.age}-\${xcState.gender}-\${xcState.event}-\${xcState.raceId}\`);
  await cRef(\`results/\${key}\`).set({
    type:'xc', age:xcState.age, gender:xcState.gender, event:xcState.event,
    raceId:xcState.raceId,
    qualifierSpots: numQual,
    places: sorted.map(([k,f],i) => ({
      place:       i + 1,
      bib:         f.bib||'',
      name:        f.name||'',
      elapsedMs:   f.elapsedMs,
      qualifier:   numQual > 0 && (i+1) <= numQual,
      ...(cards[i+1] ? { card: cards[i+1] } : {})
    })),
    publishedAt: firebase.database.ServerValue.TIMESTAMP
  });
  await cRef('xc/current').update({state:'done'});

  const qualMsg = numQual ? \` · \${Math.min(numQual, sorted.length)} qualifier\${numQual!==1?'s':''} flagged\` : '';
  toast('XC published!' + qualMsg);

  // Offer to view finish cards if any were generated
  const cardCount = Object.keys(cards).length;
  if (cardCount > 0) {
    setTimeout(() => showFinishCards(cards, sorted, xcState), 1200);
  }
}

// ── Finish card generator ────────────────────────────────────
async function generateFinishCard({ place, name, elapsedMs, photo, age, gender, event, school }) {
  const W = 400, H = 620;
  const c   = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Background
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  if (photo) {
    try {
      await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => {
          // Fill top 62% with finish photo
          ctx.drawImage(img, 0, 0, W, Math.round(H * 0.62));
          res();
        };
        img.onerror = rej;
        img.src = photo;
      });
      // Gradient fade from photo to dark
      const g = ctx.createLinearGradient(0, H*0.38, 0, H*0.62);
      g.addColorStop(0, 'rgba(13,17,23,0)');
      g.addColorStop(1, 'rgba(13,17,23,1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    } catch(e) {
      // No photo fallback — teal gradient background
      const g2 = ctx.createLinearGradient(0, 0, W, H*0.5);
      g2.addColorStop(0, '#0d1117'); g2.addColorStop(1, '#0d4040');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H*0.62);
    }
  } else {
    const g2 = ctx.createLinearGradient(0, 0, W, H*0.5);
    g2.addColorStop(0, '#0d1117'); g2.addColorStop(1, '#0d3030');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H*0.62);
    // Camera icon placeholder
    ctx.fillStyle = '#30363d';
    ctx.font = '64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏃', W/2, H*0.32);
  }

  const baseY = H * 0.64;

  // Accent stripe
  ctx.fillStyle = '#14b8a6';
  ctx.fillRect(0, baseY - 4, W, 4);

  // Place text — gold / silver / bronze / teal
  const placeColors = ['#FFD700','#C0C0C0','#CD7F32'];
  const placeText   = ['1ST','2ND','3RD'][place-1] || (place + 'TH');
  ctx.fillStyle  = placeColors[place-1] || '#14b8a6';
  ctx.font       = \`900 \${place<=3?80:64}px Arial\`;
  ctx.textAlign  = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur  = 8;
  ctx.fillText(placeText, W/2, baseY + 72);
  ctx.shadowBlur = 0;

  // Name
  ctx.fillStyle = '#f0f6fc';
  ctx.font      = 'bold 34px Arial';
  const displayName = name.length > 20 ? name.slice(0,19) + '…' : name;
  ctx.fillText(displayName, W/2, baseY + 120);

  // Time
  ctx.fillStyle = '#14b8a6';
  ctx.font      = 'bold 26px Arial';
  ctx.fillText(fmtMs(elapsedMs), W/2, baseY + 158);

  // Event info
  ctx.fillStyle = '#8b949e';
  ctx.font      = '17px Arial';
  ctx.fillText(\`\${age} \${gender}  ·  \${event}\`, W/2, baseY + 186);

  // School
  if (school) {
    ctx.fillStyle = '#8b949e';
    ctx.font      = '15px Arial';
    ctx.fillText(school, W/2, baseY + 207);
  }

  // Footer branding bar
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, H - 38, W, 38);
  ctx.fillStyle = '#30363d';
  ctx.fillRect(0, H - 38, W, 1);
  ctx.fillStyle = '#8b949e';
  ctx.font      = '13px Arial';
  ctx.fillText('carnivaltiming.com', W/2, H - 13);

  return c.toDataURL('image/jpeg', 0.82);
}

// ── Show finish cards slideshow after publish ────────────────
function showFinishCards(cards, sorted, xc) {
  let idx = 0;
  const keys = Object.keys(cards).map(Number).sort((a,b)=>a-b);
  if (!keys.length) return;

  const overlay = document.createElement('div');
  overlay.id = 'finish-card-overlay';

  const render = () => {
    const place = keys[idx];
    const [, f] = sorted[place-1] || sorted[0];
    overlay.innerHTML = \`
      <img src="\${cards[place]}" style="max-width:min(320px,85vw);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.6)">
      <div style="color:#f0f6fc;font-size:0.9rem;text-align:center;opacity:0.7">\${place} of \${keys.length} · tap to share</div>
      <div class="card-actions">
        \${idx > 0 ? '<button class="btn btn-secondary btn-sm" id="_fc-prev">← Prev</button>' : ''}
        <button class="btn btn-primary btn-sm" id="_fc-share">Share 📤</button>
        \${idx < keys.length-1 ? '<button class="btn btn-secondary btn-sm" id="_fc-next">Next →</button>' : ''}
        <button class="btn btn-secondary btn-sm" id="_fc-close">✕ Close</button>
      </div>\`;

    // Bind buttons
    overlay.querySelector('#_fc-close').onclick = () => document.body.removeChild(overlay);
    const prevBtn = overlay.querySelector('#_fc-prev');
    const nextBtn = overlay.querySelector('#_fc-next');
    const shareBtn = overlay.querySelector('#_fc-share');
    if (prevBtn) prevBtn.onclick = () => { idx--; render(); };
    if (nextBtn) nextBtn.onclick = () => { idx++; render(); };
    shareBtn.onclick = async () => {
      const dataUrl  = cards[place];
      const blob     = await (await fetch(dataUrl)).blob();
      const file     = new File([blob], \`finish-\${xc.age}-\${xc.gender}-place\${place}.jpg\`, {type:'image/jpeg'});
      if (navigator.canShare && navigator.canShare({files:[file]})) {
        navigator.share({ files:[file], title: \`\${ordinal(place)} Place — \${xc.age} \${xc.gender}\` }).catch(()=>{});
      } else {
        const a = document.createElement('a');
        a.href = dataUrl; a.download = file.name; a.click();
      }
    };
  };

  render();
  document.body.appendChild(overlay);
}

function renderXCAdminView(xc) {
  const setup=document.getElementById('xc-setup-panel');
  const live =document.getElementById('xc-live-panel');

  if (!xc || xc.state==='idle') {
    setup.classList.remove('hidden'); live.classList.add('hidden'); return;
  }
  setup.classList.add('hidden'); live.classList.remove('hidden');

  document.getElementById('xc-race-lbl').textContent = \`\${xc.age||''} \${xc.gender||''} · \${xc.event||''}\`;
  const badge  = document.getElementById('xc-state-badge');
  const goBtn  = document.getElementById('xc-go-btn');
  const pubBtn = document.getElementById('xc-publish-btn');

  if (xc.state==='armed') {
    badge.className='badge badge-armed'; badge.textContent='ARMED';
    goBtn.removeAttribute('disabled'); pubBtn.classList.add('hidden');
    document.getElementById('xc-admin-clock').textContent='0:00.00';
  } else if (xc.state==='live') {
    badge.className='badge badge-live'; badge.textContent='LIVE';
    goBtn.setAttribute('disabled',''); pubBtn.classList.remove('hidden');
  } else if (xc.state==='done') {
    badge.className='badge badge-done'; badge.textContent='DONE';
    pubBtn.classList.add('hidden');
  }

  const finishes = xc.finishes||{};
  const entries = Object.entries(finishes)
    .sort((a,b)=>(a[1].tapAt||0)-(b[1].tapAt||0));
  document.getElementById('xc-count-lbl').textContent = entries.length ? \`\${entries.length} finishers\` : '';

  const qualN = parseInt(document.getElementById('xc-qual-spots')?.value)||0;
  document.getElementById('xc-finishers-list').innerHTML = entries.map(([k,f],i)=>\`
    <div class="result-row" style="display:flex;align-items:center;gap:6px">
      <span class="place-badge">\${ordinal(i+1)}</span>
      \${f.photo ? '<span style="font-size:0.8rem" title="Photo captured">📷</span>' : ''}
      <span class="result-name" style="flex:1">\${f.name||(f.bib?'Bib '+f.bib:'—')}</span>
      \${qualN > 0 && (i+1) <= qualN ? '<span class="qualifier-chip">🏅 QUAL</span>' : ''}
      <span class="result-time">\${fmtMs(f.elapsedMs)}</span>
    </div>\`).join('');
}

async function exportCSV() {
  const btn = event && event.currentTarget;
  if (btn) { btn.setAttribute('disabled',''); btn.textContent='Exporting…'; }
  try {
    const snap = await cRef('results').once('value');
    const results = snap.val() || {};
    const rows = [['Type','Age','Gender','Event','Place','Name','Time (s)','DQ']];
    Object.values(results)
      .sort((a,b)=>(a.publishedAt||0)-(b.publishedAt||0))
      .forEach(r => {
        if (r.type==='xc') {
          (r.places||[]).forEach(p => {
            rows.push(['XC',r.age||'',r.gender||'',r.event||'',p.place||'',p.name||'',(p.elapsedMs/1000).toFixed(2),'']);
          });
        } else {
          (r.results||[]).forEach(l => {
            const dqFlag = l.dq ? 'Y' : '';
            rows.push(['Lane',r.age||'',r.gender||'',r.event||'',l.dq?'DQ':(l.place||''),l.name||\`Lane \${l.lane}\`,l.dq?'':(l.timeMs/1000).toFixed(2),dqFlag]);
          });
        }
      });
    const csv = rows.map(r=>r.map(c=>\`"\${String(c).replace(/"/g,'\\"')}"\`)  .join(',')).join('\\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = \`results-\${carnivalCode||'carnival'}-\${new Date().toISOString().slice(0,10)}.csv\`;
    a.click();
  } catch(e) { toast('Export failed: ' + e.message); }
  if (btn) { btn.removeAttribute('disabled'); btn.textContent='Export CSV'; }
}

// ════════════════════════════════════════
// ── VIDEO FINISH ─────────────────────────────────────────────────────────────
// STATE
// ── Video Finish: slit camera state ──────────────────────────────────────────
let vfStream        = null;
let vfRaceStartMs   = 0;
let vfOfflineMode   = false;
let vfDetections    = [];
let vfLiveRafId     = null;
let vfLiveState     = 'idle';   // idle|calibrating|ready|detecting|done
let vfLiveOffscr    = null;
let vfFacingMode2   = 'environment';  // renamed to avoid conflict with Task7 var
// Slit camera
let vfSlitInternal  = null;     // canvas holding full slit history
let vfSlitICtx      = null;
const VF_SLIT_W     = 5400;    // ~90s at 60fps
const VF_SLIT_H     = 200;
let vfSlitPos       = 0;        // columns written
let vfGoColumn      = -1;       // column where GO fired
let vfSlitX         = 0.5;     // slit line position (0–1)
let vfBgAccum       = null;    // Float32Array[VF_SLIT_H] background model
let vfBgN           = 0;
let vfLastDetectCol = -999;
let vfDragging      = false;

function vfGetOffset()      { return parseInt(document.getElementById('vf-offset-input')?.value||0,10)||0; }
function vfGetProgress()    { return parseInt(document.getElementById('vf-progress-input')?.value||2,10)||2; }
function vfGetSensitivity() { return parseInt(document.getElementById('vf-sensitivity')?.value||6,10)||6; }

// ── Init ──────────────────────────────────────────────────────────────────────
function initVideoFinish() {
  requestWakeLock(); syncClock();

  // Init slit canvas (OffscreenCanvas not available in all mobile browsers — use regular canvas)
  vfSlitInternal = document.createElement('canvas');
  vfSlitInternal.width  = VF_SLIT_W;
  vfSlitInternal.height = VF_SLIT_H;
  vfSlitICtx = vfSlitInternal.getContext('2d', { willReadFrequently: true });
  vfSlitICtx.fillStyle = '#111';
  vfSlitICtx.fillRect(0, 0, VF_SLIT_W, VF_SLIT_H);
  vfSlitPos       = 0;
  vfGoColumn      = -1;
  vfBgAccum       = new Float32Array(VF_SLIT_H);
  vfBgN           = 0;
  vfLiveState     = 'idle';
  vfDetections    = [];
  vfLiveRafId     = null;
  vfLastDetectCol = -999;
  vfSlitX         = 0.5;

  // Sensitivity slider live label
  const sensSlider = document.getElementById('vf-sensitivity');
  if (sensSlider) sensSlider.oninput = () => {
    const lbl = document.getElementById('vf-sens-val');
    if (lbl) lbl.textContent = sensSlider.value;
  };

  // Wire up slit line drag on live canvas
  const liveCanvas = document.getElementById('vf-live-canvas');
  if (liveCanvas) {
    liveCanvas.addEventListener('mousedown',  vfDragStart, { passive: false });
    liveCanvas.addEventListener('mousemove',  vfDragMove,  { passive: false });
    window.addEventListener('mouseup',        vfDragEnd);
    liveCanvas.addEventListener('touchstart', vfDragStart, { passive: false });
    liveCanvas.addEventListener('touchmove',  vfDragMove,  { passive: false });
    window.addEventListener('touchend',       vfDragEnd);
  }

  // Watch race state
  const ref = cRef('race/current');
  ref.on('value', snap => {
    const rc = snap.val();
    if (!rc) return;
    if (rc.state === 'live' && rc.startedAtServer) {
      if (!vfRaceStartMs) {
        vfRaceStartMs = rc.startedAtServer;
        vfGoColumn    = vfSlitPos;
        vfDrawGoMarker();
      }
      vfOfflineMode = false;
      if (vfLiveState === 'calibrating' || vfLiveState === 'ready') {
        vfLiveState = 'detecting';
        vfSetStatus('🔴 Race live — detecting crossings', '#ef4444');
      }
    } else if (rc.state === 'armed') {
      vfRaceStartMs = 0; vfGoColumn = -1;
      if (vfLiveState === 'detecting' || vfLiveState === 'done') vfLiveState = 'ready';
      vfSetStatus('⚡ Armed — waiting for GO', '#eab308');
    }
  });
  activeListeners.push(() => ref.off());

  vfStartCamera();
}

function vfSetStatus(text, dotColor) {
  const el  = document.getElementById('vf-race-status');
  const dot = document.getElementById('vf-status-dot');
  if (el)  el.textContent = text;
  if (dot) dot.style.background = dotColor || 'var(--muted)';
}

function vfStartCamera() {
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: vfFacingMode2, width:{ideal:1920}, height:{ideal:1080}, frameRate:{ideal:60} },
    audio: false
  }).then(stream => {
    vfStream = stream;
    const vid = document.getElementById('vf-video-preview');
    vid.srcObject = stream; vid.play();
    vid.addEventListener('playing', () => {
      vfLiveState = 'calibrating';
      vfSetStatus('Calibrating…', '#6b7280');
      toast('Camera ready — calibrating…');
      if (!vfLiveRafId) vfLiveRafId = requestAnimationFrame(vfLiveFrame);
    }, { once: true });
  }).catch(err => {
    const msg = err?.name === 'NotFoundError'   ? 'No camera found on this device'
              : err?.name === 'NotAllowedError' ? 'Camera access denied — check browser permissions'
              : 'Camera error: ' + (err?.message || err);
    toast(msg); vfSetStatus('⚠ ' + msg, '#ef4444');
    const canvas = document.getElementById('vf-live-canvas');
    if (canvas) {
      canvas.style.display = 'none';
      const errDiv = document.createElement('div');
      errDiv.id = 'vf-cam-error';
      errDiv.style.cssText = 'text-align:center;padding:32px 16px;background:var(--surface-2);border-radius:12px;margin-bottom:10px';
      errDiv.innerHTML = \`<div style="font-size:2rem;margin-bottom:8px">📷</div><div style="color:var(--danger);font-weight:600;margin-bottom:16px">\${msg}</div><button class="btn btn-primary" onclick="vfRetryCamera()">Retry Camera</button>\`;
      canvas.parentNode.insertBefore(errDiv, canvas);
    }
  });
}

// ── Slit line drag ────────────────────────────────────────────────────────────
function vfDragStart(e) {
  e.preventDefault(); vfDragging = true; vfDragMove(e);
}
function vfDragMove(e) {
  if (!vfDragging) return;
  e.preventDefault();
  const canvas = document.getElementById('vf-live-canvas');
  if (!canvas) return;
  const rect   = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  vfSlitX = Math.max(0.02, Math.min(0.98, (clientX - rect.left) / rect.width));
}
function vfDragEnd() { vfDragging = false; }

// ── Main RAF loop ─────────────────────────────────────────────────────────────
function vfLiveFrame() {
  vfLiveRafId = null;
  if (vfLiveState === 'idle') return;

  const vid = document.getElementById('vf-video-preview');
  if (!vid || !vid.videoWidth) { vfLiveRafId = requestAnimationFrame(vfLiveFrame); return; }

  // Grab frame
  if (!vfLiveOffscr) vfLiveOffscr = document.createElement('canvas');
  const oc = vfLiveOffscr;
  oc.width = vid.videoWidth; oc.height = vid.videoHeight;
  const octx = oc.getContext('2d', { willReadFrequently: true });
  octx.drawImage(vid, 0, 0);

  // Draw live preview with slit line
  vfDrawLiveOverlay(oc);

  // Extract slit column (1px wide, full height)
  const slitPixelX = Math.round(vfSlitX * (oc.width - 1));
  const rawCol = octx.getImageData(slitPixelX, 0, 1, oc.height);

  // Scale to VF_SLIT_H
  const scaledCol = vfScaleColumn(rawCol, oc.height, VF_SLIT_H);

  // Stamp into slit canvas at current position
  if (vfSlitPos < VF_SLIT_W) {
    vfSlitICtx.putImageData(scaledCol, vfSlitPos, 0);
  }

  // Calibration: build background model for ~90 frames (~1.5s)
  if (vfLiveState === 'calibrating') {
    vfBuildBg(scaledCol);
    if (vfBgN >= 90) {
      vfLiveState = vfRaceStartMs ? 'detecting' : 'ready';
      vfSetStatus(vfRaceStartMs ? '🔴 Detecting…' : '✓ Ready — waiting for GO',
                  vfRaceStartMs ? '#ef4444' : '#22c55e');
      toast('Ready!');
    }
  } else if (vfLiveState === 'detecting') {
    vfCheckCrossing(scaledCol);
    // Slowly adapt background to handle lighting changes (skip while crossing active)
    if (vfSlitPos - vfLastDetectCol > 120) vfAdaptBg(scaledCol, 0.015);
  }

  // Render slit display
  vfRenderSlit();

  // Advance position; shift canvas if full
  vfSlitPos++;
  if (vfSlitPos >= VF_SLIT_W) {
    const half = VF_SLIT_W >> 1;
    const img = vfSlitICtx.getImageData(half, 0, VF_SLIT_W - half, VF_SLIT_H);
    vfSlitICtx.fillStyle = '#111';
    vfSlitICtx.fillRect(0, 0, VF_SLIT_W, VF_SLIT_H);
    vfSlitICtx.putImageData(img, 0, 0);
    vfSlitPos       -= half;
    if (vfGoColumn  >= 0) vfGoColumn -= half;
    vfLastDetectCol -= half;
    vfDetections.forEach(d => { if (d._col >= 0) d._col -= half; });
  }

  vfLiveRafId = requestAnimationFrame(vfLiveFrame);
}

// ── Live camera overlay with draggable slit line ──────────────────────────────
function vfDrawLiveOverlay(offscr) {
  const canvas = document.getElementById('vf-live-canvas');
  if (!canvas) return;
  canvas.width = offscr.width; canvas.height = offscr.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(offscr, 0, 0);

  const sx = Math.round(vfSlitX * offscr.width);
  const h  = offscr.height;
  const lineColor = vfLiveState === 'detecting' ? '#ef4444'
                  : vfLiveState === 'ready'     ? '#22c55e'
                  : '#eab308';
  ctx.save();
  // Slit line
  ctx.strokeStyle = lineColor; ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6;
  ctx.setLineDash([10, 5]);
  ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
  ctx.setLineDash([]);
  // Drag handle
  ctx.fillStyle = lineColor;
  ctx.beginPath(); ctx.arc(sx, h >> 1, 16, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.shadowBlur = 0; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('⇔', sx, (h >> 1) + 5);
  // Label
  ctx.textAlign = 'left'; ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = lineColor;
  ctx.fillText('FINISH LINE', sx + 20, 20);
  ctx.restore();
}

// ── Scale pixel column to target height ───────────────────────────────────────
function vfScaleColumn(rawCol, srcH, dstH) {
  const out = new ImageData(1, dstH);
  for (let y = 0; y < dstH; y++) {
    const srcY = Math.round(y * (srcH - 1) / (dstH - 1));
    const si = srcY * 4, di = y * 4;
    out.data[di]   = rawCol.data[si];
    out.data[di+1] = rawCol.data[si+1];
    out.data[di+2] = rawCol.data[si+2];
    out.data[di+3] = 255;
  }
  return out;
}

// ── Background model ──────────────────────────────────────────────────────────
function vfBuildBg(col) {
  const n = vfBgN;
  for (let y = 0; y < VF_SLIT_H; y++) {
    const i = y * 4;
    const g = (col.data[i]*77 + col.data[i+1]*150 + col.data[i+2]*29) >> 8;
    vfBgAccum[y] = (vfBgAccum[y] * n + g) / (n + 1);
  }
  vfBgN++;
}
function vfAdaptBg(col, rate) {
  for (let y = 0; y < VF_SLIT_H; y++) {
    const i = y * 4;
    const g = (col.data[i]*77 + col.data[i+1]*150 + col.data[i+2]*29) >> 8;
    vfBgAccum[y] += (g - vfBgAccum[y]) * rate;
  }
}

// ── Crossing detection ────────────────────────────────────────────────────────
function vfCheckCrossing(col) {
  if (!vfBgAccum || vfBgN < 10 || !vfRaceStartMs) return;
  const debounce = Math.max(20, 60 - vfGetSensitivity() * 4); // 20–56 frames
  if (vfSlitPos - vfLastDetectCol < debounce) return;

  const nowMs    = nowServer();
  const elapsed  = nowMs - vfRaceStartMs - vfGetOffset();
  if (elapsed < 300) return; // ignore first 300ms (GO noise)

  const sens      = vfGetSensitivity();              // 1–10
  const threshold = Math.max(6, 38 - sens * 3);     // 8 (sens=10) – 35 (sens=1)
  const minRows   = Math.round(VF_SLIT_H * (0.35 - sens * 0.02)); // 15%–33% of height

  let diffCount = 0;
  for (let y = 0; y < VF_SLIT_H; y++) {
    const i = y * 4;
    const g = (col.data[i]*77 + col.data[i+1]*150 + col.data[i+2]*29) >> 8;
    if (Math.abs(g - vfBgAccum[y]) > threshold) diffCount++;
  }

  if (diffCount >= minRows) {
    vfLastDetectCol = vfSlitPos;
    const still = vfCaptureStill();
    const entry = { place: vfDetections.length + 1, elapsedMs: elapsed, still, _col: vfSlitPos };
    vfDetections.push(entry);
    vfDetections.sort((a,b) => a.elapsedMs - b.elapsedMs);
    vfDetections.forEach((d,i) => d.place = i + 1);
    vfRenderDetections();
    toast(\`Finish #\${vfDetections.length}: \${fmtMs(elapsed)}\`);
    const dc = document.getElementById('vf-detect-count');
    if (dc) dc.textContent = \`\${vfDetections.length} detected\`;
    // Draw crossing marker on slit canvas
    vfMarkCrossing(vfSlitPos, elapsed, vfDetections.length);
  }
}

function vfCaptureStill() {
  if (!vfLiveOffscr) return null;
  try {
    const tmp = document.createElement('canvas');
    tmp.width = 160; tmp.height = 90;
    tmp.getContext('2d').drawImage(vfLiveOffscr, 0, 0, 160, 90);
    return tmp.toDataURL('image/jpeg', 0.7);
  } catch(e) { return null; }
}

// ── Slit canvas markers ───────────────────────────────────────────────────────
function vfDrawGoMarker() {
  if (!vfSlitICtx || vfGoColumn < 0) return;
  vfSlitICtx.save();
  vfSlitICtx.fillStyle = 'rgba(234,179,8,0.9)';
  vfSlitICtx.fillRect(vfGoColumn, 0, 3, VF_SLIT_H);
  vfSlitICtx.fillStyle = '#eab308';
  vfSlitICtx.font = 'bold 11px sans-serif';
  vfSlitICtx.fillText('GO', Math.min(vfGoColumn + 5, VF_SLIT_W - 30), 14);
  vfSlitICtx.restore();
}

function vfMarkCrossing(col, elapsedMs, place) {
  if (!vfSlitICtx) return;
  vfSlitICtx.save();
  vfSlitICtx.fillStyle = 'rgba(59,130,246,0.85)';
  vfSlitICtx.fillRect(col, 0, 2, VF_SLIT_H);
  vfSlitICtx.fillStyle = '#60a5fa';
  vfSlitICtx.font = 'bold 11px sans-serif';
  const lx = Math.min(col + 4, VF_SLIT_W - 60);
  vfSlitICtx.fillText(\`#\${place}\`, lx, 14);
  vfSlitICtx.fillText(fmtMs(elapsedMs), lx, 27);
  vfSlitICtx.restore();
}

// ── Render slit display canvas ────────────────────────────────────────────────
function vfRenderSlit() {
  const display = document.getElementById('vf-slit-canvas');
  if (!display || !vfSlitICtx) return;
  const dw = display.offsetWidth || 360;
  const dh = 140;
  if (display.width !== dw)  display.width  = dw;
  if (display.height !== dh) display.height = dh;
  const ctx = display.getContext('2d');
  const available = Math.min(vfSlitPos, VF_SLIT_W);
  if (available < 1) { ctx.fillStyle='#111'; ctx.fillRect(0,0,dw,dh); return; }
  // Show the most recent dw columns (scroll left as time advances)
  const showCols = Math.min(available, dw * 2);
  const srcX     = Math.max(0, available - showCols);
  ctx.drawImage(vfSlitInternal, srcX, 0, showCols, VF_SLIT_H, 0, 0, dw, dh);
}

// ── Export slit image as PNG ──────────────────────────────────────────────────
function vfExportSlit() {
  if (!vfSlitInternal || vfSlitPos === 0) { toast('No slit image yet — wait for the race'); return; }
  const used = Math.min(vfSlitPos, VF_SLIT_W);
  const tmp = document.createElement('canvas');
  tmp.width = used; tmp.height = VF_SLIT_H;
  tmp.getContext('2d').drawImage(vfSlitInternal, 0, 0, used, VF_SLIT_H, 0, 0, used, VF_SLIT_H);
  const link = document.createElement('a');
  link.href     = tmp.toDataURL('image/png');
  link.download = \`finish-\${new Date().toISOString().slice(0,16).replace('T','-')}.png\`;
  link.click();
  toast('Finish line photo saved!');
}

// ── Results list ──────────────────────────────────────────────────────────────
function vfRenderDetections() {
  const list = document.getElementById('vf-mark-list');
  if (!list) return;
  if (!vfDetections.length) {
    list.innerHTML = '<div class="text-muted text-sm text-center mt-8">No finishes detected yet</div>'; return;
  }
  const progN = vfGetProgress();
  list.innerHTML = vfDetections.map((d,i) => \`
    <div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--border);flex-wrap:wrap">
      <span class="place-badge">\${ordinal(d.place||i+1)}</span>
      <span style="font-weight:700;font-size:1rem;min-width:80px;font-family:monospace">\${fmtMs(d.elapsedMs)}</span>
      \${(d.place||i+1) <= progN ? '<span style="background:#16a34a;color:#fff;padding:2px 8px;border-radius:4px;font-size:0.7rem;font-weight:700">PROGRESSES</span>' : ''}
      \${d.still ? \`<img src="\${d.still}" style="width:64px;height:36px;object-fit:cover;border-radius:4px;border:1px solid var(--border)">\` : ''}
      <button class="vf-mark-btn" style="color:var(--danger);margin-left:auto" onclick="vfRemove(\${i})">&#x2715;</button>
    </div>\`).join('');
}
function vfRemove(i) {
  vfDetections.splice(i,1);
  vfDetections.forEach((d,j) => d.place = j+1);
  vfRenderDetections();
}

// ── Publish ───────────────────────────────────────────────────────────────────
async function vfPublish() {
  if (!vfDetections.length) { toast('Nothing to publish'); return; }
  const payload = {};
  vfDetections.forEach((d,i) => {
    payload[\`place_\${i+1}\`] = { place: d.place||i+1, elapsedMs: d.elapsedMs };
  });
  await cRef('race/current/videoFinish').set({
    marks: payload, mode: 'slit',
    offsetMs: vfGetOffset(), offlineMode: vfOfflineMode,
    recordedBy: myName || 'Video Finish',
    publishedAt: firebase.database.ServerValue.TIMESTAMP
  });
  toast('Video finish times published!');
  document.getElementById('vf-publish-btn').disabled = true;
}

// ── Camera flip & retry ───────────────────────────────────────────────────────
function vfFlipCamera() {
  vfFacingMode2 = (vfFacingMode2 === 'environment') ? 'user' : 'environment';
  toast(\`Switching to \${vfFacingMode2 === 'user' ? 'front' : 'back'} camera…\`);
  const errDiv = document.getElementById('vf-cam-error');
  if (errDiv) errDiv.remove();
  const canvas = document.getElementById('vf-live-canvas');
  if (canvas) canvas.style.display = '';
  if (vfStream)    { vfStream.getTracks().forEach(t=>t.stop()); vfStream=null; }
  if (vfLiveRafId) { cancelAnimationFrame(vfLiveRafId); vfLiveRafId=null; }
  vfLiveState = 'idle';
  vfStartCamera();
}
function vfRetryCamera() {
  const errDiv = document.getElementById('vf-cam-error');
  if (errDiv) errDiv.remove();
  const canvas = document.getElementById('vf-live-canvas');
  if (canvas) canvas.style.display = '';
  vfSetStatus('Starting camera…', 'var(--muted)');
  vfStartCamera();
}

// ── Cleanup ───────────────────────────────────────────────────────────────────
function vfExit() {
  if (vfLiveRafId) { cancelAnimationFrame(vfLiveRafId); vfLiveRafId = null; }
  if (vfStream)    { vfStream.getTracks().forEach(t=>t.stop()); vfStream = null; }
  window.removeEventListener('mouseup',  vfDragEnd);
  window.removeEventListener('touchend', vfDragEnd);
  vfLiveState = 'idle'; vfDetections = [];
  vfSlitInternal = null; vfSlitICtx = null;
  enterRole('role');
}

// ── Manual add ────────────────────────────────────────────────────────────────
function vfManualAdd() {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  el.innerHTML = \`
    <div style="background:var(--surface);border-radius:16px;padding:24px;max-width:320px;width:100%">
      <div style="font-weight:700;font-size:1rem;margin-bottom:16px">Add Manual Finish</div>
      <div style="margin-bottom:20px">
        <label style="font-size:0.8rem;color:var(--muted)">Time (m:ss.ms or ss.ms)</label>
        <input id="_mf-time" type="text" placeholder="e.g. 1:23.45 or 83.45"
          style="width:100%;margin-top:4px;padding:8px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:1rem">
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" style="flex:1" onclick="this.closest('[style]').remove()">Cancel</button>
        <button class="btn btn-primary" style="flex:1" onclick="vfManualSubmit(this)">Add</button>
      </div>
    </div>\`;
  document.body.appendChild(el);
  setTimeout(() => document.getElementById('_mf-time')?.focus(), 100);
}
function vfManualSubmit(btn) {
  const raw = (document.getElementById('_mf-time')?.value || '').trim();
  let ms = 0;
  if (raw.includes(':')) { const [m,s] = raw.split(':'); ms = (parseFloat(m)*60 + parseFloat(s)) * 1000; }
  else ms = parseFloat(raw) * 1000;
  if (!ms || isNaN(ms) || ms <= 0) { toast('Enter a valid time'); return; }
  btn.closest('[style]').remove();
  vfDetections.push({ place: vfDetections.length+1, elapsedMs: Math.round(ms), still: null, _col: -1 });
  vfDetections.sort((a,b) => a.elapsedMs - b.elapsedMs);
  vfDetections.forEach((d,i) => d.place = i+1);
  vfRenderDetections();
  toast(\`Manual finish added: \${fmtMs(Math.round(ms))}\`);
}

// ── TASK 9: Athlete name persistence ─────────────────────────
function _laneKey(age, gender, event) {
  return \`ct_lanes_\${age}_\${gender}_\${event}\`.replace(/\\s+/g,'_');
}
function _saveLaneNames(age, gender, event, lanes) {
  try { localStorage.setItem(_laneKey(age, gender, event), JSON.stringify(lanes)); } catch(e){}
}
function _loadLaneNames(age, gender, event) {
  try {
    const saved = localStorage.getItem(_laneKey(age, gender, event));
    if (!saved) return;
    const lanes = JSON.parse(saved);
    document.querySelectorAll('.admin-lane-name-input').forEach(inp => {
      const n = inp.dataset.lane;
      if (lanes[n]?.name) inp.value = lanes[n].name;
    });
    toast('Names loaded from last heat ↑');
  } catch(e){}
}

// Auto-load names when dropdowns change (attach after admin view inits)
function _attachLaneNameAutoLoad() {
  const ageSel   = document.getElementById('admin-age-sel');
  const eventSel = document.getElementById('admin-event-sel');
  const load = () => {
    const age   = ageSel?.value;
    const event = eventSel?.value;
    if (age && event && typeof adminGender !== 'undefined') _loadLaneNames(age, adminGender, event);
  };
  if (ageSel)   ageSel.addEventListener('change', load);
  if (eventSel) eventSel.addEventListener('change', load);
}
// Call after a short delay so initAdminView has run
const _origInitAdminView = typeof initAdminView === 'function' ? initAdminView : null;

// ── TASK 10: Timer undo ───────────────────────────────────────
let _timerUndoTimer = null;

function _showTimerUndo(lane, splitKey, elapsedMs) {
  // Clear any existing undo
  if (_timerUndoTimer) { clearTimeout(_timerUndoTimer); _timerUndoTimer = null; }
  const existing = document.getElementById('timer-undo-bar');
  if (existing) existing.remove();

  const bar = document.createElement('div');
  bar.id = 'timer-undo-bar';
  bar.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 20px;display:flex;align-items:center;gap:16px;z-index:9997;box-shadow:0 4px 24px rgba(0,0,0,.4)';
  const timeLeft = document.createElement('span');
  timeLeft.style.cssText = 'font-size:0.85rem;color:var(--muted)';
  timeLeft.textContent = 'Undo stop (3s)';
  const undoBtn = document.createElement('button');
  undoBtn.className = 'btn btn-secondary';
  undoBtn.style.cssText = 'font-size:0.85rem;padding:6px 16px;color:var(--accent);border-color:var(--accent)';
  undoBtn.textContent = '↩ Undo';
  bar.appendChild(timeLeft);
  bar.appendChild(undoBtn);
  document.body.appendChild(bar);

  let secs = 3;
  const tick = setInterval(() => {
    secs--;
    if (secs <= 0) { clearInterval(tick); bar.remove(); }
    else timeLeft.textContent = \`Undo stop (\${secs}s)\`;
  }, 1000);

  undoBtn.onclick = async () => {
    clearInterval(tick);
    clearTimeout(_timerUndoTimer);
    bar.remove();
    try {
      await cRef(\`race/current/splits/\${lane}/\${splitKey}\`).remove();
      const splitBtn = document.getElementById('timer-stop-btn');
      if (splitBtn) { splitBtn.textContent = 'STOP'; splitBtn.removeAttribute('disabled'); }
      toast('↩ Stop undone — tap STOP again when ready');
    } catch(e) {
      toast('Could not undo — split already synced');
    }
  };

  _timerUndoTimer = setTimeout(() => { clearInterval(tick); bar.remove(); }, 3000);
}

// ── TASK 12: Results export ───────────────────────────────────
function adminExportCSV() {
  if (!raceState) { toast('No race data'); return; }
  const lanes  = raceState.lanes  || {};
  const splits = raceState.splits || {};
  const results = [];
  Object.keys(lanes).forEach(lane => {
    const vals = Object.values(splits[lane]||{}).map(s=>s.elapsedMs).filter(Boolean);
    const mean = vals.length ? trimmedMean(vals) : null;
    if (mean != null) results.push({ lane, name: lanes[lane]?.name || \`Lane \${lane}\`, timeMs: mean });
  });
  results.sort((a,b) => a.timeMs - b.timeMs);
  let place = 1;
  results.forEach(r => { r.place = place++; });

  const event   = raceState.event   || '';
  const age     = raceState.age     || '';
  const gender  = raceState.gender  || '';
  const header  = 'Place,Lane,Name,Time\\r\\n';
  const rows    = results.map(r => \`\${r.place},\${r.lane},"\${r.name}",\${fmtSec(r.timeMs)}\`).join('\\r\\n');
  const csv     = header + rows;
  const blob    = new Blob([csv], {type:'text/csv'});
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href = url;
  a.download = \`\${age}-\${gender}-\${event}-results.csv\`.replace(/\\s+/g,'_');
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV downloaded');
}

function adminPrintResults() {
  if (!raceState) { toast('No race data'); return; }
  const lanes  = raceState.lanes  || {};
  const splits = raceState.splits || {};
  const results = [];
  Object.keys(lanes).forEach(lane => {
    const vals = Object.values(splits[lane]||{}).map(s=>s.elapsedMs).filter(Boolean);
    const mean = vals.length ? trimmedMean(vals) : null;
    if (mean != null) results.push({ lane, name: lanes[lane]?.name || \`Lane \${lane}\`, timeMs: mean });
  });
  results.sort((a,b) => a.timeMs - b.timeMs);
  let place = 1;
  results.forEach(r => { r.place = place++; });

  const medals = ['🥇','🥈','🥉'];
  const rows   = results.map(r =>
    \`<tr><td style="text-align:center;font-size:1.4rem">\${medals[r.place-1]||r.place}</td><td>\${r.lane}</td><td style="font-weight:600">\${r.name}</td><td style="font-family:monospace;font-size:1.1rem">\${fmtSec(r.timeMs)}</td></tr>\`
  ).join('');

  const win = window.open('','_blank');
  win.document.write(\`<!DOCTYPE html><html><head><title>Results</title>
  <style>body{font-family:sans-serif;padding:32px;max-width:600px;margin:auto}h1{font-size:1.4rem;margin-bottom:4px}h2{font-size:1rem;color:#666;margin-bottom:24px;font-weight:400}table{width:100%;border-collapse:collapse}th{text-align:left;border-bottom:2px solid #ddd;padding:8px 12px;font-size:.85rem;text-transform:uppercase;color:#888}td{padding:10px 12px;border-bottom:1px solid #eee}@media print{button{display:none}}</style>
  </head><body>
  <h1>\${raceState.event||'Race Results'}</h1>
  <h2>\${raceState.age||''} \${raceState.gender||''} &mdash; \${new Date().toLocaleDateString('en-AU')}</h2>
  <table><thead><tr><th>Place</th><th>Lane</th><th>Athlete</th><th>Time</th></tr></thead><tbody>\${rows}</tbody></table>
  <p style="margin-top:32px;font-size:.75rem;color:#aaa">Generated by Carnival Timing &mdash; carnivaltiming.com</p>
  <button onclick="window.print()" style="margin-top:16px;padding:10px 24px;font-size:1rem;cursor:pointer">🖨 Print</button>
  
<div id="ct-footer" style="position:fixed;bottom:0;left:0;right:0;background:rgba(13,27,62,0.92);backdrop-filter:blur(6px);color:rgba(255,255,255,0.5);font-size:11px;text-align:center;padding:6px 16px;z-index:100;display:flex;justify-content:center;gap:16px;align-items:center;flex-wrap:wrap;">
  <span>© 2026 Luck Dragon Pty Ltd</span>
  <span>·</span>
  <a href="/privacy" style="color:rgba(255,255,255,0.5);text-decoration:none;" target="_blank">Privacy</a>
  <span>·</span>
  <a href="https://schoolsportportal.com.au" style="color:rgba(255,255,255,0.5);text-decoration:none;" target="_blank">School Sport Portal</a>
</div>
</body></html>\`);
  win.document.close();
}

// Attach lane-name autoload after DOM is ready
setTimeout(_attachLaneNameAutoLoad, 1500);

// ════════════════════════════════════════════════════════
//  CT v8.5.1 — Auto Finish Line Detection
// ════════════════════════════════════════════════════════
let xcAutoDetectMode = false;
let xcAutoPlaceCounter = 0; // local counter, incremented immediately to avoid race
let _xcResizeListener = null; // FIX 3: track resize listener for cleanup
let xcLineP1         = null;   // {x,y} normalised 0-1
let xcLineP2         = null;
let xcPrevSamples    = null;
let xcDetectInterval = null;
let xcLastTrigger    = 0;
let xcDiffThreshold  = 22;     // controlled by sensitivity slider
const XC_COOLDOWN_MS = 2800;   // min ms between auto-detections
const XC_SAMPLES     = 80;     // pixels sampled along finish line

// ── Mode toggle ─────────────────────────────────────────
function xcStartAutoMode() {
  xcAutoDetectMode = true;
  document.getElementById('marshal-tap-btn').style.display    = 'none';
  document.getElementById('xc-auto-mode-btn').style.display   = 'none';
  document.getElementById('xc-auto-bar').style.display        = 'flex';
  document.getElementById('xc-detect-status').textContent     = 'Draw your finish line to begin';
  xcInitCamera().then(() => {
    if (!xcCamStream) {
      // Camera denied — show message but still allow manual tap fallback
      toast('Camera access denied — auto-detect requires camera permission');
      xcStopAutoMode();
      return;
    }
    xcShowLineSetup();
  });
}

function xcStopAutoMode() {
  xcAutoDetectMode = false;
  xcStopDetect();
  if (_xcResizeListener) { window.removeEventListener('resize', _xcResizeListener); _xcResizeListener = null; } // FIX 3
  document.getElementById('marshal-tap-btn').style.display    = '';
  document.getElementById('xc-auto-mode-btn').style.display   = '';
  document.getElementById('xc-auto-bar').style.display        = 'none';
  document.getElementById('xc-line-setup-overlay').style.display = 'none';
}

// ── Line setup ───────────────────────────────────────────
function xcShowLineSetup() {
  const overlay = document.getElementById('xc-line-setup-overlay');
  overlay.style.display = 'flex';
  xcLineP1 = null; xcLineP2 = null;
  document.getElementById('xc-start-detect-btn').style.display = 'none';
  document.getElementById('xc-line-instruction').textContent   = 'Tap the LEFT edge of your finish line';

  // Wire up the camera stream to the setup video
  const vid = document.getElementById('xc-setup-vid');
  if (xcCamStream) { vid.srcObject = xcCamStream; vid.play().catch(()=>{}); }

  // Resize canvas to match overlay — FIX 3: remove old listener before adding
  const canvas = document.getElementById('xc-line-canvas-overlay');
  if (_xcResizeListener) window.removeEventListener('resize', _xcResizeListener);
  _xcResizeListener = () => { canvas.width = overlay.clientWidth; canvas.height = overlay.clientHeight; xcDrawLine(); };
  _xcResizeListener();
  window.addEventListener('resize', _xcResizeListener);

  // Tap handler on the canvas
  canvas.ontouchstart = (e) => { e.preventDefault(); xcLineSetupTap(e.touches[0], canvas); };
  canvas.onmousedown  = (e) => xcLineSetupTap(e, canvas);
}

function xcCloseLineSetup() {
  document.getElementById('xc-line-setup-overlay').style.display = 'none';
  if (!xcDetectInterval) document.getElementById('xc-detect-status').textContent = 'Draw your finish line to begin';
}

function xcLineSetupTap(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top)  / rect.height;

  if (!xcLineP1) {
    xcLineP1 = {x, y};
    document.getElementById('xc-line-instruction').textContent = 'Now tap the RIGHT edge';
  } else if (!xcLineP2) {
    xcLineP2 = {x, y};
    document.getElementById('xc-line-instruction').textContent = '✅ Line set — ready to detect';
    document.getElementById('xc-start-detect-btn').style.display = '';
  }
  xcDrawLine();
}

function xcResetLine() {
  xcLineP1 = xcLineP2 = null;
  document.getElementById('xc-start-detect-btn').style.display = 'none';
  document.getElementById('xc-line-instruction').textContent   = 'Tap the LEFT edge of your finish line';
  xcDrawLine();
}

function xcDrawLine() {
  const canvas = document.getElementById('xc-line-canvas-overlay');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;

  if (xcLineP1) {
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(xcLineP1.x * W, xcLineP1.y * H, 14, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('L', xcLineP1.x * W, xcLineP1.y * H + 4);
  }
  if (xcLineP2) {
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(xcLineP2.x * W, xcLineP2.y * H, 14, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R', xcLineP2.x * W, xcLineP2.y * H + 4);
  }
  if (xcLineP1 && xcLineP2) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth   = 4;
    ctx.setLineDash([14, 7]);
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.moveTo(xcLineP1.x * W, xcLineP1.y * H);
    ctx.lineTo(xcLineP2.x * W, xcLineP2.y * H);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
  }
}

// ── Detection loop ───────────────────────────────────────
function xcStartDetect() {
  if (!xcLineP1 || !xcLineP2) return;
  xcCloseLineSetup();
  xcPrevSamples    = null;
  xcLastTrigger    = 0;
  // FIX 4: sync local counter with current Firebase finish count before starting
  xcAutoPlaceCounter = Object.keys(xcState?.finishes || {}).length;
  document.getElementById('xc-detect-status').textContent = '🔴 Detecting — runners auto-recorded';
  xcDetectInterval = setInterval(xcAnalyseFrame, 110); // ~9 fps
}

function xcStopDetect() {
  clearInterval(xcDetectInterval);
  xcDetectInterval = null;
  xcPrevSamples    = null;
}

// Offscreen canvas for detection — never touches xc-cap
let _xcDetectCanvas = null;

function xcAnalyseFrame() {
  if (!xcCamStream) return;
  if (!xcLineP1 || !xcLineP2) return; // FIX 6: guard null line points
  const video = document.getElementById('xc-cam');
  if (!video || video.readyState < 2) return;

  if (!_xcDetectCanvas) {
    _xcDetectCanvas = document.createElement('canvas');
    _xcDetectCanvas.width = 320; _xcDetectCanvas.height = 240;
  }
  const W = 320, H = 240;
  const ctx = _xcDetectCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, W, H);

  const imgData = ctx.getImageData(0, 0, W, H);
  const samples = xcSampleLine(imgData, xcLineP1, xcLineP2, XC_SAMPLES);

  if (xcPrevSamples) {
    const diff = xcLineDiff(samples, xcPrevSamples);
    const now  = Date.now();
    if (diff > xcDiffThreshold && (now - xcLastTrigger) > XC_COOLDOWN_MS) {
      xcLastTrigger = now;
      xcAutoFinish();
    }
  }
  xcPrevSamples = samples;
}

function xcSampleLine(imgData, p1, p2, n) {
  const { data, width, height } = imgData;
  const out = [];
  for (let i = 0; i < n; i++) {
    const t  = i / (n - 1);
    const px = Math.min(width  - 1, Math.max(0, Math.round(p1.x * width  + t * (p2.x - p1.x) * width)));
    const py = Math.min(height - 1, Math.max(0, Math.round(p1.y * height + t * (p2.y - p1.y) * height)));
    const idx = (py * width + px) * 4;
    out.push((data[idx] + data[idx+1] + data[idx+2]) / 3);
  }
  return out;
}

function xcLineDiff(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
}

// ── Auto-trigger a finish ────────────────────────────────
async function xcAutoFinish() {
  if (!xcState || xcState.state !== 'live') return;

  const elapsed = nowServer() - xcState.startedAtServer;
  // FIX 4: increment local counter immediately — don't read Firebase state
  // (Firebase snapshot may lag, causing two fast finishes to get the same place)
  xcAutoPlaceCounter++;
  const place = xcAutoPlaceCounter;

  // Audio + haptic feedback
  xcDetectBeep();
  vibrate([80, 40, 80]);

  const key = myId.slice(0, 4) + '-' + Date.now().toString(36);
  xcCapturePhoto(key); // burst capture

  // Write to Firebase (same structure as marshalTap)
  await cRef(\`xc/current/finishes/\${key}\`).set({
    marshalId:   myId,
    marshalName: myName || 'Auto',
    bib:         '',
    name:        '',
    elapsedMs:   elapsed,
    tapAt:       firebase.database.ServerValue.TIMESTAMP,
    autoDetected: true,
  });

  document.getElementById('xc-detect-status').textContent = \`⚡ #\${place} detected — \${fmtMs(elapsed)}\`;
  setTimeout(() => {
    if (xcDetectInterval) document.getElementById('xc-detect-status').textContent = '🔴 Detecting — runners auto-recorded';
  }, 2000);

  // Queue bib entry — but try OCR first with auto-confirm
  bibPendingQueue.push({ key, place, elapsed, autoDetected: true });
  if (!bibPendingKey) showNextBib();
}

function xcDetectBeep() {
  try {
    const ac  = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.frequency.value = 920;
    osc.type = 'sine';
    g.gain.setValueAtTime(0.35, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
    osc.start(); osc.stop(ac.currentTime + 0.25);
  } catch(e) {}
}

</script>
`;
const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
  'X-CT-Version': 'v8.7.0',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=()',
  'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: wss: data: blob:; frame-ancestors 'self';",
};

const PRIVACY_HTML = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Privacy Policy \u2014 Luck Dragon</title>\n<meta name=\"robots\" content=\"index, follow\">\n<style>\n*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;line-height:1.7}\na{color:#1a56db;text-decoration:none}a:hover{text-decoration:underline}\n.hero{background:linear-gradient(135deg,#0d1b3e 0%,#1a3a6e 60%,#1a56db 100%);color:#fff;padding:56px 24px 72px;text-align:center;position:relative;overflow:hidden}\n.hero::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:36px;background:#f8fafc;clip-path:ellipse(55% 100% at 50% 100%)}\n.badge{display:inline-block;background:rgba(245,158,11,.18);border:1px solid rgba(245,158,11,.4);color:#f59e0b;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 14px;border-radius:20px;margin-bottom:14px}\n.hero h1{font-size:clamp(26px,5vw,40px);font-weight:900;letter-spacing:-.02em;margin-bottom:10px}\n.hero p{font-size:14px;opacity:.78;max-width:520px;margin:0 auto}\n.container{max-width:760px;margin:0 auto;padding:48px 24px 80px}\n.section{margin-bottom:40px}\nh2{font-size:18px;font-weight:800;color:#0d1b3e;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0}\nh3{font-size:14px;font-weight:700;color:#0f172a;margin:18px 0 6px}\np{font-size:14px;color:#334155;margin-bottom:10px}\nul{font-size:14px;color:#334155;padding-left:20px;margin-bottom:10px}\nul li{margin-bottom:5px}\n.card{background:#fff;border-radius:14px;padding:22px 26px;box-shadow:0 2px 10px rgba(0,0,0,.07);margin-bottom:16px}\n.highlight{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 18px;font-size:13px;color:#1e40af;margin:16px 0}\n.products{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:12px 0}\n.product{background:#f1f5f9;border-radius:10px;padding:14px 16px}\n.product .name{font-size:13px;font-weight:700;color:#0f172a;margin-bottom:4px}\n.product .desc{font-size:12px;color:#64748b}\n.updated{font-size:12px;color:#94a3b8;margin-bottom:32px}\nfooter{background:#0d1b3e;color:rgba(255,255,255,.5);text-align:center;padding:24px;font-size:12px}\nfooter a{color:rgba(255,255,255,.7)}\n</style>\n</head>\n<body>\n<div class=\"hero\">\n  <div class=\"badge\">Legal</div>\n  <h1>Privacy Policy</h1>\n  <p>How Luck Dragon collects, uses, and protects your information across all our school sport products.</p>\n</div>\n<div class=\"container\">\n  <p class=\"updated\">Last updated: 1 May 2026 &nbsp;\u00b7&nbsp; Luck Dragon Pty Ltd (ABN 64 697 434 898)</p>\n\n  <div class=\"highlight\">\n    <strong>The short version:</strong> We collect only what we need to run school sport. Student data is stored securely in Australia and never sold, shared with advertisers, or used for any purpose outside school sport coordination.\n  </div>\n\n  <div class=\"section\">\n    <h2>1. Who We Are</h2>\n    <div class=\"card\">\n      <p>Luck Dragon Pty Ltd (ABN 64 697 434 898) operates three school sport products:</p>\n      <div class=\"products\">\n        <div class=\"product\"><div class=\"name\">School Sport Portal</div><div class=\"desc\">schoolsportportal.com.au \u2014 school, district &amp; division portals</div></div>\n        <div class=\"product\"><div class=\"name\">Carnival Timing</div><div class=\"desc\">carnivaltiming.com \u2014 live race timing for carnivals</div></div>\n        <div class=\"product\"><div class=\"name\">SportCarnival</div><div class=\"desc\">sportcarnival.com.au \u2014 carnival results and draw management</div></div>\n      </div>\n      <p>This Privacy Policy applies to all three products. For questions, contact us at <a href=\"mailto:info@sportportal.com.au\">info@sportportal.com.au</a>.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>2. What Data We Collect</h2>\n    <div class=\"card\">\n      <h3>Student Performance Data (Carnival Timing &amp; School Sport Portal)</h3>\n      <p>When a school coordinator uses our timing tools, we store:</p>\n      <ul>\n        <li>First name and last initial (never full surnames publicly)</li>\n        <li>Age group and gender category</li>\n        <li>Race/event times and placing</li>\n        <li>School name and district</li>\n        <li>House group (where entered)</li>\n      </ul>\n      <p>Full names are only visible to signed-in coordinators. Public result views show first name + last initial + school only.</p>\n\n      <h3>Coordinator Account Data</h3>\n      <ul>\n        <li>Email address (for account access and notifications)</li>\n        <li>School name and role</li>\n        <li>Access code and subscription status (Carnival Timing)</li>\n      </ul>\n\n      <h3>Contact Form Submissions (School Sport Portal)</h3>\n      <ul>\n        <li>Name, email address, school, and message content</li>\n        <li>Used only to respond to your enquiry</li>\n      </ul>\n\n      <h3>Technical Data</h3>\n      <ul>\n        <li>Browser type and device (Cloudflare analytics only \u2014 no cookies placed)</li>\n        <li>Pages visited and time on site (aggregate, not individual tracking)</li>\n        <li>IP address (retained by Cloudflare per their standard policy, not accessed by us)</li>\n      </ul>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>3. How We Use Your Data</h2>\n    <div class=\"card\">\n      <p>We use data only for the following purposes:</p>\n      <ul>\n        <li><strong>Displaying carnival results</strong> \u2014 showing times and placings to school staff and parents</li>\n        <li><strong>Selecting representative teams</strong> \u2014 surfacing top performers at district, division and region level</li>\n        <li><strong>Account management</strong> \u2014 validating access codes and processing subscriptions</li>\n        <li><strong>Responding to enquiries</strong> \u2014 replying to contact form submissions</li>\n        <li><strong>Improving our products</strong> \u2014 fixing bugs, improving reliability, adding features</li>\n      </ul>\n      <p>We do <strong>not</strong> use data for advertising, profiling, or any purpose unrelated to school sport.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>4. Data Storage &amp; Security</h2>\n    <div class=\"card\">\n      <p>All data is stored in Australia using the following services:</p>\n      <ul>\n        <li><strong>Cloudflare Workers &amp; KV</strong> \u2014 edge infrastructure with Australian data residency</li>\n        <li><strong>Cloudflare Workers WebSocket</strong> \u2014 Cloudflare global edge (Australian PoPs)</li>\n      </ul>\n      <p>Access to student data requires coordinator authentication. Public-facing result pages display only anonymised data (first name + last initial). We use HTTPS across all services. No passwords are stored \u2014 access is managed via Cloudflare Access and single-use codes.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>5. Data Retention</h2>\n    <div class=\"card\">\n      <p>Carnival result data is retained for a maximum of 3 years to support historical team selection records. Contact form submissions are retained for 12 months. You may request deletion of any data we hold about your school at any time by emailing <a href=\"mailto:info@sportportal.com.au\">info@sportportal.com.au</a>.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>6. Sharing of Data</h2>\n    <div class=\"card\">\n      <p>We do not sell, rent, or share personal data with third parties, except:</p>\n      <ul>\n        <li><strong>Stripe</strong> \u2014 payment processing for Carnival Timing subscriptions. Stripe handles card data directly; we never see or store payment card numbers.</li>\n        <li><strong>Resend</strong> \u2014 transactional email delivery for contact form replies and access code emails.</li>\n        <li><strong>Cloudflare</strong> \u2014 infrastructure provider. Cloudflare processes request data per their own Privacy Policy.</li>\n      </ul>\n      <p>All third-party providers are bound by data processing agreements and applicable privacy law.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>7. Australian Privacy Act Compliance</h2>\n    <div class=\"card\">\n      <p>Luck Dragon Pty Ltd is committed to compliance with the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs). In particular:</p>\n      <ul>\n        <li><strong>APP 1</strong> \u2014 This policy is publicly available and describes our data practices</li>\n        <li><strong>APP 3</strong> \u2014 We collect only information reasonably necessary for our school sport functions</li>\n        <li><strong>APP 6</strong> \u2014 Data is used only for the primary purpose of collection</li>\n        <li><strong>APP 8</strong> \u2014 Cross-border disclosures are limited to service providers with equivalent protections</li>\n        <li><strong>APP 11</strong> \u2014 We take reasonable steps to protect data from misuse, loss, and unauthorised access</li>\n        <li><strong>APP 12/13</strong> \u2014 Individuals and schools may access and correct data held about them on request</li>\n      </ul>\n      <p>As our products are used in Victorian government school settings, we also have regard to the <em>Privacy and Data Protection Act 2014</em> (Vic) and Department of Education guidelines for school data management.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>8. Children's Privacy</h2>\n    <div class=\"card\">\n      <p>Our products are designed for use by school sport coordinators and PE teachers, not directly by children. Students do not create accounts or directly interact with our platforms. Student data is entered by authorised school staff only. Public result views are limited to non-identifying information (first name, last initial, school, time).</p>\n      <p>Schools are responsible for obtaining any required parental consents in accordance with their own privacy policies and department requirements before entering student data.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>9. Your Rights</h2>\n    <div class=\"card\">\n      <p>You (or your school) may at any time:</p>\n      <ul>\n        <li>Request a copy of data we hold about your school</li>\n        <li>Request correction of inaccurate data</li>\n        <li>Request deletion of your school's data</li>\n        <li>Opt out of any communications from us</li>\n      </ul>\n      <p>To exercise any of these rights, email <a href=\"mailto:info@sportportal.com.au\">info@sportportal.com.au</a>. We will respond within 30 days.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>10. Changes to This Policy</h2>\n    <div class=\"card\">\n      <p>We may update this Privacy Policy from time to time. Material changes will be notified to active subscribers by email. The \"Last updated\" date at the top of this page reflects the most recent revision. Continued use of our products after changes constitutes acceptance of the updated policy.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>11. Contact &amp; Complaints</h2>\n    <div class=\"card\">\n      <p>For privacy enquiries or complaints:</p>\n      <ul>\n        <li><strong>Email:</strong> <a href=\"mailto:info@sportportal.com.au\">info@sportportal.com.au</a></li>\n        <li><strong>Company:</strong> Luck Dragon Pty Ltd, ABN 64 697 434 898</li>\n        <li><strong>Location:</strong> Victoria, Australia</li>\n      </ul>\n      <p>If you are not satisfied with our response to a complaint, you may contact the <a href=\"https://www.oaic.gov.au\" target=\"_blank\" rel=\"noopener\">Office of the Australian Information Commissioner (OAIC)</a>.</p>\n    </div>\n  </div>\n</div>\n<footer>\n  &copy; 2026 Luck Dragon Pty Ltd &nbsp;&middot;&nbsp; ABN 64 697 434 898 &nbsp;&middot;&nbsp;\n  <a href=\"/privacy\">Privacy Policy</a> &nbsp;&middot;&nbsp; <a href=\"/terms\">Terms of Service</a> &nbsp;&middot;&nbsp;\n  <a href=\"mailto:info@sportportal.com.au\">info@sportportal.com.au</a>\n</footer>\n</body>\n</html>";
const TERMS_HTML = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Terms of Service \u2014 Luck Dragon</title>\n<meta name=\"robots\" content=\"index, follow\">\n<style>\n*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;line-height:1.7}\na{color:#1a56db;text-decoration:none}a:hover{text-decoration:underline}\n.hero{background:linear-gradient(135deg,#0d1b3e 0%,#1a3a6e 60%,#1a56db 100%);color:#fff;padding:56px 24px 72px;text-align:center;position:relative;overflow:hidden}\n.hero::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:36px;background:#f8fafc;clip-path:ellipse(55% 100% at 50% 100%)}\n.badge{display:inline-block;background:rgba(245,158,11,.18);border:1px solid rgba(245,158,11,.4);color:#f59e0b;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 14px;border-radius:20px;margin-bottom:14px}\n.hero h1{font-size:clamp(26px,5vw,40px);font-weight:900;letter-spacing:-.02em;margin-bottom:10px}\n.hero p{font-size:14px;opacity:.78;max-width:520px;margin:0 auto}\n.container{max-width:760px;margin:0 auto;padding:48px 24px 80px}\n.section{margin-bottom:40px}\nh2{font-size:18px;font-weight:800;color:#0d1b3e;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0}\nh3{font-size:14px;font-weight:700;color:#0f172a;margin:18px 0 6px}\np{font-size:14px;color:#334155;margin-bottom:10px}\nul{font-size:14px;color:#334155;padding-left:20px;margin-bottom:10px}\nul li{margin-bottom:5px}\n.card{background:#fff;border-radius:14px;padding:22px 26px;box-shadow:0 2px 10px rgba(0,0,0,.07);margin-bottom:16px}\n.highlight{background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;font-size:13px;color:#92400e;margin:16px 0}\n.pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:12px 0}\n.price-card{background:#f1f5f9;border-radius:10px;padding:16px;text-align:center}\n.price-card .plan{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:4px}\n.price-card .amount{font-size:24px;font-weight:900;color:#0d1b3e}\n.price-card .period{font-size:11px;color:#94a3b8;margin-top:2px}\n.updated{font-size:12px;color:#94a3b8;margin-bottom:32px}\nfooter{background:#0d1b3e;color:rgba(255,255,255,.5);text-align:center;padding:24px;font-size:12px}\nfooter a{color:rgba(255,255,255,.7)}\n</style>\n</head>\n<body>\n<div class=\"hero\">\n  <div class=\"badge\">Legal</div>\n  <h1>Terms of Service</h1>\n  <p>The terms that govern your use of School Sport Portal, Carnival Timing, and SportCarnival.</p>\n</div>\n<div class=\"container\">\n  <p class=\"updated\">Last updated: 1 May 2026 &nbsp;\u00b7&nbsp; Luck Dragon Pty Ltd (ABN 64 697 434 898)</p>\n\n  <div class=\"highlight\">\n    By using any Luck Dragon product, you agree to these terms. If you are using our products on behalf of a school, you confirm you have authority to bind the school to these terms.\n  </div>\n\n  <div class=\"section\">\n    <h2>1. Our Products</h2>\n    <div class=\"card\">\n      <p>Luck Dragon Pty Ltd (ABN 64 697 434 898) provides three school sport software products:</p>\n      <ul>\n        <li><strong>School Sport Portal</strong> (schoolsportportal.com.au) \u2014 school, district, and division sport information portals for Australian primary schools</li>\n        <li><strong>Carnival Timing</strong> (carnivaltiming.com) \u2014 real-time race timing and results management for school athletics, swimming, and cross country carnivals</li>\n        <li><strong>SportCarnival</strong> (sportcarnival.com.au) \u2014 carnival draw and results management tools</li>\n      </ul>\n      <p>These Terms of Service apply to all three products and any associated services.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>2. Eligibility &amp; Account Access</h2>\n    <div class=\"card\">\n      <p>Our products are intended for use by:</p>\n      <ul>\n        <li>PE teachers, sport coordinators, and school administrators at Australian primary and secondary schools</li>\n        <li>District, division, and regional sport coordinators</li>\n        <li>Parents and community members viewing published results (read-only)</li>\n      </ul>\n      <p>You must be 18 years or older to create an account or purchase a subscription. Students do not create accounts and do not directly use our platforms \u2014 all student data is entered by authorised school staff.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>3. Carnival Timing \u2014 Pricing &amp; Subscriptions</h2>\n    <div class=\"card\">\n      <p>Carnival Timing is a paid product. Current pricing:</p>\n      <div class=\"pricing\">\n        <div class=\"price-card\"><div class=\"plan\">Per Carnival</div><div class=\"amount\">$49</div><div class=\"period\">One-time, per event</div></div>\n        <div class=\"price-card\"><div class=\"plan\">Annual</div><div class=\"amount\">$149</div><div class=\"period\">Per year, unlimited carnivals</div></div>\n      </div>\n      <h3>Payment</h3>\n      <p>Payments are processed securely by Stripe. We do not store card details. All prices are in AUD and include GST where applicable.</p>\n      <h3>Access Codes</h3>\n      <p>On successful payment, you receive an access code by email. This code is linked to your school and grants access to the Carnival Timing app for the purchased period. Access codes are non-transferable.</p>\n      <h3>Refunds</h3>\n      <p>Per-carnival purchases ($49): if you experience a technical failure that prevents you from running your carnival and we are unable to resolve it, we will issue a full refund. Change-of-mind refunds are not available once an access code has been used to enter athlete data.</p>\n      <p>Annual subscriptions ($149): a full refund is available within 14 days of purchase if no carnival data has been entered. After 14 days or after use, no refund is available.</p>\n      <p>To request a refund, email <a href=\"mailto:info@sportportal.com.au\">info@sportportal.com.au</a> with your access code and reason.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>4. School Sport Portal \u2014 Pricing</h2>\n    <div class=\"card\">\n      <p>School Sport Portal is priced at <strong>$1 per student per year</strong> for schools with a managed portal. District and division portals are priced separately \u2014 contact us for a quote. A free demo portal is available at <a href=\"https://schoolsportportal.com.au/demo-school\">schoolsportportal.com.au/demo-school</a>.</p>\n      <p>SportCarnival is currently free to use. Future paid features will be announced with at least 30 days notice to existing users.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>5. Acceptable Use</h2>\n    <div class=\"card\">\n      <p>You agree not to:</p>\n      <ul>\n        <li>Enter false or fabricated student data, results, or times</li>\n        <li>Share access codes with schools or individuals not covered by your subscription</li>\n        <li>Attempt to reverse-engineer, copy, or reproduce our software or designs</li>\n        <li>Use our products for any purpose other than legitimate school sport coordination</li>\n        <li>Scrape, bulk-download, or systematically extract data from our platforms</li>\n        <li>Attempt to access accounts or data belonging to other schools</li>\n      </ul>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>6. Student Data Responsibility</h2>\n    <div class=\"card\">\n      <p>Schools are responsible for:</p>\n      <ul>\n        <li>Ensuring they have appropriate authority to enter student data into our systems</li>\n        <li>Complying with their own school and departmental privacy policies when using our products</li>\n        <li>Notifying us promptly if student data needs to be corrected or removed</li>\n        <li>Keeping their access credentials secure</li>\n      </ul>\n      <p>We act as a data processor on behalf of schools for student performance data. Schools remain the data controller under the <em>Privacy Act 1988</em> (Cth) and relevant state legislation.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>7. Accuracy of Results</h2>\n    <div class=\"card\">\n      <p>Carnival Timing is a software tool designed to assist with manual race timing. We make no guarantee that recorded times are officially accurate for purposes beyond school sport carnivals. Results recorded by our system should be verified by a qualified official before being used for any formal selection, record-keeping, or competitive purpose beyond the school carnival level.</p>\n      <p>Luck Dragon Pty Ltd accepts no liability for decisions made by schools, districts, divisions, or regions based on timing data recorded using our products.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>8. Service Availability</h2>\n    <div class=\"card\">\n      <p>We aim for high availability but do not guarantee uninterrupted access. Our products run on Cloudflare's global network, which has strong uptime guarantees, but maintenance, updates, or unexpected outages may occur. We are not liable for losses arising from service unavailability.</p>\n      <p>If a paid service is unavailable on the day of your carnival due to our error, we will provide a refund as described in Section 3.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>9. Intellectual Property</h2>\n    <div class=\"card\">\n      <p>All software, designs, text, and branding on our platforms are owned by Luck Dragon Pty Ltd. You may not copy, reproduce, or create derivative works from any part of our products without prior written consent. Student performance data entered by schools remains the property of the relevant school.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>10. Limitation of Liability</h2>\n    <div class=\"card\">\n      <p>To the maximum extent permitted by Australian law, Luck Dragon Pty Ltd's total liability to you for any claim arising from your use of our products is limited to the amount you paid us in the 12 months preceding the claim (or $100 if you have not paid us anything).</p>\n      <p>We are not liable for indirect, incidental, or consequential losses including lost data, missed carnival events, or decisions made based on our results.</p>\n      <p>Nothing in these terms excludes rights you have under Australian consumer law that cannot be excluded by contract.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>11. Governing Law</h2>\n    <div class=\"card\">\n      <p>These Terms of Service are governed by the laws of Victoria, Australia. Any disputes will be subject to the non-exclusive jurisdiction of the courts of Victoria.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>12. Changes to These Terms</h2>\n    <div class=\"card\">\n      <p>We may update these terms from time to time. Active subscribers will be notified of material changes by email at least 14 days before they take effect. Continued use of our products after that date constitutes acceptance of the updated terms.</p>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>13. Contact</h2>\n    <div class=\"card\">\n      <ul>\n        <li><strong>Email:</strong> <a href=\"mailto:info@sportportal.com.au\">info@sportportal.com.au</a></li>\n        <li><strong>Company:</strong> Luck Dragon Pty Ltd</li>\n        <li><strong>ABN:</strong> 64 697 434 898</li>\n        <li><strong>Location:</strong> Victoria, Australia</li>\n      </ul>\n    </div>\n  </div>\n</div>\n<footer>\n  &copy; 2026 Luck Dragon Pty Ltd &nbsp;&middot;&nbsp; ABN 64 697 434 898 &nbsp;&middot;&nbsp;\n  <a href=\"/privacy\">Privacy Policy</a> &nbsp;&middot;&nbsp; <a href=\"/terms\">Terms of Service</a> &nbsp;&middot;&nbsp;\n  <a href=\"mailto:info@sportportal.com.au\">info@sportportal.com.au</a>\n</footer>\n</body>\n</html>";

export default {
  async fetch(req, env, ctx) {
    const _path = new URL(req.url).pathname;
    if (_path === '/privacy') return new Response(PRIVACY_HTML, {status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=3600'}});
    if (_path === '/terms')   return new Response(TERMS_HTML,   {status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=3600'}});
    return new Response(HTML, { headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      'X-CT-Version': 'v8.7.0',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=()',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: wss: data: blob:; frame-ancestors 'self';",
    }});
  }
};

