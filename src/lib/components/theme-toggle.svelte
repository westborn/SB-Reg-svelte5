<script lang="ts">
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/Moon';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
</script>

<Button on:click={toggleMode} variant="ghost">
	<Sun class="scale-100 dark:scale-0" />
	<Moon class="absolute scale-0 dark:scale-100" />
	<span class="sr-only">Toggle theme</span>
</Button>
