import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    coverage: {
      reporter: ["text", "html"]
    }
  },
  resolve: {
    alias: {
      "@": "/home/peter/git/dicom-explorer/src"
    }
  }
});
