import { z } from 'zod';

export const languages = {
	en: 'English',
	es: 'Spanish',
	fr: 'French',
	de: 'German',
	it: 'Italian',
	pt: 'Portuguese',
	ru: 'Russian',
	zh: 'Chinese',
	ja: 'Japanese',
	ko: 'Korean'
} as const;

type Language = keyof typeof languages;

export const schema = z.object({
	language: z.enum(Object.keys(languages) as [Language, ...Language[]]).default('en')
});
