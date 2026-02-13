// === INTRO ===

import { createIndexProgramCards } from '../code/script.js'
import { bezier } from '../lib/bezier-easing.js'
import { Effect, effectManager } from './app/effects.js'
import { MENUS, updateTheme } from './app/main.js'
import {
	fluidEffect,
	distortionEffect,
	matrixEffect,
	rectanglesEffect,
	starsEffect,
	lightningEffect,
	loaderEffect
} from './effects/index.js'

// === BANNER GENERATION ===

const banners = document.querySelectorAll('.banner')
const LANGUAGES = [
	'html5',
	'css3',
	'javascript',
	'php',
	'python',
	'cplusplus',
	'swift',
	'c',
	'go',
	'typescript',
	'rust',
	'mysql',
	'postgresql',
	'bash',
	'docker',
	'git',
	'react'
]

for (let i = 0; i < 2; i++) {
	LANGUAGES.forEach(language => {
		const el = document.createElement('div')
		el.classList.add('banner-el')
		const url = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${language}/${language}-original.svg`
		el.innerHTML = `<img src="${url}" alt="${language} logo" />${language === 'cplusplus' ? 'c++' : language}`
		banners.forEach(banner => banner.appendChild(el.cloneNode(true)))
	})
}

// === CARDS STUFF ===

const DELTA_ANGLE = 30
const cards = document.querySelectorAll('#card')
let lastAngle = DELTA_ANGLE

function getCardWidth() {
	const valVW = window.innerWidth * 0.8
	const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
	const valREM = rootFontSize * 50
	return Math.min(valVW, valREM)
}

function positionCards(angle = lastAngle) {
	lastAngle = angle
	const RADIUS = 2 * getCardWidth()
	cards.forEach((card, i) => {
		const coordX = RADIUS * Math.sin((((i - 1) * DELTA_ANGLE + angle) * Math.PI) / 180)
		const coordZ = -RADIUS * (1 - Math.cos((((i - 1) * DELTA_ANGLE + angle) * Math.PI) / 180))
		card.style.transform = `translateX(${coordX}px) translateZ(${coordZ}px) rotate3d(0, 1, 0, ${(i - 1) * DELTA_ANGLE + angle}deg)`
	})
}

const easing = bezier(0.29, 0, 0.66, 0.99)
const cardEffect = new Effect()
cardEffect.smallScreen = true
cardEffect.mobile = true
cardEffect.init = () => positionCards()
cardEffect.resize = () => positionCards()

const programsSection = document.getElementById('program-cards')
createIndexProgramCards(programsSection)

const printingCards = document.querySelectorAll('.printing-el')
printingCards.forEach(card => {
	card.classList.add('preview')
	const overlay = document.createElement('button')
	overlay.dataset.type = 'prints'
	overlay.classList.add('overlay')
	overlay.innerHTML = '<div class="view-more-prints accent body">See more details</div>'
	card.appendChild(overlay)
})

const drawingsCards = document.querySelectorAll('.drawing-card')
drawingsCards.forEach(card => {
	card.classList.add('preview')
	const overlay = document.createElement('button')
	overlay.dataset.type = 'drawings'
	overlay.classList.add('overlay')
	overlay.innerHTML = '<div class="accent body">See more details</div>'
	card.appendChild(overlay)
})

// === THEME SELECTOR ===

const switchThemeBtn = document.getElementById('switch-theme')
let themeDialog = null

function createThemeDialog() {
	const dialog = document.createElement('div')
	dialog.className = 'theme-dialog'

	const content = document.createElement('div')
	content.className = 'theme-dialog-content gradient-card'

	const title = document.createElement('h2')
	title.className = 'title'
	title.textContent = 'Choose your theme'

	const optionsContainer = document.createElement('div')
	optionsContainer.className = 'theme-options'

	// Créer une option pour chaque thème
	MENUS.forEach((theme, index) => {
		const option = document.createElement('div')
		option.className = 'theme-option clickable'
		option.dataset.themeIndex = index

		// Définir les couleurs CSS pour la preview
		option.style.setProperty('--theme-main', `${theme.mainColor.r}, ${theme.mainColor.g}, ${theme.mainColor.b}`)
		option.style.setProperty(
			'--theme-accent',
			`${theme.accentColor.r}, ${theme.accentColor.g}, ${theme.accentColor.b}`
		)

		// Vérifier si c'est le thème actuel
		const savedIndex = parseInt(localStorage.getItem('site-theme-index') || '0', 10)
		if (index === savedIndex) {
			option.classList.add('selected')
		}

		const name = document.createElement('div')
		name.className = 'theme-name'
		name.textContent = getThemeName(index)

		const preview = document.createElement('div')
		preview.className = 'theme-preview'

		const mainColor = document.createElement('div')
		mainColor.className = 'theme-color main'

		const accentColor = document.createElement('div')
		accentColor.className = 'theme-color accent'

		preview.appendChild(mainColor)
		preview.appendChild(accentColor)

		option.appendChild(name)
		option.appendChild(preview)

		// Sélection du thème
		option.addEventListener('click', () => {
			selectTheme(index)
		})

		optionsContainer.appendChild(option)
	})

	content.appendChild(title)
	content.appendChild(optionsContainer)
	dialog.appendChild(content)
	document.body.appendChild(dialog)

	// Fermer en cliquant sur le fond
	dialog.addEventListener('click', e => {
		if (e.target === dialog) {
			closeThemeDialog()
		}
	})

	return dialog
}

function getThemeName(index) {
	const names = ['Purple Cyber', 'Pink Sunset', 'Theme 3', 'Theme 4', 'Theme 5']
	return names[index] || `Theme ${index + 1}`
}

function openThemeDialog() {
	if (!themeDialog) {
		themeDialog = createThemeDialog()
	}
	setTimeout(() => themeDialog.classList.add('active'), 10)
}

function closeThemeDialog() {
	if (themeDialog) {
		themeDialog.classList.remove('active')
	}
}

function selectTheme(index) {
	updateTheme(index)

	// Mettre à jour la sélection visuelle
	if (themeDialog) {
		const options = themeDialog.querySelectorAll('.theme-option')
		options.forEach(opt => opt.classList.remove('selected'))
		options[index]?.classList.add('selected')
	}
}

if (switchThemeBtn) {
	switchThemeBtn.addEventListener('click', openThemeDialog)
}

// === SCROLL TRIGGERS ===

gsap.registerPlugin(ScrollTrigger)
let mm = gsap.matchMedia()
mm.add('(min-width: 768px)', () => {
	// MAIN CARDS SCROLL ANIMATION
	ScrollTrigger.create({
		trigger: '.main-cards',
		start: 'center center',
		endTrigger: '.main-cards',
		end: 'bottom top',
		pin: true,
		scrub: true,
		markers: false, // dev
		onUpdate: self => {
			positionCards(-easing(self.progress) * 60 + 30)
		}
	})

	// DRAWINGS SCROLL ANIMATION
	ScrollTrigger.create({
		pin: '#dc-2',
		trigger: '#dc-1',
		start: 'top center',
		end: 'bottom center',
		pinSpacing: true,
		markers: false
	})
	ScrollTrigger.create({
		pin: '#dc-3',
		trigger: '#dc-1',
		start: 'top center',
		endTrigger: '#dc-1',
		end: () => `bottom center-=${document.querySelector('#dc-2').offsetHeight}`,
		pinSpacing: true,
		markers: false
	})

	return () => {}
})

// === EFFECTS ===

effectManager.add(starsEffect)
effectManager.add(fluidEffect)
effectManager.add(matrixEffect)
effectManager.add(distortionEffect)
effectManager.add(rectanglesEffect)
effectManager.add(lightningEffect)
effectManager.add(cardEffect)
effectManager.add(loaderEffect)
