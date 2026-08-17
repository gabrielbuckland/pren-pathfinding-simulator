<script>
	import { selectedEndpoint } from '../stores.js';
	import SegmentedControl from './SegmentedControl.svelte';

	const goals = [
		{ id: 'A', label: 'A' },
		{ id: 'B', label: 'B' },
		{ id: 'C', label: 'C' }
	];
</script>

<div class="endpoint-selection">
	<span class="group-label">Endpoint</span>
	<SegmentedControl options={goals} bind:value={$selectedEndpoint} label="Endpoint" />
</div>

<style>
	.endpoint-selection {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.group-label {
		margin-bottom: 0.25rem;
	}
</style>
