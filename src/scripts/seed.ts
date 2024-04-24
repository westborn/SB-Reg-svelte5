import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

import { Indigenous, EntryType } from '$lib/constants';

const prisma = new PrismaClient();

function makeArtist() {
	const firstName = faker.person.firstName();
	// const firstNations = faker.helpers.enumValue(Indigenous);
	return {
		firstName,
		lastName: faker.person.lastName(),
		email: faker.internet.exampleEmail({ firstName }).toLowerCase(),
		firstNations: faker.helpers.enumValue(Indigenous),
		phone: '04' + faker.string.numeric(8),
		postcode: faker.string.numeric(4),
		bankAccountName: faker.finance.accountName(),
		bankBSB: faker.string.numeric(6),
		bankAccount: faker.finance.accountNumber()
	};
}

function makeRegistration(artistId: number, year: string = '2025') {
	return {
		artistId,
		registrationYear: year,
		bumpIn: faker.date.future().toString(),
		bumpOut: faker.date.future().toString(),
		crane: faker.datatype.boolean(),
		displayRequirements: faker.lorem.words(),
		transport: faker.datatype.boolean(),
		accommodation: faker.datatype.boolean(),
		closed: false
	};
}

function makeEntry(artistId: number, registrationId: number) {
	return {
		artistId,
		registrationId,
		accepted: false,
		enterMajorPrize: faker.datatype.boolean(),
		inOrOut: faker.helpers.enumValue(EntryType),
		title: faker.lorem.words(3),
		material: faker.lorem.words(3),
		dimensions: `${faker.number.int({ min: 10, max: 100 })}x${faker.number.int({ min: 10, max: 100 })}x${faker.number.int({ min: 10, max: 100 })}`,
		description: faker.lorem.sentence({ min: 8, max: 20 }),
		specialRequirements: faker.lorem.words(),
		price: faker.number.int({ min: 100, max: 10000 }) * 100
	};
}

function makeImage(artistId: number, registrationId: number, entryId: number) {
	return {
		artistId,
		registrationId,
		entryId,
		imageURL: faker.image.url(),
		imageFileName: faker.system.fileName(),
		originalFileName: faker.system.fileName()
	};
}

// create an Artist record, a Registration record, and three Entry records with an associated Image record
try {
	const result1 = await prisma.artistTable.create({
		data: makeArtist()
	});
	console.log(`Artist: ${result1.id}`);

	for (let i = 0; i < 2; i++) {
		const year = (2024 + i).toString();
		const result2 = await prisma.registrationTable.create({
			data: makeRegistration(result1.id, year)
		});
		console.log(`Registration: ${result2.id}`);

		for (let i = 0; i < 3; i++) {
			const result3 = await prisma.entryTable.create({
				data: makeEntry(result1.id, result2.id)
			});
			const result4 = await prisma.imageTable.create({
				data: makeImage(result1.id, result2.id, result3.id)
			});
			console.log(`Entry: ${result3.id}`);
			console.log(`Image: ${result4.id}`);
		}
	}
} catch (e) {
	console.error(e);
	process.exit(1);
}

await prisma.$disconnect();
