<script lang="ts">
	import { page } from '$app/stores';
	import { getRegisterState, updateSubmission } from '$lib/context.svelte';
	import { onMount } from 'svelte';
	import Level1 from './level1.svelte';

	let { data } = $props();
	let submission = data.submission;

	onMount(() => {
		myState = updateSubmission(submission);
	});

	let myState = $state(getRegisterState());
	let firstName = $state('');
</script>

<section class="mx-auto mt-10 max-w-prose px-3">
	<div class="mt-6 border-spacing-2 border p-4">
		<p>Submission: {submission?.email}</p>
		<p>Page: {$page.data.submission.email}</p>
		<p>MyState: {myState?.submission?.email}</p>

		<input
			class="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
			type="text"
			name="firstName"
			id="2wH3Y"
			bind:value={firstName}
			aria-required="true"
			data-fs-control=""
		/>
		<p>{firstName}</p>
	</div>
	<Level1 bind:firstName />
</section>
