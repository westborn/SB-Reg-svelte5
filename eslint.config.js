import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				__NAME__: 'readonly',
				__VERSION__: 'readonly',
				__GITHUBURL__: 'readonly',
				__SVELTEVERSION__: 'readonly',
				__SVELTEKITVERSION__: 'readonly',
				__VITEVERSION__: 'readonly',
				__TAILWINDCSSVERSION__: 'readonly'
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'svelte/valid-compile': 'off',
			'svelte/no-unused-svelte-ignore': 'off',
			'no-undef': 'off',
			'no-useless-escape': 'off'
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'package/']
	}
];
