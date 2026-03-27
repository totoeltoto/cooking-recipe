/**
 * profil.js — Le Coin Gourmand
 * Gestion du profil : pseudo, avatar, historique, favoris, notifications, newsletter.
 */
document.addEventListener('DOMContentLoaded', () => {

    // ── Auth guard ───────────────────────────────────────────────────────
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // ── Dark mode ────────────────────────────────────────────────────────
    const darkToggle  = document.getElementById('dark-mode-toggle');
    const iconSun     = document.getElementById('theme-icon-sun');
    const iconMoon    = document.getElementById('theme-icon-moon');

    function applyDark(on) {
        document.documentElement.classList.toggle('dark', on);
        iconSun.style.display  = on ? 'none' : '';
        iconMoon.style.display = on ? '' : 'none';
    }

    darkToggle.addEventListener('click', () => {
        const on = !document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', on);
        applyDark(on);
    });

    applyDark(localStorage.getItem('darkMode') === 'true');

    // ── Données recettes (pour noms/images) ──────────────────────────────
    const RECIPES = [
        { id:1,  name:"Salade de tomate mozzarella",          href:"recette/tomateMozza1.html",        image:"images/salade.jpg"           },
        { id:2,  name:"Cookie",                                href:"recette/cookie2.html",             image:"images/cookie.jpg"           },
        { id:3,  name:"Tarte au chocolat",                     href:"recette/tarteChocolat3.html",      image:"images/tarteChocolat.jpg"    },
        { id:4,  name:"Tarte poires amandines",                href:"recette/poireAmandine4.html",      image:"images/poirAmandine.jpg"     },
        { id:5,  name:"Bûche de Noël 🎅",                      href:"recette/buche5.html",              image:"images/buche.jpg"            },
        { id:6,  name:"Pancakes",                              href:"recette/pancakes6.html",           image:"images/pancakes.jpg"         },
        { id:7,  name:"Noix de St Jaques à la crème",         href:"recette/stJaques7.html",           image:"images/stJacque.jpg"         },
        { id:8,  name:"Petits Financiers",                     href:"recette/petitsFinaciers8.html",    image:"images/petitsFinanciers.jpg" },
        { id:9,  name:"Brioche étoilée",                       href:"recette/briocheEtoile9.html",      image:"images/briocheEtoile.jpg"    },
        { id:10, name:"Tartiflette",                           href:"recette/tartiflette10.html",       image:"images/Tartiflette.jpg"      },
        { id:11, name:"Galette des Rois",                      href:"recette/galetteDesRois11.html",    image:"images/galette.jpg"          },
        { id:12, name:"Verrines Guacamole Crevettes",          href:"recette/verrinesCrevettes12.html", image:"images/verrine.jpg"          },
        { id:13, name:"Crème brûlée",                          href:"recette/cremeBrulee13.html",       image:"images/creme-brulee.jpg"     },
        { id:14, name:"Gyoza Japonais",                        href:"recette/gyoza14.html",             image:"images/gyoza.jpg"            },
        { id:15, name:"Mini Quiches Apéritives",               href:"recette/miniQuiches15.html",       image:"images/mini-quiches.jpg"     },
        { id:16, name:"Mini Pizzas Apéritives",                href:"recette/miniPizzas16.html",        image:"images/mini-pizzas.jpg"      },
        { id:17, name:"Brochettes Poulet Miel Moutarde",       href:"recette/brochettesPoulet17.html",  image:"images/brochettes-poulet.jpg"},
    ];

    const recipeById  = id => RECIPES.find(r => r.id === id);
    const recipeByHref = href => RECIPES.find(r => r.href === href);

    // ── Couleurs avatar ──────────────────────────────────────────────────
    const AVATAR_COLORS = [
        '#2d6a4f','#40916c','#1d6b8a','#7b2d8b',
        '#b45309','#c2410c','#0f766e','#1e40af',
    ];

    function colorForEmail(email) {
        let hash = 0;
        for (const c of email) hash = c.charCodeAt(0) + ((hash << 5) - hash);
        return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    }

    // ── LocalStorage helpers ─────────────────────────────────────────────
    const userKey = email => `lcg_profile_${email}`;

    function loadProfile() {
        try {
            return JSON.parse(localStorage.getItem(userKey(currentUser.email))) || {};
        } catch { return {}; }
    }

    function saveProfile(data) {
        localStorage.setItem(userKey(currentUser.email), JSON.stringify(data));
    }

    let profile = loadProfile();

    // ── Avatar ───────────────────────────────────────────────────────────
    const avatarEl     = document.getElementById('avatar');
    const avatarImg    = document.getElementById('avatar-img');
    const avatarInit   = document.getElementById('avatar-initials');
    const avatarInput  = document.getElementById('avatar-input');

    function renderAvatar() {
        const color = colorForEmail(currentUser.email);
        avatarEl.style.background = color;

        if (profile.avatarSrc) {
            avatarImg.src = profile.avatarSrc;
            avatarImg.style.display = '';
            avatarInit.style.display = 'none';
        } else {
            avatarImg.style.display = 'none';
            const pseudo = profile.pseudo || currentUser.email;
            avatarInit.textContent = pseudo[0].toUpperCase();
            avatarInit.style.display = '';
        }
    }

    avatarEl.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            profile.avatarSrc = ev.target.result;
            saveProfile(profile);
            renderAvatar();
        };
        reader.readAsDataURL(file);
    });

    // ── Pseudo ───────────────────────────────────────────────────────────
    const pseudoDisplay = document.getElementById('pseudo-display');
    const pseudoInput   = document.getElementById('pseudo-input');
    const btnEditPseudo = document.getElementById('btn-edit-pseudo');
    let editingPseudo   = false;

    function renderPseudo() {
        const pseudo = profile.pseudo || currentUser.email.split('@')[0];
        pseudoDisplay.textContent = pseudo;
        pseudoInput.value = pseudo;
    }

    btnEditPseudo.addEventListener('click', () => {
        if (!editingPseudo) {
            // Passer en mode édition
            pseudoDisplay.style.display = 'none';
            pseudoInput.style.display   = '';
            pseudoInput.focus();
            pseudoInput.select();
            btnEditPseudo.title = 'Valider';
            btnEditPseudo.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color:var(--green)"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
            editingPseudo = true;
        } else {
            savePseudo();
        }
    });

    pseudoInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') savePseudo();
        if (e.key === 'Escape') cancelPseudo();
    });

    function savePseudo() {
        const val = pseudoInput.value.trim();
        if (val) {
            profile.pseudo = val;
            saveProfile(profile);
        }
        pseudoDisplay.style.display = '';
        pseudoInput.style.display   = 'none';
        btnEditPseudo.title = 'Modifier le pseudo';
        btnEditPseudo.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"/></svg>`;
        editingPseudo = false;
        renderPseudo();
        renderAvatar();
    }

    function cancelPseudo() {
        pseudoDisplay.style.display = '';
        pseudoInput.style.display   = 'none';
        editingPseudo = false;
        renderPseudo();
    }

    // ── Rôle badge ───────────────────────────────────────────────────────
    const roleBadgeEl = document.getElementById('role-badge');
    const roleClass = {
        'utilisateur': 'role-utilisateur', 'admin': 'role-admin',
        'fondateur': 'role-fondateur', 'co-fondateur': 'role-co-fondateur',
    }[currentUser.role] || 'role-utilisateur';

    roleBadgeEl.textContent = currentUser.role;
    roleBadgeEl.className   = `profile-role ${roleClass}`;

    document.getElementById('profile-email').textContent = currentUser.email;

    // ── Historique ───────────────────────────────────────────────────────
    function loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('lcg_history')) || [];
        } catch { return []; }
    }

    function renderHistory() {
        const history = loadHistory();
        const list    = document.getElementById('history-list');
        list.innerHTML = '';

        document.getElementById('stat-history').textContent = history.length;

        if (history.length === 0) {
            list.innerHTML = '<p class="empty-msg">Vous n\'avez encore consulté aucune recette.</p>';
            return;
        }

        history.slice(0, 10).forEach(entry => {
            const recipe = recipeById(entry.id) || recipeByHref(entry.href);
            if (!recipe) return;

            const elapsed = timeAgo(entry.ts);
            const a = document.createElement('a');
            a.className = 'history-item';
            a.href = recipe.href;
            a.innerHTML = `
                <img class="history-thumb" src="${recipe.image}" alt="${recipe.name}" loading="lazy">
                <span class="history-name">${recipe.name}</span>
                <span class="history-time">${elapsed}</span>
            `;
            list.appendChild(a);
        });
    }

    function timeAgo(ts) {
        const diff = Date.now() - ts;
        const m = Math.floor(diff / 60000);
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(diff / 86400000);
        if (m < 2)  return 'À l\'instant';
        if (m < 60) return `Il y a ${m} min`;
        if (h < 24) return `Il y a ${h}h`;
        return `Il y a ${d}j`;
    }

    // ── Favoris ──────────────────────────────────────────────────────────
    function renderFavorites() {
        const favIds  = JSON.parse(localStorage.getItem('lcg_favorites') || '[]');
        const grid    = document.getElementById('fav-grid');
        grid.innerHTML = '';

        document.getElementById('stat-favs').textContent = favIds.length;

        if (favIds.length === 0) {
            grid.innerHTML = '<p class="empty-msg" style="grid-column:1/-1;">Aucun favori pour l\'instant.</p>';
            return;
        }

        favIds.forEach(id => {
            const recipe = recipeById(id);
            if (!recipe) return;
            const a = document.createElement('a');
            a.className = 'fav-card';
            a.href = recipe.href;
            a.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.name}" loading="lazy">
                <div class="fav-card-name">${recipe.name}</div>
            `;
            grid.appendChild(a);
        });
    }

    // ── Notifications ────────────────────────────────────────────────────
    function loadNotifications() {
        try {
            return JSON.parse(localStorage.getItem(`lcg_notifs_${currentUser.email}`)) || generateDefaultNotifs();
        } catch { return generateDefaultNotifs(); }
    }

    function generateDefaultNotifs() {
        const notifs = [
            { id:1, text:'🎉 Bienvenue sur Le Coin Gourmand ! Explorez nos recettes.', ts: Date.now() - 86400000 * 2, read: false },
            { id:2, text:'⭐ Nouvelle recette ajoutée : Brioche étoilée à la pâte à tartiner.', ts: Date.now() - 86400000, read: false },
            { id:3, text:'🍽 Avez-vous essayé la Tartiflette Savoyarde ? Elle est très appréciée !', ts: Date.now() - 3600000 * 5, read: false },
        ];
        localStorage.setItem(`lcg_notifs_${currentUser.email}`, JSON.stringify(notifs));
        return notifs;
    }

    function saveNotifications(notifs) {
        localStorage.setItem(`lcg_notifs_${currentUser.email}`, JSON.stringify(notifs));
    }

    function renderNotifications() {
        const notifs  = loadNotifications();
        const list    = document.getElementById('notif-list');
        const badge   = document.getElementById('notif-badge');
        const unread  = notifs.filter(n => !n.read).length;

        document.getElementById('stat-notifs').textContent = unread;
        badge.textContent = unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout lu';

        list.innerHTML = '';

        if (notifs.length === 0) {
            list.innerHTML = '<p class="empty-msg">Aucune notification.</p>';
            return;
        }

        notifs.slice().reverse().forEach(n => {
            const div = document.createElement('div');
            div.className = `notif-item ${n.read ? 'read' : 'unread'}`;
            div.innerHTML = `
                <div class="notif-dot"></div>
                <span class="notif-text">${n.text}</span>
                <span class="notif-time">${timeAgo(n.ts)}</span>
            `;
            div.addEventListener('click', () => {
                const all = loadNotifications();
                const idx = all.findIndex(x => x.id === n.id);
                if (idx !== -1) { all[idx].read = true; saveNotifications(all); }
                renderNotifications();
            });
            list.appendChild(div);
        });
    }

    document.getElementById('btn-mark-all').addEventListener('click', () => {
        const notifs = loadNotifications().map(n => ({ ...n, read: true }));
        saveNotifications(notifs);
        renderNotifications();
    });

    // ── Stats notes données ──────────────────────────────────────────────
    function renderRatingsCount() {
        const ratings = JSON.parse(localStorage.getItem('lcg_ratings') || '{}');
        const total   = Object.values(ratings).reduce((sum, r) => sum + (r.count || 0), 0);
        document.getElementById('stat-ratings').textContent = total;
    }

    // ── Newsletter ───────────────────────────────────────────────────────
    const newsletterToggle = document.getElementById('newsletter-toggle');

    function loadNewsletter() {
        const subs = JSON.parse(localStorage.getItem('lcg_newsletter') || '[]');
        return subs.includes(currentUser.email);
    }

    newsletterToggle.checked = loadNewsletter();

    newsletterToggle.addEventListener('change', () => {
        let subs = JSON.parse(localStorage.getItem('lcg_newsletter') || '[]');
        if (newsletterToggle.checked) {
            if (!subs.includes(currentUser.email)) subs.push(currentUser.email);
        } else {
            subs = subs.filter(e => e !== currentUser.email);
        }
        localStorage.setItem('lcg_newsletter', JSON.stringify(subs));
        profile.newsletter = newsletterToggle.checked;
        saveProfile(profile);
    });

    // ── Zone danger ──────────────────────────────────────────────────────
    document.getElementById('btn-clear-history').addEventListener('click', () => {
        if (confirm('Effacer tout votre historique de navigation ?')) {
            localStorage.removeItem('lcg_history');
            renderHistory();
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // ── Init ─────────────────────────────────────────────────────────────
    renderAvatar();
    renderPseudo();
    renderHistory();
    renderFavorites();
    renderNotifications();
    renderRatingsCount();
});