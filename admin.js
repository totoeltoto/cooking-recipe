/**
 * admin.js — Le Coin Gourmand
 * Logique inchangée, adaptée au nouveau HTML/CSS.
 */
document.addEventListener('DOMContentLoaded', () => {

    // ── Sécurité ─────────────────────────────────────────────────────────
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || !['admin', 'fondateur', 'co-fondateur'].includes(currentUser.role)) {
        alert('Accès refusé.');
        window.location.href = 'index.html';
        return;
    }

    // ── DOM ──────────────────────────────────────────────────────────────
    const statsTotalUsers   = document.getElementById('stats-total-users');
    const statsTotalRecipes = document.getElementById('stats-total-recipes');
    const usersTable        = document.getElementById('users-table');
    const usersTableBody    = document.getElementById('users-table-body');
    const recipesTableBody  = document.getElementById('recipes-table-body');
    const recipeForm        = document.getElementById('recipe-form');
    const recipeIdInput     = document.getElementById('recipe-id');
    const cancelEditButton  = document.getElementById('cancel-edit-button');
    const logoutButton      = document.getElementById('logout-button');
    const recipesSection    = document.getElementById('recipes-section');
    const darkModeToggle    = document.getElementById('dark-mode-toggle');
    const themeIconSun      = document.getElementById('theme-icon-sun');
    const themeIconMoon     = document.getElementById('theme-icon-moon');

    // Modals
    const warningModal        = document.getElementById('warning-modal');
    const warningModalTitle   = document.getElementById('warning-modal-title');
    const warningReason       = document.getElementById('warning-reason');
    const cancelWarningBtn    = document.getElementById('cancel-warning-btn');
    const confirmWarningBtn   = document.getElementById('confirm-warning-btn');
    const viewWarningsModal   = document.getElementById('view-warnings-modal');
    const viewWarningsTitle   = document.getElementById('view-warnings-modal-title');
    const viewWarningsList    = document.getElementById('view-warnings-list');
    const closeViewWarningsBtn = document.getElementById('close-view-warnings-btn');

    // ── Dark mode ────────────────────────────────────────────────────────
    function applyDarkMode(on) {
        document.documentElement.classList.toggle('dark', on);
        themeIconSun.style.display  = on ? 'none' : '';
        themeIconMoon.style.display = on ? '' : 'none';
    }

    darkModeToggle.addEventListener('click', () => {
        const on = !document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', on);
        applyDarkMode(on);
    });

    // ── Données ──────────────────────────────────────────────────────────
    let users   = JSON.parse(localStorage.getItem('users'))   || [];
    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    let userSortState   = { column: 'email', direction: 'asc' };
    let userToWarnEmail = null;

    // Migration : s'assure que tous les users ont un tableau warnings
    users.forEach(u => { if (!u.warnings) u.warnings = []; });
    localStorage.setItem('users', JSON.stringify(users));

    // ── Utilitaires ──────────────────────────────────────────────────────
    function roleBadge(role) {
        const cls = {
            'fondateur':    'role-fondateur',
            'co-fondateur': 'role-co-fondateur',
            'admin':        'role-admin',
            'utilisateur':  'role-utilisateur',
        }[role] || 'role-utilisateur';
        return `<span class="role-badge ${cls}">${role}</span>`;
    }

    function updateStats() {
        statsTotalUsers.textContent   = users.length;
        statsTotalRecipes.textContent = recipes.length;
    }

    function updateSortIndicators() {
        usersTable.querySelectorAll('thead th').forEach(th => {
            th.classList.remove('active-sort');
            const arrow = th.querySelector('.sort-arrow');
            if (arrow) arrow.className = 'sort-arrow';
        });
        const active = usersTable.querySelector(`thead th[data-sort="${userSortState.column}"]`);
        if (active) {
            active.classList.add('active-sort');
            active.querySelector('.sort-arrow')?.classList.add(userSortState.direction);
        }
    }

    // ── Utilisateurs ─────────────────────────────────────────────────────
    function sortUsers() {
        users.sort((a, b) => {
            const va = (a[userSortState.column] || '').toString();
            const vb = (b[userSortState.column] || '').toString();
            const cmp = va.localeCompare(vb, 'fr', { sensitivity: 'base' });
            return userSortState.direction === 'desc' ? -cmp : cmp;
        });
    }

    function displayUsers() {
        sortUsers();
        usersTableBody.innerHTML = '';

        users.forEach(user => {
            const isProtected  = ['admin', 'co-fondateur', 'fondateur'].includes(user.role);
            const isCurrentUser = user.email === currentUser.email;
            const canBeWarned  = !isProtected && !isCurrentUser;
            const warnCount    = user.warnings.length;

            // ── Cellule Rôle ──
            let roleCellHTML;
            if (currentUser.role === 'fondateur' && !isCurrentUser) {
                roleCellHTML = `<select data-email="${user.email}" class="role-select">
                    <option value="utilisateur"  ${user.role === 'utilisateur'  ? 'selected' : ''}>utilisateur</option>
                    <option value="admin"        ${user.role === 'admin'        ? 'selected' : ''}>admin</option>
                    <option value="co-fondateur" ${user.role === 'co-fondateur' ? 'selected' : ''}>co-fondateur</option>
                    <option value="fondateur"    ${user.role === 'fondateur'    ? 'selected' : ''}>fondateur</option>
                </select>`;
            } else if (currentUser.role === 'co-fondateur' && user.role === 'utilisateur' && !isCurrentUser) {
                roleCellHTML = `<select data-email="${user.email}" class="role-select">
                    <option value="utilisateur" selected>utilisateur</option>
                    <option value="admin">admin</option>
                </select>`;
            } else {
                roleCellHTML = roleBadge(user.role);
            }

            // ── Cellule avertissements ──
            const warnHTML = warnCount > 0
                ? `<button data-email="${user.email}" class="warn-count clickable view-warnings-btn"
                     title="Voir les avertissements">⚠ ${warnCount} / 3</button>`
                : `<span class="warn-count none">0 / 3</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:500;">${user.email}</td>
                <td>${roleCellHTML}</td>
                <td>${warnHTML}</td>
                <td>
                    <div class="actions-cell">
                        <button data-email="${user.email}"
                                class="action-btn warn warn-user-btn"
                                title="Avertir"
                                ${!canBeWarned ? 'disabled' : ''}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </button>
                        <button data-email="${user.email}"
                                class="action-btn delete delete-user-btn"
                                title="Supprimer"
                                ${isProtected || isCurrentUser ? 'disabled' : ''}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </td>`;
            usersTableBody.appendChild(tr);
        });

        updateSortIndicators();
    }

    // ── Modals avertissements ────────────────────────────────────────────
    function openWarningModal(email) {
        userToWarnEmail = email;
        warningModalTitle.textContent = `Avertir ${email}`;
        warningReason.value = '';
        warningModal.classList.add('open');
        warningReason.focus();
    }

    function closeWarningModal() {
        warningModal.classList.remove('open');
        userToWarnEmail = null;
    }

    function submitWarning() {
        const reason = warningReason.value.trim();
        if (!reason) { alert('Une raison est obligatoire.'); return; }

        const idx = users.findIndex(u => u.email === userToWarnEmail);
        if (idx === -1) return;

        users[idx].warnings.push({ reason, by: currentUser.email, date: new Date().toISOString() });

        if (users[idx].warnings.length >= 3) {
            alert(`${userToWarnEmail} a atteint 3 avertissements et va être supprimé.`);
            deleteUser(userToWarnEmail, true);
        } else {
            localStorage.setItem('users', JSON.stringify(users));
            alert(`Avertissement envoyé à ${userToWarnEmail}.`);
            displayUsers();
        }
        closeWarningModal();
    }

    function openViewWarningsModal(email) {
        const user = users.find(u => u.email === email);
        if (!user || user.warnings.length === 0) return;

        viewWarningsTitle.textContent = `Avertissements — ${email}`;
        viewWarningsList.innerHTML = '';

        user.warnings.forEach((w, i) => {
            const date = new Date(w.date).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const el = document.createElement('div');
            el.className = 'warning-item';
            el.innerHTML = `
                <p class="warn-num">Avertissement #${i + 1}</p>
                <p class="warn-reason">${w.reason}</p>
                <p class="warn-meta">Par ${w.by} · ${date}</p>
            `;
            viewWarningsList.appendChild(el);
        });

        viewWarningsModal.classList.add('open');
    }

    function closeViewWarningsModal() {
        viewWarningsModal.classList.remove('open');
    }

    // ── Actions utilisateurs ─────────────────────────────────────────────
    function deleteUser(email, bypass = false) {
        const user = users.find(u => u.email === email);
        if (!user) return;
        if (['fondateur', 'co-fondateur', 'admin'].includes(user.role) || user.email === currentUser.email) {
            alert('Impossible : ce compte est protégé.');
            return;
        }
        if (bypass || confirm(`Supprimer l'utilisateur ${email} ?`)) {
            users = users.filter(u => u.email !== email);
            localStorage.setItem('users', JSON.stringify(users));
            updateStats();
            displayUsers();
        }
    }

    // ── Recettes ─────────────────────────────────────────────────────────
    function displayRecipes() {
        recipesTableBody.innerHTML = '';
        recipes.forEach(recipe => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:500;">${recipe.name}</td>
                <td style="color:var(--text-muted)">${recipe.type}</td>
                <td style="color:var(--text-muted)">${recipe.time || '—'}</td>
                <td>
                    <div class="actions-cell">
                        <button data-id="${recipe.id}" class="action-btn edit edit-recipe-btn" title="Modifier">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"/>
                            </svg>
                        </button>
                        <button data-id="${recipe.id}" class="action-btn delete delete-recipe-btn" title="Supprimer">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </td>`;
            recipesTableBody.appendChild(tr);
        });
    }

    function saveRecipe(e) {
        e.preventDefault();
        const id = parseInt(recipeIdInput.value);
        const data = {
            name:       document.getElementById('recipe-name').value,
            type:       document.getElementById('recipe-type').value,
            time:       document.getElementById('recipe-time').value,
            difficulty: document.getElementById('recipe-difficulty').value,
            image:      document.getElementById('recipe-image').value,
            href:       document.getElementById('recipe-href').value,
        };
        if (id) {
            const idx = recipes.findIndex(r => r.id === id);
            recipes[idx] = { ...recipes[idx], ...data };
        } else {
            data.id = Date.now();
            recipes.push(data);
        }
        localStorage.setItem('recipes', JSON.stringify(recipes));
        updateStats();
        displayRecipes();
        recipeForm.reset();
        recipeIdInput.value = '';
        cancelEditButton.classList.remove('visible');
    }

    function editRecipe(id) {
        const r = recipes.find(r => r.id === id);
        if (!r) return;
        recipeIdInput.value = r.id;
        document.getElementById('recipe-name').value       = r.name;
        document.getElementById('recipe-type').value       = r.type;
        document.getElementById('recipe-time').value       = r.time;
        document.getElementById('recipe-difficulty').value = r.difficulty;
        document.getElementById('recipe-image').value      = r.image;
        document.getElementById('recipe-href').value       = r.href;
        cancelEditButton.classList.add('visible');
        recipeForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function deleteRecipe(id) {
        if (confirm('Supprimer cette recette ?')) {
            recipes = recipes.filter(r => r.id !== id);
            localStorage.setItem('recipes', JSON.stringify(recipes));
            updateStats();
            displayRecipes();
        }
    }

    // ── Écouteurs ────────────────────────────────────────────────────────

    // Tri colonnes utilisateurs
    usersTable.querySelector('thead').addEventListener('click', e => {
        const th = e.target.closest('th[data-sort]');
        if (!th) return;
        const col = th.dataset.sort;
        userSortState.direction = userSortState.column === col && userSortState.direction === 'asc' ? 'desc' : 'asc';
        userSortState.column = col;
        displayUsers();
    });

    // Clics sur lignes utilisateurs
    usersTableBody.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const email = btn.dataset.email;
        if (btn.classList.contains('warn-user-btn') && !btn.disabled)  openWarningModal(email);
        if (btn.classList.contains('delete-user-btn') && !btn.disabled) deleteUser(email);
        if (btn.classList.contains('view-warnings-btn'))                openViewWarningsModal(email);
    });

    // Changement de rôle
    usersTableBody.addEventListener('change', e => {
        if (!e.target.classList.contains('role-select')) return;

        const email    = e.target.dataset.email;
        const newRole  = e.target.value;
        const userObj  = users.find(u => u.email === email);
        const origRole = userObj.role;

        if (currentUser.role === 'fondateur') {
            if (newRole === 'fondateur') {
                if (confirm(`Transférer le rôle fondateur à ${email} ?\nVotre rôle deviendra "admin".`)) {
                    const newIdx = users.findIndex(u => u.email === email);
                    const oldIdx = users.findIndex(u => u.email === currentUser.email);
                    users[newIdx].role = 'fondateur';
                    users[oldIdx].role = 'admin';
                    localStorage.setItem('users', JSON.stringify(users));
                    currentUser.role = 'admin';
                    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                    alert('Rôle transféré avec succès.');
                    window.location.reload();
                } else {
                    e.target.value = origRole;
                }
            } else {
                userObj.role = newRole;
                localStorage.setItem('users', JSON.stringify(users));
                alert(`Rôle de ${email} mis à jour.`);
                displayUsers();
            }
        } else if (currentUser.role === 'co-fondateur') {
            if (origRole === 'utilisateur' && newRole === 'admin') {
                userObj.role = newRole;
                localStorage.setItem('users', JSON.stringify(users));
                alert(`${email} est maintenant administrateur.`);
                displayUsers();
            } else {
                alert("Action non autorisée.");
                e.target.value = origRole;
            }
        }
    });

    // Modals avertissements
    confirmWarningBtn.addEventListener('click', submitWarning);
    cancelWarningBtn.addEventListener('click',  closeWarningModal);
    warningModal.addEventListener('click', e => { if (e.target === warningModal) closeWarningModal(); });

    closeViewWarningsBtn.addEventListener('click', closeViewWarningsModal);
    viewWarningsModal.addEventListener('click', e => { if (e.target === viewWarningsModal) closeViewWarningsModal(); });

    // Déconnexion
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // ── Init ─────────────────────────────────────────────────────────────
    function init() {
        applyDarkMode(localStorage.getItem('darkMode') === 'true');
        updateStats();
        displayUsers();

        const canManageRecipes = ['fondateur', 'co-fondateur'].includes(currentUser.role);
        if (canManageRecipes) {
            displayRecipes();
            recipeForm.addEventListener('submit', saveRecipe);
            cancelEditButton.addEventListener('click', () => {
                recipeForm.reset();
                recipeIdInput.value = '';
                cancelEditButton.classList.remove('visible');
            });
            recipesTableBody.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const id = parseInt(btn.dataset.id);
                if (btn.classList.contains('edit-recipe-btn'))   editRecipe(id);
                if (btn.classList.contains('delete-recipe-btn')) deleteRecipe(id);
            });
        } else {
            recipesSection.style.display = 'none';
        }
    }

    init();
});
