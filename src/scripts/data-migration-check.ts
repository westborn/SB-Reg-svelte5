// Script to check existing entries that need primary image relationships
import { prisma } from '$lib/components/server/prisma';

async function checkDataMigrationNeeds() {
	console.log('Checking for entries that need primary image migration...');

	// Find entries that have images but no primary image relationship
	const entriesWithImagesButNoPrimary = await prisma.entryTable.findMany({
		where: {
			images: {
				some: {}
			},
			primaryImage: null
		},
		include: {
			images: {
				orderBy: {
					createdAt: 'asc'
				}
			},
			primaryImage: true
		}
	});

	console.log(`Found ${entriesWithImagesButNoPrimary.length} entries that need primary image relationships`);

	for (const entry of entriesWithImagesButNoPrimary) {
		console.log(`Entry ID: ${entry.id}, Title: ${entry.title}, Images: ${entry.images.length}`);
		if (entry.images.length > 0) {
			console.log(`  - First image ID: ${entry.images[0].id} (created: ${entry.images[0].createdAt})`);
		}
	}

	return entriesWithImagesButNoPrimary;
}

async function performDataMigration() {
	console.log('Starting data migration for primary images...');

	const entriesNeedingMigration = await checkDataMigrationNeeds();

	if (entriesNeedingMigration.length === 0) {
		console.log('No entries need migration. All entries with images already have primary image relationships.');
		return;
	}

	let migratedCount = 0;

	for (const entry of entriesNeedingMigration) {
		if (entry.images.length > 0) {
			try {
				// Set the first image (by creation date) as the primary image
				const primaryImageId = entry.images[0].id;

				await prisma.primaryImageTable.create({
					data: {
						entryId: entry.id,
						imageId: primaryImageId
					}
				});

				console.log(`✓ Set primary image for entry ${entry.id} (${entry.title}) - Image ID: ${primaryImageId}`);
				migratedCount++;
			} catch (error) {
				console.error(`✗ Failed to set primary image for entry ${entry.id}:`, error);
			}
		}
	}

	console.log(`\nData migration completed. Migrated ${migratedCount} entries.`);
}

// Run the migration check
async function main() {
	try {
		await checkDataMigrationNeeds();
		console.log('\nData migration check completed.');
	} catch (error) {
		console.error('Error during migration check:', error);
	} finally {
		await prisma.$disconnect();
	}
}

// Execute if run directly
main();

export { checkDataMigrationNeeds, performDataMigration };
