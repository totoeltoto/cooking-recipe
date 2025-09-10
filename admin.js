document.addEventListener('DOMContentLoaded', () => {

    // --- SÉCURITÉ : VÉRIFICATION DU RÔLE ---
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || !['admin', 'fondateur', 'co-fondateur'].includes(currentUser.role)) {
        alert("Accès refusé.");
        window.location.href = 'index.html';
        return;
    }

    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    const statsTotalUsers = document.getElementById('stats-total-users');
    const statsTotalRecipes = document.getElementById('stats-total-recipes');
    const usersTable = document.getElementById('users-table');
    const usersTableBody = document.getElementById('users-table-body');
    const recipesTableBody = document.getElementById('recipes-table-body');
    const recipeForm = document.getElementById('recipe-form');
    const recipeIdInput = document.getElementById('recipe-id');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    const logoutButton = document.getElementById('logout-button');
    const recipesSection = document.getElementById('recipes-section');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    
    // Modal d'avertissement
    const warningModal = document.getElementById('warning-modal');
    const warningModalTitle = document.getElementById('warning-modal-title');
    const warningReasonTextarea = document.getElementById('warning-reason');
    const cancelWarningBtn = document.getElementById('cancel-warning-btn');
    const confirmWarningBtn = document.getElementById('confirm-warning-btn');

    // Modal de consultation des avertissements
    const viewWarningsModal = document.getElementById('view-warnings-modal');
    const viewWarningsModalTitle = document.getElementById('view-warnings-modal-title');
    const viewWarningsList = document.getElementById('view-warnings-list');
    const closeViewWarningsBtn = document.getElementById('close-view-warnings-btn');

    // --- GESTION DU MODE SOMBRE (STYLE DE SCRIPT.JS) ---
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

    // --- GESTION DES DONNÉES ET DE L'ÉTAT ---
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    let userSortState = { column: 'email', direction: 'asc' };
    let userToWarnEmail = null; 
    
    users.forEach(user => {
        if (!user.warnings) user.warnings = [];
    });
    localStorage.setItem('users', JSON.stringify(users));


    // --- FONCTIONS DE GESTION DES UTILISATEURS ---
    function sortUsers() {
        users.sort((a, b) => {
            const valA = a[userSortState.column] || '';
            const valB = b[userSortState.column] || '';
            let comparison = valA.localeCompare(valB, 'fr', { sensitivity: 'base' });
            return userSortState.direction === 'desc' ? -comparison : comparison;
        });
    }

    function displayUsers() {
        sortUsers();
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors';
            
            const isProtectedRole = ['admin', 'co-fondateur', 'fondateur'].includes(user.role);
            const isCurrentUser = user.email === currentUser.email;
            const canBeWarned = !isProtectedRole && !isCurrentUser;
            const warningCount = user.warnings.length;

            let roleCellHTML;
            if (currentUser.role === 'fondateur' && !isCurrentUser) {
                 roleCellHTML = `<select data-email="${user.email}" class="role-select w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="utilisateur" ${user.role === 'utilisateur' ? 'selected' : ''}>utilisateur</option>
                                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
                                    <option value="co-fondateur" ${user.role === 'co-fondateur' ? 'selected' : ''}>co-fondateur</option>
                                    <option value="fondateur" ${user.role === 'fondateur' ? 'selected' : ''}>fondateur</option>
                                </select>`;
            } else if (currentUser.role === 'co-fondateur' && user.role === 'utilisateur' && !isCurrentUser) {
                 roleCellHTML = `<select data-email="${user.email}" class="role-select w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="utilisateur" selected>utilisateur</option>
                                    <option value="admin">admin</option>
                                </select>`;
            } else {
                roleCellHTML = `<span class="font-medium text-gray-800">${user.role}</span>`;
            }

            tr.innerHTML = `
                <td class="py-3 px-4 text-sm text-gray-700">${user.email}</td>
                <td class="py-3 px-4">${roleCellHTML}</td>
                <td class="py-3 px-4 text-sm font-medium">
                    <button data-email="${user.email}" class="view-warnings-btn ${warningCount > 0 ? 'text-red-600 font-bold hover:underline' : 'text-gray-500 cursor-default'}" ${warningCount === 0 ? 'disabled' : ''}>
                        ${warningCount} / 3
                    </button>
                </td>
                <td class="py-3 px-4 flex items-center space-x-2">
                    <button data-email="${user.email}" 
                            class="warn-user-btn p-2 rounded-md transition-colors ${!canBeWarned ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'}"
                            ${!canBeWarned ? 'disabled' : ''} title="Avertir l'utilisateur">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
                    </button>
                    <button data-email="${user.email}" 
                            class="delete-user-btn p-2 rounded-md transition-colors ${isProtectedRole || isCurrentUser ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-red-100 hover:text-red-600'}"
                            ${isProtectedRole || isCurrentUser ? 'disabled' : ''} title="Supprimer l'utilisateur">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>`;
            usersTableBody.appendChild(tr);
        });
        updateSortIndicators();
    }

    function showWarningModal(email) {
        userToWarnEmail = email;
        warningModalTitle.textContent = `Avertir ${email}`;
        warningReasonTextarea.value = '';
        warningModal.classList.remove('hidden');
        warningReasonTextarea.focus();
    }

    function hideWarningModal() {
        warningModal.classList.add('hidden');
        userToWarnEmail = null;
    }

    function handleWarningSubmit() {
        const reason = warningReasonTextarea.value.trim();
        if (!reason) {
            alert("Action annulée. Une raison est obligatoire pour donner un avertissement.");
            return;
        }
        const userIndex = users.findIndex(user => user.email === userToWarnEmail);
        if (userIndex === -1) return;

        users[userIndex].warnings.push({ reason, by: currentUser.email, date: new Date().toISOString() });
        
        if (users[userIndex].warnings.length >= 3) {
            alert(`L'utilisateur ${userToWarnEmail} a atteint 3 avertissements. Il va être supprimé automatiquement.`);
            deleteUser(userToWarnEmail, true);
        } else {
            localStorage.setItem('users', JSON.stringify(users));
            alert(`L'utilisateur ${userToWarnEmail} a bien reçu un avertissement.`);
            displayUsers();
        }
        hideWarningModal();
    }

    function showViewWarningsModal(email) {
        const user = users.find(u => u.email === email);
        if (!user || user.warnings.length === 0) return;

        viewWarningsModalTitle.textContent = `Avertissements pour ${email}`;
        viewWarningsList.innerHTML = ''; 

        user.warnings.forEach((warning, index) => {
            const warningDate = new Date(warning.date).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const warningElement = document.createElement('div');
            warningElement.className = 'p-3 border rounded-md bg-gray-50';
            warningElement.innerHTML = `
                <p class="font-semibold text-gray-800">Avertissement #${index + 1}</p>
                <p class="text-gray-700 mt-1"><strong>Raison :</strong> ${warning.reason}</p>
                <p class="text-xs text-gray-500 mt-2">Donné par : ${warning.by} le ${warningDate}</p>
            `;
            viewWarningsList.appendChild(warningElement);
        });
        viewWarningsModal.classList.remove('hidden');
    }

    function hideViewWarningsModal() {
        viewWarningsModal.classList.add('hidden');
    }

    function deleteUser(email, bypassConfirm = false) {
        const userToDelete = users.find(u => u.email === email);
        if (!userToDelete) return;
        if (['fondateur', 'co-fondateur', 'admin'].includes(userToDelete.role) || userToDelete.email === currentUser.email) {
            alert("Action impossible : ce compte est protégé.");
            return;
        }
        const confirmed = bypassConfirm ? true : confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?`);
        if (confirmed) {
            users = users.filter(user => user.email !== email);
            localStorage.setItem('users', JSON.stringify(users));
            if (!bypassConfirm) alert("L'utilisateur a été supprimé.");
            updateStats();
            displayUsers();
        }
    }
    
    function updateSortIndicators() {
        document.querySelectorAll('#users-table th').forEach(th => {
            th.classList.remove('active-sort');
            const arrow = th.querySelector('.sort-arrow');
            if (arrow) arrow.className = 'sort-arrow';
        });
        const activeHeader = document.querySelector(`#users-table th[data-sort="${userSortState.column}"]`);
        if (activeHeader) {
            activeHeader.classList.add('active-sort');
            activeHeader.querySelector('.sort-arrow')?.classList.add(userSortState.direction);
        }
    }

    // --- FONCTIONS DE GESTION DES RECETTES ---
    function displayRecipes() {
        recipesTableBody.innerHTML = '';
        recipes.forEach(recipe => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors';
            tr.innerHTML = `<td class="py-3 px-4 text-sm text-gray-700">${recipe.name}</td>
                            <td class="py-3 px-4 text-sm text-gray-500">${recipe.type}</td>
                            <td class="py-3 px-4 space-x-2 flex items-center">
                                <button data-id="${recipe.id}" class="edit-recipe-btn p-2 rounded-md text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Modifier">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                                </button>
                                <button data-id="${recipe.id}" class="delete-recipe-btn p-2 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors" title="Supprimer">
                                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </td>`;
            recipesTableBody.appendChild(tr);
        });
    }
    
    function saveRecipe(e) {
        e.preventDefault();
        const id = parseInt(recipeIdInput.value);
        const recipeData = { name: document.getElementById('recipe-name').value, type: document.getElementById('recipe-type').value, time: document.getElementById('recipe-time').value, difficulty: document.getElementById('recipe-difficulty').value, image: document.getElementById('recipe-image').value, href: document.getElementById('recipe-href').value };
        if (id) {
            const index = recipes.findIndex(r => r.id === id);
            recipes[index] = { ...recipes[index], ...recipeData };
        } else {
            recipeData.id = Date.now();
            recipes.push(recipeData);
        }
        localStorage.setItem('recipes', JSON.stringify(recipes));
        updateStats();
        displayRecipes();
        recipeForm.reset();
        recipeIdInput.value = '';
        cancelEditButton.classList.add('hidden');
    }

    function editRecipe(id) {
        const recipe = recipes.find(r => r.id === id);
        recipeIdInput.value = recipe.id;
        document.getElementById('recipe-name').value = recipe.name;
        document.getElementById('recipe-type').value = recipe.type;
        document.getElementById('recipe-time').value = recipe.time;
        document.getElementById('recipe-difficulty').value = recipe.difficulty;
        document.getElementById('recipe-image').value = recipe.image;
        document.getElementById('recipe-href').value = recipe.href;
        cancelEditButton.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    function deleteRecipe(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
            recipes = recipes.filter(recipe => recipe.id !== id);
            localStorage.setItem('recipes', JSON.stringify(recipes));
            updateStats();
            displayRecipes();
        }
    }
    
    function cancelEdit() {
        recipeForm.reset();
        recipeIdInput.value = '';
        cancelEditButton.classList.add('hidden');
    }

    function updateStats() {
        statsTotalUsers.textContent = users.length;
        statsTotalRecipes.textContent = recipes.length;
    }

    // --- ÉCOUTEURS D'ÉVÉNEMENTS ---
    usersTable.querySelector('thead').addEventListener('click', e => {
        const header = e.target.closest('th');
        if (header && header.dataset.sort) {
            const column = header.dataset.sort;
            userSortState.direction = userSortState.column === column && userSortState.direction === 'asc' ? 'desc' : 'asc';
            userSortState.column = column;
            displayUsers();
        }
    });

    usersTableBody.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        const email = button.dataset.email;
        if (button.classList.contains('warn-user-btn') && !button.disabled) {
            showWarningModal(email);
        }
        if (button.classList.contains('delete-user-btn') && !button.disabled) {
            deleteUser(email);
        }
        if (button.classList.contains('view-warnings-btn') && !button.disabled) {
            showViewWarningsModal(email);
        }
    });

    usersTableBody.addEventListener('change', e => {
        if (e.target.classList.contains('role-select')) {
            const email = e.target.dataset.email;
            const newRole = e.target.value;
            const userToChange = users.find(user => user.email === email);
            const originalRole = userToChange.role;
            if (currentUser.role === 'fondateur') {
                if (newRole === 'fondateur') {
                    if (confirm(`Voulez-vous vraiment transférer le rôle de fondateur à ${email} ?\n\nVotre propre rôle sera changé en 'admin'.`)) {
                        const newFounderIndex = users.findIndex(user => user.email === email);
                        const oldFounderIndex = users.findIndex(user => user.email === currentUser.email);
                        if (newFounderIndex !== -1 && oldFounderIndex !== -1) {
                            users[newFounderIndex].role = 'fondateur';
                            users[oldFounderIndex].role = 'admin';
                            localStorage.setItem('users', JSON.stringify(users));
                            currentUser.role = 'admin';
                            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                            alert("Le rôle de fondateur a été transféré avec succès.");
                            window.location.reload();
                        }
                    } else {
                        e.target.value = originalRole;
                    }
                } else {
                    userToChange.role = newRole;
                    localStorage.setItem('users', JSON.stringify(users));
                    alert(`Le rôle de ${email} a été mis à jour.`);
                    displayUsers();
                }
            } else if (currentUser.role === 'co-fondateur') {
                if (originalRole === 'utilisateur' && newRole === 'admin') {
                    userToChange.role = newRole;
                    localStorage.setItem('users', JSON.stringify(users));
                    alert(`Le rôle de ${email} a été promu administrateur.`);
                    displayUsers();
                } else {
                    alert("Action non autorisée. Un co-fondateur ne peut que promouvoir un utilisateur au rang d'administrateur.");
                    e.target.value = originalRole;
                }
            }
        }
    });

    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    confirmWarningBtn.addEventListener('click', handleWarningSubmit);
    cancelWarningBtn.addEventListener('click', hideWarningModal);
    warningModal.addEventListener('click', (e) => {
        if (e.target === warningModal) {
            hideWarningModal();
        }
    });

    closeViewWarningsBtn.addEventListener('click', hideViewWarningsModal);
    viewWarningsModal.addEventListener('click', e => {
        if (e.target === viewWarningsModal) {
            hideViewWarningsModal();
        }
    });
    
    // --- INITIALISATION ---
    function init() {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        applyDarkMode(savedDarkMode);
        updateStats();
        displayUsers();
        
        const canManageRecipes = ['fondateur', 'co-fondateur'].includes(currentUser.role);
        if (canManageRecipes) {
            displayRecipes();
            recipeForm.addEventListener('submit', saveRecipe);
            cancelEditButton.addEventListener('click', cancelEdit);
            recipesTableBody.addEventListener('click', e => {
                const button = e.target.closest('button');
                if (!button) return;
                const id = parseInt(button.dataset.id);
                if (button.classList.contains('edit-recipe-btn')) editRecipe(id);
                if (button.classList.contains('delete-recipe-btn')) deleteRecipe(id);
            });
        } else {
            recipesSection.style.display = 'none';
        }
    }

    init();
});

