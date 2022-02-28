import { context } from '@actions/github';

export default () => ({
  branch: (process.env.PR_BRANCH ?? '').replace('refs/heads/', ''),
  checkChangelog: (process.env.CODE_REVIEW_CHANGELOG ?? 'true').toLowerCase() === 'true',
  checkTodos: (process.env.CODE_REVIEW_TODOS ?? 'true').toLowerCase() === 'true',
  prNumber: context.payload.pull_request?.number ?? 0,
  ref: context.ref,
  repo: context.repo.repo,
  repoOwner: context.repo.owner,
  storyNumbers: process.env.STORY_NUMBERS ?? '',
  todos: process.env.TODO_COMMENTS?.split(':::')
    .filter((t) => t.length > 0)
    .join('\n'),
});
