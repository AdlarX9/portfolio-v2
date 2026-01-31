import { Octokit, App } from 'https://esm.sh/octokit'

const octokit = new Octokit({})
const PROJECTS = ['nitflex', 'project-p', 'throphees-nsi', '3d-engine-ascii']
const NAME_MAP = {
	'nitflex': 'Nitflex',
	'project-p': 'Project P',
	'throphees-nsi': 'Trophées NSI',
	'3d-engine-ascii': '3D Engine Ascii'
}

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
					imageUrl: `https://opengraph.githubassets.com/1/${username}/${repo.name}`,
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
				localStorage.setItem('codingProjects', JSON.stringify(data))
				res(data)
			})
			.catch(err => {
				console.error('Erreur lors de la récupération des projets :', err)
				rej(err)
			})
		}
	})
}

const INDEX_PROJECTS = ['nitflex', 'project-p', 'throphees-nsi', '3d-engine-ascii']
export function createIndexProgramCards(container) {
	getProjects().then(projects => {
		projects = projects.filter(project => INDEX_PROJECTS.includes(project.name))
		projects.forEach(project => {
			console.log(project)
			const card = document.createElement('div')
			card.classList.add('program-card')
			card.innerHTML = `
				<img src="${project.imageUrl}" alt="Project ${NAME_MAP[project.name]}">
				<h3>${NAME_MAP[project.name]}</h3>
				<p class="description">${project.description}</p>
				<p class="languages">${project.languages.map(lang => `${lang.name} (${lang.percentage})`).join(', ')}</p>
				<aside>
					<p><strong>Last Updated:</strong> ${project.updatedAt}</p>
					<p><strong>⭐ Stars:</strong> ${project.stars}</p>
				</aside>
			`
			container.appendChild(card)
		})
	})
}
