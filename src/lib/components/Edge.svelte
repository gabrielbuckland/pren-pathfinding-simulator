<script>
	import { edgeStates } from '../stores.js';
	import { get } from 'svelte/store';

	export let id;
	export let from = { x1: 0, y1: 0 };
	export let to = { x2: 0, y2: 0 };
	export let type; // Initial type from props
	export let explState;

	// Define the types
	const types = ['solid', 'dashed', 'barrier'];

	// Reactive statement to compute currentType
	$: currentType = $edgeStates[id]?.type || type || 'solid';

	// Reactive statement to compute currentExplState
	$: currentExplState = $edgeStates[id]?.state || explState || 'default';

	// Calculate width and height of the SVG container based on node positions
	let width = Math.abs(to.x2 - from.x1);
	let height = Math.abs(to.y2 - from.y1);

	// Ensure at least 5px width/height for vertical or horizontal lines
	width = Math.max(5, width);
	height = Math.max(5, height);

	// Calculate the left and top position for the SVG container to cover both nodes
	const left = Math.min(from.x1, to.x2);
	const top = Math.min(from.y1, to.y2);

	// Adjusted line coordinates relative to the SVG container
	$: x1 = from.x1 - left;
	$: y1 = from.y1 - top;
	$: x2 = to.x2 - left;
	$: y2 = to.y2 - top;

	// Calculate the midpoint
	$: midX = (x1 + x2) / 2;
	$: midY = (y1 + y2) / 2;

	const barrierWidth = 40;
	const barrierHeight = 40;

	function handleClick(e) {
		e.preventDefault();

		let currentTypeIndex = types.indexOf(currentType);
		currentTypeIndex = (currentTypeIndex + 1) % types.length;
		let newType = types[currentTypeIndex];

		edgeStates.update((states) => {
			return {
				...states,
				[id]: {
					...states[id],
					type: newType
				}
			};
		});
	}
</script>

<svg {width} {height} style="position: absolute; left: {left}px; top: {top}px;">
	<!-- Draw the line directly between the nodes -->
	<line class="{currentType} state-{currentExplState}" {x1} {y1} {x2} {y2} on:click={handleClick} />
	{#if currentType === 'barrier'}
		<image
			href="/src/lib/images/barrier.png"
			x={midX - barrierWidth / 2}
			y={midY - barrierHeight / 2}
			width={barrierWidth}
			height={barrierHeight}
			on:click={handleClick}
		/>
	{/if}
</svg>

<style>
	svg {
		overflow: visible;
		pointer-events: none;
	}

	line {
		stroke: black;
		stroke-width: 4;
		stroke-linecap: round;
		pointer-events: all;
		cursor: pointer;
	}

	line.dashed {
		stroke-dasharray: 10, 14;
	}

	line.state-default {
		stroke: black;
	}

	line.state-visited {
		stroke: green;
	}

	line.state-probed {
		stroke: yellow;
	}

	line.state-restricted {
		stroke: red;
	}

	line.state-finished {
		stroke: blue;
	}

	image {
		pointer-events: all;
		cursor: pointer;
	}
</style>
