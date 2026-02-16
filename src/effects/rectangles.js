import { Effect, effectManager } from '../app/effects.js'
import { getRect, inViewport } from '../app/main.js'

// --- CONFIG ---
const NUMBER_OF_BARS_DESKTOP = 15
const NUMBER_OF_BARS_MOBILE = 10 // Moins de bars sur mobile pour la performance
const LER_FACTOR = 0.08 // Légèrement augmenté pour compenser l'absence de transition CSS
const SENSITIVITY = 0.8 // Ajusté

// --- STATE ---
let container = null
let currentDelta = 0
let rect = null

const rectanglesEffect = new Effect()
rectanglesEffect.mobile = true

rectanglesEffect.init = () => {
	container = document.getElementById('shutters')
	if (!container) return

	container.innerHTML = ''
	const fragment = document.createDocumentFragment()
	const barCount = effectManager.isMobile.matches ? NUMBER_OF_BARS_MOBILE : NUMBER_OF_BARS_DESKTOP

	for (let i = 0; i < barCount; i++) {
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

rectanglesEffect.resize = () => {
	rect = null
}

rectanglesEffect.update = () => {
	if (!container) return
	if (!rect) {
		rect = getRect(document.querySelector('.drawings'))
	}
	if (rect && !inViewport(rect)) return

	if (effectManager.mouse) {
		const centerX = window.innerWidth / 2
		const centerY = window.innerHeight / 2
		let dist = (effectManager.mouse.x - centerX) ** 2 + (effectManager.mouse.y - centerY) ** 2
		dist = Math.sqrt(dist)
		currentDelta += (dist - currentDelta) * LER_FACTOR
		if (Math.abs(dist - currentDelta) < 0.1) return
	}

	container.style.setProperty(
		'--mouse-delta',
		effectManager.isMobile.matches ? 1600 : currentDelta * SENSITIVITY + 800
	)
}

export default rectanglesEffect
