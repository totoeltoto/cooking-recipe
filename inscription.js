/**
 * inscription.js — Le Coin Gourmand
 * Rôles : utilisateur, admin, co-fondateur, fondateur.
 */
document.addEventListener('DOMContentLoaded', () => {

    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }

    // Codes secrets par rôle
    const SECRET_CODES = {
        'admin':        '123',
        'co-fondateur': '456',  // nouveau code pour le co-fondateur
        'fondateur':    '111',
    };

    // Rôles pour lesquels un seul exemplaire est autorisé
    const UNIQUE_ROLES = ['fondateur', 'co-fondateur'];

    const registerForm        = document.getElementById('register-form');
    const roleSelect          = document.getElementById('role');
    const secretCodeContainer = document.getElementById('secret-code-container');
    const secretCodeInput     = document.getElementById('secret-code');
    const msgContainer        = document.getElementById('message-container');

    function showMessage(text, type = 'error') {
        msgContainer.textContent = text;
        msgContainer.className   = `show ${type}`;
    }

    // Affiche/masque le champ code secret
    roleSelect.addEventListener('change', () => {
        const role     = roleSelect.value;
        const needCode = !!SECRET_CODES[role];
        secretCodeContainer.classList.toggle('hidden', !needCode);
        secretCodeInput.required = needCode;
        if (!needCode) secretCodeInput.value = '';
    });

    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        msgContainer.className = '';

        const email      = document.getElementById('email').value.trim();
        const password   = document.getElementById('password').value;
        const role       = roleSelect.value;
        const secretCode = secretCodeInput.value;

        if (!email || !password) {
            showMessage("Veuillez remplir l'e-mail et le mot de passe."); return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.find(u => u.email === email)) {
            showMessage("Cet e-mail est déjà utilisé."); return;
        }

        // Vérification du code secret si rôle spécial
        if (SECRET_CODES[role]) {
            if (secretCode !== SECRET_CODES[role]) {
                showMessage(`Le code secret pour le rôle "${role}" est incorrect.`); return;
            }
        }

        // Vérification unicité de certains rôles
        if (UNIQUE_ROLES.includes(role) && users.some(u => u.role === role)) {
            showMessage(`Un compte "${role}" existe déjà.`); return;
        }

        users.push({ email, password, role, favorites: [], warnings: [] });
        localStorage.setItem('users', JSON.stringify(users));

        showMessage("Inscription réussie ! Redirection…", 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1800);
    });
});