// algorithms/aStarAlgorithm.js

import { nodeStates, edgeStates } from '../stores.js';
import { fixedEdges, fixedNodes } from '../graphStructure.js';
import { get } from 'svelte/store';
import { addLog } from '../logging.js';
import { delay } from '../utils.js';

export async function runAStar(startNodeId, goalNodeId, vehicleParams, animationMs) {
	let openSet = new Set([startNodeId]);
	let closedSet = new Set();

	// Initialize gScores and fScores
	let gScore = {};
	let fScore = {};

	gScore[startNodeId] = 0;
	fScore[startNodeId] = heuristicCostEstimate(startNodeId, goalNodeId);

	// Initialize cameFrom map
	let cameFrom = {};

	while (openSet.size > 0) {
		// Get the node in openSet with the lowest fScore value
		let currentNodeId = getLowestFScoreNode(openSet, fScore);

		// Mark node as 'visited'
		addLog(`Visiting node ${currentNodeId}`, 'info');
		nodeStates.update((states) => ({
			...states,
			[currentNodeId]: {
				...(states[currentNodeId] || {}),
				explState: 'visited',
			},
		}));

		await delay(animationMs);

		if (currentNodeId === goalNodeId) {
			addLog(`Reached goal node ${goalNodeId}`, 'success');
			await reconstructPath(cameFrom, currentNodeId, vehicleParams, animationMs);
			return;
		}

		openSet.delete(currentNodeId);
		closedSet.add(currentNodeId);

		const neighbors = getNeighbors(currentNodeId);
		for (const neighborId of neighbors) {
			if (closedSet.has(neighborId)) {
				continue; // Ignore the neighbor which is already evaluated
			}

			const tentativeGScore =
				gScore[currentNodeId] + distanceBetween(currentNodeId, neighborId);

			if (!openSet.has(neighborId)) {
				openSet.add(neighborId);
				// Mark neighbor as 'probed'
				nodeStates.update((states) => ({
					...states,
					[neighborId]: {
						...(states[neighborId] || {}),
						explState: 'probed',
					},
				}));
			} else if (tentativeGScore >= (gScore[neighborId] || Infinity)) {
				continue; // This is not a better path
			}

			// This path is the best until now. Record it!
			cameFrom[neighborId] = currentNodeId;
			gScore[neighborId] = tentativeGScore;
			fScore[neighborId] =
				gScore[neighborId] + heuristicCostEstimate(neighborId, goalNodeId);

			// Mark edge as 'probed'
			const edgeId = getEdgeId(currentNodeId, neighborId);
			edgeStates.update((states) => ({
				...states,
				[edgeId]: {
					...(states[edgeId] || {}),
					explState: 'probed',
				},
			}));

			await delay(animationMs);
		}
	}

	addLog('Goal not reachable from the start node.', 'error');
}

// Helper function to estimate the heuristic cost from a node to the goal
function heuristicCostEstimate(nodeId, goalNodeId) {
	const nodePosition = getNodePosition(nodeId);
	const goalPosition = getNodePosition(goalNodeId);
	const dx = nodePosition.x - goalPosition.x;
	const dy = nodePosition.y - goalPosition.y;
	return Math.sqrt(dx * dx + dy * dy);
}

// Helper function to calculate the actual distance between two connected nodes
function distanceBetween(nodeIdA, nodeIdB) {
	const nodeAPosition = getNodePosition(nodeIdA);
	const nodeBPosition = getNodePosition(nodeIdB);
	const dx = nodeAPosition.x - nodeBPosition.x;
	const dy = nodeAPosition.y - nodeBPosition.y;
	return Math.sqrt(dx * dx + dy * dy);
}

// Helper function to get the node in openSet with the lowest fScore
function getLowestFScoreNode(openSet, fScore) {
	let lowestNode = null;
	let lowestFScore = Infinity;
	for (let nodeId of openSet) {
		const score = fScore[nodeId] || Infinity;
		if (score < lowestFScore) {
			lowestFScore = score;
			lowestNode = nodeId;
		}
	}
	return lowestNode;
}

// Helper function to get neighbors of a node
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

// Helper function to get the position of a node
function getNodePosition(nodeId) {
	const node = fixedNodes.find((node) => node.id === nodeId);
	if (node && typeof node.x === 'number' && typeof node.y === 'number') {
		return { x: node.x, y: node.y };
	} else {
		throw new Error(`Position not found for node ${nodeId}`);
	}
}

// Helper function to get the edge ID between two nodes
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

// Helper function to mark nodes and edges as restricted
function markNodeAndEdgesRestricted(nodeId) {
	markNodeRestricted(nodeId);

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

// Helper function to mark a node as restricted
function markNodeRestricted(nodeId) {
	nodeStates.update((states) => ({
		...states,
		[nodeId]: {
			...(states[nodeId] || {}),
			explState: 'restricted',
		},
	}));
}

// Helper function to reconstruct and highlight the path
async function reconstructPath(cameFrom, currentNodeId, vehicleParams, animationMs) {
	let path = [currentNodeId];
	while (currentNodeId in cameFrom) {
		currentNodeId = cameFrom[currentNodeId];
		path.unshift(currentNodeId);
	}

	// Highlight the path
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
			const fromNodeId = path[i - 1];
			const toNodeId = nodeId;
			const edgeId = getEdgeId(fromNodeId, toNodeId);
			edgeStates.update((states) => ({
				...states,
				[edgeId]: {
					...(states[edgeId] || {}),
					explState: 'finished',
				},
			}));
		}
		await delay(animationMs);
	}

	// Calculate total traversal time
	let totalTime = 0;
	for (let i = 1; i < path.length; i++) {
		const fromNodeId = path[i - 1];
		const toNodeId = path[i];
		const edgeId = getEdgeId(fromNodeId, toNodeId);

		// Since edgeStates may not have 'type', default to 'solid'
		const edgeType = get(edgeStates)[edgeId]?.type || 'solid';

		const traversalTime =
			edgeType === 'barrier'
				? vehicleParams.timeWithBarrier
				: vehicleParams.timeToTraverse;

		totalTime += traversalTime;
	}

	addLog(`Total traversal time: ${totalTime} units`, 'success');
}
