// this file is a copy of the file from the following link:
// https://github.com/TanStack/table/blob/1e79574b5974974a7972c8e7a803087ac768c1c5/examples/svelte/column-ordering/src/state.svelte.ts

import type { Updater } from '@tanstack/svelte-table';

export function createTableState<T>(initialValue: T): [() => T, (updater: Updater<T>) => void] {
	let value = $state(initialValue);

	return [
		() => value,
		(updater: Updater<T>) => {
			if (updater instanceof Function) value = updater(value);
			else value = updater;
		}
	];
}
