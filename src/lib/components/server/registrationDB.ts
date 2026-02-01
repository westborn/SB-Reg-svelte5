import { prisma } from '$lib/components/server/prisma';
import { EXHIBITION_YEAR, MIN_IMAGES_PER_ENTRY } from '$lib/constants';
import { getImagesWithPrimary as getImagesWithPrimaryUtil, getNewPrimaryAfterRemoval } from '$lib/utils/primary-image';

import { EntryType } from '$lib/constants';
import type { EntryTable, ImageTable, PrimaryImageTable } from '$lib/zod-schemas';
import { Prisma } from '@prisma/client';

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

	// Use utility to mark primary image in the images array
	const imagesWithPrimary = getImagesWithPrimaryUtil(entry.images, entry.primaryImage?.imageId || null);

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

	// If deleting primary image, reassign primary to first remaining image using utility
	if (isDeletingPrimary) {
		const newPrimaryId = getNewPrimaryAfterRemoval(imageId, entryImages, primaryImage?.imageId || null);
		if (newPrimaryId) {
			await prisma.primaryImageTable.update({
				where: { entryId: entryId },
				data: { imageId: newPrimaryId }
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

/////////////////////////////////////////
// UPDATE HELPER FUNCTIONS (Phase 2, Step 4)
/////////////////////////////////////////

/**
 * Updates an artist record with partial data
 */
export const updateArtist = async (artistId: number, data: Partial<Prisma.artistTableUpdateInput>) => {
	return await prisma.artistTable.update({
		where: { id: artistId },
		data
	});
};

/**
 * Updates an entry record with partial data
 */
export const updateEntry = async (entryId: number, data: Partial<Prisma.entryTableUpdateInput>) => {
	return await prisma.entryTable.update({
		where: { id: entryId },
		data
	});
};

/**
 * Updates a registration record with partial data
 */
export const updateRegistration = async (
	registrationId: number,
	data: Partial<Prisma.registrationTableUpdateInput>
) => {
	return await prisma.registrationTable.update({
		where: { id: registrationId },
		data
	});
};

/////////////////////////////////////////
// EXHIBIT QUERIES
/////////////////////////////////////////

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
	const artists = await prisma.artistTable.findMany({
		where: {
			registrations: {
				some: {
					registrationYear: entryYear,
					entries: {
						some: {}
					}
				}
			}
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
				where: { registrationYear: entryYear },
				select: {
					registrationYear: true,
					closed: true,
					bumpIn: true,
					bumpOut: true,
					displayRequirements: true,
					entries: {
						select: {
							id: true,
							accepted: true,
							description: true,
							dimensions: true,
							inOrOut: true,
							material: true,
							title: true,
							price: true,
							sold: true,
							specialRequirements: true,
							primaryImage: {
								select: {
									image: {
										select: {
											id: true,
											cloudURL: true
										}
									}
								}
							},
							location: {
								select: {
									exhibitNumber: true
								}
							}
						},
						orderBy: [{ location: { exhibitNumber: 'asc' } }, { id: 'asc' }]
					}
				}
			}
		},
		skip: offset,
		take: rows
	});

	// Transform nested structure to flat Exhibit[] format
	return artists.flatMap((artist) =>
		artist.registrations.flatMap((registration) =>
			registration.entries.map((entry) => ({
				artistId: artist.id,
				email: artist.email,
				lastName: artist.lastName,
				firstName: artist.firstName,
				artistName: `${artist.firstName} ${artist.lastName}`,
				phone: artist.phone,
				postcode: artist.postcode,
				firstNations: artist.firstNations,
				bankAccountName: artist.bankAccountName ?? '',
				bankBSB: artist.bankBSB ?? '',
				bankAccount: artist.bankAccount ?? '',
				registrationYear: registration.registrationYear,
				closed: registration.closed,
				bumpIn: registration.bumpIn ?? '',
				bumpOut: registration.bumpOut ?? '',
				displayRequirements: registration.displayRequirements ?? '',
				entryId: entry.id,
				accepted: entry.accepted,
				description: entry.description ?? '',
				dimensions: entry.dimensions ?? '',
				inOrOut: entry.inOrOut,
				material: entry.material ?? '',
				title: entry.title,
				price: entry.price,
				sold: entry.sold,
				specialRequirements: entry.specialRequirements ?? '',
				imageId: entry.primaryImage?.image?.id ?? 0,
				cloudURL: entry.primaryImage?.image?.cloudURL ?? '',
				exhibitNumber: entry.location?.exhibitNumber ?? ''
			}))
		)
	);
};
