<script>
	import { animationSpeed, executionMode } from '../stores.js';
	import { get } from 'svelte/store';
	import EndPointSelection from './EndPointSelection.svelte';

	let numGraphs = 1;
	let selectedOption = get(executionMode);
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

	label {
		margin-bottom: 1rem;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
	}
</style>
