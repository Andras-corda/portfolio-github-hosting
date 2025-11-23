// Éléments du DOM
const privacyLink = document.getElementById('privacy-link');
const legalLink = document.getElementById('legal-link');
const privacyModal = document.getElementById('privacy-modal');
const legalModal = document.getElementById('legal-modal');
const closePrivacy = document.getElementById('close-privacy');
const closeLegal = document.getElementById('close-legal');

// Fonctions pour ouvrir les modales
function openModal(modal) {
    modal.style.display = 'flex';
    // Petit délai pour l'animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    // Attendre la fin de l'animation
    setTimeout(() => {
        modal.style.display = 'none';
        // Réactiver le scroll du body
        document.body.style.overflow = 'auto';
    }, 300);
}

// Event listeners pour ouvrir les modales
privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(privacyModal);
});

legalLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(legalModal);
});

// Event listeners pour fermer les modales
closePrivacy.addEventListener('click', () => {
    closeModal(privacyModal);
});

closeLegal.addEventListener('click', () => {
    closeModal(legalModal);
});

// Fermer les modales en cliquant en dehors
privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
        closeModal(privacyModal);
    }
});

legalModal.addEventListener('click', (e) => {
    if (e.target === legalModal) {
        closeModal(legalModal);
    }
});

// Fermer les modales avec la touche Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (privacyModal.classList.contains('show')) {
            closeModal(privacyModal);
        }
        if (legalModal.classList.contains('show')) {
            closeModal(legalModal);
        }
    }
});