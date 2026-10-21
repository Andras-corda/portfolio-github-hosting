// Theme Switcher Logic
document.addEventListener('DOMContentLoaded', function () {
    const themeButton = document.getElementById('theme-button');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeIcon = document.querySelector('.theme-icon');
    const themeOptions = document.querySelectorAll('.theme-option');
    const savedTheme = localStorage.getItem('theme') || 'system';

    applyTheme(savedTheme);
    updateThemeIcon(savedTheme);

    themeButton.addEventListener('click', function (e) {
        e.stopPropagation();
        themeDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function () {
        themeDropdown.classList.remove('active');
    });

    themeOptions.forEach(option => {
        option.addEventListener('click', function () {
            const selectedTheme = this.dataset.theme;
            applyTheme(selectedTheme);
            updateThemeIcon(selectedTheme);
            localStorage.setItem('theme', selectedTheme);
            themeDropdown.classList.remove('active');
        });
    });

    function applyTheme(theme) {
        const html = document.documentElement;

        if (theme === 'system') {
            // Utiliser la préférence système
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            html.setAttribute('data-theme', theme);
        }
    }

    function updateThemeIcon(theme) {
        themeIcon.className = 'theme-icon fas';

        switch (theme) {
            case 'light':
                themeIcon.classList.add('fa-sun');
                break;
            case 'dark':
                themeIcon.classList.add('fa-moon');
                break;
            case 'system':
                themeIcon.classList.add('fa-desktop');
                break;
        }
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        const currentTheme = localStorage.getItem('theme') || 'system';
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });
});

// Navigation mobile
document.addEventListener('portfolio:ready', function () {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Gestion des liens actifs
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));

            this.classList.add('active');

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Smooth scrolling et navigation active
document.addEventListener('portfolio:ready', function () {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // Fonction pour mettre à jour le lien actif
    function updateActiveNav() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav);
});

