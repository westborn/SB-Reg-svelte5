<script lang="ts">
	import SuperDebug, { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';

	import * as Form from '$lib/components/ui/form/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import { entrySchemaUI } from '$lib/zod-schemas';
	import type { CurrentImage, ReturnedEntries } from '$lib/components/server/registrationDB';
	import { getRegisterState, updateImage } from '$lib/context.svelte';
	import { ImageUploadForm, OptimisedImage } from '$lib/components';

	let myState = getRegisterState();
	updateImage(null);

	type Props = {
		entryForm: SuperValidated<Record<string, unknown>, any, Record<string, unknown>>;
		imageUploadForm: SuperValidated<Record<string, unknown>, any, Record<string, unknown>>;
		currentEntries: ReturnedEntries;
	};

	let { currentEntries = $bindable(), entryForm, imageUploadForm }: Props = $props();

	let currentImage = $state(null) as CurrentImage;
	const form = superForm(entryForm, {
		id: `createEntryForm`,
		validators: zodClient(entrySchemaUI),
		dataType: 'json',
		onSubmit({ jsonData }) {
			// pass the image that we accepted, into this form's data when they save the new entry
			console.log('onSubmit - myState.workingImage', myState.workingImage);
			jsonData({ ...$formData, image: JSON.stringify(myState.workingImage) });
		},
		onUpdated: () => {
			if ($message === 'Success') {
				currentEntries = $page.data.entries;
				$message = null;
				toast.success('Entry Added');
				myState.dialogOpen = false;
			} else {
				toast.error('Entry Creation Failed!');
			}
		}
	});

	const { form: formData, enhance, message, errors } = form;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
	method="POST"
	action="?/createEntry"
	class="w-full space-y-4"
	use:enhance
	onkeydown={(event) => event.key != 'Enter'}
	id="createEntryForm"
>
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

	<ImageUploadForm buttonText={'Upload Image'} {currentImage} {imageUploadForm} />

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
	{#if !$message}
		<div>
			<Form.Button>Save New Entry?</Form.Button>
		</div>
	{:else}
		<div class="font-semibold text-red-700">{$message}</div>
		<Button disabled>
			<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			We can't do anything now...
		</Button>
	{/if}
</form>
