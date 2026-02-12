import { Effect } from '../app/effects.js'
import { DATA as DRAWINGS_DATA } from '../paint/script.js'
import { DATA as PRINTS_DATA } from '../print/script.js'

// utils

const DATA = {
	drawing: DRAWINGS_DATA,
	print: PRINTS_DATA
}

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

let swiperThumbs = null
let swiperMain = null
let previewCards = []
let cardClickHandlers = new Map() // Stocker les handlers pour pouvoir les nettoyer

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

// load
function load() {
	document.body.appendChild(popup)
	setTimeout(() => {
		previewCards = Array.from(document.querySelectorAll('.preview'))
		previewCards.forEach(card => {
			const handler = () => onClick(card)
			cardClickHandlers.set(card, handler)
			card.addEventListener('click', handler)
		})
	}, 500)
}

// cleanup
function cleanup() {
	// Nettoyer les event listeners
	previewCards.forEach(card => {
		const handler = cardClickHandlers.get(card)
		if (handler) {
			card.removeEventListener('click', handler)
		}
	})
	cardClickHandlers.clear()
	previewCards = []

	// Détruire les swipers
	if (swiperThumbs) {
		swiperThumbs.destroy(true, true)
		swiperThumbs = null
	}
	if (swiperMain) {
		swiperMain.destroy(true, true)
		swiperMain = null
	}

	// Retirer le popup du DOM
	if (popup.parentNode) {
		popup.parentNode.removeChild(popup)
	}
}

const popupEffect = new Effect()
popupEffect.mobile = true
popupEffect.smallScreen = true
popupEffect.load = load
popupEffect.cleanup = cleanup

export default popupEffect
