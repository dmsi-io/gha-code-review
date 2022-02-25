import test from 'ava';

import todosReviewer from '../todos';
import { ReviewEvent } from '../../reviewer.types';

test('Returns undefined for empty todos', async (t) => {
  t.deepEqual(
    await todosReviewer({
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      todos: '',
    }),
    undefined,
  );

  t.deepEqual(
    await todosReviewer({
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      todos: undefined,
    }),
    undefined,
  );
});

test('Creates todo review for single instance', async (t) => {
  t.deepEqual(
    await todosReviewer({
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      todos: 'src/foo/bar.ts:42: //TODO: [XYZ-987]',
    }),
    {
      body:
        'There is 1 todo in your code associated with the story/stories on this pull request. Can it be removed?\n\n- `src/foo/bar.ts:42`',
      event: ReviewEvent.COMMENT,
    },
  );
});

test('Creates todo review for multiple instances', async (t) => {
  t.deepEqual(
    await todosReviewer({
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      todos: 'src/foo/bar.ts:23://TODO: ABC-123\nsrc/fizz/buzz.js:1:    .slice(); // TODO: DEF-456',
    }),
    {
      body:
        'There are 2 todos in your code associated with the story/stories on this pull request. Can they be removed?\n\n- `src/foo/bar.ts:23`\n- `src/fizz/buzz.js:1`',
      event: ReviewEvent.COMMENT,
    },
  );
});
