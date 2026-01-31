import { hackerEffect } from './hacker.js'

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
