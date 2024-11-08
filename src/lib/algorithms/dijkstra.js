// algorithms/dijkstraAlgorithm.js

import { nodeStates, edgeStates } from '../stores.js';
import { fixedEdges, fixedNodes } from '../graphStructure.js';
import { get } from 'svelte/store';
import { addLog } from '../logging.js';
import { delay } from '../utils.js';

export async function runDijkstra(
	startNodeId,
	goalNodeId,
	vehicleParams,
	animationMs
) {
	const distances = {};
	const previous = {};
	const visited = new Set();
	const unvisited = new Set(fixedNodes.map((node) => node.id));

	for (const node of fixedNodes) {
		distances[node.id] = Infinity;
	}
	distances[startNodeId] = 0;

	while (unvisited.size > 0) {
		// Get the unvisited node with the smallest distance
		let currentNodeId = null;
		let smallestDistance = Infinity;
		for (const nodeId of unvisited) {
			if (distances[nodeId] < smallestDistance) {
				smallestDistance = distances[nodeId];
				currentNodeId = nodeId;
			}
		}

		if (currentNodeId === null) {
			break; // No reachable nodes remaining
		}

		unvisited.delete(currentNodeId);
		visited.add(currentNodeId);

		// Visual updates
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
			await reconstructPath(previous, currentNodeId, vehicleParams, animationMs);
			return;
		}

		const neighbors = getNeighbors(currentNodeId);
		for (const neighborId of neighbors) {
			if (visited.has(neighborId)) {
				continue;
			}

			const edgeId = getEdgeId(currentNodeId, neighborId);
			const altDistance =
				distances[currentNodeId] + distanceBetween(currentNodeId, neighborId);

			if (altDistance < distances[neighborId]) {
				distances[neighborId] = altDistance;
				previous[neighborId] = currentNodeId;

				// Visual updates
				nodeStates.update((states) => ({
					...states,
					[neighborId]: {
						...(states[neighborId] || {}),
						explState: 'probed',
					},
				}));
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
	}

	addLog('No path found.', 'error');
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

function distanceBetween(nodeIdA, nodeIdB) {
	const posA = getNodePosition(nodeIdA);
	const posB = getNodePosition(nodeIdB);
	const dx = posA.x - posB.x;
	const dy = posA.y - posB.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function getNodePosition(nodeId) {
	const node = fixedNodes.find((node) => node.id === nodeId);
	if (node && typeof node.x === 'number' && typeof node.y === 'number') {
		return { x: node.x, y: node.y };
	} else {
		throw new Error(`Position not found for node ${nodeId}`);
	}
}

async function reconstructPath(previous, currentNodeId, vehicleParams, animationMs) {
	const path = [];
	while (currentNodeId) {
		path.unshift(currentNodeId);
		currentNodeId = previous[currentNodeId];
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
		const edgeType = get(edgeStates)[edgeId]?.type || 'solid';

		const traversalTime =
			edgeType === 'barrier'
				? vehicleParams.timeWithBarrier
				: vehicleParams.timeToTraverse;

		totalTime += traversalTime;
	}

	addLog(`Total traversal time: ${totalTime} units`, 'success');
}

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

function markNodeRestricted(nodeId) {
	nodeStates.update((states) => ({
		...states,
		[nodeId]: {
			...(states[nodeId] || {}),
			explState: 'restricted',
		},
	}));
}
