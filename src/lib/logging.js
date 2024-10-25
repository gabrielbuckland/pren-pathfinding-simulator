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
