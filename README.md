# PREN Pathfinding Simulator

A browser-based simulator for pathfinding and graph exploration on a partially-known map,
built to develop and validate the navigation strategy of an autonomous vehicle for the
PREN 1 module at Lucerne University of Applied Sciences and Arts (HSLU).

The vehicle starts at a known point on a fixed track layout but does **not** know in advance
which connections are passable. Some carry a barrier, some have been removed entirely, and
some junctions are blocked by a pylon. It has to discover the map while driving toward one of
three possible goal points, and the goal is only announced immediately before the start. This
simulator makes that problem visible and measurable: you can place the obstacles by hand,
watch the vehicle explore step by step, or run hundreds of randomized maps to get timing
statistics.

## Why a custom algorithm

The simulator began as a comparison harness. Dijkstra, A\* and D\* Lite were implemented and
fully integrated first, because the task looks like a shortest-path problem.

It is not. Every classical algorithm here assumes the map is known before the first move, and
the vehicle's situation breaks that assumption in three specific ways:

- **Dead ends.** The vehicle can drive into a branch that turns out to be closed and has to
  find its way back out. A precomputed shortest path has no answer for that.
- **Blocked junctions behind open ones.** A pylon can sit on a node directly beyond a node
  that looked free, so a plan made in advance commits to a route that cannot be driven.
- **Removed sections.** When a connection is missing, knowing which alternatives exist
  requires knowing where the vehicle currently is and what it has already ruled out.

D\* Lite stayed in the running longest, since it is built for changing graphs. It still
assumes a global view of those changes, which the vehicle does not have.

So the team designed its own strategy instead: a **depth-first exploration guided by a
directional and sector-based heuristic**. It is what the physical vehicle runs, and it is what
the Exploration algorithm and the bulk run use. The classical four remain in the simulator for
comparison, which is what the original requirements asked for.

## The exploration strategy

Implemented in `src/lib/graphExplorer.js`.

The track is divided into three sectors: left (goal A), middle (goal B), right (goal C). At
every junction the vehicle scans its unexplored edges and scores them by two criteria: whether
the edge leads into the goal's sector, and how closely it points along the vector to the goal.
Edges heading the wrong way are penalised, edges returning toward the target sector are
rewarded. The highest-scoring edge is explored first; when a node offers nothing new, the
search backtracks and tries the next best alternative.

One extra trick: when a newly discovered edge **crosses** an edge the vehicle already knows,
the intersection point is computed with linear algebra and compared against the known node
positions. If a node sits there, its existence is inferred without the vehicle ever having
driven to it. Those inferred nodes show up while the Exploration run animates.

## Modes

**Single run.** Pick an algorithm and watch it work on the map you laid out, with a live log
of every decision it makes. Selecting Exploration hides the map down to the start node and
uncovers it as the vehicle drives, because that algorithm is the only one that does not start
with a map. The others are shown the whole thing, since that is what they are given.

**Bulk run.** Generate _N_ randomized maps and run the exploring vehicle on each one without
animation. Every map is built around a guaranteed route to its goal; a run that still fails is
discarded and retried, and the batch gives up after a bounded number of attempts rather than
retrying forever. The log reports the simulated time per run plus the total and average, and
can be exported as CSV.

## Editing the map

- **Click an edge** to cycle it: passable → removed → blocked by a barrier → passable
- **Click a node** to place or remove a pylon

## Algorithms

| Selection       | Knows the map | Minimises      | Notes                                                                              |
| --------------- | ------------- | -------------- | ---------------------------------------------------------------------------------- |
| **Exploration** | no            | nothing        | The vehicle's own strategy. Discovers the map while driving.                       |
| **Dijkstra**    | yes           | driving time   | Uniform-cost baseline.                                                             |
| **A\***         | yes           | driving time   | Same costs, guided by an admissible time heuristic.                                |
| **D\*Lite**     | yes           | driving time   | Backwards search with the key and consistency machinery. See the limitation below. |
| **BFS**         | yes           | number of hops | Kept as a deliberate contrast, see below.                                          |

All five report a traversal time in the same units, so the cost of not knowing the map is a
matter of running Exploration, noting the number, then running Dijkstra and comparing.

Dijkstra, A\* and D\* Lite minimise **simulated driving time**, not geometric distance, so a
barrier that costs twice as much to cross is worth a detour and they compute it that way. Since
they are handed the full map, their results bound what the exploring vehicle could achieve at
best.

BFS is the odd one out on purpose. It minimises the number of edges, which is what a breadth
first search does by construction, and it is blind to what those edges cost. Put a barrier on
a single-hop route and BFS still drives through it while Dijkstra goes around:

