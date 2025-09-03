import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./src/tests/setup.ts'],
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			exclude: [
				'node_modules/',
				'src/tests/',
				'**/*.test.{js,ts}',
				'**/*.spec.{js,ts}',
				'src/scripts/',
				'src/data/',
				'**/*.d.ts'
			]
		},
		// Add this to handle Svelte 5 SSR issues in tests
		server: {
			deps: {
				inline: ['@testing-library/svelte']
			}
		}
	}
});
