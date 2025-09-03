import { describe, it, expect } from 'vitest';
import { signupSchema, tokenSchema, loginSchema, IndigenousSchema, EntryTypeSchema } from './zod-schemas';

describe('Zod Schemas', () => {
	describe('signupSchema', () => {
		it('validates correct email', () => {
			const validData = { email: 'test@example.com' };
			expect(() => signupSchema.parse(validData)).not.toThrow();
		});

		it('converts email to lowercase', () => {
			const data = { email: 'TEST@EXAMPLE.COM' };
			const result = signupSchema.parse(data);
			expect(result.email).toBe('test@example.com');
		});

		it('rejects invalid email', () => {
			const invalidData = { email: 'invalid-email' };
			expect(() => signupSchema.parse(invalidData)).toThrow();
		});

		it('requires email field', () => {
			const emptyData = {};
			expect(() => signupSchema.parse(emptyData)).toThrow();
		});
	});

	describe('tokenSchema', () => {
		it('validates correct email and token', () => {
			const validData = {
				email: 'test@example.com',
				token: '123456'
			};
			expect(() => tokenSchema.parse(validData)).not.toThrow();
		});

		it('requires token to be at least 6 characters', () => {
			const invalidData = {
				email: 'test@example.com',
				token: '123'
			};
			expect(() => tokenSchema.parse(invalidData)).toThrow();
		});

		it('converts email to lowercase', () => {
			const data = {
				email: 'TEST@EXAMPLE.COM',
				token: '123456'
			};
			const result = tokenSchema.parse(data);
			expect(result.email).toBe('test@example.com');
		});
	});

	describe('loginSchema', () => {
		it('validates correct email', () => {
			const validData = { email: 'test@example.com' };
			expect(() => loginSchema.parse(validData)).not.toThrow();
		});

		it('rejects invalid email format', () => {
			const invalidData = { email: 'not-an-email' };
			expect(() => loginSchema.parse(invalidData)).toThrow();
		});
	});

	describe('IndigenousSchema', () => {
		it('accepts valid values', () => {
			expect(() => IndigenousSchema.parse('Yes')).not.toThrow();
			expect(() => IndigenousSchema.parse('No')).not.toThrow();
			expect(() => IndigenousSchema.parse('Declined')).not.toThrow();
		});

		it('rejects invalid values', () => {
			expect(() => IndigenousSchema.parse('Maybe')).toThrow();
			expect(() => IndigenousSchema.parse('yes')).toThrow(); // case sensitive
		});
	});

	describe('EntryTypeSchema', () => {
		it('accepts valid entry types', () => {
			expect(() => EntryTypeSchema.parse('Indoor')).not.toThrow();
			expect(() => EntryTypeSchema.parse('Outdoor')).not.toThrow();
		});

		it('rejects invalid entry types', () => {
			expect(() => EntryTypeSchema.parse('indoor')).toThrow(); // case sensitive
			expect(() => EntryTypeSchema.parse('Mixed')).toThrow();
		});
	});
});
