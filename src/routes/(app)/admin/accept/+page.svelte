<script lang="ts">
	import type {
		ColumnFiltersState,
		PaginationState,
		SortingState,
		TableOptions,
		SortDirection,
		VisibilityState
	} from '@tanstack/svelte-table';
	import {
		createColumnHelper,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		createTable,
		FlexRender,
		renderComponent
	} from '@tanstack/svelte-table';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Pagination from '$lib/components/ui/pagination';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	import { page } from '$app/state';

	import { convertToDollars, determinePlacement } from '$lib/utils.ts';
	import { createTableState } from '$lib/tableState.svelte.js';

	import type { Exhibit } from '$lib/components/server/registrationDB.js';
	import { TableImage } from '$lib/components';
	import MySwitch from './mySwitch.svelte';

	// the data is picked up from the page store so it can be used in the table
	const { data } = $props();

	let exhibits: Exhibit[] = $derived(page.data.exhibits?.slice(0, 999) ?? []);
	let updateAcceptedError = $state('');

	async function handleUpdateAccepted(entryId: number, index: number, accepted: boolean) {
		try {
			const result = await fetch(`/api/updateAccepted`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ entryId, accepted })
			});
			if (result.status != 200) {
				const error = await result.json();
				console.log('response error', JSON.stringify(error));
				updateAcceptedError = error.message;
			}
		} catch (err) {
			console.log('updateAccepted-err' + err);
			updateAcceptedError = err.message;
		}
		exhibits[index].accepted = !exhibits[index].accepted;
		return;
	}

	const columnHelper = createColumnHelper<Exhibit>();
	const columns = [
		columnHelper.accessor('accepted', {
			header: 'Accepted?',
			cell: (info) => {
				return renderComponent(MySwitch, {
					handleClick: () => {
						handleUpdateAccepted(info.row.original.entryId, info.row.index, info.row.original.accepted);
					},
					checked: info.getValue()
				});
			},
			enableSorting: true,
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),
		columnHelper.accessor('entryId', {
			header: 'EntryId',
			enableSorting: true,
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),
		columnHelper.accessor('exhibitNumber', {
			header: 'Placement',
			enableSorting: true,
			enableColumnFilter: false,
			enableGlobalFilter: false,
			cell: (info) => {
				const placement = determinePlacement(
					info.getValue(),
					info.row.original.registrationYear,
					info.row.original.inOrOut
				);
				const location = info.getValue();
				if (location) {
					return placement + ' - ' + location;
				}
				return placement;
			}
		}),
		columnHelper.display({
			header: 'Thumbnail',
			id: 'thumbnail',
			cell: (info) => {
				if (info.row.original.cloudURL == null) return 'No Image';
				return renderComponent(TableImage, {
					path: info.row.original.cloudURL,
					entryId: info.row.original.entryId
				});
			}
		}),
		columnHelper.accessor('artistName', { header: 'Artist Name' }),
		columnHelper.accessor('title', {
			header: 'Title',
			enableSorting: false,
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),
		columnHelper.accessor('email', {
			header: 'Email',
			enableSorting: false,
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),
		columnHelper.accessor('price', {
			header: 'Price',
			cell: (info) => convertToDollars(info.getValue(), 0),
			enableColumnFilter: false,
			enableGlobalFilter: false
		})
	];

	const [pagination, setPagination] = createTableState<PaginationState>({
		pageSize: 20,
		pageIndex: 0
	});

	const [sorting, setSorting] = createTableState<SortingState>([]);
	function getSortSymbol(isSorted: boolean | SortDirection) {
		return isSorted ? (isSorted === 'asc' ? '🔼' : '🔽') : '';
	}

	const [columnVisibility, setColumnVisibility] = createTableState<VisibilityState>({
		email: false
	});
	const [columnFiltersState, setColumnFiltersState] = createTableState<ColumnFiltersState>([]);

	const options: TableOptions<Exhibit> = {
		get data() {
			return exhibits;
		},
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnFiltersChange: setColumnFiltersState,
		state: {
			get pagination() {
				return pagination();
			},
			get sorting() {
				return sorting();
			},
			get columnVisibility() {
				return columnVisibility();
			},
			get columnFilters() {
				return columnFiltersState();
			}
		},
		debugTable: false
	};

	const table = createTable(options);
	let currentPage = $state(1);

	type SelectChangeEvent = Event & {
		currentTarget: EventTarget & HTMLSelectElement;
	};
</script>

<div class="grid place-items-center">
	<div class="inline-grid w-full max-w-screen-lg gap-2 p-2">
		<div class="flex items-center justify-between">
			<h4 class="text-xl font-bold text-primary">Accept/Reject Exhibits</h4>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button variant="outline" size="sm" class="ml-auto flex h-8" builders={[builder]}>Columns?</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
					<DropdownMenu.CheckboxItem
						checked={table.getIsAllColumnsVisible()}
						onclick={table.getToggleAllColumnsVisibilityHandler()}
					>
						All
					</DropdownMenu.CheckboxItem>
					<DropdownMenu.Separator />
					{#each table.getAllFlatColumns() as column}
						<DropdownMenu.CheckboxItem checked={column.getIsVisible()} onclick={column.getToggleVisibilityHandler()}>
							{column.columnDef.header}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
		{#if updateAcceptedError}
			<p class="text-red-500">{updateAcceptedError}</p>
		{/if}
		<div class="px-4">
			<Table.Root class="overflow-hidden">
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup}
						<Table.Row>
							{#each headerGroup.headers as header}
								<Table.Head class="px-1">
									<Button
										variant="ghost"
										size="sm"
										class="h-6 p-1"
										onclick={header.column.getToggleSortingHandler()}
										disabled={!header.column.getCanSort()}
									>
										<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
										<span class="pl-1">
											{getSortSymbol(header.column.getIsSorted())}
										</span>
									</Button>
									{#if header.column.getCanFilter()}
										<div>
											<Input
												type="text"
												class="h-6 w-20 p-1"
												placeholder="Search..."
												oninput={(e) => {
													header.column.setFilterValue(e.currentTarget.value);
												}}
											/>
										</div>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body>
					{#each table.getRowModel().rows as row}
						<Table.Row>
							{#each row.getVisibleCells() as cell}
								<Table.Cell class="p-1 {cell.column.columnDef.header === 'Price' ? 'text-right' : ''}">
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<div class="inline-grid gap-1">
			<Pagination.Root
				bind:page={currentPage}
				count={table.getRowCount()}
				perPage={table.getState().pagination.pageSize}
				let:pages
				let:currentPage
			>
				<Pagination.Content class="gap-0.5 sm:gap-1">
					<Pagination.Item>
						<Pagination.PrevButton
							class="px-2 [&>span]:sr-only"
							disabled={!table.getCanPreviousPage()}
							on:click={() => table.previousPage()}
						/>
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<Pagination.Item>
								<Pagination.Ellipsis class="w-4 sm:w-9" />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link
									size="default"
									class="min-w-3 max-w-14 px-3 sm:px-4"
									{page}
									isActive={currentPage === page.value}
									onclick={() => table.setPageIndex(page.value - 1)}
								>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton
							class="px-2 [&>span]:sr-only"
							disabled={!table.getCanNextPage()}
							on:click={() => table.nextPage()}
						/>
					</Pagination.Item>
					<Pagination.Item></Pagination.Item>
				</Pagination.Content>
			</Pagination.Root>
		</div>
	</div>
</div>
