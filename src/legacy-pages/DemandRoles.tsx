'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockDemands, mockCandidates } from '@/data/mockData';
import { Demand, Candidate } from '@/types/recruitment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, Users, MapPin, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DemandWithCandidates extends Demand {
    candidateCount: number;
    candidates: Candidate[];
}

const DemandRoles = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDemand, setSelectedDemand] = useState<DemandWithCandidates | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [candidateFilter, setCandidateFilter] = useState<'all' | 'new' | 'old'>('all');

    // Compute demands with their candidate counts
    const demandsWithCandidates: DemandWithCandidates[] = useMemo(() => {
        return mockDemands.map(demand => {
            const candidates = mockCandidates.filter(c => c.demandId === demand.id);
            return {
                ...demand,
                candidateCount: candidates.length,
                candidates,
            };
        });
    }, []);

    // Filter demands based on search
    const filteredDemands = useMemo(() => {
        if (!searchQuery) return demandsWithCandidates;
        const query = searchQuery.toLowerCase();
        return demandsWithCandidates.filter(
            demand =>
                demand.title.toLowerCase().includes(query) ||
                demand.role.toLowerCase().includes(query) ||
                demand.location.toLowerCase().includes(query)
        );
    }, [demandsWithCandidates, searchQuery]);

    const handleDemandClick = (demand: DemandWithCandidates) => {
        setSelectedDemand(demand);
        setCandidateFilter('all'); // Reset filter when opening a new demand
        setIsDrawerOpen(true);
    };

    const getFilteredCandidates = (demand: DemandWithCandidates | null) => {
        if (!demand || !demand.candidates) return [];

        if (candidateFilter === 'all') return demand.candidates;

        const reopenedDate = demand.reopenedAt ? new Date(demand.reopenedAt) : null;

        // If demand was never reopened, "New" means everyone, "Old" means no one (or handle differently)
        // Assuming if not reopened, all are considered "New" or just "All".
        // But for strict "New" vs "Old", we need a reference point. 
        // If no reopenedAt, let's assume all are "New" in the context of recent activity, 
        // or just return empty for Old.

        if (!reopenedDate) {
            return candidateFilter === 'new' ? demand.candidates : [];
        }

        return demand.candidates.filter(candidate => {
            const appliedDate = new Date(candidate.appliedAt);

            if (candidateFilter === 'new') {
                return appliedDate >= reopenedDate;
            } else {
                // Old: Applied BEFORE reopen AND not interviewed (status is 'applied' or 'screening')
                // Note: User said "candidates who applied... but were not interviewed". 
                // We'll trust status check.
                const isNotInterviewed = ['applied', 'screening'].includes(candidate.status);
                return appliedDate < reopenedDate && isNotInterviewed;
            }
        });
    };

    const filteredCandidates = getFilteredCandidates(selectedDemand);

    const getStatusColor = (status: Demand['status']) => {
        switch (status) {
            case 'open':
                return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'closed':
                return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'on_hold':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <DashboardLayout title="Demand Roles">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Demand Roles</h2>
                        <p className="text-muted-foreground">
                            View all demand roles and their applied candidates
                        </p>
                    </div>
                </div>

                {/* Search */}
                <Card className="shadow-card">
                    <CardContent className="p-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title, role, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Demand Roles List */}
                <div className="space-y-3">
                    {filteredDemands.map((demand) => (
                        <Card
                            key={demand.id}
                            className="shadow-card hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary/50 hover:border-l-primary"
                            onClick={() => handleDemandClick(demand)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {demand.title}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className={cn('capitalize', getStatusColor(demand.status))}
                                            >
                                                {demand.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-4 w-4" />
                                                {demand.role}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {demand.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(demand.createdAt), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {demand.skills.slice(0, 4).map((skill) => (
                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {demand.skills.length > 4 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{demand.skills.length - 4} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center px-4 py-2 bg-primary/10 rounded-lg">
                                            <div className="flex items-center gap-1 text-primary">
                                                <Users className="h-4 w-4" />
                                                <span className="text-xl font-bold">{demand.candidateCount}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Candidates</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredDemands.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No demand roles found matching your search</p>
                    </div>
                )}

                {/* Candidate Details Drawer */}
                <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-xl">{selectedDemand?.title}</SheetTitle>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    {selectedDemand?.role}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {selectedDemand?.location}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={cn('capitalize', getStatusColor(selectedDemand?.status || 'open'))}
                                >
                                    {selectedDemand?.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </SheetHeader>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <Card className="bg-muted/50">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-primary">
                                        {selectedDemand?.candidateCount || 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Applied</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/50">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-foreground">
                                        {selectedDemand?.openings || 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Openings</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/50">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-foreground">
                                        {selectedDemand?.experience}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Experience</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Applied Candidates */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Candidates ({filteredCandidates.length})
                                </h4>

                                {selectedDemand?.reopenedAt && (
                                    <div className="flex bg-muted/30 p-1.5 rounded-xl border gap-2">
                                        <Button
                                            onClick={() => setCandidateFilter('all')}
                                            variant={candidateFilter === 'all' ? 'default' : 'ghost'}
                                            size="sm"
                                            className="h-8 rounded-lg"
                                        >
                                            All Candidates
                                        </Button>
                                        <Button
                                            onClick={() => setCandidateFilter('new')}
                                            variant={candidateFilter === 'new' ? 'default' : 'ghost'}
                                            size="sm"
                                            className={cn(
                                                "h-8 rounded-lg transition-colors",
                                                candidateFilter === 'new' && "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                                            )}
                                        >
                                            New
                                        </Button>
                                        <Button
                                            onClick={() => setCandidateFilter('old')}
                                            variant={candidateFilter === 'old' ? 'default' : 'ghost'}
                                            size="sm"
                                            className={cn(
                                                "h-8 rounded-lg transition-colors",
                                                candidateFilter === 'old' && "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20"
                                            )}
                                        >
                                            Old
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {filteredCandidates.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead>Candidate</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Applied</TableHead>
                                                <TableHead>Skills</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCandidates.map((candidate) => (
                                                <TableRow key={candidate.id} className="hover:bg-muted/30">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                                    {candidate.name
                                                                        .split(' ')
                                                                        .map((n) => n[0])
                                                                        .join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium text-foreground">{candidate.name}</p>
                                                                <p className="text-xs text-muted-foreground">{candidate.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={candidate.status} />
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {format(new Date(candidate.appliedAt), 'MMM d, yyyy')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                            {candidate.skills?.slice(0, 2).map((skill) => (
                                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                            {candidate.skills?.length > 2 && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    +{candidate.skills.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 border rounded-lg bg-muted/20">
                                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                                    <p className="text-muted-foreground">No candidates have applied yet</p>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </DashboardLayout>
    );
};

export default DemandRoles;
