<script>
	let numGraphs = 1;
	let exportEnabled = false;
</script>

<div class="simulator-options">
	<label>
		Number of Graphs to Test:
		<input type="number" min="1" bind:value={numGraphs} />
	</label>

	<label class="checkbox-label">
		<input type="checkbox" bind:checked={exportEnabled} />
		Create Export
	</label>

	<button>Run Simulation</button>
</div>

<style>
	.simulator-options {
		display: flex;
		flex-direction: column;
	}

	label {
		margin-bottom: 1rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
	}

	input[type='checkbox'] {
		margin-right: 0.5rem;
	}

	button {
		padding: 0.75rem;
		background-color: #007bff;
		color: #fff;
		border: none;
		cursor: pointer;
		width: 100%;
	}

	button:hover {
		background-color: #0056b3;
	}
</style>
