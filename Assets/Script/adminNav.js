// Navigation entre sections
function showSection(sectionId, event) {
    // Cacher toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Désactiver tous les onglets
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Afficher la section sélectionnée
    document.getElementById(sectionId).classList.add('active');

    // Activer l'onglet correspondant
    if (event) {
        event.target.classList.add('active');
    }

    // Stocker l'ID de la section active
    localStorage.setItem('activeSection', sectionId);
}

document.addEventListener('DOMContentLoaded', function () {
    const savedSection = localStorage.getItem('activeSection');

    if (savedSection && document.getElementById(savedSection)) {
        showSection(savedSection);
    } else {
        // Par défaut : montrer la première section
        const firstSection = document.querySelector('.section');
        const firstSectionId = firstSection ? firstSection.id : null;
        if (firstSectionId) {
            showSection(firstSectionId);
        }
    }
});