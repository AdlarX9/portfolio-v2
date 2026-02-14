import { Effect } from '../app/effects.js'

// --- STATE ---
let track = null
let thumb = null
let isDragging = false
let startY = 0
let startScrollTop = 0
let mouseDownHandler = null // On stocke la réf pour pouvoir removeEventListener

// --- LOGIC ---
function updateThumbSize() {
	if (!thumb || !track) return

	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight

	// Si la page est plus petite que l'écran, on cache
	if (docHeight <= winHeight) {
		thumb.style.height = '0px'
		thumb.style.display = 'none'
		return
	}

	thumb.style.display = 'block'

	// Calcul de la hauteur
	let thumbHeight = Math.max((winHeight / docHeight) * winHeight, 50)
	thumb.style.height = `${thumbHeight}px`
}

function updateThumbPosition() {
	if (!thumb || !track || isDragging) return

	// Utilise Lenis si disponible, sinon window.scrollY
	const scrollTop = window.lenis ? window.lenis.scroll : window.scrollY

	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight

	const trackHeight = winHeight
	const thumbHeight = parseFloat(thumb.style.height) || 0

	// Sécurité division par zéro
	const scrollableDistance = docHeight - winHeight
	if (scrollableDistance <= 0) return

	const scrollPercent = scrollTop / scrollableDistance
	const thumbY = scrollPercent * (trackHeight - thumbHeight)

	thumb.style.transform = `translate3d(0, ${thumbY}px, 0)`
}

const scrollbarEffect = new Effect()

// Généralement, on DÉSACTIVE les customs scrollbars sur mobile (UX horrible)
// Je te conseille de mettre mobile = false. Le code gérera le nettoyage.
scrollbarEffect.mobile = false
scrollbarEffect.smallScreen = false

// --- LIFECYCLE ---

scrollbarEffect.init = () => {
	// 1. Création de la scrollbar
	track = document.createElement('div')
	track.classList.add('cyber-scrollbar-track')
	thumb = document.createElement('div')
	thumb.classList.add('cyber-scrollbar-thumb')
	track.appendChild(thumb)
	document.body.appendChild(track)

	if (!track || !thumb) return

	// On s'assure qu'elle est visible (au cas où cleanup l'aurait cachée)
	track.style.display = 'block'
	track.style.opacity = '1'

	// 2. Event Listener propre
	mouseDownHandler = e => {
		isDragging = true
		track.classList.add('grabbing')
		startY = e.clientY
		startScrollTop = window.lenis ? window.lenis.scroll : window.scrollY
		document.body.style.userSelect = 'none'
		e.preventDefault() // Évite de sélectionner du texte
	}
	thumb.addEventListener('mousedown', mouseDownHandler)

	// 3. Calcul initial - On attend 2 frames pour être sûr que le DOM est rendu
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			updateThumbSize()
			updateThumbPosition()
		})
	})
}

scrollbarEffect.cleanup = () => {
	// C'est ICI que la magie opère pour le switch mobile/desktop
	if (thumb && mouseDownHandler) {
		thumb.removeEventListener('mousedown', mouseDownHandler)
	}

	// On cache visuellement la scrollbar custom pour laisser la native du mobile
	if (track) {
		track.style.display = 'none'
	}

	isDragging = false
	document.body.style.userSelect = ''
	if (track) track.classList.remove('grabbing')
}

scrollbarEffect.resize = () => {
	updateThumbSize()
	updateThumbPosition()
}

scrollbarEffect.scroll = () => {
	// Pas besoin de requestAnimationFrame ici car 'scroll' est déjà souvent throttled
	// ou appelé dans une boucle de rendu. Direct update pour éviter le lag visuel.
	updateThumbPosition()
}

// --- GLOBAL EVENTS (Managed by Manager) ---

scrollbarEffect.mouseup = () => {
	if (isDragging) {
		isDragging = false
		if (track) track.classList.remove('grabbing')
		document.body.style.userSelect = ''
	}
}

scrollbarEffect.mousemove = e => {
	if (!isDragging || !thumb) return

	const deltaY = e.clientY - startY
	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	const thumbHeight = parseFloat(thumb.style.height) || 0

	const scrollableHeight = docHeight - winHeight
	const trackableHeight = winHeight - thumbHeight

	// Sécurité mathématique
	if (trackableHeight <= 0) return

	const ratio = scrollableHeight / trackableHeight
	const newScrollPosition = startScrollTop + deltaY * ratio

	// Utilise Lenis si disponible, sinon window.scrollTo
	if (window.lenis) {
		window.lenis.scrollTo(newScrollPosition, { immediate: true })
	} else {
		window.scrollTo(0, newScrollPosition)
	}

	// On met à jour le thumb visuellement tout de suite (plus fluide)
	const newThumbY = Math.min(Math.max(0, (newScrollPosition / scrollableHeight) * trackableHeight), trackableHeight)
	thumb.style.transform = `translate3d(0, ${newThumbY}px, 0)`
}

export default scrollbarEffect
