<div class="container">
	<div class="pane left-pane">
		<slot name="left"></slot>
	</div>
	<div class="pane right-pane">
		<div class="right-pane-content">
			<div class="right-top">
				<slot name="right-top"></slot>
			</div>
			<div class="right-bottom">
				<slot name="right-bottom"></slot>
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: 4fr 6fr;
		grid-template-rows: 100vh;
		width: 100%;
		box-sizing: border-box;
	}

	.pane {
		box-sizing: border-box;
		padding: 0;
	}

	.left-pane {
		max-height: 100%;
		border: 2px solid black;
		padding: 0.5rem 1rem 1rem 1rem;
	}

	.right-pane {
		border: 2px solid black;
		border-left: none;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.right-pane-content {
		/* flex: 1; */
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.right-top {
		flex: 0 0 60%;
		overflow-y: auto;
	}

	.right-bottom {
		flex: 0 0 40%;
		height: 40%;
		overflow: clip;
	}
</style>
