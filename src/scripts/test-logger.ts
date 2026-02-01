/**
 * Test script for the logging infrastructure
 * 
 * This script tests all logging levels and verifies database persistence.
 * Run with: npx tsx src/scripts/test-logger.ts
 * 
 * After running, check the log table in Prisma Studio:
 * npx prisma studio
 */

import { logger } from '$lib/server/logger';
import { prisma } from '$lib/components/server/prisma';

async function testLogger() {
	console.log('🚀 Starting Logger Tests...\n');

	try {
		// Test 1: Info logging
		console.log('Test 1: INFO level logging...');
		await logger.info('Test info message - Logger working correctly', {
			routeId: '/test/logger',
			testType: 'info',
			timestamp: new Date().toISOString(),
			metadata: { version: '1.0', environment: 'test' }
		});
		console.log('✅ Info log created\n');

		// Test 2: Debug logging
		console.log('Test 2: DEBUG level logging...');
		await logger.debug('Test debug message - Detailed debugging info', {
			routeId: '/test/logger',
			testType: 'debug',
			debugData: {
				variableName: 'testVar',
				value: 42,
				array: [1, 2, 3]
			}
		});
		console.log('✅ Debug log created\n');

		// Test 3: Warning logging
		console.log('Test 3: WARN level logging...');
		await logger.warn('Test warning message - Something needs attention', {
			routeId: '/test/logger',
			testType: 'warn',
			warningReason: 'Resource usage high',
			threshold: 80
		});
		console.log('✅ Warning log created\n');

		// Test 4: Error logging with Error object
		console.log('Test 4: ERROR level logging with Error object...');
		const testError = new Error('Test error message - Simulated failure');
		testError.stack = 'Error: Test error message\n    at testLogger (/test/logger.ts:45:20)\n    at async main (/test/logger.ts:100:5)';
		await logger.error('Test error occurred during operation', testError, {
			routeId: '/test/logger',
			testType: 'error',
			userId: 'test-user-123',
			operation: 'database-query',
			attemptNumber: 1
		});
		console.log('✅ Error log with stack trace created\n');

		// Test 5: Info logging with user context
		console.log('Test 5: INFO with user and route context...');
		await logger.info('User action logged successfully', {
			userId: 'test-user-456',
			routeId: '/register/entry',
			action: 'entry-created',
			entryId: 999,
			userEmail: 'test@example.com'
		});
		console.log('✅ Info log with user context created\n');

		// Test 6: Multiple error scenarios
		console.log('Test 6: Multiple error scenarios...');
		const errors = [
			{ message: 'Database connection timeout', type: 'connection' },
			{ message: 'Invalid input validation', type: 'validation' },
			{ message: 'Authorization failed', type: 'auth' }
		];

		for (const errorInfo of errors) {
			const error = new Error(errorInfo.message);
			await logger.error(`Test error: ${errorInfo.type}`, error, {
				routeId: '/test/logger',
				errorType: errorInfo.type,
				testBatch: 'multiple-errors'
			});
		}
		console.log('✅ Multiple error logs created\n');

		// Verify logs were created
		console.log('📊 Verifying logs in database...\n');
		
		const logCounts = await prisma.logTable.groupBy({
			by: ['level'],
			_count: {
				level: true
			}
		});

		console.log('Log counts by level:');
		logCounts.forEach(({ level, _count }) => {
			console.log(`  ${level}: ${_count.level} logs`);
		});

		// Show recent logs
		const recentLogs = await prisma.logTable.findMany({
			orderBy: { createdAt: 'desc' },
			take: 10,
			select: {
				id: true,
				level: true,
				message: true,
				userId: true,
				routeId: true,
				createdAt: true
			}
		});

		console.log('\n📋 Recent logs (last 10):');
		recentLogs.forEach((log) => {
			const timestamp = log.createdAt.toISOString().split('T')[1].split('.')[0];
			console.log(`  [${timestamp}] ${log.level.padEnd(5)} - ${log.message.substring(0, 60)}${log.message.length > 60 ? '...' : ''}`);
		});

		console.log('\n✅ All tests completed successfully!');
		console.log('\n💡 Next steps:');
		console.log('   1. Run "npx prisma studio" to view logs in browser');
		console.log('   2. Check the "log" table for all test entries');
		console.log('   3. Verify context JSON and error fields are populated');
		console.log('   4. Try querying logs by level or route\n');

	} catch (error) {
		console.error('❌ Test failed:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the tests
testLogger().catch((error) => {
	console.error('💥 Fatal error during logger tests:', error);
	process.exit(1);
});
