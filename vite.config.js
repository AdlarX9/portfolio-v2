import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				code: resolve(__dirname, 'code.html'),
				paint: resolve(__dirname, 'paint.html'),
				print: resolve(__dirname, 'print.html')
			}
		}
	}
})
