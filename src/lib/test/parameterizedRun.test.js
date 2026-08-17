import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

import {
	nodeStates,
	edgeStates,
	algorithmLogs,
	executionMode,
	vehicleParameters
} from '../stores.js';
import { defaultNodeStates, defaultEdgeStates, fixedEdges } from '../graphStructure.js';

// A fixed "random" graph so the test does not depend on Math.random.
const SOLVABLE_GRAPH = {
	randomNodes: Object.fromEntries(
		Object.keys(defaultNodeStates).map((id) => [
			id,
			{ isObstacle: false, explState: 'default', visibility: 'visible' }
		])
	),
	randomEdges: Object.fromEntries(
		fixedEdges.map((edge) => [
			edge.id,
			{
				// Edge 5 is distinctive: if the run applies the generated graph to
				// the stores, this barrier shows up there.
				type: edge.id === 5 ? 'barrier' : 'solid',
				explState: 'default',
				visibility: 'visible',
				traversable: true
			}
		])
	)
};

const UNSOLVABLE_GRAPH = {
	randomNodes: SOLVABLE_GRAPH.randomNodes,
	randomEdges: Object.fromEntries(
		fixedEdges.map((edge) => [
			edge.id,
			{
				// Every edge touching a goal node is missing, so no goal is reachable.
				type:
					['A', 'B', 'C'].includes(edge.from) || ['A', 'B', 'C'].includes(edge.to)
						? 'dashed'
						: 'solid',
				explState: 'default',
				visibility: 'visible',
				traversable: true
			}
		])
	)
};

const generateRandomGraph = vi.fn();

vi.mock('../utils.js', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		generateRandomGraph: (...args) => generateRandomGraph(...args),
		getRandomGoalNode: () => 'A'
	};
});

const { startParameterizedRun } = await import('../algorithms.js');

describe('startParameterizedRun', () => {
	beforeEach(() => {
		nodeStates.set(structuredClone(defaultNodeStates));
		edgeStates.set(structuredClone(defaultEdgeStates));
		algorithmLogs.set([]);
		executionMode.set('parameterized');
		vehicleParameters.set({ timeToTraverse: 0, timeWithBarrier: 0, timeToExploreEdges: 0 });
		generateRandomGraph.mockReset();
	});

	it('applies each generated graph to the stores before exploring it', async () => {
		generateRandomGraph.mockReturnValue(structuredClone(SOLVABLE_GRAPH));

		await startParameterizedRun(2);

		expect(generateRandomGraph).toHaveBeenCalledTimes(2);
		expect(get(edgeStates)[5].type).toBe('barrier');
	});

	it('resets exploration state between runs', async () => {
		generateRandomGraph.mockReturnValue(structuredClone(SOLVABLE_GRAPH));

		await startParameterizedRun(1);

		// The generated graph starts clean; nothing may leak in from a prior run.
		generateRandomGraph.mockReturnValue(structuredClone(SOLVABLE_GRAPH));
		await startParameterizedRun(1);

		const leftovers = Object.values(get(nodeStates)).filter(
			(state) => state.explState === 'restricted'
		);
		expect(leftovers).toHaveLength(0);
	});

	it('gives up instead of looping forever when the goal cannot be reached', async () => {
		generateRandomGraph.mockReturnValue(structuredClone(UNSOLVABLE_GRAPH));

		await expect(startParameterizedRun(1)).resolves.toBeUndefined();

		const messages = get(algorithmLogs).map((entry) => entry.message);
		expect(messages.some((text) => text.toLowerCase().includes('abort'))).toBe(true);
	}, 10000);

	it('reports one result line per completed run', async () => {
		generateRandomGraph.mockReturnValue(structuredClone(SOLVABLE_GRAPH));

		await startParameterizedRun(3);

		const runLines = get(algorithmLogs)
			.map((entry) => entry.message)
			.filter((text) => text.startsWith('Run #'));
		expect(runLines).toHaveLength(3);
	});
});
