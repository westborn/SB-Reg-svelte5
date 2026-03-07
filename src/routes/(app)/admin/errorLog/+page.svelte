<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let selectedLog = $state<any>(null);

	function getLogLevelColor(level: string): string {
		switch (level) {
			case 'ERROR':
				return 'bg-red-500 hover:bg-red-600';
			case 'WARN':
				return 'bg-yellow-500 hover:bg-yellow-600';
			case 'INFO':
				return 'bg-blue-500 hover:bg-blue-600';
			case 'DEBUG':
				return 'bg-gray-500 hover:bg-gray-600';
			default:
				return 'bg-gray-500 hover:bg-gray-600';
		}
	}

	function formatDate(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleString('en-AU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function parseContext(context: any): Record<string, any> | null {
		if (!context) return null;
		try {
			if (typeof context === 'string') {
				return JSON.parse(context);
			}
			return context as Record<string, any>;
		} catch {
			return null;
		}
	}

	function parseError(errorStr: string | null): { name?: string; message?: string; stack?: string } | null {
		if (!errorStr) return null;
		try {
			return JSON.parse(errorStr);
		} catch {
			return null;
		}
	}

	function getUserEmail(context: any): string | null {
		const contextData = parseContext(context);
		return contextData?.userEmail || null;
	}
</script>

<div class="container mx-auto py-8">
	<h1 class="mb-6 text-3xl font-bold">System Error Log</h1>

	<!-- Summary Statistics -->
	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Total Errors</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-red-600">{data.countsByLevel.ERROR}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Warnings</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-yellow-600">{data.countsByLevel.WARN}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Info</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-blue-600">{data.countsByLevel.INFO}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Debug</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-gray-600">{data.countsByLevel.DEBUG}</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Log Entries Table -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Table Column (left side) -->
		<div class="lg:col-span-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Recent Log Entries (Last 100)</Card.Title>
					<Card.Description>Click any row to view full details</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if data.error}
						<div class="rounded-md bg-red-50 p-4 text-red-800">
							<p class="font-semibold">Error loading logs:</p>
							<p>{data.error}</p>
						</div>
					{:else if data.logs.length === 0}
						<div class="rounded-md bg-gray-50 p-4 text-gray-600">No log entries found.</div>
					{:else}
						<div class="overflow-x-auto">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head class="w-[90px]">Level</Table.Head>
										<Table.Head class="w-[160px]">Timestamp</Table.Head>
										<Table.Head>Message</Table.Head>
										<Table.Head class="w-[180px]">Artist Email</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each data.logs as log}
										<Table.Row class="cursor-pointer hover:bg-gray-50" onclick={() => (selectedLog = log)}>
											<Table.Cell>
												<Badge class={getLogLevelColor(log.level)}>{log.level}</Badge>
											</Table.Cell>
											<Table.Cell class="text-sm whitespace-nowrap">{formatDate(log.createdAt)}</Table.Cell>
											<Table.Cell class="max-w-md">
												<div class="line-clamp-2">{log.message}</div>
											</Table.Cell>
											<Table.Cell class="text-sm">
												{@const email = getUserEmail(log.context)}
												{#if email}
													<div class="truncate font-medium text-gray-900">{email}</div>
												{:else if log.userId}
													<div class="text-gray-600">{log.userId.substring(0, 8)}...</div>
												{:else}
													<span class="text-gray-400">-</span>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Details Panel (right side) -->
		<div class="lg:col-span-1">
			<div class="sticky top-8">
				{#if selectedLog}
					{@const contextData = parseContext(selectedLog.context)}
					{@const errorData = parseError(selectedLog.error)}
					{@const email = getUserEmail(selectedLog.context)}

					<Card.Root>
						<Card.Header>
							<div class="flex items-start justify-between">
								<div>
									<Card.Title class="text-lg">Log Details</Card.Title>
									<Card.Description class="mt-1">{formatDate(selectedLog.createdAt)}</Card.Description>
								</div>
								<Button variant="ghost" size="sm" onclick={() => (selectedLog = null)}>✕</Button>
							</div>
						</Card.Header>
						<Card.Content class="space-y-4">
							<!-- Level -->
							<div>
								<div class="text-sm font-medium text-gray-500">Level</div>
								<Badge class={getLogLevelColor(selectedLog.level)}>{selectedLog.level}</Badge>
							</div>

							<!-- Message -->
							<div>
								<div class="text-sm font-medium text-gray-500">Message</div>
								<div class="mt-1 text-sm">{selectedLog.message}</div>
							</div>

							<!-- User -->
							<div>
								<div class="text-sm font-medium text-gray-500">User</div>
								<div class="mt-1 space-y-1 text-sm">
									{#if email}
										<div class="font-medium">{email}</div>
									{/if}
									{#if selectedLog.userId}
										<div class="font-mono text-xs text-gray-600">{selectedLog.userId}</div>
									{/if}
									{#if !email && !selectedLog.userId}
										<span class="text-gray-400">No user information</span>
									{/if}
								</div>
							</div>

							<!-- Route -->
							{#if selectedLog.routeId}
								<div>
									<div class="text-sm font-medium text-gray-500">Route</div>
									<div class="mt-1 font-mono text-sm text-gray-700">{selectedLog.routeId}</div>
								</div>
							{/if}

							<!-- Admin Action Badge -->
							{#if contextData?.adminAction}
								<div class="rounded-md border border-orange-200 bg-orange-50 p-3">
									<div class="mb-2 flex items-center gap-2">
										<Badge class="bg-orange-500 hover:bg-orange-600">Admin Action</Badge>
									</div>
									<div class="space-y-1 text-sm">
										<div>
											<span class="font-medium text-orange-800">Performed by:</span>
											<span class="text-orange-900">{contextData.adminEmail}</span>
										</div>
										{#if contextData.targetArtistEmail}
											<div>
												<span class="font-medium text-orange-800">On behalf of:</span>
												<span class="text-orange-900">{contextData.targetArtistEmail}</span>
											</div>
										{/if}
									</div>
								</div>
							{/if}

							<!-- Context -->
							{#if contextData}
								<div>
									<div class="text-sm font-medium text-gray-500">Context</div>
									<div class="mt-2 max-h-64 overflow-auto rounded bg-gray-50 p-3">
										<pre class="text-xs">{JSON.stringify(contextData, null, 2)}</pre>
									</div>
								</div>
							{/if}

							<!-- Error Details -->
							{#if errorData}
								<div class="rounded-md border border-red-200 bg-red-50 p-4">
									<div class="text-sm font-medium text-red-800">Error Details</div>
									<div class="mt-2 space-y-2 text-sm">
										{#if errorData.name}
											<div>
												<span class="font-medium text-red-700">Type:</span>
												<span class="text-red-900">{errorData.name}</span>
											</div>
										{/if}
										{#if errorData.message}
											<div>
												<span class="font-medium text-red-700">Message:</span>
												<span class="text-red-900">{errorData.message}</span>
											</div>
										{/if}
										{#if errorData.stack}
											<div>
												<div class="font-medium text-red-700">Stack Trace:</div>
												<div class="mt-1 max-h-48 overflow-auto rounded bg-white p-2">
													<pre class="text-xs whitespace-pre-wrap text-red-800">{errorData.stack}</pre>
												</div>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				{:else}
					<Card.Root>
						<Card.Content class="py-12 text-center">
							<div class="text-gray-400">
								<svg class="mx-auto mb-4 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								<p class="text-sm font-medium">Select a log entry to view details</p>
							</div>
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
		</div>
	</div>
</div>
