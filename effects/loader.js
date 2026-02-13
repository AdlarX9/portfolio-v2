import { Effect } from '../app/effects.js'

// utils
function animateEntrance() {
	const elementsToReveal = document.querySelectorAll('.reveal')
	elementsToReveal.forEach((el, index) => {
		setTimeout(
			() => {
				el.classList.add('is-visible')
			},
			100 + index * 100
		)
	})
}

// Variable pour stocker la boucle de verrouillage
let scrollLockFrame = null

function forceScrollTop() {
	// 1. On force le navigateur
	window.scrollTo(0, 0)

	// 2. On force Lenis (si chargé)
	if (window.lenis) {
		window.lenis.scrollTo(0, { immediate: true })
	}

	// 3. On recommence à la frame suivante tant que le loader est là
	scrollLockFrame = requestAnimationFrame(forceScrollTop)
}

// init
function init() {
	const loader = document.getElementById('loader')
	const bar = document.querySelector('.bar')
	const counter = document.querySelector('.counter')

	// --- 1. VERROUILLAGE AGRESSIF ---
	// On désactive la restauration automatique du navigateur
	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual'
	}

	// On lance la boucle qui force le scroll en haut en permanence
	// C'est ça qui corrige ton bug : même si le navigateur essaie de descendre, on le remonte instantanément
	forceScrollTop()

	// On arrête Lenis temporairement
	if (window.lenis) window.lenis.stop()

	// On cache la barre de scroll native visuellement
	document.body.style.overflow = 'hidden'

	// --- 2. Logique de chargement ---
	let progress = 0

	function updateProgress(val) {
		progress = val
		if (bar) bar.style.width = `${progress}%`
		if (counter) counter.textContent = `${Math.round(progress)}%`
	}

	const interval = setInterval(() => {
		if (progress < 90) {
			updateProgress(progress + Math.random() * 5)
		}
	}, 100)

	window.addEventListener('load', () => {
		clearInterval(interval)
		updateProgress(100)

		setTimeout(() => {
			finishLoading()
		}, 500)
	})

	function finishLoading() {
		// --- 3. DÉVERROUILLAGE ---

		// IMPORTANT : On arrête de forcer le scroll en haut
		if (scrollLockFrame) {
			cancelAnimationFrame(scrollLockFrame)
		}

		// On réactive le scroll normal
		document.body.style.overflow = ''

		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'auto'
		}

		if (window.lenis) {
			// On s'assure que Lenis redémarre bien de 0
			window.lenis.scrollTo(0, { immediate: true })
			window.lenis.start()
			window.lenis.resize()
		}

		// Disparition du loader
		loader.classList.add('loaded-hidden')

		// Animation d'entrée
		animateEntrance()
	}
}

const loaderEffect = new Effect()
loaderEffect.smallScreen = true
loaderEffect.mobile = true
loaderEffect.init = init

export default loaderEffect
