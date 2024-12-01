<script>
	import Edge from './Edge.svelte';
	import Node from './Node.svelte';
	import { fixedNodes, fixedEdges } from '../graphStructure.js';
	import { nodeStates, edgeStates, executionMode } from '../stores.js';
	import { updateVisibility } from '../utils';

	const nodesById = fixedNodes.reduce((acc, node) => {
		acc[node.id] = node;
		return acc;
	}, {});

	// Reactive block to update visibility when executionMode changes
	$: updateVisibility($executionMode);
</script>

<section class="graph">
	{#if $executionMode === 'interactive' || $executionMode === 'explore'}
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
	{:else if $executionMode === 'parameterized'}
		<p class="no-visuals-message"><strong>No visuals available in parameterized mode</strong></p>
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
