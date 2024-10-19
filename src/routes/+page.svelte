<script>
	import Container from '../lib/components/Container.svelte';
	import Graph from '../lib/components/Graph.svelte';
	import Title from '../lib/components/Title.svelte';
	import VehicleParameters from '../lib/components/VehicleParameters.svelte';
	import AlgorithmSelection from '../lib/components/AlgorithmSelection.svelte';
	import SimulatorOptions from '../lib/components/SimulatorOptions.svelte';
</script>

<svelte:head>
	<title>Simulator</title>
	<meta name="description" content="Simulator" />
</svelte:head>

<Container>
	<!-- Left Pane -->
	<div slot="left" class="left-pane">
		<Title>Graph</Title>
		<Graph />
	</div>

	<!-- Right Pane -->
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
</style>
