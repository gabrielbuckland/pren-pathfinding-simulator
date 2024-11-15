<script>
	import { selectedEndpoint } from '../stores.js';
</script>

<div class="endpoint-selection">
	<label>Select endpoint:</label>
	<div class="radio-buttons">
		<label>
			<input type="radio" name="endpoint" value="A" bind:group={$selectedEndpoint} />
			A
		</label>
		<label>
			<input type="radio" name="endpoint" value="B" bind:group={$selectedEndpoint} />
			B
		</label>
		<label>
			<input type="radio" name="endpoint" value="C" bind:group={$selectedEndpoint} />
			C
		</label>
	</div>
</div>

<style>
	label {
		margin-bottom: 1rem;
	}

	.endpoint-selection {
		margin-bottom: 1rem;
	}

	.radio-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.radio-buttons label {
		display: flex;
		align-items: center;
	}

	.radio-buttons input[type='radio'] {
		margin-right: 0.5rem;
	}
</style>
