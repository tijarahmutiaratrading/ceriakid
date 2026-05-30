import { adminStub } from '../_shared/stub.ts';
Deno.serve((req) => adminStub(req, 'repair-all-games'));