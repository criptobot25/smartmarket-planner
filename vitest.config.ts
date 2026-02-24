import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    globals: true,
    environment: "jsdom",
    fileParallelism: false,
    include: ["src/tests/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**"],
  },
});
