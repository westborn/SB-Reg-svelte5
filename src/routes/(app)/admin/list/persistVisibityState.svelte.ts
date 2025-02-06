// this file is a copy of the file from the following link:
// https://github.com/TanStack/table/blob/1e79574b5974974a7972c8e7a803087ac768c1c5/examples/svelte/column-ordering/src/state.svelte.ts

import type { Updater } from '@tanstack/svelte-table';
import { PersistedState } from 'runed';

export function createPersistVisibilityState<T>(initialValue: T): [() => T, (updater: Updater<T>) => void] {
	const value = new PersistedState('persistVisibility', initialValue);

	return [
		() => value.current,
		(updater: Updater<T>) => {
			if (updater instanceof Function) value.current = updater(value.current);
			else value.current = updater;
		}
	];
}
