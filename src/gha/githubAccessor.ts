import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
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

export type PullRequestReview = RestEndpointMethodTypes['pulls']['getReview']['response']['data'];

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
  updatableReview: Awaited<ReturnType<typeof getReviews>>[number],
  { body }: Review,
) => {
  const { repo, repoOwner, prNumber } = getActionInputs();
  const { data } = await octokit.pulls.updateReview({
    owner: repoOwner,
    repo,
    pull_number: prNumber,
    review_id: updatableReview.id,
    body,
  });
  return data;
};

export const listPullRequestReviewCommentsAsync = async (reviewID: number) => {
  const { repo, repoOwner, prNumber } = getActionInputs();
  const { data } = await octokit.pulls.listReviewComments({
    owner: repoOwner,
    repo,
    pull_number: prNumber,
    review_id: reviewID,
  });
  return data;
};

export const deletePullRequestReviewCommentAsync = async (commentID: number) => {
  const { repo, repoOwner } = getActionInputs();
  const { data } = await octokit.pulls.deleteReviewComment({
    owner: repoOwner,
    repo,
    comment_id: commentID,
  });
  return data;
};

export const deleteAllPullRequestReviewCommentsAsync = async (reviewID: number) => {
  const comments = await listPullRequestReviewCommentsAsync(reviewID);

  await Promise.all(
    comments
      .filter((comment) => comment.pull_request_review_id === reviewID)
      .map((comment) => deletePullRequestReviewCommentAsync(comment.id)),
  );
};
