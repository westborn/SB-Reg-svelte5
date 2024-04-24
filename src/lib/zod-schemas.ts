import { z } from 'zod';

export const signupSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
});

export const tokenSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' }),
	token: z.string().min(6, 'Please enter the token you received in your email.')
});

export const loginSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
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
						message:
							'Unsupported Image type. Supported formats: jpeg, jpg, png, webp, svg, gif'
					});
				}
			}
		})
});

export const artistPublicSchema = z.object({
	firstName: z
		.string({ required_error: 'First Name is required' })
		.min(2, { message: 'First Name must be at least 2 characters' })
		.max(64, { message: 'First Name must be less than 64 characters' }),
	lastName: z
		.string({ required_error: 'Last Name is required' })
		.min(2, { message: 'Last Name must be at least 2 characters' })
		.max(64, { message: 'Last Name must be less than 64 characters' }),
	phone: z.coerce.string({ required_error: 'Phone number is required' }),
	postcode: z.coerce.string({ required_error: 'Postcode is required' }),
	bankAccountName: z.string().nullish(),
	bankBSB: z.coerce.string().nullish(),
	bankAccount: z.coerce.string().nullish()
});

const artistSchema = artistPublicSchema.extend({
	id: z.number().int(),
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
});
export type artistRecord = z.infer<typeof artistSchema>;
export type artistPublicRecord = z.infer<typeof artistPublicSchema>;

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
export type registrationRecord = z.infer<typeof registrationSchema>;

export const entrySchema = z.object({
	id: z.number().int(),
	registrationId: z.number().int(),
	artistId: z.number().int(),
	accepted: z.boolean(),
	inOrOut: z.string().nullish(),
	title: z.string({ required_error: 'Title is required' }).nullish(),
	material: z.string().nullish(),
	dimensions: z.string().nullish(),
	description: z.string().nullish(),
	specialRequirements: z.string().nullish(),
	enterMajorPrize: z.boolean(),
	price: z.coerce.string({ required_error: 'Price is required' }).nullish()
});
export type entryRecord = z.infer<typeof entrySchema>;

export const imageSchema = z.object({
	id: z.number().int(),
	entryId: z.number().int(),
	registrationId: z.number().int(),
	imageURL: z.string({ required_error: 'URL is required' }).url().nullish(),
	imageFileName: z.string().nullish(),
	originalFileName: z.string().nullish()
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
