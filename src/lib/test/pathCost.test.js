import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';

import { nodeStates, edgeStates, algorithmLogs } from '../stores.js';
import { defaultNodeStates, defaultEdgeStates } from '../graphStructure.js';
import { runDijkstra } from '../algorithms/dijkstra.js';
import { runAStar } from '../algorithms/aStar.js';
import { runDStarLite } from '../algorithms/dStarLite.js';

/**
 * The graph has a direct edge S->3 (id 2) and a two-hop detour S->2->3
 * (ids 14 and 13). The detour is geometrically longer but, once a barrier
 * sits on the direct edge, far cheaper in time. An algorithm that optimises
 * the quantity it reports must pick the detour.
 */
const BARRIER_EDGE = 2;

const vehicleParams = {
	timeToTraverse: 1,
	timeWithBarrier: 100,
	timeToExploreEdges: 0
};

function reportedTraversalTime() {
	const message = get(algorithmLogs)
		.map((entry) => entry.message)
		.find((text) => text.startsWith('Total traversal time'));

	if (!message) return null;
	return Number(message.match(/([\d.]+) units/)[1]);
}

describe('path cost model', () => {
	beforeEach(() => {
		nodeStates.set(structuredClone(defaultNodeStates));
		edgeStates.set(structuredClone(defaultEdgeStates));
		algorithmLogs.set([]);
		edgeStates.update((states) => ({
			...states,
			[BARRIER_EDGE]: { ...states[BARRIER_EDGE], type: 'barrier' }
		}));
	});

	const algorithms = [
		['Dijkstra', runDijkstra],
		['A*', runAStar],
		['D*Lite', runDStarLite]
	];

	for (const [name, run] of algorithms) {
		it(`${name} routes around a barrier when the detour is cheaper in time`, async () => {
			await run('S', '3', vehicleParams, 0);

			// Detour: two clean edges = 2 units. Through the barrier: 100 units.
			expect(reportedTraversalTime()).toBe(2);
		});
	}

	for (const [name, run] of algorithms) {
		it(`${name} uses the barrier when crossing it is cheaper than the detour`, async () => {
			// Barrier is only marginally more expensive than a normal edge now,
			// so the single direct edge beats the two-edge detour.
			await run('S', '3', { ...vehicleParams, timeWithBarrier: 1.5 }, 0);

			expect(reportedTraversalTime()).toBe(1.5);
		});
	}
});
