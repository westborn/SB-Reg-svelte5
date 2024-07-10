<script lang="ts">
	let { data } = $props();
	import { getRegisterState } from '$lib/context.svelte.js';

	const myState = getRegisterState();
</script>

{#if myState.submission}
	<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
		<h1>Entry Page</h1>
		<h2>User: {data.user.email}</h2>
	</div>
{/if}
