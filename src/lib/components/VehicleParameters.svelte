<script>
	import { vehicleParameters } from '../stores.js';

	let timeToTraverse;
	let timeWithBarrier;

	vehicleParameters.subscribe((params) => {
		timeToTraverse = params.timeToTraverse;
		timeWithBarrier = params.timeWithBarrier;
	});

	function updateVehicleParameters() {
		vehicleParameters.set({ timeToTraverse, timeWithBarrier });
	}
</script>

<div class="vehicle-parameters">
	<div class="row">
		<label>
			Time to traverse edge (cm/s):
			<input
				type="number"
				min="0"
				step="0.1"
				bind:value={timeToTraverse}
				on:input={updateVehicleParameters}
			/>
		</label>

		<label>
			Time to traverse edge with barrier (cm/s):
			<input
				type="number"
				min="0"
				step="0.1"
				bind:value={timeWithBarrier}
				on:input={updateVehicleParameters}
			/>
		</label>
	</div>
</div>

<style>
	.vehicle-parameters {
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
