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

// User object returned from supabase
// we need to add isAdmin and proxyEmail to the user object
export interface User {
	id: string;
	aud: string;
	role: string;
	email: string;
	email_confirmed_at: Date;
	phone: string;
	confirmed_at: Date;
	new_email: string;
	email_change_sent_at: Date;
	last_sign_in_at: Date;
	app_metadata: AppMetadata;
	user_metadata: Data;
	identities: Identity[];
	created_at: Date;
	updated_at: Date;
	is_anonymous: boolean;
	isAdmin?: boolean;
	proxyEmail?: string;
}

export interface AppMetadata {
	provider: string;
	providers: string[];
}

export interface Identity {
	identity_id: string;
	id: string;
	user_id: string;
	identity_data: Data;
	provider: string;
	last_sign_in_at: Date;
	created_at: Date;
	updated_at: Date;
	email: string;
}

export interface Data {
	email: string;
	email_verified: boolean;
	phone_verified: boolean;
	sub: string;
}

export type Submission = ThenArg<ReturnType<typeof getSubmission>>;
export const getSubmission = async ({ isAdmin, proxyEmail, email }: User) => {
	const artistEmail = isAdmin ? proxyEmail : email;
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

export type Artists = ThenArg<ReturnType<typeof getArtists>>;
export const getArtists = async () => {
	return await prisma.artistTable.findMany({
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			phone: true
		}
	});
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

export const entryCreate = async (workingEntry: EntryTable) => {
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

export const findAccepted = async (emailToFind: string) => {
	return await prisma.artistTable.findMany({
		where: {
			email: emailToFind,
			entries: {
				some: {
					accepted: true
				}
			}
		},
		select: {
			email: true,
			lastName: true, // Assuming `lastName` maps to `last_name` in your database
			registrations: {
				select: {
					registrationYear: true, // Assuming `registrationYear` maps to `registration_year` in your database
					entries: {
						select: {
							id: true, // This will be returned as `entryId`
							accepted: true,
							images: {
								select: {
									id: true, // This will be returned as `imageId`
									cloudURL: true
								}
							},
							locationTable: {
								select: {
									exhibitNumber: true
								}
							}
						}
					}
				}
			}
		}
	});
};

export type Exhibits = {
	artistId: number;
	email: string;
	lastName: string;
	firstName: string;
	registrationYear: string;
	entryId: number;
	imageId: number;
	cloudURL: string;
	exhibitNumber: string;
};

type Exhibit = {
	artistName: string;
	cloudURL: string;
	description: string;
	registrationYear: string;
	exhibitNumber: string;
	inOrOut: string;
	majorPrize?: string;
	material: string;
	price: string;
	dimensions: string;
	title: string;
	email: string;
	artistId: number;
	entryId: number;
	imageId: number;
};

export const getExhibits = async ({ rows, offset }: { rows: number; offset: number }): Promise<Exhibits[]> => {
	const exhibits: Exhibits[] = await prisma.$queryRaw`select
		artist.id as "artistId",
		artist.email,
		artist.last_name as "lastName",
		artist.first_name as "firstName",
		concat(artist.first_name, ' ', artist.last_name) as "artistName",
		registration.registration_year as "registrationYear",
		entry.id as "entryId",
		entry.description,
		entry.dimensions,
		entry.in_or_out as "inOrOut",
		entry.enter_major_prize as "majorPrize",
		entry.material,
		entry.title,
		entry.price_in_cents as "price",
		image.id as "imageId",
		image.cloud_url as "cloudURL",
		location."exhibitNumber"
		from
		artist
		join registration on artist.id = registration.artist_id
		join entry on registration.id = entry.registration_id
		join location on entry.id = location."entryId"
		join image on entry.id = image.entry_id
		where
		-- artist.email = 'epsilonartist@gmail.com' AND
		entry.accepted = true
		order by location."exhibitNumber" asc
		OFFSET ${offset} ROWS
		LIMIT ${rows}
		`;
	return exhibits;
};
