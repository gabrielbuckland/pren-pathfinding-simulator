import adapter from '@sveltejs/adapter-static';

// The app is a single prerendered route with no server code, so it can be
// served as plain files. GitHub Pages hosts it under /<repository>, which the
// build needs to know about; BASE_PATH is set by the deploy workflow and left
// empty everywhere else, so `npm run dev` still serves from the root.
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		paths: {
			base
		}
	}
};

export default config;
