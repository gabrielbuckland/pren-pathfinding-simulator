import { algorithmLogs, structuredLogs } from './stores.js';

/**
 * Adds a log message to the algorithmLogs store and creates a structured log.
 * @param {string} message - The log message.
 * @param {string} type - The type of log ('info', 'success', 'error').
 * @param {object} context - Additional context for structured logging.
 */
export function addLog(message, type = 'info', context = {}) {
	const timestamp = new Date();

	algorithmLogs.update((logs) => [
		...logs,
		{
			timestamp: timestamp.toLocaleTimeString(),
			message,
			type,
		},
	]);

	addStructuredLog({
		timestamp: timestamp.toISOString(),
		message,
		type,
		...context,
	});
}

/**
 * Adds a structured log entry to the structuredLogs store.
 * @param {object} logEntry - The structured log entry.
 */
function addStructuredLog(logEntry) {
	structuredLogs.update((logs) => [...logs, logEntry]);
}

/**
 * Exports logs in the specified format.
 * @param {Array} logs - The array of structured log entries.
 * @param {string} format - The format to export ('csv', 'json', etc.).
 * @returns {string|Blob} - The exported data as a string or Blob.
 */
export function exportLogs(logs, format = 'csv') {
	switch (format) {
		case 'csv':
			return exportLogsToCSV(logs);
		case 'json':
			return exportLogsToJSON(logs);
		default:
			throw new Error(`Unsupported format: ${format}`);
	}
}

/**
 * Converts logs to CSV format.
 * @param {Array} logs - The array of structured log entries.
 * @returns {string} - The CSV formatted string.
 */
function exportLogsToCSV(logs) {
	if (!logs.length) return '';

	const headers = Object.keys(logs[0]);
	const csvRows = [
		headers.join(','),
		...logs.map(log => headers.map(header => JSON.stringify(log[header] ?? '')).join(','))
	];
	return csvRows.join('\n');
}

/**
 * Converts logs to JSON format.
 * @param {Array} logs - The array of structured log entries.
 * @returns {string} - The JSON formatted string.
 */
function exportLogsToJSON(logs) {
	return JSON.stringify(logs, null, 2);
}
