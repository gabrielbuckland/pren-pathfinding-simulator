<script>
	import Container from '../lib/components/Container.svelte';
	import Title from '../lib/components/Title.svelte';
	import VehicleParameters from '../lib/components/VehicleParameters.svelte';
	import AlgorithmSelection from '../lib/components/AlgorithmSelection.svelte';
	import SimulatorOptions from '../lib/components/SimulatorOptions.svelte';
	import LogViewer from '../lib/components/LogViewer.svelte';
	import { nodeStates, edgeStates, executionMode } from '../lib/stores.js';
	import { resetExplorationStates, generateRandomGraph, getRandomGoalNode } from '../lib/utils';
	import { defaultNodeStates, defaultEdgeStates } from '../lib/graphStructure.js';
	import ExecutionOption from '../lib/components/ExecutionOption.svelte';
	import RunSimulationButton from '../lib/components/RunSimulationButton.svelte';
	import EndPointSelection from '../lib/components/EndPointSelection.svelte';
	import NumberOfRunsInput from '../lib/components/NumberOfRunsInput.svelte';
	import GraphViewer from '../lib/components/GraphViewer.svelte';
	import DashboardConfig from '../lib/components/DashboardConfig.svelte';

	function resetGraph() {
		nodeStates.set(defaultNodeStates);
		edgeStates.set(defaultEdgeStates);
	}

	function resetState() {
		resetExplorationStates();
	}

	function randomizeGraph() {
		const randomNodeId = getRandomGoalNode();
		const { randomNodes, randomEdges } = generateRandomGraph(randomNodeId);
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
		<GraphViewer />
	</div>

	<div slot="right-top" class="right-top-pane">
		<DashboardConfig />
	</div>

	<div slot="right-bottom" class="right-bottom-pane">
		<LogViewer />
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
		height: 100%;
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
