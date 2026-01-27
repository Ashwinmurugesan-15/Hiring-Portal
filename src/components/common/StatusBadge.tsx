import { CandidateStatus } from '@/types/recruitment';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CandidateStatus;
  className?: string;
}

const statusConfig: Record<CandidateStatus, { label: string; className: string }> = {
  applied: { label: 'Received', className: 'bg-info/10 text-info border-info/20' },
  screening: { label: 'Proceed Further', className: 'bg-warning/10 text-warning border-warning/20' },
  interview_scheduled: { label: 'On Hold', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  interview_completed: { label: 'No Resp Call/Email', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
  selected: { label: 'Accepted', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  offer_rolled: { label: 'Sent', className: 'bg-accent/10 text-accent border-accent/20' },
  offer_accepted: { label: 'In Notice', className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  offer_rejected: { label: 'Did Not Join', className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  onboarding: { label: 'Onboarding', className: 'bg-info/10 text-info border-info/20' },
  onboarded: { label: 'Joined', className: 'bg-success/10 text-success border-success/20' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge className={cn('border font-medium', config.className, className)}>
      {config.label}
    </Badge>
  );
};
