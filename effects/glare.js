import { Effect } from '../app/effects.js'

// utils
let isTicking = false
let elements = null
let elementRects = null // Cache pour les rectangles
let lastResizeTime = 0
const RECT_CACHE_DURATION = 200 // ms

// load
function load() {
	elements = document.querySelectorAll('.text-glare, .bordered, .stroke-title, .banner-el, .separator')
	updateRects()
}

// Fonction pour mettre à jour le cache des rectangles
function updateRects() {
	elementRects = Array.from(elements || []).map(el => ({
		el,
		rect: el.getBoundingClientRect()
	}))
	lastResizeTime = Date.now()
}

// resize - recalculer les rectangles
function resize() {
	if (elements) {
		updateRects()
	}
}

// mousemove
function mousemove(e) {
	if (!isTicking && elementRects) {
		// Recalculer si le cache est trop vieux
		if (Date.now() - lastResizeTime > RECT_CACHE_DURATION) {
			updateRects()
		}

		window.requestAnimationFrame(() => {
			const winHeight = window.innerHeight
			elementRects.forEach(({ el, rect }) => {
				// Skip si hors écran (optim majeure)
				if (rect.bottom < 0 || rect.top > winHeight) return
				const x = e.clientX - rect.left
				const y = e.clientY - rect.top
				el.style.setProperty('--x', `${x}px`)
				el.style.setProperty('--y', `${y}px`)
			})
			isTicking = false
		})
		isTicking = true
	}
}

const glareEffect = new Effect()
glareEffect.smallScreen = true
glareEffect.mousemove = mousemove
glareEffect.resize = resize
glareEffect.load = load

export default glareEffect
