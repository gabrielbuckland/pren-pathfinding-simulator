import { nodeStates, edgeStates } from './stores.js';
import { fixedEdges } from './graphStructure.js';

export async function runAlgorithm(algorithmName, endpoint, vehicleParams) {
	console.log('Running algorithm:', algorithmName);

	const algorithms = {
		'A*': runAStarAlgorithm,
		'D*': runDStarAlgorithm,
		'D*Lite': runDStarLiteAlgorithm
	};

	const algorithm = algorithms[algorithmName];

	if (!algorithm) {
		throw new Error(`Algorithm ${algorithmName} not found`);
	}

	await algorithm(endpoint, vehicleParams);
}

async function runAStarAlgorithm(endpoint, vehicleParams) {
	console.log('Running A* algorithm with endpoint:', endpoint);
	await simulateAlgorithm(endpoint, vehicleParams);
}

async function runDStarAlgorithm(endpoint, vehicleParams) {
	console.log('Running D* algorithm with endpoint:', endpoint);
	await simulateAlgorithm(endpoint, vehicleParams);
}

async function runDStarLiteAlgorithm(endpoint, vehicleParams) {
	console.log('Running D* Lite algorithm with endpoint:', endpoint);
	await simulateAlgorithm(endpoint, vehicleParams);
}

async function simulateAlgorithm(endpoint, vehicleParams) {
	const startNodeId = 'S';
	const goalNodeId = endpoint;

	let queue = [startNodeId];
	let visitedNodes = new Set();
	let cameFrom = {};

	while (queue.length > 0) {
		const currentNodeId = queue.shift();
		visitedNodes.add(currentNodeId);

		// Mark node as visited
		nodeStates.update((states) => ({
			...states,
			[currentNodeId]: {
				...(states[currentNodeId] || {}),
				explState: 'visited'
			}
		}));

		await delay(250);

		if (currentNodeId === goalNodeId) {
			await highlightPath(cameFrom, currentNodeId, vehicleParams);
			return;
		}

		const neighbors = getNeighbors(currentNodeId);
		for (const neighborId of neighbors) {
			if (!visitedNodes.has(neighborId)) {
				visitedNodes.add(neighborId);
				queue.push(neighborId);
				cameFrom[neighborId] = currentNodeId;

				const edgeId = getEdgeId(currentNodeId, neighborId);
				edgeStates.update((states) => ({
					...states,
					[edgeId]: {
						...(states[edgeId] || {}),
						explState: 'probed'
					}
				}));

				await delay(250);
			}
		}
	}

	console.log('Goal not reachable from the start node.');
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to get neighbors of a node
function getNeighbors(nodeId) {
	const neighbors = [];
	for (const edge of fixedEdges) {
		if (edge.from === nodeId) {
			neighbors.push(edge.to);
		} else if (edge.to === nodeId) {
			neighbors.push(edge.from);
		}
	}
	return neighbors;
}

// Helper function to get edge ID between two nodes
function getEdgeId(fromId, toId) {
	for (const edge of fixedEdges) {
		if (
			(edge.from === fromId && edge.to === toId) ||
			(edge.from === toId && edge.to === fromId)
		) {
			return edge.id;
		}
	}
	return null;
}

async function highlightPath(cameFrom, currentNodeId) {
	let path = [currentNodeId];
	while (currentNodeId in cameFrom) {
		currentNodeId = cameFrom[currentNodeId];
		path.unshift(currentNodeId);
	}

	for (let i = 0; i < path.length; i++) {
		const nodeId = path[i];
		nodeStates.update(states => {
			return {
				...states,
				[nodeId]: {
					...(states[nodeId] || {}),
					explState: 'finished'
				}
			};
		});

		if (i > 0) {
			const edgeId = getEdgeId(path[i - 1], nodeId);
			edgeStates.update(states => {
				return {
					...states,
					[edgeId]: {
						...(states[edgeId] || {}),
						explState: 'finished'
					}
				};
			});
		}

		await delay(250);
	}
}
