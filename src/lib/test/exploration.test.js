import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';

import { nodeStates, edgeStates, algorithmLogs } from '../stores.js';
import { defaultNodeStates, defaultEdgeStates } from '../graphStructure.js';
import { runAlgorithm } from '../algorithms.js';

const vehicleParams = { timeToTraverse: 1, timeWithBarrier: 5, timeToExploreEdges: 0.5 };

function reportedTraversalTime() {
	const message = get(algorithmLogs)
		.map((entry) => entry.message)
		.find((text) => text.startsWith('Total traversal time'));
	return message ? Number(message.match(/([\d.]+) units/)[1]) : null;
}

describe('Exploration as an algorithm', () => {
	beforeEach(() => {
		nodeStates.set(structuredClone(defaultNodeStates));
		edgeStates.set(structuredClone(defaultEdgeStates));
		algorithmLogs.set([]);
	});

	it('is selectable like every other algorithm', async () => {
		await expect(runAlgorithm('Exploration', 'S', 'A', vehicleParams, 0)).resolves.not.toThrow();
	});

	it('hides the map down to the start node so it can uncover it', async () => {
		await runAlgorithm('Exploration', 'S', 'A', vehicleParams, 0);

		// Nodes it never reached stay hidden; the ones it drove to were revealed.
		const visibilities = get(nodeStates);
		expect(visibilities.S.visibility).toBe('visible');
		expect(visibilities.A.visibility).toBe('visible');
	});

	it('reports a traversal time that can be compared with the map-aware runs', async () => {
		await runAlgorithm('Exploration', 'S', 'A', vehicleParams, 0);
		const exploring = reportedTraversalTime();

		algorithmLogs.set([]);
		nodeStates.set(structuredClone(defaultNodeStates));
		edgeStates.set(structuredClone(defaultEdgeStates));
		await runAlgorithm('Dijkstra', 'S', 'A', vehicleParams, 0);
		const optimal = reportedTraversalTime();

		expect(exploring).toBeGreaterThan(0);
		expect(optimal).toBeGreaterThan(0);
		// Not knowing the map cannot be cheaper than being handed it.
		expect(exploring).toBeGreaterThanOrEqual(optimal);
	});

	it('does not depend on how fast the machine runs it', async () => {
		await runAlgorithm('Exploration', 'S', 'B', vehicleParams, 0);
		const first = reportedTraversalTime();

		algorithmLogs.set([]);
		nodeStates.set(structuredClone(defaultNodeStates));
		edgeStates.set(structuredClone(defaultEdgeStates));
		await runAlgorithm('Exploration', 'S', 'B', vehicleParams, 0);

		expect(reportedTraversalTime()).toBe(first);
	});
});
