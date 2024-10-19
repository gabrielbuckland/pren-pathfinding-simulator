<script>
	let timeToTraverse = 1.0;
	let timeWithBarrier = 2.0;
	let speed = 50;
</script>

<div class="vehicle-parameters">
	<label>
		Time to traverse edge (cm/s):
		<input type="number" min="0" step="0.1" bind:value={timeToTraverse} />
	</label>

	<label>
		Time to traverse edge with barrier (cm/s):
		<input type="number" min="0" step="0.1" bind:value={timeWithBarrier} />
	</label>

	<label>
		Speed:
		<input type="range" min="0" max="100" bind:value={speed} />
		<span>{speed} cm/s</span>
	</label>
</div>

<style>
	.vehicle-parameters {
		display: flex;
		flex-direction: column;
	}

	label {
		margin-bottom: 1rem;
	}

	input[type='number'],
	input[type='range'] {
		width: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
	}

	span {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}
</style>
