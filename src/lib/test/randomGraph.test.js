import { describe, it, expect } from 'vitest';

import { fixedEdges, fixedNodes } from '../graphStructure.js';
import { generateRandomGraph, getRandomGoalNode, isReachable } from '../utils.js';

function reachableWithoutHelper(nodes, edges, start, goal) {
	const adjacency = {};
	for (const node of fixedNodes) adjacency[node.id] = [];
	for (const edge of fixedEdges) {
		if (edges[edge.id].type === 'dashed') continue;
		if (nodes[edge.from].isObstacle || nodes[edge.to].isObstacle) continue;
		adjacency[edge.from].push(edge.to);
		adjacency[edge.to].push(edge.from);
	}
	const seen = new Set([start]);
	const queue = [start];
	while (queue.length) {
		const current = queue.shift();
		if (current === goal) return true;
		for (const next of adjacency[current]) {
			if (!seen.has(next)) {
				seen.add(next);
				queue.push(next);
			}
		}
	}
	return false;
}

describe('generateRandomGraph', () => {
	it('always leaves a route to the goal it was asked for', () => {
		for (const goal of ['A', 'B', 'C']) {
			for (let i = 0; i < 200; i++) {
				const { randomNodes, randomEdges } = generateRandomGraph(goal);
				expect(reachableWithoutHelper(randomNodes, randomEdges, 'S', goal)).toBe(true);
			}
		}
	});

	it('never places an obstacle on the goal it was asked for', () => {
		for (let i = 0; i < 200; i++) {
			const { randomNodes } = generateRandomGraph('B');
			expect(randomNodes.B.isObstacle).toBe(false);
		}
	});
});

describe('isReachable', () => {
	it('agrees with a plain breadth-first search over the same rules', () => {
		for (let i = 0; i < 200; i++) {
			const goal = getRandomGoalNode();
			const { randomNodes, randomEdges } = generateRandomGraph(goal);
			for (const endpoint of ['A', 'B', 'C']) {
				expect(isReachable(randomNodes, randomEdges, 'S', endpoint)).toBe(
					reachableWithoutHelper(randomNodes, randomEdges, 'S', endpoint)
				);
			}
		}
	});

	it('treats a barrier as passable and a removed edge as blocking', () => {
		const nodes = Object.fromEntries(fixedNodes.map((n) => [n.id, { isObstacle: false }]));
		const allBarrier = Object.fromEntries(fixedEdges.map((e) => [e.id, { type: 'barrier' }]));
		const allRemoved = Object.fromEntries(fixedEdges.map((e) => [e.id, { type: 'dashed' }]));

		expect(isReachable(nodes, allBarrier, 'S', 'A')).toBe(true);
		expect(isReachable(nodes, allRemoved, 'S', 'A')).toBe(false);
	});
});
