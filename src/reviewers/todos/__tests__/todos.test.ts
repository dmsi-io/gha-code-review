import test from 'ava';

import todosReviewer from '../todos';
import { ReviewEvent } from '../../reviewer.types';

test('Returns undefined for empty todos', async (t) => {
  t.deepEqual(
    await todosReviewer({
      branch: 'feature/ABC-123',
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      storyNumbers: '',
      todos: '',
    }),
    undefined,
  );

  t.deepEqual(
    await todosReviewer({
      branch: 'feature/ABC-123',
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      storyNumbers: '',
      todos: undefined,
    }),
    undefined,
  );
});

test('Creates todo review for single instance', async (t) => {
  t.deepEqual(
    await todosReviewer({
      branch: 'fix/XYZ-987',
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      storyNumbers: '',
      todos: 'src/foo/bar.ts:42: //TODO: [XYZ-987]',
    }),
    {
      body:
        'There is 1 todo in your code associated with the story/stories on this pull request. Can it be removed?\n\n- [`src/foo/bar.ts:42`](https://github.com/bar/foo/blob/fix/XYZ-987/src/foo/bar.ts#L42)',
      event: ReviewEvent.COMMENT,
    },
  );
});

test('Creates todo review for multiple instances', async (t) => {
  t.deepEqual(
    await todosReviewer({
      branch: 'feature/ABC-123-DEF-456',
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      storyNumbers: '',
      todos:
        './src/foo/bar.ts:23://TODO: ABC-123\n./src/fizz/buzz.js:1:    .slice(); // TODO: DEF-456',
    }),
    {
      body:
        'There are 2 todos in your code associated with the story/stories on this pull request. Can they be removed?\n\n- [`./src/foo/bar.ts:23`](https://github.com/bar/foo/blob/feature/ABC-123-DEF-456/src/foo/bar.ts#L23)\n- [`./src/fizz/buzz.js:1`](https://github.com/bar/foo/blob/feature/ABC-123-DEF-456/src/fizz/buzz.js#L1)',
      event: ReviewEvent.COMMENT,
    },
  );
});

test('Returns without links when pieces are undefined', async (t) => {
  t.deepEqual(
    await todosReviewer({
      branch: '',
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      storyNumbers: '',
      todos:
        './src/foo/bar.ts:23://TODO: ABC-123\n./src/fizz/buzz.js:1:    .slice(); // TODO: DEF-456',
    }),
    {
      body:
        'There are 2 todos in your code associated with the story/stories on this pull request. Can they be removed?\n\n- `./src/foo/bar.ts:23`\n- `./src/fizz/buzz.js:1`',
      event: ReviewEvent.COMMENT,
    },
  );

  t.deepEqual(
    await todosReviewer({
      branch: 'feature/ABC-123-DEF-456',
      prNumber: 1,
      repo: '',
      repoOwner: 'bar',
      storyNumbers: '',
      todos:
        './src/foo/bar.ts:23://TODO: ABC-123\n./src/fizz/buzz.js:1:    .slice(); // TODO: DEF-456',
    }),
    {
      body:
        'There are 2 todos in your code associated with the story/stories on this pull request. Can they be removed?\n\n- `./src/foo/bar.ts:23`\n- `./src/fizz/buzz.js:1`',
      event: ReviewEvent.COMMENT,
    },
  );

  t.deepEqual(
    await todosReviewer({
      branch: 'feature/ABC-123-DEF-456',
      prNumber: 1,
      repo: 'foo',
      repoOwner: '',
      storyNumbers: '',
      todos:
        './src/foo/bar.ts:23://TODO: ABC-123\n./src/fizz/buzz.js:1:    .slice(); // TODO: DEF-456',
    }),
    {
      body:
        'There are 2 todos in your code associated with the story/stories on this pull request. Can they be removed?\n\n- `./src/foo/bar.ts:23`\n- `./src/fizz/buzz.js:1`',
      event: ReviewEvent.COMMENT,
    },
  );

  t.deepEqual(
    await todosReviewer({
      branch: 'feature/ABC-123-DEF-456',
      prNumber: 1,
      repo: 'foo',
      repoOwner: 'bar',
      storyNumbers: '',
      todos:
        './src/foo/bar.ts:X://TODO: ABC-123\n./src/fizz/buzz.js:-1:    .slice(); // TODO: DEF-456',
    }),
    {
      body:
        'There are 2 todos in your code associated with the story/stories on this pull request. Can they be removed?\n\n- [`./src/foo/bar.ts`](https://github.com/bar/foo/blob/feature/ABC-123-DEF-456/src/foo/bar.ts)\n- [`./src/fizz/buzz.js`](https://github.com/bar/foo/blob/feature/ABC-123-DEF-456/src/fizz/buzz.js)',
      event: ReviewEvent.COMMENT,
    },
  );
});
