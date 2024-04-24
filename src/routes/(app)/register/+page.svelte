<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { artistPublicSchema } from '$lib/zod-schemas';
	import * as Card from '$lib/components/ui/card/index.js';
	import { getArtistCollection } from '../../../lib/components/server/artist';
	import { Button } from '../../../lib/components/ui/button';
	import { Loader2 } from 'lucide-svelte';

	let { data } = $props();
	const form = superForm(data.form, {
		validators: zodClient(artistPublicSchema),
		resetForm: false
	});
	const { form: formData, enhance, errors, message } = form;
</script>

<div class="container mx-auto max-w-xl">
	<Card.Root>
		<Card.Header>
			<Card.Title>Registration Management</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col text-center">
				<h1 class="text-2xl font-semibold tracking-tight">
					Mandatory Registration Information
				</h1>
				<p class="text-sm text-muted-foreground">
					We'd like this basic information so we can contact you
				</p>
			</div>
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

				<div class="pt-6 text-sm text-muted-foreground">
					(You can add this bank stuff later if you like...)
				</div>

				<Form.Field {form} name="bankAccountName">
					<Form.Control let:attrs>
						<Form.Label>Bank Account Name</Form.Label>
						<Input
							type="text"
							{...attrs}
							bind:value={$formData.bankAccountName}
						/>
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
						<span class="text-sm text-muted-foreground">
							Just a little note</span
						>
					</div>
				{:else}
					<div class="font-semibold text-red-700">{$message}</div>
					<Button disabled>
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						We can't do anything now...
					</Button>
				{/if}
			</form>
		</Card.Content>
	</Card.Root>
</div>

<pre>
	{`Artist: id: ${data.artistCollection.id}	email: ${data.artistCollection.email}	Registration Id: ${data.artistCollection.registrations[0].id}`}
<!-- {JSON.stringify(data.artistCollection, null, 2)} -->
{JSON.stringify(data.form, null, 2)}
</pre>

<pre> {Object.keys(data)}</pre>
