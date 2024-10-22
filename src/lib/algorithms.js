import { nodeStates, edgeStates } from './stores.js';
import { fixedEdges } from './graphStructure.js';
import { get } from 'svelte/store';

export async function runAlgorithm(algorithmName, startNodeId, endpoint, vehicleParams) {
	console.log('Running algorithm:', algorithmName);

	const algorithms = {
		'A*': runAStarAlgorithm,
		'D*': runDStarAlgorithm,
		'D*Lite': runDStarLiteAlgorithm,
	};

	const algorithm = algorithms[algorithmName];

	if (!algorithm) {
		throw new Error(`Algorithm ${algorithmName} not found`);
	}

	await algorithm(startNodeId, endpoint, vehicleParams);
}

async function runAStarAlgorithm(startNodeId, goalNodeId, vehicleParams) {
	console.log(`Running A* algorithm from ${startNodeId} to ${goalNodeId}`);
	await simulateAlgorithm(startNodeId, goalNodeId, vehicleParams);
}

async function runDStarAlgorithm(startNodeId, goalNodeId, vehicleParams) {
	console.log(`Running D* algorithm from ${startNodeId} to ${goalNodeId}`);
	await simulateAlgorithm(startNodeId, goalNodeId, vehicleParams);
}

async function runDStarLiteAlgorithm(startNodeId, goalNodeId, vehicleParams) {
	console.log(`Running D*Lite algorithm from ${startNodeId} to ${goalNodeId}`);
	await simulateAlgorithm(startNodeId, goalNodeId, vehicleParams);
}

async function simulateAlgorithm(startNodeId, goalNodeId, vehicleParams) {
	let queue = [startNodeId];
	let visitedNodes = new Set();
	visitedNodes.add(startNodeId); // Mark start node as visited
	let cameFrom = {};

	while (queue.length > 0) {
		const currentNodeId = queue.shift();

		// Update node state to 'visited'
		nodeStates.update((states) => ({
			...states,
			[currentNodeId]: {
				...(states[currentNodeId] || {}),
				explState: 'visited',
			},
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
						explState: 'probed',
					},
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

function getNeighbors(nodeId) {
	const neighbors = [];
	const currentEdgeStates = get(edgeStates);
	const currentNodeStates = get(nodeStates);

	for (const edge of fixedEdges) {
		const isDashed = currentEdgeStates[edge.id]?.type === 'dashed';
		if (isDashed) {
			// Edge is dashed, cannot traverse
			continue;
		}

		if (edge.from === nodeId) {
			const neighborId = edge.to;
			const isObstacle = currentNodeStates[neighborId]?.isObstacle;
			if (!isObstacle) {
				neighbors.push(neighborId);
			} else {
				// Mark edges from obstacle nodes as restricted
				markEdgesFromObstacleNode(neighborId);
			}
		} else if (edge.to === nodeId) {
			const neighborId = edge.from;
			const isObstacle = currentNodeStates[neighborId]?.isObstacle;
			if (!isObstacle) {
				neighbors.push(neighborId);
			} else {
				// Mark edges from obstacle nodes as restricted
				markEdgesFromObstacleNode(neighborId);
			}
		}
	}
	return neighbors;
}

function markEdgesFromObstacleNode(nodeId) {
	const connectedEdges = fixedEdges.filter(
		(edge) => edge.from === nodeId || edge.to === nodeId
	);

	edgeStates.update((states) => {
		const newStates = { ...states };
		for (const edge of connectedEdges) {
			newStates[edge.id] = {
				...(newStates[edge.id] || {}),
				explState: 'restricted',
			};
		}
		return newStates;
	});
}

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

async function highlightPath(cameFrom, currentNodeId, vehicleParams) {
	let path = [currentNodeId];
	while (currentNodeId in cameFrom) {
		currentNodeId = cameFrom[currentNodeId];
		path.unshift(currentNodeId);
	}

	// Calculate total traversal time
	let totalTime = 0;

	for (let i = 0; i < path.length; i++) {
		const nodeId = path[i];
		nodeStates.update((states) => ({
			...states,
			[nodeId]: {
				...(states[nodeId] || {}),
				explState: 'finished',
			},
		}));

		if (i > 0) {
			const edgeId = getEdgeId(path[i - 1], nodeId);
			const edgeState = get(edgeStates)[edgeId];
			const traversalTime =
				edgeState.type === 'barrier'
					? vehicleParams.timeWithBarrier
					: vehicleParams.timeToTraverse;
			totalTime += traversalTime;

			edgeStates.update((states) => ({
				...states,
				[edgeId]: {
					...(states[edgeId] || {}),
					explState: 'finished',
				},
			}));
		}

		await delay(250);
	}

	console.log(`Total traversal time: ${totalTime} units`);
}
