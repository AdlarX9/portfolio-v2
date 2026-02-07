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

const NUMBERS = '0123456789'

class Column {
	static downSpeed = 1
	static horizontalSpeed = 1

	constructor(x, deepness) {
		this.x = x
		this.deepness = deepness
		this.element = document.createElement('div')
		this.element.classList.add('column')
		this.sinceLastMove = 0
	}

	update(deltaTime) {
		this.sinceLastMove += deltaTime
		if (this.sinceLastMove > 1000 / Column.downSpeed) {
			this.sinceLastMove = 0
			const char = NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
			const charElement = document.createElement('span')
			charElement.innerText = char
			this.element.appendChild(charElement)
		}
		this.x += (Column.horizontalSpeed * deltaTime * (this.x - 0.5)) / 16
	}

	render() {
		this.element.style.transform = `translateX(${this.x * window.innerWidth}px)`
	}
}

export function createColumns(container, count) {
	const columns = []
	for (let i = 0; i < count; i++) {
		const column = new Column(Math.random(), Math.random())
		container.appendChild(column.element)
		columns.push(column)
	}
	return columns
}

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
