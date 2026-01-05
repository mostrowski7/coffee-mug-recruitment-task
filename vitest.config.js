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
      "@infra/di": path.resolve(__dirname, "src/infra/di/index.ts"),
      "@infra/http": path.resolve(__dirname, "src/infra/http/index.ts"),

      "@tests/utils": path.resolve(__dirname, "src/tests/utils/index.ts"),

      "@modules/product": path.resolve(
        __dirname,
        "src/modules/product/index.ts",
      ),
      "@modules/order": path.resolve(__dirname, "src/modules/order/index.ts"),
    },
  },
  plugins: [],
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.spec.ts", "src/**/*.int.spec.ts"],
    setupFiles: ["src/tests/vitest.setup.ts"],
    pool: "threads",
    fileParallelism: false,
  },
});
