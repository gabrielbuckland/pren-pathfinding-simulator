<script>
	import Edge from './Edge.svelte';
	import Node from './Node.svelte';
	import { fixedNodes, fixedEdges } from '../graphStructure.js';
	import { nodeStates, edgeStates } from '../stores.js';

	const nodesById = fixedNodes.reduce((acc, node) => {
		acc[node.id] = node;
		return acc;
	}, {});
</script>

<section class="graph">
	{#each fixedNodes as node (node.id)}
		<Node
			id={node.id}
			x={node.x}
			y={node.y}
			isObstacle={$nodeStates[node.id]?.isObstacle || false}
			explState={$nodeStates[node.id]?.explState || 'default'}
		/>
	{/each}

	{#each fixedEdges as edge (edge.id)}
		<Edge
			id={edge.id}
			from={{ x1: nodesById[edge.from].x, y1: nodesById[edge.from].y }}
			to={{ x2: nodesById[edge.to].x, y2: nodesById[edge.to].y }}
			type={$edgeStates[edge.id]?.type || 'solid'}
			explState={$edgeStates[edge.id]?.explState || 'default'}
		/>
	{/each}
</section>

<style>
	.graph {
		position: relative;
		width: 35rem;
		height: 35rem;
		margin: auto;
	}
</style>
