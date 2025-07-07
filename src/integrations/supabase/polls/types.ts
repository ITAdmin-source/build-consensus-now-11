
import { Poll } from '@/types/poll';

export interface CreatePollData {
  title: string;
  topic: string;
  description: string;
  category: string;
  slug: string;
  round_id: string;
  min_consensus_points_to_win: number;
  allow_user_statements: boolean;
  auto_approve_statements: boolean;
  min_support_pct: number;
  max_opposition_pct: number;
  min_votes_per_group: number;
}

export interface PollQueryResult {
  poll_id: string;
  title: string;
  topic: string | null;
  description: string | null;
  min_consensus_points_to_win: number | null;
  allow_user_statements: boolean | null;
  auto_approve_statements: boolean | null;
  status: string;
  min_support_pct: number | null;
  max_opposition_pct: number | null;
  min_votes_per_group: number | null;
  slug: string | null;
  round_id: string;
  polis_poll_categories?: {
    name: string;
  } | null;
}
