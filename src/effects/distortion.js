import { Effect, effectManager } from '../app/effects.js'

// --- ELEMENTS DOM ---
let turbGlitch = null
let liquidElements = []
let liquidSvgContainer = null // Conteneur dédié pour le liquide

// --- CONFIG ---
const LIQUID_SPEED = 0.01
const LIQUID_BASE_SCALE = 5
const LIQUID_MAX_SCALE = 80
const DAMPING = 0.1
const INTENSITY_TRANSITION = 0.08

// --- STATE ---
let time = 0
let lastMouse = { x: 0, y: 0 }

const isSafari =
	/constructor/i.test(window.HTMLElement) ||
	(function (p) {
		return p.toString() === '[object SafariRemoteNotification]'
	})(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification))

function init() {
	// 1. Récupération du GLITCH (existant dans le HTML)
	turbGlitch = document.getElementById('turb-glitch')

	// FIX: Pour que Firefox et Safari exécutent le filtre, le SVG conteneur ne doit PAS être en display: none
	if (turbGlitch) {
		const svgContainer = turbGlitch.closest('svg')
		if (svgContainer) {
			svgContainer.style.display = 'block'
			svgContainer.style.position = 'absolute'
			svgContainer.style.width = '0'
			svgContainer.style.height = '0'
			svgContainer.style.overflow = 'hidden'
			svgContainer.style.pointerEvents = 'none'
		}
	}

	// 2. Création d'un conteneur SVG PROPRE pour le LIQUIDE
	// C'est ça qui manquait pour Firefox : un environnement contrôlé
	if (!document.getElementById('liquid-svg-container')) {
		liquidSvgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		liquidSvgContainer.id = 'liquid-svg-container'

		// Configuration vitale pour Firefox : visible mais sans taille
		liquidSvgContainer.style.position = 'absolute'
		liquidSvgContainer.style.top = '-9999px'
		liquidSvgContainer.style.left = '-9999px'
		liquidSvgContainer.style.width = '0'
		liquidSvgContainer.style.height = '0'
		liquidSvgContainer.style.pointerEvents = 'none'

		const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
		liquidSvgContainer.appendChild(defs)
		document.body.appendChild(liquidSvgContainer)
	} else {
		liquidSvgContainer = document.getElementById('liquid-svg-container')
	}

	if (effectManager.mouse) {
		lastMouse = { ...effectManager.mouse }
	}

	setupLiquidElements()
}

function setupLiquidElements() {
	const elements = document.querySelectorAll('.liquid')
	const defs = liquidSvgContainer.querySelector('defs')

	if (elements.length === 0 || !defs) return

	// Nettoyage
	liquidElements.forEach(state => {
		const oldFilter = document.getElementById(state.filterId)
		if (oldFilter) oldFilter.remove()
	})
	liquidElements = []

	elements.forEach((element, index) => {
		const filterId = 'liquid-filter-' + index

		// Création du filtre DANS le nouveau conteneur
		const { filter, turbulence, displacement } = createLiquidFilter(filterId)
		defs.appendChild(filter)

		// Application du filtre
		element.style.filter = `url(#${filterId})`
		element.style.webkitFilter = `url(#${filterId})` // Préfixe pour Safari

		// Petit hack navigateur : isoler le contexte d'empilement
		element.style.isolation = 'isolate'

		// FIX SAFARI : Utiliser translate3d(0,0,0) sur le PARENT seulement force l'accélération
		// et inclut les enfants dans le rendu du filtre. Ne PAS mettre ça sur les enfants.
		element.style.transform = 'translate3d(0, 0, 0)'
		element.style.willChange = 'filter'

		liquidElements.push({
			element,
			filterId,
			turbulence,
			displacement,
			intensity: 0,
			targetIntensity: 0,
			currentScale: LIQUID_BASE_SCALE,
			isHovered: false
		})

		element.addEventListener('mouseenter', () => {
			liquidElements[index].isHovered = true
			liquidElements[index].targetIntensity = 1
		})

		element.addEventListener('mouseleave', () => {
			liquidElements[index].isHovered = false
			liquidElements[index].targetIntensity = 0
		})
	})
}

