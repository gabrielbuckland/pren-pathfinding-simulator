<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

	let scene, camera, renderer, controls, raycaster, mouse;
	let animationFrameId,
		nodeMeshes = [],
		edgeMeshes = [];

	const radius = 150; // Radius for the hexagonal layout
	const nodeRadius = 10; // Radius of the nodes (for edge shortening)

	// Nodes in a hexagonal pattern, centered around (0, 0)
	let nodes = [
		{ id: '4', x: 0, y: 0, isObstacle: false }, // Center node
		{ id: 'S', x: radius * Math.sin(0), y: radius * Math.cos(0), isObstacle: false }, // Top node
		{
			id: '3',
			x: radius * Math.sin(Math.PI / 3),
			y: radius * Math.cos(Math.PI / 3),
			isObstacle: false
		}, // Top-right
		{
			id: 'C',
			x: radius * Math.sin((2 * Math.PI) / 3),
			y: radius * Math.cos((2 * Math.PI) / 3),
			isObstacle: false
		}, // Bottom-right
		{ id: 'B', x: radius * Math.sin(Math.PI), y: radius * Math.cos(Math.PI), isObstacle: false }, // Bottom
		{
			id: 'A',
			x: radius * Math.sin((4 * Math.PI) / 3),
			y: radius * Math.cos((4 * Math.PI) / 3),
			isObstacle: false
		}, // Bottom-left
		{
			id: '1',
			x: radius * Math.sin((5 * Math.PI) / 3),
			y: radius * Math.cos((5 * Math.PI) / 3),
			isObstacle: true
		}, // Top-left
		{ id: '2', x: -30, y: 60, isObstacle: false } // Top-left center, adjusted for symmetry
	];

	let edges = [
		{ id: 1, from: '1', to: 'S', type: 'solid' },
		{ id: 2, from: 'S', to: '3', type: 'solid' },
		{ id: 3, from: '3', to: 'C', type: 'solid' },
		{ id: 4, from: 'C', to: 'B', type: 'solid' },
		{ id: 5, from: 'B', to: 'A', type: 'solid' },
		{ id: 6, from: 'A', to: '1', type: 'solid' },
		{ id: 7, from: '4', to: '3', type: 'solid' },
		{ id: 8, from: '4', to: 'C', type: 'solid' },
		{ id: 9, from: '4', to: 'B', type: 'solid' },
		{ id: 10, from: '4', to: 'A', type: 'solid' },
		{ id: 11, from: '2', to: 'A', type: 'solid' },
		{ id: 12, from: '1', to: 'A', type: 'solid' },
		{ id: 13, from: '1', to: '2', type: 'solid' },
		{ id: 14, from: '3', to: '2', type: 'solid' },
		{ id: 15, from: 'S', to: '2', type: 'solid' },
		{ id: 16, from: '2', to: '4', type: 'dashed' }
	];

	// Function to convert the list to an object
	function getNodesById(nodes) {
		return nodes.reduce((acc, node) => {
			acc[node.id] = node;
			return acc;
		}, {});
	}

	function getEdgesById(edges) {
		return edges.reduce((acc, edge) => {
			acc[edge.id] = edge;
			return acc;
		}, {});
	}

	// Usage
	let nodesById = getNodesById(nodes);
	let edgesById = getEdgesById(edges);

	onMount(() => {
		// Create scene, camera, renderer
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xffffff); // Set background to white
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 300;

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		// Create nodes as wireframe cylinders
		const nodeHeight = 2;
		nodes.forEach((node) => {
			const geometry = new THREE.CylinderGeometry(nodeRadius, nodeRadius, nodeHeight, 32);
			const material = new THREE.MeshBasicMaterial({ color: 0xdddddd, wireframe: false });
			const cylinder = new THREE.Mesh(geometry, material);
			cylinder.position.set(node.x, nodeHeight / 2, node.y); // Adjust the z axis for centering
			cylinder.userData = { type: 'node', id: node.id };
			scene.add(cylinder);
			nodeMeshes.push(cylinder); // Store reference to the node mesh
		});

		// Create edges as solid rectangular boxes
		const edgeHeight = nodeHeight;
		const shortenAmount = nodeRadius * 0.95; // Shorten the edges so they don't intersect the nodes
		edges.forEach((edge) => {
			const startNode = nodes.find((n) => n.id === edge.from);
			const endNode = nodes.find((n) => n.id === edge.to);

			// Calculate vector direction and shorten the edge length
			const startVector = new THREE.Vector3(startNode.x, edgeHeight / 2, startNode.y);
			const endVector = new THREE.Vector3(endNode.x, edgeHeight / 2, endNode.y);
			const direction = new THREE.Vector3().subVectors(endVector, startVector).normalize();

			// Shorten the start and end points by the node radius
			const shortenedStart = startVector
				.clone()
				.add(direction.clone().multiplyScalar(shortenAmount));
			const shortenedEnd = endVector.clone().sub(direction.clone().multiplyScalar(shortenAmount));

			// Calculate the distance between the shortened points
			const distance = shortenedStart.distanceTo(shortenedEnd);

			const edgeGeometry = new THREE.BoxGeometry(2, edgeHeight, distance); // Thinner rectangle edge
			let color = 0xdddddd;
			if (edge.type === 'dashed') color = 0xffffff;
			const edgeMaterial = new THREE.MeshBasicMaterial({ color: color });

			const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
			edgeMesh.userData = { type: 'edge', id: edge.id }; // Store edge data for click events

			// Position the edge halfway between the shortened start and end points
			const middlePoint = shortenedStart.clone().lerp(shortenedEnd, 0.5);
			edgeMesh.position.set(middlePoint.x, middlePoint.y, middlePoint.z);

			// Align the edge with the direction of the start and end nodes
			const axis = new THREE.Vector3(0, 0, 1).cross(direction).normalize();
			const angle = Math.acos(direction.dot(new THREE.Vector3(0, 0, 1)));
			edgeMesh.quaternion.setFromAxisAngle(axis, angle);

			scene.add(edgeMesh);
			edgeMeshes.push(edgeMesh); // Store reference to the edge mesh
		});

		// Set up OrbitControls for dragging and rotating
		controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0); // Set rotation point to the origin
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.enableZoom = true;

		// Animation loop
		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);
			controls.update(); // Update the controls in each frame
			renderer.render(scene, camera);
		};
		animate();

		// Add click event listener
		window.addEventListener('click', onClick, false);

		// Handle window resizing
		window.addEventListener('resize', onWindowResize, false);

		// Clean up
		onDestroy(() => {
			cancelAnimationFrame(animationFrameId);
			controls.dispose(); // Clean up controls
			renderer.dispose();
			window.removeEventListener('resize', onWindowResize, false);
			window.removeEventListener('click', onClick, false);
			document.body.removeChild(renderer.domElement);
		});
	});

	// Handle window resizing
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	// Handle click event
	function onClick(event) {
		// Calculate mouse position in normalized device coordinates
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);

		// Check for intersections with nodes
		const intersects = raycaster.intersectObjects(nodeMeshes.concat(edgeMeshes));

		if (intersects.length > 0) {
			const intersectedObject = intersects[0].object;
			const userData = intersectedObject.userData;

			if (userData.type === 'node') {
				nodesById[userData.id].type = 'dashed';
			} else if (userData.type === 'edge') {
				edgesById[userData.id];
			}
		}
	}
</script>

<svelte:head>
	<title>3D Graph with Clickable Nodes and Edges</title>
</svelte:head>

<style>
	body {
		margin: 0;
		overflow: hidden;
	}
</style>
