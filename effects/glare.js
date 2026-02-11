import { Effect } from "../app/effects.js"

// utils
let isTicking = false
const elements = document.querySelectorAll('.text-glare, .bordered, .stroke-title, .banner-el, .separator')

// mousemove
function mousemove(e) {
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

const glareEffect = new Effect()
glareEffect.smallScreen = true
glareEffect.mousemove = mousemove

export default glareEffect
