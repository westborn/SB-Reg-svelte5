<script lang="ts">
	import { setRegisterState, getRegisterState } from '$lib/state.svelte.js';
	import SuperDebug from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';

	import { page } from '$app/stores';

	let { data } = $props();
	// setRegisterState({
	// 	submission: data.submission,
	// 	createArtistForm: data.createArtistForm,
	// 	updateArtistForm: data.updateArtistForm,
	// 	createEntryForm: data.createEntryForm
	// });
	// let myState = getRegisterState();
	// myState.artistExists = data.submission ? true : false;
	// myState.registrationExists = data.submission?.registrations?.length ?? 0 > 0 ? true : false;
	// myState.entriesExist = data.submission?.registrations?.[0]?.entries?.length ?? 0 > 0 ? true : false;
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<h1>Register Page</h1>
	<p>
		{data.user.email}<br />
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

<!-- <SuperDebug data={data.session} /> -->
<SuperDebug data={$page} />
