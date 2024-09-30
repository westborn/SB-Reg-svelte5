<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { signupSchema } from '$lib/zod-schemas.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import AuthPage from '../auth-page.svelte';

	let { data } = $props();
	let { session, user } = data;
	const form = superForm(data.form, {
		validators: zodClient(signupSchema)
	});

	const { form: formData, enhance, errors } = form;
</script>

<AuthPage type="signup" {session} {user}>
	<div class="flex flex-col space-y-2 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
		<p class="text-sm text-muted-foreground">Start telling us about your exhibit(s) today.</p>
	</div>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<form method="POST" use:enhance class="w-full space-y-4">
		<!-- stop the form from submitting on enter key press -->
		<button type="submit" disabled style="display: none" aria-hidden="true"></button>

		<Form.Field {form} name="email">
			<Form.Control let:attrs>
				<Form.Label>Email Address</Form.Label>
				<Input autofocus type="text" {...attrs} bind:value={$formData.email} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Errors errors={$errors._errors} />
		<div class="flex">
			<Form.Button>Register</Form.Button>
			<span class="px-4 text-sm text-muted-foreground">
				We will send a token to your email address for verification - check for spam</span
			>
		</div>
	</form>
</AuthPage>
