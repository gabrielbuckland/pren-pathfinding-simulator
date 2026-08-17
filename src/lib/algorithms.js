import { get } from 'svelte/store';
import { nodeStates, edgeStates, algorithmLogs } from './stores.js';
import { addLog } from './logging.js';
import { generateRandomGraph, getRandomGoalNode, isReachable } from './utils.js';
import { runAStar } from './algorithms/aStar.js';
import { runBfs } from './algorithms/bfs.js';
import { runDStarLite } from './algorithms/dStarLite.js';
import { runDijkstra } from './algorithms/dijkstra.js';
import { GraphExplorer } from './graphExplorer.js';

/** How many failed attempts per requested run before the batch is abandoned. */
const MAX_ATTEMPTS_PER_ROUND = 20;

export async function startParameterizedRun(numberOfRounds) {
	const log = [];
	const attemptBudget = numberOfRounds * MAX_ATTEMPTS_PER_ROUND;
	let attempts = 0;

	while (log.length < numberOfRounds) {
		if (attempts >= attemptBudget) {
			addLog(
				`Aborted after ${attempts} attempts: only ${log.length} of ${numberOfRounds} runs reached their goal.`,
				'error'
			);
			break;
		}
		attempts++;

		const randomGoalNode = getRandomGoalNode();
		const graph = generateRandomGraph(randomGoalNode);

		// The explorer reads the live stores, so the generated map has to be
		// applied before it starts. This also clears state from the previous run.
		nodeStates.set(graph.randomNodes);
		edgeStates.set(graph.randomEdges);

		const graphExplorer = new GraphExplorer('S', 100, {
			exMode: 'parameterized',
			endPoint: randomGoalNode
		});

		const startTime = Date.now();
		await graphExplorer.explore();
		const endTime = Date.now();

		if (!graphExplorer.hasReachedGoal()) {
			continue;
		}

		const logEntry = {
			deltaTime: endTime - startTime,
			goalNode: randomGoalNode,
			graphNodes: graph.randomNodes,
			graphEdges: graph.randomEdges
		};

		log.push(logEntry);
		addLog(`Run #${log.length} (goal ${randomGoalNode}): ${logEntry.deltaTime}ms`, 'info');
	}

	if (log.length === 0) {
		addLog('Parameterized run produced no successful runs.', 'error');
		return;
	}

	const totalTime = log.reduce((sum, entry) => sum + entry.deltaTime, 0);
	addLog(
		`Parameterized run complete! ${log.length} runs, total time: ${totalTime}ms, average: ${(
			totalTime / log.length
		).toFixed(2)}ms`,
		'success'
	);
}

export async function simulateMapExploration() {
	algorithmLogs.set([]);
	await exploreMap();
}

export async function runAlgorithm(
	algorithmName,
	startNodeId,
	endpoint,
	vehicleParams,
	animationMs
) {
	algorithmLogs.set([]);

	const algorithms = {
		Dijkstra: runDijkstra,
		'A*': runAStar,
		'D*Lite': runDStarLite,
		BFS: runBfs
	};

	const algorithm = algorithms[algorithmName];

	if (!algorithm) {
		throw new Error(`Algorithm ${algorithmName} not found`);
	}

	addLog(`Starting ${algorithmName} from ${startNodeId} to ${endpoint}`, 'info');

	if (!isReachable(get(nodeStates), get(edgeStates), startNodeId, endpoint)) {
		addLog(explainUnreachable(startNodeId, endpoint), 'error');
		return;
	}

	await algorithm(startNodeId, endpoint, vehicleParams, animationMs);
}

/**
 * Says why the goal cannot be reached, rather than only that it cannot.
 * A bare "no path found" reads like an algorithm failure when it is really
 * a property of the map the user drew.
 */
function explainUnreachable(startNodeId, endpoint) {
	const nodes = get(nodeStates);

	if (nodes[endpoint]?.isObstacle) {
		return `No route from ${startNodeId} to ${endpoint}: node ${endpoint} is blocked by a pylon.`;
	}

	// Which nodes would open the map up again if their pylon were removed?
	const culprits = Object.entries(nodes)
		.filter(([, state]) => state.isObstacle)
		.map(([id]) => id)
		.filter((id) => {
			const without = { ...nodes, [id]: { ...nodes[id], isObstacle: false } };
			return isReachable(without, get(edgeStates), startNodeId, endpoint);
		});

	if (culprits.length > 0) {
		const list = culprits.join(', ');
		const noun = culprits.length === 1 ? 'the pylon on node' : 'a pylon on one of nodes';
		return `No route from ${startNodeId} to ${endpoint}: removing ${noun} ${list} would reconnect it.`;
	}

	return `No route from ${startNodeId} to ${endpoint}: too many sections have been removed. Restore an edge or press "Randomized graph".`;
}

async function exploreMap() {
	const graphExplorer = new GraphExplorer('S', 200);
	await graphExplorer.explore();
}
