<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

	function parseContext(context: string | null): Record<string, any> | null {
		if (!context) return null;
		try {
			return JSON.parse(context);
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
	<Card.Root>
		<Card.Header>
			<Card.Title>Recent Log Entries (Last 100)</Card.Title>
			<Card.Description>Most recent entries first</Card.Description>
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
								<Table.Head class="w-[100px]">Level</Table.Head>
								<Table.Head class="w-[180px]">Timestamp</Table.Head>
								<Table.Head>Message</Table.Head>
								<Table.Head class="w-[150px]">Route</Table.Head>
								<Table.Head class="w-[100px]">User ID</Table.Head>
								<Table.Head class="w-[100px]">Details</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.logs as log}
								<Table.Row>
									<Table.Cell>
										<Badge class={getLogLevelColor(log.level)}>{log.level}</Badge>
									</Table.Cell>
									<Table.Cell class="whitespace-nowrap text-sm">{formatDate(log.createdAt)}</Table.Cell>
									<Table.Cell class="max-w-md">
										<div class="line-clamp-2">{log.message}</div>
									</Table.Cell>
									<Table.Cell class="text-sm text-gray-600">
										{log.routeId || '-'}
									</Table.Cell>
									<Table.Cell class="text-sm text-gray-600">
										{log.userId ? log.userId.substring(0, 8) + '...' : '-'}
									</Table.Cell>
									<Table.Cell>
										{#if log.context || log.error}
											<details class="cursor-pointer text-sm">
												<summary class="text-blue-600 hover:text-blue-800">View</summary>
												<div class="mt-2 max-w-2xl space-y-2 rounded bg-gray-50 p-2 text-xs">
													{#if log.context}
														{@const contextData = parseContext(log.context)}
														{#if contextData}
															<div>
																<strong>Context:</strong>
																<pre class="mt-1 overflow-x-auto">{JSON.stringify(contextData, null, 2)}</pre>
															</div>
														{/if}
													{/if}
													{#if log.error}
														{@const errorData = parseError(log.error)}
														{#if errorData}
															<div>
																<strong class="text-red-600">Error:</strong>
																<div class="mt-1">
																	{#if errorData.name}
																		<div><strong>Name:</strong> {errorData.name}</div>
																	{/if}
																	{#if errorData.message}
																		<div><strong>Message:</strong> {errorData.message}</div>
																	{/if}
																	{#if errorData.stack}
																		<div class="mt-2">
																			<strong>Stack Trace:</strong>
																			<pre
																				class="mt-1 overflow-x-auto whitespace-pre-wrap text-xs">{errorData.stack}</pre>
																		</div>
																	{/if}
																</div>
															</div>
														{/if}
													{/if}
												</div>
											</details>
										{:else}
											-
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
