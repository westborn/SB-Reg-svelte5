import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import pkg from './package.json' with { type: 'json' };
import sveltePackage from './node_modules/svelte/package.json' with { type: 'json' };
import svelteKitPackage from './node_modules/@sveltejs/kit/package.json' with { type: 'json' };
import vitePackage from './node_modules/vite/package.json' with { type: 'json' };
import tailwindcssPackage from './node_modules/tailwindcss/package.json' with { type: 'json' };

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			// Keep the documented Superforms import path in app code, but resolve it
			// to the local Zod-only shim so Vite doesn't include unused adapters.
			'sveltekit-superforms/adapters': fileURLToPath(new URL('./src/lib/superforms-zod.ts', import.meta.url))
		}
	},
	define: {
		__NAME__: JSON.stringify(pkg.name),
		__VERSION__: JSON.stringify(pkg.version),
		__GITHUBURL__: JSON.stringify(pkg.repository.url),
		__SVELTEVERSION__: JSON.stringify(sveltePackage.version),
		__SVELTEKITVERSION__: JSON.stringify(svelteKitPackage.version),
		__VITEVERSION__: JSON.stringify(vitePackage.version),
		__TAILWINDCSSVERSION__: JSON.stringify(tailwindcssPackage.version)
	}
});
