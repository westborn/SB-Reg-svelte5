<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import AlignJustify from 'lucide-svelte/icons/align-justify';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { AdminMenu } from '$lib/components';

	let data = $props();
	const { navItems, user } = data;
	const loggedInEmail = user?.email ?? 'Guest';
	const avatar = loggedInEmail.slice(0, 2);

	let sheetOpen = $state(false);
</script>

<header class="w-full border-b">
	{#if user.isAdmin}
		<AdminMenu />
	{/if}

	<nav class="container grid h-14 grid-cols-[1fr_120px] items-center">
		<!-- Desktop -->
		<div class="hidden h-14 grid-cols-[200px_2fr] items-center md:grid">
			<div class="flex">
				<img src="/favicon-32x32.png" alt="Sculpture Bermagui Logo" class="mt-2 h-10" />
				<h1 class="text-center text-lg text-primary-400">Exhibition Registration</h1>
			</div>
			<div class="grid grid-cols-3">
				{#each navItems as { label, href }, i}
					{#if page.url.pathname.startsWith(href)}
						<Button class="bg-transparent font-semibold text-primary-300" disabled><p>{label}</p></Button>
					{:else}
						<Button class="font-semibold text-primary-300" {href} variant="ghost"><p>{label}</p></Button>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Mobile -->
		<div class="grid h-14 grid-cols-[120px_1fr] items-center md:hidden">
			<div>
				<Sheet.Root bind:open={sheetOpen}>
					<Sheet.Trigger class={buttonVariants({ variant: 'ghost' })}
						><AlignJustify class="text-primary-300" /></Sheet.Trigger
					>
					<Sheet.Content side="left" class="w-1/2">
						<h1 class="mt-4 text-center text-sm text-primary-400 md:hidden">
							Sculpture Bermagui Exhibition Registration
						</h1>
						<div class="mt-10 flex flex-col items-start justify-between text-primary-300">
							{#each navItems as { label, href }, i}
								{#if page.url.pathname.startsWith(href)}
									<Sheet.Trigger>
										<Button class="bg-transparent font-semibold text-primary-300 " disabled>{label}</Button>
									</Sheet.Trigger>
								{:else}
									<Sheet.Trigger>
										<Button
											class="font-semibold text-primary-300"
											{href}
											variant="ghost"
											onclick={() => {
												sheetOpen = false;
											}}>{label}</Button
										>
									</Sheet.Trigger>
								{/if}
							{/each}
						</div>
					</Sheet.Content>
				</Sheet.Root>
			</div>
			<div class="flex items-center">
				<img src="/favicon-32x32.png" alt="Sculpture Bermagui Logo" class="mt-2 h-10" />
			</div>
		</div>

		<div class="flex items-center">
			<Button href={'/logout'} variant="ghost">Logout</Button>
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Avatar.Root>
							<Avatar.Fallback class="uppercase">
								{avatar}
							</Avatar.Fallback>
						</Avatar.Root>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>{loggedInEmail}</p>
						{#if user.isSuperAdmin && page.data.user.proxyEmail}
							<p><span class="text-xs text-primary">as: {page.data.user.proxyEmail}</span></p>
						{/if}
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	</nav>
</header>
