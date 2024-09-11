import { Indigenous, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import registrations from '$lib/data/2024 Registrations.json';
import entries from '$lib/data/2024 Entries.json';
import images from '$lib/data/2024 Images.json';
import imageMap from '$lib/data/2024 ImageMapping.json';

async function makeSubmission() {
	const exhibits = imageMap.map((item) => item).sort((a, b) => a.entryId.localeCompare(b.entryId));
	const artistMap = new Map();
	const registrationMap = new Map();

	// create artist and registration records if not already created
	for (const exhibit of exhibits) {
		if (!artistMap.has(exhibit.email)) {
			const registration = registrations.find((item) => exhibit.registrationId === item.registrationId);
			if (registration) {
				const newArtist = {
					firstName: registration.firstName as string,
					lastName: registration.lastName as string,
					email: registration.email as string,
					firstNations: registration.firstNations as Indigenous,
					phone: registration.phone as string,
					postcode: registration.postcode as string,
					bankAccountName: registration.bankAccountName as string,
					bankBSB: registration.bankBSB as string,
					bankAccount: registration.bankAccount as string
				};
				const artist = await prisma.artistTable.create({
					data: newArtist
				});
				console.log('Artist: ', artist.id);
				artistMap.set(exhibit.email, artist.id);

				const newRegistration = {
					artistId: artist.id,
					registrationYear: '2024',
					closed: true,
					bumpIn: registration.bumpIn as string,
					bumpOut: registration.bumpOut as string,
					displayRequirements: registration.displayRequirements as string,
					accommodation: registration.accommodation == 'Yes' ? true : false,
					crane: registration.crane == 'Yes' ? true : false,
					transport: registration.transport == 'Yes' ? true : false
				};
				const registrationDB = await prisma.registrationTable.create({
					data: newRegistration
				});
				console.log('Registration: ', registrationDB.id);
				registrationMap.set(exhibit.email, registrationDB.id);
			}
		}
		// now create entry record
		let entryDB;
		const entry = entries.find((item) => exhibit.entryId === item.entryId);
		if (entry) {
			const newEntry = {
				artistId: artistMap.get(exhibit.email),
				registrationId: registrationMap.get(exhibit.email),
				accepted: true,
				inOrOut: entry.inOrOut as string,
				title: entry.title as string,
				material: entry.material as string,
				dimensions: entry.dimensions as string,
				description: entry.description as string,
				specialRequirements: entry.specialRequirements as string,
				enterMajorPrize: entry.enterMajorPrize == 'Yes' ? true : false,
				price: entry.price as number
			};
			entryDB = await prisma.entryTable.create({
				data: newEntry
			});
			console.log('Entry: ', entryDB.id);

			//create a new locationTable record
			const newLocation = {
				entryId: entryDB.id,
				exhibitNumber: exhibit.locationId.toString()
			};
			entryDB = await prisma.locationTable.create({
				data: newLocation
			});
		}
		// now create image record
		const image = images.find((item) => exhibit.entryId === item.entryId);
		if (image) {
			const newImage = {
				artistId: artistMap.get(exhibit.email),
				registrationId: registrationMap.get(exhibit.email),
				originalFileName: image.originalFileName ?? ('' as string),
				cloudId: exhibit.cloudinaryId as string,
				cloudURL: exhibit.cloudinaryURL as string
			};
			const imageDB = await prisma.imageTable.create({
				data: newImage
			});
			console.log('Image: ', imageDB.id);
		}
	}

	// create registration records
	// create entry records
	// create image records
	console.log('Exhibits: ', exhibits.length);
	console.log('Registrations: ', registrationMap.size);
	console.log('Artists: ', artistMap.size);

	return 'Submission complete';
}

const res = makeSubmission();
console.log('Res: ', res);

await prisma.$disconnect();
