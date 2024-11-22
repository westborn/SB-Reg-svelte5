<script lang="ts">
	let { checked, handleClick } = $props();
</script>

<span>
	<div class="inline-flex items-center gap-1">
		{#if !checked}
			<label for="switch-component-on" class="cursor-pointer text-sm text-red-600">N</label>
		{:else}
			<label for="switch-component-on text-sm">&nbsp</label>
		{/if}
		<div class="relative inline-block h-5 w-11">
			<input
				id="switch-component-on"
				type="checkbox"
				bind:checked
				onclick={handleClick}
				class="peer h-5 w-11 cursor-pointer appearance-none rounded-full bg-red-300 transition-colors duration-300 checked:bg-green-500"
			/>
			<label
				for="switch-component-on"
				class="absolute left-0 top-0 h-5 w-5 cursor-pointer rounded-full border border-slate-300 bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-6"
			>
			</label>
		</div>
		{#if checked}
			<label for="switch-component-on" class="cursor-pointer text-sm text-green-600">Y</label>
		{:else}
			<label for="switch-component-on text-sm">&nbsp</label>
		{/if}
	</div>
</span>
