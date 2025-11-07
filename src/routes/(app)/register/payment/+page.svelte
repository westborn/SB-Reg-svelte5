<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import * as Card from '$lib/components/ui/card/index.js';

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

	let card: Card;

	if (myState.submission && myState.submission?.firstNations === 'Yes') {
		// No payment required - complete registration immediately
		processIndigenousEntry();
	}

	async function processIndigenousEntry() {
		const response = await sendCompleteToServer('Indigenous Entry - No Payment Required');
		if (response.result === 'error') {
			errorMessage = String(response.data);
			handleUnexpectedError(new Error(errorMessage));
		}
		goto('/view');
		return;
	}

	onMount(async () => {
		if (myState.submission && myState.submission?.firstNations !== 'Yes') {
			fetchingData = true;

			// Wait for Square.js to be fully loaded
			let attempts = 0;
			const maxAttempts = 50; // 5 seconds maximum wait

			while (!Square && attempts < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 100));
				attempts++;
			}

			if (!Square) {
				errorMessage = 'Payment system failed to load. Please refresh the page or try a different browser.';
				fetchingData = false;
				return;
			}

			const originalStyle = {
				input: {
					backgroundColor: '#f5f7f9'
				},
				'.input-container': {
					borderColor: 'transparent',
					borderRadius: '.25em'
				}
			};

			errorMessage = '';

			try {
				const payments = Square.payments(appId, locationId);
				console.log('adding payment container');

				// INIT CARD
				card = await payments.card({
					style: originalStyle
				});
				await card.attach('#card-container');
			} catch (e) {
				console.error('Card initialization error:', e);

				// Check if it's a network blocking issue
				if (
					e instanceof Error &&
					(e.message.includes('ERR_BLOCKED_BY_CLIENT') ||
						e.message.includes('Failed to fetch') ||
						e.message.includes('NetworkError'))
				) {
					errorMessage =
						'Payment processing is being blocked. Please disable ad blockers, privacy extensions, or try a different browser.';
				} else {
					errorMessage = 'Failed to initialize payment form. Please refresh the page and try again.';
				}
				fetchingData = false;
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

	async function sendCompleteToServer(receiptURL: string) {
		errorMessage = '';
		try {
			const result = await fetch(`/api/registerComplete`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ receiptURL })
			});
			if (result.status != 200) {
				const error = await result.json();
				console.log('response error', JSON.stringify(error));
				errorMessage = error.message;
			}
		} catch (err) {
			console.log('registerComplete-err' + err);
			if (err instanceof Error) {
				errorMessage = err.message;
			} else {
				errorMessage = String(err);
			}
		}

		return { result: 'success', data: null };
	}

	async function readyToPay() {
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
		fetchingData = true;
		errorMessage = '';
		const response = await sendCompleteToServer(squarePaymentResponse.payment.receiptUrl);
		// console.log('completeRegistration' + response)
		if (response.result === 'error') {
			errorMessage = String(response.data);
			handleUnexpectedError(new Error(errorMessage));
		} else {
			fetchingData = false;
			// currentRegistration.set(response.data.registration)
			// entryStore.set(response.data.entries)
			currentState = validStates.COMPLETING;
		}
		return;
	}

	async function finishRegistration() {
		fetchingData = false;
		currentState = validStates.FINISHED;
		goto('/view');
	}

	async function handlePaymentSubmission() {
		fetchingData = true;
		errorMessage = 'Sending payment to Card Processor (Square)';
		let token;
		try {
			token = await tokenize(card);
		} catch (e) {
			console.error('Tokenization error:', e);
			if (
				e instanceof Error &&
				(e.message.includes('ERR_BLOCKED_BY_CLIENT') ||
					e.message.includes('Failed to fetch') ||
					e.message.includes('NetworkError'))
			) {
				errorMessage = 'Payment blocked by browser. Please disable ad blockers and try again.';
			} else {
				errorMessage = 'Card details not correct - try again';
			}
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
			apiResponse.lastStatus.response = data;
			if (!apiResponse.lastStatus.ok) {
				errorMessage = `Payment Failed, try again later - ${handleError(apiResponse.lastStatus)}`;
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
			handleUnexpectedError(err instanceof Error ? err : new Error(String(err)));
			throw err instanceof Error ? err : new Error(String(err));
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

	const textList = $derived([
		['First Name:', myState?.submission?.firstName ?? ''],
		['Surname:', myState?.submission?.lastName ?? ''],
		['Email:', myState?.submission?.email ?? '']
	]);
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
			<Card.Root>
				<Card.Header class="p-2 sm:px-6">
					<Card.Title class="text-xl">Registration Payment</Card.Title>
				</Card.Header>
				<Card.Content class="p-2 sm:px-6">
					<div class="my-3 grid grid-cols-[14ch_1fr] items-center">
						{#each textList as [textItem, textValue]}
							{@render TextList(textItem, textValue)}
						{/each}
					</div></Card.Content
				>
			</Card.Root>
		</div>
		{#if myState.submission.firstNations === 'Yes'}
			<p class="mt-4 text-sm italic text-green-600">First Nations discount applied.</p>
		{:else}
			<p class="mt-6 text-xl text-red-400">
				Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}{registrationPaid}
			</p>
			{#if errorMessage}
				<div class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
					<p class="font-medium text-red-700">{errorMessage}</p>
					{#if errorMessage.includes('blocked')}
						<div class="mt-2 text-sm text-red-600">
							<p>Try these steps:</p>
							<ul class="mt-1 list-inside list-disc space-y-1">
								<li>Disable ad blockers (uBlock Origin, AdBlock Plus, etc.)</li>
								<li>Disable privacy extensions</li>
								<li>Try an incognito/private window</li>
								<li>Try a different browser</li>
							</ul>
						</div>
					{/if}
				</div>
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
	{/if}
</section>

{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p class="text-sm font-semibold">{textValue}&nbsp</p>
{/snippet}
