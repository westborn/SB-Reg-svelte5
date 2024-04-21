// import { faker } from "@faker-js/faker";
// import { regstrationTable, entryTable } from '$lib/components/server/db';
import { mockArtistData, mockRegistrationData, mockEntryData, mockImageData } from './data.ts';
import { artistSchema } from '$lib/zod-schemas.ts';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main1() {
	const users = await prisma.artistTable.findMany();
	console.log(users);
}

async function main2() {
	const {
		firstName,
		lastName,
		email,
		postcode,
		bankAccountName,
		bankBSB,
		bankAccount,
		firstNations
	} = mockArtistData[0];
	const data = {
		firstName,
		lastName,
		email,
		postcode,
		bankAccountName,
		bankBSB,
		bankAccount,
		firstNations: firstNations.toUpperCase()
	};
	const result = await prisma.artistTable.create({ data });
}

main2()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});

async function runSeeders() {
	// registrations
	await Promise.all(
		mockRegistrationData.map(async (registration) =>
			prisma.registrationTable.upsert({
				where: { id: registration.id },
				update: {},
				create: registration
			})
		)
	);

	// Posts
	await Promise.all(
		mockEntryData.map(async (entry) =>
			prisma.entryTable.upsert({
				where: { id: entry.id },
				update: {},
				create: entry
			})
		)
	);
}

// runSeeders()
// 	.catch((e) => {
// 		console.error(`There was an error while seeding: ${e}`);
// 		process.exit(1);
// 	})
// 	.finally(async () => {
// 		console.log('Successfully seeded database. Closing connection.');
// 		await prisma.$disconnect();
// 	});
