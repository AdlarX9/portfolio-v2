import js from '@eslint/js'
import globals from 'globals'

export default [
	// Chemins ignorés globalement
	{ ignores: ['dist', 'build', 'node_modules'] },

	// Preset base ESLint (flat)
	js.configs.recommended,

	// Bloc projet
	{
		files: ['**/*.{js}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node
			},
			// IMPORTANT: ecmaFeatures doit être sous parserOptions en flat config
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			}
		},
		// Règles explicites (évite les presets legacy)
		rules: {
			'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]
		}
	}
]
