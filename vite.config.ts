import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    base: '/pixi-slot/', // Repo name for GitHub Pages
    build: {
        outDir: 'docs',
    },
    server: {
        port: 8080,
        open: true,
    },
});
