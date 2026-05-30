import { adminStub } from '../_shared/stub.ts';
Deno.serve((req) => adminStub(req, 'restore-quiz-answers-from-description'));