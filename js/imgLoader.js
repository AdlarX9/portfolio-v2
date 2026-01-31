;(function () {
	// Fonction pour activer le loader
	function initImageLoaders() {
		// Sélectionne toutes les images
		const images = document.querySelectorAll('img')

		images.forEach(img => {
			// Si l'image est déjà chargée (cache navigateur), on ne fait rien
			if (img.complete && img.naturalHeight !== 0) {
				return
			}

			// Sinon, on ajoute la classe qui affiche le loader en background
			img.classList.add('loading-state')

			// Fonction de nettoyage
			const removeLoader = () => {
				img.classList.remove('loading-state')
			}

			// Quand l'image est chargée ou en erreur, on retire le loader
			img.addEventListener('load', removeLoader)
			img.addEventListener('error', removeLoader)
		})
	}

	// On lance au chargement du DOM
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initImageLoaders)
	} else {
		initImageLoaders()
	}
})()
