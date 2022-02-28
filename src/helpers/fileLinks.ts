export const commentPath = (
  c: { line?: number; path: string },
  repoOwner: string,
  repo: string,
  branch: string,
) => {
  if (branch && repo && repoOwner) {
    return `- [\`${c.path}${
      c.line && c.line > 0 ? `:${c.line}` : ''
    }\`](https://github.com/${repoOwner}/${repo}/blob/${branch}/${c.path.replace(/^\.\//, '')}${
      c.line && c.line > 0 ? `#L${c.line}` : ''
    })`;
  }

  return `- \`${c.path}${c.line ? `:${c.line}` : ''}\``;
};
