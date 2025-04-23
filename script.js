let selectedSuggestionIndex = -1;

// Affiche les suggestions selon la recherche
function showSuggestions() {
    const input = document.querySelector('.input-recherche');
    const suggestionsList = document.getElementById('suggestion-list');
    const inputValue = input.value.toLowerCase().trim();
    const recipes = document.querySelectorAll('.bouton-recette');

    suggestionsList.innerHTML = ''; // Vider la liste des suggestions

    // Vérifier si des suggestions correspondent à la recherche
    let hasSuggestions = false;

    recipes.forEach(recipe => {
        const recipeName = recipe.textContent.toLowerCase();
        if (recipeName.includes(inputValue) && inputValue !== "") {
            const suggestionItem = document.createElement('li');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = recipe.textContent;
            suggestionItem.addEventListener('click', () => {
                input.value = recipe.textContent;
                suggestionsList.style.display = 'none';
            });
            suggestionsList.appendChild(suggestionItem);
            hasSuggestions = true;
        }
    });

    // Si aucune suggestion n'est trouvée, cacher la liste
    suggestionsList.style.display = hasSuggestions ? 'block' : 'none';
}

// Recherche la recette et redirige
function searchRecipe() {
    const input = document.querySelector('.input-recherche');
    const inputValue = input.value.toLowerCase().trim();
    const recipes = document.querySelectorAll('.bouton-recette');
    let found = false;

    recipes.forEach(recipe => {
        const recipeName = recipe.textContent.toLowerCase();
        if (recipeName === inputValue) {
            window.location.href = recipe.getAttribute('href');
            found = true;
        }
    });

    if (!found && inputValue !== "") {
        alert("Recette non trouvée.");
    }
}

// Filtre les recettes par type
function filtrerRecettes(type) {
    const recettes = document.querySelectorAll('.bouton-recette');

    recettes.forEach(recette => {
        if (type === 'tous' || recette.dataset.type === type) {
            recette.parentElement.style.display = 'block';
        } else {
            recette.parentElement.style.display = 'none';
        }
    });
}

// Active/Désactive le mode sombre
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    // Mémoriser l'état du mode sombre dans le localStorage
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

// Charger l'état du mode sombre depuis le localStorage
window.addEventListener('load', () => {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
});

// Ferme les suggestions si on clique ailleurs
document.addEventListener('click', function (event) {
    const input = document.querySelector('.input-recherche');
    const suggestionsList = document.getElementById('suggestion-list');
    if (event.target !== input && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});

// Navigation au clavier dans les suggestions
document.addEventListener('keydown', function (event) {
    const suggestionsList = document.getElementById('suggestion-list');
    const suggestionItems = document.querySelectorAll('.suggestion-item');

    if (suggestionItems.length > 0) {
        if (event.key === 'ArrowUp') {
            selectedSuggestionIndex = (selectedSuggestionIndex - 1 + suggestionItems.length) % suggestionItems.length;
        } else if (event.key === 'ArrowDown') {
            selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestionItems.length;
        }

        suggestionItems.forEach((item, index) => {
            if (index === selectedSuggestionIndex) {
                item.classList.add('selected');
                document.querySelector('.input-recherche').value = item.textContent;
            } else {
                item.classList.remove('selected');
            }
        });
    }
});

// Lancer la recherche avec Entrée
document.querySelector('.input-recherche').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        searchRecipe();
    }
});

// Gestion de la connexion utilisateur + Panel Admin si admin
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

if (currentUser) {
    document.getElementById('user-info').innerHTML = `
      <p>Bienvenue, ${currentUser.email} !</p>
      <button onclick="logout()" class="btn">Se déconnecter</button>
      ${currentUser.role === "admin" ? '<a href="admin.html" class="user-link">Panel Admin</a>' : ''}
    `;
} else {
    document.getElementById('user-info').innerHTML = `
      <a href="login.html" class="user-link">Se connecter</a>
      <a href="inscription.html" class="user-link">S'inscrire</a>
    `;
}

// Déconnexion
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.reload();
}
