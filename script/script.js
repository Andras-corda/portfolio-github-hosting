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
document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('DOMContentLoaded', function () {
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

// Contribution graph animation
document.addEventListener('DOMContentLoaded', function () {
    const graphContainer = document.querySelector('.graph-weeks');

    if (graphContainer) {
        generateContributionGraph();
    }

    function generateContributionGraph() {
        const weeks = 52;
        const daysPerWeek = 7;

        for (let week = 0; week < weeks; week++) {
            const weekElement = document.createElement('div');
            weekElement.className = 'graph-week';
            weekElement.style.cssText = 'display: flex; flex-direction: column; gap: 3px;';

            for (let day = 0; day < daysPerWeek; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'graph-day';

                // Générer un niveau aléatoire de contribution
                const level = Math.floor(Math.random() * 5);
                dayElement.classList.add(`level-${level}`);

                // Styles pour les carrés
                dayElement.style.cssText = `
                    width: 10px;
                    height: 10px;
                    border-radius: 2px;
                    background: var(--bg-secondary);
                `;

                switch (level) {
                    case 0:
                        dayElement.style.background = 'var(--bg-secondary)';
                        break;
                    case 1:
                        dayElement.style.background = '#0e4429';
                        break;
                    case 2:
                        dayElement.style.background = '#006d32';
                        break;
                    case 3:
                        dayElement.style.background = '#26a641';
                        break;
                    case 4:
                        dayElement.style.background = '#39d353';
                        break;
                }

                weekElement.appendChild(dayElement);
            }

            graphContainer.appendChild(weekElement);
        }
    }
});

// Animations au scroll
document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('DOMContentLoaded', function () {
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