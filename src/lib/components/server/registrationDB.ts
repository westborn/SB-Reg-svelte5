import { prisma } from '$lib/components/server/prisma';
import { EXHIBITION_YEAR, MIN_IMAGES_PER_ENTRY } from '$lib/constants';

import { EntryType } from '$lib/constants';
import type { EntryTable, ImageTable, PrimaryImageTable } from '$lib/zod-schemas';

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
	isSuperAdmin?: boolean;
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
export const getSubmission = async ({ isSuperAdmin, proxyEmail, email }: User) => {
	const artistEmail = isSuperAdmin ? proxyEmail : email;
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
				where: { registrationYear: EXHIBITION_YEAR },
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
							price: true,
							sold: true,
							images: {
								select: {
									id: true,
									registrationId: true,
									entryId: true,
									originalFileName: true,
									cloudId: true,
									cloudURL: true
								}
							},
							primaryImage: {
								select: {
									id: true,
									entryId: true,
									imageId: true,
									image: {
										select: {
											id: true,
											cloudId: true,
											cloudURL: true,
											originalFileName: true
										}
									}
								}
							}
						},
						orderBy: {
							title: 'asc'
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
				where: { registrationYear: EXHIBITION_YEAR },
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
							price: true,
							sold: true,
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
			registrationYear: EXHIBITION_YEAR,
			closed: false,
			bumpIn: '',
			bumpOut: '',
			displayRequirements: '',
			crane: false
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
			enterMajorPrize: true,
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
			price: true,
			sold: true
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

/////////////////////////////////////////
// MULTIPLE IMAGES HELPER FUNCTIONS
/////////////////////////////////////////

export type EntryImagesWithPrimary = ThenArg<ReturnType<typeof getEntryImagesWithPrimary>>;
export const getEntryImagesWithPrimary = async (entryId: number) => {
	const entry = await prisma.entryTable.findUnique({
		where: { id: entryId },
		select: {
			images: {
				select: {
					id: true,
					artistId: true,
					registrationId: true,
					entryId: true,
					originalFileName: true,
					cloudId: true,
					cloudURL: true
				},
				orderBy: { createdAt: 'asc' }
			},
			primaryImage: {
				select: {
					imageId: true,
					image: {
						select: {
							id: true,
							cloudId: true,
							cloudURL: true,
							originalFileName: true
						}
					}
				}
			}
		}
	});

	if (!entry) return null;

	// Mark primary image in the images array
	const imagesWithPrimary = entry.images.map((image) => ({
		...image,
		isPrimary: entry.primaryImage?.imageId === image.id
	}));

	return {
		images: imagesWithPrimary,
		primaryImageId: entry.primaryImage?.imageId || null
	};
};

export const setPrimaryImage = async (entryId: number, imageId: number) => {
	// Verify the image belongs to this entry
	const image = await prisma.imageTable.findFirst({
		where: { id: imageId, entryId: entryId }
	});

	if (!image) {
		throw new Error('Image not found or does not belong to this entry');
	}

	// Update or create primary image relationship
	await prisma.primaryImageTable.upsert({
		where: { entryId: entryId },
		update: { imageId: imageId },
		create: { entryId: entryId, imageId: imageId }
	});

	return true;
};

export const deleteImage = async (imageId: number, entryId: number) => {
	// Validate that entry has more than minimum required images
	const entryImages = await prisma.imageTable.findMany({
		where: { entryId: entryId }
	});

	if (entryImages.length <= MIN_IMAGES_PER_ENTRY) {
		throw new Error('Cannot delete the last remaining image. Entry must have at least one image.');
	}

	// Check if this is the primary image
	const primaryImage = await prisma.primaryImageTable.findUnique({
		where: { entryId: entryId }
	});

	const isDeletingPrimary = primaryImage?.imageId === imageId;

	// If deleting primary image, reassign primary to first remaining image
	if (isDeletingPrimary) {
		const remainingImages = entryImages.filter((img) => img.id !== imageId);
		if (remainingImages.length > 0) {
			await prisma.primaryImageTable.update({
				where: { entryId: entryId },
				data: { imageId: remainingImages[0].id }
			});
		}
	}

	// Delete the image
	await prisma.imageTable.delete({
		where: { id: imageId }
	});

	return { deletedPrimaryImage: isDeletingPrimary };
};

export const createPrimaryImageRelation = async (entryId: number, imageId: number) => {
	const primaryImage = await prisma.primaryImageTable.create({
		data: {
			entryId: entryId,
			imageId: imageId
		},
		select: {
			id: true,
			entryId: true,
			imageId: true,
			createdAt: true,
			updatedAt: true
		}
	});
	return primaryImage;
};

export const updatePrimaryImageRelation = async (entryId: number, imageId: number) => {
	const primaryImage = await prisma.primaryImageTable.update({
		where: { entryId: entryId },
		data: { imageId: imageId },
		select: {
			id: true,
			entryId: true,
			imageId: true,
			createdAt: true,
			updatedAt: true
		}
	});
	return primaryImage;
};

// TODO - is this type of select still required?

// export const findAccepted = async (emailToFind: string) => {
// 	return await prisma.artistTable.findMany({
// 		where: {
// 			email: emailToFind,
// 			entries: {
// 				some: {
// 					accepted: true
// 				}
// 			}
// 		},
// 		select: {
// 			email: true,
// 			lastName: true, // Assuming `lastName` maps to `last_name` in your database
// 			registrations: {
// 				select: {
// 					registrationYear: true, // Assuming `registrationYear` maps to `registration_year` in your database
// 					entries: {
// 						select: {
// 							id: true, // This will be returned as `entryId`
// 							accepted: true,
// 							images: {
// 								select: {
// 									id: true, // This will be returned as `imageId`
// 									cloudURL: true
// 								}
// 							},
// 							locationTable: {
// 								select: {
// 									exhibitNumber: true
// 								}
// 							}
// 						}
// 					}
// 				}
// 			}
// 		}
// 	});
// };

export type Exhibit = {
	artistId: number;
	email: string;
	lastName: string;
	firstName: string;
	artistName: string;
	phone: string;
	postcode: string;
	firstNations: string;
	bankAccountName: string;
	bankBSB: string;
	bankAccount: string;
	registrationYear: string;
	bumpIn: string;
	bumpOut: string;
	displayRequirements: string;
	closed: boolean;
	entryId: number;
	accepted: boolean;
	description: string;
	dimensions: string;
	inOrOut: string;
	material: string;
	title: string;
	price: number;
	sold: boolean;
	specialRequirements: string;
	imageId: number;
	cloudURL: string;
	exhibitNumber: string;
};

//TODO fix issue with non accepted entries in prior years not being filtered out
export const getExhibits = async ({
	rows,
	offset,
	entryYear
}: {
	rows: number;
	offset: number;
	entryYear: string;
}): Promise<Exhibit[]> => {
	const exhibits: Exhibit[] = await prisma.$queryRaw`select
		artist.id as "artistId",
		artist.email,
		artist.last_name as "lastName",
		artist.first_name as "firstName",
		concat(artist.first_name, ' ', artist.last_name) as "artistName",
		artist.phone,
		artist.postcode,
		artist.first_nations as "firstNations",
		artist.bank_account_name as "bankAccountName",
		artist.bank_bsb as "bankBSB",
		artist.bank_account as "bankAccount",
		registration.registration_year as "registrationYear",
		registration.closed,
		registration.bump_in as "bumpIn",
		registration.bump_out as "bumpOut",
		registration.display_requirements as "displayRequirements",
		entry.id as "entryId",
		entry.accepted,
		entry.description,
		entry.dimensions,
		entry.in_or_out as "inOrOut",
		entry.material,
		entry.title,
		entry.price_in_cents as "price",
		entry.sold,
		entry.special_requirements as "specialRequirements",
		image.id as "imageId",
		image.cloud_url as "cloudURL",
		CASE WHEN location.exhibit_number is NULL THEN NULL ELSE location.exhibit_number END as "exhibitNumber"
		from
		artist
		join registration on artist.id = registration.artist_id
		join entry on registration.id = entry.registration_id
		LEFT OUTER join location on entry.id = location.entry_id
		LEFT OUTER join primary_image on entry.id = primary_image.entry_id
		LEFT OUTER join image on primary_image.image_id = image.id
		where
		-- -- artist.email = 'epsilonartist@gmail.com' AND
		registration.registration_year = ${entryYear}
		order by location.exhibit_number asc, entry.id asc
		OFFSET ${offset} ROWS
		LIMIT ${rows}
		`;
	return exhibits;
};
