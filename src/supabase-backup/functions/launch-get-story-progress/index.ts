import { adminStub } from '../_shared/stub.ts';
Deno.serve((req) => adminStub(req, 'launch-get-story-progress'));