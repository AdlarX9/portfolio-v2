import { Octokit, App } from 'https://esm.sh/octokit'

const octokit = new Octokit({})
const PROJECTS = [
	'nitflex',
	'project-p',
	'empire',
	'trophees-nsi',
	'3d-engine-ascii',
	'print-it',
	'tweeter',
	'messages',
	'portfolio-v1',
	'particules',
	'playground'
]

const NAME_MAP = {
	nitflex: 'Nitflex',
	'project-p': 'Project P',
	empire: 'Empire',
	'trophees-nsi': "Bletchley's Adventure",
	'3d-engine-ascii': '3D Engine Ascii',
	'print-it': 'Print It',
	tweeter: 'Tweeter',
	messages: 'Messages',
	'portfolio-v1': 'Portfolio V1',
	particules: 'Particules',
	playground: 'Playground'
}

const TROPHEES_DESCRIPTION =
	'an open-world game where players help the Allies win World War II by decrypting Nazi communications. Set in Bletchley Park, the game teaches the origins of cryptography through educational missions featuring systems like Enigma and the Bombe, while remaining fun and engaging.'

/**
 * Récupère les détails de repositories spécifiques avec un minimum de requêtes.
 * @param {string} username - Le nom d'utilisateur GitHub
 * @param {string[]} repoNames - Tableau des noms de repos (ex: ['mon-projet', 'autre-projet'])
 * @returns {Promise<Array>} Liste d'objets contenant les infos demandées
 */
// === !!! Fonction écrite par Gemini 3 Pro !!! ===
async function getReposDetails(username, repoNames) {
	// Pas d'auth token = mode public (limité à 60 requêtes / heure)
	try {
		// ÉTAPE 1 : On récupère les métadonnées en GROS (1 seule requête pour 100 repos max)
		// C'est plus économique que de faire un appel par repo pour avoir les infos de base.
		const { data: allRepos } = await octokit.request('GET /users/{username}/repos', {
			username: username,
			sort: 'updated',
			per_page: 100 // On maximise la taille de page
		})

		// ÉTAPE 2 : On filtre en JS ceux qui nous intéressent
		const targetRepos = allRepos.filter(repo => repoNames.includes(repo.name))

		if (targetRepos.length === 0) {
			console.warn('Aucun repository trouvé correspondant aux noms fournis.')
			return []
		}

		// ÉTAPE 3 : On récupère les langages en parallèle (Obligatoire de faire une requête par repo ici)
		const results = await Promise.all(
			targetRepos.map(async repo => {
				// Requête pour les langages
				const { data: languagesData } = await octokit.request('GET /repos/{owner}/{repo}/languages', {
					owner: username,
					repo: repo.name
				})

				// Calcul des proportions des langages
				const totalBytes = Object.values(languagesData).reduce((a, b) => a + b, 0)
				const languagesFormatted = Object.entries(languagesData).map(([lang, bytes]) => ({
					name: lang,
					percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) + '%' : '0%'
				}))

				// Construction de l'objet final
				return {
					name: repo.name,
					description: repo.description || 'Pas de description',
					// Astuce : Pas besoin d'API pour l'image, on utilise le générateur d'assets GitHub
					imageUrl: `/assets/code/${repo.name}.jpeg`,
					owner: username,
					updatedAt: repo.updated_at.split('T')[0], // Format YYYY-MM-DD
					stars: repo.stargazers_count,
					languages: languagesFormatted
				}
			})
		)

		return results
	} catch (error) {
		console.error('Erreur lors de la récupération GitHub:', error.message)
		// Gestion spécifique du rate limit
		if (error.status === 403) {
			console.error("Limite d'API atteinte (60 req/h en anonyme).")
		}
		return []
	}
}

async function getProjects() {
	return new Promise((res, rej) => {
		let data
		if (localStorage.getItem('codingProjects')) {
			data = JSON.parse(localStorage.getItem('codingProjects'))
			res(data)
		} else {
			getReposDetails('AdlarX9', PROJECTS)
				.then(repos => {
					data = repos
					getReposDetails('Equinoxs', PROJECTS)
						.then(trophees => {
							data = data.concat(trophees)
							data.sort((a, b) => {
								return PROJECTS.indexOf(a.name) - PROJECTS.indexOf(b.name)
							})
							localStorage.setItem('codingProjects', JSON.stringify(data))
							res(data)
						})
						.catch(err => {
							console.error('Erreur lors de la récupération des trophées nsi :', err)
							rej(err)
						})
				})
				.catch(err => {
					console.error('Erreur lors de la récupération des projets :', err)
					rej(err)
				})
		}
	})
}

const COLORS = {
	JavaScript: '#f1e05a',
	HTML: '#e34c26',
	CSS: '#563d7c',
	Python: '#3572A5',
	'C++': '#f34b7d',
	PHP: '#4F5D95',
	Dockerfile: '#384d54',
	Shell: '#89e051',
	SCSS: '#c6538c',
	Go: '#00ADD8'
}

function getCardContent(project) {
	return `
		<img src="${project.imageUrl}" alt="Project ${NAME_MAP[project.name]}">
		<h3 class="subtitle">${NAME_MAP[project.name]}</h3>
		<p class="description white body">${project.name === 'trophees-nsi' ? TROPHEES_DESCRIPTION : project.description}</p>
		<div class="languages sub-body">${project.languages.map(lang => `<div class="languages-pill" style="background: ${COLORS[lang.name] || '#ccc'}"></div>${lang.name} (${lang.percentage})`).join('')}</div>
		<aside>
			<p class="detail-txt"><strong>Last Updated:</strong> ${project.updatedAt}</p>
			<p class="detail-txt"><strong>⭐ Stars:</strong> ${project.stars}</p>
		</aside>
		<a class="overlay" href="https://github.com/${project.owner}/${project.name}" target="_blank" rel="noopener noreferrer">
			<div>See more details</div>
		</a>
	`
}

function createCard(project) {
	const card = document.createElement('div')
	card.classList.add('overlay-card', 'gradient-card', 'program-card')
	card.innerHTML = getCardContent(project)
	return card
}

function createAllCards(container) {
	getProjects().then(projects => {
		console.log(projects)
		projects.forEach(project => {
			const card = createCard(project)
			container.appendChild(card)
		})
	})
}

const INDEX_PROJECTS = ['nitflex', 'project-p', 'trophees-nsi', '3d-engine-ascii']
export function createIndexProgramCards(container) {
	getProjects().then(projects => {
		container.innerHTML = ''
		projects = projects.filter(project => INDEX_PROJECTS.includes(project.name))
		projects.forEach(project => {
			const card = createCard(project)
			container.appendChild(card)
		})
	})
}

const allProjectsContainer = document.querySelector('.all-projects')
if (allProjectsContainer) {
	createAllCards(allProjectsContainer)
}
