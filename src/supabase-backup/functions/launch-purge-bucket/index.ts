import { adminStub } from '../_shared/stub.ts';
Deno.serve((req) => adminStub(req, 'launch-purge-bucket'));