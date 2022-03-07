export const commentPath = (
  c:
    | { directory: boolean; line?: never; path: string }
    | { directory?: never; line: number; path: string },
  repoOwner: string,
  repo: string,
  branch: string,
  prefix = '- ',
) => {
  if (branch && repo && repoOwner) {
    return `${prefix}[\`${c.directory && (c.path === '' || c.path === '.') ? './' : c.path}${
      c.line && c.line > 0 ? `:${c.line}` : ''
    }\`](https://github.com/${repoOwner}/${repo}/${
      c.directory
        ? `tree/${branch}`
        : `blob/${branch}/${c.path.replace(/^\.\//, '')}${
            c.line && c.line > 0 ? `#L${c.line}` : ''
          }`
    })`;
  }

  return `- \`${c.path}${c.line ? `:${c.line}` : ''}\``;
};
