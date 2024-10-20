import { nodeStates, edgeStates, selectedEndpoint } from './stores.js';
import { fixedEdges } from './graphStructure.js';
import { get } from 'svelte/store';

export async function runAlgorithm() {
	console.log('Running algorithm');

	const startNodeId = 'S';
	const goalNodeId = get(selectedEndpoint);

	let queue = [startNodeId];
	let visitedNodes = new Set();
	let cameFrom = {};

	while (queue.length > 0) {
		const currentNodeId = queue.shift();
		visitedNodes.add(currentNodeId);

		// Mark node as visited
		nodeStates.update(states => {
			return {
				...states,
				[currentNodeId]: {
					...(states[currentNodeId] || {}),
					explState: 'visited'
				}
			};
		});

		await delay(250);

		if (currentNodeId === goalNodeId) {
			await highlightPath(cameFrom, currentNodeId);
			return;
		}

		const neighbors = getNeighbors(currentNodeId);
		for (const neighborId of neighbors) {
			if (!visitedNodes.has(neighborId)) {
				visitedNodes.add(neighborId);
				queue.push(neighborId);
				cameFrom[neighborId] = currentNodeId;

				const edgeId = getEdgeId(currentNodeId, neighborId);
				edgeStates.update(states => {
					return {
						...states,
						[edgeId]: {
							...(states[edgeId] || {}),
							explState: 'probed'
						}
					};
				});

				await delay(250);
			}
		}
	}

	console.log('Goal not reachable from the start node.');
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
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
