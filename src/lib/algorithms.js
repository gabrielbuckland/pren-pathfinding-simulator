import { nodeStates, edgeStates, algorithmLogs } from './stores.js';
import { fixedEdges, fixedNodes } from './graphStructure.js';
import { get } from 'svelte/store';
import { addLog } from './logging.js';
import { delay } from './utils.js';
import { runAStar } from './algorithms/aStar.js';
import { runDStarLite } from './algorithms/dStarLite.js';
import { runDijkstra } from './algorithms/dijkstra.js';
import { GraphExplorer } from './graphExplorer.js';

export async function simulateMapExploration() {
	algorithmLogs.set([]);
	await exploreMap();
}

export async function runAlgorithm(
	algorithmName,
	startNodeId,
	endpoint,
	vehicleParams,
	animationMs
) {
	algorithmLogs.set([]);

	const algorithms = {
		Dijkstra: runDijkstraAlgorithm,
		'A*': runAStarAlgorithm,
		'D*Lite': runDStarLiteAlgorithm,
		Simulation: runSimulationAlgorithm
	};

	const algorithm = algorithms[algorithmName];

	if (!algorithm) {
		throw new Error(`Algorithm ${algorithmName} not found`);
	}

	addLog(`Starting ${algorithmName} from ${startNodeId} to ${endpoint}`, 'info');
	await algorithm(startNodeId, endpoint, vehicleParams, animationMs);
}

async function runDijkstraAlgorithm(startNodeId, goalNodeId, vehicleParams, animationMs) {
	//await simulateAlgorithm(startNodeId, goalNodeId, vehicleParams, animationMs);
	await runDijkstra(startNodeId, goalNodeId, vehicleParams, animationMs);
}

async function runAStarAlgorithm(startNodeId, goalNodeId, vehicleParams, animationMs) {
	//await simulateAlgorithm(startNodeId, goalNodeId, vehicleParams, animationMs);
	await runAStar(startNodeId, goalNodeId, vehicleParams, animationMs);
}

async function runDStarLiteAlgorithm(startNodeId, goalNodeId, vehicleParams, animationMs) {
	//await simulateAlgorithm(startNodeId, goalNodeId, vehicleParams, animationMs);
	await runDStarLite(startNodeId, goalNodeId, vehicleParams, animationMs);
}

async function runSimulationAlgorithm(startNodeId, goalNodeId, vehicleParams, animationMs) {
	await simulateAlgorithm(startNodeId, goalNodeId, vehicleParams, animationMs);
}

async function exploreMap() {
	const graphExplorer = new GraphExplorer('S', 200);
	await graphExplorer.explore();
}

async function simulateAlgorithm(startNodeId, goalNodeId, vehicleParams, animationMs) {
	let queue = [startNodeId];
	let visitedNodes = new Set();
	let cameFrom = {};

	// Mark start node as 'probed'
	nodeStates.update((states) => ({
		...states,
		[startNodeId]: {
			...(states[startNodeId] || {}),
			explState: 'probed'
		}
	}));

	while (queue.length > 0) {
		const currentNodeId = queue.shift();

		// Mark edge from parent to current node as 'visited'
		if (cameFrom[currentNodeId]) {
			const parentId = cameFrom[currentNodeId];
			const edgeId = getEdgeId(parentId, currentNodeId);

			addLog(`Visiting edge ${edgeId} from node ${parentId} to node ${currentNodeId}`, 'info');
			edgeStates.update((states) => ({
				...states,
				[edgeId]: {
					...(states[edgeId] || {}),
					explState: 'visited'
				}
			}));
		}

		// Mark node as 'visited'
		addLog(`Visiting node ${currentNodeId}`, 'info');
		nodeStates.update((states) => ({
			...states,
			[currentNodeId]: {
				...(states[currentNodeId] || {}),
				explState: 'visited'
			}
		}));
		visitedNodes.add(currentNodeId);

		await delay(animationMs);

		if (currentNodeId === goalNodeId) {
			addLog(`Reached goal node ${goalNodeId}`, 'success');

			// Mark goal node as 'finished'
			nodeStates.update((states) => ({
				...states,
				[currentNodeId]: {
					...(states[currentNodeId] || {}),
					explState: 'finished'
				}
			}));

			await highlightPath(cameFrom, currentNodeId, vehicleParams);
			return;
		}

		const neighbors = getNeighbors(currentNodeId);
		for (const neighborId of neighbors) {
			const neighborState = get(nodeStates)[neighborId];
			const neighborExplState = neighborState?.explState;

			addLog(`Probing neighbor node ${neighborId} from ${currentNodeId}`, 'info');

			if (
				!visitedNodes.has(neighborId) &&
				neighborExplState !== 'probed' &&
				neighborExplState !== 'restricted'
			) {
				// Mark neighbor as 'probed'
				nodeStates.update((states) => ({
					...states,
					[neighborId]: {
						...(states[neighborId] || {}),
						explState: 'probed'
					}
				}));

				// Mark edge as 'probed'
				const edgeId = getEdgeId(currentNodeId, neighborId);
				edgeStates.update((states) => ({
					...states,
					[edgeId]: {
						...(states[edgeId] || {}),
						explState: 'probed'
					}
				}));

				queue.push(neighborId);
				cameFrom[neighborId] = currentNodeId;

				await delay(animationMs);
			}
		}
	}

	addLog('Goal not reachable from the start node.', 'error');
}

