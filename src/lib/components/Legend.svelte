<script>
	import barrierImage from '../images/barrier.png';
	import coneImage from '../images/cone.png';

	/**
	 * Two independent things are being described here.
	 *
	 * What a node or an edge IS comes from the map you drew, and is shown by
	 * its shape. What a run has FOUND OUT about it is shown by its colour, and
	 * Node.svelte and Edge.svelte use the same five colours for that, so the
	 * colours are listed once rather than twice.
	 */
	const runStates = [
		{ label: 'Untouched', stroke: 'black', fill: 'white', hint: 'the run has not reached it' },
		{ label: 'Probed', stroke: 'yellow', fill: 'yellow', hint: 'seen from a neighbour' },
		{ label: 'Visited', stroke: 'green', fill: 'green', hint: 'driven through' },
		{ label: 'Ruled out', stroke: 'red', fill: 'red', hint: 'found to be unusable' },
		{ label: 'Final route', stroke: 'blue', fill: 'blue', hint: 'part of the chosen route' }
	];
</script>

<div class="legend">
	<div class="group">
		<span class="group-title">Node</span>
		<span class="item" title="Can be driven through">
			<svg class="glyph" viewBox="0 0 14 14" aria-hidden="true">
				<circle cx="7" cy="7" r="5.5" class="outline" />
			</svg>
			Open
		</span>
		<span class="item" title="A pylon blocks it. Click a node to place or remove one.">
			<img src={coneImage} alt="" />
			Blocked
		</span>
	</div>

	<div class="group">
		<span class="group-title">Edge</span>
		<span class="item" title="Can be driven">
			<svg class="glyph wide" viewBox="0 0 28 14" aria-hidden="true">
				<line x1="2" y1="7" x2="26" y2="7" class="outline" />
			</svg>
			Open
		</span>
		<span class="item" title="Removed from the map, no route across it">
			<svg class="glyph wide" viewBox="0 0 28 14" aria-hidden="true">
				<line x1="2" y1="7" x2="26" y2="7" class="outline" stroke-dasharray="5 6" />
			</svg>
			Removed
		</span>
		<span class="item" title="Can be driven, but costs the barrier time instead">
			<img src={barrierImage} alt="" />
			Barrier
		</span>
	</div>

	<div class="group">
		<span class="group-title">Run state</span>
		{#each runStates as state}
			<span class="item" title={state.hint}>
				<!-- Line and circle together, because the colour means the same on a
				     section as it does on a node. -->
				<svg class="glyph wide" viewBox="0 0 28 14" aria-hidden="true">
					<line x1="1" y1="7" x2="15" y2="7" stroke={state.stroke} stroke-width="4" />
					<circle cx="21" cy="7" r="5" fill={state.fill} stroke={state.stroke} stroke-width="2" />
				</svg>
				{state.label}
			</span>
		{/each}
	</div>
</div>

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 1.25rem;
		padding: 0.75rem 0 0 0;
		font-size: 0.8rem;
		color: #333;
	}

	.group {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.group-title {
		font-weight: 600;
		color: #666;
		white-space: nowrap;
	}

	.item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		white-space: nowrap;
	}

	.glyph {
		width: 0.9rem;
		height: 0.9rem;
		flex: none;
	}

	.glyph.wide {
		width: 1.8rem;
	}

	/* Shapes are neutral, so colour stays the property of the run state. */
	.glyph .outline {
		stroke: #555;
		stroke-width: 2.5;
		stroke-linecap: round;
		fill: none;
	}

	.item img {
		width: 1rem;
		height: 1rem;
		object-fit: contain;
	}
</style>
