<!-- Container.svelte -->
<div class="container">
	<div class="pane">
	  <slot name="left"></slot>
	</div>
	<div class="pane">
	  <slot name="right"></slot>
	</div>
  </div>

  <style>
	.container {
		display: flex;
		width: 100%;
		height: 100vh;
		box-sizing: border-box;
	}

	.pane {
		flex: 1;
		border: 2px solid #000;
		box-sizing: border-box;
		padding: 0.5rem 1rem 1rem 1rem;
	}
  </style>
