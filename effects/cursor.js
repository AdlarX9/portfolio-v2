import { Effect } from '../app/effects.js'

const cursor = document.createElement('div')
cursor.classList.add('glass-cursor')

function init() {
	document.body.appendChild(cursor)
}

function mousemove(e) {
	cursor.style.left = e.clientX + 'px'
	cursor.style.top = e.clientY + 'px'
	const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY)
	const isHoveringClickable = elementsUnder.some(el => {
		return el.matches('a, button, .clickable') || el.closest('a, button, .clickable')
	})
	if (isHoveringClickable) {
		cursor.classList.add('hovered')
	} else {
		cursor.classList.remove('hovered')
	}
}

const cursorEffect = new Effect()
cursorEffect.smallScreen = true
cursorEffect.init = init
cursorEffect.mousemove = mousemove

export default cursorEffect
