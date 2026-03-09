import { prisma } from '$lib/components/server/prisma';
import { EXHIBITION_YEAR, MIN_IMAGES_PER_ENTRY } from '$lib/constants';
import { getImagesWithPrimary as getImagesWithPrimaryUtil, getNewPrimaryAfterRemoval } from '$lib/utils/primary-image';

import { EntryType } from '$lib/constants';
import type { EntryTable, ImageTable, PrimaryImageTable } from '$lib/zod-schemas';
import { Prisma } from '$lib/generated/prisma/client';

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

/**
 * Retrieves complete submission data for an artist including registrations and entries.
 * Automatically handles proxy email for super admin users.
 *
 * @param user - User object containing admin flags and email/proxyEmail
 * @returns Artist record with all registrations and entries for current exhibition year, or null if not found
 *
 * @example
 * const submission = await getSubmission(user);
 * if (submission) {
 *   console.log(`Artist: ${submission.firstName} ${submission.lastName}`);
 * }
 */
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

/**
 * Retrieves all entries for an artist for the current exhibition year.
 *
 * @param artistEmail - Email address of the artist
 * @returns Artist record with registrations and entries, or null if not found
 *
 * @example
 * const entries = await getEntries('artist@example.com');
 */
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

/**
 * Creates a new registration record for an artist for the current exhibition year.
 *
 * @param artistId - ID of the artist
 * @returns Newly created registration record
 *
 * @example
 * const registration = await createNewRegistration(123);
 */
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

/**
 * Creates a new artist record.
 *
 * @param data - Artist data to create
 * @returns Newly created artist record
 */
export const createArtist = async (data: Prisma.artistTableCreateInput) => {
	return await prisma.artistTable.create({ data });
};

type EntryCreateInput = {
	artistId: number;
	registrationId: number;
	accepted: boolean;
	inOrOut: 'Indoor' | 'Outdoor';
	title: string;
	material?: string | null;
	dimensions?: string | null;
	description?: string | null;
	specialRequirements?: string | null;
	price: number;
};

/**
 * Creates a new entry record in the database.
 *
 * @param workingEntry - Entry data to create
 * @returns Newly created entry record
 *
 * @example
 * const entry = await entryCreate({ title: 'My Sculpture', ... });
 */
