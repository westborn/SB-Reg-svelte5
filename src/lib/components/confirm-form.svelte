<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';

	import { confirmSchemaUI } from '$lib/zod-schemas';
	import { getRegisterState } from '$lib/context.svelte.js';
	import { untrack } from 'svelte';

	let myState = getRegisterState();

	let form = superForm(myState.confirmForm, {
		id: 'confirmUpdate',
		validators: zodClient(confirmSchemaUI),
		onResult({ result }: { result: any }) {
			if (result.type != 'success') {
				toast.error('Failed to Update the Registration');
				return;
			}
			myState.submission = result?.data?.updatedSubmission;
			toast.success(' Registration Updated');
			myState.confirmDialogOpen = false;
			return;
		}
	});
	const { form: formData, enhance, errors, message, delayed } = form;

	// grab the form field values from the submission object
	$effect(() => {
		const bumpIn = untrack(() => myState?.submission?.registrations[0].bumpIn);
		const bumpOut = untrack(() => myState?.submission?.registrations[0].bumpOut);
		const crane = untrack(() => myState?.submission?.registrations[0].crane);
		const displayRequirements = untrack(() => myState?.submission?.registrations[0].displayRequirements ?? '');
		const bankAccountName = untrack(() => myState?.submission?.bankAccountName ?? '');
		const bankBSB = untrack(() => myState?.submission?.bankBSB ?? '');
		const bankAccount = untrack(() => myState?.submission?.bankAccount ?? '');
		$formData.bumpIn = bumpIn;
		$formData.bumpOut = bumpOut;
		$formData.crane = crane ? 'Yes' : 'No';
		$formData.displayRequirements = displayRequirements;
		$formData.bankAccountName = bankAccountName;
		$formData.bankBSB = bankBSB;
		$formData.bankAccount = bankAccount;
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form method="POST" action="?/confirmUpdate" use:enhance class="w-full space-y-4">
	<!-- stop the form from submitting on enter key press -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>

	<Form.Field {form} name="displayRequirements">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Any special requirement e.g. does your artwork need a flat area</Form.Label>
				<Input type="text" {...props} bind:value={$formData.displayRequirements} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field class="px-2" {form} name="bumpIn">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Legend class="mb-2">When will you Bump In your works?</Form.Legend>
				<RadioGroup.Root class="ml-6" bind:value={$formData.bumpIn as string} {...props}>
					<div class="flex">
						<RadioGroup.Item value="Thursday morning 5 March" id="bi1" />
						<Label for="bi1">Thursday morning 5 March</Label>
					</div>
					<div class="flex">
						<RadioGroup.Item value="Thursday afternoon 5 March" id="bi2" />
						<Label for="bi2">Thursday afternoon 5 March</Label>
					</div>
					<div class="flex">
						<RadioGroup.Item value="Friday morning 6 March (until noon)" id="bi3" />
						<Label for="bi3">Friday morning 6 March (until noon)</Label>
					</div>
				</RadioGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field class="px-2" {form} name="bumpOut">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Legend class="mb-2">When will you pick up your unsold artwork?</Form.Legend>
				<RadioGroup.Root class="ml-6" bind:value={$formData.bumpOut as string} {...props}>
					<div class="flex">
						<RadioGroup.Item value="Sunday afternoon 15 March (after 3pm)" id="bo1" />
						<Label for="bo1">Sunday afternoon 15 March (after 3pm)</Label>
					</div>
					<div class="flex">
						<RadioGroup.Item value="Monday morning 16 March (9am to noon)" id="bo2" />
						<Label for="bo2">Monday morning 16 March (9am to noon)</Label>
					</div>
				</RadioGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field class="px-2" {form} name="crane">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Legend class="mb-2">Do you need a Crane?</Form.Legend>
				<RadioGroup.Root class="ml-6 flex flex-row" bind:value={$formData.crane as string} {...props}>
					<div class="flex">
						<RadioGroup.Item value="Yes" id="c1" />
						<Label for="c1">Yes</Label>
					</div>
					<div class="flex">
						<RadioGroup.Item value="No" id="c2" />
						<Label for="c2">No</Label>
					</div>
				</RadioGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="bankAccountName">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Bank Account Name</Form.Label>
				<Input type="text" {...props} bind:value={$formData.bankAccountName} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="bankBSB">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Account BSB</Form.Label>
				<Input type="text" {...props} bind:value={$formData.bankBSB} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="bankAccount">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Account Number</Form.Label>
				<Input type="text" {...props} bind:value={$formData.bankAccount} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- <Form.Errors errors={$errors._errors} /> -->
	<Form.Button disabled={$delayed}>
		Save?
		{#if $delayed}
			<LoaderCircle class="ml-4 h-6 w-6 animate-spin" />
		{/if}
	</Form.Button>
</form>
