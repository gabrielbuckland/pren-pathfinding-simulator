// src/lib/stores.js
import { writable } from 'svelte/store';

// Store for node states: { [nodeId]: isObsticle }
export const nodeStates = writable({});

// Store for edge states: { [edgeId]: type }
export const edgeStates = writable({});
