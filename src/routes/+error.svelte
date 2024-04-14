<script>
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="hero not-prose min-h-screen">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="mb-5 text-5xl font-bold opacity-50 lg:text-7xl xl:text-9xl">Error</h1>
			<p class="mb-5">{`Code: ${$page?.status} - ${$page?.error?.message}`}</p>
			<Button variant="destructive" href="/">Go back</Button>
		</div>
	</div>
</div>
