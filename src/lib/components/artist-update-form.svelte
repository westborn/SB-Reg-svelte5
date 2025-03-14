<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { untrack } from 'svelte';

	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	import { artistSchemaUI } from '$lib/zod-schemas';
	import { getRegisterState } from '$lib/context.svelte.js';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';

	let myState = getRegisterState();

	let form = superForm(myState.artistForm, {
		id: `artistUpdateForm-${myState?.submission?.id}`,
		validators: zodClient(artistSchemaUI),
		onResult({ result }: { result: any }) {
			if (result.type != 'success') {
				toast.error('Failed to Update the Registration');
				return;
			}
			myState.submission = result?.data?.updatedSubmission;
			toast.success(' Registration Updated');
			myState.artistUpdateDialogOpen = false; //TODO: this is not working
			return;
		}
	});
	const { form: formData, enhance, errors, message, delayed } = form;

	// grab the form field values from the submission object
	$effect(() => {
		const firstName = untrack(() => myState?.submission?.firstName ?? '');
		const lastName = untrack(() => myState?.submission?.lastName ?? '');
		const phone = untrack(() => myState?.submission?.phone ?? '');
		const postcode = untrack(() => myState?.submission?.postcode ?? '');
		const firstNations = untrack(() => myState?.submission?.firstNations ?? 'Declined');
		const bankAccountName = untrack(() => myState?.submission?.bankAccountName ?? '');
		const bankBSB = untrack(() => myState?.submission?.bankBSB ?? '');
		const bankAccount = untrack(() => myState?.submission?.bankAccount ?? '');
		$formData.firstName = firstName;
		$formData.lastName = lastName;
		$formData.phone = phone;
		$formData.postcode = postcode;
		$formData.firstNations = firstNations;
		$formData.bankAccountName = bankAccountName;
		$formData.bankBSB = bankBSB;
		$formData.bankAccount = bankAccount;
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form method="POST" action="?/artistUpdate&id={myState?.submission?.id}" use:enhance class="w-full space-y-4">
	<!-- stop the form from submitting on enter key press -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>

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

	<p class="pt-6 text-sm text-muted-foreground">(You can add this bank stuff later if you like...)</p>

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
	<Form.Button disabled={$delayed}>
		Save?
		{#if $delayed}
			<LoaderCircle class="ml-4 h-6 w-6 animate-spin" />
		{/if}
	</Form.Button>
</form>
