import { ReviewerFunction } from '../reviewer.types';
import messages from '../../messages';

const TodoReviewer: ReviewerFunction = async () => {
  console.info(messages.text('reviewer coming soon!'));
  return Promise.resolve();
};

export default TodoReviewer;
