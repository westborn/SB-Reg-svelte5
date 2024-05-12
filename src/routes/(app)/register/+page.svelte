<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import { artistPublicSchema } from '$lib/zod-schemas';
	import { browser } from '$app/environment';

	// TODO add an interface type for $props to avoid an error
	let { data } = $props();
	let dialogOpen = $state(false);
	const form = superForm(data.form, {
		validators: zodClient(artistPublicSchema),
		resetForm: false,
		onUpdated: () => {
			if ($message === 'Success') {
				toast.success('Profile Updated');
				dialogOpen = false;
				$message = null;
			} else {
				toast.error('Profile Update Failed');
			}
		}
	});
	const { form: formData, enhance, errors, message, delayed } = form;
</script>

<div class="container mx-auto mt-10 max-w-xl">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-xl">Registration Management</Card.Title>
		</Card.Header>
		<Card.Content>
			<p class="text-sm text-muted-foreground">Some information we use to contact you:</p>
			{#if data.artistCollection}
				<div class="mb-3 grid grid-cols-[20ch_1fr] items-center p-4">
					<p class="text-sm">First Name:</p>
					<p>{data.artistCollection.firstName}</p>
					<p class="text-sm">Last Name:</p>
					<p>{data.artistCollection.lastName}</p>
					<p class="text-sm">Phone:</p>
					<p>{data.artistCollection.phone}</p>
					<p class="text-sm">Postcode:</p>
					<p>{data.artistCollection.postcode}</p>
					<p class="text-sm">First Nations:</p>
					<p>{data.artistCollection.firstNations}</p>
					<p class="text-sm">Bank Account Name:</p>
					<p>{data.artistCollection.bankAccountName}</p>
					<p class="text-sm">BSB:</p>
					<p>{data.artistCollection.bankBSB}</p>
					<p class="text-sm">Account:</p>
					<p>{data.artistCollection.bankAccount}</p>
				</div>

				<Dialog.Root bind:open={dialogOpen}>
					<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Change Personal Details</Dialog.Trigger>
					<Dialog.Content class="bg-card sm:max-w-[425px]">
						<Dialog.Header>
							<Dialog.Title>Edit Registration</Dialog.Title>
							<Dialog.Description>Make changes to your profile here. Click save when you're done.</Dialog.Description>
						</Dialog.Header>

						<form
							method="POST"
							action="?/updateArtist&id={data.artistCollection.id}"
							use:enhance
							class="w-full space-y-4"
						>
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
								<RadioGroup.Root class="flex flex-row" bind:value={$formData.firstNations}>
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

							<p class="pt-4 text-sm text-muted-foreground">(You can add this bank stuff later if you like...)</p>

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
									<Form.Button>Update?</Form.Button>
									<span class="text-sm text-muted-foreground"> Just a little note</span>
								</div>
							{:else}
								<div class="font-semibold text-red-700">{$message}</div>
								<Button disabled>
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
									We can't do anything now...
								</Button>
							{/if}
							{#if browser}
								<SuperDebug data={$formData} />
							{/if}
						</form>
					</Dialog.Content>
				</Dialog.Root>
			{:else}
				we don't have a registration yet
			{/if}
		</Card.Content>
	</Card.Root>
</div>
