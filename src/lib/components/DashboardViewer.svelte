<script>
	import { executionMode } from '../stores';
	import ExecutionOption from './ExecutionOption.svelte';
	import NumberOfRunsInput from './NumberOfRunsInput.svelte';
	import RunSimulationButton from './RunSimulationButton.svelte';
	import SimulatorOptions from './SimulatorOptions.svelte';
	import Title from './Title.svelte';
	import VehicleParameters from './VehicleParameters.svelte';
</script>

<Title>Dashboard</Title>

<div class="section">
	<Title>Execution mode:</Title>
	<ExecutionOption />
</div>

<div class="section">
	<Title>Vehicle-Parameters:</Title>
	<VehicleParameters />
</div>

<div class="section">
	<Title>Simulator-Options:</Title>
	{#if $executionMode === 'single'}
		<SimulatorOptions />
	{:else}
		<NumberOfRunsInput />
	{/if}
</div>

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
