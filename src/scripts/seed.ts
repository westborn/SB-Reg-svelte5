const Indigenous = {
	No: 'No',
	Yes: 'Yes',
	Declined: 'Declined'
} as const;

const EntryType = {
	Indoor: 'Indoor',
	Outdoor: 'Outdoor'
} as const;

import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function makeArtist(email: string) {
	return {
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		email,
		firstNations: faker.helpers.enumValue(Indigenous),
		phone: '04' + faker.string.numeric(8),
		postcode: faker.string.numeric(4),
		// bankAccountName: faker.finance.accountName(),
		bankAccountName: email,
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
		cloudId: faker.string.alphanumeric(20),
		cloudURL: faker.image.url(),
		originalFileName: faker.system.fileName()
	};
}

async function artistCreate(email: string) {
	const artist = await prisma.artistTable.create({
		data: makeArtist(email)
	});
	console.log(`Artist: ${artist.id}`);
	return artist;
}

async function createRegistration(artistId: number, year: string) {
	const registration = await prisma.registrationTable.create({
		data: makeRegistration(artistId, year)
	});
	console.log(`Registration: ${registration.id}`);
	return registration;
}

async function entryCreate(artistId: number, registrationId: number) {
	const entry = await prisma.entryTable.create({
		data: makeEntry(artistId, registrationId)
	});
	console.log(`Entry: ${entry.id}`);
	return entry;
}

async function createImage(artistId: number, registrationId: number, entryId: number) {
	const image = await prisma.imageTable.create({
		data: makeImage(artistId, registrationId, entryId)
	});
	console.log(`Image: ${image.id}`);
	return image;
}

// create an Artist record, 2 Registration records (2024 and 2025), and three Entry records each with an associated Image record
try {
	const artist = await artistCreate('full@example.com');
	for (let i = 0; i < 2; i++) {
		const year = (2024 + i).toString();
		const registration = await createRegistration(artist.id, year);
		for (let i = 0; i < 3; i++) {
			const entry = await entryCreate(artist.id, registration.id);
			const image = await createImage(artist.id, registration.id, entry.id);
		}
	}
} catch (e) {
	console.error(e);
	process.exit(1);
}

//and for my email address
try {
	const artist = await artistCreate('george@westborn.com.au');
	for (let i = 0; i < 2; i++) {
		const year = (2024 + i).toString();
		const registration = await createRegistration(artist.id, year);
		for (let i = 0; i < 3; i++) {
			const entry = await entryCreate(artist.id, registration.id);
			const image = await createImage(artist.id, registration.id, entry.id);
		}
	}
} catch (e) {
	console.error(e);
	process.exit(1);
}

// create an Artist record only
try {
	const artist = await artistCreate('artist@example.com');
} catch (e) {
	console.error(e);
	process.exit(1);
}

// create an Artist record, with 2 Registration records (2024 and 2025) - entries for 2024 only
try {
	const artist = await artistCreate('regOnly@example.com');
	const registration = await createRegistration(artist.id, '2024');
	for (let i = 0; i < 3; i++) {
		const entry = await entryCreate(artist.id, registration.id);
		const image = await createImage(artist.id, registration.id, entry.id);
	}
	const registration2 = await createRegistration(artist.id, '2025');
} catch (e) {
	console.error(e);
	process.exit(1);
}

await prisma.$disconnect();
