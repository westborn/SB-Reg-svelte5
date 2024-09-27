import { EntryType, Indigenous, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import registrations from '$lib/data/2023 Registrations.json';
import entries from '$lib/data/2023 Entries.json';
import images from '$lib/data/2023 Images.json';
import imageMap from '$lib/data/2023 ImageMapping.json';
import { Extensions } from '@prisma/client/runtime/library';

async function makeMaps() {
	const artists = await prisma.artistTable.findMany({
		select: {
			id: true,
			email: true,
			registrations: {
				select: {
					id: true,
					registrationYear: true
				}
			}
		}
	});
	const artistMapEmailToId = new Map() as ArtistMapEmailToId;
	const registrationMapEmailToId = new Map() as RegistrationMapEmailToId;
	artists.forEach((artist) => {
		artistMapEmailToId.set(artist.email.toLowerCase(), artist.id);
		artist.registrations.forEach((registration) => {
			if (registration.registrationYear === '2023') {
				registrationMapEmailToId.set(artist.email.toLowerCase(), registration.id);
			}
		});
		// console.log(
		// 	`Artist: ${artist.email}${
		// 		registrationMapEmailToId.has(artist.email.toLowerCase())
		// 			? ' - Registration:' + registrationMapEmailToId.get(artist.email.toLowerCase())
		// 			: ''
		// 	}`
		// );
	});
	return { artistMapEmailToId, registrationMapEmailToId };
}

type Exhibit = {
	locationId: number;
	email: string;
	registrationId: string;
	entryId: string;
	imageId: string;
	googleId: string;
	googleURL: string;
	cloudinaryId: string;
	cloudinaryURL: string;
};

type ArtistMapEmailToId = Map<string, number>;
type RegistrationMapEmailToId = Map<string, number>;

async function makeRegistration(exhibit: Exhibit) {
	// if no existing artist - create one
	if (!artistMapEmailToId.has(exhibit.email.toLowerCase())) {
		const registration = registrations.find((item) => exhibit.registrationId === item.registrationId);
		if (!registration) {
			throw new Error(`Artists JSON Registration not found: ${exhibit.email}`);
		}
		const newArtist = {
			firstName: String(registration.firstName),
			lastName: String(registration.lastName),
			email: String(registration.email.toLowerCase()),
			firstNations: 'No' as Indigenous,
			phone: String(registration.phone),
			postcode: String(registration.postcode),
			bankAccountName: String(registration.bankAccountName),
			bankBSB: String(registration.bankBSB),
			bankAccount: String(registration.bankAccount)
		};
		const artistDB = await prisma.artistTable.create({
			data: newArtist
		});
		artistMapEmailToId.set(exhibit.email.toLowerCase(), artistDB.id);
		console.log('Artist: ', artistMapEmailToId.get(exhibit.email.toLowerCase()), registration.email);
	} else {
		console.log('Artist exists: ', exhibit.email, artistMapEmailToId.get(exhibit.email.toLowerCase()));
	}
	// if no existing registration - create one
	if (!registrationMapEmailToId.has(exhibit.email.toLowerCase())) {
		const registration = registrations.find((item) => exhibit.registrationId === item.registrationId);
		if (!registration) {
			throw new Error(`Registration JSON Registration not found: ${exhibit.email}`);
		}
		const newRegistration = {
			artistId: artistMapEmailToId.get(exhibit.email.toLowerCase())!,
			registrationYear: '2023',
			closed: true,
			bumpIn: String(registration.bumpIn ?? ''),
			bumpOut: String(registration.bumpOut ?? ''),
			displayRequirements: String(registration.displayRequirements ?? ''),
			accommodation: String(registration.accommodation ?? 'No') == 'Yes' ? true : false,
			crane: String(registration.crane ?? 'No') == 'Yes' ? true : false,
			transport: String(registration.transport ?? 'No') == 'Yes' ? true : false
		};
		const registrationDB = await prisma.registrationTable.create({
			data: newRegistration
		});
		registrationMapEmailToId.set(exhibit.email.toLowerCase(), registrationDB.id);
		console.log(
			'Registration: ',
			registrationDB.id,
			'artist:',
			artistMapEmailToId.get(exhibit.email.toLowerCase()),
			registration.email
		);
	} else {
		console.log(
			'Registration exists: ',
			registrationMapEmailToId.get(exhibit.email.toLowerCase()),
			'artist:',
			artistMapEmailToId.get(exhibit.email.toLowerCase()),
			exhibit.email
		);
	}
	return;
}

async function makeSubmission() {
	// console.log('artistMapEmailToId', artistMapEmailToId.keys());
	const exhibits = imageMap.map((item) => item).sort((a, b) => a.entryId.localeCompare(b.entryId));
	// console.log(
	// 	'Exhibits: ',
	// 	exhibits.slice(0, 5).map((item) => item.email)
	// );
	for (const exhibit of exhibits) {
		// create artist and registration records if not already created
		console.log(
			'working on: ',
			exhibit.email,
			'Entry:',
			exhibit.entryId,
			'Artist',
			artistMapEmailToId.get(exhibit.email.toLowerCase())
		);
		await makeRegistration(exhibit);
		// now create entry record
		let entryDB;
		// console.log('Registration Map: ', registrationMapEmailToId.size);
		// console.log('registration: ', registrationMapEmailToId.get(exhibit.email));
		const entry = entries.find((item) => exhibit.entryId === item.entryId);
		let entryId = 0;
		if (entry) {
			console.log(
				`Entry: ${artistMapEmailToId.get(exhibit.email.toLowerCase())}${
					registrationMapEmailToId.has(exhibit.email.toLowerCase())
						? ' - Registration:' + registrationMapEmailToId.get(exhibit.email.toLowerCase())
						: '   none'
				}`
			);
			// process.exit();
			const newEntry = {
				artistId: artistMapEmailToId.get(exhibit.email.toLowerCase()) as number,
				registrationId: registrationMapEmailToId.get(exhibit.email.toLowerCase()) as number,
				accepted: true,
				inOrOut: entry.inOrOut as EntryType,
				title: String(entry.title ?? ''),
				material: String(entry.material ?? ''),
				dimensions: String(entry.dimensions ?? ''),
				description: String(entry.description ?? ''),
				specialRequirements: String(entry.specialRequirements ?? ''),
				enterMajorPrize: (entry.enterMajorPrize ?? 'No') == 'Yes' ? true : false,
				price: ((entry.price ?? 0) * 100) as number
			};
			entryDB = await prisma.entryTable.create({
				data: newEntry
			});
			// console.log('Entry: ', entryDB.id);
			entryId = entryDB.id;

			//create a new locationTable record
			const newLocation = {
				entryId: entryDB.id,
				exhibitNumber: exhibit.locationId.toString()
			};
			const locationDB = await prisma.locationTable.create({
				data: newLocation
			});

			// now create image record
			const image = images.find((item) => exhibit.entryId === item.entryId);
			if (image) {
				const newImage = {
					artistId: artistMapEmailToId.get(exhibit.email.toLowerCase())!,
					registrationId: registrationMapEmailToId.get(exhibit.email.toLowerCase())!,
					entryId: entryId,
					originalFileName: String(image.originalFileName ?? ''),
					cloudId: String(exhibit.cloudinaryId ?? ''),
					cloudURL: String(exhibit.cloudinaryURL ?? '')
				};
				const imageDB = await prisma.imageTable.create({
					data: newImage
				});
				// console.log('Image: ', imageDB.id);
			}
		}
	}
}

const { artistMapEmailToId, registrationMapEmailToId } = await makeMaps();
console.log('Starting # Artists: ', artistMapEmailToId.size);
console.log('Starting # Registrations: ', registrationMapEmailToId.size);
console.log('Starting Exhibits: ', imageMap.length);
console.log('---------------------------------------------------');

await makeSubmission();

console.log('---------------------------------------------------');
console.log('Ending Registrations: ', registrationMapEmailToId.size);
console.log('Ending Artists: ', artistMapEmailToId.size);

await prisma.$disconnect();
