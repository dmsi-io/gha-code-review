export default () => ({
  checkChangelog: process.env.DMSI_CHECK_CHANGELOG === 'true',
  checkTodos: process.env.DMSI_CHECK_TODOS === 'true',
  prNumber: Number.parseInt(process.env.PULL_REQUEST ?? '0', 10),
  repo: process.env.REPO_NAME,
  repoOwner: process.env.REPO_OWNER,
});
