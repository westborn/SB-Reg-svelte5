<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from 'lucide-svelte';

	import { artistPublicSchema } from '$lib/zod-schemas';

	// TODO add an interface type for $props to avoid an error
	let { data } = $props();
	const form = superForm(data.form, {
		validators: zodClient(artistPublicSchema),
		resetForm: false
	});
	const { form: formData, enhance, errors, message } = form;
</script>

<form
	method="POST"
	action="?/updateArtist&id={data.artistCollection.id}"
	use:enhance
	class="w-full space-y-4"
>
	<Form.Field {form} name="firstName">
		<Form.Control let:attrs>
			<Form.Label>First Name</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.firstName} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="lastName">
		<Form.Control let:attrs>
			<Form.Label>Last Name</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.lastName} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="phone">
		<Form.Control let:attrs>
			<Form.Label>Phone</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.phone} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="postcode">
		<Form.Control let:attrs>
			<Form.Label>Postcode (or City)</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.postcode} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<p class="pt-6 text-sm text-muted-foreground">
		(You can add this bank stuff later if you like...)
	</p>

	<Form.Field {form} name="bankAccountName">
		<Form.Control let:attrs>
			<Form.Label>Bank Account Name</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.bankAccountName} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="bankBSB">
		<Form.Control let:attrs>
			<Form.Label>Account BSB</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.bankBSB} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="bankAccount">
		<Form.Control let:attrs>
			<Form.Label>Account Number</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.bankAccount} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Errors errors={$errors._errors} />
	{#if !$message || $message.substring(0, 7) == 'Success'}
		<div class="font-semibold text-green-700">{$message}</div>
		<div>
			<Form.Button>Update?</Form.Button>
			<span class="text-sm text-muted-foreground"> Just a little note</span>
		</div>
	{:else}
		<div class="font-semibold text-red-700">{$message}</div>
		<Button disabled>
			<Loader2 class="w-4 h-4 mr-2 animate-spin" />
			We can't do anything now...
		</Button>
	{/if}
</form>
