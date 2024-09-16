import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const searchTerm = {
	email: 'epsilonartist@gmail.com',
	entries: {
		some: {
			accepted: true
		}
	}
};

// searchTerm = {};

// const exhibits = await prisma.entryTable.findMany({
// 	where: searchTerm,
// 	orderBy: {
// 		locationTable: {
// 			exhibitNumber: desc'
// 		},
// 		entries: {
// 			id: 'asc'
// 		}
// 	},
// 	select: {
// 		artist: {
// 		id: true,
// 		email: true,
// 		lastName: true,
// 		firstName: true,
// 		registrations: {
// 			select: {
// 				registrationYear: true,
// 				entries: {
// 					select: {
// 						id: true,
// 						images: {
// 							select: {
// 								id: true,
// 								cloudURL: true
// 							}
// 						},
// 						locationTable: {
// 							select: {
// 								exhibitNumber: true
// 							}
// 						}
// 					}
// 				}
// 			}}
// 		}
// 	}
// });

// const exhibits = [];
// for (const artist of result) {
// 	for (const registration of artist.registrations) {
// 		for (const entry of registration.entries) {
// 			exhibits.push({
// 				artistId: artist.id,
// 				entryId: entry.id,
// 				imageId: entry.images[0].id,
// 				email: artist.email,
// 				firstName: artist.firstName,
// 				lastName: artist.lastName,
// 				registrationYear: registration.registrationYear,
// 				cloudURL: entry.images[0].cloudURL,
// 				exhibitNumber: entry?.locationTable?.exhibitNumber ?? null
// 			});
// 		}
// 	}
// }
// console.log(exhibits);

type Exhibits = {
	artistId: number;
	email: string;
	lastName: string;
	firstName: string;
	registrationYear: string;
	entryId: number;
	imageId: number;
	cloudURL: string;
	exhibitNumber: string;
};

export const getExhibits = async ({ rows, offset }: { rows: number; offset: number }): Promise<Exhibits[]> => {
	const exhibits: Exhibits[] = await prisma.$queryRaw`select
		artist.id as "artistId",
		artist.email,
		artist.last_name as "lastName",
		artist.first_name as "firstName",
		concat(artist.first_name, ' ', artist.last_name) as "artistName",
		registration.registration_year as "registrationYear",
		entry.id as "entryId",
		entry.description,
		entry.dimensions,
		entry.in_or_out as "inOrOut",
		entry.enter_major_prize as "majorPrize",
		entry.material,
		entry.title,
		entry.price_in_cents as "price",
		image.id as "imageId",
		image.cloud_url as "cloudURL",
		location."exhibitNumber"
		from
		artist
		join registration on artist.id = registration.artist_id
		join entry on registration.id = entry.registration_id
		join location on entry.id = location."entryId"
		join image on entry.id = image.entry_id
		where
		-- artist.email = 'epsilonartist@gmail.com' AND
		entry.accepted = true
		order by location."exhibitNumber" asc
		OFFSET ${offset} ROWS
		LIMIT ${rows}
		`;
	return exhibits;
};

const calcOffset = () => pageToFetch * rows;

let pageToFetch = 0;
const rows = 3;
const exhibitParams = {
	rows,
	offset: calcOffset()
};

pageToFetch = 0;
const exhibits1 = await getExhibits(exhibitParams);
console.log(exhibits1);
console.log('# Exhibits1: ', exhibits1.length);

await prisma.$disconnect();
