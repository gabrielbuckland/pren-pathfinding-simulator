<script>
	import { selectedAlgorithm } from '../stores.js';
	let algorithms = ['Exploration', 'Dijkstra', 'A*', 'D*Lite', 'BFS'];
</script>

<div class="algorithm-selection">
	<label for="algorithm-select">Algorithm to apply:</label>
	<select id="algorithm-select" bind:value={$selectedAlgorithm}>
		{#each algorithms as algorithm}
			<option value={algorithm}>{algorithm}</option>
		{/each}
	</select>
</div>

<style>
	.algorithm-selection {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	select {
		width: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
		margin-top: 0.25rem;
	}
</style>
