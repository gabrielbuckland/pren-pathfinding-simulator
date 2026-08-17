# PREN Pathfinding Simulator

A browser-based simulator for pathfinding and graph exploration on a partially-known map,
built to support the route-planning decisions of an autonomous vehicle in the PREN project
at Lucerne University of Applied Sciences and Arts (HSLU).

The vehicle starts at a known point on a fixed track layout but does **not** know in advance
which connections are passable — some are blocked by barriers, some are missing entirely, and
some junctions are unusable. It has to discover the map while driving toward one of three
possible goal points. This simulator makes that problem visible and measurable: you can place
the obstacles by hand, watch the vehicle explore step by step, or run hundreds of randomized
maps to get timing statistics.

## Modes

The dashboard on the right offers three execution modes:

**Interactive run** — configure the vehicle's timing parameters, pick one of the algorithms,
and run it on the map you laid out. The graph animates as the algorithm proceeds and a live
log records every decision it makes.

**Parameterized run** — generate _N_ randomized maps and run the exploration strategy on each
one without animation. Each map is guaranteed to have at least one valid route to its goal;
runs that fail to reach it are discarded and retried, so you always get _N_ completed runs.
The log reports the simulated time per run plus the total and average.

**Explore** — pick a goal node and watch the exploration strategy alone, animated, with no
algorithm comparison.

## Editing the map

- **Click an edge** to cycle it: passable → impassable → blocked by a barrier
- **Click a node** to toggle it as an obstacle

## Algorithms

| Selection      | Knows the map upfront | Notes                                                                                                                                                                                                  |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Simulation** | No                    | The custom exploration strategy in `graphExplorer.js` — depth-first with a directional heuristic that biases toward edges pointing at the goal's sector. This is the one that models the real vehicle. |
| **Dijkstra**   | Yes                   | Uniform-cost baseline.                                                                                                                                                                                 |
| **A\***        | Yes                   | Euclidean-distance heuristic.                                                                                                                                                                          |
| **D\*Lite**    | Partially             | Incremental replanning as new obstacles are discovered.                                                                                                                                                |

Dijkstra and A\* are given the full map, so their results act as a lower bound — the best any
strategy could do. The gap to the exploration strategy is the cost of not knowing the map.

## Cost model

Three configurable parameters drive the simulated time, matching what was measured on the
physical vehicle:

- `timeToTraverse` — crossing a clear edge
- `timeWithBarrier` — crossing an edge with a barrier on it
- `timeToExploreEdges` — scanning an edge to find out what it is

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
│   ├── graphExplorer.js      # Exploration strategy for the unknown-map case
│   ├── algorithms.js         # Run orchestration, animation, shared graph helpers
│   ├── algorithms/           # aStar.js, dijkstra.js, dStarLite.js
│   ├── graphStructure.js     # Fixed node/edge layout and default states
│   ├── stores.js             # Svelte stores holding all simulation state
│   ├── logging.js            # Log plumbing for the log viewer
│   ├── utils.js              # Random map generation, delays, state resets
│   ├── components/           # Svelte UI components
│   └── test/                 # Vitest specs
└── routes/                   # SvelteKit pages
docs/
└── components-diagram.puml   # PlantUML component diagram
```

All simulation state lives in Svelte stores, so the algorithms mutate the same state the UI
renders from. That is what lets an animated run and a batch run share one implementation.

The node and edge layout in `graphStructure.js` is fixed — it mirrors the physical track used
in the competition. Randomization varies which edges are blocked or missing and which of A/B/C
is the goal, not the topology itself.

## Built with

SvelteKit 2 · Svelte 4 · Vite 5 · Vitest 2

## Contributors

A team project for the PREN module at HSLU, with the majority of the implementation by
[@gabrielbuckland](https://github.com/gabrielbuckland), together with
[@tramasys](https://github.com/tramasys).

## License

MIT — see [LICENSE](LICENSE).
