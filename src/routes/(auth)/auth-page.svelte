<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';

	type Props = {
		children: Snippet;
		type: 'login' | 'signup' | 'verify-email';
		session: Record<string, any>;
		user: Record<string, any>;
	};

	let { type, children, session, user }: Props = $props();
</script>

<div class="container max-w-xl mx-auto">
	<div class="absolute right-2 top-2">
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
			<ThemeToggle />
		</div>
	</div>
	<div class="w-full max-w-xl mx-auto mt-20">
		{console.log('(auth)auth-page.svelte', 'Rendering')}
		<br />
		child goes here (auth)auth-page.svelte
		{@render children()}
	</div>
	<p class="py-4 text-sm text-muted-foreground">
		By clicking continue, you agree to our{' '}
		<a href="/terms" class="underline underline-offset-4 hover:text-primary"> Terms of Service</a>
		{' '}and{' '}
		<a href="/privacy" class="underline underline-offset-4 hover:text-primary">Privacy Policy.</a>
	</p>
</div>

<!-- <p>(auth) auth-page.svelte</p>
<pre> {JSON.stringify(session, null, 2)}</pre> -->
