// matrix effect

import { Effect, effectManager } from '../app/effects.js'

// utils
let programsHeight = 0
const observer = new ResizeObserver(entries => {
	for (const entry of entries) {
		programsHeight = entry.contentRect.height
	}
})
const programsSection = document.querySelector('.programs')
if (programsSection) {
	observer.observe(programsSection)
}

// Constantes optimisées
const COUNT_DESKTOP = 40
const COUNT_MOBILE = 20 // Moins de colonnes sur mobile
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'

class Column {
	static downSpeed = 8
	static horizontalSpeed = 0.008
	static closingSpeed = 0.008
	static fadeLength = 10
	static maxChars = 12
	static container = document.querySelector('.programs')
	static lineHeight = 1.2

	constructor(x, y, deepness) {
		this.x = x // [0, 1]

		// --- FIX 1 : Sécurisation de l'initialisation ---
		// Si deepness est invalide ou hors borne, on force une valeur aléatoire correcte
		if (isNaN(deepness) || deepness < 0 || deepness > 1) {
			this.deepness = Math.random() * 0.7
		} else {
			this.deepness = deepness
		}

		this.sinceLastMove = 0
		this.element = document.createElement('div')
		this.element.classList.add('column')

		// Sécurité si .programs n'est pas encore chargé
		const containerHeight = document.querySelector('.programs')?.scrollHeight || window.innerHeight
		this.top = y * containerHeight - 200

		this.element.style.transform = `translateY(${this.top}px)`
		this.fontSize = -1
	}

	update(deltaTime) {
		this.sinceLastMove += deltaTime

		// On fait avancer la profondeur (se rapproche)
		this.deepness -= (Column.closingSpeed * deltaTime) / 1000

		// --- FIX 2 : Limite basse ---
		// Si l'objet dépasse l'écran (devient trop proche/négatif), on le régénère
		// Sinon deepness descend à -14000 et fait bugger le rendu
		if (this.deepness < -0.1) {
			this.regenerate()
			return
		}

		// On clamp la valeur max à 1 pour la logique mathématique (mais normalement on descend)
		this.deepness = Math.min(1, this.deepness)

		const speed = Column.downSpeed * (1.5 - this.deepness * 0.5)
		if (this.sinceLastMove > 1000 / speed) {
			this.sinceLastMove = 0
			this.addChar()
		}

		const charHeight = Column.lineHeight * this.fontSize * this.getRem()
		if (this.element.childElementCount > Column.maxChars) {
			this.element.firstChild.remove()
			this.top += charHeight
		}
		this.updateCharsFade()

		// Régénérer si trop bas
		// (On utilise window.innerHeight en fallback si programsHeight n'est pas défini globalement)
		const limitHeight = typeof programsHeight !== 'undefined' ? programsHeight : window.innerHeight * 2
		if (this.top > limitHeight) {
			this.regenerate()
			return
		}

		// Mouvement horizontal
		if (this.deepness < 0.99) {
			this.x += (((Column.horizontalSpeed * deltaTime) / 1000) * (this.x - 0.5)) / (this.deepness + 0.1)
		}

		if (this.x < -0.05 || this.x > 1.05) {
			this.regenerate()
			return
		}
	}

	getRem() {
		return parseFloat(getComputedStyle(document.documentElement).fontSize)
	}

	addChar() {
		// Vérification que MATRIX_CHARS existe (sinon fallback)
		const chars = typeof MATRIX_CHARS !== 'undefined' ? MATRIX_CHARS : '01'
		const char = chars[Math.floor(Math.random() * chars.length)]
		const charElement = document.createElement('span')
		charElement.textContent = char
		this.element.appendChild(charElement)
	}

	updateCharsFade() {
		const totalChars = this.element.childElementCount
		const startIndex = Math.max(0, totalChars - 1 - Column.fadeLength)
		for (let i = startIndex; i < totalChars; i++) {
			const char = this.element.children[i]
			const distanceFromEnd = totalChars - 1 - i

			if (distanceFromEnd === 0) {
				char.className = 'char-bright'
			} else if (distanceFromEnd < Column.fadeLength) {
				const fadeLevel = Math.min(Math.floor(distanceFromEnd / 2), 4)
				char.className = `char-fade-${fadeLevel}`
			}
		}
	}

	render() {
		const xPos = Math.round(this.x * window.innerWidth)

		// Calculs sécurisés pour le rendu
		// On s'assure que opacity est entre 0 et 1
		let opacity = Math.max(0, Math.min(1, 1 - this.deepness))
		opacity = Math.round(Math.max(0.2, opacity) * 100) / 100

		const fontSize = Math.round((1 - this.deepness * 0.6) * 2.5 * 100) / 100
		this.fontSize = fontSize

		this.element.style.cssText = `transform: translate(${xPos}px, ${this.top}px); opacity: ${opacity}; font-size: ${fontSize}rem;`
	}

	regenerate() {
		this.x = Math.random()
		// Fallback sécurisé pour la hauteur
		const h = window.innerHeight
		this.top = Math.random() * h - 200

		// Reset deepness à une valeur saine [0, 0.7]
		this.deepness = Math.random() * 0.7
		this.sinceLastMove = 0
		this.element.innerHTML = ''
	}

	destroy() {
		this.element.remove()
	}
}

let columns = []
const programs = document.querySelector('.programs')

// init
function init() {
	if (!programs) return

	const count = effectManager.isMobile.matches ? COUNT_MOBILE : COUNT_DESKTOP
	const fragment = document.createDocumentFragment()

	for (let i = 0; i < count; i++) {
		const column = new Column(Math.random(), Math.random(), Math.random() * 0.7)
		fragment.appendChild(column.element)
		columns.push(column)
	}

	programs.appendChild(fragment)
}

// update
let lastTime = null
function update() {
	const currentTime = new Date().getTime()
	const deltaTime = currentTime - lastTime
	lastTime = currentTime
	columns.forEach(column => {
		column.update(deltaTime)
	})
	columns.forEach(column => {
		column.render()
	})
}

// cleanup
function cleanup() {
	columns.forEach(column => column.destroy())
}

const matrixEffect = new Effect()
matrixEffect.mobile = true
matrixEffect.init = init
matrixEffect.update = update
matrixEffect.cleanup = cleanup

export default matrixEffect
