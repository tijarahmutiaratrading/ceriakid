import { adminStub } from '../_shared/stub.ts';
Deno.serve((req) => adminStub(req, 'normalize-kssr-buckets'));