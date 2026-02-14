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
const WHITE = { r: 255, g: 255, b: 255 }
const GREY_DARK = { r: 26, g: 26, b: 26 }
const GREY_MID = { r: 153, g: 153, b: 153 }
const GREY_LIGHT = { r: 221, g: 221, b: 221 }

export let colors = {}

const root = document.documentElement
const setVar = (name, color) => {
	colors[name] = color
	root.style.setProperty(name, `${color.r}, ${color.g}, ${color.b}`)
}

// Convertit RGB (0-255) vers HSL (0-360, 0-100, 0-100)
function rgbToHsl(r, g, b) {
	r /= 255
	g /= 255
	b /= 255
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b)
	let h,
		s,
		l = (max + min) / 2

	if (max === min) {
		h = s = 0
	} else {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}
		h /= 6
	}
	return { h: h * 360, s: s * 100, l: l * 100 }
}

// Convertit HSL vers RGB (0-255)
function hslToRgb(h, s, l) {
	s /= 100
	l /= 100
	const k = n => (n + h / 30) % 12
	const a = s * Math.min(l, 1 - l)
	const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
	return {
		r: Math.round(255 * f(0)),
		g: Math.round(255 * f(8)),
		b: Math.round(255 * f(4))
	}
}

function generateTheme(sourceColor) {
	colors = {}

	// 67, 0, 111 par défaut
	const hsl = rgbToHsl(sourceColor.r, sourceColor.g, sourceColor.b)
	const deepVariant = hslToRgb((hsl.h + 22) % 360, 100, 22)
	
	setVar('--middle-three', sourceColor)
	setVar('--dark-one', mix(sourceColor, BLACK, 0.9))
	setVar('--dark-two', mix(sourceColor, BLACK, 0.83))
	setVar('--dark-four', mix(sourceColor, BLACK, 0.75))
	setVar('--dark-five', mix(deepVariant, BLACK, 0.2))
	setVar('--dark-six', deepVariant)
	setVar('--dark-three', mix(sourceColor, GREY_DARK, 0.8))
	setVar('--middle-one', mix(sourceColor, BLACK, 0.15))
	setVar('--middle-two', mix(sourceColor, GREY_MID, 0.75))
	setVar('--light-one', mix(sourceColor, GREY_LIGHT, 0.6))
	setVar('--light-two', mix(sourceColor, WHITE, 0.93))
}

export const MENUS = [
	{
		mainColor: { r: 175, g: 153, b: 250 }, // Mauve
		accentColor: { r: 0, g: 255, b: 145 } // Vert émeraude
	},
	{
		mainColor: { r: 2, g: 100, b: 168 }, // Bleu outremer
		accentColor: { r: 255, g: 0, b: 0 } // Rouge vif
	},
	{
		mainColor: { r: 0, g: 125, b: 104 }, // Bleu froid
		accentColor: { r: 200, g: 20, b: 200 } // Violet
	},
	{
		mainColor: { r: 160, g: 20, b: 70 }, // Rouge foncé
		accentColor: { r: 0, g: 255, b: 0 } // Vert hacker
	}
]
const DEFAULT_MENU_INDEX = 0

export function updateTheme(index = DEFAULT_MENU_INDEX) {
	// SÉCURITÉ : Si on demande un index qui n'existe pas (ex: -1 ou 10), on force 0
	if (!MENUS[index]) {
		console.warn(`Thème ${index} introuvable, retour au défaut.`)
		index = DEFAULT_MENU_INDEX
	}

	const theme = MENUS[index]
	MAIN_COLOR = theme.mainColor
	ACCENT_COLOR = theme.accentColor

	generateTheme(MAIN_COLOR)
	setVar('--accent', ACCENT_COLOR)

	// On sauvegarde simplement le chiffre (ex: "0" ou "1")
	localStorage.setItem('site-theme-index', index)
}

// --- INITIALISATION ---

// 1. On récupère la valeur brute (string)
const savedIndex = localStorage.getItem('site-theme-index')

// 2. Vérification
if (savedIndex !== null) {
	// On convertit "1" en 1 (base 10)
	const index = parseInt(savedIndex, 10)

	// Est-ce que c'est bien un nombre ? ET est-ce que ce thème existe dans MENUS ?
	if (!isNaN(index) && MENUS[index]) {
		updateTheme(index)
	} else {
		// Si le localStorage est corrompu ou obsolète
		updateTheme()
	}
} else {
	// Première visite
	updateTheme()
}

// Setup effects for all pages

effectManager.add(cursorEffect)
effectManager.add(glareEffect)
effectManager.add(smoothScrollEffect)
effectManager.add(hackerEffect)
effectManager.add(popupEffect)
effectManager.add(scatterEffect)
effectManager.add(scrollbarEffect)