```
barrier on S-3, timeToTraverse = 1, timeWithBarrier = 100

BFS        100 units   one hop, straight through the barrier
Dijkstra     2 units   two hops, around it
```

Fewest junctions is not fastest. Having both in the same dashboard makes that visible in one
click.

## Cost model

Three configurable parameters drive the simulated time:

- `timeToTraverse`: driving across a clear edge
- `timeWithBarrier`: driving across an edge that carries a barrier
- `timeToExploreEdges`: scanning an edge to find out which of the three it is

A\*'s heuristic is the Euclidean distance to the goal scaled by
`cheapest edge cost / longest edge length`. Covering a straight-line distance needs at least
that many edges, and no edge is cheaper than the cheapest type, so the estimate never
overshoots the true remaining time and satisfies the triangle inequality, which is what keeps
A\* optimal while using a closed set.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Commands

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the development server                  |
| `npm run build`   | Build for production                          |
| `npm run preview` | Preview the production build                  |
| `npm test`        | Run the test suite (Vitest)                   |
| `npm run lint`    | Check formatting (Prettier) and lint (ESLint) |
| `npm run format`  | Apply Prettier formatting                     |

## Project structure

```
src/
├── lib/
│   ├── graphExplorer.js      # The exploration strategy that ships on the vehicle
│   ├── algorithms.js         # Run orchestration for all modes
│   ├── algorithms/           # aStar.js, bfs.js, dijkstra.js, dStarLite.js
│   │                         # graphCosts.js  : time costs, heuristic, adjacency
│   │                         # graphVisuals.js: shared store updates for animation
│   ├── graphStructure.js     # Fixed node/edge layout and default states
│   ├── stores.js             # Svelte stores holding all simulation state
│   ├── logging.js            # Log plumbing and CSV export
│   ├── utils.js              # Random map generation, delays, state resets
│   ├── components/           # Svelte UI components
│   └── test/                 # Vitest specs
└── routes/                   # SvelteKit pages
docs/
└── components-diagram.puml   # PlantUML component diagram
```

The architecture is four components communicating through three shared stores: `GraphViewer`
renders and edits the graph, `DashboardViewer` configures the run, `GraphExplorer` holds the
navigation logic, and `LogViewer` displays and exports the decision log. Because all
simulation state lives in Svelte stores, an animated run and a batch run share one
implementation.

The node and edge layout in `graphStructure.js` is fixed. It mirrors the physical track used
in the competition. Randomization varies which edges are blocked or missing and which of A/B/C
is the goal, not the topology itself.

## Known limitations

Worth stating plainly rather than leaving for a reader to discover:

- **D\* Lite is not incremental.** Only the `ComputeShortestPath` half is implemented. There
  is no outer replanning loop and no `km` accumulation, so it recomputes from scratch instead
  of repairing the previous solution. It produces correct shortest paths; it just does not
  demonstrate the property D\* Lite exists for.
- **Backtracking is free for the exploring vehicle.** `graphExplorer.js` charges traversal
  time only for the edge leading into each newly visited node. When the depth-first search
  backtracks, the vehicle effectively teleports, so reported exploration times understate the
  real drive.
- **The map layout is fixed.** Randomisation varies which edges are blocked or missing and
  which of A/B/C is the goal, never the topology.

## The vehicle

For context, the machine this simulator was planning for:

| Property           | Value                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| Navigation         | Heuristic depth-first search (this repository)                             |
| Control unit       | Raspberry Pi 4                                                             |
| Sensors            | Line sensor, distance sensors, camera, light barriers, encoders, gyroscope |
| Interfaces         | UART, I2C                                                                  |
| Power              | 4S LiPo, 14.4 V / 1300 mAh, ~20 min runtime                                |
| Dimensions, weight | 30 × 30 × 30 cm, 2 kg                                                      |

## Built with

SvelteKit 2 · Svelte 4 · Vite 5 · Vitest 2

## Contributors

Built for the PREN 1 module at HSLU by Team 10, six members across mechanics, electronics
and software. This repository is the software team's work:

- **[@gabrielbuckland](https://github.com/gabrielbuckland)**: the exploration strategy in
  `graphExplorer.js` that ships on the vehicle, including the sector and direction heuristic
  and the linear-algebra inference of unvisited junctions, plus the project's test suite.
- **[@tramasys](https://github.com/tramasys)**: the Dijkstra, A\* and D\* Lite
  implementations, the random map generation, and much of the UI and logging.

## License

MIT. See [LICENSE](LICENSE).
