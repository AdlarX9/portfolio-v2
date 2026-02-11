import { Effect } from '../app/effects.js'

let lenis = null

const smoothScrollEffect = new Effect()

// CONFIGURATION CRUCIALE :
// On met false pour que le Manager appelle cleanup() quand on est sur mobile
// et init() quand on revient sur Desktop. C'est ce "reboot" qui corrige le bug.
smoothScrollEffect.mobile = false
smoothScrollEffect.smallScreen = false

smoothScrollEffect.init = () => {
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

smoothScrollEffect.update = time => {
	if (lenis) {
		lenis.raf(time)
	}
}

smoothScrollEffect.resize = () => {
	// Indispensable quand on redimensionne la fenêtre
	if (lenis) {
		lenis.resize()
	}
}

smoothScrollEffect.cleanup = () => {
	if (lenis) {
		lenis.destroy()
		lenis = null
		window.lenis = null
	}
}

export default smoothScrollEffect
