import { nodeStates, edgeStates } from './stores.js';

export function resetExplorationStates() {
	nodeStates.update((states) => {
		const newStates = {};
		for (const nodeId in states) {
			newStates[nodeId] = {
				...states[nodeId],
				explState: 'default',
			};
		}
		return newStates;
	});

	edgeStates.update((states) => {
		const newStates = {};
		for (const edgeId in states) {
			newStates[edgeId] = {
				...states[edgeId],
				explState: 'default',
			};
		}
		return newStates;
	});
}

export function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
