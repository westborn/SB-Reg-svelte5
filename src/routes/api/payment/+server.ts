import { json } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { SECRET_SQUARE_ACCESS_TOKEN } from '$env/static/private';
import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';
import { logger } from '$lib/server/logger';
import { createSquareClient } from '$lib/server/squareClient';

const squareClient = createSquareClient(SECRET_SQUARE_ACCESS_TOKEN, PUBLIC_SQUARE_ENVIRONMENT);

type PaymentErrorShape = {
	message: string;
	errors: unknown[];
};

function buildPaymentErrorResponse(message: string, errors: unknown[], status: number) {
	const payload: PaymentErrorShape = {
		message,
		errors
	};

	return json(payload, { status });
}

function normalizeBigInts<T>(value: T): T {
	return JSON.parse(
		JSON.stringify(value, (_, currentValue) => (typeof currentValue === 'bigint' ? currentValue.toString() : currentValue))
	) as T;
}

export async function POST({ request }) {
	const { locationId, sourceId, amount, email, note, reference_id } = await request.json();

	const numericAmount = typeof amount === 'string' ? Number(amount) : amount;
	if (typeof numericAmount !== 'number' || !Number.isFinite(numericAmount) || numericAmount <= 0) {
		return buildPaymentErrorResponse(
			'Invalid payment amount',
			[{ path: ['amountMoney', 'amount'], message: 'Amount must be a positive whole number of cents.' }],
			400
		);
	}
	const amountInCents = BigInt(Math.round(numericAmount));

	try {
		const result = await squareClient.payments.create({
			locationId,
			sourceId,
			idempotencyKey: randomUUID(),
			amountMoney: {
				amount: amountInCents,
				currency: 'AUD'
			},
			buyerEmailAddress: email,
			note,
			referenceId: reference_id,
			statementDescriptionIdentifier: 'Sculpture Fee'
		});
		const safeResult = normalizeBigInts(result);
		const safePaymentDetails =
			safeResult && typeof safeResult === 'object' ? (safeResult as { payment?: unknown }).payment : null;

		await logger.info('Payment created successfully', {
			routeId: '/api/payment',
			userEmail: email,
			amount: amountInCents.toString(),
			referenceId: reference_id,
			paymentDetails: safePaymentDetails
		});
		return json(safeResult);
	} catch (err) {
		const errorObj = err as {
			statusCode?: number;
			status?: number;
			errors?: unknown;
			message?: string;
		};
		const normalizedErrors = Array.isArray(errorObj.errors)
			? errorObj.errors
			: [{ detail: errorObj.message ?? 'Payment failed' }];
		const statusCode =
			typeof errorObj.statusCode === 'number' ? errorObj.statusCode : typeof errorObj.status === 'number' ? errorObj.status : 400;

		await logger.error('Payment creation failed', err as Error, {
			routeId: '/api/payment',
			userEmail: email,
			amount: amountInCents.toString(),
			referenceId: reference_id,
			errorStatus: statusCode,
			errorDetails: normalizedErrors
		});

		return buildPaymentErrorResponse('Payment failed', normalizedErrors, statusCode);
	}
}
