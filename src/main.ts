import getActionInputs from './gha/getActionInputs';
import { ReviewerFunction, ReviewerOptions } from './reviewers/reviewer.types';

import { changelogReviewer, todosReviewer } from './reviewers';

export default async () => {
  const { checkChangelog, checkTodos, ...options } = getActionInputs();
  if (!options.repo || !options.repoOwner || options.prNumber < 1) {
    throw new Error('Invalid arguments');
  }

  const reviewsToRun: ReviewerFunction[] = [];
  if (checkChangelog) {
    reviewsToRun.push(changelogReviewer);
  }
  if (checkTodos) {
    reviewsToRun.push(todosReviewer);
  }
  await Promise.all(reviewsToRun.map((reviewer) => reviewer(options as ReviewerOptions)));
};
