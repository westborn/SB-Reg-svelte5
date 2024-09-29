<script lang="ts">
	type Props = {
		path: string;
	};

	import OptimisedImage from '$lib/components/optimised-image.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	let { path }: Props = $props();

	let showLargeImage = $state(false);
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
	<Dialog.Root bind:open={showLargeImage}>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Content class="overflow-auto sm:max-h-[1000px] sm:max-w-[460px]">
			<OptimisedImage {path} alt="alt" width={460} height={0} class="rounded" />
		</Dialog.Content>
	</Dialog.Root>
{/if}
