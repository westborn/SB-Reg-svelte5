import { prisma } from '$lib/components/server/prisma';
import { ExhibitionYear } from '$lib/constants';

export const getSubmission = async (artistEmail: string) => {
	const submission = await prisma.artistTable.findFirst({
		where: {
			email: artistEmail
		},
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			phone: true,
			postcode: true,
			firstNations: true,
			bankAccountName: true,
			bankBSB: true,
			bankAccount: true,
			registrations: {
				where: { registrationYear: ExhibitionYear.toString() },
				select: {
					id: true,
					artistId: true,
					registrationYear: true,
					closed: true,
					bumpIn: true,
					bumpOut: true,
					displayRequirements: true,
					accommodation: true,
					crane: true,
					transport: true,
					entries: {
						select: {
							id: true,
							artistId: true,
							registrationId: true,
							accepted: true,
							inOrOut: true,
							title: true,
							material: true,
							dimensions: true,
							description: true,
							specialRequirements: true,
							enterMajorPrize: true,
							price: true,
							images: {
								select: {
									id: true,
									registrationId: true,
									entryId: true,
									originalFileName: true,
									imageFileName: true,
									imageURL: true
								}
							}
						}
					}
				}
			}
		}
	});
	return submission;
};
// https://www.prisma.io/docs/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types
// Extract Type `Submission` from result of the "getSubmission" function
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type Submission = ThenArg<ReturnType<typeof getSubmission>>;
// OR
import { Prisma } from '@prisma/client';
type Submisssion_alt = Prisma.PromiseReturnType<typeof getSubmission>;
