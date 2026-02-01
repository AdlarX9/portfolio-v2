import { hackerEffect } from './effects.js'

// smooth scroll
const lenis = new Lenis()

// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
	lenis.raf(time)
	requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

const hackerWords = document.querySelectorAll('#hacker')

hackerWords.forEach(word => {
	word.addEventListener('load', hackerEffect(word))
})

const popup = document.createElement('div')
popup.classList.add('popup')
popup.innerHTML = `
	<div>
		<div><</div>
		<div>
			<img>
		</div>
		<div>></div>
	</div>
	<div></div>
`
document.body.appendChild(popup)
setTimeout(() => {
	document.querySelectorAll('.preview').forEach(card => {
		card.addEventListener('click', e => {
			const type = card.dataset.type
			popup.classList.add('active')
		})
	})
}, 500)
