# Session Handover — 2026-05-05 (Session 6)

> **Engineering rules apply across all products** —
> read [`docs/ENGINEERING-RULES.md`](ENGINEERING-RULES.md) at session start.

**Vault PIN:** `<VAULT_PIN>`
**Get any credential:** `curl -H "X-Pin: <VAULT_PIN>" https://asgard-vault.pgallivan.workers.dev/secret/KEY_NAME`

---

## Cowork / Claude file delivery rules (2026-05-06)

These rules are enforced in every Cowork session and stored in persistent memory.

### Binary deliverables (PDF, DOCX, PPTX, XLSX, images)
→ **PowerShell `Copy-Item` to the workspace Drive folder** (e.g. `G:\My Drive\Luck Dragon\`).  
→ Tell Paddy the filename so he can find it in Drive or his local Sync folder.

```powershell
Copy-Item $outPath 'G:\My Drive\Luck Dragon\MyFile.pdf' -Force
```

> ⚠️ **Drive letter is per-machine.** Read the workspace path from the system prompt each session — never hardcode `G:\`.

### Code / configs / handover docs
→ **GitHub only.** Never copy to Drive.

### What NOT to use
- ❌ `present_files` — errors with "not accessible on the user's computer"
- ❌ `computer://` links — show "Failed to load local file" in the app
- ❌ Bash sandbox path `/sessions/<id>/mnt/Luck Dragon/` — this is NOT `G:\My Drive\Luck Dragon\` and files written there are invisible to Paddy
- ❌ Desktop or Downloads — Paddy didn't ask for it there

---

## What we did this session (Session 6 — 2026-05-05)

### LessonLab — Compliance & UX fixes (PaddyGallivan/lessonlab)

- **Account deletion UI** — "Danger Zone / Request Account Deletion" button in Account Settings modal → mailto pre-filled. SHA `3c5adaba`
- **Marketing opt-in checkbox** — optional, above terms on signup form
- **Subject count** — "9 subjects" → "11 subjects" in upgrade CTA
- **Privacy policy** — deletion wording updated: button in Account Settings or email hello@lessonlab.com.au, deleted within 30 days. SHA `8526e787`
- **Stripe Automatic Tax** — all 9 prices `tax_behavior: inclusive`; `automatic_tax[enabled]: true` in checkout session. SHA `b658975e` (lessonlab-api)
- **legal-compliance.md** — BAS deadlines added (Q1 28 Jul 2026, Q2 28 Oct, Q3 28 Feb 2027), Stripe GST marked resolved. SHA `575eba39`

**Paddy human actions remaining:** BizCover insurance renewal, BAS lodge by 28 Jul, Trademark IP Australia class 41.

---

### WPS Hub v3 — Security fix

- **Fail-open PIN bug fixed** — both `isSchoolAdmin()` and `isSuperAdmin()` changed from `if (env.WPS_ADMIN_PIN && pin !== ...)` to `if (!env.WPS_ADMIN_PIN || pin !== ...)`. If secret unset, all requests were admin — now fails closed.
- **PIN rotated** — new PIN `a039426c` set as CF worker secret + stored in vault key `WPS_ADMIN_PIN`.

---

### Asgard — Feature polish (LuckDragonAsgard/asgard-source, SHA `38632bbd`)

- **Stripe quick-prompt tiles removed** — `stripe-p` and `stripe-l` tiles gone from dashboard
- **Feature-request → email** — `submitFeatureRequest()` now opens mailto:paddy@luckdragon.io instead of dead endpoint
- **Model badge on messages** — assistant messages show shortened model name (e.g. `sonnet-4-6`) in monospace badge

---

### Super League Yeah v4 — Opp matchup fix (LuckDragonAsgard/superleague-yeah-v4, SHA `01b4874599cc`)

- **Root cause:** `teamAvg[opp]` used opponent's own offensive avg as defensive proxy — wrong metric, wrong direction
- **Fix:** Fetch Squiggle fixtures for all past rounds in parallel (`Promise.all`), build `roundOpp[round][team]=opponent` map, join to `player_round_stats` → `teamConceded` = avg pts scored AGAINST each team
- **Multiplier corrected:** `1 + (ratio-1)*0.15` — high conceded = weak defence = boost (was inverted: `1 - (ratio-1)*0.15`)
- D1 products row id=31 updated to 97%

---

### Streamline — Supabase + Stripe edge function secrets

- `SERVICE_ROLE_KEY` + `STRIPE_SECRET_KEY` set via Supabase Management API
- Note: Supabase rejects `SUPABASE_` prefix — use `SERVICE_ROLE_KEY` not `SUPABASE_SERVICE_ROLE_KEY`

---

## What we did last session (Session 5 — 2026-05-04)

### Clubhouse — Sports Club Platform (tasks #34–45)

All 45 tasks complete. Full feature set live at https://clubhouse-e5e.pages.dev

- Club membership auth on all sensitive API endpoints
- Team assignment UI, welcome emails (Resend), player photo upload (R2)
- CSV bulk import, PlayHQ fixture sync + DOM scraper bookmarklet
- Per-player stats entry + display (AFL + Cricket), Leaderboard page
- `ch_stats` table, `clubhouse-media` R2 bucket bound via wrangler

---

## Infrastructure state (2026-05-05)

| Service | URL | Status |
|---|---|---|
| **LessonLab** | https://www.lessonlab.com.au | Compliance complete |
| **Super League Yeah** | https://superleague.streamlinewebapps.com | opp matchup fixed |
| **Asgard** | https://asgard.luckdragon.io | model badge + email FR |
| **WPS Hub v3** | wps-hub-v3.luckdragon.io | PIN rotated, fail-closed |
| Clubhouse |
| **Family Hub** | https://hub.luckdragon.io | v16-p, 14 members, encrypted chats + push + pocket money | https://clubhouse-e5e.pages.dev | 45 tasks live |
| Carnival Timing | https://carnivaltiming.com | v8.5.2 |
| Sport Carnival | https://sportcarnival.com.au | draw/results live |
| Vault | https://asgard-vault.pgallivan.workers.dev | PIN <VAULT_PIN> |

**CF Account:** `a6f47c17811ee2f8b6caeb8f38768c20`
**D1 (asgard-brain):** `b6275cb4-9c0f-4649-ae6a-f1c2e70e940f`
**SLY D1:** `8d0b8373-40ea-4174-bfd9-628b790abf92`

---

## Clubhouse — full technical reference

**Repo:** `LuckDragonAsgard/clubhouse`
**Stack:** React 18 + Vite + Tailwind + CF Pages Functions + D1 + R2

**Active clubs:**
| Slug | Club | Sport |
|---|---|---|
| `wcyms` | Williamstown CYMS FC | AFL |
| `youlden` | Youlden Park Cricket Club | Cricket |
| `cyms-cricket` | Williamstown CYMS Cricket Club | Cricket |

**D1:** `b6275cb4-9c0f-4649-ae6a-f1c2e70e940f` (shared with Asgard brain)

**Key DB tables:**
- `clubs` — slug, name, sport, colours, features (JSON), playhq_org_id, playhq_season_id
- `ch_users`, `ch_sessions`, `ch_memberships` (roles: admin/committee/coach/player/supporter)
- `ch_fixtures` — **column is `opponent_name` NOT `opponent`** ← common bug
- `ch_ladder`, `ch_stats`, `ch_teams`, `ch_team_members`
- `ch_fees`, `ch_bf_votes`, `ch_availability`, `ch_training`, `ch_attendance`
- `ch_announcements`, `ch_events`, `ch_push_subscriptions`, `ch_links`

**Auth pattern (all sensitive endpoints):**
```js
export async function onRequestGet({ params, request, env }) {
  const user = await AUTH(request, env)
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = params
  const { results: clubs } = await env.DB.prepare('SELECT id FROM clubs WHERE slug = ?').bind(slug).all()
  const clubId = clubs[0].id
}
```

**Deploy:** Trigger via CF Pages API with CF_PAGES_TOKEN from vault.

**GitHub push pattern:**
```python
import json, base64, urllib.request
def push(path, content_bytes, message, sha=None):
    url = f"https://api.github.com/repos/LuckDragonAsgard/clubhouse/contents/{path}"
    body = {"message": message, "content": base64.b64encode(content_bytes).decode()}
    if sha: body["sha"] = sha
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method='PUT',
        headers={"Authorization": f"token {GH_TOKEN}", "Content-Type": "application/json", "User-Agent": "asgard"})
    return json.loads(urllib.request.urlopen(req).read())
