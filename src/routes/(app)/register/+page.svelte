<script lang="ts">
	import { updateSubmission } from '$lib/state.svelte.js';
	import SuperDebug from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	let { submission, createArtistForm, updateArtistForm, createEntryForm } = data;
	//Set initial State with the submisison for the email we have been given
	const myState = updateSubmission({
		currentUserEmail: data.user.email,
		submission,
		createArtistForm,
		updateArtistForm,
		createEntryForm
	});
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<h1>Register Page</h1>
	<p>
		{myState.currentUserEmail}<br />
	</p>
	<Button href="/register/artist">Do ARTIST</Button>
</div>

<!-- <SuperDebug data={myState} /> -->
<!-- <pre>{JSON.stringify(data.submission, null, 2)}</pre> -->

<li>Get logged on email addr</li>
<li>If email has SB -then ask who to work on</li>
<li>Use email to get artist<br /></li>
<li>If none - create artist<br /></li>
<li></li>

<!-- <SuperDebug data={myState.submission} /> -->
<SuperDebug data={myState.submission} />
