/**
 * script.js — Le Coin Gourmand (version améliorée)
 * Nouveautés : favoris sans connexion (localStorage), notation par étoiles,
 * tri par note, design amélioré, animations, mode sombre complet.
 */
document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // BASE DES RECETTES
    // =====================================================================
    const recipes = [
        { id: 1,  name: "Salade de tomate mozzarella",          href: "recette/tomateMozza1.html",       image: "images/salade.jpg",           type: "plat",     time: "10 min",  difficulty: "Facile"    },
        { id: 2,  name: "Cookie",                                href: "recette/cookie2.html",            image: "images/cookie.jpg",           type: "dessert",  time: "25 min",  difficulty: "Facile"    },
        { id: 3,  name: "Tarte au chocolat",                     href: "recette/tarteChocolat3.html",     image: "images/tarteChocolat.jpg",    type: "dessert",  time: "45 min",  difficulty: "Moyen"     },
        { id: 4,  name: "Tarte poires amandines",                href: "recette/poireAmandine4.html",     image: "images/poirAmandine.jpg",     type: "dessert",  time: "1h",      difficulty: "Moyen"     },
        { id: 5,  name: "Bûche de Noël 🎅",                      href: "recette/buche5.html",             image: "images/buche.jpg",            type: "dessert",  time: "2h",      difficulty: "Difficile" },
        { id: 6,  name: "Pancakes",                              href: "recette/pancakes6.html",          image: "images/pancakes.jpg",         type: "dessert",  time: "20 min",  difficulty: "Facile"    },
        { id: 7,  name: "Noix de St Jaques à la crème",         href: "recette/stJaques7.html",          image: "images/stJacque.jpg",         type: "plat",     time: "30 min",  difficulty: "Moyen"     },
        { id: 8,  name: "Petits Financiers",                     href: "recette/petitsFinaciers8.html",   image: "images/petitsFinanciers.jpg", type: "dessert",  time: "35 min",  difficulty: "Facile"    },
        { id: 9,  name: "Brioche étoilée à la pâte à tartiner", href: "recette/briocheEtoile9.html",     image: "images/briocheEtoile.jpg",    type: "dessert",  time: "1h 30",   difficulty: "Moyen"     },
        { id: 10, name: "Tartiflette",                           href: "recette/tartiflette10.html",      image: "images/Tartiflette.jpg",      type: "plat",     time: "50 min",  difficulty: "Facile"    },
        { id: 11, name: "Galette des Rois",                      href: "recette/galetteDesRois11.html",   image: "images/galette.jpg",          type: "dessert",  time: "1h 15",   difficulty: "Moyen"     },
        { id: 12, name: "Verrines Guacamole Crevettes",          href: "recette/verrinesCrevettes12.html",image: "images/verrine.jpg",          type: "aperitif", time: "20 min",  difficulty: "Facile"    },
        { id: 13, name: "Crème brulée",                          href: "recette/cremeBrulee13.html",      image: "images/creme-brulee.jpg",     type: "dessert",  time: "20 min",  difficulty: "Facile"    },
        { id: 14, name: "Gyoza Japonais",                        href: "recette/gyoza14.html",            image: "images/gyoza.jpg",            type: "plat",     time: "40 min",  difficulty: "Moyen"     },
        { id: 15, name: "Mini Quiches Apéritives",               href: "recette/miniQuiches15.html",      image: "images/mini-quiches.jpg",     type: "aperitif", time: "30 min",  difficulty: "Facile"    },
        { id: 16, name: "Mini Pizzas Apéritives",                href: "recette/miniPizzas16.html",       image: "images/mini-pizzas.jpg",      type: "aperitif", time: "25 min",  difficulty: "Facile"    },
        { id: 17, name: "Mini Brochettes de Poulet au Miel et Moutarde", href: "recette/brochettesPoulet17.html", image: "images/brochettes-poulet.jpg", type: "aperitif", time: "20 min", difficulty: "Facile" }
    ];

    // =====================================================================
    // ÉTAT PERSISTANT (localStorage)
    // =====================================================================

    /**
     * Favoris : Set d'IDs de recettes (stocké pour tout le monde, sans connexion requise)
     */
    function loadFavorites() {
        try {
            const saved = localStorage.getItem('lcg_favorites');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    }

    function saveFavorites(favSet) {
        localStorage.setItem('lcg_favorites', JSON.stringify([...favSet]));
    }

    let favorites = loadFavorites();

    /**
     * Notations : { recipeId: { total: number, count: number } }
     */
    function loadRatings() {
        try {
            const saved = localStorage.getItem('lcg_ratings');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    }

    function saveRatings(ratingsObj) {
        localStorage.setItem('lcg_ratings', JSON.stringify(ratingsObj));
    }

    let ratingsData = loadRatings();

    function getAvgRating(id) {
        const r = ratingsData[id];
        if (!r || r.count === 0) return 0;
        return r.total / r.count;
    }

    function addRating(id, stars) {
        if (!ratingsData[id]) ratingsData[id] = { total: 0, count: 0 };
        ratingsData[id].total += stars;
        ratingsData[id].count += 1;
        saveRatings(ratingsData);
    }

    // =====================================================================
    // DOM
    // =====================================================================
    const darkModeToggle   = document.getElementById('dark-mode-toggle');
    const themeIconSun     = document.getElementById('theme-icon-sun');
    const themeIconMoon    = document.getElementById('theme-icon-moon');
    const searchInput      = document.getElementById('search-input');
    const suggestionList   = document.getElementById('suggestion-list');
    const filtersContainer = document.getElementById('filters-container');
    const recipeList       = document.getElementById('recipe-list');
    const userInfo         = document.getElementById('user-info');
    const splashScreen     = document.getElementById('splash-screen');
    const splashContent    = document.getElementById('splash-content');
    const splashLogo       = document.getElementById('splash-logo');
    const headerLogo       = document.getElementById('header-logo');
    const sortSelect       = document.getElementById('sort-select');

    // =====================================================================
    // SESSION UTILISATEUR
    // =====================================================================
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && !currentUser.favorites) currentUser.favorites = [];

    // =====================================================================
    // ÉTAT AFFICHÉ
    // =====================================================================
    let currentDisplayedRecipes = [...recipes];

    // =====================================================================
    // SPLASH SCREEN ANIMATION
    // =====================================================================
    function setAndRunLogoAnimation() {
        if (!splashLogo || !headerLogo || !splashContent) return;
        const headerRect = headerLogo.getBoundingClientRect();
        const splashRect = splashLogo.getBoundingClientRect();
        const deltaX = headerRect.left - splashRect.left;
        const deltaY = headerRect.top - splashRect.top;
        splashContent.style.setProperty('--logo-end-transform', `translate(${deltaX}px, ${deltaY}px) scale(0.75)`);
        splashContent.classList.add('animate');
    }

    // =====================================================================
    // PARSEUR DE TEMPS
    // =====================================================================
    function parseTimeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const s = String(timeStr).toLowerCase();
        let hours = 0, minutes = 0;
        const hMatch = s.match(/(\d+)\s*h/);
        if (hMatch) hours = parseInt(hMatch[1], 10);
        const mMatch = s.match(/(\d+)\s*min/);
        if (mMatch) {
            minutes = parseInt(mMatch[1], 10);
        } else {
            const afterH = s.match(/h\s*(\d+)/);
            if (afterH) minutes = parseInt(afterH[1], 10);
            else {
                const onlyNum = s.match(/^(\d+)\s*$/);
                if (onlyNum) minutes = parseInt(onlyNum[1], 10);
            }
        }
        return hours * 60 + minutes;
    }

    // =====================================================================
    // TRI
    // =====================================================================
    function sortRecipes(arr, criteria) {
        if (!criteria || criteria === 'default') return arr;
        const copy = [...arr];
        if (criteria === 'time-asc')  return copy.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
        if (criteria === 'time-desc') return copy.sort((a, b) => parseTimeToMinutes(b.time) - parseTimeToMinutes(a.time));
        if (criteria === 'difficulty') {
            const order = { 'Facile': 1, 'Moyen': 2, 'Difficile': 3 };
            return copy.sort((a, b) => (order[a.difficulty] || 99) - (order[b.difficulty] || 99));
        }
        if (criteria === 'rating') {
            return copy.sort((a, b) => getAvgRating(b.id) - getAvgRating(a.id));
        }
        return copy;
    }

    // =====================================================================
    // RENDU DES ÉTOILES
    // =====================================================================
    function renderStars(recipeId) {
        const avg   = getAvgRating(recipeId);
        const count = ratingsData[recipeId] ? ratingsData[recipeId].count : 0;
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= Math.round(avg);
            starsHTML += `<button class="star-btn ${filled ? 'active' : ''}" data-recipe-id="${recipeId}" data-star="${i}" aria-label="Noter ${i} étoile${i > 1 ? 's' : ''}">★</button>`;
        }
        const countLabel = count > 0 ? `<span class="rating-count">(${count})</span>` : '';
        return `<div class="star-rating" data-rating-id="${recipeId}">
            <span class="label">Note :</span>
            ${starsHTML}
            ${countLabel}
        </div>`;
    }

    // =====================================================================
    // BADGE CATÉGORIE
    // =====================================================================
    const categoryLabels = { plat: 'Plat', dessert: 'Dessert', aperitif: 'Apéritif' };

    // =====================================================================
    // BADGE DIFFICULTÉ
    // =====================================================================
    function difficultyBadge(difficulty) {
        const cls = { 'Facile': 'diff-facile', 'Moyen': 'diff-moyen', 'Difficile': 'diff-difficile' };
        return `<span class="meta-pill">
            <span class="difficulty-dot ${cls[difficulty] || ''}"></span>${difficulty}
        </span>`;
    }

    // =====================================================================
    // AFFICHAGE DES RECETTES
    // =====================================================================
    function displayRecipes(recipesToDisplay) {
        currentDisplayedRecipes = Array.isArray(recipesToDisplay) ? [...recipesToDisplay] : [];
        recipeList.innerHTML = '';

        if (recipesToDisplay.length === 0) {
            recipeList.innerHTML = `<li class="empty-state"><p>🍽</p><p>Aucune recette ne correspond à votre recherche.</p></li>`;
            return;
        }

        recipesToDisplay.forEach(recipe => {
            const li = document.createElement('li');
            li.className = 'recipe-card';
            li.dataset.id = recipe.id;

            const isFav = favorites.has(recipe.id);

            li.innerHTML = `
                <a href="${recipe.href}" class="card-link" style="text-decoration:none; color:inherit; display:block;">
                    <div class="card-image-wrapper">
                        <img src="${recipe.image}" alt="${recipe.name}" loading="lazy">
                        <div class="card-overlay"></div>
                        <span class="card-badge">${categoryLabels[recipe.type] || recipe.type}</span>
                    </div>
                </a>
                <button class="favorite-btn ${isFav ? 'favorited' : ''}" data-recipe-id="${recipe.id}" aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                    <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                </button>
                <a href="${recipe.href}" style="text-decoration:none; color:inherit; display:block;">
                    <div class="card-body">
                        <h3>${recipe.name}</h3>
                        <div class="card-meta">
                            <span class="meta-pill">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                ${recipe.time}
                            </span>
                            ${difficultyBadge(recipe.difficulty)}
                        </div>
                        ${renderStars(recipe.id)}
                    </div>
                </a>
            `;
            recipeList.appendChild(li);
        });
    }

    // =====================================================================
    // GESTION DES CLICS SUR LA LISTE (favoris + étoiles)
    // =====================================================================
    recipeList.addEventListener('click', (e) => {
        // --- FAVORIS ---
        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(favBtn.dataset.recipeId, 10);
            if (favorites.has(id)) {
                favorites.delete(id);
                favBtn.classList.remove('favorited');
                favBtn.setAttribute('aria-label', 'Ajouter aux favoris');
                favBtn.querySelector('svg').setAttribute('fill', 'none');
            } else {
                favorites.add(id);
                favBtn.classList.add('favorited');
                favBtn.setAttribute('aria-label', 'Retirer des favoris');
                favBtn.querySelector('svg').setAttribute('fill', 'currentColor');
            }
            saveFavorites(favorites);

            // Animation pop
            favBtn.classList.remove('pop');
            void favBtn.offsetWidth; // reflow
            favBtn.classList.add('pop');

            // Sync avec l'ancien système sessionStorage si connecté
            if (currentUser) {
                if (favorites.has(id)) {
                    if (!currentUser.favorites.includes(id)) currentUser.favorites.push(id);
                } else {
                    currentUser.favorites = currentUser.favorites.filter(fid => fid !== id);
                }
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            return;
        }

        // --- ÉTOILES ---
        const starBtn = e.target.closest('.star-btn');
        if (starBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id    = parseInt(starBtn.dataset.recipeId, 10);
            const stars = parseInt(starBtn.dataset.star, 10);
            addRating(id, stars);

            // Mise à jour visuelle du bloc d'étoiles sans re-render la carte entière
            const ratingBlock = recipeList.querySelector(`.star-rating[data-rating-id="${id}"]`);
            if (ratingBlock) {
                ratingBlock.outerHTML = renderStars(id);
            }
        }
    });

    // =====================================================================
    // MODE SOMBRE
    // =====================================================================
    function applyDarkMode(isDark) {
        document.documentElement.classList.toggle('dark', isDark);
        themeIconSun.style.display  = isDark ? 'none' : '';
        themeIconMoon.style.display = isDark ? '' : 'none';
    }

    darkModeToggle.addEventListener('click', () => {
        const isDark = !document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
        applyDarkMode(isDark);
    });

    // =====================================================================
    // FILTRES
    // =====================================================================
    filtersContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-button');
        if (!btn) return;

        document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        let filtered;
        if (filter === 'tous')     filtered = recipes;
        else if (filter === 'favoris') filtered = recipes.filter(r => favorites.has(r.id));
        else filtered = recipes.filter(r => r.type === filter);

        const criteria = sortSelect ? sortSelect.value : 'default';
        displayRecipes(sortRecipes(filtered, criteria));
    });

    // =====================================================================
    // RECHERCHE ET SUGGESTIONS
    // =====================================================================
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        suggestionList.innerHTML = '';
        if (!query) return;

        const suggestions = recipes.filter(r => r.name.toLowerCase().includes(query)).slice(0, 6);
        suggestions.forEach(s => {
            const li = document.createElement('li');
            li.textContent = s.name;
            li.addEventListener('click', () => { window.location.href = s.href; });
            suggestionList.appendChild(li);
        });
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionList.contains(e.target)) {
            suggestionList.innerHTML = '';
        }
    });

    document.getElementById('search-button').addEventListener('click', () => {
        triggerSearch();
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') triggerSearch();
    });

    function triggerSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const results = query ? recipes.filter(r => r.name.toLowerCase().includes(query)) : recipes;
        const criteria = sortSelect ? sortSelect.value : 'default';
        displayRecipes(sortRecipes(results, criteria));
        suggestionList.innerHTML = '';
    }

    // =====================================================================
    // TRI
    // =====================================================================
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            displayRecipes(sortRecipes(currentDisplayedRecipes, sortSelect.value));
        });
    }

    // =====================================================================
    // INFORMATIONS UTILISATEUR
    // =====================================================================
    function setupUserInfo() {
        if (currentUser) {
            const isAdmin = ['admin', 'fondateur', 'co-fondateur'].includes(currentUser.role);
            userInfo.innerHTML = `
                <span>${currentUser.email}</span>
                <button onclick="logout()" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:0.82rem;font-family:inherit;padding:0.35rem 0.7rem;border-radius:999px;transition:background 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'">Déconnexion</button>
                ${isAdmin ? '<a href="admin.html" style="color:var(--green);font-size:0.82rem;text-decoration:none;padding:0.35rem 0.7rem;border-radius:999px;" onmouseover="this.style.background=\'var(--green-pale)\'" onmouseout="this.style.background=\'none\'">Panel Admin</a>' : ''}
            `;
        } else {
            userInfo.innerHTML = `
                <a href="login.html">Se connecter</a>
                <a href="inscription.html" class="btn-register">S'inscrire</a>
            `;
        }

        // Bouton "Mes favoris" (visible pour tous, pas seulement les connectés)
        if (!document.querySelector('#filters-container button[data-filter="favoris"]')) {
            const favBtn = document.createElement('button');
            favBtn.className = 'filter-button';
            favBtn.dataset.filter = 'favoris';
            favBtn.textContent = '♥ Mes favoris';
            filtersContainer.appendChild(favBtn);
        }
    }

    window.logout = function () {
        sessionStorage.removeItem('currentUser');
        window.location.reload();
    };

    // =====================================================================
    // INITIALISATION
    // =====================================================================
    function init() {
        // Splash
        if (splashScreen) {
            setTimeout(() => setAndRunLogoAnimation(), 100);
            window.addEventListener('resize', setAndRunLogoAnimation);
            setTimeout(() => { if (splashScreen) splashScreen.style.display = 'none'; }, 3500);
        }

        // Dark mode
        const savedDark = localStorage.getItem('darkMode') === 'true';
        applyDarkMode(savedDark);

        // User
        setupUserInfo();

        // Affichage initial
        const initialCriteria = sortSelect ? sortSelect.value : 'default';
        displayRecipes(sortRecipes(recipes, initialCriteria));
    }

    init();
});