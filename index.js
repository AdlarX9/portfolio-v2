import { createIndexProgramCards } from '../code/script.js'
import { bezier } from '../lib/bezier-easing.js'
import { createColumns, createStars } from './app/effects.js'

const stars = document.querySelector('.stars')
if (stars) {
	createStars(stars, 150)
}

const canvas = document.getElementById('renderSurface')

if (canvas && typeof Fluid !== 'undefined') {
	let myFluid = new Fluid(canvas)
	myFluid.mapBehaviors({
		sim_resolution: 256,
		dye_resolution: 512,

		paused: false,
		embedded_dither: true,

		dissipation: 0.97,
		velocity: 0.98,
		pressure: 0.8,
		pressure_iteration: 20,
		curl: 10,
		emitter_size: 256 / Math.max(canvas.width, canvas.height),

		render_shaders: true,
		multi_color: true,

		render_bloom: false,
		bloom_iterations: 8,
		bloom_resolution: 256,
		intensity: 0.8,
		threshold: 0.6,
		soft_knee: 0.7,

		background_color: { r: 13, g: 6, b: 26 },
		transparent: false
	})

	document.addEventListener('mousemove', e => {
		const rect = canvas.getBoundingClientRect()
		// Position actuelle de la souris
		const x = e.clientX - rect.left
		const y = e.clientY - rect.top

		if (myFluid.pointers && myFluid.pointers.length > 0) {
			const pointer = myFluid.pointers[0]
			pointer.dx = (x - pointer.x) * 5.0
			pointer.dy = (y - pointer.y) * 5.0
			pointer.x = x
			pointer.y = y
			pointer.down = true
			pointer.moved = true
			pointer.color = {
				r: 0.15,
				g: 0.1,
				b: 0.2
			}
		}
	})
	myFluid.activate()
}

const banners = document.querySelectorAll('.banner')
const LANGUAGES = [
	'html5',
	'css3',
	'javascript',
	'php',
	'python',
	'cplusplus',
	'swift',
	'c',
	'go',
	'typescript',
	'rust',
	'mysql',
	'postgresql',
	'bash',
	'docker',
	'git',
	'react'
]

