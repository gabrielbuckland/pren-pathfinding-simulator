<script>
	import { nodeStates, edgeStates } from '../stores.js';
	import { get } from 'svelte/store';

	let numGraphs = 1;
	let exportEnabled = false;
	let selectedOption = 'interactive';

	async function runSimulation() {

	}

	function exportResults(results) {
		console.log('Exporting results:', results);
	}

	function selectOption(option) {
		selectedOption = option;
	}
</script>

<div class="simulator-options">
	<label>
		Number of graphs to test:
		<input type="number" min="1" disabled={selectedOption === 'interactive'} bind:value={numGraphs} />
	</label>

	<label class="checkbox-label">
		<input type="checkbox" bind:checked={exportEnabled} />
		Create export
	</label>

	<div class="segmented-button">
		<button
			class:selected={selectedOption === 'interactive'}
			on:click={() => selectOption('interactive')}>
			Interactive run
		</button>
		<button
			class:selected={selectedOption === 'parameterized'}
			on:click={() => selectOption('parameterized')}>
			Parameterized run
		</button>
	</div>

	<button class="bold" on:click={runSimulation}>Run simulation</button>
</div>

<style>
	.simulator-options {
		display: flex;
		flex-direction: column;
	}

	.segmented-button {
		display: flex;
		width: 100%;
		margin-bottom: 1rem;
	}

	.segmented-button button {
		flex: 1;
		padding: 0.75rem;
		background-color: #f1f1f1;
		color: #000;
		border: 1px solid #ccc;
		cursor: pointer;
	}

	.segmented-button button:hover {
		background-color: #e0e0e0;
	}

	.segmented-button button.selected {
		background-color: #007bff;
		color: #fff;
		border-color: #0056b3;
	}

	.bold {
		font-weight: bold;
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
