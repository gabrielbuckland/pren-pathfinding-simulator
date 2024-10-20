<script>
	import Container from '../lib/components/Container.svelte';
	import Graph from '../lib/components/Graph.svelte';
	import Title from '../lib/components/Title.svelte';
	import VehicleParameters from '../lib/components/VehicleParameters.svelte';
	import AlgorithmSelection from '../lib/components/AlgorithmSelection.svelte';
	import SimulatorOptions from '../lib/components/SimulatorOptions.svelte';
	import { nodeStates, edgeStates } from '../lib/stores.js';

	function resetGraph() {
		nodeStates.set({});
		edgeStates.set({});
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
			<button on:click={resetGraph}>Reset graph</button>
		</div>
		<Graph />
	</div>

	<div slot="right" class="right-pane">
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
</Container>

<style>
	.left-pane {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.right-pane {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
	}

	.section {
		padding: 1rem;
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
</style>
