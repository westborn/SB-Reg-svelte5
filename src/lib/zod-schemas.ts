import { boolean, z } from 'zod';
import { MAX_IMAGE_SIZE } from '$lib/constants';

export const signupSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
		.toLowerCase()
});

export const tokenSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
		.toLowerCase(),
	token: z.string().min(6, 'Please enter the token you received in your email.')
});

export const loginSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
		.toLowerCase()
});

export const IndigenousSchema = z.enum(['Yes', 'No', 'Declined']);
export const EntryTypeSchema = z.enum(['Indoor', 'Outdoor']);

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
	closed: boolean(),
	bumpIn: z.string().nullable(),
	bumpOut: z.string().nullable(),
	displayRequirements: z.string().nullable(),
	accommodation: boolean(),
	crane: boolean(),
	transport: boolean(),
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
	inOrOut: EntryTypeSchema,
	description: z.string().nullable(),
	dimensions: z.string().nullable(),
	enterMajorPrize: boolean(),
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
// ARTIST SCHEMA UI - just the columns that are editable or used in forms
/////////////////////////////////////////
// id: z.number().int(),
// email: z.string({ required_error: 'Email is required' }).email({ message: 'Email must be a valid email' }),
export const artistSchemaUI = z.object({
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
export type ArtistUI = z.infer<typeof artistSchemaUI>;

// this UI updates both the registration and artist tables
export const confirmSchemaUI = z.object({
	id: z.number().int(),
	artistId: z.number().int(),
	registrationYear: z.string().nullish(),
	closed: z.string().default('No'),
	bumpIn: z.string().nullish(),
	bumpOut: z.string().nullish(),
	displayRequirements: z.string().nullish(),
	crane: z.string().default('No'),
	bankAccountName: z.string().nullish(),
	bankBSB: z.coerce.string().nullish(),
	bankAccount: z.coerce.string().nullish()
});
export type RegistrationUI = z.infer<typeof confirmSchemaUI>;

export const entrySchemaUI = z.object({
	id: z.number().int(),
	title: z.string({ required_error: 'Title is required' }),
	inOrOut: z.lazy(() => EntryTypeSchema).default('Outdoor'),
	price: z.coerce
		.number({ message: 'Just enter numbers please' })
		.int({ message: 'Whole dollars please' })
		.gt(0, { message: 'You MUST enter a price' })
		.nullable()
		.refine((val) => val > 0, { message: 'Number is required.' }),
	material: z.string().nullish(),
	dimLength: z.string().nullish(),
	dimWidth: z.string().nullish(),
	dimHeight: z.string().nullish(),
	specialRequirements: z.string().nullish(),
	description: z.string().nullish()
});
export type EntryUI = z.infer<typeof entrySchemaUI>;

export const entryDeleteSchemaUI = z.object({
	id: z.string()
});

export const imageSchemaUI = z.object({
	id: z.number().int(),
	cloudId: z.string(),
	cloudURL: z.string(),
	originalFileName: z.string()
});
export type ImageUI = z.infer<typeof imageSchemaUI>;

export const fileUploadSchema = z.object({
	image: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < MAX_IMAGE_SIZE, 'Upload must be less than 5Mb!')
});
export type FileUpload = z.infer<typeof fileUploadSchema>;
