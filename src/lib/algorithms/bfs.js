import { addLog } from '../logging.js';
import { delay } from '../utils.js';
import { getEdgeId, getNeighbors } from './graphCosts.js';
import { highlightPath, markEdge, markNode, markObstacleNeighbors } from './graphVisuals.js';

/**
 * Breadth-first search over the fully known map.
 *
 * Unlike the other three, this one minimises the NUMBER OF EDGES rather than
 * driving time, which is what a BFS does by construction. It is kept as a
 * contrast: the route with the fewest junctions is not the fastest one once
 * barriers make some edges more expensive. The traversal time it reports is
 * the cost of the route it picked, not a claim that the route is optimal.
 */
export async function runBfs(startNodeId, goalNodeId, vehicleParams, animationMs) {
	const queue = [startNodeId];
	const visited = new Set([startNodeId]);
	const cameFrom = {};

	markNode(startNodeId, 'probed');

	while (queue.length > 0) {
		const currentNodeId = queue.shift();

		if (cameFrom[currentNodeId]) {
			const edgeId = getEdgeId(cameFrom[currentNodeId], currentNodeId);
			addLog(
				`Visiting edge ${edgeId} from node ${cameFrom[currentNodeId]} to node ${currentNodeId}`,
				'info'
			);
			markEdge(edgeId, 'visited');
		}

		addLog(`Visiting node ${currentNodeId}`, 'info');
		markNode(currentNodeId, 'visited');
		await delay(animationMs);

		if (currentNodeId === goalNodeId) {
			addLog(`Reached goal node ${goalNodeId}`, 'success');
			await highlightPath(buildPath(cameFrom, currentNodeId), vehicleParams, animationMs);
			return;
		}

		markObstacleNeighbors(currentNodeId);

		for (const neighborId of getNeighbors(currentNodeId)) {
			if (visited.has(neighborId)) continue;

			addLog(`Probing neighbor node ${neighborId} from ${currentNodeId}`, 'info');
			visited.add(neighborId);
			cameFrom[neighborId] = currentNodeId;
			queue.push(neighborId);

			markNode(neighborId, 'probed');
			markEdge(getEdgeId(currentNodeId, neighborId), 'probed');
			await delay(animationMs);
		}
	}

	addLog('Goal not reachable from the start node.', 'error');
}

function buildPath(cameFrom, goalNodeId) {
	const path = [goalNodeId];
	let nodeId = goalNodeId;
	while (nodeId in cameFrom) {
		nodeId = cameFrom[nodeId];
		path.unshift(nodeId);
	}
	return path;
}
