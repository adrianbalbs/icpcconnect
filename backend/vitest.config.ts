import { defineConfig } from "vitest/config";

/// <reference types="vitest" />
export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    globals: true,
    coverage: {
      enabled: true,
      include: [
        "src/middleware/**/*",
        "src/routers/**/*",
        "src/services/**/*",
        "src/utils/**/*",
      ],
    },
  },
});
