import { prisma } from '$lib/components/server/prisma';
import { logger } from '$lib/server/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	try {
		// Get the most recent 100 log entries, ordered by most recent first
		const logs = await prisma.logTable.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			take: 100
		});

		// Get count by log level for summary stats
		const logCounts = await prisma.logTable.groupBy({
			by: ['level'],
			_count: {
				_all: true
			}
		});

		const countsByLevel = logCounts.reduce(
			(acc, item) => {
				acc[item.level] = item._count._all;
				return acc;
			},
			{ DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 } as Record<string, number>
		);

		return {
			logs,
			countsByLevel
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		await logger.error('Failed to load error logs', error, {
			routeId: event.route.id
		});
		return { error: error.message, logs: [], countsByLevel: { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 } };
	}
};
