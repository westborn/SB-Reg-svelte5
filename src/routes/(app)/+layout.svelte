<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	let { children, data } = $props();
	const { session, user } = data;
	const loggedInEmail = user ? user.email : 'full@example.com';
	const avatar = loggedInEmail.slice(0, 2);
</script>

<section class="container flex flex-row items-center justify-between">
	<div>
		<a href="/" class="text-2xl font-bold leading-tight tracking-tighter text-primary md:text-3xl">
			SB Exhibit Registration
		</a>
	</div>
	<div class="flex items-center gap-2">
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
			</Tooltip.Content>
		</Tooltip.Root>
		<ThemeToggle></ThemeToggle>
	</div>
</section>
<section class="container">
	<main class="h-screen">
		{@render children()}
	</main>
</section>
