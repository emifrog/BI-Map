// Suggestions searchbox
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchText');
    const autocomBox = document.querySelector('.autocom-box');

    let allSuggestions = [];

    async function loadSuggestions() {
        try {
            const response = await fetch('data/fires.json');
            allSuggestions = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des suggestions:', error);
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
                    const safeUrl = encodeURI(suggestion.url);
                    return '<li><a href="' + safeUrl + '">' + safeText + '</a></li>';
                })
                .join('');
            autocomBox.style.display = 'block';
        } else {
            autocomBox.style.display = 'none';
        }
    });

    autocomBox.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            searchInput.value = e.target.textContent;
            window.location.href = e.target.href;
            autocomBox.style.display = 'none';
        }
    });
});
