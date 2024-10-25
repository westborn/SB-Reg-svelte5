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

	let { data } = $props();
	let { session, user } = data;
	const form = superForm(data.form, {
		validators: zodClient(emailSchema)
	});
	const { form: formData, enhance, errors } = form;
</script>

<h1>Test Page</h1>

<form method="POST" action="?/sendEmail" use:enhance class="w-full max-w-xl space-y-4">
	<!-- stop the form from submitting on enter key press -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>

	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label>Email To</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.email} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Errors errors={$errors._errors} />
	<div class="flex">
		<Form.Button>Send Email</Form.Button>
	</div>
</form>
