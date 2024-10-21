import { writable } from 'svelte/store';
import { defaultNodeStates, defaultEdgeStates } from '../lib/graphStructure.js';

// Store for node states: { [nodeId]: { isObstacle, explState } }
export const nodeStates = writable(defaultNodeStates);

// Store for edge states: { [edgeId]: { type, explState } }
export const edgeStates = writable(defaultEdgeStates);

// Store for vehicle parameters: { timeToTraverse, timeWithBarrier }
export const vehicleParameters = writable({
	timeToTraverse: 1.0,
	timeWithBarrier: 2.0
});

// Store for selected endpoint (one of 'A', 'B', 'C')
export const selectedEndpoint = writable('A');

// Store for selectedAlgorithm
export const selectedAlgorithm = writable('A*');
