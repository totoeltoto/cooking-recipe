document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTES DE SÉCURITÉ ---
    const ADMIN_SECRET_CODE = '123'; // Code pour les administrateurs
    const FOUNDER_SECRET_CODE = '111'; // Code pour le fondateur

    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const secretCodeContainer = document.getElementById('secret-code-container');
    const secretCodeInput = document.getElementById('secret-code');
    const messageContainer = document.getElementById('message-container');

    /**
     * Affiche un message à l'utilisateur.
     * @param {string} text - Le message à afficher.
     * @param {string} type - 'success' (vert) ou 'error' (rouge).
     */
    function showMessage(text, type = 'error') {
        messageContainer.textContent = text;
        messageContainer.className = `mb-4 text-center text-sm ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    }

    // --- ÉCOUTEURS D'ÉVÉNEMENTS ---

    // Affiche/masque le champ du code secret en fonction du rôle
    roleSelect.addEventListener('change', () => {
        const selectedRole = roleSelect.value;
        if (selectedRole === 'admin' || selectedRole === 'fondateur') {
            secretCodeContainer.classList.remove('hidden');
            secretCodeInput.required = true;
        } else {
            secretCodeContainer.classList.add('hidden');
            secretCodeInput.required = false;
        }
    });

    // Gère la soumission du formulaire
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Empêche la page de se recharger

        showMessage(''); // On efface les anciens messages

        const email = emailInput.value;
        const password = passwordInput.value;
        const role = roleSelect.value;
        const secretCode = secretCodeInput.value;

        // Validation simple
        if (!email || !password) {
            showMessage("Veuillez remplir l'email et le mot de passe.");
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            showMessage("Cet email est déjà utilisé. Veuillez en choisir un autre.");
            return;
        }

        // Vérification des rôles et des codes secrets
        if (role === 'admin') {
            if (secretCode !== ADMIN_SECRET_CODE) {
                showMessage("Le code secret administrateur est incorrect.");
                return;
            }
        } else if (role === 'fondateur') {
            if (secretCode !== FOUNDER_SECRET_CODE) {
                showMessage("Le code secret fondateur est incorrect.");
                return;
            }
            // On vérifie qu'il n'y a pas déjà un fondateur
            const founderExists = users.some(u => u.role === 'fondateur');
            if (founderExists) {
                showMessage("Un compte fondateur existe déjà. Il ne peut y en avoir qu'un.");
                return;
            }
        }

        // Si tout est bon, on ajoute l'utilisateur
        users.push({ email, password, role });
        localStorage.setItem('users', JSON.stringify(users));

        // Afficher un message de succès et rediriger
        showMessage("Inscription réussie ! Vous allez être redirigé...", 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html'; // Redirige vers la page de connexion
        }, 2000); // Laisse 2 secondes pour lire le message
    });
});

