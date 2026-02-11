// matrix effect

import { Effect } from '../app/effects.js'

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
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'

class Column {
	static downSpeed = 8 // vitesse de descente (caractères par seconde)
	static horizontalSpeed = 0.008 // vitesse d'étalement horizontal
	static closingSpeed = 0.008 // vitesse de rapprochement
	static fadeLength = 10 // nombre de caractères qui s'estompent progressivement
	static maxChars = 12 // marge de suppression des caractères invisibles
	static container = document.querySelector('.programs')
	static lineHeight = 1.2

	constructor(x, y, deepness) {
		this.x = x // [0, 1], 0 = gauche, 1 = droite
		this.deepness = deepness // [0, 1], 0 = proche, 1 = loin
		this.sinceLastMove = 0 // durée depuis le dernier ajout d'un caractère
		this.element = document.createElement('div')
		this.element.classList.add('column')
		const height = document.querySelector('.programs').scrollHeight
		this.top = y * height - 200
		this.element.style.transform = `translateY(${this.top}px)`
		this.fontSize = -1
	}

	update(deltaTime) {
		this.sinceLastMove += deltaTime
		this.deepness = Math.min(1, this.deepness - (Column.closingSpeed * deltaTime) / 1000)

		const speed = Column.downSpeed * (1.5 - this.deepness * 0.5)
		if (this.sinceLastMove > 1000 / speed) {
			this.sinceLastMove = 0
			this.addChar()
		}

		// Supprimer les premiers caractères
		const charHeight = Column.lineHeight * this.fontSize * this.getRem()
		if (this.element.childElementCount > Column.maxChars) {
			this.element.firstChild.remove()
			this.top += charHeight
		}
		this.updateCharsFade()

		// Régénérer si la colonne est descendue trop bas
		if (this.top > programsHeight) {
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
		const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
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
		const opacity = Math.round(Math.max(0.2, 1 - this.deepness) * 100) / 100
		const fontSize = Math.round((1 - this.deepness * 0.6) * 2.5 * 100) / 100
		this.fontSize = fontSize
		this.element.style.cssText = `transform: translate(${xPos}px, ${this.top}px); opacity: ${opacity}; font-size: ${fontSize}rem;`
	}

	regenerate() {
		this.x = Math.random()
		this.top = Math.random() * programsHeight - 200
		this.deepness = Math.random() * 0.7
		this.sinceLastMove = 0
		this.element.innerHTML = ''
	}

	destroy() {
		this.element.remove()
	}
}

const count = 40
let columns = []
const programs = document.querySelector('.programs')

// init
function init() {
	for (let i = 0; i < count; i++) {
		const column = new Column(Math.random(), Math.random(), Math.random() * 0.7)
		programs.appendChild(column.element)
		columns.push(column)
	}
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
matrixEffect.init = init
matrixEffect.update = update
matrixEffect.cleanup = cleanup

export default matrixEffect
