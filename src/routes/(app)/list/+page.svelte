<script lang="ts">
	import type {
		ColumnFiltersState,
		PaginationState,
		SortingState,
		TableOptions,
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

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { convertToDollars, determinePlacement } from '$lib/utils.ts';
	import { createTableState } from './state.svelte';

	import type { Exhibit } from '$lib/components/server/registrationDB.js';
	import tableImage from './tableImage.svelte';

	const { data } = $props();

	let exhibits: Exhibit[] = $state(data.exhibits?.slice(0, 999) ?? []);

	const columnHelper = createColumnHelper<Exhibit>();
	const columns = [
		columnHelper.accessor('exhibitNumber', {
			header: 'Placement',
			enableSorting: false,
			enableColumnFilter: false,
			enableGlobalFilter: false,
			cell: (info) => `${determinePlacement(info.getValue(), '2024', info.row.original.inOrOut)}_${info.getValue()}`
		}),

		columnHelper.display({
			header: 'Thumbnail',
			id: 'thumbnail',
			cell: (info) => renderComponent(tableImage, { path: info.row.original.cloudURL })
		}),

		columnHelper.accessor('artistName', { header: 'Name' }),
		columnHelper.accessor('title', { header: 'Title' }),
		columnHelper.accessor('description', { header: 'Description' }),
		columnHelper.accessor('material', { header: 'Material' }),

		columnHelper.accessor('dimensions', {
			header: 'Dimensions',
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
		pageSize: 8,
		pageIndex: 0
	});
	const [sorting, setSorting] = createTableState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = createTableState<VisibilityState>({
		description: false,
		material: false
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
	let selected = $state($page.params.artist);

	type SelectChangeEvent = Event & {
		currentTarget: EventTarget & HTMLSelectElement;
	};
	const navigate = (e: SelectChangeEvent) => {
		goto(`\list?exhibit=${e.currentTarget.value}`);
	};
</script>

<div class="grid place-items-center">
	<div class="inline-grid w-full max-w-screen-lg gap-2 p-2">
		<!-- TODO code for implementing a select option if ever needed -->
		<!-- <div class="grid gap-2">
			<label
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				for="exhibits">Artist Name</label
			>
			<select
				class="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
				name="exhibits"
				onchange={navigate}
				bind:value={selected}
			>
				{#each exhibits as artist}
					<option value={artist.exhibitNumber}>{artist.artistName}</option>
				{/each}
			</select>
		</div> -->

		<div class="flex items-center justify-between">
			<p class="text-md font-bold">{table.getRowCount()} exhibits</p>
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

		<div class="px-4">
			<Table.Root>
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup}
						<Table.Row>
							{#each headerGroup.headers as header}
								<Table.Head class="px-1">
									<Button variant="ghost" size="sm" class="h-6 p-1" onclick={header.column.getToggleSortingHandler()}>
										<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
									</Button>
									{#if header.column.getCanFilter()}
										<div>
											<Input
												type="text"
												class="h-6 w-20 p-1"
												placeholder="Search..."
												onchange={(e) => {
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

			<!-- <div class="flex items-center justify-center gap-2 text-sm">
				<span class="font-medium">Go to page:</span>
				<Input
					type="number"
					min="1"
					max={table.getPageCount()}
					class="h-8 w-20 p-2"
					onchange={(e) => {
						const num = e.currentTarget.value ? Number(e.currentTarget.value) - 1 : 0;
						const index = num < 0 ? 0 : num >= table.getPageCount() ? table.getPageCount() - 1 : num;
						table.setPageIndex(index);
						currentPage = index + 1;
					}}
					onblur={(e) => {
						e.currentTarget.value = '';
					}}
				/>
			</div> -->
		</div>
	</div>
</div>
