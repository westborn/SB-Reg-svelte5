import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple arg parser: accepts either positional (entryId newRegistrationId newArtistId)
// or flags --entryId= --newRegistrationId= --newArtistId= and an optional --execute flag.
function parseArgs() {
	const args = process.argv.slice(2);
	const out: { entryId?: number; newRegistrationId?: number; newArtistId?: number; execute: boolean } = {
		execute: false
	};

	for (const a of args) {
		if (a === '--execute') {
			out.execute = true;
			continue;
		}

		if (a.startsWith('--entryId=')) out.entryId = parseInt(a.split('=')[1], 10);
		else if (a.startsWith('--newRegistrationId=')) out.newRegistrationId = parseInt(a.split('=')[1], 10);
		else if (a.startsWith('--newArtistId=')) out.newArtistId = parseInt(a.split('=')[1], 10);
		else if (!isNaN(Number(a)) && out.entryId === undefined) out.entryId = parseInt(a, 10);
		else if (!isNaN(Number(a)) && out.newRegistrationId === undefined) out.newRegistrationId = parseInt(a, 10);
		else if (!isNaN(Number(a)) && out.newArtistId === undefined) out.newArtistId = parseInt(a, 10);
	}

	return out;
}

async function reassignEntry() {
	const { entryId, newRegistrationId, newArtistId, execute } = parseArgs();

	if (!entryId || !newRegistrationId || !newArtistId) {
		console.error(
			'Usage: ts-node src/scripts/reassignEntry.ts <entryId> <newRegistrationId> <newArtistId> [--execute]'
		);
		console.error('Or use flags: --entryId= --newRegistrationId= --newArtistId= --execute');
		process.exit(1);
	}

	console.log(`Mode: ${execute ? 'EXECUTE' : 'DRY RUN'}`);
	console.log(`Preparing to move Entry ${entryId} -> Registration ${newRegistrationId}, Artist ${newArtistId}`);

	try {
		// Load target registration and artist
		const targetRegistration = await prisma.registrationTable.findUnique({ where: { id: newRegistrationId } });
		if (!targetRegistration) {
			console.error(`Target registration id ${newRegistrationId} not found.`);
			process.exit(1);
		}

		if (targetRegistration.artistId !== newArtistId) {
			console.error(
				`Target registration ${newRegistrationId} is owned by artist ${targetRegistration.artistId}, which does not match provided newArtistId ${newArtistId}.`
			);
			process.exit(1);
		}

		const entry = await prisma.entryTable.findUnique({
			where: { id: entryId },
			include: { images: true, registration: true, artist: true, location: true }
		});

		if (!entry) {
			console.error(`Entry id ${entryId} not found.`);
			process.exit(1);
		}

		console.log('Current entry info:');
		console.log(`  id: ${entry.id}`);
		console.log(`  title: ${entry.title}`);
		console.log(`  artistId: ${entry.artistId}`);
		console.log(`  registrationId: ${entry.registrationId}`);
		if (entry.location) console.log(`  exhibitNumber: ${entry.location.exhibitNumber}`);
		console.log(`  images count: ${entry.images?.length ?? 0}`);

		if (!execute) {
			console.log('Dry run - no changes applied. Rerun with --execute to perform the reassignment.');
			process.exit(0);
		}

		// Perform transactional update: update entry and related images
		await prisma.$transaction(async (tx) => {
			// Update entry's registrationId and artistId
			const updatedEntry = await tx.entryTable.update({
				where: { id: entryId },
				data: {
					registrationId: newRegistrationId,
					artistId: newArtistId
				}
			});

			// Update images belonging to the entry so their artist/registration remain consistent
			const updatedImages = await tx.imageTable.updateMany({
				where: { entryId: entryId },
				data: {
					registrationId: newRegistrationId,
					artistId: newArtistId
				}
			});

			console.log(`Updated entry ${updatedEntry.id}.`);
			console.log(`Updated ${updatedImages.count} images.`);
		});

		console.log('Reassignment completed successfully.');
	} catch (err) {
		console.error('Error during reassignment:', err);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

reassignEntry();
