import { camel } from '@orval/core';
import { defineConfig } from 'orval';

const SUFFIX = 'V2';

export default defineConfig({
  'api:v2': {
    input: './spec.json',
    output: {
      target: '../../../src/api/gen/v2.ts',
      client: 'react-query',
      prettier: true,
      override: {
        mutator: {
          path: '../../../src/api/clients.ts',
          name: 'clientV2',
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
