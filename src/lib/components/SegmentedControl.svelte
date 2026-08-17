<script>
	/**
	 * Single-select control shared by the execution mode and the goal picker, so
	 * the two stay identical by construction rather than by two copies of the
	 * same CSS.
	 */
	export let options = [];
	export let value;
	export let label = '';
</script>

<div class="segmented-button" role="group" aria-label={label}>
	{#each options as option}
		<button
			type="button"
			class:selected={value === option.id}
			aria-pressed={value === option.id}
			on:click={() => (value = option.id)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.segmented-button {
		display: flex;
		width: 100%;
	}

	.segmented-button button {
		flex: 1;
		padding: 0.5rem;
		background-color: #f1f1f1;
		color: #000;
		border: 1px solid #ccc;
		cursor: pointer;
	}

	.segmented-button button:not(:first-child) {
		border-left: none;
	}

	.segmented-button button:hover {
		background-color: #e0e0e0;
	}

	.segmented-button button.selected {
		background-color: #007bff;
		color: #fff;
		border-color: #0056b3;
	}
</style>
