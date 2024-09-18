<script lang="ts">
	import { convertToDollars, determinePlacement } from '$lib/utils.ts';
	import { OptimisedImage } from '.';

	type Exhibit = {
		artistName: string;
		cloudURL: string;
		description: string;
		registrationYear: string;
		exhibitNumber: string;
		inOrOut: string;
		majorPrize?: string;
		material: string;
		price: string;
		dimensions: string;
		title: string;
		email: string;
		artistId: number;
		entryId: number;
		imageId: number;
	};

	const {
		exhibitNumber,
		registrationYear,
		artistName,
		description,
		cloudURL,
		inOrOut,
		material,
		price,
		dimensions,
		title,
		majorPrize
	} = $props() as Exhibit;
</script>

<!-- card -->
<div class="flex max-w-[400px] flex-col items-center justify-between rounded-xl border-2 bg-blue-50">
	<div class="flex w-full items-center px-2 py-3">
		<div class="flex items-center justify-center rounded-full bg-blue-500 p-4 font-bold text-white">
			<p>{exhibitNumber}</p>
		</div>
		<span class="ml-2 pt-1 text-sm font-bold">{title} - {artistName}</span>
	</div>
	<div>
		<OptimisedImage
			path={cloudURL ? cloudURL : '/dummy_160x160_ffffff_cccccc.png'}
			alt={title}
			width={128}
			height={128}
			class="h-32 w-32 overflow-hidden rounded object-contain"
		/>
	</div>
	<div class="w-full px-3 pb-2">
		<p class="text-base">{description}</p>
		<p class="mt-1 text-center text-xs">{material}</p>
		<div class="flex flex-row justify-between">
			<p class="text-xs">{dimensions}</p>
			<p class="text-xs">{determinePlacement(exhibitNumber, registrationYear, inOrOut)}</p>
		</div>
		<p class="w-full text-center text-base font-medium text-gray-700">{convertToDollars(parseInt(price))}</p>
	</div>
</div>
<!-- card -->
