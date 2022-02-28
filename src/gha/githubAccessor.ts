import { Octokit } from '@octokit/rest';
import { retry } from '@octokit/plugin-retry';
import { throttling } from '@octokit/plugin-throttling';

import parseDiff from 'parse-diff';

import path from 'path';

import { Review } from '../reviewers/reviewer.types';
import getActionInputs from './getActionInputs';

type Options = {
  method: string;
  request: {
    retryCount: number;
  };
  url: string;
};

const PluginOctokit = Octokit.plugin(throttling).plugin(retry);
const octokit = new PluginOctokit({
  auth: process.env.CODE_REVIEW_TOKEN,
  throttle: {
    onRateLimit: (retryAfter: number, options: Options, o: InstanceType<typeof Octokit>) => {
      o.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

      // Try up to 5 times before giving up
      if (options.request.retryCount < 5) {
        o.log.info(`Retrying after ${retryAfter} seconds!`);
        // true means we should retry after retryAfter seconds
        return true;
      }
      o.log.error(`Aborting after ${options.request.retryCount} retries.`);
      process.exit(2);
      // no retry
      return false;
    },
    onAbuseLimit: (retryAfter: number, options: Options, o: InstanceType<typeof Octokit>) => {
      // does not retry, only logs a warning
      o.log.warn(`Abuse detected for request ${options.method} ${options.url}`);
    },
  },
});

export async function getAuthenticatedUserAsync() {
  const { data } = await octokit.users.getAuthenticated();
  return data;
}

export const submitReview = (review: Review) => {
  const { repo, repoOwner, prNumber } = getActionInputs();
  return octokit.pulls.createReview({
    owner: repoOwner,
    repo,
    pull_number: prNumber,
    ...review,
  });
};

export const getReviews = () => {
  const { repo, repoOwner, prNumber } = getActionInputs();
  return getAuthenticatedUserAsync().then(async ({ id }) => {
    const { data } = await octokit.pulls.listReviews({
      owner: repoOwner,
      repo,
      pull_number: prNumber,
    });
    return data.filter(({ user }) => user && user.id === id);
  });
};

export const updateReview = async (
  updatableReview: Awaited<ReturnType<typeof getReviews>>[number]['id'],
  { body, comments }: Review,
) => {
  const { repo, repoOwner, prNumber } = getActionInputs();
  const { data } = await octokit.pulls.updateReview({
    owner: repoOwner,
    repo,
    pull_number: prNumber,
    review_id: updatableReview,
    body,
    comments,
  });
  return data;
};

export const getPRDiff = async () => {
  const { repo, repoOwner, prNumber } = getActionInputs();
  const { data } = await octokit.pulls.get({
    owner: repoOwner,
    repo,
    pull_number: prNumber,
    headers: {
      accept: 'application/vnd.github.v3.diff',
    },
  });
  return parseDiff((data as unknown) as string).map((diffEntry) => ({
    ...diffEntry,
    path: path.join(
      process.env.BASE_DIR ?? '.',
      (diffEntry.deleted ? diffEntry.from : diffEntry.to)!,
    ),
  }));
};
