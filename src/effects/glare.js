import { Effect } from '../app/effects.js'

let elements = []
let ticking = false
let mouseX = 0
let mouseY = 0
const CACHE_DURATION = 300

// On stocke les données pour éviter de lire le DOM en permanence
let itemsState = []
let lastUpdateTime = 0

function updateRects(force = false) {
	const now = performance.now()
	if (now - lastUpdateTime < CACHE_DURATION && !force) {
		return
	}
	lastUpdateTime = now

	// On calcule tout d'un coup pour éviter le layout thrashing
	const scrollY = window.scrollY

	itemsState = []

	// On ne garde que les éléments présents dans le DOM
	// (Array.from pour pouvoir itérer proprement)
	if (!elements || elements.length === 0) return

	for (let i = 0; i < elements.length; i++) {
		const el = elements[i]
		const rect = el.getBoundingClientRect()

		// On stocke la position absolue (relative au document) pour comparer avec scrollY
		// et la position relative au viewport pour le calcul de la souris si pas de scroll
		itemsState.push({
			el: el,
			top: rect.top + scrollY, // Position absolue Y
			left: rect.left, // Position X (relative viewport, souvent stable horizontalement)
			height: rect.height,
			width: rect.width,
			// Optimisation : flag pour savoir si on doit update le style ou non
			// pour éviter d'écrire le style si rien n'a changé
			isVisible: false
		})
	}
}

function load() {
	// Sélection des éléments
	elements = document.querySelectorAll('.text-glare, .bordered, .stroke-title, .separator')
	updateRects(true)
}

function scroll() {
	updateRects()
}

function resize() {
	updateRects()
}

function updateLoop() {
	const scrollY = window.scrollY
	const viewportHeight = window.innerHeight
	const viewportBottom = scrollY + viewportHeight

	for (let i = 0; i < itemsState.length; i++) {
		const item = itemsState[i]

		if (item.top + item.height < scrollY || item.top > viewportBottom) {
			continue
		}

		const elementTopScreen = item.top - scrollY

		const relativeX = mouseX - item.left
		const relativeY = mouseY - elementTopScreen

		item.el.style.setProperty('--x', `${relativeX}px`)
		item.el.style.setProperty('--y', `${relativeY}px`)
	}

	ticking = false
}

function mousemove(e) {
	mouseX = e.clientX
	mouseY = e.clientY

	if (!ticking) {
		window.requestAnimationFrame(updateLoop)
		ticking = true
	}
}

const glareEffect = new Effect()
glareEffect.smallScreen = true
glareEffect.init = load
glareEffect.load = load
glareEffect.scroll = scroll
glareEffect.resize = resize
glareEffect.mousemove = mousemove

// Nettoyage si besoin (SPA navigation)
glareEffect.destroy = () => {
	window.removeEventListener('scroll', updateRects)
	elements = []
	itemsState = []
}

export default glareEffect
