// === EFFECTS ===

// star effect

export function createStars(container, count) {
	for (let i = 0; i < count; i++) {
		const star = document.createElement('div')
		star.classList.add('star')
		const x = Math.random() * 100
		const y = Math.random() * 100
		star.style.left = `${x}%`
		star.style.top = `${y}%`

		// Délai aléatoire pour désynchroniser les animations
		const twinkleDelay = Math.random() * 5
		const twinkleDuration = 2 + Math.random() * 3
		star.style.animationDelay = `${twinkleDelay}s`
		star.style.animationDuration = `${twinkleDuration}s`

		// Mouvement lent aléatoire
		const moveDelay = Math.random() * 10
		const moveDuration = 40 + Math.random() * 30
		const moveDistance = 20 + Math.random() * 30
		const angle = Math.random() * Math.PI * 2

		star.style.setProperty('--move-delay', `${moveDelay}s`)
		star.style.setProperty('--move-duration', `${moveDuration}s`)
		star.style.setProperty('--move-x', `${Math.cos(angle) * moveDistance}px`)
		star.style.setProperty('--move-y', `${Math.sin(angle) * moveDistance}px`)

		container.appendChild(star)
	}
}

// hacker effect

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:',.<>?/`~"

function randomString(length) {
	let result = ''
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * LETTERS.length)
		result += LETTERS[randomIndex]
	}
	return result
}

export function hackerEffect(element) {
	const originalText = element.innerText
	const repeat = 3
	const period = 15
	for (let i = 0; i <= originalText.length * repeat; i++) {
		setTimeout(() => {
			element.innerText = originalText.substring(0, i / repeat) + randomString(originalText.length - i / repeat)
		}, period * i)
	}
}

// matrix effect

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
}

export function createColumns(container, count) {
	const columns = []
	for (let i = 0; i < count; i++) {
		const column = new Column(Math.random(), Math.random(), Math.random() * 0.7)
		container.appendChild(column.element)
		columns.push(column)
	}
	return columns
}

// glare effects

let isTicking = false

export function updateGlareEffects(elements, e) {
	if (!isTicking) {
		window.requestAnimationFrame(() => {
			elements.forEach(el => {
				const rect = el.getBoundingClientRect()
				if (rect.bottom < 0 || rect.top > window.innerHeight) return
				const x = e.clientX - rect.left
				const y = e.clientY - rect.top
				el.style.setProperty('--x', `${x}px`)
				el.style.setProperty('--y', `${y}px`)
			})
			isTicking = false
		})
		isTicking = true
	}
}

// scatter effect

let allLetters = []
let mouse = { x: -1000, y: -1000 }
const RADIUS = 150
const FORCE = 100

export function setupScatterElements(elements) {
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
}

export function trackMouseForScatterEffect(e) {
	mouse.x = e.clientX
	mouse.y = e.clientY
}

export function updateRects() {
	allLetters.forEach(letter => {
		letter.rect = letter.element.getBoundingClientRect()
		letter.x = letter.rect.left + letter.rect.width / 2
		letter.y = letter.rect.top + letter.rect.height / 2
	})
}

export function animateScatterEffect() {
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

	requestAnimationFrame(animateScatterEffect)
}
