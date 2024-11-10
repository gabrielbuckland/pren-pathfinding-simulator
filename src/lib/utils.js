import { nodeStates, edgeStates } from './stores.js';
import { get } from 'svelte/store';
import { fixedNodes, fixedEdges } from './graphStructure.js';

export function resetExplorationStates() {
	nodeStates.update((states) => {
		const newStates = {};
		for (const nodeId in states) {
			newStates[nodeId] = {
				...states[nodeId],
				explState: 'default'
			};
		}
		return newStates;
	});

	edgeStates.update((states) => {
		const newStates = {};
		for (const edgeId in states) {
			newStates[edgeId] = {
				...states[edgeId],
				explState: 'default'
			};
		}
		return newStates;
	});
}

// Helper function to set visibility based on mode
export function updateVisibility(mode) {
	nodeStates.update((states) => {
		fixedNodes.forEach((node) => {
			const isVisible = mode === 'interactive' || (mode === 'explore' && ['S'].includes(node.id));
			states[node.id] = {
				...(states[node.id] || {}),
				visibility: isVisible ? 'visible' : 'hidden'
			};
		});
		return states;
	});

	edgeStates.update((states) => {
		fixedEdges.forEach((edge) => {
			let isVisible =
				mode === 'interactive' || (mode === 'explore' && [1, 2, 14].includes(edge.id));
			if (get(edgeStates)[edge.id]?.type === 'dashed' && mode === 'explore') {
				isVisible = false;
			}
			states[edge.id] = {
				...(states[edge.id] || {}),
				visibility: isVisible ? 'visible' : 'hidden'
			};
		});
		return states;
	});
}

export function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
