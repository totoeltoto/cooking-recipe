document.addEventListener('DOMContentLoaded', () => {

    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    const loginForm = document.getElementById('login-form');
    const messageContainer = document.getElementById('message-container');

    // --- FONCTIONS ---

    /**
     * Affiche un message à l'utilisateur.
     * @param {string} text - Le message à afficher.
     * @param {string} type - 'success' (vert) ou 'error' (rouge).
     */
    function showMessage(text, type = 'error') {
        messageContainer.textContent = text;
        messageContainer.className = type === 'success' 
            ? 'text-green-600' 
            : 'text-red-600';
    }

    // --- ÉCOUTEUR D'ÉVÉNEMENT ---

    // Gère la soumission du formulaire de connexion
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        messageContainer.textContent = ''; // Efface les anciens messages

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // --- Logique de vérification ---
        // On récupère les utilisateurs depuis le localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            // Si l'utilisateur est trouvé
            showMessage('Connexion réussie ! Redirection...', 'success');
            
            // On stocke l'utilisateur dans sessionStorage pour la session en cours
            sessionStorage.setItem('currentUser', JSON.stringify(foundUser));

            setTimeout(() => {
                window.location.href = 'index.html'; // Redirige vers l'accueil
            }, 1500); // Laisse 1.5s pour lire le message

        } else {
            // Si les identifiants sont incorrects
            showMessage('Email ou mot de passe incorrect.');
        }
    });
});
