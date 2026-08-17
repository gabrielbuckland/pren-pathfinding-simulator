<script>
	import {
		selectedEndpoint,
		vehicleParameters,
		selectedAlgorithm,
		animationSpeed,
		executionMode,
		numberOfRuns
	} from '../stores.js';
	import { runAlgorithm, startParameterizedRun } from '../algorithms.js';
	import { get } from 'svelte/store';
	import { resetExplorationStates } from '../utils.js';

	async function runSimulation() {
		if ($executionMode === 'single') {
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
		} else if ($executionMode === 'bulk') {
			await startParameterizedRun($numberOfRuns);
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
