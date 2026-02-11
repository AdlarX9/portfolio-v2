import { Effect, effectManager } from '../app/effects.js'

// --- CONFIG ---
const MAX_BOLTS = 2
const CHANCE_IDLE = 0.01 // chance ça touche le sol
const CHANCE_MOUSE_STATIC = 0.01 // chance ça touche la souris immobile
const CHANCE_MOUSE_ACTIVE = 0.1 // chance ça touche la souris quand elle bouge vite
const FADE_SPEED = 0.03
const CLOUD_SPEED = 0.2
const CLOUD_DENSITY = 15
const FLASH_INTENSITY = 0.02

// --- STATE ---
let canvas = null
let ctx = null
let width = 0
let height = 0
let bolts = []
let clouds = []
let accentColor = '255, 255, 255'
let cloudColor = '100, 100, 100'

// Variables pour la vitesse souris
let lastMousePos = { x: 0, y: 0 }
let mouseSpeed = 0

function getRGBFromVar(varName) {
	const style = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
	if (style.indexOf(',') > -1 && style.indexOf('rgb') === -1) return style
	return style
}

class Cloud {
	constructor(w, h) {
		this.x = Math.random() * w
		this.y = Math.random() * h
		this.radius = 100 + Math.random() * 200
		this.speed = (Math.random() - 0.5) * CLOUD_SPEED
		this.w = w
		this.h = h
	}

	update() {
		this.x += this.speed
		if (this.x > this.w + this.radius) this.x = -this.radius
		if (this.x < -this.radius) this.x = this.w + this.radius
	}

	draw(ctx, color) {
		ctx.beginPath()
		const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius)
		g.addColorStop(0, `rgba(${color}, 0.05)`)
		g.addColorStop(1, `rgba(${color}, 0)`)
		ctx.fillStyle = g
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
		ctx.fill()
	}
}

class Bolt {
	constructor(w, h, target) {
		this.life = 1
		this.segments = []

		// Cible : soit la souris, soit le sol (h)
		const endX = target ? target.x : Math.random() * w
		const endY = target ? target.y : h

		// Départ : aligné approximativement avec la cible pour éviter les diagonales folles
		// Si c'est le sol, c'est totalement random en haut
		const startX = target ? target.x + ((Math.random() - 0.5) * w) / 2 : endX + ((Math.random() - 0.5) * w) / 3

		let currentX = startX
		let currentY = 0

		this.segments.push({ x: currentX, y: currentY })

		const distY = endY - currentY
		const steps = Math.floor(distY / 15)

		for (let i = 1; i <= steps; i++) {
			const t = i / steps
			const perfectX = startX + (endX - startX) * t
			const perfectY = 0 + (endY - 0) * t

			// Réduction du bruit quand on approche de la cible
			let noiseAmplitude = 30
			if (t > 0.8) noiseAmplitude *= (1 - t) * 5

			const noise = (Math.random() - 0.5) * noiseAmplitude

			currentX = perfectX + noise
			currentY = perfectY

			this.segments.push({ x: currentX, y: currentY })
		}

		// Point final exact
		this.segments[this.segments.length - 1] = { x: endX, y: endY }
	}

	update() {
		this.life -= FADE_SPEED
	}

	draw(ctx, color) {
		if (this.life <= 0) return

		ctx.beginPath()
		ctx.strokeStyle = `rgba(${color}, ${this.life})`
		ctx.lineWidth = 1.5
		ctx.shadowBlur = 20 * this.life
		ctx.shadowColor = `rgba(${color}, 1)`
		ctx.globalAlpha = Math.random() > 0.8 ? 0 : this.life

		ctx.moveTo(this.segments[0].x, this.segments[0].y)
		for (let i = 1; i < this.segments.length; i++) {
			ctx.lineTo(this.segments[i].x, this.segments[i].y)
		}
		ctx.stroke()

		const end = this.segments[this.segments.length - 1]

		// Impact brillant
		ctx.beginPath()
		ctx.fillStyle = `rgba(${color}, ${this.life})`
		ctx.arc(end.x, end.y, 3, 0, Math.PI * 2)
		ctx.fill()

		// Halo
		ctx.beginPath()
		ctx.fillStyle = `rgba(${color}, ${this.life * 0.2})`
		ctx.arc(end.x, end.y, 25, 0, Math.PI * 2)
		ctx.fill()

		ctx.globalAlpha = 1
		ctx.shadowBlur = 0
	}
}

