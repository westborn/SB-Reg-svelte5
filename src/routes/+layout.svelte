<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import TopNav from '$lib/components/top-nav.svelte';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />
<TopNav />
{@render children()}
