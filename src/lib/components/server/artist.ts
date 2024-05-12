import { prisma } from '$lib/components/server/prisma';
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
	return artistCollection;
};
