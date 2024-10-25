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
		display: flex;
		width: 100%;
		height: 98vh;
		box-sizing: border-box;
	}

	.pane {
		box-sizing: border-box;
		padding: 0;
	}

	.left-pane {
		flex: 0 0 40%;
		border-right: 2px solid #000;
		border-left: 2px solid #000;
		border-top: 2px solid #000;
		border-bottom: 2px solid #000;
		padding: 0.5rem 1rem 1rem 1rem;
	}

	.right-pane {
		flex: 0 0 60%;
		border-left: none;
		border-right: 2px solid #000;
		border-top: 2px solid #000;
		border-bottom: 2px solid #000;
		display: flex;
		flex-direction: column;
	}

	.right-pane-content {
		flex: 1;
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
	}
</style>
