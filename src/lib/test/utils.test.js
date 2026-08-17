import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';

import { nodeStates, edgeStates } from '../stores.js';
import { defaultNodeStates, defaultEdgeStates } from '../graphStructure.js';
import { updateVisibility } from '../utils.js';

describe('updateVisibility', () => {
	beforeEach(() => {
		nodeStates.set(structuredClone(defaultNodeStates));
		edgeStates.set(structuredClone(defaultEdgeStates));
	});

	it('does not mutate the shared default state objects', () => {
		// resetGraph() in +page.svelte puts the module-level defaults into the
		// store by reference, so any in-place write corrupts them permanently.
		nodeStates.set(defaultNodeStates);
		edgeStates.set(defaultEdgeStates);

		updateVisibility('start-only');

		expect(defaultNodeStates.A.visibility).toBe('visible');
		expect(defaultEdgeStates[5].visibility).toBe('visible');
	});

	it('hides everything but the start node and its edges when revealing', () => {
		updateVisibility('start-only');

		expect(get(nodeStates).S.visibility).toBe('visible');
		expect(get(nodeStates).A.visibility).toBe('hidden');
		expect(get(edgeStates)[1].visibility).toBe('visible');
		expect(get(edgeStates)[5].visibility).toBe('hidden');
	});

	it('shows the whole map again afterwards', () => {
		updateVisibility('start-only');
		updateVisibility('all');

		expect(get(nodeStates).A.visibility).toBe('visible');
		expect(get(edgeStates)[5].visibility).toBe('visible');
	});

	it('produces a new state object so subscribers are notified', () => {
		const before = get(nodeStates);
		updateVisibility('start-only');

		expect(get(nodeStates)).not.toBe(before);
	});
});
