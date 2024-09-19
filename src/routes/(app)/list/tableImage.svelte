<script lang="ts">
	type Props = {
		path: string;
	};

	import OptimisedImage from '$lib/components/optimised-image.svelte';
	let { path }: Props = $props();
</script>

<!-- all cell contents need to be wrapped in <span> tags -->
<span>
	<OptimisedImage {path} alt="alt" width={40} height={40} class="h-20 w-20 overflow-hidden rounded object-contain" />
</span>
