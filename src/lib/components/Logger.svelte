<script>
	import { algorithmLogs } from '../stores.js';
	import { onDestroy } from 'svelte';

	let logs = [];
	const unsubscribe = algorithmLogs.subscribe((value) => {
		logs = value;
	});

	onDestroy(() => {
		unsubscribe();
	});

	function clearLogs() {
		algorithmLogs.set([]);
	}
</script>

<div class="logger">
	<div class="header">
		<h1>Logs</h1>
		<button class="clear-button" on:click={clearLogs}>Clear Logs</button>
	</div>

	{#if logs.length > 0}
		<div class="log-messages">
			{#each logs as log}
				<div class="log-message {log.type}">
					<span class="timestamp">[{log.timestamp}]</span>
					{log.message}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.logger {
		border-top: 2px solid black;
		padding: 0.5rem 1rem 1rem 1rem;
		margin: 0;
		background-color: #fefefe;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logger h1 {
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
		margin: 0;
	}

	button {
		padding: 0.75rem;
		background-color: #007bff;
		color: #fff;
		border: none;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	.log-messages {
		margin-top: 1rem;
		max-height: 300px;
		overflow-y: auto;
		background-color: #fff;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.log-message {
		margin-bottom: 0.5rem;
		font-family: monospace;
		display: flex;
		align-items: center;
	}

	.log-message.info::before {
		content: 'ℹ️';
		margin-right: 0.5rem;
	}

	.log-message.success::before {
		content: '✅';
		margin-right: 0.5rem;
	}

	.log-message.error::before {
		content: '❌';
		margin-right: 0.5rem;
	}

	.timestamp {
		color: #888;
		margin-right: 0.5rem;
		font-size: 0.9rem;
	}
</style>
