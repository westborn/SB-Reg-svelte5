<script lang="ts">
	console.log('(auth) +layout.svelte', 'Commencing');
	let { children } = $props();
	// console.log(children());
</script>

<main class="h-screen">
	{console.log('(auth)+layout.svelte', 'Rendering')}
	<br />
	(auth)+layout.svelte - Rendering
	{@render children()}
</main>
