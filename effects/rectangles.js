import { Effect, effectManager } from '../app/effects.js'

// --- CONFIG ---
const NUMBER_OF_BARS = 15 // Réduit de 20 à 15 (moins d'éléments = plus de fps)
const LER_FACTOR = 0.08 // Légèrement augmenté pour compenser l'absence de transition CSS
const SENSITIVITY = 0.8 // Ajusté

// --- STATE ---
let container = null
let currentDelta = 0

const rectanglesEffect = new Effect()
rectanglesEffect.mobile = true

rectanglesEffect.init = () => {
	container = document.getElementById('shutters')
	if (!container) return

	container.innerHTML = ''
	const fragment = document.createDocumentFragment()

	for (let i = 0; i < NUMBER_OF_BARS; i++) {
		const div = document.createElement('div')
		div.classList.add('shutter-bar')
		fragment.appendChild(div)
	}
	container.appendChild(fragment)
	currentDelta = 0
}

rectanglesEffect.cleanup = () => {
	if (container) {
		container.innerHTML = ''
		container.style.removeProperty('--mouse-delta')
	}
}

rectanglesEffect.update = () => {
	if (!container) return

	if (effectManager.mouse) {
		const centerX = window.innerWidth / 2
		const centerY = window.innerHeight / 2

		// Calcul de la distance
		let dist = (effectManager.mouse.x - centerX) ** 2 + (effectManager.mouse.y - centerY) ** 2
		dist = Math.sqrt(dist)

		// LERP (Interpolation JS)
		// C'est ICI que se fait la douceur, pas dans le CSS
		currentDelta += (dist - currentDelta) * LER_FACTOR

		// Micro-optimisation : Si ça bouge presque plus, on ne touche pas au DOM
		if (Math.abs(dist - currentDelta) < 0.1) return
	}

	// On écrit une seule fois dans le DOM, le CSS calc() fait le reste via GPU
	container.style.setProperty(
		'--mouse-delta',
		effectManager.isMobile.matches ? 1600 : currentDelta * SENSITIVITY + 800
	)
}

export default rectanglesEffect
