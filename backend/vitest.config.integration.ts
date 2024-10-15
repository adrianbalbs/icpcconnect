import { defineConfig } from "vitest/config";

/// <reference types="vitest" />
export default defineConfig({
  test: {
    include: ["src/integration/**/*.test.ts"],
    globals: true,
    sequence: {
      concurrent: false,
      hooks: "list",
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
