import registrations from '$lib/data/2024 Registrations.json';
import entries from '$lib/data/2024 Entries.json';
import images from '$lib/data/2024 Images.json';
import imageMap from '$lib/data/2024 ImageMapping.json';

const uniqueEntries = entries.filter((entry, index, self) => index === self.findIndex((t) => t.title === entry.title));

function getDuplicates<T>(arr: T[], key: keyof T): T[] {
	const seen = new Set();
	const duplicates = new Set<T>();

	arr.forEach((item) => {
		const keyValue = item[key];
		if (seen.has(keyValue)) {
			duplicates.add(item);
		} else {
			seen.add(keyValue);
		}
	});

	return Array.from(duplicates);
}

const duplicateUsersByEmail = getDuplicates(entries, 'title');
console.log('Entries        : ', entries.length);
console.log('Unique titles  : ', uniqueEntries.length);
console.log('# of duplicates: ', duplicateUsersByEmail.length);