function getNeighbors(nodeId) {
	const neighbors = [];
	const currentEdgeStates = get(edgeStates);
	const currentNodeStates = get(nodeStates);

	for (const edge of fixedEdges) {
		const isDashed = currentEdgeStates[edge.id]?.type === 'dashed';
		if (isDashed) continue;

		let neighborId = null;
		if (edge.from === nodeId) {
			neighborId = edge.to;
		} else if (edge.to === nodeId) {
			neighborId = edge.from;
		}

		if (neighborId) {
			const isObstacle = currentNodeStates[neighborId]?.isObstacle;
			if (isObstacle) {
				markNodeAndEdgesRestricted(neighborId);
				continue;
			}

			neighbors.push(neighborId);
		}
	}
	return neighbors;
}

function markEdgeRestriced(edgeId) {
	edgeStates.update((states) => ({
		...states,
		[edgeId]: {
			...(states[edgeId] || {}),
			explState: 'restricted'
		}
	}));
}

function markNodeRestricted(nodeId) {
	nodeStates.update((states) => ({
		...states,
		[nodeId]: {
			...(states[nodeId] || {}),
			explState: 'restricted'
		}
	}));
}

function markNodeAndEdgesRestricted(nodeId) {
	markNodeRestricted(nodeId);

	const connectedEdges = fixedEdges.filter((edge) => edge.from === nodeId || edge.to === nodeId);

	edgeStates.update((states) => {
		const newStates = { ...states };
		for (const edge of connectedEdges) {
			newStates[edge.id] = {
				...(newStates[edge.id] || {}),
				explState: 'restricted'
			};
		}
		return newStates;
	});
}

function getEdgeId(fromId, toId) {
	for (const edge of fixedEdges) {
		if ((edge.from === fromId && edge.to === toId) || (edge.from === toId && edge.to === fromId)) {
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

		/*
		nodeStates.update((states) => ({
			...states,
			[currentNodeId]: {
				...(states[currentNodeId] || {}),
				explState: 'finished',
			},
		}));

		const edgeId = getEdgeId(currentNodeId, path[1]);
		edgeStates.update((states) => ({
			...states,
			[edgeId]: {
				...(states[edgeId] || {}),
				explState: 'finished',
			},
		}));
*/
	}

	let totalTime = 0;

	for (let i = 1; i < path.length; i++) {
		const fromNodeId = path[i - 1];
		const toNodeId = path[i];
		const edgeId = getEdgeId(fromNodeId, toNodeId);
		const edgeState = get(edgeStates)[edgeId];
		const traversalTime =
			edgeState.type === 'barrier' ? vehicleParams.timeWithBarrier : vehicleParams.timeToTraverse;
		totalTime += traversalTime;
	}

	addLog(`Total traversal time: ${totalTime} units`, 'success');
}
