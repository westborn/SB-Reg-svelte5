import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock SvelteKit runtime module
vi.mock('$app/environment', () => ({
	browser: true, // Set to true for client-side testing
	dev: true,
	building: false,
	version: '1.0.0'
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	preloadData: vi.fn(),
	preloadCode: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	pushState: vi.fn(),
	replaceState: vi.fn()
}));

vi.mock('$app/stores', () => {
	const { readable, writable } = require('svelte/store');

	const getStores = () => ({
		navigating: readable(null),
		page: readable({
			url: new URL('http://localhost'),
			params: {},
			route: { id: null },
			status: 200,
			error: null,
			data: {},
			form: undefined
		}),
		updated: readable(false)
	});

	const page = writable({
		url: new URL('http://localhost'),
		params: {},
		route: { id: null },
		status: 200,
		error: null,
		data: {},
		form: undefined
	});

	const navigating = writable(null);
	const updated = writable(false);

	return { getStores, navigating, page, updated };
});

// Mock mode-watcher for theme toggle tests
vi.mock('mode-watcher', () => ({
	toggleMode: vi.fn(),
	setMode: vi.fn(),
	resetMode: vi.fn(),
	mode: { subscribe: vi.fn() }
}));

// Setup global test environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock fetch for API calls
global.fetch = vi.fn();

// Set up DOM environment
process.env.NODE_ENV = 'test';
