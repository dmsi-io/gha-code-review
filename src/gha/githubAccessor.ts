import { Octokit } from '@octokit/rest';
import { retry } from '@octokit/plugin-retry';
import { throttling } from '@octokit/plugin-throttling';

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

export const submitReview = (review: Review) => {
  const { repo, repoOwner, prNumber } = getActionInputs();
  return octokit.pulls.createReview({
    owner: repoOwner,
    repo,
    pull_number: prNumber,
    ...review,
  });
};
