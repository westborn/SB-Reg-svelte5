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

<header class="w-full border-b">
	{#if user.isAdmin}
		<AdminMenu />
	{/if}

	<div class="container grid h-14 grid-cols-[200px_2fr_120px] items-center">
		<h1 class="hidden text-center text-lg text-primary-400 md:block">Sculpture Bermagui Exhibition Registration</h1>
		<!-- Desktop -->
		<nav class="hidden md:block">
			<div class="grid grid-cols-3">
				{#each navItems as { label, href }, i}
					{#if $page.url.pathname.startsWith(href)}
						<Button class="bg-transparent font-semibold text-primary-300" disabled><p>{label}</p></Button>
					{:else}
						<Button class="font-semibold text-primary-300" {href} variant="ghost"><p>{label}</p></Button>
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
				<Sheet.Content side="left" class="w-1/3">
					<h1 class="mt-4 text-center text-sm text-primary-400 md:hidden">
						Sculpture Bermagui Exhibition Registration
					</h1>
					<nav class="mt-10 flex flex-col items-start justify-between text-primary-300">
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
		<div class="md:hidden"></div>
		<!-- Desktop & mobile -->
		<div class="flex items-center">
			<Button href={'/logout'} variant="ghost">Logout</Button>
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
			<!-- TODO - do we need a theme toggle? -->
			<!-- <ThemeToggle></ThemeToggle> -->
		</div>
	</div>
</header>
