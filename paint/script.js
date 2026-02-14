export const DATA = {
	'1-mammouth': {
		number: 1
	},
	'2-thor': {
		number: 1
	},
	'3-mayas': {
		number: 1
	},
	'4-barriere': {
		number: 1
	},
	'5-foret': {
		number: 1
	},
	'6-matisse': {
		number: 1
	},
	'7-fontaine': {
		number: 2
	},
	'8-marmotte': {
		number: 1
	},
	'9-bateau': {
		number: 2
	},
	'10-falaise': {
		number: 2
	},
	'11-ciel': {
		number: 1
	},
	'12-autoportrait': {
		number: 3
	},
	'13-manga': {
		number: 2
	},
	'14-asgard': {
		number: 1
	},
	'15-aigle': {
		number: 2
	},
	'16-ironman': {
		number: 4
	},
	'17-pub': {
		number: 1
	},
	'18-whisky': {
		number: 1
	},
	'19-chute': {
		number: 4
	},
	'20-impressionnisme': {
		number: 1
	},
	'21-croquis': {
		number: 2
	},
	'22-vieux': {
		number: 1
	},
	'23-platon': {
		number: 1
	},
	'24-bebe': {
		number: 2
	},
	'25-mer': {
		number: 3
	}
}

function createAllPaintings(container) {
	const paintings = Object.keys(DATA)
	paintings.reverse().forEach((painting, i) => {
		const card = document.createElement('div')
		card.classList.add('card')
		card.dataset.type = 'painting'
		card.dataset.id = painting
		card.innerHTML = `
			<div class="image-card overlay-card preview" data-type="drawing" data-id="${painting}">
				<img src="/assets/drawings/preview/${painting}.jpeg" alt="Drawing ${i + 1}" />
				<div class="overlay accent">See more details</div>
			</div>
		`
		container.appendChild(card)
	})
}

const allPaintings = document.querySelector('.all-paintings')
if (allPaintings) {
	createAllPaintings(allPaintings)
}
