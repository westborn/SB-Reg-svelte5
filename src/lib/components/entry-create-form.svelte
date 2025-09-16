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
	import { MultipleImageUploadForm, ImageGallery } from '$lib/components';

	let myState = getRegisterState();

	const form = superForm(myState.entryForm, {
		id: `entryCreateForm`,
		validators: zodClient(entrySchemaUI),
		dataType: 'json',
		onSubmit({ jsonData }) {
			// pass the images that we accepted, into this form's data when they save the new entry
			const imagesWithPrimary = myState.getImagesWithPrimary();
			jsonData({
				...$formData,
				images: JSON.stringify(imagesWithPrimary.images),
				primaryImageId: imagesWithPrimary.primaryImageId
			});
		},
		onResult({ result }: { result: any }) {
			if (result.type != 'success') {
				toast.error('Failed to create entry');
				console.log('Create Failed', JSON.stringify(result, null, 2));
				return;
			}
			myState.submission = result?.data?.updatedSubmission;
			toast.success('Entry Added');
			myState.entryCreateDialogOpen = false; //TODO: this is not working
			return;
		}
	});

	const { form: formData, enhance, delayed, errors } = form;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form method="POST" action="?/entryCreate" class="w-full space-y-4" use:enhance id="entryCreateForm">
	<!-- stop the form from submitting on enter key press -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>

	<Form.Field {form} name="title">
		<Form.Control let:attrs>
			<Form.Label>Title for this Exhibit</Form.Label>
			<Input autofocus type="text" {...attrs} bind:value={$formData.title} required />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	{#if myState.workingImages && myState.workingImages.length > 0}
		<div class="space-y-2">
			<Label>Current Images</Label>
			<ImageGallery images={myState.workingImages} primaryImageId={myState.primaryImageId} columns={3} />
		</div>
	{/if}

	<MultipleImageUploadForm triggerText="Upload Images" />

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
			<RadioGroup.Input name="inOrOut" />
		</RadioGroup.Root>
	</Form.Field>

	<Form.Field {form} name="price">
		<Form.Control let:attrs>
			<Form.Label>Price (in whole dollars)</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.price} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="material">
		<Form.Control let:attrs>
			<Form.Label>Material used in this piece</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.material} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<p class="text-gray-600">
		Size of this piece <span class="font-semibold">in centimetres</span> (L x W x H)
	</p>
	<div class="grid grid-cols-3 gap-4">
		<Form.Field {form} name="dimLength">
			<Form.Control let:attrs>
				<Form.Label>Length</Form.Label>
				<Input type="text" {...attrs} bind:value={$formData.dimLength} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="dimWidth">
			<Form.Control let:attrs>
				<Form.Label>Width</Form.Label>
				<Input type="text" {...attrs} bind:value={$formData.dimWidth} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="dimHeight">
			<Form.Control let:attrs>
				<Form.Label>Height</Form.Label>
				<Input type="text" {...attrs} bind:value={$formData.dimHeight} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<Form.Field {form} name="specialRequirements">
		<Form.Control let:attrs>
			<Form.Label>Any special requirements?</Form.Label>
			<Input type="text" {...attrs} bind:value={$formData.specialRequirements} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="description">
		<Form.Control let:attrs>
			<Form.Label>Description for the catalogue (25 words)</Form.Label>
			<Textarea {...attrs} class="resize-none" bind:value={$formData.description as string} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Errors errors={$errors._errors} />
	<Form.Button disabled={$delayed}>
		Save New Entry?
		{#if $delayed}
			<LoaderCircle class="ml-4 h-6 w-6 animate-spin" />
		{/if}
	</Form.Button>
</form>
