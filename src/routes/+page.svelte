<script>
	import Container from '../lib/components/Container.svelte';
	import Graph from '../lib/components/Graph.svelte';
	import Title from '../lib/components/Title.svelte';
  </script>

  <svelte:head>
	<title>Simulator</title>
	<meta name="description" content="Simulator" />
  </svelte:head>

  <Container>
	<div slot="left">
	  <Title>Graph</Title>
	  <Graph />
	</div>

	<div slot="right">
		<Title>Dashboard</Title>

	  <button>Button 1</button>
	  <button>Button 2</button>
	  <button>Button 3</button>

	</div>
  </Container>

  <style>
	button {
		display: block;
		margin: 0.5rem 0;
		padding: 0.5rem;
		width: 100%;
	}
  </style>
