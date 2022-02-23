import core from '@actions/core';
import { context } from '@actions/github';

export default () => ({
  checkChangelog: core.getBooleanInput('changelog'),
  checkTodos: core.getBooleanInput('todos'),
  prNumber: context.payload.pull_request?.number ?? 0,
  repo: context.repo.repo,
  repoOwner: context.repo.owner,
});
