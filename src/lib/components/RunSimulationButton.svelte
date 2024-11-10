<script>
	import {
		selectedEndpoint,
		vehicleParameters,
		selectedAlgorithm,
		animationSpeed,
		executionMode
	} from '../stores.js';
	import { runAlgorithm, simulateMapExploration } from '../algorithms.js';
	import { get } from 'svelte/store';
	import { resetExplorationStates, updateVisibility } from '../utils.js';

	async function runSimulation() {
		if ($executionMode === 'interactive') {
			try {
				resetExplorationStates();

				const algorithmName = get(selectedAlgorithm);
				const startpoint = 'S';
				const endpoint = get(selectedEndpoint);
				const vehicleParams = get(vehicleParameters);
				const animationMs = get(animationSpeed);

				await runAlgorithm(algorithmName, startpoint, endpoint, vehicleParams, animationMs);
			} catch (error) {
				console.error('Error running simulation:', error);
			}
		} else if ($executionMode === 'parameterized') {
			console.log('Parameterized run is not yet implemented.');
		} else if ($executionMode === 'explore') {
			resetExplorationStates();
			updateVisibility($executionMode);

			await simulateMapExploration();
		} else {
			console.error('option not selected correctly');
		}
	}
</script>

<button class="bold" on:click={runSimulation}>Run simulation</button>

<style>
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
