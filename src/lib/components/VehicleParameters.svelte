<script>
	let timeToTraverse = 1.0;
	let timeWithBarrier = 2.0;
</script>

<div class="vehicle-parameters">
	<div class="row">
		<label>
			Time to traverse edge (cm/s):
			<input type="number" min="0" step="0.1" bind:value={timeToTraverse} />
		</label>

		<label>
			Time to traverse edge with barrier (cm/s):
			<input type="number" min="0" step="0.1" bind:value={timeWithBarrier} />
		</label>
	</div>
</div>

<style>
	.vehicle-parameters {
		display: flex;
		flex-direction: column;
	}

	.row {
		display: flex;
		width: 100%;
		gap: 1rem;
	}

	label {
		flex: 1;
		margin-bottom: 1rem;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
	}
</style>
