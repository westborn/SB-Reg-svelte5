<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	console.log('(app) +page.svelte', 'Commencing');

	let { data } = $props();
	const { session, user } = data;
</script>

<section class="container flex flex-row items-center justify-between">
	<div>
		<a href="/" class="text-2xl font-bold leading-tight tracking-tighter text-primary md:text-3xl">
			SB Exhibit Registration
		</a>
	</div>
	<div class="flex items-center gap-2">
		<!-- <p>{user.email}</p> -->
		<Button href={'/logout'} variant="ghost">Logout</Button>
		<Tooltip.Root openDelay={0}>
			<Tooltip.Trigger>
				<Avatar.Root>
					<Avatar.Fallback class="uppercase">
						{user.email.slice(0, 2)}
					</Avatar.Fallback>
				</Avatar.Root>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{user.email}</p>
			</Tooltip.Content>
		</Tooltip.Root>
		<ThemeToggle></ThemeToggle>
	</div>
</section>
<section class="container">
	<p class="text-2xl">This is (app) PAGE</p>
	<p>(app) +page.svelte</p>
</section>
<!-- <pre> Session  - {JSON.stringify(session, null, 2)}</pre> -->
<!-- <pre> User - {JSON.stringify(user, null, 2)}</pre> -->
