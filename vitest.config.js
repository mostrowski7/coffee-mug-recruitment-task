import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@shared/config": path.resolve(__dirname, "src/shared/config/index.ts"),
      "@shared/logger": path.resolve(__dirname, "src/shared/logger/index.ts"),
      "@shared/error": path.resolve(__dirname, "src/shared/error/index.ts"),
      "@shared/types": path.resolve(__dirname, "src/shared/types/index.ts"),
      "@shared/http": path.resolve(__dirname, "src/shared/http/index.ts"),
      "@infra/db": path.resolve(__dirname, "src/infra/db/index.ts"),
      "@modules/product": path.resolve(
        __dirname,
        "src/modules/product/index.ts",
      ),
    },
  },
  plugins: [],
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.spec.ts"],
    setupFiles: ["src/tests/vitest.setup.ts"],
    pool: "threads",
  },
});
