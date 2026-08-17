import { get } from 'svelte/store';
import { fixedEdges, fixedNodes } from '../graphStructure.js';
import { edgeStates, nodeStates } from '../stores.js';

/**
 * Shared geometry and cost helpers for the map-aware algorithms.
 *
 * The algorithms optimise *time*, because time is what the simulator reports
 * and what the vehicle actually cares about. Geometric distance is only used
 * to derive an admissible heuristic.
 */

export function getNodePosition(nodeId) {
	const node = fixedNodes.find((candidate) => candidate.id === nodeId);
	if (!node || typeof node.x !== 'number' || typeof node.y !== 'number') {
		throw new Error(`Position not found for node ${nodeId}`);
	}
	return { x: node.x, y: node.y };
}

export function distanceBetween(nodeIdA, nodeIdB) {
	const posA = getNodePosition(nodeIdA);
	const posB = getNodePosition(nodeIdB);
	const dx = posA.x - posB.x;
	const dy = posA.y - posB.y;
	return Math.sqrt(dx * dx + dy * dy);
}

export function getEdgeId(fromId, toId) {
	const edge = fixedEdges.find(
		(candidate) =>
			(candidate.from === fromId && candidate.to === toId) ||
			(candidate.from === toId && candidate.to === fromId)
	);
	return edge ? edge.id : null;
}

/** Longest edge on the fixed track, used to scale the heuristic. */
const longestEdgeLength = Math.max(
	...fixedEdges.map((edge) => distanceBetween(edge.from, edge.to))
);

/**
 * True when an edge cannot be driven at all: it is missing from the map, or
 * one of its endpoints is occupied by an obstacle.
 *
 * A barrier does NOT block an edge — it only makes it more expensive.
 */
export function isEdgeBlocked(nodeIdA, nodeIdB) {
	const edgeId = getEdgeId(nodeIdA, nodeIdB);
	if (edgeId === null) return true;

	if (get(edgeStates)[edgeId]?.type === 'dashed') return true;

	const states = get(nodeStates);
	return Boolean(states[nodeIdA]?.isObstacle || states[nodeIdB]?.isObstacle);
}

/**
 * Simulated time to drive from one node to an adjacent one, or Infinity if
 * the edge cannot be driven.
 */
export function edgeCost(nodeIdA, nodeIdB, vehicleParams) {
	if (isEdgeBlocked(nodeIdA, nodeIdB)) return Infinity;

	const edgeId = getEdgeId(nodeIdA, nodeIdB);
	return get(edgeStates)[edgeId]?.type === 'barrier'
		? vehicleParams.timeWithBarrier
		: vehicleParams.timeToTraverse;
}

/**
 * Admissible and consistent time heuristic.
 *
 * Covering a straight-line distance d needs at least d / longestEdgeLength
 * edges, and no edge is cheaper than the cheapest edge type. Scaling the
 * Euclidean distance by that ratio therefore never overestimates the true
 * remaining time, and it satisfies the triangle inequality — which is what
 * A* needs to stay optimal while using a closed set.
 */
export function heuristicTime(nodeId, goalNodeId, vehicleParams) {
	const cheapestEdge = Math.min(vehicleParams.timeToTraverse, vehicleParams.timeWithBarrier);
	const scale = cheapestEdge / longestEdgeLength;
	return distanceBetween(nodeId, goalNodeId) * scale;
}

/** Neighbours reachable from a node, ignoring blocked edges and obstacles. */
export function getNeighbors(nodeId) {
	const neighbors = [];
	for (const edge of fixedEdges) {
		let neighborId = null;
		if (edge.from === nodeId) neighborId = edge.to;
		else if (edge.to === nodeId) neighborId = edge.from;

		if (neighborId !== null && !isEdgeBlocked(nodeId, neighborId)) {
			neighbors.push(neighborId);
		}
	}
	return neighbors;
}

/** Total simulated driving time along a node path. */
export function totalTraversalTime(path, vehicleParams) {
	let total = 0;
	for (let i = 1; i < path.length; i++) {
		total += edgeCost(path[i - 1], path[i], vehicleParams);
	}
	return total;
}
