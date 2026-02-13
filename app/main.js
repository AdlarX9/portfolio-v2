// === MAIN ===

import { effectManager } from './effects.js'
import {
	cursorEffect,
	glareEffect,
	hackerEffect,
	popupEffect,
	scatterEffect,
	scrollbarEffect,
	smoothScrollEffect
} from '../effects/index.js'

// Setup theme

export let MAIN_COLOR = null
export let ACCENT_COLOR = null

function mix(c1, c2, percentage) {
	return {
		r: Math.round(c1.r * (1 - percentage) + c2.r * percentage),
		g: Math.round(c1.g * (1 - percentage) + c2.g * percentage),
		b: Math.round(c1.b * (1 - percentage) + c2.b * percentage)
	}
}

const BLACK = { r: 0, g: 0, b: 0 }
const WHITE = { r: 238, g: 238, b: 255 }
const GREY_DARK = { r: 26, g: 26, b: 26 }
const GREY_MID = { r: 153, g: 153, b: 153 }
const GREY_LIGHT = { r: 221, g: 221, b: 221 }

export let colors = {}

const root = document.documentElement
const setVar = (name, color) => {
	colors[name] = color
	root.style.setProperty(name, `${color.r}, ${color.g}, ${color.b}`)
}

function generateTheme(sourceColor) {
	colors = {}
	setVar('--middle-three', sourceColor)
	setVar('--dark-one', mix(sourceColor, BLACK, 0.9))
	setVar('--dark-two', mix(sourceColor, BLACK, 0.83))
	setVar('--dark-four', mix(sourceColor, BLACK, 0.75))
	setVar('--dark-three', mix(sourceColor, GREY_DARK, 0.8))
	setVar('--middle-one', mix(sourceColor, BLACK, 0.15))
	setVar('--middle-two', mix(sourceColor, GREY_MID, 0.75))
	setVar('--light-one', mix(sourceColor, GREY_LIGHT, 0.6))
	setVar('--light-two', mix(sourceColor, WHITE, 0.9))
}

function updateTheme(newMainColor, newAccentColor) {
	MAIN_COLOR = newMainColor
	ACCENT_COLOR = newAccentColor
	generateTheme(MAIN_COLOR)
	setVar('--accent', ACCENT_COLOR)
}

const defaultMainColor = { r: 175, g: 153, b: 250 }
const defaultAccentColor = { r: 0, g: 255, b: 145 }
updateTheme(defaultMainColor, defaultAccentColor)

// Setup effects for all pages

effectManager.add(cursorEffect)
effectManager.add(glareEffect)
effectManager.add(smoothScrollEffect)
effectManager.add(hackerEffect)
effectManager.add(popupEffect)
effectManager.add(scatterEffect)
effectManager.add(scrollbarEffect)
