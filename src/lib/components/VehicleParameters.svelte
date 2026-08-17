<script>
	import { vehicleParameters } from '../stores.js';

	// All three feed both run modes, so they belong in one row rather than
	// split across sections.
	const fields = [
		{ key: 'timeToTraverse', label: 'Traverse edge' },
		{ key: 'timeWithBarrier', label: 'Traverse with barrier' },
		{ key: 'timeToExploreEdges', label: 'Scan edge' }
	];

	function update(key, value) {
		const parsed = Number(value);
		if (Number.isNaN(parsed) || parsed < 0) return;
		vehicleParameters.update((params) => ({ ...params, [key]: parsed }));
	}
</script>

<div class="row">
	{#each fields as field}
		<label>
			{field.label}
			<input
				type="number"
				min="0"
				step="0.1"
				value={$vehicleParameters[field.key]}
				on:input={(event) => update(field.key, event.currentTarget.value)}
			/>
		</label>
	{/each}
</div>
<p class="unit-note">All values in time units.</p>

<style>
	.row {
		display: flex;
		width: 100%;
		gap: 1rem;
	}

	label {
		flex: 1;
		min-width: 0;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
		margin-top: 0.25rem;
	}

	.unit-note {
		margin: 0.5rem 0 0 0;
		font-size: 0.85rem;
		color: #666;
	}
</style>
