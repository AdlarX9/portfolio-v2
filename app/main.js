// === MAIN ===

import {
	animateScatterEffect,
	hackerEffect,
	setupScatterElements,
	stopScatterEffect,
	trackMouseForScatterEffect,
	updateGlareEffects,
	updateRects
} from './effects.js'
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
window.addEventListener('mousemove', (e) => {
    // 1. On récupère TOUS les éléments sous la souris à cette position
    const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
    
    // 2. On vérifie si L'UN d'eux est un élément interactif
    // On cherche si dans la pile, il y a un <a>, un <button> ou un .clickable
    const isHoveringClickable = elementsUnder.some(el => {
        return el.matches('a, button, .clickable') || el.closest('a, button, .clickable');
    });

    // 3. On applique la classe
    if (isHoveringClickable) {
        cursor.classList.add('hovered');
    } else {
        cursor.classList.remove('hovered');
    }
});

// === GLARE ===

let glareElements = null
function reactGlareEffect(e) {
	updateGlareEffects(glareElements, e)
}
function setupGlareEffects() {
	glareElements = document.querySelectorAll('.text-glare, .bordered, .stroke-title, .banner-el, .separator')
	window.addEventListener('mousemove', reactGlareEffect)
}
function removeGlareEffects() {
	window.removeEventListener('mousemove', reactGlareEffect)
}

// === SCROLLBAR ===

const track = document.querySelector('.cyber-scrollbar-track')
const thumb = document.querySelector('.cyber-scrollbar-thumb')

let isDragging = false
let startY = 0
let startScrollTop = 0

function updateThumbSize() {
	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	let thumbHeight = Math.max((winHeight / docHeight) * winHeight, 50)
	if (docHeight <= winHeight) thumbHeight = 0
	thumb.style.height = `${thumbHeight}px`
}

function updateThumbPosition() {
	if (isDragging) return

	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	const scrollTop = window.scrollY
	const trackHeight = winHeight
	const thumbHeight = parseFloat(thumb.style.height)
	const scrollPercent = scrollTop / (docHeight - winHeight)
	const thumbY = scrollPercent * (trackHeight - thumbHeight)
	thumb.style.transform = `translate3d(0, ${thumbY}px, 0)`
}

thumb.addEventListener('mousedown', e => {
	isDragging = true
	track.classList.add('grabbing')
	startY = e.clientY
	startScrollTop = window.scrollY
	document.body.style.userSelect = 'none'
})

window.addEventListener('mouseup', () => {
	isDragging = false
	track.classList.remove('grabbing')
	document.body.style.userSelect = ''
})
window.addEventListener('mousemove', e => {
	if (!isDragging) return
	const deltaY = e.clientY - startY
	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	const thumbHeight = parseFloat(thumb.style.height)
	const scrollableHeight = docHeight - winHeight
	const trackableHeight = winHeight - thumbHeight
	const ratio = scrollableHeight / trackableHeight
	window.scrollTo(0, startScrollTop + deltaY * ratio)
	const thumbY = Math.min(
		Math.max(0, ((startScrollTop + deltaY * ratio) / scrollableHeight) * trackableHeight),
		trackableHeight
	)
	thumb.style.transform = `translate3d(0, ${thumbY}px, 0)`
})
window.addEventListener('resize', () => {
	updateThumbSize()
	updateThumbPosition()
})
window.addEventListener('scroll', () => {
	window.requestAnimationFrame(updateThumbPosition)
})
updateThumbSize()

// === SCATTER EFFECT ===

const scatterElements = document.querySelectorAll('.scatter-text')

// === HACKER EFFECT ===

const hackerWords = document.querySelectorAll('#hacker')
function initHackerEffect() {
	hackerWords.forEach(word => {
		hackerEffect(word)
	})
}

// === OPTIMIZATION ===

// condition for effects to be enabled
export const isEnabled = window.matchMedia('(min-width: 768px) and (hover: hover)')
export const isBigScreen = window.matchMedia('(min-width: 768px)')

export function manageEffects() {
	if (isEnabled.matches) {
		setupGlareEffects()

		setupScatterElements(scatterElements)
		window.addEventListener('mousemove', trackMouseForScatterEffect)
		window.addEventListener('resize', updateRects)
		window.addEventListener('scroll', updateRects, { passive: true })
		setTimeout(updateRects, 100)
		animateScatterEffect()

		window.addEventListener('load', initHackerEffect)
	} else {
		removeGlareEffects()

		window.removeEventListener('mousemove', trackMouseForScatterEffect)
		window.removeEventListener('resize', updateRects)
		window.removeEventListener('scroll', updateRects)
		stopScatterEffect()

		window.removeEventListener('load', initHackerEffect)
	}
}

isEnabled.addEventListener('change', manageEffects)
