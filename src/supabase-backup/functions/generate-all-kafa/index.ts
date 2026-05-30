import { adminStub } from '../_shared/stub.ts';
Deno.serve((req) => adminStub(req, 'generate-all-kafa'));