export const entryCreate = async (workingEntry: EntryCreateInput) => {
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

/**
 * Retrieves a single entry by ID.
 *
 * @param id - Entry ID
 * @returns Entry record or null if not found
 *
 * @example
 * const entry = await getEntry(456);
 */
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

/**
 * Retrieves a single image by ID.
 *
 * @param id - Image ID
 * @returns Image record or null if not found
 *
 * @example
 * const image = await getImage(789);
 */
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

/**
 * Retrieves all images for a specific entry.
 *
 * @param entryId - Entry ID
 * @returns Array of image records
 *
 * @example
 * const images = await getEntryImages(456);
 */
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

/**
 * Creates a new image record in the database.
 *
 * @param workingImage - Image data including cloudId, cloudURL, etc.
 * @returns Newly created image record
 *
 * @example
 * const image = await createImage({ cloudId: 'xyz', cloudURL: 'https://...', ... });
 */
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

/**
 * Deletes an entry by ID.
 *
 * @param entryId - Entry ID
 * @returns Deleted entry record
 */
export const deleteEntryById = async (entryId: number) => {
	return await prisma.entryTable.delete({
		where: { id: entryId }
	});
};

/**
 * Creates or updates a location assignment for an entry.
 *
 * @param entryId - Entry ID
 * @param exhibitNumber - Exhibit number/location code
 * @returns Upserted location record
 */
export const upsertEntryLocation = async (entryId: number, exhibitNumber: string) => {
	return await prisma.locationTable.upsert({
		where: { entryId },
		update: { exhibitNumber },
		create: { entryId, exhibitNumber }
	});
};

/////////////////////////////////////////
// MULTIPLE IMAGES HELPER FUNCTIONS
/////////////////////////////////////////

export type EntryImagesWithPrimary = ThenArg<ReturnType<typeof getEntryImagesWithPrimary>>;

/**
 * Retrieves all images for an entry with primary image designation.
 * Maps images with isPrimary flag based on the primaryImage relationship.
 *
 * @param entryId - Entry ID
 * @returns Object containing images array with isPrimary flags and primaryImageId, or null if entry not found
 *
 * @example
 * const result = await getEntryImagesWithPrimary(456);
 * if (result) {
 *   const primaryImg = result.images.find(img => img.isPrimary);
 * }
 */
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

/**
 * Sets an image as the primary image for an entry.
 * Updates or creates the primaryImage relationship.
 *
 * @param entryId - Entry ID
 * @param imageId - Image ID to set as primary
 * @returns True on success
 * @throws Error if image doesn't belong to the entry
 *
 * @example
 * await setPrimaryImage(456, 789);
 */
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

/**
 * Deletes an image from an entry.
 * Automatically reassigns primary image if deleting the current primary.
 * Enforces minimum image requirement per entry.
 *
 * @param imageId - Image ID to delete
 * @param entryId - Entry ID the image belongs to
 * @returns Object indicating if the deleted image was the primary image
 * @throws Error if attempting to delete the last remaining image
 *
 * @example
 * const result = await deleteImage(789, 456);
 * if (result.deletedPrimaryImage) {
 *   console.log('Primary image was deleted and reassigned');
 * }
 */
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

/**
 * Creates a new primary image relationship record.
 *
 * @param entryId - Entry ID
 * @param imageId - Image ID to designate as primary
 * @returns Newly created primary image relation record
 *
 * @example
 * const relation = await createPrimaryImageRelation(456, 789);
 */
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

/**
 * Updates an existing primary image relationship.
 *
 * @param entryId - Entry ID
 * @param imageId - New image ID to designate as primary
 * @returns Updated primary image relation record
 *
 * @example
 * const relation = await updatePrimaryImageRelation(456, 789);
 */
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
 * Updates an artist record with partial data.
 *
 * @param artistId - Artist ID
 * @param data - Partial artist data to update
 * @returns Updated artist record
 *
 * @example
 * await updateArtist(123, { phone: '0400123456', postcode: '2548' });
 */
export const updateArtist = async (artistId: number, data: Partial<Prisma.artistTableUpdateInput>) => {
	return await prisma.artistTable.update({
		where: { id: artistId },
		data
	});
};

/**
 * Updates an entry record with partial data.
 *
 * @param entryId - Entry ID
 * @param data - Partial entry data to update
 * @returns Updated entry record
 *
 * @example
 * await updateEntry(456, { title: 'New Title', price: 50000 });
 */
export const updateEntry = async (entryId: number, data: Partial<Prisma.entryTableUpdateInput>) => {
	return await prisma.entryTable.update({
		where: { id: entryId },
		data
	});
};

/**
 * Marks multiple entries as sold in a single database operation.
 * Only updates entries that are not already sold.
 *
 * @param entryIds - Entry IDs to mark as sold
 * @returns Number of rows updated
 *
 * @example
 * await markEntriesSold([123, 456, 789]);
 */
export const markEntriesSold = async (entryIds: number[]) => {
	if (entryIds.length === 0) {
		return 0;
	}

	const result = await prisma.entryTable.updateMany({
		where: {
			id: { in: entryIds },
			sold: false
		},
		data: {
			sold: true
		}
	});

	return result.count;
};

/**
 * Updates a registration record with partial data.
 *
 * @param registrationId - Registration ID
 * @param data - Partial registration data to update
 * @returns Updated registration record
 *
 * @example
 * await updateRegistration(789, { closed: true, crane: true });
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
/**
 * Retrieves exhibit data for display in admin tables and catalogues.
 * Returns flattened data structure with artist, registration, entry, and location info.
 *
 * @param rows - Number of rows to return
 * @param offset - Number of rows to skip (for pagination)
 * @param entryYear - Exhibition year to filter by
 * @returns Array of Exhibit objects with complete display data
 *
 * @example
 * const exhibits = await getExhibits({ rows: 50, offset: 0, entryYear: '2026' });
 */
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