const lightningEffect = new Effect()
let container = null

lightningEffect.init = () => {
	container = document.getElementById('lightning-container')
	if (!container) return

	canvas = document.createElement('canvas')
	Object.assign(canvas.style, {
		position: 'absolute',
		top: '0',
		left: '0',
		width: '100%',
		height: '100%',
		pointerEvents: 'none',
		mixBlendMode: 'screen'
	})

	container.appendChild(canvas)
	ctx = canvas.getContext('2d')

	// Init state
	if (effectManager.mouse) lastMousePos = { ...effectManager.mouse }

	// Init dimensions et nuages
	lightningEffect.resize()
}

lightningEffect.resize = () => {
	if (!container || !canvas) return
	const rect = container.getBoundingClientRect()
	width = rect.width
	height = rect.height

	canvas.width = width
	canvas.height = height

	clouds = []
	for (let i = 0; i < CLOUD_DENSITY; i++) {
		clouds.push(new Cloud(width, height))
	}
	accentColor = getRGBFromVar('--accent')
	cloudColor = getRGBFromVar('--middle-one')
}

lightningEffect.update = () => {
	if (!ctx || !width || document.hidden) return

	ctx.clearRect(0, 0, width, height)

	// 1. Nuages
	clouds.forEach(cloud => {
		cloud.update()
		cloud.draw(ctx, cloudColor)
	})

	// 2. Gestion Souris (Vitesse + Scroll)
	let chance = CHANCE_IDLE
	let target = null
	let isMouseInside = false

	if (effectManager.mouse) {
		// Calcul position relative au canvas (Gère le scroll grâce au getBoundingClientRect du resize)
		// ATTENTION: getBoundingClientRect est relatif au viewport.
		// Si le container bouge avec le scroll, mouse.x/y (clientX/Y) est correct par rapport au viewport
		// MAIS il faut vérifier si c'est DANS le rect du container.

		// On récupère le rect actuel (couteux ? non, chrome l'optimise bien, sinon on peut cacher)
		const rect = container.getBoundingClientRect()

		// Coordonnées locales dans le canvas
		const localX = effectManager.mouse.x - rect.left
		const localY = effectManager.mouse.y - rect.top

		// Check si souris dans la boite
		if (localX >= 0 && localX <= width && localY >= 0 && localY <= height) {
			isMouseInside = true
			target = { x: localX, y: localY }

			// Calcul vitesse
			const dx = effectManager.mouse.x - lastMousePos.x
			const dy = effectManager.mouse.y - lastMousePos.y
			const speed = Math.sqrt(dx * dx + dy * dy)

			// Lissage de la vitesse pour pas que ça clignote
			mouseSpeed += (speed - mouseSpeed) * 0.1

			// Logique de chance dynamique
			// Si on bouge vite (> 20px/frame) -> CHANCE_ACTIVE
			// Sinon -> CHANCE_STATIC
			const ratio = Math.min(mouseSpeed / 20, 1)
			chance = CHANCE_MOUSE_STATIC + (CHANCE_MOUSE_ACTIVE - CHANCE_MOUSE_STATIC) * ratio
		}

		lastMousePos = { x: effectManager.mouse.x, y: effectManager.mouse.y }
	}

	// 3. Création Eclair
	if (bolts.length < MAX_BOLTS && Math.random() < chance) {
		// Si la souris n'est pas dedans, on force la cible à NULL (donc sol aléatoire)
		// Si elle est dedans, on garde le target calculé
		const finalTarget = isMouseInside && Math.random() > CHANCE_IDLE * 30 ? target : null

		// On tire seulement si : souris dedans OU chance infime de frapper le sol
		if (isMouseInside || (!isMouseInside && Math.random() < 0.5)) {
			bolts.push(new Bolt(width, height, finalTarget))

			// Flash
			ctx.fillStyle = `rgba(${accentColor}, ${FLASH_INTENSITY})`
			ctx.fillRect(0, 0, width, height)
		}
	}

	// 4. Rendu Eclairs
	for (let i = bolts.length - 1; i >= 0; i--) {
		const bolt = bolts[i]
		bolt.update()
		bolt.draw(ctx, accentColor)
		if (bolt.life <= 0) bolts.splice(i, 1)
	}
}

lightningEffect.cleanup = () => {
	if (container && canvas) {
		container.removeChild(canvas)
	}
	bolts = []
	clouds = []
}

export default lightningEffect
