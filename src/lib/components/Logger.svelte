<script>
	import { algorithmLogs, structuredLogs } from '../stores.js';
	import { onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { exportLogs } from '../logging.js';

	let logs = [];
	let structuredLogsData = [];

	const unsubscribeReadableLogs = algorithmLogs.subscribe((value) => {
		logs = value;
	});

	const unsubscribeStructuredLogs = structuredLogs.subscribe((value) => {
		structuredLogsData = value;
	});

	onDestroy(() => {
		unsubscribeReadableLogs();
		unsubscribeStructuredLogs();
	});

	function clearLogs() {
		algorithmLogs.set([]);
	}

	function clearStructuredLogs() {
		structuredLogs.set([]);
	}

	function exportStructuredLogs() {
		const logs = get(structuredLogs);
		const csvContent = exportLogs(logs, 'csv');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const date = new Date();
		const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
		const filename = `pren_export_${yyyymmdd}.csv`;

		const link = document.createElement('a');
		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', filename);
			link.style.visibility = 'hidden';

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else if (navigator.msSaveBlob) {
			navigator.msSaveBlob(blob, filename);
		} else {
			console.error('File download not supported by the browser.');
		}
	}
</script>

<div class="logger">
	<div class="header">
		<h1>Logs</h1>
		<div class="controls">
			<span>{structuredLogsData.length} logs collected</span>
			<button class="clear-structured-logs-button" on:click={clearStructuredLogs}>Clear logs</button>
			<button class="export-button" on:click={exportStructuredLogs}>Export logs</button>
			<button class="clear-button" on:click={clearLogs}>Clear screen</button>
		</div>
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
		flex-wrap: wrap;
	}

	.header h1 {
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
		margin: 0;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	button {
		padding: 0.5rem 0.75rem;
		background-color: #007bff;
		color: #fff;
		border: none;
		cursor: pointer;
		font-size: 0.9rem;
	}

	button:hover {
		background-color: #0056b3;
	}

	.log-messages {
		margin-top: 1rem;
		max-height: 400px;
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
