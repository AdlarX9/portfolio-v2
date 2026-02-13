import { Effect, effectManager } from '../app/effects.js'

// --- ELEMENTS DOM ---
let turbGlitch = null
let liquidElements = [] // Éléments avec leurs propres états

// --- CONFIG LIQUID ---
const LIQUID_SPEED = 0.01 // Vitesse de l'eau au calme
const LIQUID_BASE_SCALE = 5 // Ondulation minimale au repos
const LIQUID_MAX_SCALE = 80 // Ondulation max quand on secoue
const DAMPING = 0.1 // Vitesse de retour au calme (0.1 = doux)
const INTENSITY_TRANSITION = 0.08 // Vitesse de transition de l'intensité (activation/désactivation)

// --- STATE ---
let time = 0
let lastMouse = { x: 0, y: 0 }
let svgDefs = null // Référence au <defs> du SVG pour ajouter les filtres

const distortionEffect = new Effect()

// On active sur desktop, mais on peut aussi autoriser le mobile si le GPU suit
distortionEffect.mobile = false
distortionEffect.smallScreen = true

distortionEffect.init = () => {
	// Sélection par ID, beaucoup plus performant et précis
	turbGlitch = document.getElementById('turb-glitch')

	// Trouver le <defs> du SVG pour ajouter les filtres dynamiques
	svgDefs = document.querySelector('svg defs')

	// On initialise lastMouse pour éviter un saut au chargement
	if (effectManager.mouse) {
		lastMouse = { ...effectManager.mouse }
	}

	// Attacher les événements hover aux éléments .liquid et créer leurs filtres
	setupLiquidElements()
}

function setupLiquidElements() {
	const elements = document.querySelectorAll('.liquid')

	// Sécurité : ne rien faire si aucun élément trouvé
	if (elements.length === 0 || !svgDefs) {
		return
	}

	liquidElements = [] // Reset

	elements.forEach((element, index) => {
		// Créer un filtre unique pour cet élément
		const filterId = 'liquid-filter-' + index
		const filter = createLiquidFilter(filterId)
		svgDefs.appendChild(filter)

		// Appliquer le filtre à l'élément
		element.style.filter = 'url(#' + filterId + ')'
		element.style.willChange = 'filter'

		// Stocker l'état de l'élément
		const elementState = {
			element,
			filterId,
			turbulence: document.getElementById('turb-' + filterId),
			displacement: document.getElementById('disp-' + filterId),
			intensity: 0,
			targetIntensity: 0,
			currentScale: LIQUID_BASE_SCALE,
			isHovered: false
		}

		liquidElements.push(elementState)

		// Event listeners
		element.addEventListener('mouseenter', () => {
			elementState.isHovered = true
			elementState.targetIntensity = 1
		})

		element.addEventListener('mouseleave', () => {
			elementState.isHovered = false
			elementState.targetIntensity = 0
		})
	})
}

function createLiquidFilter(filterId) {
	// Créer le filtre SVG dynamiquement
	const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
	filter.setAttribute('id', filterId)

	// Turbulence
	const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence')
	turbulence.setAttribute('id', 'turb-' + filterId)
	turbulence.setAttribute('type', 'fractalNoise')
	turbulence.setAttribute('baseFrequency', '0.02 0.03')
	turbulence.setAttribute('numOctaves', '1')
	turbulence.setAttribute('result', 'noise')

	// Displacement
	const displacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap')
	displacement.setAttribute('id', 'disp-' + filterId)
	displacement.setAttribute('in', 'SourceGraphic')
	displacement.setAttribute('in2', 'noise')
	displacement.setAttribute('scale', '0')
	displacement.setAttribute('xChannelSelector', 'R')
	displacement.setAttribute('yChannelSelector', 'G')

	filter.appendChild(turbulence)
	filter.appendChild(displacement)

	return filter
}

distortionEffect.update = () => {
	// 1. GESTION DU GLITCH (Ta logique originale conservée - GLOBALE)
	if (turbGlitch) {
		const freq = Math.random() < 0.1 ? 0.01 : Math.random() * 0.4
		turbGlitch.setAttribute('baseFrequency', '0 ' + freq)
	}

	// 2. GESTION DU LIQUID - INDIVIDUELLE PAR ÉLÉMENT
	if (!effectManager.mouse) return

	time += LIQUID_SPEED

	// Calcul de la vitesse de la souris (Force du mouvement) - partagé
	const speedX = Math.abs(effectManager.mouse.x - lastMouse.x)
	const speedY = Math.abs(effectManager.mouse.y - lastMouse.y)
	const speed = Math.sqrt(speedX * speedX + speedY * speedY)

	// Mettre à jour chaque élément individuellement
	liquidElements.forEach(state => {
		// Transition smooth de l'intensité
		state.intensity += (state.targetIntensity - state.intensity) * INTENSITY_TRANSITION

		// Optimisation : skip si complètement inactif
		if (state.intensity < 0.001 && !state.isHovered) {
			state.intensity = 0
			if (state.displacement) {
				state.displacement.setAttribute('scale', '0')
			}
			return // Next element
		}

		// Calculs pour cet élément
		const targetScale = LIQUID_BASE_SCALE + Math.min(speed * 3, LIQUID_MAX_SCALE)
		state.currentScale += (targetScale - state.currentScale) * DAMPING

		// Application au DOM avec intensité individuelle
		const finalScale = (state.currentScale + 30) * state.intensity
		if (state.displacement) {
			state.displacement.setAttribute('scale', finalScale.toString())
		}

		// Animation fluide de la texture de l'eau (modulée par intensité)
		const freqX = (0.02 + Math.sin(time) * 0.002) * state.intensity
		const freqY = (0.03 + Math.cos(time * 0.8) * 0.002) * state.intensity
		if (state.turbulence) {
			state.turbulence.setAttribute('baseFrequency', freqX + ' ' + freqY)
		}
	})

	// Mise à jour position souris pour la prochaine frame
	lastMouse.x = effectManager.mouse.x
	lastMouse.y = effectManager.mouse.y
}

distortionEffect.cleanup = () => {
	// Nettoyer les références DOM
	turbGlitch = null
	svgDefs = null

	// Nettoyer les filtres créés dynamiquement
	liquidElements.forEach(state => {
		const filter = document.getElementById(state.filterId)
		if (filter && filter.parentNode) {
			filter.parentNode.removeChild(filter)
		}
		// Retirer le style filter de l'élément
		if (state.element) {
			state.element.style.filter = ''
			state.element.style.willChange = ''
		}
	})

	// Réinitialiser l'état
	liquidElements = []
}

export default distortionEffect
