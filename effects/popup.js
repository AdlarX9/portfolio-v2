import { Effect } from '../app/effects.js'
import { DATA as DRAWINGS_DATA } from '../paint/script.js'
import { MODELS_DATA, DATA as PRINTS_DATA } from '../print/script.js'

// utils
const DATA = {
	drawing: DRAWINGS_DATA,
	print: PRINTS_DATA,
	model: MODELS_DATA
}

// --- CSS DU LOADER ET TRANSITIONS ---
const styles = `
    .popup-loader {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 40px; height: 40px;
        border: 3px solid rgba(255,255,255,0.1);
        border-top-color: #fff; /* ou var(--accent) */
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        z-index: 10;
        transition: opacity 0.3s;
    }
    @keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
    
    .popup-content-wrapper {
        opacity: 0;
        transition: opacity 0.5s ease;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .popup-content-visible {
        opacity: 1;
    }
`

const popup = document.createElement('div')
popup.classList.add('popup')

// Gestion fermeture
popup.onclick = e => {
	// On autorise le clic sur l'image, les boutons et le wrapper (pour ne pas fermer si on rate le bouton de peu)
	if (!e.target.closest('.swiper-wrapper') && !e.target.closest('button')) {
		closePopup()
	}
}

function closePopup() {
	const swiperContainers = document.querySelectorAll('.swiper')
	swiperContainers.forEach(element => {
		if (element.swiper) {
			element.swiper.destroy(true, true)
		}
	})

	popup.innerHTML = ''
	popup.style.display = 'none'
	document.body.style.overflow = '' // On réactive le scroll body
}

let swiperThumbs = null
let swiperMain = null
let previewCards = []
let cardClickHandlers = new Map()

function createSlides(type, id, format) {
	const data = DATA[type][id]
	let slides = ''
	// Détection du nombre d'images
	const count = data.number || 1 // Fallback à 1 si non défini

	if (count > 1) {
		for (let i = count; i >= 1; i--) {
			// Pas de loading="lazy" ici car on veut les charger manuellement pour le loader
			slides += `
				<div class="swiper-slide ${format === 'big' ? 'big-slide' : 'small-slide'}">
					<img src="/assets/${type}s/high/${id}/${i}.jpeg" alt="Artwork detail" />
				</div>
			`
		}
	} else {
		slides = `
			<div class="swiper-slide ${format === 'big' ? 'big-slide' : 'small-slide'}">
				<img src="/assets/${type}s/high/${id}.jpeg" alt="Artwork" />
			</div>
		`
	}
	return slides
}

function createPopupContent(type, id) {
	const bigSlides = createSlides(type, id, 'big')
	const smallSlides = createSlides(type, id, 'small')
	return `
		<div class="close-btn-popup" onclick="this.parentElement.click()">X</div>
        
        <!-- LE LOADER -->
        <div class="popup-loader"></div>

        <!-- LE CONTENU (Caché au début via CSS) -->
        <div class="popup-content-wrapper">
            <div class="swiper big-slider">
                <div class="swiper-wrapper">
                    ${bigSlides}
                </div>
                <button class="swiper-button-next"></button>
                <button class="swiper-button-prev"></button>
            </div>
            <div thumbsSlider="" class="swiper small-slider ">
                <div class="swiper-wrapper small-swiper-wrapper">
                    ${smallSlides}
                </div>
            </div>
        </div>
	`
}

function onClick(card) {
	const type = card.dataset.type
	const id = card.dataset.id

	// 1. On prépare le DOM
	const content = createPopupContent(type, id)
	popup.innerHTML = content
	popup.style.display = 'flex'
	document.body.style.overflow = 'hidden' // Bloque le scroll arrière-plan

	if (swiperThumbs) swiperThumbs.destroy()
	if (swiperMain) swiperMain.destroy()

	// 2. Logique de chargement des images
	const wrapper = popup.querySelector('.popup-content-wrapper')
	const loader = popup.querySelector('.popup-loader')
	// On cible uniquement les grandes images
	const imagesToLoad = Array.from(popup.querySelectorAll('.big-slider img'))

	// Création des promesses de chargement
	const imagePromises = imagesToLoad.map(img => {
		if (img.complete) return Promise.resolve()
		return new Promise(resolve => {
			img.onload = resolve
			img.onerror = resolve // On résout même si erreur pour pas bloquer
		})
	})

	// 3. Attente de la fin du chargement
	Promise.all(imagePromises).then(() => {
		// C'est chargé !

		// On cache le loader
		if (loader) loader.style.opacity = '0'

		// On révèle le contenu
		if (wrapper) wrapper.classList.add('popup-content-visible')

		// On initialise Swiper (maintenant que les images ont leur taille)
		initSwipers()

		// Nettoyage DOM du loader après transition
		setTimeout(() => {
			if (loader) loader.remove()
		}, 300)
	})
}

function initSwipers() {
	// Sécurité si l'user a fermé la popup pendant le chargement
	if (popup.style.display === 'none') return

	swiperThumbs = new Swiper('.small-slider', {
		spaceBetween: 10,
		slidesPerView: 4,
		freeMode: true,
		watchSlidesProgress: true
	})

	swiperMain = new Swiper('.big-slider', {
		spaceBetween: 10,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev'
		},
		thumbs: {
			swiper: swiperThumbs
		}
	})
}

// load
function load() {
	// Injection des styles
	const styleSheet = document.createElement('style')
	styleSheet.innerText = styles
	document.head.appendChild(styleSheet)

	document.body.appendChild(popup)

	setTimeout(() => {
		previewCards = Array.from(document.querySelectorAll('.preview'))
		previewCards.forEach(card => {
			const handler = () => onClick(card)
			cardClickHandlers.set(card, handler)
			card.addEventListener('click', handler)
		})
	}, 500)
}

// cleanup
function cleanup() {
	previewCards.forEach(card => {
		const handler = cardClickHandlers.get(card)
		if (handler) {
			card.removeEventListener('click', handler)
		}
	})
	cardClickHandlers.clear()
	previewCards = []

	if (swiperThumbs) {
		swiperThumbs.destroy(true, true)
		swiperThumbs = null
	}
	if (swiperMain) {
		swiperMain.destroy(true, true)
		swiperMain = null
	}

	if (popup.parentNode) {
		popup.parentNode.removeChild(popup)
	}
}

const popupEffect = new Effect()
popupEffect.mobile = true
popupEffect.smallScreen = true
popupEffect.load = load
popupEffect.cleanup = cleanup

export default popupEffect
