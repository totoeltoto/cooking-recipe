/**
 * login.js — Le Coin Gourmand
 */
document.addEventListener('DOMContentLoaded', () => {

    // Dark mode sync
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }

    const loginForm       = document.getElementById('login-form');
    const msgContainer    = document.getElementById('message-container');

    function showMessage(text, type = 'error') {
        msgContainer.textContent = text;
        msgContainer.className = `show ${type}`;
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        msgContainer.className = '';

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showMessage('Veuillez remplir tous les champs.');
            return;
        }

        const users     = JSON.parse(localStorage.getItem('users')) || [];
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            showMessage('Connexion réussie ! Redirection…', 'success');
            sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
            setTimeout(() => { window.location.href = 'index.html'; }, 1400);
        } else {
            showMessage('Email ou mot de passe incorrect.');
        }
    });
});
