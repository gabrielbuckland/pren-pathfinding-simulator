<script>
	import Container from '../lib/components/Container.svelte';
	import Graph from '../lib/components/Graph.svelte';
	import Title from '../lib/components/Title.svelte';
	import VehicleParameters from '../lib/components/VehicleParameters.svelte';
	import AlgorithmSelection from '../lib/components/AlgorithmSelection.svelte';
	import SimulatorOptions from '../lib/components/SimulatorOptions.svelte';
	import Logger from '../lib/components/Logger.svelte';
	import { nodeStates, edgeStates } from '../lib/stores.js';
	import {
		fixedNodes,
		fixedEdges,
		defaultNodeStates,
		defaultEdgeStates
	} from '../lib/graphStructure.js';

	function resetGraph() {
		nodeStates.set(defaultNodeStates);
		edgeStates.set(defaultEdgeStates);
	}

	function resetState() {
		nodeStates.update((nodes) => {
			const newNodes = {};
			Object.keys(nodes).forEach((nodeId) => {
				newNodes[nodeId] = {
					...nodes[nodeId],
					explState: 'default'
				};
			});
			return newNodes;
		});

		edgeStates.update((edges) => {
			const newEdges = {};
			Object.keys(edges).forEach((edgeId) => {
				newEdges[edgeId] = {
					...edges[edgeId],
					explState: 'default'
				};
			});
			return newEdges;
		});
	}

	function randomizeGraph() {
		const randomNodes = {};
		fixedNodes.forEach((node) => {
			randomNodes[node.id] = {
				isObstacle: Math.random() < 0.3,
				explState: 'default'
			};
		});

		const edgeTypes = ['solid', 'dashed', 'barrier'];
		const randomEdges = {};
		fixedEdges.forEach((edge) => {
			randomEdges[edge.id] = {
				type: edgeTypes[Math.floor(Math.random() * edgeTypes.length)],
				explState: 'default'
			};
		});

		nodeStates.set(randomNodes);
		edgeStates.set(randomEdges);
	}
</script>

<svelte:head>
	<title>Simulator</title>
	<meta name="description" content="Simulator" />
</svelte:head>

<Container>
	<div slot="left" class="left-pane">
		<div class="title-reset-container">
			<Title>Graph</Title>
			<div class="button-container">
				<button class="randomize-btn" on:click={randomizeGraph}>Randomized graph</button>
				<button on:click={resetGraph}>Reset graph</button>
				<button on:click={resetState}>Reset state</button>
			</div>
		</div>
		<Graph />
	</div>

	<div slot="right-top" class="right-top-pane">
		<Title>Dashboard</Title>

		<div class="section">
			<Title>Vehicle-Parameters:</Title>
			<VehicleParameters />
		</div>

		<div class="section">
			<Title>Algorithm-Selection:</Title>
			<AlgorithmSelection />
		</div>

		<div class="section">
			<Title>Simulator-Options:</Title>
			<SimulatorOptions />
		</div>
	</div>

	<div slot="right-bottom" class="right-bottom-pane">
		<Logger />
	</div>
</Container>

<style>
	.left-pane {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.right-top-pane {
		padding: 0.5rem 1rem 1rem 1rem;
		margin: 0;
	}

	.right-bottom-pane {
		padding: 0;
		margin: 0;
	}

	.section {
		padding-block: 1rem;
	}

	.section:last-child {
		border-bottom: none;
	}

	.section :global(h1) {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	.title-reset-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.button-container {
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.75rem;
		background-color: #007bff;
		color: #fff;
		border: none;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	.randomize-btn {
		background-color: #6c757d;
	}

	.randomize-btn:hover {
		background-color: #5a6268;
	}
</style>
