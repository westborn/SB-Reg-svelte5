<script lang="ts">
	let { children } = $props();
</script>

<main class="h-screen">
	<!-- <p>(auth) +layout.svelte</p> -->
	{@render children()}
</main>
