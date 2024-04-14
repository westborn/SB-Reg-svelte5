<script>
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
</script>

<div class="flex-1">
	<section class="flex flex-row items-center justify-between">
		<div>
			<a
				href="/"
				class="text-2xl font-bold leading-tight tracking-tighter text-primary md:text-3xl"
			>
				SB Register
			</a>
		</div>
		<div class="flex gap-2">
			<Button href={'/login'} variant="ghost">Sign in</Button>
			<Button href={'/register'} variant="ghost">Sign up</Button>
			<ThemeToggle></ThemeToggle>
		</div>
	</section>
</div>
