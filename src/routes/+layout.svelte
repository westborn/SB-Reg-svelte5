<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import TopNav from '../lib/components/top-nav.svelte';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />
<div
	class="container mx-auto h-full w-auto max-w-3xl flex-col items-center justify-center px-4 py-1"
>
	<TopNav />
	{@render children()}
</div>
