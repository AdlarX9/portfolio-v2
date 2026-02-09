// === MAIN ===

import { hackerEffect } from './effects.js'
import { DATA as DRAWINGS_DATA } from '../paint/script.js'
import { DATA as PRINTS_DATA } from '../print/script.js'

const DATA = {
	drawing: DRAWINGS_DATA,
	print: PRINTS_DATA
}

// === SMOOTH SCROLL ===

const lenis = new Lenis()
function raf(time) {
	lenis.raf(time)
	requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

const hackerWords = document.querySelectorAll('#hacker')

hackerWords.forEach(word => {
	word.addEventListener('load', hackerEffect(word))
})

// === POPUP ===

const popup = document.createElement('div')
popup.classList.add('popup')
popup.onclick = e => {
	if (!e.target.matches('img') && !e.target.matches('button')) {
		closePopup()
	}
}

function closePopup() {
	const swiperContainers = document.querySelectorAll('.swiper')
	swiperContainers.forEach(element => {
		if (element.swiper) {
			element.swiper.destroy(true, true)
		}
	})

	popup.innerHTML = ''
	popup.style.display = 'none'
}

let swiperThumbs
let swiperMain

function createSlides(type, id, format) {
	const data = DATA[type][id]
	let slides = ''
	if (data.number > 1) {
		for (let i = data.number; i >= 1; i--) {
			slides += `
				<div class="swiper-slide ${format === 'big' ? 'big-slide' : 'small-slide'}">
					<img src="/assets/${type}s/high/${id}/${i}.jpeg" />
				</div>
			`
		}
	} else {
		slides = `
			<div class="swiper-slide ${format === 'big' ? 'big-slide' : 'small-slide'}">
				<img src="/assets/${type}s/high/${id}.jpeg" />
			</div>
		`
	}
	return slides
}

function createPopupContent(type, id) {
	const bigSlides = createSlides(type, id, 'big')
	const smallSlides = createSlides(type, id, 'small')
	return `
		<div class="close-btn-popup">X</div>
        <div class="swiper big-slider">
            <div class="swiper-wrapper">
                ${bigSlides}
            </div>
            <button class="swiper-button-next"></button>
            <button class="swiper-button-prev"></button>
        </div>
        <div thumbsSlider="" class="swiper small-slider">
            <div class="swiper-wrapper">
                ${smallSlides}
            </div>
        </div>
	`
}

function onClick(card) {
	const type = card.dataset.type
	const id = card.dataset.id
	const content = createPopupContent(type, id)
	popup.innerHTML = content
	popup.style.display = 'flex'

	if (swiperThumbs) swiperThumbs.destroy()
	if (swiperMain) swiperMain.destroy()

	swiperThumbs = new Swiper('.small-slider', {
		spaceBetween: 10,
		slidesPerView: 4,
		freeMode: true,
		watchSlidesProgress: true
	})

	swiperMain = new Swiper('.big-slider', {
		spaceBetween: 10,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev'
		},
		thumbs: {
			swiper: swiperThumbs
		}
	})
}

document.body.appendChild(popup)
setTimeout(() => {
	document.querySelectorAll('.preview').forEach(card => {
		card.addEventListener('click', () => {
			onClick(card)
		})
	})
}, 500)

// === CURSOR ===

const cursor = document.createElement('div')
cursor.classList.add('glass-cursor')
document.body.appendChild(cursor)
document.addEventListener('mousemove', e => {
	cursor.style.left = e.clientX + 'px'
	cursor.style.top = e.clientY + 'px'
})
document.querySelectorAll('a, button, .clickable').forEach(el => {
	el.addEventListener('mouseenter', () => cursor.classList.add('hovered'))
	el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'))
})

// === STROKE GLARE ===

const titles = document.querySelectorAll('.stroke-title')
let mouseX = 0
let mouseY = 0
let isTicking = false // optimisation

window.addEventListener('mousemove', e => {
	mouseX = e.clientX
	mouseY = e.clientY

	if (!isTicking) {
		window.requestAnimationFrame(() => {
			updateGlares()
			isTicking = false
		})
		isTicking = true
	}
})

function updateGlares() {
	titles.forEach(title => {
		const rect = title.getBoundingClientRect()
		if (rect.bottom < 0 || rect.top > window.innerHeight) return
		const x = mouseX - rect.left
		const y = mouseY - rect.top
		title.style.setProperty('--x', `${x}px`)
		title.style.setProperty('--y', `${y}px`)
	})
}

// === BORDERED ===

// Sélection de tous les éléments bordés
const borderedElements = document.querySelectorAll('.bordered')

let glaredMouseX = 0
let glaredMouseY = 0
let isBorderTicking = false

window.addEventListener('mousemove', e => {
	glaredMouseX = e.clientX
	glaredMouseY = e.clientY

	if (!isBorderTicking) {
		window.requestAnimationFrame(() => {
			updateBorders()
			isBorderTicking = false
		})
		isBorderTicking = true
	}
})

