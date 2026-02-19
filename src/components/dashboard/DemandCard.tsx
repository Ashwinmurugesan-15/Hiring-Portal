
import { Demand } from '@/types/recruitment';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, MapPin, Briefcase, Clock, RotateCcw, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DemandCardProps {
  demand: Demand;
  onClick?: () => void;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onClose?: () => void;
  onReopen?: () => void;
  onDelete?: () => void;
  onViewApplied?: () => void;
  onViewInterviewed?: () => void;
  onViewOffers?: () => void;
  showActions?: boolean;
}

const statusColors = {
  open: 'bg-success/10 text-success border-success/20',
  closed: 'bg-muted text-muted-foreground border-border',
  on_hold: 'bg-warning/10 text-warning border-warning/20',
};

const isValidDate = (d: any) => {
  return d instanceof Date && !isNaN(d.getTime());
};

export const DemandCard = ({ demand, onViewDetails, onEdit, onClose, onReopen, onDelete, onViewApplied, onViewInterviewed, onViewOffers, showActions = true }: DemandCardProps) => {
  return (
    <Card
      className="group border shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={onViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {demand.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{demand.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <span>{demand.experience}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{demand.openings} Openings</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('border', statusColors[demand.status])}>
              {demand.status === 'on_hold' ? 'On Hold' : demand.status.charAt(0).toUpperCase() + demand.status.slice(1)}
            </Badge>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}>
                    Edit Demand
                  </DropdownMenuItem>
                  {demand.status === 'open' && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onClose?.();
                    }}>
                      Close Position
                    </DropdownMenuItem>
                  )}
                  {(demand.status === 'closed' || demand.status === 'on_hold') && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onReopen?.();
                    }}>
                      Reopen Position
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }} className="text-destructive focus:text-destructive">
                    Delete Position
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(demand.skills || []).slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs font-normal">
              {skill}
            </Badge>
          ))}
          {(demand.skills || []).length > 4 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{(demand.skills || []).length - 4}
            </Badge>
          )}
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-1 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>
              Created: {isValidDate(new Date(demand.createdAt))
                ? format(new Date(demand.createdAt), 'MMM d, yyyy h:mm a')
                : 'Invalid Data'}
            </span>
          </div>
          {demand.reopenedAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Reopened: {format(new Date(demand.reopenedAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center cursor-pointer hover:text-primary transition-colors" onClick={(e) => {
            e.stopPropagation();
            onViewApplied?.();
          }}>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-semibold text-foreground">{demand.applicants}</p>
            <p className="text-xs text-muted-foreground">Applied</p>
          </div>
          <div className="text-center border-x border-border cursor-pointer hover:text-primary transition-colors" onClick={(e) => {
            e.stopPropagation();
            onViewInterviewed?.();
          }}>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-semibold text-foreground">{demand.interviewed}</p>
            <p className="text-xs text-muted-foreground">Interviewed</p>
          </div>
          <div className="text-center cursor-pointer hover:text-primary transition-colors" onClick={(e) => {
            e.stopPropagation();
            onViewOffers?.();
          }}>
            <p className="text-lg font-semibold text-foreground">{demand.offers}</p>
            <p className="text-xs text-muted-foreground">Offers</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
