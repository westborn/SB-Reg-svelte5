import { prisma } from '$lib/components/server/prisma';

/**
 * Context object for structured logging.
 * Contains optional user and route information plus custom key-value pairs.
 */
export type LogContext = {
	userId?: string;
	routeId?: string;
	[key: string]: any;
};

/**
 * Core logging function that persists logs to the database.
 * Falls back to console.error if database logging fails.
 *
 * @param level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param message - Human-readable log message
 * @param context - Optional structured context data
 * @param error - Optional Error object (typically used with ERROR level)
 *
 * @example
 * await log('INFO', 'User logged in', { userId: '123', routeId: '/login' });
 * await log('ERROR', 'Database connection failed', { routeId: '/api/data' }, error);
 */
async function log(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: string, context?: LogContext, error?: Error) {
	try {
		await prisma.logTable.create({
			data: {
				level,
				message,
				context: context ? (context as any) : null,
				userId: context?.userId,
				routeId: context?.routeId,
				error: error
					? JSON.stringify({
							name: error.name,
							message: error.message,
							stack: error.stack
						})
					: null
			}
		});
	} catch (logError) {
		// Fallback to console if database logging fails
		// This ensures we don't lose critical error information
		console.error('Logging to database failed:', logError);
		console.error('Original log:', { level, message, context, error });
	}
}

/**
 * Centralized logging utility for the application.
 * Provides structured logging with database persistence.
 *
 * All logs are stored in the database with optional context and error details.
 * Use appropriate log levels based on severity:
 * - DEBUG: Development/troubleshooting information
 * - INFO: General informational messages (e.g., successful operations)
 * - WARN: Warning messages that don't prevent operation
 * - ERROR: Error conditions that need attention
 *
 * @example
 * // Info logging
 * await logger.info('Registration completed', {
 *   userId: user.id,
 *   routeId: event.route.id,
 *   registrationId: 123
 * });
 *
 * @example
 * // Error logging with Error object
 * try {
 *   await someOperation();
 * } catch (error) {
 *   await logger.error('Operation failed', error as Error, {
 *     userId: user.id,
 *     routeId: event.route.id
 *   });
 * }
 *
 * @example
 * // Debug logging
 * await logger.debug('Form data received', {
 *   routeId: event.route.id,
 *   formFields: Object.keys(formData)
 * });
 */
export const logger = {
	/**
	 * Logs debug-level messages for development and troubleshooting.
	 *
	 * @param message - Debug message
	 * @param context - Optional context data
	 */
	debug: (message: string, context?: LogContext) => log('DEBUG', message, context),

	/**
	 * Logs informational messages about normal operations.
	 *
	 * @param message - Info message
	 * @param context - Optional context data
	 */
	info: (message: string, context?: LogContext) => log('INFO', message, context),

	/**
	 * Logs warning messages that don't prevent operation but need attention.
	 *
	 * @param message - Warning message
	 * @param context - Optional context data
	 */
	warn: (message: string, context?: LogContext) => log('WARN', message, context),

	/**
	 * Logs error conditions with full error details.
	 *
	 * @param message - Error description
	 * @param error - Error object with stack trace
	 * @param context - Optional context data
	 */
	error: (message: string, error: Error, context?: LogContext) => log('ERROR', message, context, error)
};