function updateBorders() {
	borderedElements.forEach(el => {
		const rect = el.getBoundingClientRect()

		// Optimisation : On ne calcule pas si l'élément est hors écran
		if (rect.bottom < 0 || rect.top > window.innerHeight) return

		// Calcul des coordonnées relatives à la carte
		const x = glaredMouseX - rect.left
		const y = glaredMouseY - rect.top

		// Mise à jour des variables CSS
		el.style.setProperty('--x', `${x}px`)
		el.style.setProperty('--y', `${y}px`)
	})
}

// === TEXT GLARE ===

// On cible toutes les classes qui ont besoin de l'effet glare
const glareElements = document.querySelectorAll('.text-glare, .bordered, .stroke-title')

let textGlareMouseX = 0
let textGlareMouseY = 0
let textGlareIsTicking = false

// Tracking global de la souris
window.addEventListener('mousemove', e => {
	textGlareMouseX = e.clientX
	textGlareMouseY = e.clientY

	if (!textGlareIsTicking) {
		window.requestAnimationFrame(() => {
			updateAllGlares()
			textGlareIsTicking = false
		})
		textGlareIsTicking = true
	}
})

function updateAllGlares() {
	glareElements.forEach(el => {
		const rect = el.getBoundingClientRect()

		// Si l'élément n'est pas visible à l'écran, on saute le calcul (Perf++)
		if (rect.bottom < 0 || rect.top > window.innerHeight) return

		// Calcul position relative
		const x = textGlareMouseX - rect.left
		const y = textGlareMouseY - rect.top

		// Injection CSS
		el.style.setProperty('--x', `${x}px`)
		el.style.setProperty('--y', `${y}px`)
	})
}

// === SCROLLBAR ===

const track = document.querySelector('.cyber-scrollbar-track')
const thumb = document.querySelector('.cyber-scrollbar-thumb')

let isDragging = false
let startY = 0
let startScrollTop = 0

// 1. Calcul de la hauteur du thumb (Proportionnel au contenu)
function updateThumbSize() {
	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight

	// Si la page est petite, la barre est grande, et inversement.
	// On met une taille min de 50px pour que ce soit attrapable.
	let thumbHeight = Math.max((winHeight / docHeight) * winHeight, 50)

	// Si la page est plus petite que l'écran, on cache la barre
	if (docHeight <= winHeight) thumbHeight = 0

	thumb.style.height = `${thumbHeight}px`
}

// 2. Mise à jour de la position lors du scroll
function updateThumbPosition() {
	if (isDragging) return // Si on drag, c'est la souris qui décide

	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	const scrollTop = window.scrollY

	// Hauteur disponible pour le mouvement du thumb
	const trackHeight = winHeight
	const thumbHeight = parseFloat(thumb.style.height)

	// Pourcentage de scroll (0 à 1)
	const scrollPercent = scrollTop / (docHeight - winHeight)

	// Position en pixels
	// On retire la taille du thumb pour ne pas qu'il sorte en bas
	const thumbY = scrollPercent * (trackHeight - thumbHeight)

	// Utilisation de translate3d pour la perf GPU
	thumb.style.transform = `translate3d(0, ${thumbY}px, 0)`
}

// 3. Logique de Drag & Drop (Cliquer et tirer la barre)
thumb.addEventListener('mousedown', e => {
	isDragging = true
	track.classList.add('grabbing') // Pour le style CSS
	startY = e.clientY
	startScrollTop = window.scrollY

	// Important: empêcher la sélection de texte pendant le drag
	document.body.style.userSelect = 'none'
})

window.addEventListener('mouseup', () => {
	isDragging = false
	track.classList.remove('grabbing')
	document.body.style.userSelect = ''
})

window.addEventListener('mousemove', e => {
	if (!isDragging) return

	// Calcul du déplacement de la souris
	const deltaY = e.clientY - startY

	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	const thumbHeight = parseFloat(thumb.style.height)

	// Ratio : Combien de pixels de page pour 1 pixel de barre ?
	const scrollableHeight = docHeight - winHeight
	const trackableHeight = winHeight - thumbHeight
	const ratio = scrollableHeight / trackableHeight

	// On scrolle la page
	window.scrollTo(0, startScrollTop + deltaY * ratio)

	// On met à jour visuellement la barre tout de suite pour éviter le lag
	// (Le scroll event le ferait aussi, mais moins fluide en drag)
	const thumbY = Math.min(
		Math.max(0, ((startScrollTop + deltaY * ratio) / scrollableHeight) * trackableHeight),
		trackableHeight
	)
	thumb.style.transform = `translate3d(0, ${thumbY}px, 0)`
})

// Initialisation et Events
window.addEventListener('resize', () => {
	updateThumbSize()
	updateThumbPosition()
})
window.addEventListener('scroll', () => {
	window.requestAnimationFrame(updateThumbPosition)
})

// Init
updateThumbSize()
