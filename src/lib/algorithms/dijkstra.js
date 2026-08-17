import { fixedNodes } from '../graphStructure.js';
import { addLog } from '../logging.js';
import { delay } from '../utils.js';
import { edgeCost, getEdgeId, getNeighbors } from './graphCosts.js';
import { highlightPath, markEdge, markNode, markObstacleNeighbors } from './graphVisuals.js';

/**
 * Dijkstra over the fully known map, minimising simulated driving time.
 * Serves as the optimality baseline the exploring strategy is compared against.
 */
export async function runDijkstra(startNodeId, goalNodeId, vehicleParams, animationMs) {
	const distances = {};
	const previous = {};
	const unvisited = new Set(fixedNodes.map((node) => node.id));

	for (const node of fixedNodes) {
		distances[node.id] = Infinity;
	}
	distances[startNodeId] = 0;

	while (unvisited.size > 0) {
		let currentNodeId = null;
		let smallestDistance = Infinity;
		for (const nodeId of unvisited) {
			if (distances[nodeId] < smallestDistance) {
				smallestDistance = distances[nodeId];
				currentNodeId = nodeId;
			}
		}

		if (currentNodeId === null) {
			break; // Every remaining node is unreachable
		}

		unvisited.delete(currentNodeId);

		addLog(`Visiting node ${currentNodeId}`, 'info');
		markNode(currentNodeId, 'visited');
		await delay(animationMs);

		if (currentNodeId === goalNodeId) {
			addLog(`Reached goal node ${goalNodeId}`, 'success');
			await highlightPath(buildPath(previous, currentNodeId), vehicleParams, animationMs);
			return;
		}

		markObstacleNeighbors(currentNodeId);

		for (const neighborId of getNeighbors(currentNodeId)) {
			if (!unvisited.has(neighborId)) continue;

			const alternative =
				distances[currentNodeId] + edgeCost(currentNodeId, neighborId, vehicleParams);

			if (alternative < distances[neighborId]) {
				distances[neighborId] = alternative;
				previous[neighborId] = currentNodeId;

				markNode(neighborId, 'probed');
				markEdge(getEdgeId(currentNodeId, neighborId), 'probed');
				await delay(animationMs);
			}
		}
	}

	addLog('No path found.', 'error');
}

function buildPath(previous, goalNodeId) {
	const path = [];
	let nodeId = goalNodeId;
	while (nodeId !== undefined) {
		path.unshift(nodeId);
		nodeId = previous[nodeId];
	}
	return path;
}
