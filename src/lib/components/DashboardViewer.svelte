<script>
	import { executionMode } from '../stores';
	import AlgorithmSelection from './AlgorithmSelection.svelte';
	import ExecutionOption from './ExecutionOption.svelte';
	import NumberOfRunsInput from './NumberOfRunsInput.svelte';
	import RunSimulationButton from './RunSimulationButton.svelte';
	import SimulatorOptions from './SimulatorOptions.svelte';
	import TimeToExploreEdgesInput from './TimeToExploreEdgesInput.svelte';
	import Title from './Title.svelte';
	import VehicleParameters from './VehicleParameters.svelte';
</script>

<Title>Dashboard</Title>
<div class="section">
	<Title>Execution mode:</Title>
	<ExecutionOption />
</div>

<!-- All three timings feed both modes now that Exploration is an algorithm,
     so they are configured in one place instead of per mode. -->
<div class="section">
	<Title>Vehicle-Parameters:</Title>
	<VehicleParameters />
	<TimeToExploreEdgesInput />
</div>

{#if $executionMode === 'single'}
	<div class="section">
		<Title>Algorithm-Selection:</Title>
		<AlgorithmSelection />
	</div>
	<div class="section">
		<Title>Simulator-Options:</Title>
		<SimulatorOptions />
	</div>
{:else}
	<div class="section">
		<Title>Number of runs:</Title>
		<NumberOfRunsInput />
	</div>
{/if}

<RunSimulationButton />

<style>
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
</style>
