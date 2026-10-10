# BDD — Sauvegarde du contenu du portfolio

Ce dossier contient une sauvegarde de tout le contenu affiché sur le site.
Les informations globales (liens, contact, réglages) sont dans [`../json/global.json`](../json/global.json).

> Si tu modifies un texte sur le site, pense à le mettre à jour ici aussi (et inversement).

## Sommaire

| Fichier | Contenu |
|---|---|
| [site.md](site.md) | Métadonnées, navigation, thèmes, footer |
| [accueil.md](accueil.md) | Section Accueil (titre, description, boutons, carte de profil) |
| [about/readme.md](about/readme.md) | Onglet README.md |
| [about/degrees.md](about/degrees.md) | Onglet Degrees (diplômes) |
| [about/plan.md](about/plan.md) | Onglet Plan (objectifs) |
| [about/contribution.md](about/contribution.md) | Onglet Contribution (données GitHub) |
| [competences.md](competences.md) | Section Languages and Tools |
| [projets/README.md](projets/README.md) | Index des projets par catégorie |
| [projets/_template.md](projets/_template.md) | Modèle pour ajouter un projet |
| [contact.md](contact.md) | Section Contact |

## Arborescence

```
BDD/
├── json/
│   ├── global.json
│   └── projects.json
└── markdown/
    ├── README.md
    ├── site.md
    ├── accueil.md
    ├── competences.md
    ├── contact.md
    ├── about/
    │   ├── readme.md
    │   ├── degrees.md
    │   ├── plan.md
    │   └── contribution.md
    └── projets/
        ├── README.md
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
