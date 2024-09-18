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
		FlexRender
	} from '@tanstack/svelte-table';
	import * as Table from '$lib/components/ui/table';

	import { createTableState } from './state.svelte';
	import { convertToDollars, determinePlacement } from '$lib/utils.ts';

	import type { Exhibit } from '$lib/components/server/registrationDB.js';
	import { CircleEllipsisIcon } from 'lucide-svelte';

	const { data } = $props();

	let exhibits: Exhibit[] = $state.raw(data.exhibits.slice(0, 20));

	const columns = [
		// { accessorKey: 'exhibitNumber', header: 'Exhibit' },
		// { accessorKey: 'cloudURL', header: 'image' },
		{
			accessorKey: 'inOrOut',
			header: 'Placement',
			cell: (info) =>
				`${determinePlacement(info.row.original.exhibitNumber, '2024', info.getValue())}_${info.row.original.exhibitNumber}`
		},
		{ accessorKey: 'artistName', header: 'Name' },
		{ accessorKey: 'title', header: 'Title' },
		{ accessorKey: 'description', header: 'Description' },
		{ accessorKey: 'dimensions', header: 'Dimensions' },
		{ accessorKey: 'material', header: 'Material' },
		{ accessorKey: 'price', header: 'Price', cell: (info) => convertToDollars(info.getValue()) }
	];

	const options: TableOptions<Exhibit> = {
		get data() {
			return exhibits;
		},
		columns: columns,
		getCoreRowModel: getCoreRowModel<Exhibit>()
	};

	const table = createTable(options);
</script>

<div class="px-4">
	<h1 class="is-size-1">Exhbits</h1>
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup}
				<Table.Row>
					{#each headerGroup.headers as header}
						<Table.Head class="px-1">
							{#if !header.isPlaceholder}
								<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
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
