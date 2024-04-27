<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import RegisterUpdateForm from '$lib/components/Register-Update-Form.svelte';

	let { data } = $props();
</script>

<div class="container max-w-xl mx-auto">
	<Card.Root>
		<Card.Header>
			<Card.Title>Registration Management</Card.Title>
		</Card.Header>
		<Card.Content>
			<h1 class="text-2xl font-semibold tracking-tight text-center">Basic Registration Information</h1>
			<p class="pt-6 text-sm text-muted-foreground">We'd like this information so we can contact you</p>
			<!-- <RegisterUpdateForm {data} /> -->
		</Card.Content>
	</Card.Root>
	{console.log('+(app)register/page.svelte', 'Rendering')}
	<br />
	+(app)register Rendering inside Card'
</div>

<!-- <pre>
	{`Artist: id: ${data.artistCollection.id}	email: ${data.artistCollection.email}	Registration Id: ${data.artistCollection.registrations[0].id}`}
{JSON.stringify(data.artistCollection, null, 2)}
{JSON.stringify(data.form, null, 2)}
</pre>

<pre> {Object.keys(data)}</pre> -->
