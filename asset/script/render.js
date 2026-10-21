// Construit tout le contenu du portfolio à partir des fichiers de BDD/json.
// Quand c'est fini, l'événement "portfolio:ready" est envoyé et script.js branche les interactions.
(function () {
    const DATA_FILES = {
        global: 'BDD/json/global.json',
        about: 'BDD/json/about.json',
        skills: 'BDD/json/skills.json',
        projects: 'BDD/json/projects.json'
    };

    // Couleurs des langages (mêmes que GitHub)
    const LANGUAGE_COLORS = {
        'JavaScript': '#f1e05a', 'Java': '#b07219', 'C#': '#178600', 'PHP': '#4F5D95',
        'HTML': '#e34c26', 'CSS': '#563d7c', 'SCSS': '#c6538c', 'Python': '#3572A5',
        'C++': '#f34b7d', 'C': '#555555', 'TypeScript': '#3178c6', 'FreeMarker': '#0050b2',
        'ShaderLab': '#222c37', 'HLSL': '#aace60', 'GLSL': '#5686a5', 'Hack': '#878787',
        'Unity': '#222c37', 'JSON': '#f0ad4e', 'MySQL': '#4479A1', 'Lua': '#000080',
        'Go': '#00ADD8', 'Rust': '#dea584', 'Kotlin': '#A97BFF', 'Swift': '#F05138'
    };
    window.LANGUAGE_COLORS = LANGUAGE_COLORS;

    document.addEventListener('DOMContentLoaded', async function () {
        try {
            const data = await loadData();
            window.PORTFOLIO = data;
            await renderAll(data);
            document.dispatchEvent(new CustomEvent('portfolio:ready', { detail: data }));
        } catch (error) {
            console.error(error);
            showLoadError(error);
        }
    });

    async function loadData() {
        const entries = await Promise.all(Object.entries(DATA_FILES).map(async ([key, path]) => {
            const response = await fetch(path, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`${path} : ${response.status}`);
            try {
                return [key, await response.json()];
            } catch (e) {
                throw new Error(`${path} : JSON invalide (${e.message})`);
            }
        }));
        return Object.fromEntries(entries);
    }

    async function renderAll({ global, about, skills, projects }) {
        renderSite(global);
        renderNav(global);
        await renderHome(global);
        renderSectionHeaders(global.sections);
        await renderAbout(about, global);
        renderSkills(skills);
        await renderProjects(projects);
        renderContact(global.contact);
        renderFooter(global.site);
    }

    // ---------- Site ----------
    function renderSite({ site }) {
        if (site.title) document.title = site.title;
        if (site.lang) document.documentElement.lang = site.lang;
        if (site.favicon) document.querySelector('link[rel="icon"]').href = site.favicon;
        if (site.heroBackground) {
            document.querySelector('.hero').style.setProperty('--hero-bg-image', `url('${site.heroBackground}')`);
        }
    }

    function renderNav({ site, sections }) {
        document.querySelector('.nav-logo a').textContent = site.logo || 'Portfolio';
        document.querySelector('.nav-logo a').href = `#${sections.home.id}`;

        const menu = document.getElementById('nav-menu');
        menu.innerHTML = Object.values(sections)
            .filter(section => section.nav)
            .map((section, i) => `<a href="#${attr(section.id)}" class="nav-link${i === 0 ? ' active' : ''}">${esc(section.nav)}</a>`)
            .join('');

        Object.entries(sections).forEach(([key, section]) => {
            const element = document.querySelector(`[data-section="${key}"]`);
            if (element) element.id = section.id;
        });
    }

    function renderSectionHeaders(sections) {
        document.querySelectorAll('[data-section]').forEach(element => {
            const section = sections[element.dataset.section];
            const header = element.querySelector('.section-header');
            if (!section || !header) return;
            header.innerHTML = `
                <h2 class="section-title">
                    ${icon(section.icon)}
                    ${esc(section.title)}
                </h2>
                ${section.description ? `<p class="section-description">${esc(section.description)}</p>` : ''}`;
        });
    }

    // ---------- Accueil ----------
    async function renderHome({ owner, home, github }) {
        document.querySelector('.hero-title').innerHTML =
            `<span class="wave">👋</span> ${esc(home.greeting)} <span class="username">${esc(owner.username)}</span>`;
        document.querySelector('.hero-subtitle').textContent = plainText(await loadText(home.text));

        // Les statistiques viennent de GitHub : masquées sans compte GitHub
        document.querySelector('.hero-stats').hidden = !github.user;

        document.querySelector('.hero-buttons').innerHTML = (home.buttons || []).map(button => `
            <a href="${attr(button.href)}" class="btn btn-${button.style === 'secondary' ? 'secondary' : 'primary'}">
                ${icon(button.icon)}
                ${esc(button.label)}
            </a>`).join('');

        const avatar = owner.avatar || (github.user ? `https://github.com/${github.user}.png` : '');
        const img = document.querySelector('.profile-avatar img');
        if (avatar) {
            img.style.display = '';
            document.querySelector('.profile-avatar-fallback').style.display = 'none';
            img.src = avatar;
            img.alt = `Photo de profil de ${owner.username}`;
        } else {
            img.remove();
            document.querySelector('.profile-avatar-fallback').style.display = 'flex';
        }

        document.querySelector('.profile-info h3').textContent = owner.username;
        document.getElementById('profile-bio').textContent = owner.bio || '';
        document.querySelector('.profile-stats').innerHTML = [
            owner.location && `<span><i class="fas fa-map-marker-alt"></i> ${esc(owner.location)}</span>`,
            owner.status && `<span><i class="fas fa-building"></i> ${esc(owner.status)}</span>`
        ].filter(Boolean).join('');
    }

    // ---------- À propos ----------
    async function renderAbout({ tabs }, { github }) {
        const visibleTabs = tabs.filter(tab => tab.type !== 'github' || github.user);
        const tabList = document.querySelector('.about-tabs');
        const panels = document.querySelector('.about-panels');

        tabList.innerHTML = visibleTabs.map((tab, i) => `
            <button class="about-tab${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0}"
                aria-controls="tab-${attr(tab.id)}" id="tab-btn-${attr(tab.id)}"${i === 0 ? '' : ' tabindex="-1"'}>
                ${icon(tab.icon)} ${esc(tab.label)}
            </button>`).join('');

        const contents = await Promise.all(visibleTabs.map(renderTabContent));
        panels.innerHTML = visibleTabs.map((tab, i) => `
            <div class="about-panel${i === 0 ? ' active' : ''}" role="tabpanel" id="tab-${attr(tab.id)}"
                aria-labelledby="tab-btn-${attr(tab.id)}"${i === 0 ? '' : ' hidden'}>
                ${contents[i]}
            </div>`).join('');
    }

    async function renderTabContent(tab) {
        const text = tab.file ? await loadText(tab.file) : '';
        switch (tab.type) {
            case 'markdown':
                return `<div class="code-block"><pre><code>${esc(text.trim())}</code></pre></div>`;
            case 'timeline':
                return `<ul class="timeline">${parseTimeline(text).map(item => `
                    <li class="timeline-item">
                        <span class="timeline-date">${esc(item.date)}</span>
                        <h4>${esc(item.title)}</h4>
                        ${item.text ? `<p>${esc(item.text)}</p>` : ''}
                    </li>`).join('')}</ul>`;
            case 'checklist': {
                const icons = { 'done': 'fas fa-check-circle', 'in-progress': 'fas fa-spinner', 'todo': 'far fa-circle' };
                return `<ul class="plan-list">${parseChecklist(text).map(item => `
                    <li class="plan-item ${item.status === 'todo' ? '' : attr(item.status)}">
                        <i class="${icons[item.status] || icons.todo}"></i>
                        <span>${esc(item.text)}</span>
                    </li>`).join('')}</ul>`;
            }
            case 'github':
                return document.getElementById('github-panel-template').innerHTML;
            default:
                return `<p>${esc(plainText(text))}</p>`;
        }
    }

    // Timeline : "## Titre", puis "**période**", puis le texte
    function parseTimeline(markdown) {
        return markdown.split(/^##\s+/m).slice(1).map(block => {
            const lines = block.split(/\r?\n/);
            const title = lines.shift().trim();
            let date = '';
            const firstLine = lines.findIndex(line => line.trim());
            const dateMatch = firstLine >= 0 && lines[firstLine].trim().match(/^\*\*(.+)\*\*$/);
            if (dateMatch) {
                date = dateMatch[1];
                lines.splice(firstLine, 1);
            }
            return { title, date, text: plainText(lines.join(' ')) };
        });
    }

    // Checklist : "- [x]" terminé, "- [~]" en cours, "- [ ]" à faire
    function parseChecklist(markdown) {
        const statuses = { 'x': 'done', 'X': 'done', '~': 'in-progress', ' ': 'todo' };
        return markdown.split(/\r?\n/)
            .map(line => line.match(/^\s*[-*]\s+\[([ xX~])\]\s+(.+)$/))
            .filter(Boolean)
            .map(([, mark, text]) => ({ status: statuses[mark], text: plainText(text) }));
    }

    // ---------- Compétences ----------
    function renderSkills({ categories }) {
        document.querySelector('.skills-grid').innerHTML = categories.map(category => `
            <div class="skill-category">
                <h3>${icon(category.icon)} ${esc(category.name)}</h3>
                <div class="skill-items">${(category.items || []).map(item => `
                    <div class="skill-item">
                        <div class="skill-icon">${icon(item.icon)}</div>
                        <span>${esc(item.name)}</span>
                    </div>`).join('')}
                </div>
            </div>`).join('');
    }

    // ---------- Projets ----------
    async function renderProjects({ categories, projects }) {
        // Description de chaque projet : son fichier markdown
        await Promise.all(projects.map(async project => {
            project.description = project.text ? plainText(await loadText(project.text)) : '';
        }));

        document.querySelector('.project-groups').innerHTML = categories
            .map(category => ({ category, items: projects.filter(p => p.category === category.id) }))
            .filter(group => group.items.length)
            .map(({ category, items }) => `
            <div class="project-group">
                <div class="project-group-header">
                    <h3 class="project-group-title">${icon(category.icon)} ${esc(category.label)}</h3>
                    <div class="carousel-controls">
                        <button class="carousel-btn prev" aria-label="Previous projects"><i class="fas fa-chevron-left"></i></button>
                        <button class="carousel-btn next" aria-label="Next projects"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                <div class="carousel">
                    <div class="carousel-track">${items.map(projectCard).join('')}</div>
                </div>
            </div>`).join('');
    }

    function projectCard(project) {
        const stats = project.stats || {};
        const links = (project.links || []).map(link =>
            `<a href="${attr(link.url)}" class="project-link" title="${attr(link.label || '')}">${icon(link.icon)}</a>`);
        if (project.repo) {
            links.push(`<a href="https://github.com/${attr(project.repo)}" class="project-link" data-link="github" title="GitHub repository"><i class="fab fa-github"></i></a>`);
        }

        return `
            <div class="project-card"${project.repo ? ` data-repo="${attr(project.repo)}"` : ''}>
                <div class="project-thumb">
                    ${icon(project.icon || 'fas fa-folder')}
                    ${project.image ? `<img src="${attr(project.image)}" alt="${attr(project.title)}" loading="lazy" onerror="this.remove()">` : ''}
                </div>
                <div class="project-header">
                    <div class="project-title">
                        <i class="fas fa-folder"></i>
                        <h3>${esc(project.title)}</h3>
                    </div>
                    <div class="project-status">
                        <span class="status-public">${esc(project.status || 'Public')}</span>
                    </div>
                </div>
                <p class="project-description">${esc(project.description || '')}</p>
                <div class="project-tech">${(project.tech || []).map(techTag).join('')}</div>
                <div class="project-footer">
                    <div class="project-stats">
                        ${stats.downloads ? `<span data-keep title="Downloads"><i class="fas fa-download"></i> ${esc(stats.downloads)}</span>` : ''}
                        ${stats.stars !== undefined ? `<span title="Stars"><i class="fas fa-star"></i> ${esc(stats.stars)}</span>` : ''}
                        ${stats.forks !== undefined ? `<span title="Forks"><i class="fas fa-code-branch"></i> ${esc(stats.forks)}</span>` : ''}
                        ${stats.updated ? `<span title="Last update" data-updated="${attr(stats.updated)}"><i class="fas fa-clock"></i></span>` : ''}
                    </div>
                    <div class="project-links">${links.join('')}</div>
                </div>
            </div>`;
    }

    function techTag(name) {
        const color = LANGUAGE_COLORS[name] || 'var(--text-tertiary)';
        return `<span class="tech-tag"><span class="tech-dot" style="background:${color}"></span>${esc(name)}</span>`;
    }

    // ---------- Contact ----------
    function renderContact({ items, socials, map }) {
        document.querySelector('.contact-card').innerHTML = (items || []).map(item => `
            <div class="contact-item">
                ${icon(item.icon)}
                <div>
                    <h4>${esc(item.label)}</h4>
                    <p>${esc(item.value)}</p>
                </div>
            </div>`).join('');

        document.querySelector('.social-links').innerHTML = (socials || []).map(social => `
            <a href="${attr(social.url)}" class="social-link" title="${attr(social.label || '')}" target="_blank" rel="noopener">
                ${icon(social.icon)}
            </a>`).join('');

        const mapContainer = document.querySelector('.contact-map');
        if (map) {
            mapContainer.querySelector('iframe').src = map;
        } else {
            mapContainer.remove();
            document.querySelector('.contact-content').classList.add('no-map');
        }
    }

    function renderFooter(site) {
        document.querySelector('.footer-center p').textContent = site.footer || '';
    }

    // ---------- Outils ----------
    async function loadText(path) {
        if (!path) return '';
        const response = await fetch(path, { cache: 'no-cache' });
        if (!response.ok) {
            console.warn(`Texte introuvable : ${path}`);
            return '';
        }
        return response.text();
    }

    // Markdown → texte simple (pour les petits textes : accueil, descriptions…)
    function plainText(markdown) {
        return (markdown || '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/^#+\s*/gm, '')
            .replace(/[*_`]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function icon(name) {
        if (!name) return '';
        if (name.startsWith('iconify:')) return `<iconify-icon icon="${attr(name.slice(8))}"></iconify-icon>`;
        return `<i class="${attr(name)}"></i>`;
    }

    function esc(value) {
        return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    }

    function attr(value) {
        return esc(value);
    }

    function showLoadError(error) {
        const isFile = location.protocol === 'file:';
        const box = document.createElement('div');
        box.className = 'load-error';
        box.innerHTML = `
            <h2>Le portfolio n'a pas pu se charger</h2>
            <p>${isFile
                ? "Le site lit ses données dans <code>BDD/json/</code> : il doit être ouvert via un serveur (GitHub Pages, ou <code>python -m http.server</code> en local), pas en double-cliquant sur index.html."
                : `Erreur : <code>${esc(error.message)}</code>`}</p>`;
        document.body.prepend(box);
    }
})();
