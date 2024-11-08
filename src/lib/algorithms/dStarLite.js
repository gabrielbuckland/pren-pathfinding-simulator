import { nodeStates, edgeStates } from '../stores.js';
import { fixedEdges, fixedNodes } from '../graphStructure.js';
import { get } from 'svelte/store';
import { addLog } from '../logging.js';
import { delay } from '../utils.js';

class PriorityQueue {
	constructor() {
		this.elements = [];
	}

	isEmpty() {
		return this.elements.length === 0;
	}

	enqueue(item, priority) {
		this.elements.push({ item, priority });
		this.elements.sort((a, b) => {
			if (a.priority[0] !== b.priority[0]) {
				return a.priority[0] - b.priority[0];
			} else {
				return a.priority[1] - b.priority[1];
			}
		});
	}

	dequeue() {
		return this.elements.shift();
	}

	remove(item) {
		this.elements = this.elements.filter((element) => element.item !== item);
	}
}

export async function runDStarLite(
	startNodeId,
	goalNodeId,
	vehicleParams,
	animationMs
) {
	// Initialize data structures
	const rhs = {};
	const g = {};
	const U = new PriorityQueue();
	let km = 0;

	const s_start = startNodeId;
	const s_goal = goalNodeId;
	let s_last = s_start;

	// Initialize g and rhs for all nodes
	for (const node of fixedNodes) {
		const nodeId = node.id;
		g[nodeId] = Infinity;
		rhs[nodeId] = Infinity;
	}
	rhs[s_goal] = 0;

	U.enqueue(s_goal, calculateKey(s_goal, s_start, g, rhs, km));

	while (
		!U.isEmpty() &&
		(keyCompare(U.elements[0].priority, calculateKey(s_start, s_start, g, rhs, km)) ||
			rhs[s_start] !== g[s_start])
	) {
		const u = U.dequeue();
		const k_old = u.priority;
		const k_new = calculateKey(u.item, s_start, g, rhs, km);

		if (keyCompare(k_old, k_new)) {
			U.enqueue(u.item, k_new);
		} else if (g[u.item] > rhs[u.item]) {
			g[u.item] = rhs[u.item];

			// Visual updates
			addLog(`Updating node ${u.item}`, 'info');
			nodeStates.update((states) => ({
				...states,
				[u.item]: {
					...(states[u.item] || {}),
					explState: 'visited',
				},
			}));
			await delay(animationMs);

			for (const s of getPredecessors(u.item)) {
				if (s !== s_goal) {
					rhs[s] = Math.min(rhs[s], cost(s, u.item) + g[u.item]);
				}
				U.enqueue(s, calculateKey(s, s_start, g, rhs, km));
			}
		} else {
			const g_old = g[u.item];
			g[u.item] = Infinity;

			// Visual updates
			addLog(`Updating node ${u.item}`, 'info');
			nodeStates.update((states) => ({
				...states,
				[u.item]: {
					...(states[u.item] || {}),
					explState: 'visited',
				},
			}));
			await delay(animationMs);

			for (const s of [...getPredecessors(u.item), u.item]) {
				if (rhs[s] === cost(s, u.item) + g[u.item]) {
					if (s !== s_goal) {
						rhs[s] = Infinity;
						for (const s_prime of getSuccessors(s)) {
							rhs[s] = Math.min(rhs[s], cost(s, s_prime) + g[s_prime]);
						}
					}
				}
				U.enqueue(s, calculateKey(s, s_start, g, rhs, km));
			}
		}
	}

	if (g[s_start] === Infinity) {
		addLog('No path found.', 'error');
		return;
	}

	// Reconstruct path
	let currentNode = s_start;
	const path = [currentNode];
	while (currentNode !== s_goal) {
		const successors = getSuccessors(currentNode);
		let minCost = Infinity;
		let nextNode = null;
		for (const s of successors) {
			const c = cost(currentNode, s) + g[s];
			if (c < minCost) {
				minCost = c;
				nextNode = s;
			}
		}
		if (nextNode === null || g[nextNode] === Infinity) {
			addLog('No path found during reconstruction.', 'error');
			return;
		}
		currentNode = nextNode;
		path.push(currentNode);
	}

	// Highlight the path
	await highlightPath(path, vehicleParams, animationMs);
}

// Helper functions
function calculateKey(s, s_start, g, rhs, km) {
	const min_g_rhs = Math.min(g[s], rhs[s]);
	return [
		min_g_rhs + heuristic(s_start, s) + km,
		min_g_rhs,
	];
}

function keyCompare(a, b) {
	if (a[0] < b[0]) return true;
	if (a[0] > b[0]) return false;
	return a[1] < b[1];
}

function heuristic(nodeIdA, nodeIdB) {
	const posA = getNodePosition(nodeIdA);
	const posB = getNodePosition(nodeIdB);
	const dx = posA.x - posB.x;
	const dy = posA.y - posB.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function cost(nodeIdA, nodeIdB) {
	if (isEdgeBlocked(nodeIdA, nodeIdB)) {
		return Infinity;
	}
	return distanceBetween(nodeIdA, nodeIdB);
}

function isEdgeBlocked(nodeIdA, nodeIdB) {
	const edgeId = getEdgeId(nodeIdA, nodeIdB);
	const edgeState = get(edgeStates)[edgeId];
	const isDashed = edgeState?.type === 'dashed';
	if (isDashed) return true;

	const nodeStateA = get(nodeStates)[nodeIdA];
	const nodeStateB = get(nodeStates)[nodeIdB];
	if (nodeStateA?.isObstacle || nodeStateB?.isObstacle) {
		return true;
	}
	return false;
}

function getPredecessors(nodeId) {
	const predecessors = [];
	for (const edge of fixedEdges) {
		if (edge.to === nodeId && !isEdgeBlocked(edge.from, nodeId)) {
			predecessors.push(edge.from);
		} else if (edge.from === nodeId && !isEdgeBlocked(edge.to, nodeId)) {
			predecessors.push(edge.to); // If edges are undirected
		}
	}
	return predecessors;
}

function getSuccessors(nodeId) {
	const successors = [];
	for (const edge of fixedEdges) {
		if (edge.from === nodeId && !isEdgeBlocked(nodeId, edge.to)) {
			successors.push(edge.to);
		} else if (edge.to === nodeId && !isEdgeBlocked(nodeId, edge.from)) {
			successors.push(edge.from); // If edges are undirected
		}
	}
	return successors;
}

function getNodePosition(nodeId) {
	const node = fixedNodes.find((node) => node.id === nodeId);
	if (node && typeof node.x === 'number' && typeof node.y === 'number') {
		return { x: node.x, y: node.y };
	} else {
		throw new Error(`Position not found for node ${nodeId}`);
	}
}

function distanceBetween(nodeIdA, nodeIdB) {
	const posA = getNodePosition(nodeIdA);
	const posB = getNodePosition(nodeIdB);
	const dx = posA.x - posB.x;
	const dy = posA.y - posB.y;
	return Math.sqrt(dx * dx + dy * dy);
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

async function highlightPath(path, vehicleParams, animationMs) {
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
