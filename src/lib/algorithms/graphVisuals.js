import { get } from 'svelte/store';
import { fixedEdges } from '../graphStructure.js';
import { edgeStates, nodeStates } from '../stores.js';
import { addLog } from '../logging.js';
import { delay } from '../utils.js';
import { getEdgeId, totalTraversalTime } from './graphCosts.js';

/**
 * Shared store updates that drive the graph visualisation. Keeping these in
 * one place means every algorithm animates identically.
 */

export function markNode(nodeId, explState) {
	nodeStates.update((states) => ({
		...states,
		[nodeId]: { ...(states[nodeId] || {}), explState }
	}));
}

export function markEdge(edgeId, explState) {
	if (edgeId === null) return;
	edgeStates.update((states) => ({
		...states,
		[edgeId]: { ...(states[edgeId] || {}), explState }
	}));
}

export function markNodeAndEdgesRestricted(nodeId) {
	markNode(nodeId, 'restricted');

	const connectedEdges = fixedEdges.filter((edge) => edge.from === nodeId || edge.to === nodeId);

	edgeStates.update((states) => {
		const newStates = { ...states };
		for (const edge of connectedEdges) {
			newStates[edge.id] = { ...(newStates[edge.id] || {}), explState: 'restricted' };
		}
		return newStates;
	});
}

/** Flags neighbouring obstacle nodes so the user sees why they were skipped. */
export function markObstacleNeighbors(nodeId) {
	const states = get(nodeStates);
	for (const edge of fixedEdges) {
		let neighborId = null;
		if (edge.from === nodeId) neighborId = edge.to;
		else if (edge.to === nodeId) neighborId = edge.from;

		if (neighborId !== null && states[neighborId]?.isObstacle) {
			markNodeAndEdgesRestricted(neighborId);
		}
	}
}

/** Walks the final path, highlights it, and reports its simulated time. */
export async function highlightPath(path, vehicleParams, animationMs) {
	for (let i = 0; i < path.length; i++) {
		markNode(path[i], 'finished');
		if (i > 0) {
			markEdge(getEdgeId(path[i - 1], path[i]), 'finished');
		}
		await delay(animationMs);
	}

	addLog(`Total traversal time: ${totalTraversalTime(path, vehicleParams)} units`, 'success');
}
