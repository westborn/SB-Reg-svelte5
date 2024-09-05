<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import { handleError, handleUnexpectedError, processResponse, apiResponse } from '$lib/utils.ts';

	import { PUBLIC_SQUARE_APP_ID, PUBLIC_SQUARE_LOCATION_ID } from '$env/static/public';
	import { getRegisterState } from '$lib/context.svelte';
	import { getStep } from '$lib/stepsState.svelte';

	apiResponse.lastStatus = {
		ok: true,
		status: 200,
		statusText: 'OK',
		url: ''
	};

	const appId = PUBLIC_SQUARE_APP_ID;
	const locationId = PUBLIC_SQUARE_LOCATION_ID;

	const validStates = {
		COMMENCING: 'COMMENCE',
		PAYING: 'PAY',
		COMPLETING: 'COMPLETE',
		FINISHED: 'FINISH',
		PAYMENTERROR: 'PAYMENTERROR'
	};

	let currentStep = getStep();
	currentStep.step = 3;
	const myState = getRegisterState();

	let currentState = $state('');
	currentState = validStates.COMMENCING;
	let errorMessage = $state('');
	let fetchingData = $state(false);

	let costOfRegistration = $derived(myState.currentEntries ? 20 + myState.currentEntries.length * 20 : 20);
	let numberOfEntries = $derived(
		myState.currentEntries
			? myState.currentEntries.length + (myState.currentEntries.length === 1 ? ' entry' : ' entries')
			: ''
	);

	let costOfRegistrationInCents = $derived(costOfRegistration * 100);
	let registrationPaid = $derived(myState?.submission?.registrations[0].closed ? ' (Paid)' : '');

	type Card = {
		attach: (containerId: string) => Promise<any>;
		tokenize: () => Promise<{ token: string; status: string; errors?: JSON }>;
	};
	let card: Card;

	onMount(async () => {
		if (myState.submission) {
			fetchingData = true;

			const originalStyle = {
				input: {
					backgroundColor: '#f5f7f9'
				},
				'.input-container': {
					borderColor: 'transparent',
					borderRadius: '.25em'
				}
			};

			if (!Square) {
				throw new Error('Square.js failed to load properly');
			}
			errorMessage = '';
			const payments = Square.payments(appId, locationId);
			console.log('adding payment container');

			// INIT CARD
			try {
				card = await payments.card({
					style: originalStyle
				});
				await card.attach('#card-container');
			} catch (e) {
				// TODO: error handling
				errorMessage = 'Initializing card failed - please try again later';
				console.error(errorMessage);
				return;
			}
			fetchingData = false;
		}
	});

	async function tokenize(paymentMethod: { attach?: (containerId: string) => Promise<any>; tokenize: any }) {
		const tokenResult = await paymentMethod.tokenize();
		if (tokenResult.status === 'OK') {
			return tokenResult.token;
		} else {
			let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
			if (tokenResult.errors) {
				errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
			}
			throw new Error(errorMessage);
		}
	}

	let sendCompleteToServer = async (data: { registrationId: number | undefined; email: string | undefined }) => {
		errorMessage = '';
		console.log('sending to backend? TODO');
		console.log(data);
		return { result: 'success', data: null };
	};

	async function readyToPay() {
		console.log('readyToPay: here');
		//try to make the CC  payment
		await handlePaymentSubmission();
		//if not OK - show any errors and allow retry?
		if (!apiResponse.lastStatus.ok) return;

		//did the payment complete OK
		const paymentCompleted = apiResponse?.lastStatus?.response?.payment?.status === 'COMPLETED';
		if (!paymentCompleted) return;
		errorMessage = 'Payment completed';
		completeRegistration(apiResponse.lastStatus.response);
		return;
	}

	async function completeRegistration(squarePaymentResponse: { payment: { receiptUrl: any } }) {
		console.log('completeRegistration: here');
		console.log(squarePaymentResponse.payment.receiptUrl);
		fetchingData = true;
		errorMessage = '';
		const response = await sendCompleteToServer({
			registrationId: myState?.submission?.registrations[0].id,
			email: myState?.submission?.email
		});
		// console.log('completeRegistration' + response)
		if (response.result === 'error') {
			errorMessage = response.data;
			handleUnexpectedError(errorMessage);
		} else {
			fetchingData = false;
			// currentRegistration.set(response.data.registration)
			// entryStore.set(response.data.entries)
			currentState = validStates.COMPLETING;
		}
		return;
	}

	async function finishRegistration() {
		console.log('finishRegistration: here');
		fetchingData = false;
		currentState = validStates.FINISHED;
		goto('/view');
	}

	async function handlePaymentSubmission() {
		console.log('handlePaymentSubmission: here');
		fetchingData = true;
		errorMessage = 'Sending payment to Card Processor (Square)';
		let token;
		try {
			token = await tokenize(card);
		} catch (e) {
			errorMessage = 'Card details not correct - try again';
			console.error(e.message);
			fetchingData = false;
			return;
		}
		apiResponse.lastStatus = {
			ok: true,
			status: 200,
			statusText: 'OK',
			url: ''
		};

		currentState = validStates.PAYING;
		try {
			const paymentResponse = await fetch(`/api/payment`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					locationId,
					sourceId: token,
					amount: costOfRegistrationInCents,
					email: myState?.submission?.email,
					note: `Registration - ${myState?.submission?.firstName} ${myState?.submission?.lastName} (${myState?.submission?.email}) - ID:${myState?.submission?.registrations[0].id} `,
					reference_id: `Registration ${myState?.submission?.registrations[0].id}`
				})
			});
			const data = await processResponse(paymentResponse);
			console.log(`handlePaymentSubmission-data: ${JSON.stringify(data, null, 4)}`);
			apiResponse.lastStatus.response = data;
			if (!apiResponse.lastStatus.ok) {
				errorMessage = `Payment Failed, try again later - ${handleError(apiResponse.lastStatus).detail}`;
				currentState = validStates.PAYMENTERROR;
				return;
			}
			// Payment response was ok so move on to completing
			currentState = validStates.COMPLETING;
			return;
		} catch (err) {
			console.log('handlePaymentSubmission-err' + err);
			currentState = validStates.PAYMENTERROR;
			errorMessage = 'Payment failed';
			handleUnexpectedError(err);
			throw new Error(err);
		}
	}

	// 	{
	//   payment: {
	//     id: 'rzrywF0mJGLH6FVv0rGe6ghfDHWZY',
	//     createdAt: '2023-11-06T03:46:32.187Z',
	//     updatedAt: '2023-11-06T03:46:32.391Z',
	//     amountMoney: { amount: 100n, currency: 'AUD' },
	//     totalMoney: { amount: 100n, currency: 'AUD' },
	//     approvedMoney: { amount: 100n, currency: 'AUD' },
	//     status: 'COMPLETED',
	//     delayDuration: 'PT168H',
	//     delayAction: 'CANCEL',
	//     delayedUntil: '2023-11-13T03:46:32.187Z',
	//     sourceType: 'CARD',
	//     cardDetails: {
	//       status: 'CAPTURED',
	//       card: [Object],
	//       entryMethod: 'KEYED',
	//       cvvStatus: 'CVV_ACCEPTED',
	//       avsStatus: 'AVS_REJECTED',
	//       statementDescription: 'SQ *TEST HEAD OFFICE',
	//       cardPaymentTimeline: [Object]
	//     },
	//     locationId: 'LWSA7ZHB2BHV3',
	//     orderId: '2BgfV606aYvXlqc2KyEdXhgcCg4F',
	//     receiptNumber: 'rzry',
	//     receiptUrl: 'https://squareupsandbox.com/receipt/preview/rzrywF0mJGLH6FVv0rGe6ghfDHWZY',
	//     applicationDetails: {
	//       squareProduct: 'ECOMMERCE_API',
	//       applicationId: 'sandbox-sq0idb-cgiuJtJuEtUWTsU1f8j-eA'
	//     },
	//     versionToken: '9oVj8WymLtKNjFrVyRducOkPvOW98wIlUrOQCdZTUZX6o'
	//   }
	// }
