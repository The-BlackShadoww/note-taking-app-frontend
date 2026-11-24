import { defineConfig } from "vite";

// No React plugin needed: Vite's built-in transformer (Oxc) compiles JSX.
// "automatic" means we never have to `import React` just to write JSX.
export default defineConfig({
    oxc: {
        jsx: { runtime: "automatic" },
    },
    server: {
        port: 5173,
    },
});
