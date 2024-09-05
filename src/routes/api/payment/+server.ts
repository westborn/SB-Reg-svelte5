import { json } from '@sveltejs/kit';
import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';
import { SECRET_SQUARE_ACCESS_TOKEN } from '$env/static/private';
import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

const { paymentsApi } = new Client({
	accessToken: SECRET_SQUARE_ACCESS_TOKEN,
	environment: PUBLIC_SQUARE_ENVIRONMENT as Environment
});

export async function POST({ request }) {
	const { locationId, sourceId, amount, email, note, reference_id } = await request.json();
	try {
		const { result } = await paymentsApi.createPayment({
			locationId,
			sourceId,
			idempotencyKey: randomUUID(),
			amountMoney: {
				amount: amount,
				currency: 'AUD'
			},
			buyerEmailAddress: email,
			note,
			referenceId: reference_id,
			statementDescriptionIdentifier: 'Sculpture Fee'
		});
		console.log('Result from createPayment: ', { result });
		return json(result);
	} catch (err) {
		// TODO - log more concise payment errors
		// if (err instanceof ApiError) {
		// 	console.log('yep, apierror:')
		// 	console.log(err.errors[0].detail)
		// }
		console.log('error after POST to api/payment');
		console.log(`err is: ${err}`);
		console.log(err.status, JSON.stringify(err?.result, null, 4));
		const data = JSON.stringify(err.errors, null, 4);
		const myOptions = { status: 400, statusText: 'It was NOT good!' };
		const myResponse = new Response(data, myOptions);
		return myResponse;
	}
}
