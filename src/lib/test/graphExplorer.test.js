import { describe, it, expect, beforeEach, vi } from 'vitest';
import { writable } from 'svelte/store';

import { fixedNodes, fixedEdges, defaultNodeStates, defaultEdgeStates } from '../graphStructure';
import { GraphExplorer } from '../graphExplorer';

// Mock stores
const createMockStore = (initialValue) => writable(initialValue);

describe('GraphExplorer', () => {
	let graphExplorer;
	let mockNodeStates, mockEdgeStates, mockSelectedEndpoint;

	beforeEach(() => {
		// Initialize mock stores for each test
		mockNodeStates = createMockStore(defaultNodeStates);
		mockEdgeStates = createMockStore(defaultEdgeStates);
		mockSelectedEndpoint = createMockStore('C');

		graphExplorer = new GraphExplorer('S', 200, {
			nodeStates: mockNodeStates,
			edgeStates: mockEdgeStates,
			selectedEndpoint: mockSelectedEndpoint
		});

		graphExplorer.graph.nodes = fixedNodes;
		graphExplorer.graph.edges = fixedEdges;
	});

	it('calculates the correct vector between nodes', () => {
		const goalVector = graphExplorer._getGoalNodeVector();
		const expectedVector = {
			x: fixedNodes.find((n) => n.id === 'C').x - fixedNodes.find((n) => n.id === 'S').x,
			y: fixedNodes.find((n) => n.id === 'C').y - fixedNodes.find((n) => n.id === 'S').y
		};
		expect(goalVector).toEqual(expectedVector);
	});

	it('calculates vector alignment correctly', () => {
		const vector1 = { x: 1, y: 0 };
		const vector2 = { x: 0, y: 1 };
		const alignment = graphExplorer._calculateVectorAlignment(vector1, vector2);
		expect(alignment).toBeCloseTo(0, 5); // Perpendicular vectors
	});

	it('identifies the correct section of a node', () => {
		expect(graphExplorer._getNodeSection(fixedNodes.find((n) => n.id === 'S'))).toBe('middle');
		expect(graphExplorer._getNodeSection(fixedNodes.find((n) => n.id === 'A'))).toBe('left');
		expect(graphExplorer._getNodeSection(fixedNodes.find((n) => n.id === 'B'))).toBe('middle');
		expect(graphExplorer._getNodeSection(fixedNodes.find((n) => n.id === 'C'))).toBe('right');
		expect(graphExplorer._getNodeSection(fixedNodes.find((n) => n.id === '4'))).toBe('middle');
		expect(graphExplorer._getNodeSection(fixedNodes.find((n) => n.id === '2'))).toBe('middle');
		expect(graphExplorer._getNodeSection(fixedNodes.find((n) => n.id === '1'))).toBe('left');
		expect(graphExplorer._getNodeSection(fixedNodes.find((n) => n.id === '3'))).toBe('right');
	});

	it('returns possible edges for a given node', () => {
		const edges = graphExplorer._getEdgesFromNode('S');
		expect(edges).toEqual([
			{ id: 1, from: '1', to: 'S' },
			{ id: 2, from: 'S', to: '3' },
			{ id: 14, from: 'S', to: '2' }
		]);
	});

	it('sorts edges by alignment and section priority', () => {
		const edges = graphExplorer._getPossibleEdges('3');
		expect(edges.map((e) => e.id)).toEqual([2, 13, 7, 3]);
	});

	it('marks a node as visited correctly', () => {
		graphExplorer._visitNode('3');
		expect(graphExplorer.visitedNodes.has('3')).toBe(true);
	});

	it('returns the correct edges originating from a given node', () => {
		const edges = graphExplorer._getEdgesFromNode('4');
		expect(edges.map((e) => e.id)).toEqual([7, 8, 9, 10, 15]); // All edges connected to node '4'
	});

	it('calculates intersection correctly', () => {
		const p1 = { x: 0, y: 0 };
		const q1 = { x: 4, y: 4 };
		const p2 = { x: 0, y: 4 };
		const q2 = { x: 4, y: 0 };
		const intersection = graphExplorer._calculateIntersection(p1, q1, p2, q2);
		expect(intersection).toEqual({ x: 2, y: 2 }); // Intersection point
	});

	it('detects if segments do not intersect', () => {
		const p1 = { x: 0, y: 0 };
		const q1 = { x: 1, y: 1 };
		const p2 = { x: 2, y: 2 };
		const q2 = { x: 3, y: 3 };
		expect(graphExplorer._doIntersect(p1, q1, p2, q2)).toBe(false); // Parallel segments
	});

	it('returns an empty array if no possible edges exist', () => {
		graphExplorer.visitedEdges.add(2); // Mark edge 'S' to '3' as visited
		graphExplorer.visitedEdges.add(14); // Mark edge 'S' to '2' as visited
		graphExplorer.visitedEdges.add(1); // Mark edge '1' to 'S' as visited
		const edges = graphExplorer._getEdgesFromNode('S');
		expect(edges).toEqual([]); // All edges from 'S' are visited
	});

	it('correctly prioritizes edges based on alignment and section', () => {
		graphExplorer.visitedEdges.add(7); // Mark edge '4' to '3' as visited
		const edges = graphExplorer._getPossibleEdges('4');
		expect(edges.map((e) => e.id)).toEqual([10, 15, 9, 8]); // Prioritized by alignment and section
	});

	it('handles restricted nodes correctly', () => {
		graphExplorer._updateNodeState('3', { explState: 'restricted', visibility: 'visible' });
		expect(graphExplorer._isNodeRestricted('3')).toBe(true);
		expect(graphExplorer._isNodeRestricted('S')).toBe(false);
	});

	it('calculates the correct section distances', () => {
		const distance = graphExplorer._getNodeSection(fixedNodes.find((n) => n.id === '3'));
		expect(distance).toBe('right'); // '3' is in the right section
	});
});
