<script lang="ts">
	import Header from '$lib/components/header.svelte';
	let { children, data } = $props();
	const { user } = data;

	const navItems = [
		{ label: 'View', href: '/view' },
		{ label: 'Register', href: '/register' },
		{ label: 'Gallery', href: '/gallery' }
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
