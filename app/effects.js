// === EFFECTS ===

export class Effect {
	constructor() {
		// Activate effect
		this.mobile = false
		// AND
		this.smallScreen = false

		// Init function
		this.init = null
		// Called in RequestAnimationFrame loop
		this.update = null

		// Window listeners
		this.scroll = null
		this.resize = null
		this.mousemove = null
		this.click = null
		this.mousedown = null
		this.mouseup = null
		this.load = null

		this.cleanup = null
	}
}

class EffectsManager {
	constructor() {
		this.mouse = null
		this.animationID = null
		this.effects = new Set()
		this.activeEffects = new Set()
		this.isSmallScreen = window.matchMedia('(max-width: 767px)')
		this.isMobile = window.matchMedia('(hover: none)')
	}

	add(effect) {
		this.effects.add(effect)
		this.handleEffect(effect)
	}

	loop(time) {
		this.activeEffects.forEach(effect => {
			if (effect.update) effect.update(time)
		})
		this.animationID = requestAnimationFrame(this.loop.bind(this))
	}

	scroll(e) {
		this.activeEffects.forEach(effect => {
			if (effect.scroll) effect.scroll(e)
		})
	}
	resize(e) {
		this.activeEffects.forEach(effect => {
			if (effect.resize) effect.resize(e)
		})
	}
	mousemove(e) {
		this.mouse = { x: e.clientX, y: e.clientY }
		this.activeEffects.forEach(effect => {
			if (effect.mousemove) effect.mousemove(e)
		})
	}
	click(e) {
		this.activeEffects.forEach(effect => {
			if (effect.click) effect.click(e)
		})
	}
	mousedown(e) {
		this.activeEffects.forEach(effect => {
			if (effect.mousedown) effect.mousedown(e)
		})
	}
	mouseup(e) {
		this.activeEffects.forEach(effect => {
			if (effect.mouseup) effect.mouseup(e)
		})
	}
	load(e) {
		this.activeEffects.forEach(effect => {
			if (effect.load) effect.load(e)
		})
	}

	handleEffect(effect) {
		const shouldBeActive =
			(effect.mobile ? true : !this.isMobile.matches) && (effect.smallScreen ? true : !this.isSmallScreen.matches)
		if (shouldBeActive && !this.activeEffects.has(effect)) {
			effect.init && effect.init()
			this.activeEffects.add(effect)
		} else if (!shouldBeActive && this.activeEffects.has(effect)) {
			effect.cleanup && effect.cleanup()
			this.activeEffects.delete(effect)
		}
	}

	handleEffects() {
		this.effects.forEach(effect => {
			this.handleEffect(effect)
		})
	}

	launch() {
		this.isSmallScreen.addEventListener('change', this.handleEffects.bind(this))
		this.isMobile.addEventListener('change', this.handleEffects.bind(this))

		this.loop()
		window.addEventListener('scroll', this.scroll.bind(this), { passive: true })
		window.addEventListener('resize', this.resize.bind(this))
		window.addEventListener('mousemove', this.mousemove.bind(this), { passive: true })
		window.addEventListener('click', this.click.bind(this))
		window.addEventListener('mousedown', this.mousedown.bind(this))
		window.addEventListener('mouseup', this.mouseup.bind(this))
		window.addEventListener('load', this.load.bind(this))
	}
}

const effectManager = new EffectsManager()
effectManager.launch()

export { effectManager }
