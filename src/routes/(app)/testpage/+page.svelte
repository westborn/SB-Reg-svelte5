<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import SuperDebug, { superForm } from 'sveltekit-superforms';

	const emailSchema = z.object({
		email: z
			.string({ required_error: 'Email is required' })
			.email({ message: 'Email must be a valid email' })
			.toLowerCase()
	});

	let message = $state('');
	let { data } = $props();
	let { session, user } = data;
	const form = superForm(data.form, {
		validators: zodClient(emailSchema)
	});
	const { form: formData, enhance, errors } = form;

	async function sendEmail() {
		// send the email
		message = '';
		try {
			const result = await fetch(`/api/registerComplete`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ receiptURL: 'this is the URL' })
			});
			if (result.status != 200) {
				const error = await result.json();
				console.log('response error', JSON.stringify(error));
				message = error.message;
			}
		} catch (err) {
			console.log('registerComplete-err' + err);
			message = err.message;
		}
	}
</script>

<h1>Test Page</h1>

<!-- <form method="POST" action="?/sendEmail" use:enhance class="w-full max-w-xl space-y-4"> -->
<!-- stop the form from submitting on enter key press -->
<!-- <button type="submit" disabled style="display: none" aria-hidden="true"></button> -->

<!-- <Form.Field {form} name="email"> -->
<!-- <Form.Control let:attrs> -->
<!-- <Form.Label>Email To</Form.Label> -->
<!-- <Input type="text" {...attrs} bind:value={$formData.email} /> -->
<!-- </Form.Control> -->
<!-- <Form.FieldErrors /> -->
<!-- </Form.Field> -->
<!-- <Form.Errors errors={$errors._errors} /> -->
<!-- <div class="flex"> -->
<!-- <Form.Button>Send Email</Form.Button> -->
<!-- </div> -->
<!-- </form> -->

<div class="mt-6 max-w-prose px-3">
	<!-- this is the container that gets the Credit Card fields dropped into it by Square -->
	<div id="card-container" class="w-100 mx-auto"></div>
	<button
		onclick={sendEmail}
		class="mt-8 inline-block w-auto rounded-lg bg-red-400 px-7 py-3 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-red-500 hover:shadow-lg focus:bg-red-500 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-200 active:shadow-lg disabled:cursor-not-allowed"
		>Send Email</button
	>
</div>
