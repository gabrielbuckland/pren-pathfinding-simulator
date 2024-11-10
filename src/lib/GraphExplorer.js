import { get } from 'svelte/store';
import { fixedNodes, fixedEdges } from './graphStructure';
import { nodeStates, edgeStates } from './stores';
import { delay } from './utils';
import { addLog } from './logging';

export class GraphExplorer {
	constructor(startNodeId = 'S') {
		this.startNodeId = startNodeId;
		this.visitedNodes = new Set();
		this.visitedEdges = new Set();
		this.intraversibleEdges = new Set();
		this.edgeLengths = { ...edgeStates };
		this.nodeStates = { ...nodeStates };
		this.nodeVisibility = {};
		this.graph = {
			nodes: fixedNodes,
			edges: fixedEdges
		};
		this.nodeStack = [];
	}

	async explore() {
		addLog('Starting map exploration...', 'info');
		this.nodeStack.push({ nodeId: this.startNodeId, edgeId: null }); // Initialize with start node and no leading edge

		while (this.nodeStack.length > 0) {
			const { nodeId: currentNodeId, edgeId: leadingEdgeId } = this.nodeStack.pop();

			// Skip nodes that are restricted or already visited
			if (this._isNodeRestricted(currentNodeId) || this.visitedNodes.has(currentNodeId)) {
				continue;
			}

			// Mark the leading edge as traversed, if it exists, before visiting the node
			if (leadingEdgeId !== null) {
				await delay(200); // Optional: Add a small delay to allow visual emphasis on the edge before the node
				this._markEdgeAsTraversed(leadingEdgeId);

				const leadingEdge = this.graph.edges.find((edge) => edge.id === leadingEdgeId);
				const from = leadingEdge.from === currentNodeId ? leadingEdge.to : leadingEdge.from;
				const to = leadingEdge.from === currentNodeId ? leadingEdge.from : leadingEdge.to;

				addLog(`Edge from '${from}' to '${to}' marked as traversed`, 'info');
			}

			// Now visit the current node
			await this._exploreNode(currentNodeId);
		}
		addLog('Map exploration complete!', 'success');
	}

	async _exploreNode(nodeId) {
		this._visitNode(nodeId);

		let edges = this._getPossibleEdges(nodeId);

		if (!edges || edges.length === 0) {
			addLog(`No possible edges from node '${nodeId}', backtracking...`, 'info');
			return; // Backtrack if there are no possible edges
		}

		await delay(200);

		for (const edge of edges) {
			if (!this.visitedEdges.has(edge.id)) {
				await this._exploreEdge(edge, nodeId);

				const nextNodeId = edge.to === nodeId ? edge.from : edge.to;

				// Only proceed if the next node is unvisited and unrestricted
				if (!this.visitedNodes.has(nextNodeId) && !this._isNodeRestricted(nextNodeId)) {
					addLog(`Adding node '${nextNodeId}' to stack`, 'info');
					// Push the node and the edge that leads to it onto the stack
					this.nodeStack.push({ nodeId: nextNodeId, edgeId: edge.id });
				}
			}
		}
	}

	_getPossibleEdges(nodeId) {
		const possibleEdges = this._getEdgesFromNode(nodeId).filter(
			(e) =>
				!this.visitedEdges.has(e.id) &&
				!this.intraversibleEdges.has(e.id) &&
				get(edgeStates)[e.id]?.type !== 'dashed' &&
				get(edgeStates)[e.id]?.type !== 'restricted'
		);
		addLog(
			`Possible edges from node '${nodeId}': ${JSON.stringify(
				possibleEdges.map((e) => {
					const from = e.from === nodeId ? e.from : e.to;
					const to = e.from === nodeId ? e.to : e.from;
					return { from, to };
				})
			)}`,
			'info'
		);

		return possibleEdges;
	}

	async _exploreEdge(edge, currentNode) {
		await delay(200);
		addLog(`Exploring edge from '${edge.from}' to '${edge.to}'`);
		const targetNodeId = edge.to === currentNode ? edge.from : edge.to; // Ensure target node is the opposite node
		const edgeId = edge.id;

		// Skip if the edge has already been visited
		if (this.visitedEdges.has(edgeId)) return;

		this.visitedEdges.add(edgeId);
		this._updateEdgeState(edge.id, { explState: 'probed', visibility: 'visible' });

		// Check if there's a cone (obstacle) at the target node
		if (this._hasCone(targetNodeId)) {
			this._setEdgeIntraversable(edgeId);
			this._updateNodeState(targetNodeId, { explState: 'restricted', visibility: 'visible' });

			const edge = this.graph.edges.find((e) => e.id === edgeId);
			const from = edge.from === currentNode ? edge.from : edge.to;
			const to = edge.from === currentNode ? edge.to : edge.from;

			addLog(
				`Edge from '${from}' to '${to}' marked as intraversable due to cone at target node '${targetNodeId}'`,
				'warn'
			);
			return; // Skip this edge if it's not traversable
		}

		this._checkIntersections(edge);
	}

	_handleConeDetection(nodeAtIntersection) {
		this._updateNodeState(nodeAtIntersection.id, {
			explState: 'restricted',
			visibility: 'visible'
		});
		this.visitedEdges
			.filter((e) => e.from === nodeAtIntersection.id || e.to === nodeAtIntersection.id)
			.forEach((e) => {
				this._setEdgeIntraversable(e.id);
			});
	}

