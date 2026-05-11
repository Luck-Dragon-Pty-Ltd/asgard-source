# Falkor Site Editing Guide

When a user asks to edit a website (e.g., "change headline on Carnival Timing to..."), follow this workflow:

## 1. Identify the site
Match the request to a site in `site-config.json` (https://raw.githubusercontent.com/Luck-Dragon-Pty-Ltd/asgard-source/main/site-config.json)

## 2. Clone the repository
Using GitHub token from vault, clone the repo:
```
git clone https://github.com/Luck-Dragon-Pty-Ltd/{repo-name}.git
cd {repo-name}
```

## 3. Locate the file to edit
- For CF Pages: look in `public/` or source path
- For CF Workers: look in worker JS files
- For GitHub Pages: look in `docs/` or `dist/`
- Use grep or read the file to find the exact location

## 4. Make the edit
Edit the specific file and line. Keep changes minimal and focused.

## 5. Commit and push
```
git add {file}
git commit -m "Update: {description}"
git push origin main
```

## 6. Deployment
The webhook auto-deploys on main push:
- CF Pages: ~30 seconds
- CF Workers: ~10 seconds
- GitHub Pages: ~2 minutes

Verify by checking:
- GitHub: https://github.com/Luck-Dragon-Pty-Ltd/{repo}/commits/main
- Live site: {domain}

## Key Sites & Repos

| Site | Repo | Type | Deploy |
|------|------|------|--------|
| Carnival Timing | sport-carnival | CF Pages+Worker | ~30s |
| School Sport Portal | schoolsportportal | GitHub Pages | ~2min |
| SportCarnival | sportcarnival-hub | CF Pages | ~30s |
| LessonLab | lessonlab | CF Workers+D1 | ~10s |
| Bomber Boat | bomber-boat | CF Pages | ~30s |
| Superleague Yeah | superleague-yeah-v4 | GitHub Pages | ~2min |
| Mascot Generator | kbt-mascot-generator | CF Pages | ~30s |
| Long Range Tipping | longrangetipping | CF Workers | ~10s |
| School Staff Hub | wps-staff-hub | CF Pages | ~30s |
| KBT Trivia Tools | kbt-trivia-tools | CF Workers | ~10s |
| Falkor Widget | asgard-workers | CF Workers | ~10s |

## Example

**User:** "Change the hero headline on Carnival Timing to 'Faster Results. Better Decisions.'"

**Falkor:**
1. Fetch site-config → sport-carnival repo, CF Pages+Worker
2. Clone sport-carnival
3. Find headline in public/index.html or worker template
4. Edit the text
5. Commit + push
6. Webhook deploys
7. Verify at carnivaltiming.com (30s)
8. Report: "✓ Updated. Live in 30 seconds."