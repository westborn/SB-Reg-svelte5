import { prisma } from '$lib/components/server/prisma';
import { error } from '@sveltejs/kit';
import { ExhibitionYear } from '$lib/constants';

export const getArtistCollection = async (artistEmail: string) => {
	const artistCollection = await prisma.artistTable.findFirst({
		where: {
			email: artistEmail
		},
		include: {
			registrations: {
				where: { registrationYear: ExhibitionYear.toString() },
				include: {
					entries: {
						include: {
							images: true
						}
					}
				}
			}
		}
	});
	if (!artistCollection) {
		throw error(404, 'Artist does not exist');
	}
	return artistCollection;
};
