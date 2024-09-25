<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import { entrySchemaUI } from '$lib/zod-schemas';
	import { getRegisterState, updateWorkingImage } from '$lib/context.svelte';
	import { ImageUploadForm, OptimisedImage } from '$lib/components';

	type Props = {
		currentEntryId: number;
	};

	let { currentEntryId }: Props = $props();
	let myState = getRegisterState();
	updateWorkingImage(null);

	const form = superForm(myState.entryForm, {
		id: `entryUpdateForm`,
		validators: zodClient(entrySchemaUI),
		dataType: 'json',
		onSubmit({ jsonData }) {
			// pass the image that we accepted, into this form's data when they save the new entry
			jsonData({ ...$formData, image: JSON.stringify(myState.workingImage), idToUpdate: currentEntryId });
		},
		onResult({ result, cancel }: { result: any; cancel: () => void }) {
			console.log('Action result', result);
			if (result.type != 'success') {
				toast.error('Failed to update entry');
				myState.entryUpdateDialogOpen = false; //TODO: is this working??
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
		// set the radio button values
		$formData.enterMajorPrize = entry?.enterMajorPrize ? 'Yes' : 'No';
		//set the working image to the current image if there is one
		if (entry.images[0]) {
			updateWorkingImage({ ...entry.images[0], artistId: myState.submission?.registrations[0].artistId as number });
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form method="POST" action="?/entryUpdate" class="w-full space-y-4" use:enhance id="entryUpdateForm">
	<!-- stop the form from submitting on enter key press -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>

	<Form.Field {form} name="title">
		<Form.Control let:attrs>
			<Form.Label>Title for this Exhibit</Form.Label>
			<Input autofocus type="text" {...attrs} bind:value={$formData.title} required />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	{#if myState.workingImage?.cloudURL}
		<div class="self-center">
			<OptimisedImage
				path={myState.workingImage?.cloudURL ? myState.workingImage?.cloudURL : '/dummy_160x160_ffffff_cccccc.png'}
				alt="Current Image"
				width={128}
				height={128}
				class="h-32 w-32 overflow-hidden rounded object-contain"
			/>
		</div>
	{/if}

	<ImageUploadForm buttonText={'Replace Image?'} />

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

	<div class="relative mt-8 w-full px-2">
		<details class="text-gray-600">
			<summary>Requirements for Major Prize Entries? </summary>
			You will need to supply a "Supporting Portfolio" containing:<br />
			<ul class="list-outside list-disc">
				<li class="mx-8">Artist statement of intent up to A4</li>
				<li class="mx-8">
					Up to 4 high quality images of recent exhibition quality works, thus showing the scope of your work. Not more
					than 5 years previous.
				</li>
				<li class="mx-8">An Artist CV, Maximum A4</li>
				<li class="mx-8">Prior to final judging a publishable image of the 2024 entry.</li>
			</ul>
		</details>
	</div>

	<Form.Field class="px-2" {form} name="enterMajorPrize">
		<Form.Legend class="mb-2">Submit this entry to the Major Prize program?</Form.Legend>
		<RadioGroup.Root class="flex flex-row" bind:value={$formData.enterMajorPrize as string}>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="Yes" id="r1" />
				<Label for="r1">Yes</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="No" id="r2" />
				<Label for="r2">No</Label>
			</div>
			<RadioGroup.Input name="enterMajorPrize" />
		</RadioGroup.Root>
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
		Save Updated Entry?
		{#if $delayed}
			<Loader2 class="ml-4 h-6 w-6 animate-spin" />
		{/if}
	</Form.Button>
</form>
