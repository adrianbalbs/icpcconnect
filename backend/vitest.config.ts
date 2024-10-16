import { defineConfig } from "vitest/config";

/// <reference types="vitest" />
export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    globals: true,
  },
});