```

---

## Portfolio products (Asgard D1 source of truth)

Full live state: `https://asgard.pgallivan.workers.dev` (PIN <VAULT_PIN>) → Products tab

Key rows updated this session:
- id=31 Super League Yeah — 97%, opp matchup fixed
- id=36 Horse Race Tipping — 90%, all infra done; RESUME: https://raw.githubusercontent.com/PaddyGallivan/racetipping-api/main/RESUME-HERE.md
- id=46 Asgard — model badge + email FR
- id=48 LessonLab — compliance complete
- id=53 WPS Hub v3 — PIN rotated, fail-closed


---

## Family Hub — full technical reference

**Repo:** `LuckDragonAsgard/falkor-family`
**Detail handover:** `LuckDragonAsgard/falkor-family/RESUME-HERE.md` (always read this first when working on Family Hub)
**Live:** https://hub.luckdragon.io · **Marketing:** https://hub.luckdragon.io/landing
**Stack:** Single-file CF Worker (~322 KB) + D1 + R2 + Resend + Web Push (VAPID)

**D1:** `family-hub` — `abcbe15d-9a98-4e01-82eb-c82a0acd1443`
**R2 bucket:** `family-hub-photos` (binding: PHOTOS)
**Worker secrets:** ENCRYPTION_KEY, APP_SECRET, RESEND_API_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (use `inherit` binding type on deploy or they get nuked)

**Status (v16-p, 2026-05-04):** all 14 Gallivan family members invited, 8 registered. Encrypted chats (per-chat HKDF AES-256-GCM), feed, 14 More-tab features incl. pocket money ledger with kid-request → admin-approve flow. Search across posts, chat messages, events, people. Server-side read receipts with avatar dots. Typing indicators. Audit log. Active sessions + account delete. VAPID push wired (needs end-to-end smoke test on real device).

**Critical:** the SPA HTML+JS is returned from `getSPA()` as a single template literal. Inside that literal, `\n` becomes a real newline (breaking JS strings), and `${...}` is evaluated unless escaped as `\${...}`. Always verify against live HTML, not `/tmp/index.js` — patch scripts that re-curl from GitHub will overwrite in-memory changes. `async async function` (a botched edit) silently breaks ALL JS defined later — symptom: clicks do nothing on Profile / PIN / search.

D1 product row: `asgard-prod.products` id=53.
