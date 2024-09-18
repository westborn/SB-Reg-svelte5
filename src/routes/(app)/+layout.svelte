<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { AdminMenu, ThemeToggle } from '$lib/components';
	import { page } from '$app/stores';
	let { children, data } = $props();
	const { user } = data;
	const loggedInEmail = user ? user.email : 'full@example.com';
	const avatar = loggedInEmail.slice(0, 2);
</script>

<section class="flex flex-row items-center justify-between sm:container">
	<div>
		{#if user.isAdmin}
			<AdminMenu />
		{/if}
		<a href="/" class="text-2xl font-bold leading-tight tracking-tighter text-primary md:text-3xl">
			SB Exhibit Registration
		</a>
	</div>
	<div class="flex items-center gap-2">
		<!-- {#if $page.route.id === '/(app)/view'}
			<Button class="font-semibold text-primary-300" href={'/register'} variant="ghost">Register</Button>
		{:else}
			<Button class="font-semibold text-primary-300" href={'/view'} variant="ghost">View</Button>
		{/if} -->
		{#if $page.url.pathname === '/view'}
			<Button class="bg-transparent font-semibold text-primary-300 " disabled>View</Button>
		{:else}
			<Button class="font-semibold text-primary-300" href={'/view'} variant="ghost">View</Button>
		{/if}
		{#if $page.url.pathname === '/register'}
			<Button class="bg-transparent font-semibold text-primary-300 " disabled>Register</Button>
		{:else}
			<Button class="font-semibold text-primary-300" href={'/register'} variant="ghost">Register</Button>
		{/if}
		{#if $page.url.pathname === '/gallery'}
			<Button class="bg-transparent font-semibold text-primary-300 " disabled>Gallery</Button>
		{:else}
			<Button class="font-semibold text-primary-300" href={'/gallery'} variant="ghost">Gallery</Button>
		{/if}
		<Tooltip.Root openDelay={0}>
			<Tooltip.Trigger>
				<Avatar.Root>
					<Avatar.Fallback class="uppercase">
						{avatar}
					</Avatar.Fallback>
				</Avatar.Root>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{loggedInEmail}</p>
				{#if user.isAdmin && $page.data.user.proxyEmail}
					<p><span class="text-xs text-primary">as: {$page.data.user.proxyEmail}</span></p>
				{/if}
			</Tooltip.Content>
		</Tooltip.Root>
		<Button href={'/logout'} variant="ghost">Logout</Button>
		<ThemeToggle></ThemeToggle>
	</div>
</section>
<section class="sm:container">
	<main class="h-auto">
		{@render children()}
	</main>
</section>
