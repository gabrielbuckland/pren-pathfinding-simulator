import { addLog } from '../logging.js';
import { delay } from '../utils.js';
import { edgeCost, getEdgeId, getNeighbors, heuristicTime } from './graphCosts.js';
import { highlightPath, markEdge, markNode, markObstacleNeighbors } from './graphVisuals.js';

/**
 * A* over the fully known map, minimising simulated driving time.
 *
 * The heuristic is the scaled Euclidean distance from graphCosts, which is
 * admissible and consistent with respect to time — so the closed set never
 * discards a node that would later turn out to be on a cheaper path.
 */
export async function runAStar(startNodeId, goalNodeId, vehicleParams, animationMs) {
	const openSet = new Set([startNodeId]);
	const closedSet = new Set();
	const cameFrom = {};

	const gScore = { [startNodeId]: 0 };
	const fScore = { [startNodeId]: heuristicTime(startNodeId, goalNodeId, vehicleParams) };

	while (openSet.size > 0) {
		const currentNodeId = lowestFScoreNode(openSet, fScore);
		if (currentNodeId === null) break;

		addLog(`Visiting node ${currentNodeId}`, 'info');
		markNode(currentNodeId, 'visited');
		await delay(animationMs);

		if (currentNodeId === goalNodeId) {
			addLog(`Reached goal node ${goalNodeId}`, 'success');
			await highlightPath(buildPath(cameFrom, currentNodeId), vehicleParams, animationMs);
			return;
		}

		openSet.delete(currentNodeId);
		closedSet.add(currentNodeId);

		markObstacleNeighbors(currentNodeId);

		for (const neighborId of getNeighbors(currentNodeId)) {
			if (closedSet.has(neighborId)) continue;

			const tentativeGScore =
				gScore[currentNodeId] + edgeCost(currentNodeId, neighborId, vehicleParams);

			if (tentativeGScore >= (gScore[neighborId] ?? Infinity)) continue;

			cameFrom[neighborId] = currentNodeId;
			gScore[neighborId] = tentativeGScore;
			fScore[neighborId] = tentativeGScore + heuristicTime(neighborId, goalNodeId, vehicleParams);

			if (!openSet.has(neighborId)) {
				openSet.add(neighborId);
				markNode(neighborId, 'probed');
			}
			markEdge(getEdgeId(currentNodeId, neighborId), 'probed');
			await delay(animationMs);
		}
	}

	addLog('Goal not reachable from the start node.', 'error');
}

function lowestFScoreNode(openSet, fScore) {
	let lowestNode = null;
	let lowestFScore = Infinity;
	for (const nodeId of openSet) {
		const score = fScore[nodeId] ?? Infinity;
		if (score < lowestFScore) {
			lowestFScore = score;
			lowestNode = nodeId;
		}
	}
	return lowestNode;
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
