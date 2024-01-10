function noterRecette(event) {
  const etoiles = document.querySelectorAll('.etoile');
  const notationContainer = document.querySelector('.notation');
  const valeurNotation = event.target.getAttribute('data-valeur');

  etoiles.forEach(etoile => {
    etoile.classList.remove('notee');
  });

  for (let i = 0; i < valeurNotation; i++) {
    etoiles[i].classList.add('notee');
  }

  // Récupérer le commentaire
  const commentaire = document.querySelector('.commentaire').value;
  console.log('Commentaire:', commentaire);

  // Vous pouvez envoyer le commentaire à un serveur ici pour le sauvegarder, ou le stocker localement.
}