	_markEdgeAsTraversed(edgeId) {
		this._updateEdgeState(edgeId, { explState: 'visited', visibility: 'visible' });
	}

	// Get all edges originating from a given node
	_getEdgesFromNode(nodeId) {
		return fixedEdges.filter((edge) => {
			return (edge.from === nodeId || edge.to === nodeId) && !this.visitedEdges.has(edge.id);
		});
	}

	_hasCone(nodeId) {
		const nodeState = get(nodeStates)[nodeId];
		const isObstacle = nodeState?.isObstacle || false;
		addLog(`Checking for cone at node '${nodeId}' - isObstacle: ${isObstacle}`, 'info');
		return isObstacle;
	}

	_visitNode(nodeId) {
		addLog(`Visiting node '${nodeId}'`, 'info');
		this.visitedNodes.add(nodeId);
		this._updateNodeState(nodeId, { explState: 'visited', visibility: 'visible' });
	}

	_setEdgeIntraversable(edgeId) {
		this.intraversibleEdges.add(edgeId);
		this._updateEdgeState(edgeId, { explState: 'restricted', visibility: 'visible' });
	}

	_updateEdgeState(edgeId, updateStates) {
		edgeStates.update((states) => {
			// Prevent overwriting if the edge is restricted
			if (states[edgeId]?.explState && states[edgeId]?.explState === 'restricted') return states;

			return {
				...states,
				[edgeId]: {
					...(states[edgeId] || {}),
					...updateStates
				}
			};
		});
	}

	_updateNodeState(nodeId, updateStates) {
		nodeStates.update((states) => {
			// Prevent overwriting if the node is restricted
			if (states[nodeId]?.explState && states[nodeId]?.explState === 'restricted') return states;

			return {
				...states,
				[nodeId]: {
					...(states[nodeId] || {}),
					...updateStates
				}
			};
		});
	}

	_getRandomElementFromList(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	// Helper function to calculate the orientation of ordered triplet (p, q, r)
	_orientation(p, q, r) {
		const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
		if (val === 0) return 0; // collinear
		return val > 0 ? 1 : 2; // clock or counterclock wise
	}

	// Check if point q lies on segment pr
	_onSegment(p, q, r) {
		return (
			q.x <= Math.max(p.x, r.x) &&
			q.x >= Math.min(p.x, r.x) &&
			q.y <= Math.max(p.y, r.y) &&
			q.y >= Math.min(p.y, r.y)
		);
	}

	// Main function to check if segments p1q1 and p2q2 intersect
	_doIntersect(p1, q1, p2, q2) {
		const o1 = this._orientation(p1, q1, p2);
		const o2 = this._orientation(p1, q1, q2);
		const o3 = this._orientation(p2, q2, p1);
		const o4 = this._orientation(p2, q2, q1);

		// General case
		if (o1 !== o2 && o3 !== o4) return true;

		// Special cases
		if (o1 === 0 && this._onSegment(p1, p2, q1)) return true;
		if (o2 === 0 && this._onSegment(p1, q2, q1)) return true;
		if (o3 === 0 && this._onSegment(p2, p1, q2)) return true;
		if (o4 === 0 && this._onSegment(p2, q1, q2)) return true;

		return false;
	}

	// Calculate intersection point if two lines (not segments) intersect
	_calculateIntersection(p1, q1, p2, q2) {
		const a1 = q1.y - p1.y;
		const b1 = p1.x - q1.x;
		const c1 = a1 * p1.x + b1 * p1.y;

		const a2 = q2.y - p2.y;
		const b2 = p2.x - q2.x;
		const c2 = a2 * p2.x + b2 * p2.y;

		const determinant = a1 * b2 - a2 * b1;

		if (determinant === 0) {
			// Lines are parallel, so no intersection
			return null;
		} else {
			const x = (b2 * c1 - b1 * c2) / determinant;
			const y = (a1 * c2 - a2 * c1) / determinant;
			return { x, y };
		}
	}

	// Method to check if a node exists within a margin of error from an intersection point
	_isNodeNearIntersection(intersectionPoint, margin = 10) {
		for (const node of fixedNodes) {
			const dx = node.x - intersectionPoint.x;
			const dy = node.y - intersectionPoint.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// If the distance is within the margin, a node is close enough
			if (distance <= margin) {
				return node; // Return the existing node
			}
		}

		// No nearby node found within the margin
		return null;
	}

	_isNodeRestricted(nodeId) {
		return get(nodeStates)[nodeId]?.explState === 'restricted';
	}

	_checkIntersections(edge) {
		const { nodes, edges } = this.graph;
		const [p1, q1] = [edge.from, edge.to].map((id) => nodes.find((node) => node.id === id));

		for (const visitedEdgeId of this.visitedEdges) {
			const visitedEdge = edges.find((e) => e.id === visitedEdgeId);
			if (!visitedEdge) continue;

			const [p2, q2] = [visitedEdge.from, visitedEdge.to].map((id) =>
				nodes.find((node) => node.id === id)
			);

			// Check if the current edge intersects with the visited edge
			if (!this._doIntersect(p1, q1, p2, q2)) continue;

			const intersectionPoint = this._calculateIntersection(p1, q1, p2, q2);
			if (!intersectionPoint) continue;
		}
	}
}
