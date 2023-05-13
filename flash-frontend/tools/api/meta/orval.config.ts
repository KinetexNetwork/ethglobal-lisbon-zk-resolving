import { defineConfig } from 'orval';
import { camel } from '@orval/core';

const SUFFIX = 'Meta';

export default defineConfig({
  'api:meta': {
    input: './spec.json',
    output: {
      target: '../../../src/api/gen/meta.ts',
      client: 'react-query',
      prettier: true,
      override: {
        mutator: {
          path: '../../../src/api/clients.ts',
          name: 'clientMeta',
        },
        components: {
          schemas: {
            suffix: SUFFIX,
          },
        },
        operationName: (operation, route, verb) => {
          if (!operation.operationId) {
            throw new Error(`Operation ID must be set (${verb.toUpperCase()} "${route}")`);
          }

          const name = camel(operation.operationId) + SUFFIX;
          return name;
        },
      },
    },
  },
});
