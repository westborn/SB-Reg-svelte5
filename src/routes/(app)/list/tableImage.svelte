<script lang="ts">
	type Props = {
		path: string;
	};

	import OptimisedImage from '$lib/components/optimised-image.svelte';
	let { path }: Props = $props();

	let showLargeImage = $state(false);

	const handleClick = () => {
		console.log('clicked on ', path);
		showLargeImage = true;
	};
</script>

<!-- all cell contents need to be wrapped in <span> tags -->
<span>
	<button onclick={() => (showLargeImage = true)}>
		<OptimisedImage
			{path}
			alt="alt"
			width={40}
			height={40}
			class="h-20 w-20 overflow-hidden rounded object-contain"
		/></button
	>
</span>

{#if showLargeImage}
	<button onclick={() => (showLargeImage = false)}>
		<OptimisedImage
			{path}
			alt="alt"
			width={0}
			height={0}
			class="absolute left-0 top-0 h-3/5 w-3/5 rounded object-contain"
		/></button
	>
{/if}
