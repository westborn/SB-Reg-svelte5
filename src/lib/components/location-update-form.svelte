<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';

	import { locationSchemaUI } from '$lib/zod-schemas';

	let { locationForm, exhibitNumber, entryId, formOccurence, updateLocationOnSuccess } = $props();

	const form = superForm(locationForm, {
		id: `locationForm-${formOccurence}`,
		validators: zodClient(locationSchemaUI),
		resetForm: false,
		dataType: 'json',
		onSubmit({ formData, cancel, jsonData }) {
			const newLocation = formData.get('location');
			if (!newLocation) {
				toast.error('Location Required');
				cancel();
				return;
			}
			//add the entryId to the data we send to the server
			jsonData({ location: formData.get('location'), entryId: entryId });
		},
		onResult({ result }: { result: any }) {
			if (result.type != 'success') {
				toast.error('Failed - ' + result.data.form.message);
				return;
			}
			toast.success('Success');
			disableUpdateButton = true;
			const newExhibitNumber = isNaN(parseInt(result.data.form.message.newLocation))
				? null
				: parseInt(result.data.form.message.newLocation);
			updateLocationOnSuccess(entryId, newExhibitNumber);
			$formData.location = newExhibitNumber;
		},
		onChange(event) {
			if (event.target) {
				disableUpdateButton = false;
			}
		}
	});

	const { form: formData, enhance, delayed } = form;
	$formData.location = exhibitNumber;

	let disableUpdateButton = $state(true);
</script>

<!-- {#if browser}
	<SuperDebug data={$formData} />
{/if} -->

<form method="POST" action="?/locationUpdate" use:enhance>
	<!-- stop the form from submitting on enter key press -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>
	<div class="flex gap-4">
		<Form.Field {form} name="location">
			<Form.Control let:attrs>
				<Input class="h-6" autofocus type="text" {...attrs} bind:value={$formData.location} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- <Form.Errors errors={$errors._errors} /> -->
		<Form.Button class="h-6" disabled={disableUpdateButton || $delayed} variant="destructive" size="sm">
			{#if $delayed}
				<LoaderCircle class="ml-4 h-6 w-8 animate-spin" />
			{:else}
				<p class="h-6 w-12">Update?</p>
			{/if}
		</Form.Button>
	</div>
</form>
