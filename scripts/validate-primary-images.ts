/**
 * Validation Script: Check Primary Image Data Integrity
 *
 * This script validates that the primary image migration was successful
 * and that all data integrity constraints are maintained.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validatePrimaryImageIntegrity() {
	console.log('🔍 Validating primary image data integrity...\n');

	try {
		// Get counts for overview
		const totalEntries = await prisma.entryTable.count();
		const entriesWithImages = await prisma.entryTable.count({
			where: {
				images: {
					some: {}
				}
			}
		});
		const entriesWithoutImages = totalEntries - entriesWithImages;
		const primaryImageRecords = await prisma.primaryImageTable.count();

		console.log('📊 Overview:');
		console.log(`   Total entries: ${totalEntries}`);
		console.log(`   Entries with images: ${entriesWithImages}`);
		console.log(`   Entries without images: ${entriesWithoutImages}`);
		console.log(`   Primary image records: ${primaryImageRecords}\n`);

		// Test 1: Check that all entries with images have primary image records
		const entriesWithImagesMissingPrimary = await prisma.entryTable.findMany({
			where: {
				images: {
					some: {}
				},
				primaryImage: null
			},
			select: {
				id: true,
				title: true,
				_count: {
					select: {
						images: true
					}
				}
			}
		});

		if (entriesWithImagesMissingPrimary.length === 0) {
			console.log('✅ Test 1 PASSED: All entries with images have primary image records');
		} else {
			console.log(
				`❌ Test 1 FAILED: ${entriesWithImagesMissingPrimary.length} entries with images are missing primary image records:`
			);
			entriesWithImagesMissingPrimary.forEach((entry) => {
				console.log(
					`   Entry ${entry.id} ("${entry.title}") has ${entry._count.images} images but no primary image record`
				);
			});
		}

		// Test 2: Check that all primary image records point to valid images that belong to the correct entry
		// Manual validation for primary image relations
		const allPrimaryImages = await prisma.primaryImageTable.findMany({
			include: {
				image: {
					select: {
						id: true,
						entryId: true,
						originalFileName: true
					}
				}
			}
		});

		const invalidRelations = allPrimaryImages.filter(
			(primaryImage) => primaryImage.image.entryId !== primaryImage.entryId
		);

		if (invalidRelations.length === 0) {
			console.log('✅ Test 2 PASSED: All primary images belong to their respective entries');
		} else {
			console.log(
				`❌ Test 2 FAILED: ${invalidRelations.length} primary image records point to images that don't belong to their entry:`
			);
			invalidRelations.forEach((relation) => {
				console.log(
					`   Primary image ${relation.id}: Entry ${relation.entryId} -> Image ${relation.imageId} (belongs to entry ${relation.image.entryId})`
				);
			});
		}

		// Test 3: Check that no entries have multiple primary image records (should be impossible due to unique constraint)
		const duplicatePrimaryImages = await prisma.$queryRaw<Array<{ entry_id: number; count: number }>>`
			SELECT entry_id, COUNT(*) as count
			FROM primary_image
			GROUP BY entry_id
			HAVING COUNT(*) > 1
		`;

		if (duplicatePrimaryImages.length === 0) {
			console.log('✅ Test 3 PASSED: No entries have multiple primary image records');
		} else {
			console.log(`❌ Test 3 FAILED: ${duplicatePrimaryImages.length} entries have multiple primary image records:`);
			duplicatePrimaryImages.forEach((duplicate) => {
				console.log(`   Entry ${duplicate.entry_id} has ${duplicate.count} primary image records`);
			});
		}

		// Test 4: Check that primary images actually exist and are accessible
		const primaryImagesWithImageData = await prisma.primaryImageTable.findMany({
			include: {
				image: {
					select: {
						id: true,
						cloudId: true,
						cloudURL: true,
						originalFileName: true,
						entryId: true
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

		const inaccessiblePrimaryImages = primaryImagesWithImageData.filter(
			(primaryImage) => !primaryImage.image || !primaryImage.image.cloudId || !primaryImage.image.cloudURL
		);

		if (inaccessiblePrimaryImages.length === 0) {
			console.log('✅ Test 4 PASSED: All primary images have valid cloud storage references');
		} else {
			console.log(
				`❌ Test 4 FAILED: ${inaccessiblePrimaryImages.length} primary images have missing or invalid cloud storage references:`
			);
			inaccessiblePrimaryImages.forEach((primaryImage) => {
				console.log(
					`   Primary image ${primaryImage.id} for entry ${primaryImage.entry.id} ("${primaryImage.entry.title}") has invalid cloud data`
				);
			});
		}

		// Summary
		console.log('\n📋 Validation Summary:');
		const allTestsPassed =
			entriesWithImagesMissingPrimary.length === 0 &&
			invalidRelations.length === 0 &&
			duplicatePrimaryImages.length === 0 &&
			inaccessiblePrimaryImages.length === 0;

		if (allTestsPassed) {
			console.log('🎉 ALL TESTS PASSED: Primary image data integrity is valid!');
			console.log(`✅ ${entriesWithImages} entries with images all have valid primary image records`);
		} else {
			console.log('⚠️  SOME TESTS FAILED: Primary image data integrity issues found');
			console.log('   Please review the failed tests above and run the migration script if needed');
		}
	} catch (error) {
		console.error('💥 Validation failed with error:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the validation
validatePrimaryImageIntegrity().catch((error) => {
	console.error('💥 Validation script execution failed:', error);
	process.exit(1);
});
