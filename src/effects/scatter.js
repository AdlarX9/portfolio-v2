import { Effect, effectManager } from '../app/effects.js'

// --- CONFIG ---
const RADIUS = 200
const RADIUS_SQ = RADIUS * RADIUS
const FORCE = 100
const DAMPING = 0.1 // 0.1 = retour souple, 0.9 = retour lent
const SLEEP_THRESHOLD = 0.01 // Arrêt complet si le mouvement est < 0.01px

// --- STATE ---
let activeContainers = [] // Liste des blocs de texte visibles à l'écran
let isRunning = false
let rafId = null

// --- OBSERVER (Optimisation n°1 : Ne rien faire si hors écran) ---
const observer = new IntersectionObserver(
	entries => {
		entries.forEach(entry => {
			// On cherche l'objet de données associé à cet élément DOM
			const containerData = entry.target._scatterData
			if (!containerData) return

			if (entry.isIntersecting) {
				// S'il devient visible, on l'ajoute à la liste active
				if (!activeContainers.includes(containerData)) {
					activeContainers.push(containerData)
					// On recalcule les positions car le layout a pu changer pendant qu'il était caché
					updateContainerRects(containerData)
				}
			} else {
				// S'il sort de l'écran, on le retire. Fini les calculs pour lui.
				const idx = activeContainers.indexOf(containerData)
				if (idx > -1) {
					activeContainers.splice(idx, 1)
				}
			}
		})
	},
	{ rootMargin: '100px' }
) // Marge pour que l'animation soit prête avant d'arriver

// --- INITIALISATION DOM ---
function init() {
	const elements = document.querySelectorAll('.scatter-text')

	elements.forEach(element => {
		// 1. Sauvegarde propre
		if (!element.dataset.originalHtml) {
			element.dataset.originalHtml = element.innerHTML
		}

		// 2. Découpage (DOM Fragment pour éviter 50 reflows)
		const text = element.textContent.trim()
		element.innerHTML = ''

		const fragment = document.createDocumentFragment()
		const words = text.split(/\s+/)
		const lettersData = []

		words.forEach((wordText, index) => {
			const wordWrapper = document.createElement('span')
			wordWrapper.classList.add('word-wrapper')
			wordWrapper.style.cssText = 'display:inline-block; white-space:nowrap;' // Structure solide

			for (let i = 0; i < wordText.length; i++) {
				const char = wordText[i]
				const span = document.createElement('span')
				span.classList.add('letter')
				span.textContent = char

				// OPTIMISATION CSS CRITIQUE :
				// display: inline-block -> permet la transformation
				// will-change: transform -> prépare le GPU (sans casser le background-clip comme backface-visibility)
				span.style.cssText = 'display:inline-block; will-change:transform;'

				wordWrapper.appendChild(span)

				// On stocke les données brutes pour éviter de lire le DOM plus tard
				lettersData.push({
					el: span,
					x: 0,
					y: 0, // Position absolue (Monde)
					vx: 0,
					vy: 0, // Vitesse courante (pour l'inertie)
					tx: 0,
					ty: 0, // Cible (target)
					isActive: false // Optimisation état dormant
				})
			}

			fragment.appendChild(wordWrapper)
			// Espace entre les mots
			if (index < words.length - 1) {
				fragment.appendChild(document.createTextNode(' '))
			}
		})

		element.appendChild(fragment)

		// 3. Stockage des données sur l'élément DOM pour l'Observer
		element._scatterData = {
			element: element,
			letters: lettersData,
			// BoundingBox du conteneur entier (pour le culling)
			rect: { top: 0, left: 0, right: 0, bottom: 0 }
		}

		// 4. On lance l'observation
		observer.observe(element)
	})

	// Calcul initial différé pour être sûr que le CSS est appliqué
	setTimeout(updateAllRects, 100)

	isRunning = true
	tick()
}

// --- CALCUL DES POSITIONS (Optimisation n°2 : Batch Read) ---
function updateContainerRects(data) {
	const scrollX = window.scrollX
	const scrollY = window.scrollY

	// 1. Position du conteneur global
	const cRect = data.element.getBoundingClientRect()
	data.rect.left = cRect.left + scrollX
	data.rect.top = cRect.top + scrollY
	data.rect.right = cRect.right + scrollX
	data.rect.bottom = cRect.bottom + scrollY

	// 2. Position de chaque lettre (Absolue = Scroll inclus)
	// Ainsi, scroller ne demande AUCUN recalcul de rect.
	const len = data.letters.length
	for (let i = 0; i < len; i++) {
		const l = data.letters[i]
		const r = l.el.getBoundingClientRect()
		// On stocke le centre de la lettre
		l.x = r.left + scrollX + r.width * 0.5
		l.y = r.top + scrollY + r.height * 0.5
	}
}

