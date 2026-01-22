import { Candidate } from '@/types/recruitment';
import { mockDemands } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Mail, Phone, Briefcase, Calendar, DollarSign, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface CandidateProfileDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CandidateProfileDialog = ({ candidate, open, onOpenChange }: CandidateProfileDialogProps) => {
  if (!candidate) return null;

  const demand = mockDemands.find(d => d.id === candidate.demandId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Candidate Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {candidate.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{candidate.name}</h3>
              <StatusBadge status={candidate.status} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.phone}</span>
            </div>
          </div>

          {/* Position Details */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{demand?.title || 'Unknown Position'}</span>
            </div>
            {demand && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{demand.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Applied: {format(candidate.appliedAt, 'MMM d, yyyy')}</span>
            </div>
            {candidate.currentRound && (
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline">Round {candidate.currentRound}</Badge>
              </div>
            )}
          </div>

          {/* CTC Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Expected CTC
              </div>
              <p className="font-semibold">{candidate.expectedCTC || 'Not specified'}</p>
            </div>
            {candidate.offeredCTC && (
              <div className="p-4 rounded-lg border bg-success/5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  Offered CTC
                </div>
                <p className="font-semibold text-success">{candidate.offeredCTC}</p>
              </div>
            )}
          </div>

          {/* Date of Joining */}
          {candidate.dateOfJoining && (
            <div className="p-4 rounded-lg border bg-accent/5">
              <div className="text-sm text-muted-foreground mb-1">Date of Joining</div>
              <p className="font-semibold text-accent">{format(candidate.dateOfJoining, 'MMMM d, yyyy')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
