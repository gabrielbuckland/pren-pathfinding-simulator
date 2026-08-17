<script>
	import { executionMode } from '../stores.js';
	import SegmentedControl from './SegmentedControl.svelte';

	const modes = [
		{ id: 'single', label: 'Single run' },
		{ id: 'bulk', label: 'Bulk run' }
	];
</script>

<SegmentedControl options={modes} bind:value={$executionMode} label="Execution mode" />
