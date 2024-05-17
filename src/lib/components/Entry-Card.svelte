<script lang="ts">
	import { getRegisterState } from "$lib/state.svelte";
	import PostUpdateForm from "./post-update-form.svelte";

	const data = getPostState();
</script>

{entry.title}
<span class="text-xs">
  ({entry.inOrOut})
</span>
</button>
{#if entry.active}
<div class="mb-2 bg-slate-50 px-5 py-2 text-sm" transition:slide>
  <p>{entry.description}</p>
  <div class="mx-auto flex items-center justify-between">
    <p class="text-lg">
      {entry.price.toLocaleString('en-AU', {
        style: 'currency',
        currency: 'AUD'
      })}
    </p>
    <p>{entry?.enterMajorPrize ? 'Entered in Major Prize' : ''}</p>
    <p>({entry.dimensions})</p>
  </div>

  <p>{entry.material}</p>
  <p>{entry?.specialRequirements}</p>

  <div
    class="mx-auto mt-10 flex h-48 w-48 flex-col items-center justify-center border-2 border-solid border-slate-200 text-slate-400"
  >
    {#if entry?.images[0]?.imageURL}
      <img
        class="h-48 w-48 object-scale-down p-1"
        src={getThumbnailURL(entry?.images[0]?.imageURL)}
        alt="Preview"
      />
    {:else}
      <span>Image Preview</span>
    {/if}
  </div>
