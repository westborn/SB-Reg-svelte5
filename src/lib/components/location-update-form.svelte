<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';

	import { locationSchemaUi } from '$lib/zod-schemas';

	let { locationForm, exhibitNumber, entryId, formOccurence, updateLocationOnSuccess } = $props();

	const form = superForm(locationForm, {
		id: `locationForm-${formOccurence}`,
		validators: zodClient(locationSchemaUi),
		resetForm: false,
		onResult({ result }: { result: any }) {
			if (result.type != 'success') {
				toast.error('Failed');
				console.log(`Failed: locationForm-${formOccurence}`);
				return;
			}
			toast.success('Success');
			hideButton = true;
			console.log(`Success: locationForm-${formOccurence}  new location1: ${result.data.form.message.newLocation}`);
			const newExhibitNumber = isNaN(parseInt(result.data.form.message.newLocation))
				? null
				: parseInt(result.data.form.message.newLocation);
			updateLocationOnSuccess(entryId, newExhibitNumber);
			$formData.location = newExhibitNumber;
		},
		onChange(event) {
			if (event.target) {
				// Form input event
				// console.log(event.path, 'was changed with', event.target, 'in form', event.formElement);
				hideButton = false;
			}
		}
	});

	const { form: formData, enhance, delayed } = form;
	$formData.location = exhibitNumber;

	let hideButton = $state(true);
</script>

<!-- {#if browser}
	<SuperDebug data={$formData} />
{/if} -->

<form method="POST" action="?/locationUpdate" use:enhance class="w-full space-y-4">
	<!-- stop the form from submitting on enter key press -->
	<button type="submit" disabled style="display: none" aria-hidden="true"></button>
	<div class="flex gap-4">
		<Form.Field {form} name="location">
			<Form.Control let:attrs>
				<Input autofocus type="text" {...attrs} bind:value={$formData.location} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- <Form.Errors errors={$errors._errors} /> -->
		<Form.Button disabled={hideButton || $delayed} variant="destructive" size="sm">
			Update?
			{#if $delayed}
				<LoaderCircle class="ml-4 h-6 w-6 animate-spin" />
			{/if}
		</Form.Button>
	</div>
</form>
