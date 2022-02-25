import getActionInputs from './gha/getActionInputs';
import {
  deleteAllPullRequestReviewCommentsAsync,
  getReviews,
  submitReview,
  updateReview,
} from './gha/githubAccessor';
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
    reviewsToRun.push({ name: 'Changelog Review', reviewer: changelogReviewer });
  }
  if (checkTodos) {
    reviewsToRun.push({ name: 'Todo Review', reviewer: todosReviewer });
  }

  const reviews = await Promise.all(
    reviewsToRun.map(async ({ name, reviewer }) => {
      return {
        name,
        review: await reviewer(options),
      };
    }),
  );

  // Delete the old reviews
  const previousReviews = await getReviews();
  console.log('old reviews', previousReviews.map(({ id }) => id).join(', '));

  await Promise.all([
    ...reviews.map(async ({ name, review }) => {
      if (review) {
        const updatableReview = previousReviews.find(({ body }) => body.startsWith(`# ${name}`));
        const submittedReview = {
          ...review,
          body: `# ${name}\n\n${review.body}`,
        };
        if (updatableReview) {
          console.log(messages.text(`updating review for ${name}`));
          return updateReview(updatableReview, submittedReview);
        }
        console.log(messages.text(`creating review for ${name}`));
        return submitReview(submittedReview);
      }
      console.log(messages.success(`No review to submit for ${name}`));
      return Promise.resolve();
    }),
    ...previousReviews
      .filter(
        (r) =>
          !reviews.find((newReview) =>
            newReview.review?.body.startsWith(`# ${r.body.split('\n')[0]}`),
          ),
      )
      .map((r) => {
        return deleteAllPullRequestReviewCommentsAsync(r.id);
      }),
  ]);
};
