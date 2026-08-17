<script>
	import { animationSpeed } from '../stores.js';
	import EndPointSelection from './EndPointSelection.svelte';
</script>

<div class="simulator-options">
	<EndPointSelection />

	<label>
		Animation speed (ms):
		<input type="number" min="0" bind:value={$animationSpeed} />
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
