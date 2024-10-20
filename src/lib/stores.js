// src/lib/stores.js
import { writable } from 'svelte/store';

// Store for node states: { [nodeId]: isObsticle }
export const nodeStates = writable({});

// Store for edge states: { [edgeId]: type }
export const edgeStates = writable({});

// Store for vehicle parameters: { timeToTraverse, timeWithBarrier }
export const vehicleParameters = writable({
	timeToTraverse: 1.0,
	timeWithBarrier: 2.0
});
