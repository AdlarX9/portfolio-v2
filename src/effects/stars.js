import { Effect, effectManager } from '../app/effects.js'

// utils
const container = document.querySelector('.stars')
const safariContainer = document.querySelector('.stars-safari')
const COUNT_DESKTOP = 150
const COUNT_MOBILE = 75 // Moins d'étoiles sur mobile pour la performance
const isSafari =
	/constructor/i.test(window.HTMLElement) ||
	(function (p) {
		return p.toString() === '[object SafariRemoteNotification]'
	})(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification))

function createStars(factor = 1) {
	const count = (effectManager.isMobile.matches ? COUNT_MOBILE : COUNT_DESKTOP) * factor
	const fragment = document.createDocumentFragment() // Batch DOM insertion

	for (let i = 0; i < count; i++) {
		const star = document.createElement('div')
		star.classList.add('star')
		const x = Math.random() * 100
		const y = Math.random() * 100
		star.style.left = `${x}%`
		star.style.top = `${y}%`

		// Délai aléatoire pour désynchroniser les animations
		const twinkleDelay = Math.random() * 5
		const twinkleDuration = 2 + Math.random() * 3
		star.style.animationDelay = `${twinkleDelay}s`
		star.style.animationDuration = `${twinkleDuration}s`

		// Mouvement lent aléatoire
		const moveDelay = Math.random() * 10
		const moveDuration = 40 + Math.random() * 30
		const moveDistance = 20 + Math.random() * 30
		const angle = Math.random() * Math.PI * 2

		star.style.setProperty('--move-delay', `${moveDelay}s`)
		star.style.setProperty('--move-duration', `${moveDuration}s`)
		star.style.setProperty('--move-x', `${Math.cos(angle) * moveDistance}px`)
		star.style.setProperty('--move-y', `${Math.sin(angle) * moveDistance}px`)

		fragment.appendChild(star)
	}

	return fragment
}

// init
function init() {
	if (container) {
		const fragment = createStars()
		container.appendChild(fragment)
	}
	if (isSafari && safariContainer) {
		const fragment = createStars(2)
		safariContainer.appendChild(fragment)
	}
}

// cleanup
function cleanup() {
	container.innerHTML = ''
}

const starsEffect = new Effect()
starsEffect.mobile = true
starsEffect.init = init
starsEffect.cleanup = cleanup

export default starsEffect
