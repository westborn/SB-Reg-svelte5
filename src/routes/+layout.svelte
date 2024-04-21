<script lang="ts">
	import '../app.pcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children, data } = $props();
	let { supabase, session } = data;
	console.log('+layout.svelte', 'Commencing');

	onMount(() => {
		console.log('+layout.svelte', 'On Mount');
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>Registration</title>
</svelte:head>

<ModeWatcher />
<Toaster />
{@render children()}
