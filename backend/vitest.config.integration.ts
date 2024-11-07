import { defineConfig } from "vitest/config";

/// <reference types="vitest" />
export default defineConfig({
  test: {
    include: ["src/integration/**/*.test.ts"],
    globals: true,
    coverage: {
      enabled: true,
    },
  },
});
