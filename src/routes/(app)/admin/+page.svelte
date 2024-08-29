<!-- +page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';

	let form: HTMLFormElement;
	let { data } = $props();
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<form method="post" use:enhance>
		<label>User to masquerade as <input class="block w-full" type="email" name="proxyEmail" /></label>
		{#if form?.error}<p>{form.error}</p>{/if}
		<Button type="submit">Set this user?</Button>
	</form>
</div>
<pre>Current User: {data.user.email}</pre>
<pre>Admin Status: {data.user.isAdmin}</pre>
{#if data.user.isAdmin}
	<pre>Proxy Email: {data.user.proxyEmail}</pre>
{/if}
<!-- <pre>User: {JSON.stringify(data.user, null, 4)}</pre> -->
<pre>User: {JSON.stringify($page.data.user.proxyEmail, null, 4)}</pre>
