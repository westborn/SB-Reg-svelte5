<script lang="ts">
	type Props = {
		path: string;
		alt: string;
		width: number;
		height: number;
		class: string;
	};

	let { path, alt, width, height, class: className }: Props = $props();

	// Convert Cloudinary URLs to use auto format and quality
	const optimizedPath = $derived(() => {
		if (path.includes('res.cloudinary.com')) {
			// Add auto format and quality optimization for Cloudinary images
			return path.replace('/upload/', '/upload/f_auto,q_auto/');
		}
		return path;
	});
</script>

<picture>
	<source type="image/webp" srcset={optimizedPath().replace('.jpg', '.webp')} />
	<source type="image/avif" srcset={optimizedPath().replace('.jpg', '.avif')} />
	<img src={optimizedPath()} {alt} {width} {height} class={className} />
</picture>
