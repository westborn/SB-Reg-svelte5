<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import { confirmSchemaUI } from '$lib/zod-schemas';
	import { getRegisterState } from '$lib/context.svelte.js';
	import { untrack } from 'svelte';

	let myState = getRegisterState();

	let form = superForm(myState.confirmForm, {
		id: 'confirmUpdate',
		validators: zodClient(confirmSchemaUI),
		onResult({ result, cancel }: { result: any; cancel: () => void }) {
			if (result.type != 'success') {
				toast.error('Failed to Update the Registration');
				cancel();
				return;
			}
			myState.submission = result?.data?.updatedSubmission;
			toast.success(' Registration Updated');
			return;
		}
	});
	const { form: formData, enhance, errors, message } = form;

	// grab the form field values from the submission object
	$effect(() => {
		const bumpIn = untrack(() => myState?.submission?.registrations[0].bumpIn);
		const bumpOut = untrack(() => myState?.submission?.registrations[0].bumpOut);
		const crane = untrack(() => myState?.submission?.registrations[0].crane);
		const displayRequirements = untrack(() => myState?.submission?.registrations[0].displayRequirements ?? '');
		const accommodation = untrack(() => myState?.submission?.registrations[0].accommodation);
		const transport = untrack(() => myState?.submission?.registrations[0].transport);
		const bankAccountName = untrack(() => myState?.submission?.bankAccountName ?? '');
		const bankBSB = untrack(() => myState?.submission?.bankBSB ?? '');
		const bankAccount = untrack(() => myState?.submission?.bankAccount ?? '');
		$formData.bumpIn = bumpIn;
		$formData.bumpOut = bumpOut;
		$formData.crane = crane ? 'Yes' : 'No';
		$formData.displayRequirements = displayRequirements;
		$formData.accommodation = accommodation ? 'Yes' : 'No';
		$formData.transport = transport ? 'Yes' : 'No';
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
		<Form.Control let:attrs>
			<Form.Label>Any special requirements for the display area</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.displayRequirements} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field class="px-2" {form} name="bumpIn">
		<Form.Legend class="mb-2">Indicate when you require the Bump In team to be on hand to assist</Form.Legend>
		<RadioGroup.Root class="ml-6" bind:value={$formData.bumpIn as string}>
			<div class="flex">
				<RadioGroup.Item value="Thursday morning 7 March" id="bi1" />
				<Label for="bi1">Thursday morning 7 March</Label>
			</div>
			<div class="flex">
				<RadioGroup.Item value="Thursday afternoon 7 March" id="bi2" />
				<Label for="bi2">Thursday afternoon 7 March</Label>
			</div>
			<div class="flex">
				<RadioGroup.Item value="Friday morning - until 12.00 pm 8 March" id="bi3" />
				<Label for="bi3">Friday morning - until 12.00 pm 8 March</Label>
			</div>
			<RadioGroup.Input name="bumpIn" />
		</RadioGroup.Root>
	</Form.Field>

	<Form.Field class="px-2" {form} name="bumpOut">
		<Form.Legend class="mb-2">Indicate when you require the Bump Out team to be on hand to assist</Form.Legend>
		<RadioGroup.Root class="ml-6" bind:value={$formData.bumpOut as string}>
			<div class="flex">
				<RadioGroup.Item value="Sunday afternoon from 3.00 pm 17 March" id="bo1" />
				<Label for="bo1">Sunday afternoon from 3.00 pm 17 March</Label>
			</div>
			<div class="flex">
				<RadioGroup.Item value="Monday morning 18 March" id="bo2" />
				<Label for="bo2">Monday morning 18 March</Label>
			</div>
			<RadioGroup.Input name="bumpOut" />
		</RadioGroup.Root>
	</Form.Field>

	<Form.Field class="px-2" {form} name="crane">
		<Form.Legend class="mb-2">Do you need a Crane?</Form.Legend>
		<RadioGroup.Root class="ml-6 flex flex-row" bind:value={$formData.crane as string}>
			<div class="flex">
				<RadioGroup.Item value="Yes" id="c1" />
				<Label for="c1">Yes</Label>
			</div>
			<div class="flex">
				<RadioGroup.Item value="No" id="c2" />
				<Label for="c2">No</Label>
			</div>
			<RadioGroup.Input name="crane" />
		</RadioGroup.Root>
	</Form.Field>

	<Form.Field class="px-2" {form} name="transport">
		<Form.Legend class="mb-2">Would you like to discuss a Transport subsidy?</Form.Legend>
		<RadioGroup.Root class="ml-6 flex flex-row" bind:value={$formData.transport as string}>
			<div class="flex">
				<RadioGroup.Item value="Yes" id="t1" />
				<Label for="t1">Yes</Label>
			</div>
			<div class="flex">
				<RadioGroup.Item value="No" id="t2" />
				<Label for="t2">No</Label>
			</div>
			<RadioGroup.Input name="transport" />
		</RadioGroup.Root>
	</Form.Field>

	<Form.Field class="px-2" {form} name="accommodation">
		<Form.Legend class="mb-2">Would you like to discuss an Accommodation subsidy?</Form.Legend>
		<RadioGroup.Root class="ml-6 flex flex-row" bind:value={$formData.accommodation as string}>
			<div class="flex">
				<RadioGroup.Item value="Yes" id="a1" />
				<Label for="a1">Yes</Label>
			</div>
			<div class="flex">
				<RadioGroup.Item value="No" id="a2" />
				<Label for="a2">No</Label>
			</div>
			<RadioGroup.Input name="accommodation" />
		</RadioGroup.Root>
	</Form.Field>

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
			<Form.Button>Save?</Form.Button>
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
