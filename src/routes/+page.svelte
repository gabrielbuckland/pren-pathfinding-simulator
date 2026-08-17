<script>
	import Container from '../lib/components/Container.svelte';
	import Title from '../lib/components/Title.svelte';
	import LogViewer from '../lib/components/LogViewer.svelte';
	import { nodeStates, edgeStates, selectedEndpoint } from '../lib/stores.js';
	import { generateRandomGraph, getRandomGoalNode } from '../lib/utils';
	import { defaultNodeStates, defaultEdgeStates } from '../lib/graphStructure.js';
	import GraphViewer from '../lib/components/GraphViewer.svelte';
	import DashboardViewer from '../lib/components/DashboardViewer.svelte';
	import Legend from '../lib/components/Legend.svelte';
	import { executionMode } from '../lib/stores.js';

	function resetGraph() {
		// Clone, so the shared defaults never end up in the store by reference.
		nodeStates.set(structuredClone(defaultNodeStates));
		edgeStates.set(structuredClone(defaultEdgeStates));
	}

	function randomizeGraph() {
		const goalNodeId = getRandomGoalNode();
		const { randomNodes, randomEdges } = generateRandomGraph(goalNodeId);
		nodeStates.set(randomNodes);
		edgeStates.set(randomEdges);

		// The generated map only guarantees a route to this goal, so select it.
		// Leaving the previous endpoint selected would let the user run against a
		// target the map has no route to.
		selectedEndpoint.set(goalNodeId);
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
			<div class="map-actions">
				<button class="randomize-btn" on:click={randomizeGraph}>Randomize</button>
				<button on:click={resetGraph}>Clear</button>
			</div>
		</div>
		<p class="edit-hint">
			Click an edge to cycle passable, missing and barrier. Click a node to place a pylon.
		</p>
		<div class="graph-area">
			<GraphViewer />
			{#if $executionMode === 'single'}
				<Legend />
			{/if}
		</div>
	</div>

	<div slot="right-top" class="right-top-pane">
		<DashboardViewer />
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

	/* Keeps the legend attached to the graph instead of the bottom of the pane. */
	.graph-area {
		margin: auto;
	}

	/* Definite height so the dashboard can push its run button to the bottom. */
	.right-top-pane {
		height: 100%;
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
		margin-bottom: 0.5rem;
	}

	/* The heading's own bottom margin would make this row taller than the
	   heading, pushing the buttons below its centre line. */
	.title-reset-container :global(h1) {
		margin-bottom: 0;
	}

	.map-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* The map is only editable by clicking it, which nothing else says. */
	.edit-hint {
		margin: 0.25rem 0 0 0;
		font-size: 0.85rem;
		color: #666;
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
