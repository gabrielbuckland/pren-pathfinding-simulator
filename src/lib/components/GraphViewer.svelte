<script>
	import Edge from './Edge.svelte';
	import Node from './Node.svelte';
	import { fixedNodes, fixedEdges } from '../graphStructure.js';
	import { nodeStates, edgeStates, executionMode, selectedAlgorithm } from '../stores.js';
	import { updateVisibility } from '../utils';

	const nodesById = fixedNodes.reduce((acc, node) => {
		acc[node.id] = node;
		return acc;
	}, {});

	// Only the exploring vehicle starts without a map, so only it gets the
	// partially hidden graph. Everything else is shown what it actually knows.
	$: updateVisibility(
		$executionMode === 'single' && $selectedAlgorithm === 'Exploration' ? 'start-only' : 'all'
	);
</script>

<section class="graph">
	{#if $executionMode === 'single'}
		{#each fixedNodes as node (node.id)}
			<Node
				id={node.id}
				x={node.x}
				y={node.y}
				isObstacle={$nodeStates[node.id]?.isObstacle || false}
				explState={$nodeStates[node.id]?.explState || 'default'}
				visibility={$nodeStates[node.id]?.visibility || 'visible'}
			/>
		{/each}

		{#each fixedEdges as edge (edge.id)}
			<Edge
				id={edge.id}
				from={{ x1: nodesById[edge.from].x, y1: nodesById[edge.from].y }}
				to={{ x2: nodesById[edge.to].x, y2: nodesById[edge.to].y }}
				type={$edgeStates[edge.id]?.type || 'solid'}
				explState={$edgeStates[edge.id]?.explState || 'default'}
				visibility={$edgeStates[edge.id]?.visibility || 'visible'}
			/>
		{/each}
	{:else}
		<p class="no-visuals-message">
			<strong>No visuals in a bulk run. Results appear in the log.</strong>
		</p>
	{/if}
</section>

<style>
	.graph {
		position: relative;
		width: 35rem;
		height: 35rem;
		margin: auto;
	}

	.no-visuals-message {
		text-align: center;
		margin-top: 2rem;
		font-size: 1.2rem;
	}
</style>
