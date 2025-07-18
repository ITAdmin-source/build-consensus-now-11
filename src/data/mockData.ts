
import { Poll } from '@/types/poll';

export const mockPolls: Poll[] = [
  {
    poll_id: '1',
    title: 'עתיד החינוך בישראל',
   
    description: 'דיון על כיוון החינוך הישראלי בעשור הקרוב',
    category: 'חינוך',
    time_left: Math.max(0, new Date('2024-07-01T23:59:59Z').getTime() - Date.now()),
    is_expired: new Date('2024-07-01T23:59:59Z').getTime() <= Date.now(),
    min_consensus_points_to_win: 5,
    current_consensus_points: 2,
    total_statements: 12,
    total_votes: 156,
    total_participants: 45,
    allow_user_statements: true,
    auto_approve_statements: false,
    min_support_pct: 60,
    max_opposition_pct: 30,
    min_votes_per_group: 3,
    slug: 'future-of-education-israel',
    created_at: '2024-06-20T10:00:00Z',
    created_by: null,
    round_id: 'mock-round-1',
    round: {
      round_id: 'mock-round-1',
      title: 'Mock Round 1',
      start_time: '2024-06-20T00:00:00Z',
      end_time: '2024-07-01T23:59:59Z',
      publish_status: 'published',
      active_status: 'active'
    }
  },
  {
    poll_id: '2',
    title: 'תחבורה ציבורית ירוקה',
   
    description: 'איך נוכל לשפר את התחבורה הציבורית ולהפוך אותה לידידותית יותר לסביבה?',
    category: 'איכות סביבה',
    time_left: Math.max(0, new Date('2024-06-28T23:59:59Z').getTime() - Date.now()),
    is_expired: new Date('2024-06-28T23:59:59Z').getTime() <= Date.now(),
    min_consensus_points_to_win: 4,
    current_consensus_points: 4,
    total_statements: 8,
    total_votes: 89,
    total_participants: 23,
    allow_user_statements: true,
    auto_approve_statements: false,
    min_support_pct: 55,
    max_opposition_pct: 35,
    min_votes_per_group: 2,
    slug: 'green-public-transport',
    created_at: '2024-06-18T14:30:00Z',
    created_by: null,
    round_id: 'mock-round-2',
    round: {
      round_id: 'mock-round-2',
      title: 'Mock Round 2',
      start_time: '2024-06-18T00:00:00Z',
      end_time: '2024-06-28T23:59:59Z',
      publish_status: 'published',
      active_status: 'completed'
    }
  },
  {
    poll_id: '3',
    title: 'דיור בר השגה לצעירים',

    description: 'פתרונות לבעיית הדיור הישראלית עבור הדור הצעיר',
    category: 'כלכלה',
    time_left: Math.max(0, new Date('2024-07-15T23:59:59Z').getTime() - Date.now()),
    is_expired: new Date('2024-07-15T23:59:59Z').getTime() <= Date.now(),
    min_consensus_points_to_win: 6,
    current_consensus_points: 1,
    total_statements: 15,
    total_votes: 203,
    total_participants: 67,
    allow_user_statements: true,
    auto_approve_statements: false,
    min_support_pct: 65,
    max_opposition_pct: 25,
    min_votes_per_group: 4,
    slug: 'affordable-housing-youth',
    created_at: '2024-06-15T09:15:00Z',
    created_by: null,
    round_id: 'mock-round-3',
    round: {
      round_id: 'mock-round-3',
      title: 'Mock Round 3',
      start_time: '2024-06-15T00:00:00Z',
      end_time: '2024-07-15T23:59:59Z',
      publish_status: 'published',
      active_status: 'active'
    }
  }
];
