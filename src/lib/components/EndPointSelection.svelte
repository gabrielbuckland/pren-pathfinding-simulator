<script>
	import { selectedEndpoint } from '../stores.js';
</script>

<div class="endpoint-selection">
	<span class="group-label">Select endpoint:</span>
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
	.endpoint-selection {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.radio-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 0.5rem;
		padding: 0.5rem 0;
	}

	.radio-buttons label {
		display: flex;
		align-items: center;
	}

	.radio-buttons input[type='radio'] {
		margin-right: 0.4rem;
	}
</style>
