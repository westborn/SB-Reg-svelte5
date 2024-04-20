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
	<!-- <p>(auth)/signup/page</p> -->
	<!-- <pre> {JSON.stringify(session, null, 2)}</pre> -->
	<div class="flex flex-col space-y-2 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
		<p class="text-sm text-muted-foreground">Start building your digital community today.</p>
	</div>
	<form method="POST" use:enhance class="w-full space-y-4">
		<Form.Field {form} name="email">
			<Form.Control let:attrs>
				<Form.Label>Email Address</Form.Label>
				<Input type="text" {...attrs} bind:value={$formData.email} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Errors errors={$errors._errors} />
		<div>
			<Form.Button>Register</Form.Button>
			<span class="text-sm text-muted-foreground">
				We will send a token to your email address for verification</span
			>
		</div>
	</form>
	<p class="py-4 text-sm text-muted-foreground">
		By clicking continue, you agree to our{' '}
		<a href="/terms" class="underline underline-offset-4 hover:text-primary"> Terms of Service</a>
		{' '}and{' '}
		<a href="/privacy" class="underline underline-offset-4 hover:text-primary">Privacy Policy.</a>
	</p>
</AuthPage>
