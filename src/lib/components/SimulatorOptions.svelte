<script>
	import { selectedEndpoint, animationSpeed, executionMode } from '../stores.js';
	import { get } from 'svelte/store';
	import EndPointSelection from './EndPointSelection.svelte';

	let numGraphs = 1;
	let exportEnabled = false;
	let selectedOption = get(executionMode);

	function exportResults(results) {
		console.log('Exporting results:', results);
	}
</script>

<div class="simulator-options">
	<label>
		Number of graphs to test:
		<input
			type="number"
			min="1"
			disabled={selectedOption === 'interactive'}
			bind:value={numGraphs}
		/>
	</label>

	<label class="checkbox-label">
		<input type="checkbox" bind:checked={exportEnabled} />
		Create export
	</label>

	<EndPointSelection />

	<label>
		Animation speed (ms):
		<input
			type="number"
			min="0"
			disabled={selectedOption === 'parameterized'}
			bind:value={$animationSpeed}
		/>
	</label>
</div>

<style>
	.simulator-options {
		display: flex;
		flex-direction: column;
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
</style>
