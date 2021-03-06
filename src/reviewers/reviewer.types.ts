export enum ReviewEvent {
  APPROVE = 'APPROVE',
  COMMENT = 'COMMENT',
  REQUEST_CHANGES = 'REQUEST_CHANGES',
}

export enum ReviewSide {
  // Used for removals for 2-column view
  LEFT = 'LEFT',
  // Used for additions for 2-column view
  RIGHT = 'RIGHT',
}

export type ReviewerOptions = {
  branch: string;
  prNumber: number;
  repo: string;
  repoOwner: string;
  storyNumbers: string;
  todos: string | undefined;
};

export type ReviewComment = {
  body: string;
  path: string;
  side: ReviewSide;
  line: number;
};

export type Review = {
  body: string;
  event: ReviewEvent;
  comments?: ReviewComment[];
};

export type ReviewerFunction = (opts: ReviewerOptions) => Promise<Review | undefined>;
