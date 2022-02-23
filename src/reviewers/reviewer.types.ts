export type ReviewerOptions = {
  prNumber: number;
  repo: string;
  repoOwner: string;
};
export type ReviewerFunction = (opts: ReviewerOptions) => Promise<void>;
