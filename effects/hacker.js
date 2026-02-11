// hacker effect

import { Effect } from '../app/effects.js'

// utils
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:',.<>?/`~"
function randomString(length) {
	let result = ''
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * LETTERS.length)
		result += LETTERS[randomIndex]
	}
	return result
}
function apply(element) {
	const originalText = element.innerText
	const repeat = 3
	const period = 15
	for (let i = 0; i <= originalText.length * repeat; i++) {
		setTimeout(() => {
			element.innerText = originalText.substring(0, i / repeat) + randomString(originalText.length - i / repeat)
		}, period * i)
	}
}

// load
function load() {
	const hackerWords = document.querySelectorAll('#hacker')
	hackerWords.forEach(word => {
		apply(word)
	})
}

const hackerEffect = new Effect()
hackerEffect.load = load

export default hackerEffect
