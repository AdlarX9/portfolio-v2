import { Effect, effectManager } from '../app/effects.js'

// --- ELEMENTS DOM ---
let turbGlitch = null
let turbLiquid = null
let dispLiquid = null

// --- CONFIG LIQUID ---
const LIQUID_SPEED = 0.01 // Vitesse de l'eau au calme
const LIQUID_BASE_SCALE = 5 // Ondulation minimale au repos
const LIQUID_MAX_SCALE = 80 // Ondulation max quand on secoue
const DAMPING = 0.1 // Vitesse de retour au calme (0.1 = doux)

// --- STATE ---
let time = 0
let currentScale = 0
let lastMouse = { x: 0, y: 0 }

const distortionEffect = new Effect()

// On active sur desktop, mais on peut aussi autoriser le mobile si le GPU suit
distortionEffect.mobile = false
distortionEffect.smallScreen = true

distortionEffect.init = () => {
	// Sélection par ID, beaucoup plus performant et précis
	turbGlitch = document.getElementById('turb-glitch')
	turbLiquid = document.getElementById('turb-liquid')
	dispLiquid = document.getElementById('disp-liquid')

	// Init state
	currentScale = LIQUID_BASE_SCALE

	// On initialise lastMouse pour éviter un saut au chargement
	if (effectManager.mouse) {
		lastMouse = { ...effectManager.mouse }
	}
}

distortionEffect.update = () => {
	// 1. GESTION DU GLITCH (Ta logique originale conservée)
	if (turbGlitch) {
		const freq = Math.random() < 0.1 ? 0.01 : Math.random() * 0.4
		turbGlitch.setAttribute('baseFrequency', `0 ${freq}`)
	}

	// 2. GESTION DU LIQUID (Nouvelle logique physique)
	if (turbLiquid && dispLiquid && effectManager.mouse) {
		time += LIQUID_SPEED

		// Calcul de la vitesse de la souris (Force du mouvement)
		const speedX = Math.abs(effectManager.mouse.x - lastMouse.x)
		const speedY = Math.abs(effectManager.mouse.y - lastMouse.y)
		const speed = Math.sqrt(speedX * speedX + speedY * speedY) // Pythagore

		// Cible : Base + vitesse souris (bornée à MAX_SCALE)
		// Le * 3 est un multiplicateur de sensibilité
		const targetScale = LIQUID_BASE_SCALE + Math.min(speed * 3, LIQUID_MAX_SCALE)

		// Lerp pour lisser la transition (damping)
		currentScale += (targetScale - currentScale) * DAMPING

		// Application au DOM
		dispLiquid.setAttribute('scale', currentScale)

		// Animation fluide de la texture de l'eau
		const freqX = 0.02 + Math.sin(time) * 0.002
		const freqY = 0.03 + Math.cos(time * 0.8) * 0.002
		turbLiquid.setAttribute('baseFrequency', `${freqX} ${freqY}`)

		// Mise à jour position souris pour la prochaine frame
		lastMouse.x = effectManager.mouse.x
		lastMouse.y = effectManager.mouse.y
	}
}

export default distortionEffect
