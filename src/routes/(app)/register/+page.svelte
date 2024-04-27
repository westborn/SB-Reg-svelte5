<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import RegisterUpdateForm from '$lib/components/Register-Update-Form.svelte';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-xl">
	<Card.Root>
		<Card.Header>
			<Card.Title>Registration Management</Card.Title>
		</Card.Header>
		<Card.Content>
			<h1 class="text-center text-2xl font-semibold tracking-tight">Basic Registration Information</h1>
			<p class="pt-6 text-sm text-muted-foreground">We'd like this information so we can contact you</p>
			<RegisterUpdateForm {data} />
		</Card.Content>
	</Card.Root>
</div>
