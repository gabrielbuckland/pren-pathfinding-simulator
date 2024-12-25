import { get } from 'svelte/store';
import { fixedNodes, fixedEdges } from './graphStructure';
import {
	nodeStates,
	edgeStates,
	selectedEndpoint,
	vehicleParameters,
	executionMode
} from './stores';
import { delay } from './utils';
import { addLog } from './logging';

const addCustomLog = function (message, level) {
	if (get(executionMode) === 'parameterized') return;
	addLog(message, level);
};

export class GraphExplorer {
	constructor(
		startNodeId = 'S',
		delayInMilliseconds = 200,
		{ nodeStates, edgeStates, $selectedEndpoint, exMode, endPoint } = {
			exMode: get(executionMode)
		}
	) {
		this.startNodeId = startNodeId;
		this.goalNodeId = endPoint ?? get(selectedEndpoint);
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
		this.nodeDelay = exMode === 'explore' ? delayInMilliseconds : 0;
		this.exploreEdgeDelay =
			exMode === 'explore' ? delayInMilliseconds : get(vehicleParameters).timeToExploreEdges;
		this.solidEdgeTraversalDelay =
			exMode === 'explore' ? delayInMilliseconds : get(vehicleParameters).timeToTraverse;
		this.barrierEdgeTraversalDelay =
			exMode === 'explore' ? delayInMilliseconds * 3 : get(vehicleParameters).timeWithBarrier;
		this.vectorToGoal = this._getGoalNodeVector();
		this.targetSection = this._getNodeSection(
			this.graph.nodes.find((n) => n.id === this.goalNodeId)
		);
		this.goalReached = false;
		this.traversedEdges = [];
		this.exMode = exMode;
	}

	async explore() {
		console.log(this.solidEdgeTraversalDelay, this.barrierEdgeTraversalDelay);

		addCustomLog('Starting map exploration...', 'info');
		this.nodeStack.push({ nodeId: this.startNodeId, edgeId: null }); // Initialize with start node and no leading edge

		while (this.nodeStack.length > 0) {
			const { nodeId: currentNodeId, edgeId: leadingEdgeId } = this.nodeStack.pop();

			// Skip nodes that are restricted or already visited
			if (this._isNodeRestricted(currentNodeId) || this.visitedNodes.has(currentNodeId)) {
				continue;
			}

			// Mark the leading edge as traversed, if it exists, before visiting the node
			if (leadingEdgeId !== null) {
				await this._markEdgeAsTraversed(leadingEdgeId);

				const leadingEdge = this.graph.edges.find((edge) => edge.id === leadingEdgeId);
				const from = leadingEdge.from === currentNodeId ? leadingEdge.to : leadingEdge.from;
				const to = leadingEdge.from === currentNodeId ? leadingEdge.from : leadingEdge.to;

				addCustomLog(`Edge from '${from}' to '${to}' marked as traversed`, 'info');
			}

			// Now visit the current node
			await this._exploreNode(currentNodeId);
		}
		addCustomLog('Map exploration complete!', 'success');
	}

	async _exploreNode(nodeId) {
		await this._visitNode(nodeId);
		if (nodeId === this.goalNodeId) {
			this.nodeStack = [];
			this.goalReached = true;
			return;
		}

		let edges = await this._getPossibleEdges(nodeId);

		if (!edges || edges.length === 0) {
			addCustomLog(`No possible edges from node '${nodeId}', backtracking...`, 'info');
			return; // Backtrack if there are no possible edges
		}

		for (const edge of edges) {
			if (!this.visitedEdges.has(edge.id)) {
				await this._exploreEdge(edge, nodeId);

				const nextNodeId = edge.to === nodeId ? edge.from : edge.to;

				// Only proceed if the next node is unvisited and unrestricted
				if (!this.visitedNodes.has(nextNodeId) && !this._isNodeRestricted(nextNodeId)) {
					addCustomLog(`Adding node '${nextNodeId}' to stack`, 'info');
					// Push the node and the edge that leads to it onto the stack
					this.nodeStack.push({ nodeId: nextNodeId, edgeId: edge.id });
				}
			}
		}
	}

