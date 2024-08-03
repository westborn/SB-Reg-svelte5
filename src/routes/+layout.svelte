<script lang="ts">
	import '../app.pcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	import { setRegisterState } from '$lib/context.svelte.js';

	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children, data } = $props();
	let { supabase, session, user } = data;

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => data.subscription.unsubscribe();
	});

	setRegisterState();
</script>

<svelte:head>
	<title>Registration</title>
</svelte:head>

<ModeWatcher />
<Toaster
	position="top-left"
	duration={4000}
	offset={60}
	toastOptions={{
		unstyled: true,
		classes: {
			error: 'bg-red-400',
			success: 'text-green-600',
			warning: 'text-yellow-400',
			info: 'bg-blue-400'
		}
	}}
/>{@render children()}
