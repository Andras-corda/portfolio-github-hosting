# Portfolio Template — GitHub Pages

A developer portfolio for GitHub Pages, **driven by content files**: settings in JSON, texts in Markdown. Fork it, edit the files in `BDD/`, and your portfolio is online. No build step, no framework, no dependencies to install.

🔗 **Live demo:** https://andras-corda.github.io/portfolio-github-hosting/

## Features

- 🌗 Light / dark / system theme
- 🖱️ Home section with a mouse-parallax background and blur
- 🗂️ "About me" tabs: README (markdown), timeline, checklist, GitHub stats
- 📊 Live GitHub data: contribution calendar, streaks, top languages, recent repositories
- 🎠 Projects grouped in card carousels, each card enriched from its GitHub repo (languages, stars, forks, last update, live-site link)
- 📱 Responsive, keyboard accessible
- 🧩 Everything optional: no GitHub account? no map? those parts simply disappear

## Use it for your own portfolio

### 1. Fork

Click **Fork** (or **Use this template**) at the top of this page.
Name your repository `<your-username>.github.io` to get `https://<your-username>.github.io/`,
or keep any name to get `https://<your-username>.github.io/<repo-name>/`.

### 2. Edit your content

Everything you see on the site comes from these files:

**Settings — JSON (`BDD/json/`)**

| File | What it controls |
|---|---|
| [`global.json`](BDD/json/global.json) | Site title, favicon, footer, your name/bio/location, GitHub username, home buttons, section titles & menu, contact info, socials, map |
| [`about.json`](BDD/json/about.json) | The "About me" tabs |
| [`skills.json`](BDD/json/skills.json) | "Languages and Tools" categories |
| [`projects.json`](BDD/json/projects.json) | Project categories and project cards |

**Texts — Markdown (`BDD/markdown/`)**

| File | Shown in |
|---|---|
| [`accueil.md`](BDD/markdown/accueil.md) | Home, text under the title |
| [`about/readme.md`](BDD/markdown/about/readme.md) | README tab (displayed as-is) |
| [`about/degrees.md`](BDD/markdown/about/degrees.md) | Timeline tab: `## Title`, then `**period**`, then the text |
| [`about/plan.md`](BDD/markdown/about/plan.md) | Checklist tab: `- [x]` done, `- [~]` in progress, `- [ ]` to do |
| `projets/<category>/<project>.md` | Description of each project card ([template](BDD/markdown/projets/_template.md)) |

**Images:** `asset/picture/` (favicon, home background, project images).

> You never need to touch `index.html`: it only contains the page structure.

### 3. Publish

**Settings → Pages → Build and deployment → Deploy from a branch → `main` / root → Save.**
Your site is live a minute later.

### 4. Preview locally (optional)

The site loads its JSON files with `fetch`, so it must be served over HTTP (double-clicking `index.html` won't work):

```bash
python -m http.server 5500
```

Then open http://localhost:5500.

## Configuration reference

### `global.json`

```jsonc
{
    "site": {
        "title": "My portfolio",            // browser tab title
        "lang": "en",
        "favicon": "./asset/picture/icon.png",
        "logo": "Portfolio",                // text next to the logo in the menu
        "heroBackground": null,             // e.g. "./asset/picture/hero-bg.jpg" (null = gradient)
        "footer": "© 2026 Me"
    },
    "owner": {
        "username": "@me",
        "name": "Me",
        "avatar": null,                     // null = your GitHub avatar
        "bio": "Short bio",
        "location": "City, Country",
        "status": "Open to work"
    },
    "github": {
        "user": "my-github-username",       // null = hides every GitHub feature
        "useGitHubBio": true,               // replace "bio" with your GitHub bio
        "cacheMinutes": 60
    },
    "home": {
        "greeting": "Hi, I'm",
        "text": "BDD/markdown/accueil.md",   // markdown file with the text under the title
        "buttons": [{ "label": "See my projects", "href": "#projects", "icon": "fas fa-folder-open", "style": "primary" }]
    },
    "sections": {
        // one entry per section: id (used in links), nav (menu label), icon, title, description
        "home":     { "id": "home", "nav": "Home" },
        "about":    { "id": "about", "nav": "About", "icon": "fas fa-user", "title": "About me", "description": "…" },
        "skills":   { … }, "projects": { … }, "contact": { … }
    },
    "contact": {
        "items":   [{ "icon": "fas fa-envelope", "label": "Email", "value": "me@example.com" }],
        "socials": [{ "icon": "fab fa-github", "label": "GitHub", "url": "https://github.com/me" }],
        "map": null                         // Google Maps "embed" URL, or null to hide the map
    }
}
```

### `about.json`

A list of tabs. Each tab has an `id`, a `label`, an `icon`, a `type` and (except `github`) a `file` with its text:

| `type` | Markdown file format |
|---|---|
| `markdown` | Any markdown, displayed as-is like a README |
| `timeline` | One block per item: `## Title`, then `**period**` on the next line, then the text |
| `checklist` | A task list: `- [x]` done, `- [~]` in progress, `- [ ]` to do |
| `github` | No file: contribution calendar + GitHub stats (needs `github.user`) |

### `skills.json`

```json
{ "categories": [{ "name": "Frontend", "icon": "fas fa-paint-brush",
                   "items": [{ "name": "HTML5", "icon": "fab fa-html5" }] }] }
```

### `projects.json`

```jsonc
{
    "categories": [{ "id": "games", "label": "Games", "icon": "fas fa-gamepad" }],
    "projects": [{
        "title": "My game",
        "category": "games",                       // id of a category above
        "repo": "my-username/my-game",             // optional: enriches the card from GitHub
        "icon": "fas fa-gamepad",                  // shown when there is no image
        "image": "./asset/picture/projects/my-game.png",   // optional
        "text": "BDD/markdown/projets/games/my-game.md",  // description (empty file = GitHub "About", then the README)
        "tech": ["C#", "Unity"],                   // shown until GitHub languages load
        "stats": { "stars": 0, "forks": 0, "updated": "2026-01-01T00:00:00Z", "downloads": "1K" },
        "links": [{ "url": "https://…", "icon": "fas fa-link", "label": "Website" }]
    }]
}
```

Cards are clickable (they open the GitHub repo, or the first link). Categories with no project are hidden.

### Icons

- Font Awesome 6: `fas fa-…`, `fab fa-…` — https://fontawesome.com/v6/search?ic=free
- Devicon: `devicon-…-plain` / `devicon-…-original` — https://devicon.dev
- Iconify: `iconify:<set>:<name>` (e.g. `iconify:simple-icons:curseforge`) — https://icon-sets.iconify.design

## How it works

```
index.html          page structure only
asset/script/
  render.js         reads BDD/json/* and builds every section
  script.js         theme, menu, tabs, carousels, GitHub data, animations
asset/css/          styles (colors are CSS variables in style.css)
BDD/json/           ← your settings
BDD/markdown/       ← your texts
```

GitHub data comes from the public GitHub API (no token: 60 requests/hour per visitor, cached in the browser)
and from [github-contributions-api](https://github.com/grubersjoe/github-contributions-api) for the calendar.
If they are unavailable, the site still works with the values written in your files.

## Author

Made by **Andras Corda** — Game Development student

- GitHub: https://github.com/Andras-corda
- LinkedIn: https://www.linkedin.com/in/andras-corda-7650393a1/
