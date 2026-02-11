// === INTRO ===

import { createIndexProgramCards } from '../code/script.js'
import { bezier } from '../lib/bezier-easing.js'
import { Effect, effectManager } from './app/effects.js'
import {
	fluidEffect,
	distortionEffect,
	matrixEffect,
	rectanglesEffect,
	starsEffect,
	lightningEffect
} from './effects/index.js'

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

// === CARDS STUFF ===

const DELTA_ANGLE = 30
const cards = document.querySelectorAll('#card')
let lastAngle = DELTA_ANGLE

function getCardWidth() {
	const valVW = window.innerWidth * 0.8
	const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
	const valREM = rootFontSize * 50
	return Math.min(valVW, valREM)
}

function positionCards(angle = lastAngle) {
	lastAngle = angle
	const RADIUS = 2 * getCardWidth()
	cards.forEach((card, i) => {
		const coordX = RADIUS * Math.sin((((i - 1) * DELTA_ANGLE + angle) * Math.PI) / 180)
		const coordZ = -RADIUS * (1 - Math.cos((((i - 1) * DELTA_ANGLE + angle) * Math.PI) / 180))
		card.style.transform = `translateX(${coordX}px) translateZ(${coordZ}px) rotate3d(0, 1, 0, ${(i - 1) * DELTA_ANGLE + angle}deg)`
	})
}

const easing = bezier(0.29, 0, 0.66, 0.99)
const cardEffect = new Effect()
cardEffect.smallScreen = true
cardEffect.mobile = true
cardEffect.init = () => positionCards()
cardEffect.resize = () => positionCards()

const programsSection = document.getElementById('program-cards')
createIndexProgramCards(programsSection)

const printingCards = document.querySelectorAll('.printing-el')
printingCards.forEach(card => {
	card.classList.add('preview')
	const overlay = document.createElement('button')
	overlay.dataset.type = 'prints'
	overlay.classList.add('overlay')
	overlay.innerHTML = '<div class="view-more-prints accent body">See more details</div>'
	card.appendChild(overlay)
})

const drawingsCards = document.querySelectorAll('.drawing-card')
drawingsCards.forEach(card => {
	card.classList.add('preview')
	const overlay = document.createElement('button')
	overlay.dataset.type = 'drawings'
	overlay.classList.add('overlay')
	overlay.innerHTML = '<div class="accent body">See more details</div>'
	card.appendChild(overlay)
})

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
			positionCards(-easing(self.progress) * 60 + 30)
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

// === EFFECTS ===

effectManager.add(starsEffect)
effectManager.add(fluidEffect)
effectManager.add(matrixEffect)
effectManager.add(distortionEffect)
effectManager.add(rectanglesEffect)
effectManager.add(lightningEffect)
effectManager.add(cardEffect)
