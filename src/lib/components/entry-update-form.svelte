<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';

	import { entrySchemaUI } from '$lib/zod-schemas';
	import { getRegisterState } from '$lib/context.svelte';
	import { MultipleImageUploadForm } from '$lib/components';

	type Props = {
		currentEntryId: number;
	};

	let { currentEntryId }: Props = $props();
	let myState = getRegisterState();

	const form = superForm(myState.entryForm, {
		id: `entryUpdateForm`,
		validators: zodClient(entrySchemaUI),
		dataType: 'json',
		onSubmit({ jsonData }) {
			// pass the images that we accepted, into this form's data when they save the updated entry
			const imagesWithPrimary = myState.getImagesWithPrimary();
			jsonData({
				...$formData,
				images: JSON.stringify(imagesWithPrimary.images),
				primaryImageId: imagesWithPrimary.primaryImageId,
				idToUpdate: currentEntryId
			});
		},
		onResult({ result }: { result: any }) {
			console.log('Action result', result);
			if (result.type != 'success') {
				toast.error('Failed to update entry');
				return;
			}
			myState.submission = result?.data?.updatedSubmission;
			toast.success('Entry Updated');
			myState.entryUpdateDialogOpen = false; //TODO: is this working??
			return;
		}
	});

	const { form: formData, enhance, delayed, errors } = form;

	// get the form field values from the submission object using the id that was passed in
	const entry = myState?.submission?.registrations[0].entries.find((entry) => entry.id === currentEntryId);
	if (entry) {
		({
			id: $formData.id,
			inOrOut: $formData.inOrOut,
			description: $formData.description,
			material: $formData.material,
			specialRequirements: $formData.specialRequirements,
			title: $formData.title
		} = entry);
		$formData.price = entry.price ? entry.price / 100 : 0;
		//split the dimensions string into the three fields
		const dimensions = entry?.dimensions?.split('x') || [];
		[$formData.dimLength, $formData.dimWidth, $formData.dimHeight] = [...dimensions, '', '', ''].slice(0, 3);
		// Image loading is now handled in the EntryUpdateDialog component
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form method="POST" action="?/entryUpdate" class="w-full space-y-4" use:enhance id="entryUpdateForm">
	<!-- stop the form from submitting on enter key press -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>

	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Title for this Exhibit</Form.Label>
				<Input autofocus type="text" {...props} bind:value={$formData.title} required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<MultipleImageUploadForm />

	<Form.Field class="px-2" {form} name="inOrOut">
		<Form.Legend class="mb-2">Entry Category?</Form.Legend>
		<RadioGroup.Root class="flex flex-row" bind:value={$formData.inOrOut as string}>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="Outdoor" id="r1" />
				<Label for="r1">Outdoor</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="Indoor" id="r2" />
				<Label for="r2">Indoor</Label>
			</div>
		</RadioGroup.Root>
	</Form.Field>

	<Form.Field {form} name="price">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Price (in whole dollars)</Form.Label>
				<Input type="text" {...props} bind:value={$formData.price} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="material">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Material used in this piece</Form.Label>
				<Input type="text" {...props} bind:value={$formData.material} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<p class="text-gray-600">
		Size of this piece <span class="font-semibold">in centimetres</span> (L x W x H)
	</p>
	<div class="grid grid-cols-3 gap-4">
		<Form.Field {form} name="dimLength">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Length</Form.Label>
					<Input type="text" {...props} bind:value={$formData.dimLength} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="dimWidth">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Width</Form.Label>
					<Input type="text" {...props} bind:value={$formData.dimWidth} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="dimHeight">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Height</Form.Label>
					<Input type="text" {...props} bind:value={$formData.dimHeight} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<Form.Field {form} name="specialRequirements">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Any special requirements?</Form.Label>
				<Input type="text" {...props} bind:value={$formData.specialRequirements} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Description for the catalogue (25 words)</Form.Label>
				<Textarea {...props} class="resize-none" bind:value={$formData.description as string} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- <Form.Errors errors={$errors._errors} /> -->
	<Form.Button disabled={$delayed}>
		Save Updated Entry?
		{#if $delayed}
			<LoaderCircle class="ml-4 h-6 w-6 animate-spin" />
		{/if}
	</Form.Button>
</form>
