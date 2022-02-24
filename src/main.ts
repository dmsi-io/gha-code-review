import getActionInputs from './gha/getActionInputs';
import { submitReview } from './gha/githubAccessor';
import { ReviewerFunction } from './reviewers/reviewer.types';

import { changelogReviewer, todosReviewer } from './reviewers';
import messages from './messages';

export default async () => {
  const { checkChangelog, checkTodos, ...options } = getActionInputs();
  if (!options.repo || !options.repoOwner || options.prNumber < 1) {
    throw new Error('Invalid arguments');
  }

  const reviewsToRun: { name: string; reviewer: ReviewerFunction }[] = [];
  if (checkChangelog) {
    reviewsToRun.push({ name: 'changelog', reviewer: changelogReviewer });
  }
  if (checkTodos) {
    reviewsToRun.push({ name: 'todos', reviewer: todosReviewer });
  }
  return Promise.all(
    reviewsToRun.map(async ({ name, reviewer }) => {
      const review = await reviewer(options);
      if (review) {
        return submitReview(review);
      }
      console.log(messages.success(`No review to submit for ${name}`));
      return Promise.resolve();
    }),
  );
};
