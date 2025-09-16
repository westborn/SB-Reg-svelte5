/**
 * Data Migration Script: Create Primary Image Records
 * 
 * This script creates primary_image records for all existing entries that have images.
 * It sets the first image (by creation date) as the primary image for each entry.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EntryWithImages {
	id: number;
	title: string;
	images: Array<{
		id: number;
		createdAt: Date;
		originalFileName: string;
	}>;
}

async function migratePrimaryImages() {
	console.log('🚀 Starting primary image data migration...');

	try {
		// Step 1: Get all entries that have images but no primary image record
		const entriesWithImages = await prisma.entryTable.findMany({
			where: {
				images: {
					some: {}
				},
				primaryImage: null
			},
			include: {
				images: {
					select: {
						id: true,
						createdAt: true,
						originalFileName: true
					},
					orderBy: {
						createdAt: 'asc' // Order by creation date to get the first image
					}
				}
			}
		});

		console.log(`📊 Found ${entriesWithImages.length} entries with images that need primary image records`);

		if (entriesWithImages.length === 0) {
			console.log('✅ No migration needed - all entries already have primary image records or no images');
			return;
		}

		// Step 2: Create primary image records for each entry
		let migrationCount = 0;
		const errors: Array<{ entryId: number; error: string }> = [];

		for (const entry of entriesWithImages) {
			try {
				if (entry.images.length > 0) {
					// Set the first image (by creation date) as the primary image
					const primaryImage = entry.images[0];
					
					await prisma.primaryImageTable.create({
						data: {
							entryId: entry.id,
							imageId: primaryImage.id
						}
					});

					migrationCount++;
					console.log(`✅ Entry ${entry.id} ("${entry.title}"): Set primary image to "${primaryImage.originalFileName}" (ID: ${primaryImage.id})`);
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				errors.push({ entryId: entry.id, error: errorMessage });
				console.error(`❌ Failed to create primary image for entry ${entry.id}: ${errorMessage}`);
			}
		}

		// Step 3: Report results
		console.log('\n📈 Migration Summary:');
		console.log(`✅ Successfully migrated: ${migrationCount} entries`);
		console.log(`❌ Failed migrations: ${errors.length} entries`);
		
		if (errors.length > 0) {
			console.log('\n❌ Migration Errors:');
			errors.forEach(({ entryId, error }) => {
				console.log(`   Entry ${entryId}: ${error}`);
			});
		}

		// Step 4: Validate data integrity
		console.log('\n🔍 Validating data integrity...');
		await validateDataIntegrity();

	} catch (error) {
		console.error('💥 Migration failed with error:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

async function validateDataIntegrity() {
	try {
		// Check 1: All entries with images should have a primary image record
		const entriesWithImagesCount = await prisma.entryTable.count({
			where: {
				images: {
					some: {}
				}
			}
		});

		const primaryImageCount = await prisma.primaryImageTable.count();

		console.log(`📊 Entries with images: ${entriesWithImagesCount}`);
		console.log(`📊 Primary image records: ${primaryImageCount}`);

		if (entriesWithImagesCount === primaryImageCount) {
			console.log('✅ Data integrity check passed: All entries with images have primary image records');
		} else {
			console.log('❌ Data integrity check failed: Mismatch between entries with images and primary image records');
		}

		// Check 2: All primary image records point to valid images that belong to the correct entry
		const primaryImagesWithDetails = await prisma.primaryImageTable.findMany({
			include: {
				image: {
					select: {
						id: true,
						entryId: true,
						originalFileName: true
					}
				},
				entry: {
					select: {
						id: true,
						title: true
					}
				}
			}
		});

		const invalidPrimaryImages = primaryImagesWithDetails.filter(
			primaryImage => primaryImage.image.entryId !== primaryImage.entryId
		);

		if (invalidPrimaryImages.length === 0) {
			console.log('✅ Data integrity check passed: All primary images belong to their respective entries');
		} else {
			console.log(`❌ Data integrity check failed: ${invalidPrimaryImages.length} primary images point to images that don't belong to their entry`);
			invalidPrimaryImages.forEach(primaryImage => {
				console.log(`   Primary image ${primaryImage.id}: Entry ${primaryImage.entryId} -> Image ${primaryImage.imageId} (belongs to entry ${primaryImage.image.entryId})`);
			});
		}

		// Check 3: Check for potential orphaned primary image records
		// This is a simplified check since Prisma's cascade rules should prevent orphans
		const totalPrimaryImages = await prisma.primaryImageTable.count();
		console.log(`📊 Total primary image records: ${totalPrimaryImages}`);
		console.log('✅ Data integrity check completed (orphan check skipped due to cascade constraints)');

	} catch (error) {
		console.error('💥 Data integrity validation failed:', error);
	}
}

// Dry run function to preview what will be migrated
async function dryRun() {
	console.log('🔍 DRY RUN: Analyzing entries that need primary image migration...');

	try {
		const entriesWithImages = await prisma.entryTable.findMany({
			where: {
				images: {
					some: {}
				},
				primaryImage: null
			},
			include: {
				images: {
					select: {
						id: true,
						createdAt: true,
						originalFileName: true
					},
					orderBy: {
						createdAt: 'asc'
					}
				}
			}
		});

		console.log(`📊 Found ${entriesWithImages.length} entries that need primary image records:`);
		
		entriesWithImages.forEach(entry => {
			if (entry.images.length > 0) {
				const primaryImage = entry.images[0];
				console.log(`   Entry ${entry.id} ("${entry.title}"): Would set primary to "${primaryImage.originalFileName}" (${entry.images.length} total images)`);
			}
		});

		console.log('\n💡 Run with --execute flag to perform the actual migration');

	} catch (error) {
		console.error('💥 Dry run failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

// Main execution
async function main() {
	const args = process.argv.slice(2);
	const isDryRun = !args.includes('--execute');

	if (isDryRun) {
		await dryRun();
	} else {
		await migratePrimaryImages();
	}
}

// Run the script
main().catch((error) => {
	console.error('💥 Script execution failed:', error);
	process.exit(1);
});
