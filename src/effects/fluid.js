import { Effect } from '../app/effects.js'
import { ACCENT_COLOR, colors, getRect, inViewport } from '../app/main.js'
import Fluid from '../lib/fluid.js'

// utils
let canvas = null
let myFluid = null
let rect = null
const isSafari =
	/constructor/i.test(window.HTMLElement) ||
	(function (p) {
		return p.toString() === '[object SafariRemoteNotification]'
	})(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification))

// init
function init() {
	canvas = document.getElementById('renderSurface')
	rect = getRect(canvas)

	myFluid = new Fluid(canvas)
	myFluid.mapBehaviors({
		sim_resolution: 256,
		dye_resolution: 512,

		paused: false,
		embedded_dither: true,

		dissipation: 0.97,
		velocity: 0.98,
		pressure: 0.8,
		pressure_iteration: 20,
		curl: 10,
		emitter_size: 256 / Math.max(canvas.width, canvas.height),

		render_shaders: true,
		multi_color: true,

		render_bloom: false,
		bloom_iterations: 8,
		bloom_resolution: 256,
		intensity: 0.8,
		threshold: 0.6,
		soft_knee: 0.7,

		background_color: colors['--dark-one'],
		transparent: false
	})
	myFluid.activate()
}

function resize() {
	if (canvas) {
		rect = getRect(canvas)
	}
}

// mousemove
function mousemove(e) {
	if (!inViewport(rect)) return

	const currentRect = canvas.getBoundingClientRect()
	const x = e.clientX - currentRect.left
	const y = e.clientY - currentRect.top

	const { r, g, b } = ACCENT_COLOR
	const factor = 1500

	if (myFluid.pointers && myFluid.pointers.length > 0) {
		const pointer = myFluid.pointers[0]
		pointer.dx = (x - pointer.x) * 5.0
		pointer.dy = (y - pointer.y) * 5.0
		pointer.x = x
		pointer.y = y
		pointer.down = true
		pointer.moved = true
		pointer.color = { r: r / factor, g: g / factor, b: b / factor }
	}
}

const fluidEffect = new Effect()
if (!isSafari) {
	fluidEffect.init = init
	fluidEffect.resize = resize
	fluidEffect.mousemove = mousemove
}

export default fluidEffect
