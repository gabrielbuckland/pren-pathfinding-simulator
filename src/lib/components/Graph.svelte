<script>
	import Edge from './Edge.svelte';
	import Node from './Node.svelte';

	const containerSize = 35 * 16; // 35rem in pixels (1 rem = 16px by default)
	const centerX = containerSize / 2;
	const centerY = containerSize / 2;
	const radius = containerSize / 2.5;

	// Calculate positions of the nodes in a hexagonal pattern
	let nodes = [
		{ id: '4', x: centerX, y: centerY, isObsticle: false }, // Center node
		{
			id: 'S',
			x: centerX + radius * Math.sin(0),
			y: centerY - radius * Math.cos(0),
			isObsticle: false
		}, // Top node
		{
			id: '3',
			x: centerX + radius * Math.sin(Math.PI / 3),
			y: centerY - radius * Math.cos(Math.PI / 3),
			isObsticle: false
		}, // Top-right
		{
			id: 'C',
			x: centerX + radius * Math.sin((2 * Math.PI) / 3),
			y: centerY - radius * Math.cos((2 * Math.PI) / 3),
			isObsticle: false
		}, // Bottom-right
		{
			id: 'B',
			x: centerX + radius * Math.sin(Math.PI),
			y: centerY - radius * Math.cos(Math.PI),
			isObsticle: false
		}, // Bottom
		{
			id: 'A',
			x: centerX + radius * Math.sin((4 * Math.PI) / 3),
			y: centerY - radius * Math.cos((4 * Math.PI) / 3),
			isObsticle: false
		}, // Bottom-left
		{
			id: '1',
			x: centerX + radius * Math.sin((5 * Math.PI) / 3),
			y: centerY - radius * Math.cos((5 * Math.PI) / 3),
			isObsticle: true
		}, // Top-left
		{ id: '2', x: 230, y: 170, isObsticle: false } // Top-left center
	];

	function getNodesById(nodes) {
		return nodes.reduce((acc, node) => {
			acc[node.id] = node;
			return acc;
		}, {});
	}

	let nodesById = getNodesById(nodes);

	let edges = [
		{ id: 1, from: '1', to: 'S', type: 'solid' }, // Top-left to Top
		{ id: 2, from: 'S', to: '3', type: 'solid' }, // Top to Top-right
		{ id: 3, from: '3', to: 'C', type: 'dashed' }, // Top-right to Bottom-right
		{ id: 4, from: 'C', to: 'B', type: 'solid' }, // Bottom-right to Bottom
		{ id: 5, from: 'B', to: 'A', type: 'solid' }, // Bottom to Bottom-left
		{ id: 6, from: 'A', to: '1', type: 'solid' }, // Bottom-left to Top-left
		{ id: 7, from: '4', to: '3', type: 'solid' }, // Center to Top-right
		{ id: 8, from: '4', to: 'C', type: 'solid' }, // Center to Bottom-right
		{ id: 9, from: '4', to: 'B', type: 'solid' }, // Center to Bottom
		{ id: 10, from: '4', to: 'A', type: 'solid' }, // Center to Bottom-left
		{ id: 11, from: '2', to: 'A', type: 'solid' }, // Top-left center to Bottom-left
		{ id: 12, from: '1', to: 'A', type: 'solid' }, // Top-left to Bottom-left
		{ id: 13, from: '1', to: '2', type: 'solid' }, // Top-left to Top-left center
		{ id: 14, from: '3', to: '2', type: 'solid' }, // Top-right to Top-left center
		{ id: 15, from: 'S', to: '2', type: 'solid' }, // Top to Top-left center
		{ id: 16, from: '2', to: '4', type: 'dashed' } // Top-left center to Center
	];
</script>

<section class="graph">
	{#each nodes as node (node.id)}
		<Node x={node.x} y={node.y} isObsticle={node.isObsticle} id={node.id} />
	{/each}
	{#each edges as edge (edge.id)}
		<Edge
			from={{ x1: nodesById[edge.from].x, y1: nodesById[edge.from].y }}
			to={{ x2: nodesById[edge.to].x, y2: nodesById[edge.to].y }}
			type={edge.type}
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
