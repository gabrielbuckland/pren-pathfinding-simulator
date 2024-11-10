<script>
	import { get } from 'svelte/store';
	import { executionMode } from '../stores.js';
	let selectedOption = get(executionMode);

	function selectOption(option) {
		selectedOption = option;
		executionMode.set(option);
	}
</script>

<div class="segmented-button">
	<button
		class:selected={selectedOption === 'interactive'}
		on:click={() => selectOption('interactive')}
	>
		Interactive run
	</button>
	<button
		class:selected={selectedOption === 'parameterized'}
		on:click={() => selectOption('parameterized')}
	>
		Parameterized run
	</button>
	<button class:selected={selectedOption === 'explore'} on:click={() => selectOption('explore')}>
		Explore map
	</button>
</div>

<style>
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
</style>
