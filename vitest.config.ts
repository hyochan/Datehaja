import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
      "@convex": path.resolve(root, "./convex"),
    },
  },
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    include: ["convex/**/*.test.ts", "src/**/*.test.ts"],
    // `edge-runtime` reports the host machine's OS language, which decided
    // which language the components under test rendered in. See the file.
    setupFiles: ["./src/test/setup.ts"],
  },
});