function createLiquidFilter(filterId) {
	const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
	filter.setAttribute('id', filterId)

	// Zone d'effet large pour éviter que le liquide soit coupé sur les bords
	filter.setAttribute('x', '-50%')
	filter.setAttribute('y', '-50%')
	filter.setAttribute('width', '200%')
	filter.setAttribute('height', '200%')

	// Indispensable pour que Firefox/Safari calculent les couleurs correctement
	filter.setAttribute('color-interpolation-filters', 'sRGB')

	const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence')
	turbulence.setAttribute('id', 'turb-' + filterId)
	turbulence.setAttribute('type', 'fractalNoise')
	turbulence.setAttribute('baseFrequency', '0.02 0.03')
	turbulence.setAttribute('numOctaves', '1')
	turbulence.setAttribute('result', 'noise')

	const displacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap')
	displacement.setAttribute('id', 'disp-' + filterId)
	displacement.setAttribute('in', 'SourceGraphic')
	displacement.setAttribute('in2', 'noise')
	displacement.setAttribute('scale', '0')
	displacement.setAttribute('xChannelSelector', 'R')
	displacement.setAttribute('yChannelSelector', 'G')

	filter.appendChild(turbulence)
	filter.appendChild(displacement)

	return { filter, turbulence, displacement }
}

function update() {
	// --- 1. GLITCH (Toujours fonctionnel) ---
	if (turbGlitch) {
		// Petit fix : Firefox préfère parfois que l'attribut soit une chaîne explicite
		const val = Math.random() < 0.01 ? 0.01 : Math.random() * 0.4
		turbGlitch.setAttribute('baseFrequency', `0 ${val}`)
	}

	// --- 2. LIQUIDE ---
	if (!effectManager.mouse) return

	time += LIQUID_SPEED

	const speedX = Math.abs(effectManager.mouse.x - lastMouse.x)
	const speedY = Math.abs(effectManager.mouse.y - lastMouse.y)
	const speed = Math.sqrt(speedX * speedX + speedY * speedY)

	liquidElements.forEach(state => {
		state.intensity += (state.targetIntensity - state.intensity) * INTENSITY_TRANSITION

		if (state.intensity < 0.005 && !state.isHovered) {
			if (state.currentScale !== 0) {
				state.currentScale = 0
				state.displacement.setAttribute('scale', '0')
			}
			return
		}

		const targetScale = LIQUID_BASE_SCALE + Math.min(speed * 3, LIQUID_MAX_SCALE)
		state.currentScale += (targetScale - state.currentScale) * DAMPING

		const finalScale = (state.currentScale + 30) * state.intensity

		// Mise à jour des attributs SVG
		state.displacement.setAttribute('scale', finalScale)

		const freqX = 0.02 + Math.sin(time) * 0.002
		const freqY = 0.03 + Math.cos(time * 0.8) * 0.002
		state.turbulence.setAttribute('baseFrequency', `${freqX} ${freqY}`)
	})

	lastMouse.x = effectManager.mouse.x
	lastMouse.y = effectManager.mouse.y
}

function cleanup() {
	turbGlitch = null

	// On nettoie les éléments
	liquidElements.forEach(state => {
		if (state.element) {
			state.element.style.filter = ''
			state.element.style.transform = ''
		}
	})

	// On supprime le conteneur dynamique
	if (liquidSvgContainer) {
		liquidSvgContainer.remove()
		liquidSvgContainer = null
	}

	liquidElements = []
}

const distortionEffect = new Effect()

if (!isSafari) {
	distortionEffect.mobile = false
	distortionEffect.smallScreen = true
	distortionEffect.init = init
	distortionEffect.update = update
	distortionEffect.cleanup = cleanup
}

export default distortionEffect
