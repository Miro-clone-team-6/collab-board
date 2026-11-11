import { defineConfig } from "orval";

export default defineConfig({
  apiPackage: {
    input: process.env.OPENAPI_URL ?? "http://localhost:3001/docs-json",
    output: {
      mode: "tags-split",
      target: "./packages/api/src/generated/endpoints",
      schemas: "./packages/api/src/generated/model",
      client: "react-query",
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: "./packages/api/src/transport.ts",
          name: "customInstance",
        },
        query: {
          version: 5,
        },
      },
    },
  },
});
