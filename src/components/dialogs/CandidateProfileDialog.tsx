import { Candidate } from '@/types/recruitment';
import { mockDemands } from '@/data/mockData';
import { Mail, Phone, Briefcase, Calendar, DollarSign, MapPin, FileText, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface CandidateProfileDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewResume?: (candidate: Candidate) => void;
  onMoveForward?: (candidate: Candidate) => void;
  onReject?: (candidate: Candidate) => void;
}

export const CandidateProfileDialog = ({
  candidate,
  open,
  onOpenChange,
  onViewResume,
  onMoveForward,
  onReject
}: CandidateProfileDialogProps) => {
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
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={candidate.status} />
                {onViewResume && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary font-normal"
                    onClick={() => onViewResume(candidate)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View Resume
                  </Button>
                )}
              </div>
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
        <DialogFooter className="border-t pt-4 flex sm:justify-between items-center gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {onReject && (
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 sm:flex-none"
                onClick={() => onReject(candidate)}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {onMoveForward && (
              <Button
                className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
                onClick={() => onMoveForward(candidate)}
              >
                Move Forward
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
