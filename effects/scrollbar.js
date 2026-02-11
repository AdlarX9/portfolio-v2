import { Effect } from '../app/effects.js'

// utils
const track = document.querySelector('.cyber-scrollbar-track')
const thumb = document.querySelector('.cyber-scrollbar-thumb')

let isDragging = false
let startY = 0
let startScrollTop = 0

function updateThumbSize() {
	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	let thumbHeight = Math.max((winHeight / docHeight) * winHeight, 50)
	if (docHeight <= winHeight) thumbHeight = 0
	thumb.style.height = `${thumbHeight}px`
}

function updateThumbPosition() {
	if (isDragging) return

	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	const scrollTop = window.scrollY
	const trackHeight = winHeight
	const thumbHeight = parseFloat(thumb.style.height)
	const scrollPercent = scrollTop / (docHeight - winHeight)
	const thumbY = scrollPercent * (trackHeight - thumbHeight)
	thumb.style.transform = `translate3d(0, ${thumbY}px, 0)`
}

// init
function init() {
	thumb.addEventListener('mousedown', e => {
		isDragging = true
		track.classList.add('grabbing')
		startY = e.clientY
		startScrollTop = window.scrollY
		document.body.style.userSelect = 'none'
	})
	updateThumbSize()
}

// mouseup
function mouseup() {
	isDragging = false
	track.classList.remove('grabbing')
	document.body.style.userSelect = ''
}

// mousemove
function mousemove(e) {
	if (!isDragging) return
	const deltaY = e.clientY - startY
	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	const thumbHeight = parseFloat(thumb.style.height)
	const scrollableHeight = docHeight - winHeight
	const trackableHeight = winHeight - thumbHeight
	const ratio = scrollableHeight / trackableHeight
	window.scrollTo(0, startScrollTop + deltaY * ratio)
	const thumbY = Math.min(
		Math.max(0, ((startScrollTop + deltaY * ratio) / scrollableHeight) * trackableHeight),
		trackableHeight
	)
	thumb.style.transform = `translate3d(0, ${thumbY}px, 0)`
}

// resize
function resize() {
	updateThumbSize()
	updateThumbPosition()
}

// scroll
function scroll() {
	window.requestAnimationFrame(updateThumbPosition)
}

const scrollbarEffect = new Effect()
scrollbarEffect.mobile = true
scrollbarEffect.smallScreen = true
scrollbarEffect.init = init
scrollbarEffect.mousemove = mousemove
scrollbarEffect.mouseup = mouseup
scrollbarEffect.resize = resize
scrollbarEffect.scroll = scroll

export default scrollbarEffect