	_getGoalNodeVector() {
		const startNode = this.graph.nodes.find((n) => n.id === this.startNodeId);
		const goalNode = this.graph.nodes.find((n) => n.id === this.goalNodeId);

		return {
			x: goalNode.x - startNode.x,
			y: goalNode.y - startNode.y
		};
	}

	_getEdgeVector(edge) {
		const fromNode = this.graph.nodes.find((node) => node.id === edge.from);
		const toNode = this.graph.nodes.find((node) => node.id === edge.to);

		if (fromNode && toNode) {
			return {
				x: toNode.x - fromNode.x,
				y: toNode.y - fromNode.y
			};
		}
		return null;
	}

	_calculateVectorAlignment(vector1, vector2) {
		const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
		const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
		const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);

		return dotProduct / (magnitude1 * magnitude2); // Cosine similarity
	}

	async _getPossibleEdges(nodeId) {
		const goalNode = this.graph.nodes.find((n) => n.id === this.goalNodeId);
		const currentNode = this.graph.nodes.find((n) => n.id === nodeId);

		// Recalculate the vector to the goal based on the current node
		const vectorToGoal = {
			x: goalNode.x - currentNode.x,
			y: goalNode.y - currentNode.y
		};

		const targetSection = this._getNodeSection(goalNode); // Determine target section based on goal
		const currentSection = this._getNodeSection(currentNode);

		// Define scoring adjustments
		const sectionBoost = 3; // Boost for staying in the target section
		const wrongDirectionPenalty = 0.5; // Penalty for wrong direction even within the target section
		const directionBoost = 3; // Boost for correct direction within the target section
		const returnBoost = 2; // Boost for returning to the target section
		const furtherAwayPenalty = -2; // Strong penalty for moving further from the target section

		const possibleEdges = this._getEdgesFromNode(nodeId).filter(
			(e) =>
				!this.visitedEdges.has(e.id) &&
				!this.intraversibleEdges.has(e.id) &&
				get(edgeStates)[e.id]?.type !== 'dashed' &&
				get(edgeStates)[e.id]?.type !== 'restricted'
		);

		possibleEdges.sort((edgeA, edgeB) => {
			// Adjust the direction of the vector based on the `nodeId` position
			const vectorA =
				edgeA.from === nodeId
					? this._getEdgeVector(edgeA) // Edge is correctly directed
					: { x: -this._getEdgeVector(edgeA).x, y: -this._getEdgeVector(edgeA).y }; // Reverse the vector

			const vectorB =
				edgeB.from === nodeId
					? this._getEdgeVector(edgeB)
					: { x: -this._getEdgeVector(edgeB).x, y: -this._getEdgeVector(edgeB).y };

			if (vectorA && vectorB) {
				// Calculate alignment (cosine similarity) with the dynamic goal vector
				const alignmentA = this._calculateVectorAlignment(vectorA, vectorToGoal);
				const alignmentB = this._calculateVectorAlignment(vectorB, vectorToGoal);

				// Normalize the dot product to check the direction explicitly
				const magnitudeGoal = Math.sqrt(vectorToGoal.x ** 2 + vectorToGoal.y ** 2);
				const magnitudeA = Math.sqrt(vectorA.x ** 2 + vectorA.y ** 2);
				const magnitudeB = Math.sqrt(vectorB.x ** 2 + vectorB.y ** 2);

				const directionA =
					(vectorA.x * vectorToGoal.x + vectorA.y * vectorToGoal.y) / (magnitudeA * magnitudeGoal);
				const directionB =
					(vectorB.x * vectorToGoal.x + vectorB.y * vectorToGoal.y) / (magnitudeB * magnitudeGoal);

				// Determine section of each target node
				const targetNodeA = edgeA.to === nodeId ? edgeA.from : edgeA.to;
				const targetNodeB = edgeB.to === nodeId ? edgeB.from : edgeB.to;
				const sectionA = this._getNodeSection(this.graph.nodes.find((n) => n.id === targetNodeA));
				const sectionB = this._getNodeSection(this.graph.nodes.find((n) => n.id === targetNodeB));

				// Helper function to determine section distance
				const getSectionDistance = (fromSection, toSection) => {
					const sections = ['left', 'middle', 'right'];
					return Math.abs(sections.indexOf(fromSection) - sections.indexOf(toSection));
				};

				// Section distances
				const targetDistanceA = getSectionDistance(sectionA, targetSection);
				const targetDistanceB = getSectionDistance(sectionB, targetSection);

				// Score calculation
				let scoreA = 0;
				let scoreB = 0;

				// **Step 1**: Prioritize sections
				if (sectionA === targetSection) scoreA += sectionBoost; // Staying in the target section
				if (sectionB === targetSection) scoreB += sectionBoost;

				if (targetDistanceA < targetDistanceB) {
					scoreA += returnBoost; // Moving closer to the target section
				} else if (targetDistanceB < targetDistanceA) {
					scoreB += returnBoost;
				}

				// **Step 2**: Apply directional scores if both edges lead to the same section
				if (targetDistanceA === targetDistanceB) {
					const directionalScoreA =
						directionA >= 0
							? alignmentA + directionBoost * directionA
							: alignmentA * wrongDirectionPenalty;
					const directionalScoreB =
						directionB >= 0
							? alignmentB + directionBoost * directionB
							: alignmentB * wrongDirectionPenalty;

					scoreA += directionalScoreA;
					scoreB += directionalScoreB;
				}

				// Sort by the composite score (higher is better)
				return scoreA - scoreB;
			}
			return 0; // Keep the original order if no alignment can be calculated
		});

		addCustomLog(
			`Prioritized edges from node '${nodeId}' with section and direction priority: ${JSON.stringify(
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
		await delay(this.exploreEdgeDelay);

		addCustomLog(`Exploring edge from '${edge.from}' to '${edge.to}'`);
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

			const from = edge.from === currentNode ? edge.from : edge.to;
			const to = edge.from === currentNode ? edge.to : edge.from;

			addCustomLog(
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

	async _markEdgeAsTraversed(edgeId) {
		await delay(
			get(edgeStates)[edgeId]?.type === 'barrier'
				? this.barrierEdgeTraversalDelay
				: this.solidEdgeTraversalDelay
		);
		const edge = this.graph.edges.find((e) => e.id === edgeId);
		this.traversedEdges.push({ from: edge.from, to: edge.to });
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
		addCustomLog(`Checking for cone at node '${nodeId}' - isObstacle: ${isObstacle}`, 'info');
		return isObstacle;
	}

	async _visitNode(nodeId) {
		await delay(this.nodeDelay);
		addCustomLog(`Visiting node '${nodeId}'`, 'info');
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

			const nodeAtIntersection = this._isNodeNearIntersection(intersectionPoint, 10);
			if (nodeAtIntersection && get(nodeStates)[nodeAtIntersection.id]?.explState === 'default') {
				const from = edge.from === nodeAtIntersection.id ? edge.from : edge.to;
				const to = edge.from === nodeAtIntersection.id ? edge.to : edge.from;
				addCustomLog(
					`Node '${nodeAtIntersection.id}' detected due to intersection of 'Edge (${to} - ${from})' and 'Edge (${visitedEdge.to} - ${visitedEdge.from}'`
				);
				this._updateNodeState(nodeAtIntersection.id, {
					explState: 'probed',
					visibility: 'visible'
				});
			}
		}
	}

	_getNodeSection(node) {
		if (node.x < 186.67) return 'left';
		if (node.x < 2 * 186.67) return 'middle';
		return 'right';
	}

	hasReachedGoal() {
		return this.goalReached;
	}

	getTraversedEdges() {
		return this.traversedEdges;
	}
}
