import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		entries: ['./src/routes/**/*']
	},
	server: {
		warmup: {
			clientFiles: ['./src/routes/**/*']
		}
	}
});
