<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';

	import { artistSchemaUI } from '$lib/zod-schemas';
	import { getRegisterState } from '$lib/context.svelte.js';

	let myState = getRegisterState();

	let form = superForm(myState.artistForm, {
		id: `artistCreateForm`,
		validators: zodClient(artistSchemaUI),
		onResult({ result }: { result: any }) {
			if (result.type != 'success') {
				toast.error('Failed to Register the Artist');
				return;
			}
			myState.submission = result?.data?.updatedSubmission;
			toast.success('Artist is now Registered');
			myState.artistCreateDialogOpen = false;
			return;
		}
	});

	const { form: formData, enhance, errors, message, delayed } = form;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form method="POST" action="?/artistCreate" use:enhance class="w-full space-y-4">
	<!-- stop the form from submitting on enter key press -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>

	<Form.Field {form} name="firstName">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>First Name</Form.Label>
				<Input autofocus type="text" {...props} bind:value={$formData.firstName} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="lastName">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Last Name</Form.Label>
				<Input type="text" {...props} bind:value={$formData.lastName} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="phone">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Phone</Form.Label>
				<Input type="text" {...props} bind:value={$formData.phone} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="postcode">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Postcode (or City)</Form.Label>
				<Input type="text" {...props} bind:value={$formData.postcode} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field class="px-2" {form} name="firstNations">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Legend class="mb-2">Do you identify as Indigenous?</Form.Legend>
				<RadioGroup.Root class="flex flex-row" bind:value={$formData.firstNations as string} {...props}>
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
				</RadioGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<p class="pt-4 text-sm text-muted-foreground">(You can add this bank stuff later if you like...)</p>

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
		Create Registration?
		{#if $delayed}
			<LoaderCircle class="ml-4 h-6 w-6 animate-spin" />
		{/if}
	</Form.Button>
</form>