// Données GitHub réelles (contributions + profil + dépôts)
document.addEventListener('portfolio:ready', function () {
    const config = window.PORTFOLIO.global.github || {};
    const GITHUB_USER = config.user;
    const CACHE_KEY = `github-data-v1:${GITHUB_USER}`;
    // Cache pour rester sous la limite de 60 requêtes/h de l'API GitHub
    const CACHE_TTL = (config.cacheMinutes || 60) * 60 * 1000;

    const LANGUAGE_COLORS = window.LANGUAGE_COLORS;

    // Dates de secours (snapshot) affichées tout de suite, avant la réponse de l'API
    document.querySelectorAll('[data-updated]').forEach(element => {
        element.append(` ${timeAgo(element.dataset.updated)}`);
    });

    loadProjectCards();

    const graphContainer = document.querySelector('.graph-weeks');
    if (!GITHUB_USER || !graphContainer) return;

    setText('gh-username', `@${GITHUB_USER}`);
    const profileLink = document.getElementById('gh-profile-link');
    if (profileLink) profileLink.href = `https://github.com/${GITHUB_USER}`;

    loadGitHubData()
        .then(render)
        .catch(function (error) {
            console.warn('GitHub data unavailable:', error);
            graphContainer.innerHTML = '<p class="gh-error">Unable to load GitHub data right now.</p>';
            setText('gh-total', '?');
            const recent = document.getElementById('gh-recent-repos');
            if (recent) recent.innerHTML = '';
        });

    async function loadGitHubData() {
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;
        } catch (e) { /* stockage indisponible */ }

        const [contributions, user, repos] = await Promise.all([
            fetchJson(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`),
            fetchJson(`https://api.github.com/users/${GITHUB_USER}`),
            fetchJson(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`)
        ]);
        const data = { contributions, user, repos };

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));
        } catch (e) { /* stockage indisponible */ }
        return data;
    }

    async function fetchJson(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status} on ${url}`);
        return response.json();
    }

    function render({ contributions, user, repos }) {
        const days = contributions.contributions;
        const total = contributions.total.lastYear;
        const ownRepos = repos.filter(r => !r.fork);

        renderGraph(days);

        const stats = computeStreaks(days);
        setText('gh-total', total);
        setText('gh-streak', plural(stats.current, 'day'));
        setText('gh-longest', plural(stats.longest, 'day'));
        setText('gh-best', stats.best.count || '–');
        if (stats.best.count) setText('gh-best-label', `Best day · ${formatDate(stats.best.date)}`);
        setText('gh-active', stats.active);

        setText('gh-repos', user.public_repos);
        setText('gh-followers', user.followers);
        setText('gh-following', user.following);
        setText('gh-since', new Date(user.created_at).getFullYear());

        setText('hero-repos', user.public_repos);
        setText('hero-contribs', total);
        setText('hero-followers', user.followers);

        if (user.bio && config.useGitHubBio) setText('profile-bio', user.bio);

        renderLanguages(ownRepos);
        renderRecentRepos(ownRepos);
    }

    function renderGraph(days) {
        graphContainer.innerHTML = '';
        // Aligne la première colonne sur le dimanche, comme sur GitHub
        const offset = new Date(days[0].date + 'T00:00:00').getDay();
        const cells = Array(offset).fill(null).concat(days);

        for (let i = 0; i < cells.length; i += 7) {
            const weekElement = document.createElement('div');
            weekElement.className = 'graph-week';

            cells.slice(i, i + 7).forEach(day => {
                const dayElement = document.createElement('div');
                if (day) {
                    dayElement.className = `graph-day square level-${day.level}`;
                    dayElement.title = `${plural(day.count, 'contribution')} on ${formatDate(day.date)}`;
                } else {
                    dayElement.className = 'graph-day empty';
                }
                weekElement.appendChild(dayElement);
            });

            graphContainer.appendChild(weekElement);
        }

        // Affiche les semaines les plus récentes quand le graphe déborde
        const scroller = graphContainer.closest('.graph-container');
        scroller.scrollLeft = scroller.scrollWidth;
    }

    function computeStreaks(days) {
        let longest = 0, run = 0, active = 0;
        let best = { count: 0, date: null };

        days.forEach(day => {
            if (day.count > 0) {
                run++;
                active++;
                longest = Math.max(longest, run);
            } else {
                run = 0;
            }
            if (day.count > best.count) best = day;
        });

        // Série en cours : on ignore aujourd'hui s'il n'y a pas encore de contribution
        const today = new Date().toISOString().slice(0, 10);
        const past = days.filter(d => d.date <= today);
        let current = 0;
        let i = past.length - 1;
        if (i >= 0 && past[i].count === 0) i--;
        for (; i >= 0 && past[i].count > 0; i--) current++;

        return { current, longest, best, active };
    }

    function renderLanguages(repos) {
        const counts = {};
        repos.forEach(r => {
            if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

        const bar = document.getElementById('gh-lang-bar');
        const list = document.getElementById('gh-lang-list');
        if (!bar || !list || !total) return;

        bar.innerHTML = '';
        list.innerHTML = '';
        sorted.forEach(([language, count]) => {
            const color = LANGUAGE_COLORS[language] || 'var(--text-tertiary)';
            const percent = (count / total * 100).toFixed(1);

            const segment = document.createElement('span');
            segment.style.width = `${percent}%`;
            segment.style.background = color;
            segment.title = `${language} ${percent}%`;
            bar.appendChild(segment);

            const item = document.createElement('li');
            item.innerHTML = `<span class="tech-dot" style="background:${color}"></span>${language} <small>${percent}%</small>`;
            list.appendChild(item);
        });
    }

    function renderRecentRepos(repos) {
        const list = document.getElementById('gh-recent-repos');
        if (!list) return;

        list.innerHTML = '';
        repos
            .slice()
            .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
            .slice(0, 5)
            .forEach(repo => {
                const color = LANGUAGE_COLORS[repo.language] || 'var(--text-tertiary)';
                const item = document.createElement('li');
                item.className = 'gh-repo';

                const link = document.createElement('a');
                link.href = repo.html_url;
                link.target = '_blank';
                link.rel = 'noopener';
                link.innerHTML = '<i class="fas fa-book"></i> ';
                link.append(repo.name);

                const meta = document.createElement('span');
                meta.className = 'gh-repo-meta';
                if (repo.language) {
                    meta.innerHTML = `<span class="tech-dot" style="background:${color}"></span>${repo.language} · `;
                }
                meta.append(`updated ${timeAgo(repo.pushed_at)}`);

                item.append(link, meta);
                list.appendChild(item);
            });
    }

    // Cartes de projets : chaque .project-card[data-repo="owner/nom"] est complétée depuis GitHub
    async function loadProjectCards() {
        const cards = document.querySelectorAll('.project-card[data-repo]');
        await Promise.allSettled([...cards].map(async card => {
            try {
                const hasDescription = card.querySelector('.project-description').textContent.trim() !== '';
                renderProjectCard(card, await loadRepo(card.dataset.repo, !hasDescription));
            } catch (error) {
                console.warn(`Project ${card.dataset.repo} unavailable:`, error);
            }
        }));
    }

    async function loadRepo(fullName, needReadme) {
        const key = `github-repo-v1:${fullName}`;
        try {
            const cached = JSON.parse(localStorage.getItem(key));
            if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;
        } catch (e) { /* stockage indisponible */ }

        const api = `https://api.github.com/repos/${fullName}`;
        const [repo, languages] = await Promise.all([
            fetchJson(api),
            fetchJson(`${api}/languages`).catch(() => ({}))
        ]);

        // Sans description sur GitHub, on prend le début du README
        let readme = '';
        if (!repo.description && needReadme) {
            const response = await fetch(`${api}/readme`, { headers: { Accept: 'application/vnd.github.raw' } });
            if (response.ok) readme = readmeExcerpt(await response.text());
        }

        const data = { repo, languages, readme };
        try {
            localStorage.setItem(key, JSON.stringify({ time: Date.now(), data }));
        } catch (e) { /* stockage indisponible */ }
        return data;
    }

    // Premier paragraphe de texte du README (sans titres, images, code, badges ni liens seuls)
    function readmeExcerpt(markdown) {
        const withoutCode = markdown.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '');
        const paragraphs = withoutCode.split(/\n\s*\n/).map(p => p.trim());

        for (const paragraph of paragraphs) {
            if (!paragraph || /^(#|!\[|\[!\[|>|\||-{3,})/.test(paragraph)) continue;
            const text = paragraph
                .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
                .replace(/https?:\/\/\S+/g, '')
                .replace(/[*_`]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            if (text.length >= 30) return text.length > 220 ? text.slice(0, 217).trimEnd() + '…' : text;
        }
        return '';
    }

    function renderProjectCard(card, { repo, languages, readme }) {
        // Description : GitHub > texte écrit à la main > README
        const description = card.querySelector('.project-description');
        if (repo.description) description.textContent = repo.description;
        else if (!description.textContent.trim()) description.textContent = readme;

        const status = card.querySelector('.project-status span');
        if (status) {
            status.textContent = repo.archived ? 'Archived' : (repo.private ? 'Private' : 'Public');
            status.classList.toggle('status-archived', repo.archived);
        }

        // Langages réels du dépôt (4 principaux)
        // GitHub classe parfois des fichiers PHP en « Hack »
        const languageNames = Object.keys(languages)
            .filter(language => !(language === 'Hack' && languages.PHP))
            .slice(0, 4);
        if (!languageNames.length && repo.language) languageNames.push(repo.language);
        if (languageNames.length) {
            const tech = card.querySelector('.project-tech');
            tech.innerHTML = '';
            languageNames.forEach(language => {
                const tag = document.createElement('span');
                tag.className = 'tech-tag';
                tag.innerHTML = `<span class="tech-dot" style="background:${LANGUAGE_COLORS[language] || 'var(--text-tertiary)'}"></span>`;
                tag.append(language);
                tech.appendChild(tag);
            });
        }

        // Statistiques (on garde celles écrites à la main marquées data-keep, ex. téléchargements)
        const stats = card.querySelector('.project-stats');
        stats.querySelectorAll(':scope > :not([data-keep])').forEach(el => el.remove());
        stats.insertAdjacentHTML('beforeend',
            `<span title="Stars"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>` +
            `<span title="Forks"><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>` +
            `<span title="Last update"><i class="fas fa-clock"></i> ${timeAgo(repo.pushed_at)}</span>`);

        // Liens : GitHub + site (homepage ou GitHub Pages)
        const links = card.querySelector('.project-links');
        let github = links.querySelector('[data-link="github"]');
        if (!github) {
            github = document.createElement('a');
            github.className = 'project-link';
            github.dataset.link = 'github';
            github.innerHTML = '<i class="fab fa-github"></i>';
            links.appendChild(github);
        }
        github.href = repo.html_url;
        github.title = 'GitHub repository';

        const site = repo.homepage || (repo.has_pages ? `https://${repo.owner.login.toLowerCase()}.github.io/${repo.name}/` : '');
        if (site && !links.querySelector('[data-link="site"]')) {
            const link = document.createElement('a');
            link.className = 'project-link';
            link.dataset.link = 'site';
            link.href = site;
            link.title = 'Live site';
            link.innerHTML = '<i class="fas fa-external-link-alt"></i>';
            links.prepend(link);
        }
        links.querySelectorAll('a').forEach(a => {
            a.target = '_blank';
            a.rel = 'noopener';
        });
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function plural(n, word) {
        return `${n} ${word}${n === 1 ? '' : 's'}`;
    }

    function formatDate(isoDate) {
        return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function timeAgo(isoDate) {
        const days = Math.floor((Date.now() - new Date(isoDate)) / 86400000);
        if (days < 1) return 'today';
        if (days < 30) return plural(days, 'day') + ' ago';
        if (days < 365) return plural(Math.floor(days / 30), 'month') + ' ago';
        return plural(Math.floor(days / 365), 'year') + ' ago';
    }
});

// Animations au scroll
document.addEventListener('portfolio:ready', function () {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.skill-category, .project-card, .contact-card');

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
});

// Effet de typing pour le titre
document.addEventListener('portfolio:ready', function () {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';

        let index = 0;
        const typingSpeed = 50;

        function typeText() {
            if (index < text.length) {
                heroTitle.textContent += text.charAt(index);
                index++;
                setTimeout(typeText, typingSpeed);
            }
        }
        setTimeout(typeText, 500);
    }
});

// Fond de l'accueil qui suit la souris (parallax)
document.addEventListener('portfolio:ready', function () {
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hero || !heroBg || reduceMotion) return;

    const strength = 30; // déplacement max en pixels
    let frame = null;

    hero.addEventListener('mousemove', function (e) {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
            heroBg.style.setProperty('--parallax-x', `${-x * strength}px`);
            heroBg.style.setProperty('--parallax-y', `${-y * strength}px`);
        });
    });

    hero.addEventListener('mouseleave', function () {
        heroBg.style.setProperty('--parallax-x', '0px');
        heroBg.style.setProperty('--parallax-y', '0px');
    });
});

// Onglets de la section À propos
document.addEventListener('portfolio:ready', function () {
    const tabs = Array.from(document.querySelectorAll('.about-tab'));

    function selectTab(tab) {
        tabs.forEach(t => {
            const isActive = t === tab;
            t.classList.toggle('active', isActive);
            t.setAttribute('aria-selected', isActive);
            t.tabIndex = isActive ? 0 : -1;
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            panel.hidden = !isActive;
            panel.classList.toggle('active', isActive);
        });
        tab.closest('.about-content').querySelector('.about-panels').scrollTop = 0;
        tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab));

        // Navigation clavier avec les flèches
        tab.addEventListener('keydown', function (e) {
            let next = null;
            if (e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
            if (e.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
            if (next) {
                next.focus();
                selectTab(next);
            }
        });
    });
});

// Cartes de projets cliquables : le lien GitHub (sinon le premier lien) couvre toute la carte
document.addEventListener('portfolio:ready', function () {
    document.querySelectorAll('.project-card').forEach(card => {
        const link = card.querySelector('.project-links [data-link="github"]')
            || card.querySelector('.project-links a[href*="github.com"]')
            || card.querySelector('.project-links a');
        if (!link) return;

        const title = card.querySelector('.project-title h3');
        link.classList.add('project-card-link');
        link.setAttribute('aria-label', `Open ${title ? title.textContent.trim() : 'project'}`);
        link.target = '_blank';
        link.rel = 'noopener';
    });
});

// Carrousels de projets
document.addEventListener('portfolio:ready', function () {
    document.querySelectorAll('.project-group').forEach(group => {
        const track = group.querySelector('.carousel-track');
        const prev = group.querySelector('.carousel-btn.prev');
        const next = group.querySelector('.carousel-btn.next');

        if (!track || !prev || !next) return;

        function step() {
            const card = track.querySelector('.project-card');
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return card ? card.offsetWidth + gap : track.clientWidth;
        }

        function updateButtons() {
            const maxScroll = track.scrollWidth - track.clientWidth;
            prev.disabled = track.scrollLeft <= 1;
            next.disabled = track.scrollLeft >= maxScroll - 1;
        }

        prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
        next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
        track.addEventListener('scroll', updateButtons, { passive: true });
        window.addEventListener('resize', updateButtons);
        updateButtons();
    });
});
