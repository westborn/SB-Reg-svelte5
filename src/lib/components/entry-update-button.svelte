<script lang="ts">
	import { getRegisterState } from '$lib/context.svelte.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	type Props = {
		currentEntryId: number;
	};

	let { currentEntryId }: Props = $props();
	let myState = getRegisterState();

	function handleOpenDialog() {
		myState.openEntryUpdateDialog(currentEntryId);
	}
</script>

<button class={buttonVariants({ variant: 'outline', size: 'sm' })} onclick={handleOpenDialog}>
	<span class="text-xs">Edit</span>
</button>
