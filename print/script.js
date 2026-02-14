export const DATA = {
	'1-rey': {
		number: 2
	},
	'2-doku': {
		number: 2
	},
	'3-stormbreaker': {
		number: 2
	},
	'4-pistoportail': {
		number: 2
	},
	'5-agamotto': {
		number: 1
	},
	'6-pokeball': {
		number: 2
	},
	'7-ironman': {
		number: 2
	},
	'8-mandalorien': {
		number: 3
	},
	'9-panthere': {
		number: 1
	},
	'10-capybara': {
		number: 1
	},
	'11-fortnite': {
		number: 1
	},
	'12-pistolaser': {
		number: 1
	},
	'13-marteau': {
		number: 2
	},
	'14-hulk': {
		number: 2
	},
	'15-grenade': {
		number: 1
	},
	'16-mjolnir': {
		number: 2
	},
	'17-leviathan': {
		number: 3
	},
	'18-bouclier': {
		number: 2
	},
	'19-chaos': {
		number: 1
	}
}

export const MODELS_DATA = {
	hat: { number: 1 },
	oldapple: { number: 1 },
	dogshark: { number: 1 },
	fish: { number: 1 },
	devil: { number: 1 }
}

function createAllPrints(container) {
	const prints = Object.keys(DATA)
	prints.reverse().forEach((print, i) => {
		const card = document.createElement('div')
		card.classList.add('card')
		card.dataset.type = 'print'
		card.dataset.id = print
		card.innerHTML = `
			<div class="image-card overlay-card preview" data-type="print" data-id="${print}">
				<img src="/assets/prints/preview/${print}.jpeg" alt="Print ${i + 1}" />
				<div class="overlay accent">See more details</div>
			</div>
		`
		container.appendChild(card)
	})
}

function createAllModels(container) {
	const models = Object.keys(MODELS_DATA)
	models.reverse().forEach((model, i) => {
		const card = document.createElement('div')
		card.classList.add('card')
		card.dataset.type = 'model'
		card.dataset.id = model
		card.innerHTML = `
			<div class="image-card overlay-card preview" data-type="model" data-id="${model}">
				<img src="/assets/models/preview/${model}.jpeg" alt="Model ${i + 1}" />
				<div class="overlay accent">See more details</div>
			</div>
		`
		container.appendChild(card)
	})
}

const allPrints = document.querySelector('.all-prints')
if (allPrints) {
	createAllPrints(allPrints)
}

const allModels = document.querySelector('.all-models')
if (allModels) {
	createAllModels(allModels)
}

const wrapper = document.querySelector('.profile-tabs')
const buttons = document.querySelectorAll('.tab-btn')
const windowContainer = document.querySelector('.tabs-window')
const panels = document.querySelectorAll('.tab-panel')

// Fonction pour mettre à jour la hauteur
function updateHeight(index) {
	const activePanel = panels[index]
	if (!activePanel) return
	const newHeight = activePanel.offsetHeight // Récupère la hauteur du contenu

	windowContainer.style.height = `${newHeight}px`
}

if (buttons) {
	buttons.forEach((btn, index) => {
		btn.addEventListener('click', () => {
			// ... ta logique de classe active ...
			buttons.forEach(b => b.classList.remove('active'))
			btn.classList.add('active')

			// ... ta logique de slide ...
			wrapper.style.setProperty('--active-index', index)

			// NOUVEAU : On met à jour la hauteur
			updateHeight(index)
		})
	})
}

// IMPORTANT : Initialiser la hauteur au chargement de la page
// Sinon la fenêtre risque d'être bloquée ou trop petite au début
window.addEventListener('load', () => updateHeight(0))

if (wrapper) {
	// OPTIONNEL : Recalculer si la fenêtre change de taille (Responsive)
	window.addEventListener('resize', () => {
		// On retrouve l'index actif actuel
		const currentIndex = parseInt(getComputedStyle(wrapper).getPropertyValue('--active-index')) || 0
		updateHeight(currentIndex)
	})
}
