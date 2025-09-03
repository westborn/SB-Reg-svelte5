import { describe, it, expect } from 'vitest';
import { cn, sleep, convertToDollars, determinePlacement } from './utils';
import { EXHIBITION_YEAR } from './constants';

describe('Utils', () => {
	describe('cn function', () => {
		it('merges class names correctly', () => {
			const result = cn('px-2 py-1', 'text-sm');
			expect(result).toBe('px-2 py-1 text-sm');
		});

		it('handles conflicting tailwind classes', () => {
			const result = cn('p-2 px-4', 'py-3');
			expect(result).toBe('p-2 px-4 py-3');
		});

		it('handles conditional classes', () => {
			const result = cn('base-class', true && 'conditional-class', false && 'not-included');
			expect(result).toBe('base-class conditional-class');
		});

		it('handles empty inputs', () => {
			const result = cn('', null, undefined, false);
			expect(result).toBe('');
		});
	});

	describe('sleep function', () => {
		it('resolves after specified time', async () => {
			const start = Date.now();
			await sleep(10); // 10ms
			const end = Date.now();

			expect(end - start).toBeGreaterThanOrEqual(9); // Allow for some timing variance
		});
	});

	describe('convertToDollars function', () => {
		it('converts cents to dollar format', () => {
			// Function expects cents, not dollars, and uses AUD format
			expect(convertToDollars(123400)).toBe('$1,234.00'); // 123400 cents = $1234
			expect(convertToDollars(0)).toBe(''); // 0 returns empty string
			expect(convertToDollars(550)).toBe('$5.50'); // 550 cents = $5.50
		});

		it('handles decimals parameter', () => {
			expect(convertToDollars(123456, 3)).toBe('$1,234.56'); // cents with 3 decimals
			expect(convertToDollars(123456, 1)).toBe('$1,234.6');
			expect(convertToDollars(123400, 0)).toBe('$1,234');
		});

		it('handles null and undefined', () => {
			expect(convertToDollars(null)).toBe('');
			expect(convertToDollars(undefined)).toBe('');
		});

		it('handles large numbers', () => {
			expect(convertToDollars(123456789)).toBe('$1,234,567.89'); // cents to dollars
		});
	});

	describe('determinePlacement function', () => {
		it('returns location based on exhibit number ranges', () => {
			// Test various exhibit number ranges for 2026
			expect(determinePlacement('100', '2026', 'Indoor')).toBe('Headland');
			expect(determinePlacement('399', '2026', 'Indoor')).toBe('Headland');
			expect(determinePlacement('400', '2026', 'Indoor')).toBe('Hotel');
			expect(determinePlacement('499', '2026', 'Indoor')).toBe('Hotel');
			expect(determinePlacement('500', '2026', 'Indoor')).toBe('Surf Gallery');
			expect(determinePlacement('799', '2026', 'Indoor')).toBe('Surf Gallery');
			expect(determinePlacement('800', '2026', 'Indoor')).toBe('Street Gallery');
			expect(determinePlacement('849', '2026', 'Indoor')).toBe('Street Gallery');
			expect(determinePlacement('850', '2026', 'Indoor')).toBe('Shop 7 Artspace');
			expect(determinePlacement('899', '2026', 'Indoor')).toBe('Shop 7 Artspace');
		});

		it('handles pre-2024 years by returning inOrOut value', () => {
			expect(determinePlacement('1', '2023', 'Indoor')).toBe('Indoor');
			expect(determinePlacement('1', '2023', 'Outdoor')).toBe('Outdoor');
		});

		it('handles empty exhibit number for current exhibition year', () => {
			// For current exhibition year with no exhibit number, returns inOrOut
			expect(determinePlacement('', EXHIBITION_YEAR, 'Indoor')).toBe('Indoor');
			expect(determinePlacement('', EXHIBITION_YEAR, 'Outdoor')).toBe('Outdoor');
		});

		it('handles empty exhibit number for non-current years', () => {
			// For years not matching current exhibition year with no exhibit number, returns ??
			const pastYear = (parseInt(EXHIBITION_YEAR) - 1).toString();
			expect(determinePlacement('', pastYear, 'Indoor')).toBe('??');
		});

		it('handles exhibit numbers outside defined ranges', () => {
			// Numbers outside the defined ranges should return undefined
			expect(determinePlacement('50', '2024', 'Indoor')).toBeUndefined();
			expect(determinePlacement('1000', '2024', 'Indoor')).toBeUndefined();
		});
	});
});
