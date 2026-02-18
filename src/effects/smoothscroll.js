import Lenis from 'lenis'
import { Effect } from '../app/effects.js'

let lenis = null
const isSafari =
	/constructor/i.test(window.HTMLElement) ||
	(function (p) {
		return p.toString() === '[object SafariRemoteNotification]'
	})(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification))

function init() {
	// Sécurité : Nettoyage préventif
	if (lenis) smoothScrollEffect.cleanup()

	// 1. Création de l'instance
	lenis = new Lenis({
		duration: 1.2,
		easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
		direction: 'vertical',
		smooth: true,
		smoothTouch: false // On désactive le lissage tactile (souvent buggé/lourd)
	})

	// 2. Hack pour forcer Lenis à reconnaitre la page immédiatement
	// Parfois au switch mobile->desktop, le DOM n'est pas encore "calé"
	window.requestAnimationFrame(() => {
		if (lenis) {
			lenis.resize()
			lenis.start()
		}
	})

	// Expose globalement pour debug ou usage externe
	window.lenis = lenis
}

function update(time) {
	if (lenis) {
		lenis.raf(time)
	}
}

function resize() {
	// Indispensable quand on redimensionne la fenêtre
	if (lenis) {
		lenis.resize()
	}
}

function cleanup() {
	if (lenis) {
		lenis.destroy()
		lenis = null
		window.lenis = null
	}
}

const smoothScrollEffect = new Effect()

if (!isSafari) {
	smoothScrollEffect.mobile = false
	smoothScrollEffect.smallScreen = false
	smoothScrollEffect.init = init
	smoothScrollEffect.update = update
	smoothScrollEffect.resize = resize
	smoothScrollEffect.cleanup = cleanup
}

export default smoothScrollEffect
