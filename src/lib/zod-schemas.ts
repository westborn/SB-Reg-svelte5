import { z } from 'zod';

export const signupSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
		.trim()
});

export const tokenSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
		.trim(),
	token: z.string().min(6, 'Please enter the token you received in your email.')
});

export const loginSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
		.trim()
});

const imageTypes = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/svg+xml',
	'image/gif'
];

const inOrOutTypes = ['Indoor', 'Outdoor'] as const;

const blobSchema = z.object({
	blob: z
		.instanceof(Blob)
		.optional()
		.superRefine((val, ctx) => {
			if (val) {
				if (val.size > 5242880) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Image must be less than 5MB'
					});
				}
				if (!imageTypes.includes(val.type)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Unsupported Image type. Supported formats: jpeg, jpg, png, webp, svg, gif'
					});
				}
			}
		})
});

export const artistSchema = z.object({
	id: z.number().int(),
	firstName: z
		.string({ required_error: 'First Name is required' })
		.regex(/^[a-z ,.'-]+$/i, { message: 'First Name can only contain letters and spaces.' })
		.min(2, { message: 'First Name must be at least 2 characters' })
		.max(64, { message: 'First Name must be less than 64 characters' })
		.trim(),
	lastName: z
		.string({ required_error: 'Last Name is required' })
		.regex(/^[a-z ,.'-]+$/i, { message: 'Last Name can only contain letters and spaces.' })
		.min(2, { message: 'Last Name must be at least 2 characters' })
		.max(64, { message: 'Last Name must be less than 64 characters' })
		.trim(),
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
		.trim(),
	phone: z.coerce.string({ required_error: 'Phone number is required' }).trim(),
	postcode: z.coerce.string({ required_error: 'Postcode is required' }).trim(),
	bumpIn: z.string().trim(),
	bumpOut: z.string().trim(),
	crane: z.string().trim(),
	displayRequirements: z.string().trim(),
	bankAccountName: z.string().trim(),
	bankBSB: z.coerce.string().trim(),
	bankAccount: z.coerce.string().trim(),
	transport: z.string().trim(),
	accommodation: z.string().trim(),
	confirmation: z.string().trim()
});
export type artistRecord = z.infer<typeof artistSchema>;

export const registrationSchema = z.object({
	id: z.number().int(),
	artistId: z.number().int(),
	registrationYear: z.string().trim(),
	closed: z.boolean({ required_error: 'closed response is required' }),
	bumpIn: z.string().trim(),
	bumpOut: z.string().trim(),
	displayRequirements: z.string().trim(),
	accomodation: z.boolean({ required_error: 'accomodation response is required' }),
	crane: z.boolean({ required_error: 'transport response is required' }),
	transport: z.boolean({ required_error: 'transport response is required' })
});
export type registrationRecord = z.infer<typeof registrationSchema>;

export const entrySchema = z.object({
	id: z.number().int(),
	registrationId: z.number().int(),
	artistId: z.number().int(),
	accepted: z.boolean(),
	inOrOut: z.string().trim(),
	title: z.string({ required_error: 'Title is required' }).trim(),
	material: z.string().trim(),
	dimensions: z.string().trim(),
	description: z.string().trim(),
	specialRequirements: z.string().trim(),
	enterMajorPrize: z.boolean(),
	price: z.coerce.string({ required_error: 'Price is required' }).trim()
});
export type entryRecord = z.infer<typeof entrySchema>;

export const imageSchema = z.object({
	id: z.number().int(),
	entryId: z.number().int(),
	registrationId: z.number().int(),
	imageURL: z.string({ required_error: 'URL is required' }).url().trim(),
	imageFileName: z.string().trim(),
	originalFileName: z.string().trim()
});
export type imageRecord = z.infer<typeof imageSchema>;

export const entryWithImagesSchema = entrySchema.extend({
	images: z.array(imageSchema).optional()
});
export type entryWithImagesRecord = z.infer<typeof entryWithImagesSchema>;

export const artistDetailsSchema = z.object({
	artist: artistSchema,
	registration: registrationSchema.optional(),
	entries: z.array(entryWithImagesSchema).optional()
});
export type artistDetailsRecord = z.infer<typeof artistDetailsSchema>;
