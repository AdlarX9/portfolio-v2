import { Effect } from '../app/effects.js'

// utils
const canvas = document.getElementById('renderSurface')
let myFluid = new Fluid(canvas)

function parseColorString(colorString) {
	const matches = colorString.match(/\d+/g)
	if (!matches || matches.length < 3) {
		throw new Error('Format de couleur invalide')
	}
	return {
		r: parseInt(matches[0], 10),
		g: parseInt(matches[1], 10),
		b: parseInt(matches[2], 10)
	}
}
function getCssColor(variableName) {
	const style = getComputedStyle(document.documentElement)
	const color = style.getPropertyValue(variableName).trim()
	return parseColorString(color)
}

// init
function init() {
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

		background_color: getCssColor('--dark-one'),
		transparent: false
	})
	myFluid.activate()
}

// mousemove
function mousemove(e) {
	const rect = canvas.getBoundingClientRect()
	const x = e.clientX - rect.left
	const y = e.clientY - rect.top

	const { r, g, b } = getCssColor('--accent')
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
fluidEffect.init = init
fluidEffect.mousemove = mousemove

export default fluidEffect
