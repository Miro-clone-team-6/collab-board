import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: "./src/index.ts",
    },
  },
  lib: [
    {
      bundle: true,
      format: "esm",
      dts: true,
      output: {
        distPath: {
          root: "./dist",
        },
        filename: {
          js: "[name].js",
        },
      },
    },
    {
      bundle: true,
      format: "cjs",
      dts: false,
      output: {
        distPath: {
          root: "./dist",
        },
        filename: {
          js: "[name].cjs",
        },
      },
    },
  ],
  output: {
    externals: ["zod"],
  },
});
