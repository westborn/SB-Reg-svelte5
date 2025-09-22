<script lang="ts">
	import { getRegisterState } from '$lib/context.svelte.js';
	import { Button } from '$lib/components/ui/button';

	type Props = {
		currentEntryId: number;
	};

	let { currentEntryId }: Props = $props();
	let myState = getRegisterState();

	function handleOpenDialog() {
		myState.openEntryDeleteDialog(currentEntryId);
	}
</script>

<Button variant="destructive" size="sm" class="hover:scale-110" onclick={handleOpenDialog}>
	<span class="text-xs">Delete</span>
</Button>
