
import { Poll, Statement, ConsensusPoint } from '@/types/poll';

export const mockPolls: Poll[] = [
  {
    poll_id: '1',
    title: 'עתיד החינוך בישראל',
    topic: 'חינוך וטכנולוגיה',
    description: 'איך נוכל לשפר את מערכת החינוך הישראלית לקראת העתיד?',
    category: 'חינוך',
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    min_consensus_points_to_win: 8,
    allow_user_statements: true,
    auto_approve_statements: false,
    status: 'active',
    min_support_pct: 60,
    max_opposition_pct: 30,
    min_votes_per_group: 3,
    current_consensus_points: 3,
    total_statements: 15,
    total_votes: 342
  },
  {
    poll_id: '2',
    title: 'שיתוף פעולה בין יהודים וערבים',
    topic: 'חברה ושיח דמוקרטי',
    description: 'מה יכול לחזק את השיתוף והדיאלוג בין קבוצות שונות בחברה?',
    category: 'חברה',
    end_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    min_consensus_points_to_win: 10,
    allow_user_statements: true,
    auto_approve_statements: false,
    status: 'active',
    min_support_pct: 65,
    max_opposition_pct: 25,
    min_votes_per_group: 5,
    current_consensus_points: 7,
    total_statements: 22,
    total_votes: 156
  },
  {
    poll_id: '3',
    title: 'איכות הסביבה והקיימות',
    topic: 'סביבה ועתיד',
    description: 'איך נוכל לשמור על הסביבה ולהבטיח עתיד קיים לדורות הבאים?',
    category: 'סביבה',
    end_time: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
    min_consensus_points_to_win: 12,
    allow_user_statements: true,
    auto_approve_statements: false,
    status: 'active',
    min_support_pct: 55,
    max_opposition_pct: 35,
    min_votes_per_group: 4,
    current_consensus_points: 12,
    total_statements: 28,
    total_votes: 89
  }
];

export const mockStatements: Statement[] = [
  {
    statement_id: '1',
    poll_id: '1',
    content_type: 'text',
    content: 'חשוב לשלב טכנולוגיה בחינוך, אבל לא להחליף את המורה האנושי',
    is_user_suggested: false,
    is_approved: true,
    is_consensus_point: true,
    support_pct: 78,
    oppose_pct: 12,
    unsure_pct: 10,
    total_votes: 142,
    score: 85
  },
  {
    statement_id: '2',
    poll_id: '1',
    content_type: 'text',
    content: 'כל ילד צריך לקבל חינוך איכותי, ללא קשר לרקע הכלכלי של המשפחה',
    is_user_suggested: false,
    is_approved: true,
    is_consensus_point: true,
    support_pct: 89,
    oppose_pct: 6,
    unsure_pct: 5,
    total_votes: 156,
    score: 94
  },
  {
    statement_id: '3',
    poll_id: '1',
    content_type: 'text',
    content: 'המורים צריכים הכשרה מקצועית מתמשכת כדי להתעדכן בשיטות חדשות',
    is_user_suggested: true,
    is_approved: true,
    is_consensus_point: false,
    support_pct: 72,
    oppose_pct: 18,
    unsure_pct: 10,
    total_votes: 98,
    score: 67
  },
  {
    statement_id: '4',
    poll_id: '2',
    content_type: 'text',
    content: 'השפה הערבית והעברית צריכות להיות נגישות לכל הילדים במערכת החינוך',
    is_user_suggested: false,
    is_approved: true,
    is_consensus_point: true,
    support_pct: 66,
    oppose_pct: 24,
    unsure_pct: 10,
    total_votes: 89,
    score: 71
  }
];

export const mockConsensusPoints: ConsensusPoint[] = [
  {
    statement_id: '1',
    poll_id: '1',
    detected_at: new Date().toISOString(),
    statement: mockStatements[0]
  },
  {
    statement_id: '2',
    poll_id: '1',
    detected_at: new Date().toISOString(),
    statement: mockStatements[1]
  },
  {
    statement_id: '4',
    poll_id: '2',
    detected_at: new Date().toISOString(),
    statement: mockStatements[3]
  }
];
