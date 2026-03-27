/**
 * script.js — Le Coin Gourmand (version enrichie)
 * Nouveautés : thème saisonnier, bouton surprise, recherche avancée,
 *              stats de vues, historique auto, notifications, profil.
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
    // THÈME SAISONNIER AUTOMATIQUE
    // =====================================================================
    const SEASONS = {
        noel:      { months:[11,0],  emoji:'❄️',  label:'Spécial Noël',      color:'#1a5276', accent:'#e74c3c' },
        ete:       { months:[5,6,7], emoji:'☀️',  label:'Spécial Été',       color:'#c0392b', accent:'#e67e22' },
        automne:   { months:[8,9,10],emoji:'🍂',  label:'Spécial Automne',   color:'#784212', accent:'#e67e22' },
        printemps: { months:[2,3,4], emoji:'🌸',  label:'Spécial Printemps', color:'#6c3483', accent:'#ec407a' },
    };

    function getSeason() {
        const m = new Date().getMonth();
        return Object.entries(SEASONS).find(([, s]) => s.months.includes(m))?.[0] || null;
    }

    function applySeasonalTheme() {
        const key = getSeason();
        if (!key) return;
        const s = SEASONS[key];
        const banner = document.createElement('div');
        banner.style.cssText = `background:linear-gradient(135deg,${s.color},${s.accent});color:white;text-align:center;padding:0.6rem 1rem;font-size:0.82rem;font-weight:600;letter-spacing:0.03em;position:relative;z-index:45;`;
        banner.innerHTML = `${s.emoji} ${s.label} — Découvrez nos recettes du moment !`;
        document.body.insertBefore(banner, document.body.firstChild);

        // Notification saisonnière (une fois par saison/an)
        const notifKey = `lcg_season_notif_${key}_${new Date().getFullYear()}`;
        if (!localStorage.getItem(notifKey)) {
            localStorage.setItem(notifKey, '1');
            const user = JSON.parse(sessionStorage.getItem('currentUser'));
            if (user) {
                const nKey = `lcg_notifs_${user.email}`;
                const notifs = JSON.parse(localStorage.getItem(nKey) || '[]');
                notifs.push({ id: Date.now(), text: `${s.emoji} Nouvelle sélection ${s.label} disponible !`, ts: Date.now(), read: false });
                localStorage.setItem(nKey, JSON.stringify(notifs));
            }
        }
    }

    // =====================================================================
    // FAVORIS
    // =====================================================================
    function loadFavorites() {
        try { return new Set(JSON.parse(localStorage.getItem('lcg_favorites'))); }
        catch { return new Set(); }
    }
    function saveFavorites(s) { localStorage.setItem('lcg_favorites', JSON.stringify([...s])); }
    let favorites = loadFavorites();

    // =====================================================================
    // NOTATIONS
    // =====================================================================
    function loadRatings() {
        try { return JSON.parse(localStorage.getItem('lcg_ratings')) || {}; }
        catch { return {}; }
    }
    function saveRatings(r) { localStorage.setItem('lcg_ratings', JSON.stringify(r)); }
    let ratingsData = loadRatings();

    function getAvgRating(id) {
        const r = ratingsData[id];
        return (!r || !r.count) ? 0 : r.total / r.count;
    }
    function addRating(id, stars) {
        if (!ratingsData[id]) ratingsData[id] = { total:0, count:0 };
        ratingsData[id].total += stars;
        ratingsData[id].count += 1;
        saveRatings(ratingsData);
    }

    // =====================================================================
    // STATISTIQUES DE VUES
    // =====================================================================
    function loadViews() {
        try { return JSON.parse(localStorage.getItem('lcg_views')) || {}; }
        catch { return {}; }
    }
    function getViews(id) { return loadViews()[id] || 0; }

    // =====================================================================
    // HISTORIQUE
    // =====================================================================
    function loadHistory() {
        try { return JSON.parse(localStorage.getItem('lcg_history')) || []; }
        catch { return []; }
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

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && !currentUser.favorites) currentUser.favorites = [];

    let currentDisplayedRecipes = [...recipes];

    // =====================================================================
    // SPLASH
    // =====================================================================
    function setAndRunLogoAnimation() {
        if (!splashLogo || !headerLogo || !splashContent) return;
        const hr = headerLogo.getBoundingClientRect();
        const sr = splashLogo.getBoundingClientRect();
        splashContent.style.setProperty('--logo-end-transform', `translate(${hr.left-sr.left}px,${hr.top-sr.top}px) scale(0.75)`);
        splashContent.classList.add('animate');
    }

    // =====================================================================
    // PARSEUR DE TEMPS
    // =====================================================================
    function parseTimeToMinutes(t) {
        if (!t) return 0;
        const s = String(t).toLowerCase();
        let h = 0, m = 0;
        const hm = s.match(/(\d+)\s*h/);   if (hm) h = parseInt(hm[1]);
        const mm = s.match(/(\d+)\s*min/);
        if (mm) m = parseInt(mm[1]);
        else { const ah = s.match(/h\s*(\d+)/); if (ah) m = parseInt(ah[1]); }
        return h * 60 + m;
    }

    // =====================================================================
    // TRI
    // =====================================================================
    function sortRecipes(arr, c) {
        if (!c || c === 'default') return arr;
        const copy = [...arr];
        if (c === 'time-asc')   return copy.sort((a,b) => parseTimeToMinutes(a.time)-parseTimeToMinutes(b.time));
        if (c === 'time-desc')  return copy.sort((a,b) => parseTimeToMinutes(b.time)-parseTimeToMinutes(a.time));
        if (c === 'difficulty') { const o={Facile:1,Moyen:2,Difficile:3}; return copy.sort((a,b)=>(o[a.difficulty]||99)-(o[b.difficulty]||99)); }
        if (c === 'rating')     return copy.sort((a,b) => getAvgRating(b.id)-getAvgRating(a.id));
        if (c === 'views')      return copy.sort((a,b) => getViews(b.id)-getViews(a.id));
        return copy;
    }

    // =====================================================================
    // ÉTOILES
    // =====================================================================
    function renderStars(id) {
        const avg = getAvgRating(id), count = ratingsData[id]?.count || 0;
        let html = '';
        for (let i = 1; i <= 5; i++)
            html += `<button class="star-btn ${i<=Math.round(avg)?'active':''}" data-recipe-id="${id}" data-star="${i}" aria-label="Noter ${i} étoile${i>1?'s':''}">★</button>`;
        const label = count > 0 ? `<span class="rating-count">(${count})</span>` : '';
        return `<div class="star-rating" data-rating-id="${id}"><span class="label">Note :</span>${html}${label}</div>`;
    }

    // =====================================================================
    // RENDU CARTES
    // =====================================================================
    const categoryLabels = { plat:'Plat', dessert:'Dessert', aperitif:'Apéritif' };

    function difficultyBadge(d) {
        const cls = { Facile:'diff-facile', Moyen:'diff-moyen', Difficile:'diff-difficile' };
        return `<span class="meta-pill"><span class="difficulty-dot ${cls[d]||''}"></span>${d}</span>`;
    }

    function displayRecipes(list) {
        currentDisplayedRecipes = Array.isArray(list) ? [...list] : [];
        recipeList.innerHTML = '';
        if (!list.length) {
            recipeList.innerHTML = `<li class="empty-state"><p>🍽</p><p>Aucune recette ne correspond.</p></li>`;
            return;
        }
        list.forEach(recipe => {
            const li = document.createElement('li');
            li.className  = 'recipe-card';
            li.dataset.id = recipe.id;
            const isFav  = favorites.has(recipe.id);
            const views  = getViews(recipe.id);
            li.innerHTML = `
                <a href="${recipe.href}" style="text-decoration:none;color:inherit;display:block;">
                    <div class="card-image-wrapper">
                        <img src="${recipe.image}" alt="${recipe.name}" loading="lazy">
                        <div class="card-overlay"></div>
                        <span class="card-badge">${categoryLabels[recipe.type]||recipe.type}</span>
                        ${views > 0 ? `<span class="card-views" style="position:absolute;bottom:8px;left:10px;background:rgba(0,0,0,0.55);color:white;font-size:0.68rem;padding:2px 7px;border-radius:999px;backdrop-filter:blur(4px);">👁 ${views}</span>` : ''}
                    </div>
                </a>
                <button class="favorite-btn ${isFav?'favorited':''}" data-recipe-id="${recipe.id}" aria-label="${isFav?'Retirer des favoris':'Ajouter aux favoris'}">
                    <svg viewBox="0 0 24 24" fill="${isFav?'currentColor':'none'}" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                </button>
                <a href="${recipe.href}" style="text-decoration:none;color:inherit;display:block;">
                    <div class="card-body">
                        <h3>${recipe.name}</h3>
                        <div class="card-meta">
                            <span class="meta-pill">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                ${recipe.time}
                            </span>
                            ${difficultyBadge(recipe.difficulty)}
                        </div>
                        ${renderStars(recipe.id)}
                    </div>
                </a>`;
            recipeList.appendChild(li);
        });
    }

    // =====================================================================
    // CLICS LISTE
    // =====================================================================
    recipeList.addEventListener('click', e => {
        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
            e.preventDefault(); e.stopPropagation();
            const id = parseInt(favBtn.dataset.recipeId);
            favorites.has(id) ? favorites.delete(id) : favorites.add(id);
            const on = favorites.has(id);
            favBtn.classList.toggle('favorited', on);
            favBtn.setAttribute('aria-label', on ? 'Retirer des favoris' : 'Ajouter aux favoris');
            favBtn.querySelector('svg').setAttribute('fill', on ? 'currentColor' : 'none');
            saveFavorites(favorites);
            favBtn.classList.remove('pop'); void favBtn.offsetWidth; favBtn.classList.add('pop');
            if (currentUser) { currentUser.favorites = [...favorites]; sessionStorage.setItem('currentUser', JSON.stringify(currentUser)); }
            return;
        }
        const starBtn = e.target.closest('.star-btn');
        if (starBtn) {
            e.preventDefault(); e.stopPropagation();
            const id = parseInt(starBtn.dataset.recipeId), stars = parseInt(starBtn.dataset.star);
            addRating(id, stars);
            const block = recipeList.querySelector(`.star-rating[data-rating-id="${id}"]`);
            if (block) block.outerHTML = renderStars(id);
        }
    });

    // =====================================================================
    // MODE SOMBRE
    // =====================================================================
    function applyDarkMode(on) {
        document.documentElement.classList.toggle('dark', on);
        themeIconSun.style.display  = on ? 'none' : '';
        themeIconMoon.style.display = on ? '' : 'none';
    }
    darkModeToggle.addEventListener('click', () => {
        const on = !document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', on); applyDarkMode(on);
    });

    // =====================================================================
    // FILTRES
    // =====================================================================
    filtersContainer.addEventListener('click', e => {
        const btn = e.target.closest('.filter-button');
        if (!btn) return;
        document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        let filtered = f === 'tous'    ? recipes
                     : f === 'favoris' ? recipes.filter(r => favorites.has(r.id))
                     : f === 'history' ? (() => { const ids = [...new Set(loadHistory().map(h => h.id))]; return ids.map(id => recipes.find(r => r.id === id)).filter(Boolean); })()
                     : recipes.filter(r => r.type === f);
        displayRecipes(sortRecipes(filtered, sortSelect?.value));
    });

    // =====================================================================
    // RECHERCHE AVANCÉE
    // =====================================================================
    const advancedPanel = document.getElementById('advanced-search-panel');
    const btnAdvanced   = document.getElementById('btn-advanced-search');

    if (btnAdvanced && advancedPanel) {
        btnAdvanced.addEventListener('click', e => {
            e.stopPropagation();
            advancedPanel.classList.toggle('open');
        });
        advancedPanel.addEventListener('change', applyAdvancedSearch);
        advancedPanel.addEventListener('input',  applyAdvancedSearch);
    }

    function applyAdvancedSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const type  = document.getElementById('adv-type')?.value       || '';
        const diff  = document.getElementById('adv-difficulty')?.value || '';
        const maxT  = parseInt(document.getElementById('adv-time')?.value || '0');
        let filtered = recipes.filter(r => {
            if (query && !r.name.toLowerCase().includes(query)) return false;
            if (type  && r.type !== type)         return false;
            if (diff  && r.difficulty !== diff)   return false;
            if (maxT > 0 && parseTimeToMinutes(r.time) > maxT) return false;
            return true;
        });
        document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
        displayRecipes(sortRecipes(filtered, sortSelect?.value));
    }

    // =====================================================================
    // SUGGESTIONS + RECHERCHE
    // =====================================================================
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        suggestionList.innerHTML = '';
        if (!q) return;
        recipes.filter(r => r.name.toLowerCase().includes(q)).slice(0,6).forEach(s => {
            const li = document.createElement('li');
            li.textContent = s.name;
            li.addEventListener('click', () => { window.location.href = s.href; });
            suggestionList.appendChild(li);
        });
        if (advancedPanel?.classList.contains('open')) applyAdvancedSearch();
    });

    document.addEventListener('click', e => {
        if (!searchInput.contains(e.target) && !suggestionList.contains(e.target)) suggestionList.innerHTML = '';
        if (advancedPanel && !advancedPanel.contains(e.target) && !btnAdvanced?.contains(e.target))
            advancedPanel.classList.remove('open');
    });

    document.getElementById('search-button').addEventListener('click', triggerSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') triggerSearch(); });

    function triggerSearch() {
        const q = searchInput.value.toLowerCase().trim();
        displayRecipes(sortRecipes(q ? recipes.filter(r => r.name.toLowerCase().includes(q)) : recipes, sortSelect?.value));
        suggestionList.innerHTML = '';
    }

    // =====================================================================
    // TRI
    // =====================================================================
    sortSelect?.addEventListener('change', () => displayRecipes(sortRecipes(currentDisplayedRecipes, sortSelect.value)));

    // =====================================================================
    // BOUTON SURPRISE 🎲
    // =====================================================================
    document.getElementById('btn-surprise')?.addEventListener('click', function() {
        const r = recipes[Math.floor(Math.random() * recipes.length)];
        this.style.transition = 'transform 0.4s ease';
        this.style.transform  = 'rotate(360deg) scale(1.15)';
        setTimeout(() => { window.location.href = r.href; }, 420);
    });

    // =====================================================================
    // USER INFO + BADGE NOTIFS
    // =====================================================================
    function getUnreadCount() {
        if (!currentUser) return 0;
        try { return JSON.parse(localStorage.getItem(`lcg_notifs_${currentUser.email}`) || '[]').filter(n => !n.read).length; }
        catch { return 0; }
    }

    function setupUserInfo() {
        if (currentUser) {
            const isAdmin = ['admin','fondateur','co-fondateur'].includes(currentUser.role);
            const unread  = getUnreadCount();
            const badge   = unread > 0 ? `<span style="background:var(--green);color:white;border-radius:999px;font-size:0.65rem;font-weight:700;padding:0.1rem 0.45rem;margin-left:2px;">${unread}</span>` : '';
            userInfo.innerHTML = `
                <a href="profil.html" style="color:var(--green);font-size:0.82rem;text-decoration:none;padding:0.35rem 0.7rem;border-radius:999px;font-weight:600;transition:background 0.2s;" onmouseover="this.style.background='var(--green-pale)'" onmouseout="this.style.background='none'">👤 Profil${badge}</a>
                <button onclick="logout()" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:0.82rem;font-family:inherit;padding:0.35rem 0.7rem;border-radius:999px;transition:background 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'">Déconnexion</button>
                ${isAdmin ? '<a href="admin.html" style="color:var(--green);font-size:0.82rem;text-decoration:none;padding:0.35rem 0.7rem;border-radius:999px;" onmouseover="this.style.background=\'var(--green-pale)\'" onmouseout="this.style.background=\'none\'">Panel Admin</a>' : ''}
            `;
        } else {
            userInfo.innerHTML = `<a href="login.html">Se connecter</a><a href="inscription.html" class="btn-register">S'inscrire</a>`;
        }

        [{ filter:'favoris', label:'♥ Mes favoris' }, { filter:'history', label:'🕐 Récemment vus' }].forEach(({ filter, label }) => {
            if (!document.querySelector(`#filters-container button[data-filter="${filter}"]`)) {
                const btn = document.createElement('button');
                btn.className = 'filter-button'; btn.dataset.filter = filter; btn.textContent = label;
                filtersContainer.appendChild(btn);
            }
        });
    }

    window.logout = function() { sessionStorage.removeItem('currentUser'); window.location.reload(); };

    // =====================================================================
    // INIT
    // =====================================================================
    function init() {
        if (splashScreen) {
            setTimeout(() => setAndRunLogoAnimation(), 100);
            window.addEventListener('resize', setAndRunLogoAnimation);
            setTimeout(() => { if (splashScreen) splashScreen.style.display = 'none'; }, 3500);
        }
        applyDarkMode(localStorage.getItem('darkMode') === 'true');
        applySeasonalTheme();
        setupUserInfo();
        displayRecipes(sortRecipes(recipes, sortSelect?.value || 'default'));
    }

    init();
});