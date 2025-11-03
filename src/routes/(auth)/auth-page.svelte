<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';
	import { ThemeToggle } from '$lib/components';

	type Props = {
		children: Snippet;
		type: 'login' | 'signup' | 'verify-email';
		session: Record<string, any>;
		user: Record<string, any>;
	};

	let { type, children, session, user }: Props = $props();
</script>

<div class="container mx-auto grid h-14 max-w-2xl grid-cols-[1fr_250px] items-center">
	<!-- <div class="mx-auto max-w-xl sm:container"> -->
	<div class="flex items-center">
		<img src="/favicon-32x32.png" alt="Sculpture Bermagui Logo" class="mt-2 h-10" />
		<h1 class=" px-2 text-center text-lg text-primary-400">Exhibition Registration</h1>
	</div>
	<div class="">
		<div class="flex items-center gap-2">
			{#if type === 'login'}
				<Button href="/signup" variant="ghost">Register</Button>
				<Button href="/verify-email" variant="ghost">Verify Email</Button>
			{/if}
			{#if type === 'signup'}
				<Button href="/login" variant="ghost">Login</Button>
				<Button href="/verify-email" variant="ghost">Verify Email</Button>
			{/if}
			{#if type === 'verify-email'}
				<Button href="/login" variant="ghost">Login</Button>
				<Button href="/signup" variant="ghost">Register</Button>
			{/if}
			<!-- <ThemeToggle /> -->
		</div>
	</div>
</div>
<div class="mx-auto mt-20 w-full max-w-sm">
	{@render children()}
	<p class="p-4 text-sm text-muted-foreground">
		By clicking continue, you agree to our{' '}
		<a
			href="https://sculpturebermagui.org.au/wp-content/uploads/2025/09/Exhibiting-at-Sculpture-Bermagui-2026.pdf"
			class="underline underline-offset-4 hover:text-primary"
		>
			Terms of Service</a
		>
		{' '}and{' '}
		<a
			href="https://sculpturebermagui.org.au/wp-content/uploads/2024/02/Edgy-Art-Privacy-Policy-Sep-2022.pdf"
			class="underline underline-offset-4 hover:text-primary">Privacy Policy.</a
		>
	</p>
</div>
