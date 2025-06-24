
import { Poll } from '@/types/poll';

export const mockPolls: Poll[] = [
  {
    poll_id: '1',
    title: 'עתיד החינוך בישראל',
    topic: 'חינוך',
    description: 'דיון על כיוון החינוך הישראלי בעשור הקרוב',
    category: 'חינוך',
    end_time: '2024-07-01T23:59:59Z',
    min_consensus_points_to_win: 5,
    allow_user_statements: true,
    auto_approve_statements: false,
    status: 'active',
    min_support_pct: 60,
    max_opposition_pct: 30,
    min_votes_per_group: 3,
    current_consensus_points: 2,
    total_statements: 12,
    total_votes: 156,
    slug: 'future-of-education-israel'
  },
  {
    poll_id: '2',
    title: 'תחבורה ציבורית ירוקה',
    topic: 'תחבורה',
    description: 'איך נוכל לשפר את התחבורה הציבורית ולהפוך אותה לידידותית יותר לסביבה?',
    category: 'איכות סביבה',
    end_time: '2024-06-28T23:59:59Z',
    min_consensus_points_to_win: 4,
    allow_user_statements: true,
    auto_approve_statements: false,
    status: 'active',
    min_support_pct: 55,
    max_opposition_pct: 35,
    min_votes_per_group: 2,
    current_consensus_points: 4,
    total_statements: 8,
    total_votes: 89,
    slug: 'green-public-transport'
  },
  {
    poll_id: '3',
    title: 'דיור בר השגה לצעירים',
    topic: 'דיור',
    description: 'פתרונות לבעיית הדיור הישראלית עבור הדור הצעיר',
    category: 'כלכלה',
    end_time: '2024-07-15T23:59:59Z',
    min_consensus_points_to_win: 6,
    allow_user_statements: true,
    auto_approve_statements: false,
    status: 'active',
    min_support_pct: 65,
    max_opposition_pct: 25,
    min_votes_per_group: 4,
    current_consensus_points: 1,
    total_statements: 15,
    total_votes: 203,
    slug: 'affordable-housing-youth'
  }
];
