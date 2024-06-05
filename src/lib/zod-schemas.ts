import { string, z } from 'zod';

export const signupSchema = z.object({
	email: z.string({ required_error: 'Email is required' }).email({ message: 'Email must be a valid email' })
});

export const tokenSchema = z.object({
	email: z.string({ required_error: 'Email is required' }).email({ message: 'Email must be a valid email' }),
	token: z.string().min(6, 'Please enter the token you received in your email.')
});

export const loginSchema = z.object({
	email: z.string({ required_error: 'Email is required' }).email({ message: 'Email must be a valid email' })
});

const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

const inOrOutTypes = ['Indoor', 'Outdoor'] as const;

export const IndigenousSchema = z.enum(['Yes', 'No', 'Declined']);
export type IndigenousType = `${z.infer<typeof IndigenousSchema>}`;

export const EntryTypeSchema = z.enum(['Indoor', 'Outdoor']);
export type EntryTypeType = `${z.infer<typeof EntryTypeSchema>}`;

/////////////////////////////////////////
// ARTIST TABLE SCHEMA
/////////////////////////////////////////
export const artistTableSchema = z.object({
	id: z.number().int(),
	email: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string(),
	postcode: z.string(),
	firstNations: IndigenousSchema,
	bankAccountName: z.string().nullable(),
	bankBSB: z.string().nullable(),
	bankAccount: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export type ArtistTable = z.infer<typeof artistTableSchema>;

/////////////////////////////////////////
// REGISTRATION TABLE SCHEMA
/////////////////////////////////////////
export const registrationTableSchema = z.object({
	id: z.number().int(),
	artistId: z.number().int(),
	registrationYear: z.string(),
	closed: z.boolean(),
	bumpIn: z.string().nullable(),
	bumpOut: z.string().nullable(),
	displayRequirements: z.string().nullable(),
	accommodation: z.boolean().nullable(),
	crane: z.boolean().nullable(),
	transport: z.boolean().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export type RegistrationTable = z.infer<typeof registrationTableSchema>;

/////////////////////////////////////////
// ENTRY TABLE SCHEMA
/////////////////////////////////////////
export const entryTableSchema = z.object({
	id: z.number().int(),
	accepted: z.boolean(),
	artistId: z.number().int(),
	registrationId: z.number().int(),
	inOrOut: EntryTypeSchema.nullable(),
	description: z.string().nullable(),
	dimensions: z.string().nullable(),
	enterMajorPrize: z.boolean(),
	material: z.string().nullable(),
	price: z.number().int().nullable(),
	specialRequirements: z.string().nullable(),
	title: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export type EntryTable = z.infer<typeof entryTableSchema>;

/////////////////////////////////////////
// IMAGE TABLE SCHEMA
/////////////////////////////////////////
export const imageTableSchema = z.object({
	id: z.number().int(),
	artistId: z.number().int(),
	registrationId: z.number().int().nullable(),
	entryId: z.number().int().nullable(),
	cloudId: z.string(),
	cloudURL: z.string(),
	originalFileName: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export type ImageTable = z.infer<typeof imageTableSchema>;

/////////////////////////////////////////
// ARTIST SCHEMA - just the columns that are editable or used for lookup
/////////////////////////////////////////
export const artistSchema = z.object({
	id: z.number().int(),
	email: z.string({ required_error: 'Email is required' }).email({ message: 'Email must be a valid email' }),
	firstName: z
		.string({ required_error: 'First Name is required' })
		.min(2, { message: 'First Name must be at least 2 characters' })
		.max(64, { message: 'First Name must be less than 64 characters' }),
	lastName: z
		.string({ required_error: 'Last Name is required' })
		.min(2, { message: 'Last Name must be at least 2 characters' })
		.max(64, { message: 'Last Name must be less than 64 characters' }),
	phone: z.string({ required_error: 'Phone number is required' }),
	postcode: z.string({ required_error: 'Postcode is required' }),
	firstNations: z.lazy(() => IndigenousSchema).default('No'),
	bankAccountName: z.string().nullish(),
	bankBSB: z.coerce.string().nullish(),
	bankAccount: z.coerce.string().nullish()
});
export type Artist = z.infer<typeof artistSchema>;

export const artistAddOrUpdateSchema = artistSchema.omit({ id: true, email: true });
export type ArtistUpdate = z.infer<typeof artistAddOrUpdateSchema>;

export const registrationSchema = z.object({
	id: z.number().int(),
	artistId: z.number().int(),
	registrationYear: z.string().nullish(),
	closed: z.boolean({ required_error: 'closed response is required' }),
	bumpIn: z.string().nullish(),
	bumpOut: z.string().nullish(),
	displayRequirements: z.string().nullish(),
	accomodation: z.boolean({
		required_error: 'accomodation response is required'
	}),
	crane: z.boolean({ required_error: 'transport response is required' }),
	transport: z.boolean({ required_error: 'transport response is required' })
});
export type Registration = z.infer<typeof registrationSchema>;

export const entrySchema = z.object({
	id: z.number().int(),
	artistId: z.number().int(),
	registrationId: z.number().int(),
	accepted: z.boolean(),
	inOrOut: z.string().nullish(),
	title: z.string({ required_error: 'Title is required' }).nullish(),
	material: z.string().nullish(),
	dimensions: z.string().nullish(),
	description: z.string().nullish(),
	specialRequirements: z.string().nullish(),
	enterMajorPrize: z.boolean(),
	price: z.number({ required_error: 'Price is required' }).nullish()
});
export type Entry = z.infer<typeof entrySchema>;

export const imageSchema = z.object({
	id: z.number().int(),
	entryId: z.number().int(),
	registrationId: z.number().int(),
	cloudId: z.string(),
	cloudURL: z.string(),
	originalFileName: z.string()
});
export type Image = z.infer<typeof imageSchema>;

/////////////////////////////////////////
// WORKING SCHEMA for APIs, state, validators
/////////////////////////////////////////
// export const submissionSchema = z.object({
// 	...artistSchema.shape,
// 	registration: registrationSchema.optional(),
// 	entries: z.array(entrySchema).optional(),
// 	images: z.array(imageSchema).optional()
// });
// export type Submission = z.infer<typeof submissionSchema>;
