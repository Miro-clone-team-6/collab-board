import { defineConfig } from "orval";

export default defineConfig({
  apiPackage: {
    input: "./apps/api/openapi/openapi.json",
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
