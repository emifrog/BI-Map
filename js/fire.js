// Suggestions searchbox
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchText');
    const autocomBox = document.querySelector('.autocom-box');
    const form = document.querySelector('form[role="search"]');

    // Empecher le submit du formulaire (recharge la page)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    let allSuggestions = [];

    async function loadSuggestions() {
        // Construire l'URL absolue a partir de l'emplacement de la page
        const base = new URL('.', window.location.href).href;
        const url = base + 'data/fires.json';
        console.log('FIRE: chargement depuis', url);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            allSuggestions = await response.json();
            console.log('FIRE: ' + allSuggestions.length + ' fiches chargees');
        } catch (error) {
            console.error('FIRE: erreur chargement:', error);
        }
    }

    loadSuggestions();

    /**
     * Echappe les caracteres HTML pour prevenir les injections XSS
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (!value) {
            autocomBox.style.display = 'none';
            return;
        }

        const filteredSuggestions = allSuggestions.filter(item =>
            item.text.toLowerCase().includes(value.toLowerCase())
        );

        if (filteredSuggestions.length) {
            autocomBox.innerHTML = filteredSuggestions
                .map(suggestion => {
                    const safeText = escapeHTML(suggestion.text);
                    const safeUrl = suggestion.url.replace(/"/g, '&quot;');
                    return '<li><a href="' + safeUrl + '" target="_blank">' + safeText + '</a></li>';
                })
                .join('');
            autocomBox.style.display = 'block';
        } else {
            autocomBox.style.display = 'none';
        }
    });

    autocomBox.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            searchInput.value = link.textContent;
            autocomBox.style.display = 'none';
            window.open(link.href, '_blank');
        }
    });
});
