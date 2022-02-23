import { ReviewerFunction } from '../reviewer.types';
import messages from '../../messages';

const ChangelogReviewer: ReviewerFunction = async () => {
  console.info(messages.text('reviewer coming soon!'));
  return Promise.resolve();
};

export default ChangelogReviewer;
