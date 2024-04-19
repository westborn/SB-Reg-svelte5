import { z } from 'zod';

export const registerSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email address.' })
});

export const tokenSchema = z.object({
	token: z.string().min(6, 'Please enter the token you received in your email.')
});

export const loginSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email address.' })
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

export const registrationSchema = z.object({
	registrationId: z.string(),
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
export type registerRecord = z.infer<typeof registrationSchema>;

export const entrySchema = z.object({
	entryId: z.string().trim(),
	registrationId: z.string().trim(),
	inOrOut: z.enum(inOrOutTypes),
	email: z.string().trim(),
	title: z.string().trim(),
	material: z.string().trim(),
	dimensions: z.string().trim(),
	description: z.string().trim(),
	specialRequirements: z.string().trim(),
	enterMajorPrize: z.string().trim(),
	price: z.coerce.string({ required_error: 'Price is required' }).trim()
});
export type entryRecord = z.infer<typeof entrySchema>;

export const imageSchema = z.object({
	imageId: z.string({ required_error: 'imageId is required' }).trim(),
	entryId: z.string({ required_error: 'entryId is required' }).trim(),
	imageURL: z.string({ required_error: 'URL is required' }).url().trim(),
	imageFileName: z.string().trim(),
	originalFileName: z.string().trim()
});
export type imageRecord = z.infer<typeof imageSchema>;

export const entryWithImagesSchema = entrySchema.extend({
	images: z.array(imageSchema).optional()
});
export type entryWithImagesRecord = z.infer<typeof entryWithImagesSchema>;

export const registrationWithEntriesSchema = z.object({
	registration: registerSchema.partial(),
	entries: z.array(entryWithImagesSchema).optional()
});
export type registrationWithEntriesRecord = z.infer<typeof registrationWithEntriesSchema>;

export const acceptUserEmail = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
		.trim()
		.optional()
});
export type acceptUserEmailMessage = z.infer<typeof acceptUserEmail>;
