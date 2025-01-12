<script lang="ts">
	type Props = {
		path: string;
		alt: string;
		width: number;
		height: number;
		class: string;
	};

	let { path, alt, width, height, class: className }: Props = $props();
</script>

<picture>
	<source type="image/webp" srcset={path.replace('.jpg', '.webp')} />
	<source type="image/avif" srcset={path.replace('.jpg', '.avif')} />
	<img src={path} {alt} {width} {height} class={className} />
</picture>
