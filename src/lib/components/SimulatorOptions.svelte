<script>
	import { selectedEndpoint, animationSpeed, executionMode } from '../stores.js';
	import { get } from 'svelte/store';

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

	<div class="endpoint-selection">
		<label>Select endpoint:</label>
		<div class="radio-buttons">
			<label>
				<input type="radio" name="endpoint" value="A" bind:group={$selectedEndpoint} />
				A
			</label>
			<label>
				<input type="radio" name="endpoint" value="B" bind:group={$selectedEndpoint} />
				B
			</label>
			<label>
				<input type="radio" name="endpoint" value="C" bind:group={$selectedEndpoint} />
				C
			</label>
		</div>
	</div>

	<label class="checkbox-label">
		<input type="checkbox" bind:checked={exportEnabled} />
		Create export
	</label>

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

	.endpoint-selection {
		margin-bottom: 1rem;
	}

	.radio-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.radio-buttons label {
		display: flex;
		align-items: center;
	}

	.radio-buttons input[type='radio'] {
		margin-right: 0.5rem;
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
