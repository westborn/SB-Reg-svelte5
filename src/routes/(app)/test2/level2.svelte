<script lang="ts">
	import { page } from '$app/stores';
	import { getRegisterState } from '$lib/context.svelte';
	import SuperDebug from 'sveltekit-superforms';

	let myState = getRegisterState();
	let { firstName = $bindable() } = $props();
</script>

<section class="mt-6 border-spacing-2 border p-4">
	<p class="mt-4">LEVEL2</p>

	<div>
		<p>Page: {$page.data.submission.email}</p>
		<p>MyState: {myState?.submission?.email}</p>
	</div>
	<div>
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
</section>
