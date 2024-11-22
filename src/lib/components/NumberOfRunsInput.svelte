<script>
	import { numberOfRuns } from '../stores';

	let label = '';
	let min = 10;
	let step = 10;
	let number = 10;

	function updateNumber() {
		numberOfRuns.set(number);
	}

	updateNumber();
</script>

<label>
	{label}
	<input type="number" {min} {step} bind:value={number} on:input={updateNumber} />
</label>

<style>
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
