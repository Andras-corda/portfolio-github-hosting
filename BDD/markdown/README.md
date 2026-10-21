# BDD — Contenu du portfolio

Tout ce qui s'affiche sur le site vient de ce dossier. `index.html` ne contient que la structure de la page.

- **`json/`** → la **configuration** : réglages, liens, icônes, listes, statistiques
- **`markdown/`** → les **textes**

## Configuration (`BDD/json/`)

| Fichier | Contenu |
|---|---|
| [global.json](../json/global.json) | Site (titre, favicon, footer, fond de l'accueil), identité, compte GitHub, boutons de l'accueil, titres des sections et menu, contact, réseaux, carte |
| [about.json](../json/about.json) | Onglets de « About me » (ordre, libellé, icône, type, fichier texte) |
| [skills.json](../json/skills.json) | Catégories et compétences de « Languages and Tools » |
| [projects.json](../json/projects.json) | Catégories de projets et cartes (dépôt, image, technos, liens, stats de secours, fichier texte) |

## Textes (`BDD/markdown/`)

| Fichier | Affiché dans |
|---|---|
| [accueil.md](accueil.md) | Accueil, texte sous le titre |
| [about/readme.md](about/readme.md) | Onglet README.md (affiché tel quel) |
| [about/degrees.md](about/degrees.md) | Onglet Degrees : `## Titre`, puis `**période**`, puis le texte |
| [about/plan.md](about/plan.md) | Onglet Plan : `- [x]` terminé, `- [~]` en cours, `- [ ]` à faire |
| `projets/<catégorie>/<projet>.md` | Description de chaque carte de projet |
| [projets/_template.md](projets/_template.md) | Modèle pour ajouter un projet |

Une description de projet vide utilise la description « About » du dépôt GitHub, sinon le début de son README.
Les commentaires `<!-- … -->` ne sont pas affichés.

## Arborescence

```
BDD/
├── json/
│   ├── global.json
│   ├── about.json
│   ├── skills.json
│   └── projects.json
└── markdown/
    ├── README.md               ← ce fichier (non affiché)
    ├── accueil.md
    ├── about/
    │   ├── readme.md
    │   ├── degrees.md
    │   └── plan.md
    └── projets/
        ├── _template.md
        ├── school-projects-exams/
        │   ├── yukais-quest-for-cureness.md
        │   ├── ctos.md
        │   └── blenderheaj.md
        ├── game-jams-side-projects/
        │   ├── watch-dogs-gameplay-prototype.md
        │   ├── codex.md
        │   └── portfolio.md
        └── modding/
            ├── ink-machine.md
            └── eagle-vision.md
```