for (let i = 0; i < 2; i++) {
	LANGUAGES.forEach(language => {
		const el = document.createElement('div')
		el.classList.add('banner-el')
		const url = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${language}/${language}-original.svg`
		el.innerHTML = `<img src="${url}" alt="${language} logo" />${language === 'cplusplus' ? 'c++' : language}`
		banners.forEach(banner => banner.appendChild(el.cloneNode(true)))
	})
}

// === BANNER EL GLARE ===
// Doit être après la création des éléments banner-el

const bannerEls = document.querySelectorAll('.banner-el')

let bannerGlareMouseX = 0
let bannerGlareMouseY = 0
let bannerGlareIsTicking = false

function updateBannerGlares() {
	bannerEls.forEach(el => {
		const rect = el.getBoundingClientRect()

		// Si l'élément n'est pas visible à l'écran, on saute le calcul (Perf++)
		if (rect.bottom < 0 || rect.top > window.innerHeight) return

		// Calcul position relative
		const x = bannerGlareMouseX - rect.left
		const y = bannerGlareMouseY - rect.top

		// Injection CSS
		el.style.setProperty('--x', `${x}px`)
		el.style.setProperty('--y', `${y}px`)
	})
}

// Tracking global de la souris
window.addEventListener('mousemove', e => {
	bannerGlareMouseX = e.clientX
	bannerGlareMouseY = e.clientY

	if (!bannerGlareIsTicking) {
		window.requestAnimationFrame(() => {
			updateBannerGlares()
			bannerGlareIsTicking = false
		})
		bannerGlareIsTicking = true
	}
})

const DELTA_ANGLE = 30

function positionCards(cards, angle = DELTA_ANGLE) {
	const RADIUS = 2 * 800
	cards.forEach((card, i) => {
		const coordX = RADIUS * Math.sin((((i - 1) * DELTA_ANGLE + angle) * Math.PI) / 180)
		const coordZ = -RADIUS * (1 - Math.cos((((i - 1) * DELTA_ANGLE + angle) * Math.PI) / 180))
		card.style.transform = `translateX(${coordX}px) translateZ(${coordZ}px) rotate3d(0, 1, 0, ${(i - 1) * DELTA_ANGLE + angle}deg)`
	})
}

const cards = document.querySelectorAll('#card')
const easing = bezier(0.29, 0, 0.66, 0.99)
positionCards(cards)

gsap.registerPlugin(ScrollTrigger)
let mm = gsap.matchMedia()

const programsSection = document.getElementById('program-cards')
createIndexProgramCards(programsSection)

mm.add('(min-width: 768px)', () => {
	ScrollTrigger.create({
		trigger: '.main-cards',
		start: 'center center',
		endTrigger: '.main-cards',
		end: 'bottom top',
		pin: true,
		scrub: true,
		markers: false, // dev
		onUpdate: self => {
			positionCards(cards, -easing(self.progress) * 60 + 30)
		}
	})

	const programs = document.querySelector('.programs')
	const columns = createColumns(programs, 40)
	let lastTime = new Date().getTime()
	function animateColumns() {
		const currentTime = new Date().getTime()
		const deltaTime = currentTime - lastTime
		lastTime = currentTime
		columns.forEach(column => {
			column.update(deltaTime)
		})
		columns.forEach(column => {
			column.render()
		})
		requestAnimationFrame(animateColumns)
	}
	window.addEventListener('load', () => {
		animateColumns()
	})

	ScrollTrigger.create({
		pin: '#dc-2',
		trigger: '#dc-1',
		start: 'top center',
		end: 'bottom center',
		pinSpacing: true,
		markers: false
	})

	ScrollTrigger.create({
		pin: '#dc-3',
		trigger: '#dc-1',
		start: 'top center',
		endTrigger: '#dc-1',
		end: () => `bottom center-=${document.querySelector('#dc-2').offsetHeight}`,
		pinSpacing: true,
		markers: false
	})

	return () => {}
})

const drawingsCards = document.querySelectorAll('.drawing-card')
drawingsCards.forEach(card => {
	card.classList.add('preview')
	const overlay = document.createElement('button')
	overlay.dataset.type = 'drawings'
	overlay.classList.add('overlay')
	overlay.innerHTML = '<div class="white body">See more details</div>'
	card.appendChild(overlay)
})

const printingCards = document.querySelectorAll('.printing-el')
printingCards.forEach(card => {
	card.classList.add('preview')
	const overlay = document.createElement('button')
	overlay.dataset.type = 'prints'
	overlay.classList.add('overlay')
	overlay.innerHTML = '<div class="view-more-prints white body">See more details</div>'
	card.appendChild(overlay)
})

const turbulence = document.querySelector('feTurbulence')

function animateGlitch() {
	const freq = Math.random() < 0.1 ? 0.01 : Math.random() * 0.4

	turbulence.setAttribute('baseFrequency', `0 ${freq}`)

	requestAnimationFrame(animateGlitch)
}
animateGlitch()

const elements = document.querySelectorAll('.scatter-text')
let allLetters = []

// 1. SETUP DOM (Inchangé)
elements.forEach(element => {
	const text = element.textContent.trim()
	element.innerHTML = ''
	const words = text.split(/\s+/)
	words.forEach(wordText => {
		const wordWrapper = document.createElement('span')
		wordWrapper.classList.add('word-wrapper')
		wordText.split('').forEach(char => {
			const span = document.createElement('span')
			span.classList.add('letter')
			span.textContent = char
			wordWrapper.appendChild(span)
			allLetters.push({
				element: span,
				rect: null,
				x: 0,
				y: 0,
				currentX: 0,
				currentY: 0
			})
		})
		element.appendChild(wordWrapper)
	})
})

let mouse = { x: -1000, y: -1000 }
const RADIUS = 150
const FORCE = 100

// 2. Tracking souris (Inchangé)
window.addEventListener('mousemove', e => {
	mouse.x = e.clientX
	mouse.y = e.clientY
})

// 3. Mise à jour des positions (Optimisée)
function updateRects() {
	allLetters.forEach(letter => {
		letter.rect = letter.element.getBoundingClientRect()
		letter.x = letter.rect.left + letter.rect.width / 2
		letter.y = letter.rect.top + letter.rect.height / 2
	})
}
window.addEventListener('resize', updateRects)
window.addEventListener('scroll', updateRects, { passive: true })

// Init initial
setTimeout(updateRects, 100)

function animate() {
	allLetters.forEach(letter => {
		const dx = mouse.x - letter.x
		const dy = mouse.y - letter.y
		const distance = Math.sqrt(dx * dx + dy * dy)
		let targetX = 0
		let targetY = 0
		if (distance < RADIUS) {
			const angle = Math.atan2(dy, dx)
			const spread = (RADIUS - distance) / RADIUS
			targetX = -Math.cos(angle) * spread * FORCE
			targetY = -Math.sin(angle) * spread * FORCE
		}
		letter.currentX += (targetX - letter.currentX) * 0.1
		letter.currentY += (targetY - letter.currentY) * 0.1
		if (Math.abs(letter.currentX) > 0.05 || Math.abs(letter.currentY) > 0.05) {
			letter.element.style.transform = `translate(${letter.currentX}px, ${letter.currentY}px)`
		}
	})

	requestAnimationFrame(animate)
}

animate()
