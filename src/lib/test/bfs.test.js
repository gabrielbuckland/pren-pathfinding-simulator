import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';

import { nodeStates, edgeStates, algorithmLogs } from '../stores.js';
import { defaultNodeStates, defaultEdgeStates } from '../graphStructure.js';
import { runAlgorithm } from '../algorithms.js';

const BARRIER_EDGE = 2; // S - 3, the single-hop route
const vehicleParams = { timeToTraverse: 1, timeWithBarrier: 100, timeToExploreEdges: 0 };

function reportedTraversalTime() {
	const message = get(algorithmLogs)
		.map((entry) => entry.message)
		.find((text) => text.startsWith('Total traversal time'));
	return message ? Number(message.match(/([\d.]+) units/)[1]) : null;
}

function finished(store) {
	return Object.entries(get(store))
		.filter(([, state]) => state.explState === 'finished')
		.map(([id]) => id);
}

describe('BFS', () => {
	beforeEach(() => {
		nodeStates.set(structuredClone(defaultNodeStates));
		edgeStates.set(structuredClone(defaultEdgeStates));
		algorithmLogs.set([]);
	});

	it('is offered under a name that says what it does', async () => {
		await expect(runAlgorithm('BFS', 'S', 'A', vehicleParams, 0)).resolves.not.toThrow();
	});

	it('minimises hops rather than time, which is what a BFS is for', async () => {
		edgeStates.update((states) => ({
			...states,
			[BARRIER_EDGE]: { ...states[BARRIER_EDGE], type: 'barrier' }
		}));

		await runAlgorithm('BFS', 'S', '3', vehicleParams, 0);

		// One hop across the barrier, not the cheaper two-hop detour. The reported
		// time is what that route costs, not a claim of optimality.
		expect(reportedTraversalTime()).toBe(100);
	});

	it('highlights the path it found, like every other algorithm', async () => {
		await runAlgorithm('BFS', 'S', '3', vehicleParams, 0);

		expect(finished(nodeStates)).toEqual(expect.arrayContaining(['S', '3']));
		expect(finished(edgeStates).length).toBeGreaterThan(0);
	});

	it('reports failure when the goal is walled off', async () => {
		edgeStates.update((states) => {
			const next = { ...states };
			for (const id of [3, 4, 8]) next[id] = { ...next[id], type: 'dashed' };
			return next;
		});

		await runAlgorithm('BFS', 'S', 'C', vehicleParams, 0);

		const messages = get(algorithmLogs).map((entry) => entry.message);
		expect(messages.some((text) => text.includes('not reachable'))).toBe(true);
	});
});
