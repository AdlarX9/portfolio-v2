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
				<div class="overlay">See more details</div>
			</div>
		`
		container.appendChild(card)
	})
}

const allPrints = document.querySelector('.all-prints')
if (allPrints) {
	createAllPrints(allPrints)
}
