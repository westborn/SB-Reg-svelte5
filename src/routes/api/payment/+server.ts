import { json } from '@sveltejs/kit';
// https://github.com/square/square-nodejs-sdk/blob/e66c2d9e32225b800be6d7f15ef9a5d9f5d516aa/README.md
// TODO: switch to modern SDK when time is available
import { Client, Environment } from 'square/legacy';
import { randomUUID } from 'crypto';
import { SECRET_SQUARE_ACCESS_TOKEN } from '$env/static/private';
import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';
import { logger } from '$lib/server/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

const { paymentsApi } = new Client({
	accessToken: SECRET_SQUARE_ACCESS_TOKEN,
	environment: PUBLIC_SQUARE_ENVIRONMENT.toLowerCase() === 'production' ? Environment.Production : Environment.Sandbox
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
		await logger.warn('Payment created successfully', {
			routeId: '/api/payment',
			userEmail: email,
			amount,
			referenceId: reference_id,
			paymentDetails: result.payment
		});
		return json(result);
	} catch (err) {
		const errorObj = err as any;
		await logger.error('Payment creation failed', err as Error, {
			routeId: '/api/payment',
			userEmail: email,
			amount,
			referenceId: reference_id,
			errorStatus: errorObj.status,
			errorResult: errorObj.result,
			errorDetails: errorObj.errors
		});
		const data = JSON.stringify(errorObj.errors, null, 4);
		const myOptions = { status: 400, statusText: 'It was NOT good!' };
		const myResponse = new Response(data, myOptions);
		return myResponse;
	}
}
