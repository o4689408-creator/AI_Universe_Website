import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Minimal, purpose-built config for real component-level tests — not a
// wholesale testing framework migration. Mirrors the existing "@/*" ->
// "./*" path alias from tsconfig.json so test files can import
// components/lib code exactly the way the app itself does.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
