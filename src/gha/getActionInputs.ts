import core from '@actions/core';
import { context } from '@actions/github';

const getOptionalBooleanInput = (varName: string) =>
  core.getInput(varName).toLowerCase() !== 'false';

export default () => ({
  checkChangelog: getOptionalBooleanInput('changelog'),
  checkTodos: getOptionalBooleanInput('todos'),
  prNumber: context.payload.pull_request?.number ?? 0,
  ref: context.ref,
  repo: context.repo.repo,
  repoOwner: context.repo.owner,
  todos: process.env.TODO_COMMENTS?.split(':::')
    .filter((t) => t.length > 0)
    .join('\n'),
});
