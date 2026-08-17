<script>
	import barrierImage from '../images/barrier.png';

	// Mirrors the state colours in Node.svelte and Edge.svelte.
	const states = [
		{ colour: 'black', label: 'Unexplored', hint: 'not looked at yet' },
		{ colour: 'yellow', label: 'Probed', hint: 'seen, not driven' },
		{ colour: 'green', label: 'Visited', hint: 'driven through' },
		{ colour: 'red', label: 'Restricted', hint: 'blocked by an obstacle' },
		{ colour: 'blue', label: 'Final path', hint: 'the chosen route' }
	];
</script>

<div class="legend">
	<div class="group">
		<span class="group-title">State</span>
		{#each states as state}
			<span class="item" title={state.hint}>
				<span class="swatch" style="background-color: {state.colour}"></span>
				{state.label}
			</span>
		{/each}
	</div>

	<div class="group">
		<span class="group-title">Edge</span>
		<span class="item" title="Can be driven">
			<svg class="line-sample" viewBox="0 0 32 8" aria-hidden="true">
				<line x1="1" y1="4" x2="31" y2="4" />
			</svg>
			Passable
		</span>
		<span class="item" title="Not present on the map">
			<svg class="line-sample" viewBox="0 0 32 8" aria-hidden="true">
				<line x1="1" y1="4" x2="31" y2="4" stroke-dasharray="6, 5" />
			</svg>
			Missing
		</span>
		<span class="item" title="Can be driven, but costs the barrier time">
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
		gap: 0.5rem 1.25rem;
		padding: 0.5rem 0 0 0;
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

	.swatch {
		width: 0.8rem;
		height: 0.8rem;
		border-radius: 50%;
		outline: 1px solid #999;
		outline-offset: -1px;
	}

	.line-sample {
		width: 2rem;
		height: 0.5rem;
	}

	.line-sample line {
		stroke: black;
		stroke-width: 2;
		stroke-linecap: round;
	}

	.item img {
		width: 1rem;
		height: 1rem;
		object-fit: contain;
	}
</style>
