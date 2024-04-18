<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { tokenSchema } from '$lib/zod-schemas.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import AuthPage from '../auth-page.svelte';

	let { data } = $props();
	let { session, user } = data;
	const form = superForm(data.form, {
		validators: zodClient(tokenSchema)
	});

	const { form: formData, enhance, errors } = form;
</script>

Verify email
<AuthPage type="verify-email" {session} {user}>
	<p>(auth)/verify-email/page</p>
	<pre> {JSON.stringify(session, null, 2)}</pre>

	<form method="POST" use:enhance class="w-full space-y-4">
		<Form.Field {form} name="token">
			<Form.Control let:attrs>
				<Form.Label>Token</Form.Label>
				<Input type="text" {...attrs} bind:value={$formData.token} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Errors errors={$errors._errors} />
		<Form.Button>Verify email address with this token</Form.Button>
	</form>
	<p class="px-8 text-center text-sm text-muted-foreground">
		By clicking continue, you agree to our{' '}
		<a href="/terms" class="underline underline-offset-4 hover:text-primary">
			Terms of Service
		</a>{' '}
		and{' '}
		<a href="/privacy" class="underline underline-offset-4 hover:text-primary"> Privacy Policy </a>
		.
	</p>
</AuthPage>
