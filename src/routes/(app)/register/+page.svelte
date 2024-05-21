<script lang="ts">
	import { setRegisterState, getRegisterState } from '$lib/state.svelte.js';

	import { Button } from '$lib/components/ui/button';

	import ArtistCreateDialog from '$lib/components/artist-create-dialog.svelte';
	import SuperDebug from 'sveltekit-superforms';

	let { data } = $props();
	setRegisterState({ submission: data.submission, createArtistForm: data.createArtistForm });
	let state = getRegisterState();

	$effect(() => {
		state.registrationExists = data.submission ? true : false;
	});
</script>

<div class="container mx-auto mt-10 max-w-xl">
	<h1>Register</h1>
	{#if state.registrationExists}
		<p>Registration exists load up the first step</p>
	{:else}
		<Button variant="default" on:click={() => (state.createOpen = true)}>Create a New Registration</Button>
		<ArtistCreateDialog />
	{/if}
</div>
<SuperDebug data={state} />
<!-- <pre>{JSON.stringify(data.submission, null, 2)}</pre> -->
