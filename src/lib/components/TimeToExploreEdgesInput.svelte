<script>
	import { vehicleParameters } from '../stores.js';

	let timeToExploreEdges;

	vehicleParameters.subscribe((params) => {
		timeToExploreEdges = params.timeToExploreEdges;
	});

	function updateTimeToExploreEdges(newTime) {
		vehicleParameters.update((params) => ({
			...params,
			timeToExploreEdges: timeToExploreEdges
		}));
	}
</script>

<div class="time-to-explore-edges">
	<div class="row">
		<label>
			Time to explore edges:
			<input
				type="number"
				min="0"
				step="1"
				bind:value={timeToExploreEdges}
				on:input={updateTimeToExploreEdges}
			/>
		</label>
	</div>
</div>

<style>
	.time-to-explore-edges {
		display: flex;
		flex-direction: column;
	}

	.row {
		display: flex;
		width: 100%;
		gap: 1rem;
	}

	label {
		flex: 1;
		margin-bottom: 1rem;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
	}
</style>
