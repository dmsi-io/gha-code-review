import path from 'path';

import { ReviewComment, ReviewerFunction, ReviewEvent, ReviewSide } from '../reviewer.types';
import { getPRDiff } from '../../gha/githubAccessor';
import { getAllPackages } from '../../helpers/files';
import { commentPath } from '../../helpers/fileLinks';

const CHANGELOG_ENTRY = /^\s*[-*]/;
const CHANGELOG_ENTRY_PARSER = /^(\s*[-*])\s((?:\[\w{2,}-\d+])*)\s*(.*)$/;
const generateChangelogAdditionSuggestion = (content: string, storyNumbers: string[]) => {
  const contentPieces = CHANGELOG_ENTRY_PARSER.exec(content);
  if (!contentPieces) {
    return '';
  }

  const [, prefix, storyNumbersString, rest] = contentPieces;
  return `\`\`\`suggestion
${prefix} ${storyNumbersString}${storyNumbersString ? ' ' : ''}${storyNumbers
    .map((storyNumber) => `[${storyNumber}]`)
    .join(' ')}${rest.startsWith(' ') ? '' : ' '}${rest}
\`\`\`
`;
};

const ChangelogReviewer: ReviewerFunction = async (opts) => {
  const diff = await getPRDiff();
  const packages = await getAllPackages();

  const modifiedPackages = packages.filter((pkg) =>
    // If the relative path doesn't start with '../', it's in the same package
    diff.some((fileDiff) => !path.relative(pkg, fileDiff.path).startsWith('../')),
  );

  const modifiedPkgsWithoutChangelog = modifiedPackages.filter(
    (pkg) =>
      !diff.some((fileDiff) => {
        const pathToFile = fileDiff.path.toLowerCase();
        return pathToFile.includes(pkg.toLowerCase()) && pathToFile.includes('changelog.md');
      }),
  );

  let modifiedPkgComment = '';
  if (modifiedPkgsWithoutChangelog.length > 0) {
    modifiedPkgComment = `Please add a changelog entry for the following packages:\n${modifiedPkgsWithoutChangelog
      .map((pkg) => commentPath({ path: pkg }, opts.repoOwner, opts.repo, opts.branch))
      .join('\n')}`;
  }

  let incompleteChangelogComment = '';
  const packagesNeedingStoryNumbers: string[] = [];
  const comments: ReviewComment[] = [];
  diff
    .filter((fileDiff) => fileDiff.path.toLowerCase().includes('changelog.md'))
    .forEach((fileDiff) => {
      let hasFoundSuggestion = false;

      fileDiff.chunks.forEach(({ changes }) =>
        changes.forEach((change) => {
          if (change.type !== 'add' || hasFoundSuggestion) {
            // Skip unchanged or deleted lines
            // Also skip files that have already been commented on
            return;
          }

          if (
            CHANGELOG_ENTRY.test(change.content.substring(1)) &&
            (change.content.toLowerCase().includes('[internal]') ||
              !opts.storyNumbers.split(',').some((story) => change.content.includes(story)))
          ) {
            packagesNeedingStoryNumbers.push(packages.find((pkg) => fileDiff.path.includes(pkg))!);
            // Changelog entry without a story number
            const suggestion = generateChangelogAdditionSuggestion(
              change.content.substring(1),
              opts.storyNumbers.split(','),
            );
            if (suggestion) {
              comments.push({
                path: fileDiff.to!,
                line: change.ln,
                body: suggestion,
                side: ReviewSide.RIGHT,
              });
              hasFoundSuggestion = true;
            }
          }
        }),
      );
    });
  if (comments.length > 0) {
    incompleteChangelogComment = `Please add 1 or more story numbers to the following package${
      packagesNeedingStoryNumbers.length === 1 ? "'s changelog entry" : "s'  changelog entries"
    }:\n${packagesNeedingStoryNumbers
      .map((pkg) => commentPath({ path: pkg }, opts.repoOwner, opts.repo, opts.branch))
      .join('\n')}`;
  }

  const combinedComment = (() => {
    if (modifiedPkgComment && incompleteChangelogComment) {
      return `${modifiedPkgComment}\n\n${incompleteChangelogComment}`;
    }
    if (modifiedPkgComment) {
      return modifiedPkgComment;
    }
    if (incompleteChangelogComment) {
      return incompleteChangelogComment;
    }
    return '';
  })();
  return Promise.resolve(
    combinedComment
      ? {
          body: combinedComment,
          event: ReviewEvent.COMMENT,
          comments: comments.length > 0 ? comments : undefined,
        }
      : undefined,
  );
};

export default ChangelogReviewer;
