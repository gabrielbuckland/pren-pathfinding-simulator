<script>
	import { edgeStates } from '../stores.js';
	import barrierImage from '../images/barrier.png';

	export let id;
	export let from = { x1: 0, y1: 0 };
	export let to = { x2: 0, y2: 0 };
	export let type;
	export let explState;
	export let visibility = 'visible';

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

	function handleKeydown(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			handleClick(e);
		}
	}
</script>

<svg
	class={visibility === 'hidden' ? 'hidden' : ''}
	{width}
	{height}
	style="position: absolute; left: {left}px; top: {top}px;"
>
	<!-- Purely presentational: the visible section and its barrier. -->
	<line class="visual {currentType} state-{currentExplState}" {x1} {y1} {x2} {y2} />
	{#if currentType === 'barrier'}
		<image
			href={barrierImage}
			x={midX - barrierWidth / 2}
			y={midY - barrierHeight / 2}
			width={barrierWidth}
			height={barrierHeight}
		/>
	{/if}

	<!-- A wider transparent line on top carries the interaction. A dashed stroke
	     only hit-tests where it is painted, so without this the gaps of a removed
	     edge would not respond to a click. It also makes every edge easier to hit
	     than its 4px stroke. -->
	<line
		class="hit-area"
		{x1}
		{y1}
		{x2}
		{y2}
		role="button"
		tabindex="0"
		aria-label="Change edge {id}"
		on:click={handleClick}
		on:keydown={handleKeydown}
	/>
</svg>

<style>
	svg {
		overflow: visible;
		pointer-events: none;
	}

	.hidden {
		opacity: 0;
		pointer-events: none;
		overflow: clip;
	}

	.hidden * {
		opacity: 0;
		pointer-events: none;
	}

	line.visual {
		stroke: black;
		stroke-width: 4;
		stroke-linecap: round;
		pointer-events: none;
	}

	.hit-area {
		stroke: transparent;
		stroke-width: 14;
		stroke-linecap: butt;
		pointer-events: stroke;
		cursor: pointer;
	}

	/* Editing the map is a click, and a ring left behind on every clicked edge
	   clutters the graph. Keyboard focus still shows one, since that is the only
	   way a keyboard user can tell where they are. */
	.hit-area:focus {
		outline: none;
	}

	.hit-area:focus-visible {
		outline: 2px solid #007bff;
		outline-offset: 2px;
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
		pointer-events: none;
	}
</style>
