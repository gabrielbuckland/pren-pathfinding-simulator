<script>
	import { executionMode } from '../stores';
	import ExecutionOption from './ExecutionOption.svelte';
	import NumberOfRunsInput from './NumberOfRunsInput.svelte';
	import RunSimulationButton from './RunSimulationButton.svelte';
	import SimulatorOptions from './SimulatorOptions.svelte';
	import Title from './Title.svelte';
	import VehicleParameters from './VehicleParameters.svelte';
</script>

<div class="dashboard">
	<Title>Dashboard</Title>

	<div class="section">
		<Title>Execution mode</Title>
		<ExecutionOption />
	</div>

	<div class="section">
		<Title>Vehicle parameters</Title>
		<VehicleParameters />
	</div>

	<div class="section">
		<Title>Simulator options</Title>
		{#if $executionMode === 'single'}
			<SimulatorOptions />
		{:else}
			<NumberOfRunsInput />
		{/if}
	</div>

	<!-- Pushed to the bottom edge of the pane, so it stays in the same place
	     regardless of how many options the selected mode shows. -->
	<div class="run-action">
		<RunSimulationButton />
	</div>
</div>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.section {
		padding-block: 1rem;
	}

	.section :global(h1) {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	.run-action {
		margin-top: auto;
		padding-top: 1rem;
	}
</style>
