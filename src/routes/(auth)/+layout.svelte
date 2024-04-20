<script lang="ts">
	console.log('(auth) +layout.svelte', 'Commencing');
	let { children } = $props();
</script>

<main class="h-screen">
	<!-- <p>(auth) +layout.svelte</p> -->
	{@render children()}
</main>
