import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		rollupOptions: {
		  external: ['jspdf'] // Add 'jsPDF' to the list of external dependencies
		}
	  },
	plugins: [sveltekit()]
});

