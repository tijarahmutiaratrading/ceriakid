import { adminStub } from '../_shared/stub.ts';
Deno.serve((req) => adminStub(req, 'audit-quiz-answers'));