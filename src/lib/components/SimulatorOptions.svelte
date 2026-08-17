<script>
	import { animationSpeed } from '../stores.js';
	import AlgorithmSelection from './AlgorithmSelection.svelte';
	import EndPointSelection from './EndPointSelection.svelte';
</script>

<div class="row">
	<AlgorithmSelection />
	<EndPointSelection />

	<label>
		Animation speed (ms):
		<input type="number" min="0" step="50" bind:value={$animationSpeed} />
	</label>
</div>

<style>
	.row {
		display: flex;
		align-items: flex-start;
		width: 100%;
		gap: 1rem;
	}

	label {
		flex: 1;
		min-width: 0;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
		margin-top: 0.25rem;
	}
</style>