</script>

<section class="container mx-auto max-w-prose px-3">
	{#if !myState.submission}
		<h1 class="mb-6 text-xl font-bold">Please register first</h1>
		<button
			type="button"
			onclick={() => goto('/')}
			class="rounded-md bg-primary-300 px-5 py-1 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-400 hover:shadow-lg focus:bg-primary-400 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-200 active:shadow-lg"
			>Back
		</button>
	{:else}
		<div class="mt-4 text-base">
			<div class="mt-6 grid grid-cols-[13ch_1fr] items-center">
				<div>
					<p>First Name:</p>
					<p>{myState.submission?.firstName}</p>
				</div>
				<div>
					<p>Surname:</p>
					<p>{myState.submission?.lastName}</p>
				</div>
				<div>
					<p>Email:</p>
					<p>{myState.submission?.email}</p>
				</div>
			</div>
			<p class="mt-6 text-xl text-red-400">
				Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}{registrationPaid}
			</p>
		</div>
		{#if errorMessage}
			<p class="mt-6 text-red-500">{errorMessage}</p>
		{:else}
			<p class="mt-6">&nbsp</p>
		{/if}

		{#if currentState === validStates.COMMENCING || currentState === validStates.PAYMENTERROR}
			<div class="mt-6 max-w-prose px-3">
				<!-- this is the container that gets the Credit Card fields dropped into it by Square -->
				<div id="card-container" class="w-100 mx-auto"></div>
				<button
					onclick={readyToPay}
					disabled={fetchingData}
					class="mt-8 inline-block w-auto rounded-lg bg-red-400 px-7 py-3 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-red-500 hover:shadow-lg focus:bg-red-500 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-200 active:shadow-lg disabled:cursor-not-allowed"
					>Pay Registration of ${costOfRegistration}</button
				>
			</div>
		{/if}

		{#if currentState === validStates.COMPLETING}
			<div class="flex flex-col items-center justify-center">
				<a
					href={apiResponse?.lastStatus?.response?.payment?.receiptUrl}
					class="text-blue-600 underline hover:text-blue-700 hover:underline"
					target="_blank"
					rel="noopener noreferrer">Click here for your receipt</a
				>
				<button
					onclick={() => finishRegistration()}
					disabled={fetchingData}
					class="mt-2 inline-block rounded-lg bg-primary-400 px-7 py-2 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-500 hover:shadow-lg focus:bg-primary-500 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-200 active:shadow-lg"
					>Registration is now Complete</button
				>
			</div>
		{/if}
	{/if}
</section>
