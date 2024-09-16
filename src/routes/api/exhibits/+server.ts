import { getExhibits } from '$lib/components/server/registrationDB';

export async function GET(req: Request) {
	try {
		// get page and offset from query
		const url = new URL(req.url);
		const rowsParam = url.searchParams.get('rows');
		const rows = rowsParam ? parseInt(rowsParam) : 3;
		const offsetParam = url.searchParams.get('offset');
		const offset = offsetParam ? parseInt(offsetParam) : 0;

		const result = await getExhibits({ rows, offset });

		if (result.length == 0) {
			return new Response(
				JSON.stringify({
					data: [],
					metaData: {
						offset: null,
						hasNextPage: false
					}
				}),
				{ status: 200 }
			);
		}

		const data = {
			data: result,
			metaData: {
				offset: offset ? offset + rows : 0,
				hasNextPage: result.length == rows ? true : false
			}
		};

		return new Response(JSON.stringify(data), { status: 200 });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		return new Response(JSON.stringify(JSON.stringify({ error: error.message })), { status: 403 });
	}
}
