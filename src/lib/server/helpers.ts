import type { SuperValidated } from 'sveltekit-superforms';
import type { Submission, User } from '$lib/components/server/registrationDB';

/**
 * Retrieves the effective artist email, considering proxy mode for super admins.
 *
 * @param user - The authenticated user object
 * @returns The email to use for database operations (proxy email for super admins, regular email otherwise)
 */
export function getArtistEmail(user: User): string {
	return user.isSuperAdmin ? (user.proxyEmail ?? user.email) : user.email;
}

/**
 * Standard response format for successful form submissions.
 * Returns a consistent object structure with form validation result and updated submission data.
 *
 * @param formValidationResult - The validated form result from superValidate
 * @param updatedSubmission - The updated submission data from database
 * @returns Object containing both the form result and updated submission
 */
export function returnWithUpdatedSubmission<T extends Record<string, any>>(
	formValidationResult: SuperValidated<T>,
	updatedSubmission: Submission
) {
	return { formValidationResult, updatedSubmission };
}

/**
 * Type guard for user validation.
 * Checks if a value is a valid User object with required properties.
 *
 * @param user - Value to check
 * @returns True if user is valid, false otherwise
 */
export function isValidUser(user: any): user is User {
	return user && typeof user.id === 'string' && typeof user.email === 'string';
}