function updateAllRects() {
	activeContainers.forEach(updateContainerRects)
}

// ajout en haut du module (state)
let lastTimestamp = 0
const SMOOTH_TIME = 0.2 // temps (s) pour ~63% de progression ; ajuste pour plus/moins réactif

// --- BOUCLE D'ANIMATION (FRAMERATE-INDEPENDANT) ---
function tick(timestamp) {
	// démarrage / arrêt
	if (!isRunning) return

	// boucle suivante
	rafId = requestAnimationFrame(tick)

	// Si pas de souris ou pas de texte visible, on ne fait rien (CPU = 0%)
	if (!effectManager.mouse || activeContainers.length === 0) {
		// réinitialisation du lastTimestamp pour éviter dt énorme quand on reprend
		lastTimestamp = timestamp
		return
	}

	// calcul du delta time en secondes (clamp pour éviter dt trop grand)
	if (!lastTimestamp) lastTimestamp = timestamp
	let dt = (timestamp - lastTimestamp) / 1000
	lastTimestamp = timestamp
	if (dt > 0.1) dt = 0.1 // clamp à 100ms pour éviter sauts

	// alpha temporel (exponentiel) : indépendant du framerate
	const alpha = 1 - Math.exp(-dt / SMOOTH_TIME)

	// Position souris en coordonnées MONDE (Absolue)
	const mx = effectManager.mouse.x + window.scrollX
	const my = effectManager.mouse.y + window.scrollY

	// Boucle sur les conteneurs ACTIFS uniquement
	for (let i = 0; i < activeContainers.length; i++) {
		const container = activeContainers[i]

		// CULLING : Si la souris est loin du conteneur entier, on ignore ses lettres
		// On ajoute RADIUS à la bounding box pour la marge de sécurité
		if (
			mx < container.rect.left - RADIUS ||
			mx > container.rect.right + RADIUS ||
			my < container.rect.top - RADIUS ||
			my > container.rect.bottom + RADIUS
		) {
			// Vérification rapide : si tout est immobile, on skip vraiment
			let anyMoving = false
			for (let k = 0; k < container.letters.length; k++) {
				if (container.letters[k].isActive) {
					anyMoving = true
					break
				}
			}
			if (!anyMoving) continue
		}

		const letters = container.letters
		const count = letters.length

		for (let j = 0; j < count; j++) {
			const l = letters[j]

			// Vecteur Souris -> Lettre
			const dx = mx - l.x
			const dy = my - l.y

			// Distance au carré (plus rapide que sqrt)
			const distSq = dx * dx + dy * dy

			let targetX = 0
			let targetY = 0

			// Si dans le rayon d'action
			if (distSq < RADIUS_SQ) {
				const dist = Math.sqrt(distSq)
				// Force linéaire (0 à 1)
				const forceRatio = (RADIUS - dist) / RADIUS

				// Vecteur normalisé * Force * Ratio
				if (dist > 0) {
					targetX = -(dx / dist) * forceRatio * FORCE
					targetY = -(dy / dist) * forceRatio * FORCE
				}
				l.isActive = true
			}

			// Interpolation temporelle indépendante du framerate
			l.vx += (targetX - l.vx) * alpha
			l.vy += (targetY - l.vy) * alpha

			// Optimisation d'écriture DOM
			// On ne touche au style que si ça bouge significativement
			const isMoving = Math.abs(l.vx) > SLEEP_THRESHOLD || Math.abs(l.vy) > SLEEP_THRESHOLD

			if (isMoving) {
				// translate3d force le GPU sans les bugs de backface-visibility
				// toFixed(2) évite les sous-pixels inutiles pour le CSS parser
				l.el.style.transform = `translate3d(${l.vx.toFixed(2)}px, ${l.vy.toFixed(2)}px, 0)`
				l.isActive = true
			} else if (l.isActive) {
				// Fin du mouvement : nettoyage propre
				l.el.style.transform = '' // On retire le style inline pour laisser le CSS reprendre la main
				l.vx = 0
				l.vy = 0
				l.isActive = false
			}
		}
	}
}

// --- NETTOYAGE ---
function cleanup() {
	isRunning = false
	if (rafId) cancelAnimationFrame(rafId)

	observer.disconnect()

	const elements = document.querySelectorAll('.scatter-text')
	elements.forEach(element => {
		// Restauration du HTML original
		if (element.dataset.originalHtml) {
			element.innerHTML = element.dataset.originalHtml
			delete element.dataset.originalHtml
			delete element._scatterData
		}
	})

	activeContainers = []
}

const scatterEffect = new Effect()
scatterEffect.init = init
scatterEffect.resize = updateAllRects
scatterEffect.cleanup = cleanup

export default scatterEffect
