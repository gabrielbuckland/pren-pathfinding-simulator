<script>
	// Two points: (x1, y1) and (x2, y2)
	export let from = { x1: 0, y1: 0 };
	export let to = { x2: 0, y2: 0 };
	export let type = 'solid';

	// Calculate width and height of the SVG container based on node positions
	let width = Math.abs(to.x2 - from.x1);
	let height = Math.abs(to.y2 - from.y1);

	// Ensure at least 1px width/height for vertical or horizontal lines
	width = Math.max(5, width);
	height = Math.max(5, height);

	// Calculate the left and top position for the SVG container to cover both nodes
	const left = Math.min(from.x1, to.x2);
	const top = Math.min(from.y1, to.y2);

	function handleClick(e) {
		e.preventDefault();
		type = type === 'solid' ? 'dashed' : 'solid';
	}
</script>

<svg {width} {height} style="position: absolute; left: {left}px; top: {top}px;">
	<a href="/" on:click={(e) => handleClick(e)}>
		<!-- Draw the line directly between the nodes -->
		<line class={type} x1={from.x1 - left} y1={from.y1 - top} x2={to.x2 - left} y2={to.y2 - top} />
	</a>
</svg>

<style>
	svg {
		overflow: visible;
		pointer-events: none;
	}

	/* Ensure all lines have the same color and thickness */
	line {
		stroke: black; /* Line color */
		stroke-width: 4; /* Line thickness */
		stroke-linecap: round; /* Optional: rounded line endings */
		pointer-events: all;
		cursor: pointer;
	}

	line.dashed {
		stroke-dasharray: 10, 14;
	}
</style>
