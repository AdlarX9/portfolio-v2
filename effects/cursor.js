import { Effect } from '../app/effects.js'

const cursor = document.createElement('div')
cursor.classList.add('glass-cursor')
let hasMoved = false

function init() {
	document.body.appendChild(cursor)
	// Event delegation pour les éléments cliquables
	document.addEventListener('mouseover', handleHoverIn, { passive: true })
	document.addEventListener('mouseout', handleHoverOut, { passive: true })
}

function cleanup() {
	document.removeEventListener('mouseover', handleHoverIn)
	document.removeEventListener('mouseout', handleHoverOut)
	if (cursor.parentNode) {
		cursor.parentNode.removeChild(cursor)
	}
}

function handleHoverIn(e) {
	if (e.target.matches('a, button, .clickable') || e.target.closest('a, button, .clickable')) {
		cursor.classList.add('hovered')
	}
}

function handleHoverOut(e) {
	if (e.target.matches('a, button, .clickable') || e.target.closest('a, button, .clickable')) {
		cursor.classList.remove('hovered')
	}
}

function mousemove(e) {
	if (!hasMoved) {
		cursor.style.opacity = '1' // Affiche le curseur après le premier mouvement
		hasMoved = true
	}
	// Utilise transform au lieu de left/top pour performance GPU
	cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0) scale(var(--cursor-scale))`
}

const cursorEffect = new Effect()
cursorEffect.smallScreen = true
cursorEffect.init = init
cursorEffect.cleanup = cleanup
cursorEffect.mousemove = mousemove

export default cursorEffect
