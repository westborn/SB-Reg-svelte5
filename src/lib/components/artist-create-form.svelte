<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { SuperValidated } from 'sveltekit-superforms';

	import * as Form from '$lib/components/ui/form/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import { artistSchemaUI } from '$lib/zod-schemas';
	import { getRegisterState } from '$lib/context.svelte.js';

	let myState = getRegisterState();

	let form = superForm(myState.artistForm, {
		id: `createArtistForm`,
		validators: zodClient(artistSchemaUI),
		applyAction: true,
		onUpdated: () => {
			if ($message === 'Success') {
				toast.success('Artist Profile Added');
				$message = null;
				myState.dialogOpen = false;
				// TODO update return value from load function
			} else {
				toast.error('Artist Profile Create Failed!');
			}
		}
	});

	const { form: formData, enhance, errors, message } = form;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
	method="POST"
	action="?/createArtist"
	use:enhance
	class="w-full space-y-4"
	onkeydown={(event) => event.key != 'Enter'}
>
	<Form.Field {form} name="firstName">
		<Form.Control let:attrs>
			<Form.Label>First Name</Form.Label>
			<Input autofocus type="text" {...attrs} bind:value={$formData.firstName} />
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

	<Form.Field class="px-2" {form} name="firstNations">
		<Form.Legend class="mb-2">Do you identify as Indigenous?</Form.Legend>
		<RadioGroup.Root class="flex flex-row" bind:value={$formData.firstNations as string}>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="Yes" id="r1" />
				<Label for="r1">Yes</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="No" id="r2" />
				<Label for="r2">No</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="Declined" id="r3" />
				<Label for="r3">Declined</Label>
			</div>
			<RadioGroup.Input name="firstNations" />
		</RadioGroup.Root>
	</Form.Field>

	<p class="pt-4 text-sm text-muted-foreground">(You can add this bank stuff later if you like...)</p>

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
	{#if !$message}
		<div>
			<Form.Button>Create Registration?</Form.Button>
			<span class="text-sm text-muted-foreground"> Just a little note</span>
		</div>
	{:else}
		<div class="font-semibold text-red-700">{$message}</div>
		<Button disabled>
			<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			We can't do anything now...
		</Button>
	{/if}
</form>
