import { nodeStates, edgeStates } from './stores.js';
import { get } from 'svelte/store';
import { fixedNodes, fixedEdges } from './graphStructure.js';

export function resetExplorationStates() {
	nodeStates.update((states) => {
		const newStates = {};
		for (const nodeId in states) {
			newStates[nodeId] = {
				...states[nodeId],
				explState: 'default'
			};
		}
		return newStates;
	});

	edgeStates.update((states) => {
		const newStates = {};
		for (const edgeId in states) {
			newStates[edgeId] = {
				...states[edgeId],
				explState: 'default'
			};
		}
		return newStates;
	});
}

// Helper function to set visibility based on mode
export function updateVisibility(mode) {
	nodeStates.update((states) => {
		fixedNodes.forEach((node) => {
			const isVisible = mode === 'interactive' || (mode === 'explore' && ['S'].includes(node.id));
			states[node.id] = {
				...(states[node.id] || {}),
				visibility: isVisible ? 'visible' : 'hidden'
			};
		});
		return states;
	});

	edgeStates.update((states) => {
		fixedEdges.forEach((edge) => {
			let isVisible =
				mode === 'interactive' || (mode === 'explore' && [1, 2, 14].includes(edge.id));
			if (get(edgeStates)[edge.id]?.type === 'dashed' && mode === 'explore') {
				isVisible = false;
			}
			states[edge.id] = {
				...(states[edge.id] || {}),
				visibility: isVisible ? 'visible' : 'hidden'
			};
		});
		return states;
	});
}

export function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to get a random subset of an array
function getRandomSubset(array, maxSize) {
	const size = Math.floor(Math.random() * (maxSize + 1));
	const shuffled = array.slice().sort(() => 0.5 - Math.random());
	return shuffled.slice(0, size);
}

// Helper function to build adjacency list from fixedEdges
function buildAdjacencyList(edges) {
	const adjacencyList = {};
	fixedNodes.forEach(node => {
		adjacencyList[node.id] = [];
	});

	edges.forEach(edge => {
		adjacencyList[edge.from].push({ neighborId: edge.to, edge });
		adjacencyList[edge.to].push({ neighborId: edge.from, edge });
	});

	return adjacencyList;
}

// Helper function to find a path from startNodeId to endNodeId
function findPathEdges(startNodeId, endNodeId) {
	const adjacencyList = buildAdjacencyList(fixedEdges);
	const visited = new Set();
	const queue = [{ nodeId: startNodeId, pathEdges: [] }];
	visited.add(startNodeId);

	while (queue.length > 0) {
		const { nodeId, pathEdges } = queue.shift();

		if (nodeId === endNodeId) {
			return pathEdges;
		}

		adjacencyList[nodeId].forEach(({ neighborId, edge }) => {
			if (!visited.has(neighborId)) {
				visited.add(neighborId);
				queue.push({
					nodeId: neighborId,
					pathEdges: [...pathEdges, edge]
				});
			}
		});
	}

	return null;
}

export function generateRandomGraph() {
	const endNodes = ['A', 'B', 'C'];
	const maxObstacles = 3;
	const maxNonSolidEdges = 6;

	let randomNodes = {};
	let randomEdges = {};

	// Step 1: Randomly select one end node to ensure a path exists
	const targetEndNode = endNodes[Math.floor(Math.random() * endNodes.length)];

	// Step 2: Find a path from 'S' to the targetEndNode
	const pathEdges = findPathEdges('S', targetEndNode);

	// If no path is found (which shouldn't happen), throw an error
	if (!pathEdges) throw new Error(`No path found from 'S' to '${targetEndNode}' in the fixed graph.`);

	// Collect nodes and edges in the path
	const pathNodeIds = new Set();
	const pathEdgeIds = new Set();
	pathEdges.forEach(edge => {
		pathEdgeIds.add(edge.id);
		pathNodeIds.add(edge.from);
		pathNodeIds.add(edge.to);
	});

	// Step 3: Randomly assign obstacles to other nodes (excluding 'S' and path nodes)
	const allNodeIds = fixedNodes.map(node => node.id);
	const nonPathNodeIds = allNodeIds.filter(id => id !== 'S' && !pathNodeIds.has(id));

	const obstacleNodeIds = getRandomSubset(nonPathNodeIds, Math.min(maxObstacles, nonPathNodeIds.length));

	allNodeIds.forEach(nodeId => {
		const isObstacle = obstacleNodeIds.includes(nodeId);
		randomNodes[nodeId] = {
			isObstacle,
			explState: 'default',
			visibility: 'visible'
		};
	});

	// Step 4: Randomly assign edge types to other edges (excluding path edges)
	const allEdgeIds = fixedEdges.map(edge => edge.id);
	const nonPathEdgeIds = allEdgeIds.filter(id => !pathEdgeIds.has(id));

	const maxEdgesToChange = Math.min(maxNonSolidEdges, nonPathEdgeIds.length);
	const edgesToChangeIds = getRandomSubset(nonPathEdgeIds, maxEdgesToChange);

	fixedEdges.forEach(edge => {
		let type = 'solid';
		let traversable = true;

		if (pathEdgeIds.has(edge.id)) {
			// Edges in the path remain solid and traversable
			type = 'solid';
		} else if (edgesToChangeIds.includes(edge.id)) {
			// Randomly assign 'dashed' or 'barrier' to non-path edges
			type = Math.random() < 0.5 ? 'dashed' : 'barrier';
			traversable = type !== 'barrier';
		}

		randomEdges[edge.id] = {
			type,
			explState: 'default',
			visibility: 'visible',
			traversable
		};
	});

	// Step 5: Verify that the total number of 'dashed' or 'barrier' edges does not exceed 6
	const nonSolidEdgeCount = Object.values(randomEdges).filter(
		edge => edge.type === 'dashed' || edge.type === 'barrier'
	).length;

	if (nonSolidEdgeCount > maxNonSolidEdges) {
		// If the count exceeds the limit, regenerate the graph
		return generateRandomGraph();
	}

	// Step 6: Ensure that the path from 'S' to the selected end node is valid
	if (!hasValidPath(randomNodes, randomEdges, 'S', targetEndNode)) {
		// If the path is invalid due to obstacles, regenerate the graph
		return generateRandomGraph();
	}

	return { randomNodes, randomEdges };
}

// Function to check if a valid path exists between two nodes
function hasValidPath(randomNodes, randomEdges, startNodeId, endNodeId) {
	const adjacencyList = {};
	Object.keys(randomNodes).forEach(nodeId => {
		adjacencyList[nodeId] = [];
	});

	fixedEdges.forEach(edge => {
		const edgeState = randomEdges[edge.id];
		if (edgeState.traversable) {
			const fromNodeState = randomNodes[edge.from];
			const toNodeState = randomNodes[edge.to];

			if (!fromNodeState.isObstacle && !toNodeState.isObstacle) {
				adjacencyList[edge.from].push(edge.to);
				adjacencyList[edge.to].push(edge.from);
			}
		}
	});

	const visited = new Set();
	const queue = [startNodeId];
	visited.add(startNodeId);

	while (queue.length > 0) {
		const currentNode = queue.shift();

		if (currentNode === endNodeId) {
			return true;
		}

		adjacencyList[currentNode].forEach(neighbor => {
			if (!visited.has(neighbor)) {
				visited.add(neighbor);
				queue.push(neighbor);
			}
		});
	}

	return false;
}
