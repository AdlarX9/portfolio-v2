import { Effect, effectManager } from "../app/effects.js"

// utils
let allLetters = []
let mouse = { x: -1000, y: -1000 }
const RADIUS = 150
const FORCE = 100
const scatterElements = document.querySelectorAll('.scatter-text')

function updateRects() {
	allLetters.forEach(letter => {
		letter.rect = letter.element.getBoundingClientRect()
		letter.x = letter.rect.left + letter.rect.width / 2
		letter.y = letter.rect.top + letter.rect.height / 2
	})
}

// load
function init() {
	// Reset pour éviter les doublons
	allLetters = []

	scatterElements.forEach(element => {
		// Sauvegarder le HTML original si ce n'est pas déjà fait
		if (!element.dataset.originalHtml) {
			element.dataset.originalHtml = element.innerHTML
		}

		const text = element.textContent.trim()
		element.innerHTML = ''
		const words = text.split(/\s+/)

		words.forEach((wordText, index) => {
			const wordWrapper = document.createElement('span')
			wordWrapper.classList.add('word-wrapper')
			wordWrapper.style.display = 'inline-block' // Assure que le wrapper se comporte comme un bloc inline

			wordText.split('').forEach(char => {
				const span = document.createElement('span')
				span.classList.add('letter')
				span.style.display = 'inline-block' // Permet les transformations
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

			// Ajouter un espace après chaque mot (sauf le dernier) pour préserver le layout
			if (index < words.length - 1) {
				element.appendChild(document.createTextNode(' '))
			}
		})
	})
	setTimeout(updateRects, 100)
}

// update
function update() {
	allLetters.forEach(letter => {
		if (!effectManager.mouse) return
		const dx = effectManager.mouse.x - letter.x
		const dy = effectManager.mouse.y - letter.y
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
}

// cleanup
function cleanup() {
	// Restaurer le HTML original
	const elements = document.querySelectorAll('.scatter-text')
	elements.forEach(element => {
		if (element.dataset.originalHtml) {
			element.innerHTML = element.dataset.originalHtml
			delete element.dataset.originalHtml
		}
	})
	allLetters = []
}

const scatterEffect = new Effect()
scatterEffect.init = init
scatterEffect.resize = updateRects
scatterEffect.scroll = updateRects
scatterEffect.update = update
scatterEffect.cleanup = cleanup

export default scatterEffect
