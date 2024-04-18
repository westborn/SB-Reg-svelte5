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
