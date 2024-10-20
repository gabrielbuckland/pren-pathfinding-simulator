<script>
	import { selectedEndpoint } from '../stores.js';

	export let id = 0;
	export let x = 0;
	export let y = 0;
	export let isObsticle = false;

	function handleClick() {
		isObsticle = !isObsticle;
	}
</script>

<button
	class="node {isObsticle ? 'obsticle' : ''}"
	style="left: {x}px; top: {y}px"
	on:click={handleClick}
>
	<span class:selected-endpoint={id === $selectedEndpoint}>{id}</span>
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
		transform: translate(-50%, -50%);
		cursor: pointer;
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
		transform: translate(-50%, -75%);
	}

	.selected-endpoint {
		font-weight: bold;
	}
</style>
