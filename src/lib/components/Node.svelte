<script>
	import { selectedEndpoint, nodeStates } from '../stores.js';

	export let id = 0;
	export let x = 0;
	export let y = 0;
	export let isObstacle = false;
	export let explState = 'default';
	export let visibility = 'visible';

	function handleClick() {
		isObstacle = !isObstacle;

		nodeStates.update((states) => {
			return {
				...states,
				[id]: {
					...states[id],
					isObstacle
				}
			};
		});
	}
</script>

<button
	class="node {isObstacle ? 'obsticle' : ''} state-{explState} {visibility === 'hidden'
		? 'hidden'
		: ''}"
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

	.node.state-default {
	}

	.node.state-visited {
		background-color: green;
		color: white;
		outline: 2px solid green;
	}

	.node.state-probed {
		background-color: yellow;
		color: black;
		outline: 2px solid yellow;
	}

	.node.state-restricted {
		background-color: red;
		color: white;
		outline: 2px solid red;
	}

	.node.state-finished {
		background-color: blue;
		color: white;
		outline: 2px solid blue;
	}

	.hidden {
		opacity: 0;
		pointer-events: none;
	}
</style>
