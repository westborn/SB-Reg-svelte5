<script lang="ts">
	import Header from '$lib/components/header.svelte';
	let { children, data } = $props();
	const { user } = data;

	const navItems = [
		// { label: 'View Registration and a very long senetence that nwont let anything', href: '/view' },
		{ label: 'View Registration', href: '/view' },
		{ label: 'Update Registration', href: '/register' }
	];
</script>

<Header {navItems} {user} />
<!-- <section class="flex flex-row items-center justify-between sm:container">
	<div>

		<a href="/" class="text-2xl font-bold leading-tight tracking-tighter text-primary md:text-3xl">
			SB Exhibit Registration
		</a>
	</div>
</section> -->
<section class="sm:container">
	<main class="h-auto">
		{@render children()}
	</main>
</section>
