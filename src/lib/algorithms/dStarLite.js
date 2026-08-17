import { fixedNodes } from '../graphStructure.js';
import { addLog } from '../logging.js';
import { delay } from '../utils.js';
import { edgeCost, getNeighbors, heuristicTime } from './graphCosts.js';
import { highlightPath, markNode } from './graphVisuals.js';

/**
 * D* Lite's shortest-path computation, minimising simulated driving time.
 *
 * NOTE: only the ComputeShortestPath half of D* Lite is implemented. There is
 * no outer replanning loop and no km accumulation, so this currently behaves
 * like a backwards search rather than an incremental one. See the "Known
 * limitations" section of the README.
 */
class PriorityQueue {
	constructor() {
		this.elements = [];
	}

	isEmpty() {
		return this.elements.length === 0;
	}

	enqueue(item, priority) {
		this.remove(item);
		this.elements.push({ item, priority });
		this.elements.sort((a, b) =>
			a.priority[0] !== b.priority[0]
				? a.priority[0] - b.priority[0]
				: a.priority[1] - b.priority[1]
		);
	}

	dequeue() {
		return this.elements.shift();
	}

	remove(item) {
		this.elements = this.elements.filter((element) => element.item !== item);
	}
}

export async function runDStarLite(startNodeId, goalNodeId, vehicleParams, animationMs) {
	const rhs = {};
	const g = {};
	const U = new PriorityQueue();
	const km = 0;

	const calculateKey = (nodeId) => {
		const minScore = Math.min(g[nodeId], rhs[nodeId]);
		return [minScore + heuristicTime(startNodeId, nodeId, vehicleParams) + km, minScore];
	};

	for (const node of fixedNodes) {
		g[node.id] = Infinity;
		rhs[node.id] = Infinity;
	}
	rhs[goalNodeId] = 0;

	U.enqueue(goalNodeId, calculateKey(goalNodeId));

	// UpdateVertex: recompute the one-step lookahead value and keep the queue
	// holding exactly the locally inconsistent nodes.
	const updateVertex = (nodeId) => {
		if (nodeId !== goalNodeId) {
			rhs[nodeId] = Math.min(
				...getNeighbors(nodeId).map(
					(neighborId) => edgeCost(nodeId, neighborId, vehicleParams) + g[neighborId]
				),
				Infinity
			);
		}

		U.remove(nodeId);
		if (g[nodeId] !== rhs[nodeId]) {
			U.enqueue(nodeId, calculateKey(nodeId));
		}
	};

	while (
		!U.isEmpty() &&
		(keyLessThan(U.elements[0].priority, calculateKey(startNodeId)) ||
			rhs[startNodeId] !== g[startNodeId])
	) {
		const u = U.dequeue();
		const oldKey = u.priority;
		const newKey = calculateKey(u.item);

		if (keyLessThan(oldKey, newKey)) {
			U.enqueue(u.item, newKey);
			continue;
		}

		addLog(`Updating node ${u.item}`, 'info');
		markNode(u.item, 'visited');
		await delay(animationMs);

		if (g[u.item] > rhs[u.item]) {
			// Overconsistent: the node just got cheaper, propagate to neighbours.
			g[u.item] = rhs[u.item];
			for (const neighborId of getNeighbors(u.item)) {
				updateVertex(neighborId);
			}
		} else {
			// Underconsistent: invalidate the node and re-evaluate it too.
			g[u.item] = Infinity;
			for (const nodeId of [...getNeighbors(u.item), u.item]) {
				updateVertex(nodeId);
			}
		}
	}

	if (g[startNodeId] === Infinity) {
		addLog('No path found.', 'error');
		return;
	}

	const path = buildPath(startNodeId, goalNodeId, g, vehicleParams);
	if (!path) {
		addLog('No path found during reconstruction.', 'error');
		return;
	}

	await highlightPath(path, vehicleParams, animationMs);
}

function keyLessThan(a, b) {
	if (a[0] < b[0]) return true;
	if (a[0] > b[0]) return false;
	return a[1] < b[1];
}

/** Greedily follows the g-values to the goal, refusing to revisit a node. */
function buildPath(startNodeId, goalNodeId, g, vehicleParams) {
	let currentNode = startNodeId;
	const path = [currentNode];
	const seen = new Set([currentNode]);

	while (currentNode !== goalNodeId) {
		let bestCost = Infinity;
		let nextNode = null;

		for (const neighborId of getNeighbors(currentNode)) {
			if (seen.has(neighborId)) continue;
			const candidateCost = edgeCost(currentNode, neighborId, vehicleParams) + g[neighborId];
			if (candidateCost < bestCost) {
				bestCost = candidateCost;
				nextNode = neighborId;
			}
		}

		if (nextNode === null || bestCost === Infinity) return null;

		currentNode = nextNode;
		seen.add(currentNode);
		path.push(currentNode);
	}

	return path;
}
