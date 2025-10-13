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
	import * as Select from '$lib/components/ui/select';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { TableImage } from '$lib/components';
	import { EXHIBITION_YEAR } from '$lib/constants';

	import { convertToDollars, determinePlacement } from '$lib/utils.ts';
	import { createTableState } from '$lib/tableState.svelte.js';

	import type { Exhibit } from '$lib/components/server/registrationDB.js';
	import { PersistedState } from 'runed';
	import type { Updater } from '@tanstack/svelte-table';

	let exhibits: Exhibit[] = $derived(page.data.exhibits?.slice(0, 999) ?? []);

	const years = ['2026', '2025', '2024', '2023', '2022'];

	let selectedYear = $state(EXHIBITION_YEAR);

	function handleSelectYear(event: any) {
		selectedYear = { ...event };
		const newURL = new URL(page.url);
		newURL.searchParams?.set('year', selectedYear);
		goto(newURL);
	}

	const columnHelper = createColumnHelper<Exhibit>();
	const columns = [
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

		columnHelper.accessor('accepted', {
			header: 'Accepted',
			cell: (info) => (info.getValue() ? 'Yes' : 'No'),
			enableSorting: false,
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),

		columnHelper.accessor('closed', {
			header: 'Closed',
			cell: (info) => (info.getValue() ? 'Yes' : 'No'),
			enableSorting: false,
			enableColumnFilter: false,
			enableGlobalFilter: false
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
		columnHelper.accessor('email', {
			header: 'Email',
			enableSorting: false,
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),
		columnHelper.accessor('artistName', { header: 'Name' }),
		columnHelper.accessor('phone', {
			header: 'Phone',
			cell: (info) => info.getValue(),
			enableSorting: false,
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),
		columnHelper.accessor('title', { header: 'Title' }),
		columnHelper.accessor('price', {
			header: 'Price',
			cell: (info) => convertToDollars(info.getValue(), 0),
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),
		columnHelper.accessor('description', { header: 'Description' }),
		columnHelper.accessor('material', {
			header: 'Material',
			enableSorting: false,
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),
		columnHelper.accessor('dimensions', {
			header: 'Dimensions',
			enableSorting: false,
			enableColumnFilter: false,
			enableGlobalFilter: false
		}),
		columnHelper.accessor('bankBSB', {
			header: 'Bank Details',
			cell: (info) => info.getValue() + ' - ' + info.row.original.bankAccount,
			enableSorting: false,
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

	const [columnVisibility, setColumnVisibility] = createPersistVisibilityState<VisibilityState>({
		exhibitNumber: false,
		accepted: false,
		closed: false,
		email: false,
		description: false,
		material: false,
		dimensions: false,
		bankBSB: false
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

	function createPersistVisibilityState<T>(initialValue: T): [() => T, (updater: Updater<T>) => void] {
		const value = new PersistedState('persistVisibility', initialValue);
		return [
			() => value.current,
			(updater: Updater<T>) => {
				if (updater instanceof Function) value.current = updater(value.current);
				else value.current = updater;
			}
		];
	}
</script>

<section class="mx-auto mt-2">
	<div class="flex items-center justify-start gap-3">
		<h4 class="text-xl font-bold text-primary">Year</h4>
		<Select.Root type="single" bind:value={selectedYear} name="registrationYear">
			<Select.Trigger class="w-[120px]">Select a year</Select.Trigger>
			<Select.Content>
				{#each years as year}
					<Select.Item value={year}>{year}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<p class="text-md font-bold">{table.getRowCount()} exhibits</p>
	</div>
</section>

<div class="grid place-items-center">
	<div class="inline-grid w-full max-w-screen-lg gap-2 p-2">
		<div class="flex items-center justify-between">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm" class="ml-auto flex h-8">Columns?</Button>
					{/snippet}
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
			>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content class="gap-0.5 sm:gap-1">
						<Pagination.Item>
							<Pagination.PrevButton
								class="px-2 [&>span]:sr-only"
								disabled={!table.getCanPreviousPage()}
								onclick={() => table.previousPage()}
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
								onclick={() => table.nextPage()}
							/>
						</Pagination.Item>
						<Pagination.Item></Pagination.Item>
					</Pagination.Content>
				{/snippet}
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
