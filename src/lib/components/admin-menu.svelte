<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { page } from '$app/stores';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<div class="absolute left-2 top-3">🚀</div>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="ml-6 mt-4 w-56">
		<DropdownMenu.Label>Admin Menu<span class="block text-xs">({$page.data.user.proxyEmail})</span></DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item><a class="w-full" href="\admin">Admin</a></DropdownMenu.Item>
		</DropdownMenu.Group>

		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item><a class="w-full" href="\list">List all Entries</a></DropdownMenu.Item>
			<DropdownMenu.Item><a class="w-full" href="\view">View an Artist</a></DropdownMenu.Item>
			<DropdownMenu.Item><a class="w-full" href="\register">Register an Artist</a></DropdownMenu.Item>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>Accept Entries (coming soon)</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					<DropdownMenu.Item>Entry Accepted</DropdownMenu.Item>
					<DropdownMenu.Item>Location Selected</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>More...</DropdownMenu.Item>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Separator />
		<DropdownMenu.Item>Log out</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
