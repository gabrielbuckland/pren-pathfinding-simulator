const containerSize = 35 * 16; // 35rem in pixels (1 rem = 16px by default)
const centerX = containerSize / 2;
const centerY = containerSize / 2;
const radius = containerSize / 2.5;

export const fixedNodes = [
	{ id: '4', x: centerX, y: centerY },
	{ id: 'S', x: centerX + radius * Math.sin(0), y: centerY - radius * Math.cos(0) },
	{ id: '3', x: centerX + radius * Math.sin(Math.PI / 3), y: centerY - radius * Math.cos(Math.PI / 3) },
	{ id: 'C', x: centerX + radius * Math.sin((2 * Math.PI) / 3), y: centerY - radius * Math.cos((2 * Math.PI) / 3) },
	{ id: 'B', x: centerX + radius * Math.sin(Math.PI), y: centerY - radius * Math.cos(Math.PI) },
	{ id: 'A', x: centerX + radius * Math.sin((4 * Math.PI) / 3), y: centerY - radius * Math.cos((4 * Math.PI) / 3) },
	{ id: '1', x: centerX + radius * Math.sin((5 * Math.PI) / 3), y: centerY - radius * Math.cos((5 * Math.PI) / 3) },
	{ id: '2', x: 230, y: 170 }
];

export const fixedEdges = [
	{ id: 1, from: '1', to: 'S' },
	{ id: 2, from: 'S', to: '3' },
	{ id: 3, from: '3', to: 'C' },
	{ id: 4, from: 'C', to: 'B' },
	{ id: 5, from: 'B', to: 'A' },
	{ id: 6, from: 'A', to: '1' },
	{ id: 7, from: '4', to: '3' },
	{ id: 8, from: '4', to: 'C' },
	{ id: 9, from: '4', to: 'B' },
	{ id: 10, from: '4', to: 'A' },
	{ id: 11, from: '2', to: 'A' },
	{ id: 12, from: '1', to: 'A' },
	{ id: 13, from: '1', to: '2' },
	{ id: 14, from: '3', to: '2' },
	{ id: 15, from: 'S', to: '2' },
	{ id: 16, from: '2', to: '4' }
];
