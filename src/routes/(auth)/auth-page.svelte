<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';

	type Props = {
		children: Snippet;
		type: 'login' | 'register' | 'verify-email';
		session: Record<string, any>;
		user: Record<string, any>;
	};

	let { type, children, session, user }: Props = $props();
</script>

<!-- <p>(auth) auth-page.svelte</p>
<pre> {JSON.stringify(session, null, 2)}</pre> -->
<div class="container relative flex-col items-center justify-center h-full sm:grid lg:grid-cols-2">
	<div class="relative flex-col hidden h-full p-10 text-white bg-muted dark:border-r lg:flex">
		<div
			class="absolute inset-0 bg-cover"
			style="
				background-image:
					url(https://images.unsplash.com/photo-1534515538060-80212d73acb6?q=80&auto=format&fit=crop&w=1376&q=80);"
		/>
		<div class="relative z-20 flex items-center text-lg font-medium">
			<a href="/" class="underline-offset-4 hover:underline"> Sculpture Bermagui </a>
		</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<p class="text-lg">
					"This library has saved me countless hours of work and helped me deliver stunning designs
					to my clients faster than ever before. Highly recommended!"
				</p>
				<footer class="text-sm">Sofia Davis</footer>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="absolute right-4 top-4 md:right-8 md:top-8">
			<div class="flex items-center gap-2">
				{#if type === 'login'}
					<Button href="/register" variant="ghost">Register</Button>
					<Button href="/verify-email" variant="ghost">Verify Email</Button>
				{/if}
				{#if type === 'register'}
					<Button href="/login" variant="ghost">Login</Button>
					<Button href="/verify-email" variant="ghost">Verify Email</Button>
				{/if}
				{#if type === 'verify-email'}
					<Button href="/login" variant="ghost">Login</Button>
					<Button href="/register" variant="ghost">Register</Button>
				{/if}
				<ThemeToggle />
			</div>
		</div>
		<div class="flex flex-col w-full mx-auto">
			{@render children()}
		</div>
	</div>
</div>
