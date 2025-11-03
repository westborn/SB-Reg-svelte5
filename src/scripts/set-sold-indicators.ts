import { PrismaClient } from '@prisma/client';
import salesData from '../lib/data/2021_2025 SalesData.json';

const prisma = new PrismaClient();

interface SalesRecord {
	registrationYear: number;
	exhibitNumber: number;
}

// Check if --execute flag is provided
const isExecuteMode = process.argv.includes('--execute');

async function setSoldIndicators() {
	try {
		if (isExecuteMode) {
			console.log('🚀 Starting sold indicators update (EXECUTE MODE)...');
		} else {
			console.log('🔍 Starting sold indicators dry run (add --execute to actually update database)...');
		}

		// Read the sales data JSON file
		console.log(`📊 Found ${salesData.length} sales records`);

		let updatedCount = 0;
		let notFoundCount = 0;
		let alreadySoldCount = 0;

		for (const sale of salesData) {
			// Convert exhibit number to 3-character zero-padded string
			const exhibitNumberStr = sale.exhibitNumber.toString().padStart(3, '0');

			// Find entries that match the registration year and exhibit number
			const matchingEntries = await prisma.entryTable.findMany({
				where: {
					registration: {
						registrationYear: sale.registrationYear.toString()
					},
					location: {
						exhibitNumber: exhibitNumberStr
					}
				},
				include: {
					registration: true,
					location: true,
					artist: true
				}
			});

			if (matchingEntries.length > 0) {
				// Check which entries are already sold
				const alreadySoldEntries = matchingEntries.filter((entry) => entry.sold);
				const notSoldEntries = matchingEntries.filter((entry) => !entry.sold);

				if (alreadySoldEntries.length > 0) {
					console.log(
						`ℹ️  ${alreadySoldEntries.length} entries already sold for ${sale.registrationYear}-${exhibitNumberStr}`
					);
					alreadySoldCount += alreadySoldEntries.length;
				}

				if (notSoldEntries.length > 0) {
					if (isExecuteMode) {
						// Update all matching entries to sold = true
						const entryIds = notSoldEntries.map((entry) => entry.id);

						await prisma.entryTable.updateMany({
							where: {
								id: {
									in: entryIds
								}
							},
							data: {
								sold: true
							}
						});

						console.log(`✅ Updated ${notSoldEntries.length} entries for ${sale.registrationYear}-${exhibitNumberStr}`);
					} else {
						console.log(
							`🔄 Would update ${notSoldEntries.length} entries for ${sale.registrationYear}-${exhibitNumberStr}`
						);
					}

					updatedCount += notSoldEntries.length;

					// Log details of entries that would be/were updated
					for (const entry of notSoldEntries) {
						const action = isExecuteMode ? 'Updated' : 'Would update';
						console.log(
							`   - ${action} Entry ID: ${entry.id}, Artist: ${entry.artist.firstName} ${entry.artist.lastName}, Title: "${entry.title}"`
						);
					}
				}
			} else {
				console.log(`⚠️  No matching entry found for ${sale.registrationYear}-${exhibitNumberStr}`);
				notFoundCount++;
			}
		}

		console.log('\n📈 Summary:');
		console.log(`   Mode: ${isExecuteMode ? 'EXECUTE' : 'DRY RUN'}`);
		console.log(`   Total sales records processed: ${salesData.length}`);
		console.log(`   Entries ${isExecuteMode ? 'updated' : 'would be updated'} to sold: ${updatedCount}`);
		console.log(`   Entries already sold: ${alreadySoldCount}`);
		console.log(`   Sales records with no matching entries: ${notFoundCount}`);

		if (!isExecuteMode) {
			console.log('\n💡 To actually update the database, run with --execute flag');
		}
	} catch (error) {
		console.error('❌ Error updating sold indicators:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the script
setSoldIndicators()
	.then(() => {
		const message = isExecuteMode
			? '✨ Sold indicators update completed successfully!'
			: '✨ Dry run completed successfully!';
		console.log(message);
		process.exit(0);
	})
	.catch((error) => {
		console.error('💥 Script failed:', error);
		process.exit(1);
	});
