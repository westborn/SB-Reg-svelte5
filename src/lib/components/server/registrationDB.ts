import { prisma } from '$lib/components/server/prisma';
import { ExhibitionYear } from '$lib/constants';

import { EntryType } from '$lib/constants';
import type { EntryTable, ImageTable } from '$lib/zod-schemas';

// Two different ways to add types from a prisma query

// // https://www.prisma.io/docs/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types
// // Extract Type `Submission` from result of the "getSubmission" function
// type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
// export type Submission = ThenArg<ReturnType<typeof getSubmission>>;
// // OR
// import { Prisma } from '@prisma/client';
// type Submisssion_alt = Prisma.PromiseReturnType<typeof getSubmission>;

//I choose ths way!
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
// also this for unpacking an array Element
type Unpacked<T> = T extends (infer U)[] ? U : T;

export type Submission = ThenArg<ReturnType<typeof getSubmission>>;
export const getSubmission = async (artistEmail: string) => {
	const submission = await prisma.artistTable.findFirst({
		where: {
			email: artistEmail
		},
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			phone: true,
			postcode: true,
			firstNations: true,
			bankAccountName: true,
			bankBSB: true,
			bankAccount: true,
			registrations: {
				where: { registrationYear: ExhibitionYear.toString() },
				select: {
					id: true,
					artistId: true,
					registrationYear: true,
					closed: true,
					bumpIn: true,
					bumpOut: true,
					displayRequirements: true,
					accommodation: true,
					crane: true,
					transport: true,
					entries: {
						select: {
							id: true,
							artistId: true,
							registrationId: true,
							accepted: true,
							inOrOut: true,
							title: true,
							material: true,
							dimensions: true,
							description: true,
							specialRequirements: true,
							enterMajorPrize: true,
							price: true,
							images: {
								select: {
									id: true,
									registrationId: true,
									entryId: true,
									originalFileName: true,
									cloudId: true,
									cloudURL: true
								}
							}
						}
					}
				}
			}
		}
	});
	return submission;
};

type ReturnedEntriesEntry = Omit<EntryTable, 'createdAt' | 'updatedAt'>;
type ReturnedEntriesImage = Pick<ImageTable, 'id' | 'originalFileName' | 'cloudId' | 'cloudURL'>;
export type ReturnedEntry = ReturnedEntriesEntry & { images: ReturnedEntriesImage[] };
export type ReturnedEntries = ReturnedEntry[];

export type CurrentRegistration = ThenArg<ReturnType<typeof getEntries>>;
export const getEntries = async (artistEmail: string) => {
	const entries = await prisma.artistTable.findFirst({
		where: { email: artistEmail },
		select: {
			registrations: {
				where: { registrationYear: ExhibitionYear.toString() },
				select: {
					entries: {
						select: {
							id: true,
							artistId: true,
							registrationId: true,
							accepted: true,
							inOrOut: true,
							title: true,
							material: true,
							dimensions: true,
							description: true,
							specialRequirements: true,
							enterMajorPrize: true,
							price: true,
							images: {
								select: {
									id: true,
									originalFileName: true,
									cloudId: true,
									cloudURL: true
								}
							}
						}
					}
				}
			}
		}
	});
	return entries;
};

export const createNewRegistration = async (artistId: number) => {
	const registration = await prisma.registrationTable.create({
		data: {
			artistId,
			registrationYear: ExhibitionYear.toString(),
			closed: false,
			bumpIn: '',
			bumpOut: '',
			displayRequirements: '',
			accommodation: false,
			crane: false,
			transport: false
		}
	});
	return registration;
};

export const createEntry = async (workingEntry: EntryTable) => {
	const {
		artistId,
		registrationId,
		accepted,
		inOrOut,
		title,
		material,
		dimensions,
		description,
		specialRequirements,
		enterMajorPrize,
		price
	} = workingEntry;

	const entry = await prisma.entryTable.create({
		data: {
			artistId,
			registrationId,
			accepted,
			inOrOut: EntryType[inOrOut as keyof typeof EntryType],
			title: title ?? '',
			material,
			dimensions,
			description,
			specialRequirements,
			enterMajorPrize,
			price: price ?? 0
		}
	});
	return entry;
};

export type CurrentEntry = ThenArg<ReturnType<typeof getEntry>>;
export const getEntry = async (id: number) => {
	const entry = await prisma.entryTable.findFirst({
		where: { id: id },
		select: {
			id: true,
			artistId: true,
			registrationId: true,
			accepted: true,
			inOrOut: true,
			title: true,
			material: true,
			dimensions: true,
			description: true,
			specialRequirements: true,
			enterMajorPrize: true,
			price: true
		}
	});
	return entry;
};

export type CurrentImage = ThenArg<ReturnType<typeof getImage>>;
export const getImage = async (id: number) => {
	const image = await prisma.imageTable.findFirst({
		where: { id: id },
		select: {
			id: true,
			artistId: true,
			registrationId: true,
			entryId: true,
			originalFileName: true,
			cloudId: true,
			cloudURL: true
		}
	});
	return image;
};

export type CurrentEntryImages = ThenArg<ReturnType<typeof getEntryImages>>;
export const getEntryImages = async (entryId: number) => {
	const images = await prisma.imageTable.findMany({
		where: { entryId: entryId },
		select: {
			id: true,
			artistId: true,
			registrationId: true,
			entryId: true,
			originalFileName: true,
			cloudId: true,
			cloudURL: true
		}
	});
	return images;
};

export const createImage = async (workingImage: CurrentImage) => {
	const { artistId, registrationId = null, entryId = null, cloudId, cloudURL, originalFileName } = Object(workingImage);
	const image = await prisma.imageTable.create({
		data: {
			artistId,
			registrationId,
			entryId,
			cloudId,
			cloudURL,
			originalFileName
		},
		select: {
			id: true,
			artistId: true,
			registrationId: true,
			entryId: true,
			cloudId: true,
			cloudURL: true,
			originalFileName: true
		}
	});
	return image;
};
