// Suggestions searchbox
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchText');
    const autocomBox = document.querySelector('.autocom-box');
    
    // Charger les suggestions une seule fois au démarrage
    let allSuggestions = [];
    
    async function loadSuggestions() {
        try {
            const response = await fetch('/data/fires.json');
            allSuggestions = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des suggestions:', error);
        }
    }
    
    loadSuggestions();

    searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (!value) {
            autocomBox.style.display = 'none';
            return;
        }

        // Modifier le filtre pour chercher dans le texte
        const filteredSuggestions = allSuggestions.filter(item =>
            item.text.toLowerCase().includes(value.toLowerCase())
        );

        if (filteredSuggestions.length) {
            autocomBox.innerHTML = filteredSuggestions
                .map(suggestion => `<li><a href="${suggestion.url}">${suggestion.text}</a></li>`)
                .join('');
            autocomBox.style.display = 'block';
        } else {
            autocomBox.style.display = 'none';
        }
    });
    
    // Modifier le gestionnaire de clic
    autocomBox.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault(); // Empêche le comportement par défaut du lien
            searchInput.value = e.target.textContent;
            window.location.href = e.target.href; // Redirection vers l'URL
            autocomBox.style.display = 'none';
        }
    });
});