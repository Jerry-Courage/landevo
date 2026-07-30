// Shim: re-export zod/v4 so generated code can `import * as zod from 'zod'`
// and resolve the v4 API (z.int(), z.email(), etc.)
export * from "zod/v4";
