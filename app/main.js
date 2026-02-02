import { hackerEffect } from './effects.js'
import { DATA as DRAWINGS_DATA } from '../paint/script.js'
import { DATA as PRINTS_DATA } from '../print/script.js'

const DATA = {
	drawing: DRAWINGS_DATA,
	print: PRINTS_DATA
}

// smooth scroll
const lenis = new Lenis()

// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
	lenis.raf(time)
	requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

const hackerWords = document.querySelectorAll('#hacker')

hackerWords.forEach(word => {
	word.addEventListener('load', hackerEffect(word))
})

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
