// === INTRO ===

import { createIndexProgramCards } from '../code/script.js'
import { bezier } from '../lib/bezier-easing.js'
import { createColumns, createStars } from './app/effects.js'
import { isBigScreen, manageEffects } from './app/main.js'

// === STARS BACKGROUND ===

const stars = document.querySelector('.stars')
if (stars) {
	createStars(stars, 150)
}

// === FLUID SIMULATION ===

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

// === BANNER GENERATION ===

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

manageEffects()

// === MAIN CARDS POSITIONNING ===

const DELTA_ANGLE = 30
function getCardWidth() {
    const valVW = window.innerWidth * 0.80; 
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const valREM = rootFontSize * 50;
    return Math.min(valVW, valREM);
}

function positionCards(cards, angle = DELTA_ANGLE) {
	const RADIUS = 2 * getCardWidth()
	cards.forEach((card, i) => {
		const coordX = RADIUS * Math.sin((((i - 1) * DELTA_ANGLE + angle) * Math.PI) / 180)
		const coordZ = -RADIUS * (1 - Math.cos((((i - 1) * DELTA_ANGLE + angle) * Math.PI) / 180))
		card.style.transform = `translateX(${coordX}px) translateZ(${coordZ}px) rotate3d(0, 1, 0, ${(i - 1) * DELTA_ANGLE + angle}deg)`
	})
}

const cards = document.querySelectorAll('#card')
const easing = bezier(0.29, 0, 0.66, 0.99)
positionCards(cards)

// === PROGRAM CARDS GENERATION ===

const programsSection = document.getElementById('program-cards')
createIndexProgramCards(programsSection)

// === MATRIX EFFECT ===

const programs = document.querySelector('.programs')
let columns = null
let lastTime = null
let animationID = null
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
	animationID = requestAnimationFrame(animateColumns)
}
window.addEventListener('load', handleMatrixEffect)

function handleMatrixEffect() {
	if (isBigScreen.matches) {
		lastTime = new Date().getTime()
		columns = createColumns(programs, 40)
		animateColumns()
	} else {
		columns.forEach(column => column.destroy())
		cancelAnimationFrame(animationID)
	}
}

isBigScreen.addEventListener('change', handleMatrixEffect)

// === PREVIEW CARDS OVERLAY GENERATION ===

const printingCards = document.querySelectorAll('.printing-el')
printingCards.forEach(card => {
	card.classList.add('preview')
	const overlay = document.createElement('button')
	overlay.dataset.type = 'prints'
	overlay.classList.add('overlay')
	overlay.innerHTML = '<div class="view-more-prints white body">See more details</div>'
	card.appendChild(overlay)
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

// === GLITCH EFFECT ===

const turbulence = document.querySelector('feTurbulence')
function animateGlitch() {
	const freq = Math.random() < 0.1 ? 0.01 : Math.random() * 0.4

	turbulence.setAttribute('baseFrequency', `0 ${freq}`)

	requestAnimationFrame(animateGlitch)
}
animateGlitch()

// === SCROLL TRIGGERS ===

gsap.registerPlugin(ScrollTrigger)
let mm = gsap.matchMedia()
mm.add('(min-width: 768px)', () => {
	// MAIN CARDS SCROLL ANIMATION
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

	// DRAWINGS SCROLL ANIMATION
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
