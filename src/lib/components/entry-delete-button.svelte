<script lang="ts">
	import { getRegisterState } from '$lib/context.svelte.js';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		currentEntryId: number;
	}

	let { currentEntryId }: Props = $props();
	let myState = getRegisterState();

	function handleOpenDialog() {
		myState.openEntryDeleteDialog(currentEntryId);
	}
</script>

<Button variant="destructive" onclick={handleOpenDialog}>Delete</Button>
