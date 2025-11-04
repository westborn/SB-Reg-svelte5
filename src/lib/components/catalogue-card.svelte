<script lang="ts">
	import { convertToDollars, determinePlacement } from '$lib/utils.ts';
	import { OptimisedImage } from '$lib/components/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Exhibit } from '$lib/components/server/registrationDB';
	import Camera from 'lucide-svelte/icons/camera';

	const {
		exhibitNumber,
		registrationYear,
		artistName,
		description,
		cloudURL,
		inOrOut,
		material,
		price,
		sold = false,
		dimensions,
		title,
		hasMultipleImages = false
	} = $props() as Exhibit & { hasMultipleImages?: boolean };
</script>

<!-- card -->
<Card.Root class="flex max-w-[400px] flex-col items-center justify-between rounded-xl border-2 ">
	<div class="flex w-full items-center px-2 py-3">
		<div class="flex items-center justify-center rounded-full bg-blue-500 p-4 font-bold text-white">
			<p>{exhibitNumber}</p>
		</div>
		<span class="ml-2 pt-1 text-sm font-bold">{title} - {artistName}</span>
	</div>
	<div class="relative">
		<OptimisedImage
			path={cloudURL ? cloudURL : '/dummy_160x160_ffffff_cccccc.png'}
			alt={title}
			width={128}
			height={128}
			class="h-32 w-32 overflow-hidden rounded object-contain {sold ? 'opacity-60 grayscale' : ''}"
		/>
		{#if hasMultipleImages}
			<div class="absolute right-1 top-1 rounded-full bg-black bg-opacity-70 p-1">
				<Camera class="h-3 w-3 text-white" />
			</div>
		{/if}
		{#if sold}
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="rounded-md bg-red-600 px-2 py-1 text-sm font-bold text-white shadow-lg">SOLD</div>
			</div>
		{/if}
	</div>
	<div class="w-full px-3 pb-2">
		<p class="text-base">{description}</p>
		<p class="mt-1 text-center text-xs">{material}</p>
		<div class="flex flex-row justify-between">
			<p class="text-xs">{dimensions}</p>
			<p class="text-xs">{determinePlacement(exhibitNumber, registrationYear, inOrOut)}</p>
		</div>
		<p class="w-full text-center text-base font-medium">
			{#if sold}
				<span class="font-bold text-red-600">SOLD</span>
			{:else}
				{convertToDollars(parseInt(price.toString()))}
			{/if}
		</p>
	</div>
</Card.Root>
<!-- card -->
