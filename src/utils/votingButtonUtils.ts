
import { Poll } from '@/types/poll';

export interface VotingButtonLabels {
  support: string;
  unsure: string;
  oppose: string;
}

export const getVotingButtonLabels = (poll: Poll): VotingButtonLabels => {
  return {
    support: poll.support_button_label || 'תומך',
    unsure: poll.unsure_button_label || 'לא בטוח',
    oppose: poll.oppose_button_label || 'מתנגד',
  };
};
