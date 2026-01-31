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
		this.x += Column.horizontalSpeed * deltaTime * (this.x - 0.5) / 16
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
