/**
 * Attend que le contenu de la page soit entièrement chargé avant d'exécuter le script.
 * C'est une bonne pratique pour s'assurer que tous les éléments HTML sont disponibles.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- BASE DE DONNÉES DES RECETTES ---
    // Toutes les informations sont centralisées ici. Pour ajouter une recette,
    // il suffit d'ajouter un nouvel objet dans ce tableau.
    const recipes = [
        { id: 1, name: "Salade de tomate mozzarella", href: "recette/tomateMozza1.html", image: "images/salade.jpg", type: "plat", time: "10 min", difficulty: "Facile" },
        { id: 2, name: "Cookie", href: "recette/cookie2.html", image: "images/cookie.jpg", type: "dessert", time: "25 min", difficulty: "Facile" },
        { id: 3, name: "Tarte au chocolat", href: "recette/tarteChocolat3.html", image: "images/tarteChocolat.jpg", type: "dessert", time: "45 min", difficulty: "Moyen" },
        { id: 4, name: "Tarte poires amandines", href: "recette/poireAmandine4.html", image: "images/poirAmandine.jpg", type: "dessert", time: "1h", difficulty: "Moyen" },
        { id: 5, name: "Bûche de Noël 🎅", href: "recette/buche5.html", image: "images/buche.jpg", type: "dessert", time: "2h", difficulty: "Difficile" },
        { id: 6, name: "Pancakes", href: "recette/pancakes6.html", image: "images/pancakes.jpg", type: "dessert", time: "20 min", difficulty: "Facile" },
        { id: 7, name: "Noix de St Jaques à la crème", href: "recette/stJaques7.html", image: "images/stJacque.jpg", type: "plat", time: "30 min", difficulty: "Moyen" },
        { id: 8, name: "Petits Financiers", href: "recette/petitsFinaciers8.html", image: "images/petitsFinanciers.jpg", type: "dessert", time: "35 min", difficulty: "Facile" },
        { id: 9, name: "Brioche étoilée à la pâte à tartiner", href: "recette/briocheEtoile9.html", image: "images/briocheEtoile.jpg", type: "dessert", time: "1h 30", difficulty: "Moyen" },
        { id: 10, name: "Tartiflette", href: "recette/tartiflette10.html", image: "images/Tartiflette.jpg", type: "plat", time: "50 min", difficulty: "Facile" },
        { id: 11, name: "Galette des Rois", href: "recette/galetteDesRois11.html", image: "images/galette.jpg", type: "dessert", time: "1h 15", difficulty: "Moyen" },
        { id: 12, name: "Verrines Guacamole Crevettes", href: "recette/verrinesCrevettes12.html", image: "images/verrine.jpg", type: "aperitif", time: "20 min", difficulty: "Facile" },
        { id: 13, name: "Crème brulé", href: "recette/cremeBrulee13.html", image: "images/creme-brulee.jpg", type: "dessert", time: "20 min", difficulty: "Facile" }
    ];

    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const searchInput = document.getElementById('search-input');
    const suggestionList = document.getElementById('suggestion-list');
    const filtersContainer = document.getElementById('filters-container');
    const recipeList = document.getElementById('recipe-list');
    const userInfo = document.getElementById('user-info');
    
    // --- GESTION DE L'UTILISATEUR ---
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && !currentUser.favorites) {
        currentUser.favorites = []; // Initialise les favoris si l'utilisateur n'en a pas
    }
    
    // --- INJECTION DES STYLES CSS POUR LES FAVORIS ---
    const style = document.createElement('style');
    style.innerHTML = `
        .favorite-btn.favorited svg {
            fill: #f59e0b; /* Couleur de remplissage pour l'étoile favorite */
            stroke: #f59e0b;
        }
    `;
    document.head.appendChild(style);


    // --- FONCTIONS PRINCIPALES ---

    /**
     * Génère et affiche les cartes de recettes dans le HTML.
     * @param {Array} recipesToDisplay - Le tableau des recettes à afficher.
     */
    function displayRecipes(recipesToDisplay) {
        recipeList.innerHTML = '';
        if (recipesToDisplay.length === 0) {
            recipeList.innerHTML = `<p class="col-span-full text-center text-gray-500">Aucune recette ne correspond à votre recherche.</p>`;
            return;
        }

        recipesToDisplay.forEach(recipe => {
            const listItem = document.createElement('li');
            listItem.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow relative'; // Ajout de 'relative' pour le positionnement du bouton

            const isFavorited = currentUser ? currentUser.favorites.includes(recipe.id) : false;

            const favoriteButtonHTML = currentUser ? `
                <button class="favorite-btn absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-75 text-gray-400 hover:text-yellow-500 transition-colors z-10 ${isFavorited ? 'favorited' : ''}" data-recipe-id="${recipe.id}" aria-label="Ajouter aux favoris">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </button>
            ` : '';
            
            listItem.innerHTML = `
                ${favoriteButtonHTML}
                <a href="${recipe.href}" class="block">
                    <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="font-semibold text-lg mb-2">${recipe.name}</h3>
                        <div class="flex justify-between text-sm text-gray-500">
                           <span class="flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                ${recipe.time}
                           </span>
                           <span class="flex items-center">
                               <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                               ${recipe.difficulty}
                           </span>
                        </div>
                    </div>
                </a>
            `;
            recipeList.appendChild(listItem);
        });
    }

    // --- GESTION DES CLICS (FAVORIS INCLUS) ---
    recipeList.addEventListener('click', (event) => {
        const favoriteBtn = event.target.closest('.favorite-btn');
        if (favoriteBtn) {
            event.preventDefault(); // Empêche de suivre le lien de la carte
            event.stopPropagation();

            if (!currentUser) return; // Sécurité, même si le bouton ne devrait pas être là

            const recipeId = parseInt(favoriteBtn.dataset.recipeId, 10);
            const isFavorited = favoriteBtn.classList.toggle('favorited');

            if (isFavorited) {
                if (!currentUser.favorites.includes(recipeId)) currentUser.favorites.push(recipeId);
            } else {
                currentUser.favorites = currentUser.favorites.filter(id => id !== recipeId);
            }
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    });

    // --- GESTION DU MODE SOMBRE ---
    function applyDarkMode(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            themeIconSun.classList.add('hidden');
            themeIconMoon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeIconSun.classList.remove('hidden');
            themeIconMoon.classList.add('hidden');
        }
    }

    darkModeToggle.addEventListener('click', () => {
        const isDarkMode = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDarkMode);
        applyDarkMode(isDarkMode);
    });


    // --- GESTION DES FILTRES ---
    filtersContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            document.querySelectorAll('#filters-container button').forEach(btn => {
                btn.classList.remove('bg-green-500', 'text-white');
                btn.classList.add('bg-white', 'text-gray-800', 'border', 'border-gray-300');
            });
            event.target.classList.add('bg-green-500', 'text-white');
            event.target.classList.remove('bg-white', 'text-gray-800', 'border', 'border-gray-300');

            const filterType = event.target.dataset.filter;
            
            let filteredRecipes;
            if (filterType === 'tous') {
                filteredRecipes = recipes;
            } else if (filterType === 'favoris') {
                filteredRecipes = recipes.filter(recipe => currentUser.favorites.includes(recipe.id));
            } else {
                filteredRecipes = recipes.filter(recipe => recipe.type === filterType);
            }
            displayRecipes(filteredRecipes);
        }
    });

    // --- GESTION DE LA RECHERCHE ET SUGGESTIONS ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        suggestionList.innerHTML = '';
        if (query) {
            const suggestions = recipes.filter(r => r.name.toLowerCase().includes(query)).slice(0, 5);
            suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion.name;
                li.className = 'p-2 hover:bg-gray-100 cursor-pointer';
                li.addEventListener('click', () => {
                    window.location.href = suggestion.href;
                });
                suggestionList.appendChild(li);
            });
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) suggestionList.innerHTML = '';
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.toLowerCase().trim();
            const searchResult = recipes.filter(r => r.name.toLowerCase().includes(query));
            displayRecipes(searchResult);
            suggestionList.innerHTML = '';
        }
    });

    // --- GESTION DE L'UTILISATEUR (Exemple) ---
    function setupUserInfo() {
        if (currentUser) {
            const hasAdminAccess = ['admin', 'fondateur', 'co-fondateur'].includes(currentUser.role);
            userInfo.innerHTML = `
                <span>Bienvenue, ${currentUser.email} !</span>
                <button onclick="logout()" class="ml-2 text-sm text-red-500 hover:underline">Déconnexion</button>
                ${hasAdminAccess ? '<a href="admin.html" class="ml-4 text-sm text-green-600 hover:underline">Panel Admin</a>' : ''}
            `;
            // Ajoute le filtre "Favoris" si l'utilisateur est connecté
            const favoriteFilter = document.createElement('button');
            favoriteFilter.className = "filter-button bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-full border border-gray-300";
            favoriteFilter.dataset.filter = "favoris";
            favoriteFilter.innerHTML = "⭐ Mes favoris";
            filtersContainer.appendChild(favoriteFilter);
        } else {
            userInfo.innerHTML = `
                <a href="login.html" class="hover:underline">Se connecter</a>
                <a href="inscription.html" class="ml-4 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600">S'inscrire</a>
            `;
        }
    }
    
    window.logout = function() {
        sessionStorage.removeItem('currentUser');
        window.location.reload();
    }

    // --- INITIALISATION DE LA PAGE ---
    function init() {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        applyDarkMode(savedDarkMode);
        setupUserInfo();
        displayRecipes(recipes);
    }

    init();
});

