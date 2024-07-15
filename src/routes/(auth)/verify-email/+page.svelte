<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { tokenSchema } from '$lib/zod-schemas.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import AuthPage from '../auth-page.svelte';
	import { page } from '$app/stores';

	let { data } = $props();
	let { session, user } = data;
	const form = superForm(data.form, {
		validators: zodClient(tokenSchema)
	});
	const { form: formData, enhance, errors } = form;
	const url = $page.url;
	const validatingEmail = url.searchParams.get('email');
	$formData.email = validatingEmail || '';
</script>

<AuthPage type="verify-email" {session} {user}>
	<div class="flex flex-col space-y-2 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Verify your account</h1>
		<p class="text-sm text-muted-foreground">Start telling us about your exhibit(s) today.</p>
	</div>
	<form method="POST" use:enhance class="w-full space-y-4">
		<Form.Field {form} name="email">
			<Form.Control let:attrs>
				<Form.Label>Email Address</Form.Label>
				<Input type="text" {...attrs} bind:value={$formData.email} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="token">
			<Form.Control let:attrs>
				<Form.Label
					>6 Digit Token
					<span class="py-4 text-xs text-muted-foreground">(that we sent to your email address)</span>
				</Form.Label>
				<Input autofocus type="text" {...attrs} bind:value={$formData.token} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Errors errors={$errors._errors} />
		<Form.Button>Verify email address</Form.Button>
	</form>
</AuthPage>
