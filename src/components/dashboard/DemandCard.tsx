import { Demand } from '@/types/recruitment';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Calendar, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
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

export const DemandCard = ({ demand, onViewDetails, onEdit, onClose, onReopen, onViewApplied, onViewInterviewed, onViewOffers, showActions = true }: DemandCardProps) => {
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
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {demand.location}
              </span>
              <span>{demand.experience}</span>
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {demand.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs font-normal">
              {skill}
            </Badge>
          ))}
          {demand.skills.length > 4 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{demand.skills.length - 4}
            </Badge>
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
            <p className="text-lg font-semibold text-accent">{demand.offers}</p>
            <p className="text-xs text-muted-foreground">Offers</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
