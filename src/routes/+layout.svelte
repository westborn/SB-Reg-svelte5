<script lang="ts">
	import '../app.pcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';
	import { setRegisterState } from '$lib/context.svelte.js';

	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { EXHIBITION_YEAR, REGISTRATIONS_OPEN } from '$lib/constants.js';
	import { TailwindIndicator, EntryUpdateDialog, EntryDeleteDialog } from '$lib/components';

	let { children, data } = $props();
	let { artistForm, entryForm, entryDeleteForm, confirmForm, imageUploadForm, supabase, session, user } = data;

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		console.info(`
Environment:        dev:${dev} meta.env.MODE:${import.meta.env.MODE}
Running in          "${PUBLIC_SQUARE_ENVIRONMENT}" mode
Registrations are   ${REGISTRATIONS_OPEN ? 'OPEN' : 'CLOSED'}
Current Year is     ${EXHIBITION_YEAR}
NAME:               ${__NAME__}
VERSION:            ${__VERSION__}
GITHUBURL           ${__GITHUBURL__}
SVELTEVERSION:      ${__SVELTEVERSION__}
SVELTEKITVERSION:   ${__SVELTEKITVERSION__}
VITEVERSION:        ${__VITEVERSION__}
TAILWINDCSSVERSION: ${__TAILWINDCSSVERSION__}`);
		return () => data.subscription.unsubscribe();
	});

	//load all the Superform forms into context
	setRegisterState({
		artistForm,
		entryForm,
		entryDeleteForm,
		confirmForm,
		imageUploadForm
	});
</script>

<!-- add the appropriate square.js script to the head of the document -->
<svelte:head>
	<title>Registration</title>
	<script
		src={PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
			? 'https://sandbox.web.squarecdn.com/v1/square.js'
			: 'https://web.squarecdn.com/v1/square.js'}
		type="text/javascript"
		async
	></script>
</svelte:head>

<!-- <ModeWatcher /> -->
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
/>
{@render children()}
<!-- Global Entry Update Dialog - Single instance to prevent duplicate form IDs -->
<EntryUpdateDialog />
<EntryDeleteDialog />
{#if dev}
	<TailwindIndicator />
{/if}
