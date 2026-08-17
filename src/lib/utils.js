import { nodeStates, edgeStates } from './stores.js';
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

// Edges leaving the start node 'S', the only ones visible when exploration begins.
const START_EDGE_IDS = [1, 2, 14];

/**
 * Shows the whole map, or only the start node and the sections leading out of
 * it so an exploring run can uncover the rest as it drives.
 *
 * Which of the two applies is a property of the algorithm, not of the run
 * mode: only the exploring vehicle lacks a map to begin with. Showing a
 * partial map to Dijkstra would misrepresent what it knows.
 *
 * Builds new state objects rather than writing in place: resetGraph() puts the
 * shared default objects into the stores by reference, so an in-place write
 * would permanently corrupt those defaults.
 */
export function updateVisibility(reveal) {
	const showAll = reveal !== 'start-only';

	nodeStates.update((states) => {
		const newStates = { ...states };
		for (const node of fixedNodes) {
			const isVisible = showAll || node.id === 'S';
			newStates[node.id] = {
				...(newStates[node.id] || {}),
				visibility: isVisible ? 'visible' : 'hidden'
			};
		}
		return newStates;
	});

	edgeStates.update((states) => {
		const newStates = { ...states };
		for (const edge of fixedEdges) {
			const isStartEdge = START_EDGE_IDS.includes(edge.id);
			const isMissing = newStates[edge.id]?.type === 'dashed';
			const isVisible = showAll || (isStartEdge && !isMissing);

			newStates[edge.id] = {
				...(newStates[edge.id] || {}),
				visibility: isVisible ? 'visible' : 'hidden'
			};
		}
		return newStates;
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
	fixedNodes.forEach((node) => {
		adjacencyList[node.id] = [];
	});

	edges.forEach((edge) => {
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

export function generateRandomGraph(randomNodeId = 'A') {
	const maxObstacles = 3;
	const maxNonSolidEdges = 6;

	let randomNodes = {};
	let randomEdges = {};

	// Step 2: Find a path from 'S' to the randomNodeId
	const pathEdges = findPathEdges('S', randomNodeId);

	// If no path is found (which shouldn't happen), throw an error
	if (!pathEdges)
		throw new Error(`No path found from 'S' to '${randomNodeId}' in the fixed graph.`);

	// Collect nodes and edges in the path
	const pathNodeIds = new Set();
	const pathEdgeIds = new Set();
	pathEdges.forEach((edge) => {
		pathEdgeIds.add(edge.id);
		pathNodeIds.add(edge.from);
		pathNodeIds.add(edge.to);
	});

	// Step 3: Randomly assign obstacles to other nodes (excluding 'S' and path nodes)
	const allNodeIds = fixedNodes.map((node) => node.id);
	const nonPathNodeIds = allNodeIds.filter((id) => id !== 'S' && !pathNodeIds.has(id));

	const obstacleNodeIds = getRandomSubset(
		nonPathNodeIds,
		Math.min(maxObstacles, nonPathNodeIds.length)
	);

	allNodeIds.forEach((nodeId) => {
		const isObstacle = obstacleNodeIds.includes(nodeId);
		randomNodes[nodeId] = {
			isObstacle,
			explState: 'default',
			visibility: 'visible'
		};
	});

	// Step 4: Randomly assign edge types to other edges (excluding path edges)
	const allEdgeIds = fixedEdges.map((edge) => edge.id);
	const nonPathEdgeIds = allEdgeIds.filter((id) => !pathEdgeIds.has(id));

	const maxEdgesToChange = Math.min(maxNonSolidEdges, nonPathEdgeIds.length);
	const edgesToChangeIds = getRandomSubset(nonPathEdgeIds, maxEdgesToChange);

	fixedEdges.forEach((edge) => {
		let type = 'solid';

		if (!pathEdgeIds.has(edge.id) && edgesToChangeIds.includes(edge.id)) {
			// Non-path edges may be removed or carry a barrier. Path edges stay
			// clear, which is what guarantees a route to the goal.
			type = Math.random() < 0.5 ? 'dashed' : 'barrier';
		}

		randomEdges[edge.id] = {
			type,
			explState: 'default',
			visibility: 'visible'
		};
	});

	// Step 5: Verify that the total number of 'dashed' or 'barrier' edges does not exceed 6
	const nonSolidEdgeCount = Object.values(randomEdges).filter(
		(edge) => edge.type === 'dashed' || edge.type === 'barrier'
	).length;

	if (nonSolidEdgeCount > maxNonSolidEdges) {
		// If the count exceeds the limit, regenerate for the same goal
		return generateRandomGraph(randomNodeId);
	}

	// Step 6: Ensure that the path from 'S' to the selected end node is valid
	if (!isReachable(randomNodes, randomEdges, 'S', randomNodeId)) {
		// If the path is invalid due to obstacles, regenerate for the same goal
		return generateRandomGraph(randomNodeId);
	}

	return { randomNodes, randomEdges };
}

/**
 * Whether `goalNodeId` can be driven to from `startNodeId`.
 *
 * Uses the same rules as every algorithm in the simulator: a removed edge
 * ('dashed') blocks the way, a node carrying a pylon blocks the way, and a
 * barrier does not. It only costs more time.
 */
export function isReachable(nodes, edges, startNodeId, goalNodeId) {
	if (nodes[startNodeId]?.isObstacle || nodes[goalNodeId]?.isObstacle) return false;

	const adjacency = {};
	for (const node of fixedNodes) adjacency[node.id] = [];

	for (const edge of fixedEdges) {
		if (edges[edge.id]?.type === 'dashed') continue;
		if (nodes[edge.from]?.isObstacle || nodes[edge.to]?.isObstacle) continue;
		adjacency[edge.from].push(edge.to);
		adjacency[edge.to].push(edge.from);
	}

	const seen = new Set([startNodeId]);
	const queue = [startNodeId];
	while (queue.length > 0) {
		const current = queue.shift();
		if (current === goalNodeId) return true;
		for (const neighbor of adjacency[current]) {
			if (!seen.has(neighbor)) {
				seen.add(neighbor);
				queue.push(neighbor);
			}
		}
	}

	return false;
}

export function getRandomGoalNode() {
	const goalNodes = ['A', 'B', 'C'];
	return goalNodes[Math.floor(Math.random() * goalNodes.length)];
}
