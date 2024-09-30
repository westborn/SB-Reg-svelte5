<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { AlignJustify } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { AdminMenu, ThemeToggle } from '$lib/components';

	let data = $props();
	const { navItems, user } = data;
	const loggedInEmail = user ? user.email : 'full@example.com';
	const avatar = loggedInEmail.slice(0, 2);
</script>

<header class="sticky top-0 w-full border-b">
	<div class="container flex h-12 items-center justify-between">
		<!-- Desktop -->
		<nav class="hidden w-full justify-between md:flex">
			<div>
				{#each navItems as { label, href }, i}
					{#if $page.url.pathname.startsWith(href)}
						<Button class="bg-transparent font-semibold text-primary-300 " disabled>{label}</Button>
					{:else}
						<Button class="font-semibold text-primary-300" {href} variant="ghost">{label}</Button>
					{/if}
				{/each}
			</div>
		</nav>
		<!-- Mobile -->
		<div class="md:hidden">
			<Sheet.Root>
				<Sheet.Trigger class={buttonVariants({ variant: 'ghost' })}
					><AlignJustify class="text-primary-300" /></Sheet.Trigger
				>
				<Sheet.Content side="left" class="w-1/4">
					<nav class="flex flex-col items-start justify-between text-primary-300">
						{#each navItems as { label, href }, i}
							{#if $page.url.pathname.startsWith(href)}
								<Button class="bg-transparent font-semibold text-primary-300 " disabled>{label}</Button>
							{:else}
								<Button class="font-semibold text-primary-300" {href} variant="ghost">{label}</Button>
							{/if}
						{/each}
					</nav>
				</Sheet.Content>
			</Sheet.Root>
		</div>
		<!-- Desktop & mobile -->
		{#if user.isAdmin}
			<AdminMenu />
		{/if}
		<div class="flex">
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
			<!-- TODO - do we need a theme toggle? -->
			<!-- <ThemeToggle></ThemeToggle> -->
		</div>
	</div>
</header>
