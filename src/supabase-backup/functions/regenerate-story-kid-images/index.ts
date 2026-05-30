import { adminStub } from '../_shared/stub.ts';
Deno.serve((req) => adminStub(req, 'regenerate-story-kid-images'));