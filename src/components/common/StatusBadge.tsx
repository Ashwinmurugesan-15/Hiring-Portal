import { CandidateStatus } from '@/types/recruitment';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CandidateStatus;
  className?: string;
}

const statusConfig: Record<CandidateStatus, { label: string; className: string }> = {
  applied: { label: 'Applied', className: 'bg-info/10 text-info border-info/20' },
  screening: { label: 'Screening', className: 'bg-warning/10 text-warning border-warning/20' },
  interview_scheduled: { label: 'Interview Scheduled', className: 'bg-primary/10 text-primary border-primary/20' },
  interview_completed: { label: 'Interview Done', className: 'bg-primary/10 text-primary border-primary/20' },
  selected: { label: 'Selected', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  offer_rolled: { label: 'Offer Sent', className: 'bg-accent/10 text-accent border-accent/20' },
  offer_accepted: { label: 'Offer Accepted', className: 'bg-success/10 text-success border-success/20' },
  offer_rejected: { label: 'Offer Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  onboarding: { label: 'Onboarding', className: 'bg-info/10 text-info border-info/20' },
  onboarded: { label: 'Onboarded', className: 'bg-success/10 text-success border-success/20' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge className={cn('border font-medium', config.className, className)}>
      {config.label}
    </Badge>
  );
};
