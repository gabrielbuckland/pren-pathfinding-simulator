<script>
	import barrierImage from '../images/barrier.png';
	import coneImage from '../images/cone.png';

	// Grouped by the two things you can click, and drawn the way the graph
	// draws them: an unexplored node is an outlined circle, not a filled dot.
	const nodeStates = [
		{ label: 'Unexplored', fill: 'white', border: 'black', hint: 'not looked at yet' },
		{ label: 'Probed', fill: 'yellow', border: 'yellow', hint: 'seen from a neighbour' },
		{ label: 'Visited', fill: 'green', border: 'green', hint: 'driven through' },
		{ label: 'Final path', fill: 'blue', border: 'blue', hint: 'part of the chosen route' }
	];
</script>

<div class="legend">
	<div class="group">
		<span class="group-title">Node</span>
		{#each nodeStates as state}
			<span class="item" title={state.hint}>
				<span class="swatch" style="background-color: {state.fill}; border-color: {state.border}"
				></span>
				{state.label}
			</span>
		{/each}
		<!-- A node only ever turns red because a pylon stands on it, so the two
		     are one entry rather than two. -->
		<span class="item" title="A pylon blocks the node it stands on. Click a node to place one.">
			<span class="swatch" style="background-color: red; border-color: red"></span>
			<img src={coneImage} alt="" />
			Blocked by pylon
		</span>
	</div>

	<div class="group">
		<span class="group-title">Section</span>
		<span class="item" title="Can be driven">
			<svg class="line-sample" viewBox="0 0 32 8" aria-hidden="true">
				<line x1="2" y1="4" x2="30" y2="4" />
			</svg>
			Passable
		</span>
		<span class="item" title="Removed from the map, no route through it">
			<svg class="line-sample missing" viewBox="0 0 32 8" aria-hidden="true">
				<line x1="2" y1="4" x2="30" y2="4" stroke-dasharray="5 7" />
			</svg>
			Missing
		</span>
		<span class="item" title="Can be driven, but costs the barrier time instead">
			<img src={barrierImage} alt="" />
			Barrier
		</span>
	</div>
</div>

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1.5rem;
		padding: 0.75rem 0 0 0;
		font-size: 0.8rem;
		color: #333;
	}

	.group {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.group-title {
		font-weight: 600;
		color: #666;
	}

	.item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		white-space: nowrap;
	}

	/* Same shape and border weight as a node in the graph, at a smaller size. */
	.swatch {
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 50%;
		border: 2px solid;
		box-sizing: border-box;
	}

	.line-sample {
		width: 2rem;
		height: 0.5rem;
		overflow: visible;
	}

	/* Matches the stroke the graph actually uses, so the sample is recognisable. */
	.line-sample line {
		stroke: black;
		stroke-width: 4;
		stroke-linecap: round;
	}

	.line-sample.missing line {
		stroke-width: 3;
	}

	.item img {
		width: 1rem;
		height: 1rem;
		object-fit: contain;
	}
</style>
