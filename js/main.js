// smooth scroll
const lenis = new Lenis()

// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
	lenis.raf(time)
	requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

import { hackerEffect } from './hacker.js'
import { createColumns } from './back.js'
import { positionCards } from './mainCards.js'
import { createIndexProgramCards } from './code.js'
import { bezier } from '../lib/bezier-easing.js'

const hackerWords = document.querySelectorAll('#hacker')

hackerWords.forEach(word => {
	word.addEventListener('load', hackerEffect(word))
})

const back = document.getElementById('back')
const columns = createColumns(back, 50)

let lastTime = Date.now()
function updateColumns(present) {
	const deltaTime = present - lastTime
	columns.forEach(column => {
		column.update(deltaTime)
		column.render()
	})
	lastTime = present
}

// requestAnimationFrame(updateColumns)

const cards = document.querySelectorAll('#card')
const easing = bezier(0.29, 0, 0.66, 0.99)
positionCards(cards)

gsap.registerPlugin(ScrollTrigger)
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

const programsSection = document.getElementById('program-cards')
createIndexProgramCards(programsSection)

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

const drawingsCards = document.querySelectorAll('.drawing-card')
drawingsCards.forEach(card => {
	const overlay = document.createElement('a')
	overlay.href = '/pages/drawings.html'
	overlay.classList.add('drawing-overlay')
	overlay.innerHTML = '<div>View more drawings</div>'
	card.appendChild(overlay)
})

const printingCards = document.querySelectorAll('.printing-el')
printingCards.forEach(card => {
	const overlay = document.createElement('a')
	overlay.href = '/pages/prints.html'
	overlay.classList.add('printing-overlay')
	overlay.innerHTML = '<div class="view-more-prints">View more prints</div>'
	card.appendChild(overlay)
})
