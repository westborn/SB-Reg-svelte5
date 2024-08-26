<script lang="ts">
	import '../app.pcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';

	import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';

	import { setRegisterState } from '$lib/context.svelte.js';

	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children, data } = $props();
	let { supabase, session, user } = data;
	let { artistForm, entryForm, entryDeleteForm, confirmForm, imageUploadForm } = data.universal;

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// const src =
		// 	PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
		// 		? 'https://sandbox.web.squarecdn.com/v1/square.js'
		// 		: 'https://web.squarecdn.com/v1/square.js';
		// console.log(`env dev:${dev} meta.env.MODE:${import.meta.env.MODE}`);
		// const scriptEl = document.createElement('script');
		// scriptEl.async = false;
		// scriptEl.type = 'text/javascript';
		// scriptEl.src = src;
		// document.head.appendChild(scriptEl);

		return () => data.subscription.unsubscribe();
	});

	setRegisterState({
		artistForm,
		entryForm,
		entryDeleteForm,
		confirmForm,
		imageUploadForm
	});
</script>

<svelte:head>
	<title>Registration</title>
	<script
		src={PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
			? 'https://sandbox.web.squarecdn.com/v1/square.js'
			: 'https://web.squarecdn.com/v1/square.js'}
	></script>
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
