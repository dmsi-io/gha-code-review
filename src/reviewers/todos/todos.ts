import { ReviewerFunction, ReviewerOptions, ReviewEvent } from '../reviewer.types';
import messages from '../../messages';
import { commentPath } from '../../helpers/fileLinks';

const TodoReviewer: ReviewerFunction = async (opts: ReviewerOptions) => {
  if (!opts.todos) {
    return Promise.resolve(undefined);
  }

  const comments = opts.todos.split('\n').map((todo) => {
    const [path, line] = todo.split(':');
    return {
      path,
      line: parseInt(line, 10),
    };
  });

  if (comments.length === 0) {
    return Promise.resolve(undefined);
  }

  console.info(messages.text(`${comments.length} matching todos found`));
  return Promise.resolve({
    body: `There ${
      comments.length === 1 ? 'is 1 todo' : `are ${comments.length} todos`
    } in your code associated with the story/stories on this pull request. Can ${
      comments.length === 1 ? 'it' : 'they'
    } be removed?\n\n${comments
      .map((c) => commentPath(c, opts.repoOwner, opts.repo, opts.branch))
      .join('\n')}`,
    event: ReviewEvent.COMMENT,
  });
};

export default TodoReviewer;
