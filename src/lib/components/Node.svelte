<script>
	export let id = 0;
	export let x = 0;
	export let y = 0;
	export let isObsticle = false;

	// Function to handle double-click and set `isObsticle` to true
	function handleClick() {
		// Use the $ assignment to notify Svelte of a state change
		isObsticle = !isObsticle; // Toggle obstacle state on double click
	}
</script>

<button
	class="node {isObsticle ? 'obsticle' : ''}"
	style="left: {x}px; top: {y}px"
	on:click={handleClick}
>
	<span>{id}</span>
</button>

<style>
	.node {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		border: none;
		outline: 2px solid black;
		outline-offset: -2px;
		background-color: white;
		position: absolute;
		z-index: 5;
		transform: translate(-50%, -50%); /* Center the node at (x, y) */
		cursor: pointer; /* Add a pointer cursor to indicate clickable */
	}

	.node.obsticle {
		width: 3rem;
		height: 3rem;
		outline: none;
		background-color: transparent;
		background-image: url('/src/lib/images/cone.png');
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
		font-weight: 700;
		text-shadow: 0 0 0.8rem black;
		transform: translate(-50%, -75%); /* Center the node at (x, y) */
	}
</style>
