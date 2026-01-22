import { useState } from 'react';
import { Candidate } from '@/types/recruitment';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Eye,
    Calendar,
    Mail,
    FileText,
    Columns,
    ChevronDown,
    ArrowUpDown,
    X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Define Badge variants locally if needed or reuse existing
// Assuming StatusBadge handles the status string correctly

interface Column {
    key: string;
    label: string;
    visible: boolean;
    sortable?: boolean;
}

const defaultColumns: Column[] = [
    { key: 'name', label: 'Candidate', visible: true, sortable: true },
    { key: 'currentRole', label: 'Current Role', visible: true, sortable: true },
    { key: 'experience', label: 'Exp', visible: true, sortable: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'skills', label: 'Skills', visible: false },
    { key: 'source', label: 'Source', visible: false },
    { key: 'appliedAt', label: 'Applied Date', visible: false, sortable: true },
    { key: 'currentCompany', label: 'Current Org', visible: true },
    { key: 'location', label: 'Location', visible: true },
    { key: 'locationPreference', label: 'Loc. Pref', visible: false },
    { key: 'currentCTC', label: 'Current CTC', visible: true },
    { key: 'expectedCTC', label: 'Exp. CTC', visible: true },
    { key: 'noticePeriod', label: 'Notice', visible: true },
    { key: 'isServingNotice', label: 'Serving Notice', visible: false },
    { key: 'isImmediateJoiner', label: 'Imm. Joiner', visible: false },
    { key: 'linkedInProfile', label: 'LinkedIn', visible: false },
    { key: 'hasOtherOffers', label: 'Has Offers', visible: false },
    { key: 'otherOfferCTC', label: 'Offer CTC', visible: false },
    { key: 'certifications', label: 'Certifications', visible: false },
    { key: 'referredBy', label: 'Referred By', visible: false },
    { key: 'round1Recommendation', label: 'Round 1 Feedback', visible: true },
    { key: 'round2Recommendation', label: 'Round 2 Feedback', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
];

interface CandidateTableProps {
    candidates: Candidate[];
    onViewCandidate: (candidate: Candidate) => void;
    onViewResume: (candidate: Candidate) => void;
    onScheduleInterview: (candidate: Candidate) => void;
    onMoveForward: (candidate: Candidate) => void;
    onReject: (candidate: Candidate) => void;
}

export function CandidateTable({
    candidates,
    onViewCandidate,
    onViewResume,
    onScheduleInterview,
    onMoveForward,
    onReject
}: CandidateTableProps) {
    const [columns, setColumns] = useState<Column[]>(defaultColumns);
    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
    const [sortColumn, setSortColumn] = useState<string>('appliedAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const visibleColumns = columns.filter(col => col.visible);

    const toggleColumn = (key: string) => {
        setColumns(cols =>
            cols.map(col =>
                col.key === key ? { ...col, visible: !col.visible } : col
            )
        );
    };

    const toggleSelectAll = () => {
        if (selectedCandidates.length === candidates.length) {
            setSelectedCandidates([]);
        } else {
            setSelectedCandidates(candidates.map(c => c.id));
        }
    };

    const toggleSelectCandidate = (id: string) => {
        setSelectedCandidates(prev =>
            prev.includes(id)
                ? prev.filter(cId => cId !== id)
                : [...prev, id]
        );
    };

    const handleSort = (key: string) => {
        if (sortColumn === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(key);
            setSortDirection('asc');
        }
    };

    const sortedCandidates = [...candidates].sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aVal: any = a[sortColumn as keyof Candidate];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bVal: any = b[sortColumn as keyof Candidate];

        // Handle nested or specific field logic if needed
        if (sortColumn === 'appliedAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const sourceLabels: Record<string, string> = {
        career_portal: 'Career Page',
    };

    return (
        <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
            {/* Table Header Actions */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2">
                    {selectedCandidates.length > 0 && (
                        <span className="text-sm text-muted-foreground font-medium">
                            {selectedCandidates.length} selected
                        </span>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 bg-background">
                            <Columns className="w-4 h-4" />
                            Columns
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {columns.filter(c => c.key !== 'actions').map(column => (
                            <DropdownMenuCheckboxItem
                                key={column.key}
                                checked={column.visible}
                                onCheckedChange={() => toggleColumn(column.key)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {column.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="w-12 p-4 align-middle">
                                <Checkbox
                                    checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </th>
                            {visibleColumns.map(column => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'p-4 text-left text-sm font-medium text-muted-foreground align-middle whitespace-nowrap',
                                        column.sortable && 'cursor-pointer hover:bg-muted/70 transition-colors'
                                    )}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable && (
                                            <ArrowUpDown className="w-3 h-3" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCandidates.map((candidate) => (
                            <tr
                                key={candidate.id}
                                className="hover:bg-muted/50 transition-colors border-b border-border last:border-0 cursor-pointer"
                                onClick={() => onViewCandidate(candidate)}
                            >
                                <td className="p-4 align-middle" onClick={e => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedCandidates.includes(candidate.id)}
                                        onCheckedChange={() => toggleSelectCandidate(candidate.id)}
                                    />
                                </td>
                                {visibleColumns.map(column => (
                                    <td key={column.key} className="p-4 align-middle whitespace-nowrap">
                                        {column.key === 'name' && (
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-9 h-9">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                        {candidate.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{candidate.name}</p>
                                                    <p className="text-xs text-muted-foreground">{candidate.email}</p>
                                                </div>
                                            </div>
                                        )}
                                        {column.key === 'currentRole' && (
                                            <span className="text-sm text-foreground">{candidate.currentRole || '-'}</span>
                                        )}
                                        {column.key === 'skills' && (
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {candidate.skills?.slice(0, 3).map(skill => (
                                                    <span
                                                        key={skill}
                                                        className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {candidate.skills?.length > 3 && (
                                                    <span className="text-xs text-muted-foreground self-center">
                                                        +{candidate.skills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {column.key === 'certifications' && (
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {candidate.certifications?.slice(0, 1).map(cert => (
                                                    <span
                                                        key={cert}
                                                        className="px-2 py-0.5 border text-muted-foreground text-xs rounded-md"
                                                    >
                                                        {cert}
                                                    </span>
                                                ))}
                                                {candidate.certifications && candidate.certifications.length > 1 && (
                                                    <span className="text-xs text-muted-foreground self-center">
                                                        +{candidate.certifications.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {column.key === 'experience' && (
                                            <span className="text-sm text-foreground">{candidate.experience}</span>
                                        )}
                                        {column.key === 'status' && (
                                            <StatusBadge status={candidate.status} />
                                        )}
                                        {column.key === 'source' && (
                                            <span className="text-sm text-muted-foreground">
                                                {sourceLabels[candidate.source] || candidate.source}
                                            </span>
                                        )}
                                        {column.key === 'appliedAt' && (
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(candidate.appliedAt), 'MMM d, yyyy')}
                                            </span>
                                        )}
                                        {column.key === 'currentCompany' && (
                                            <span className="text-sm text-foreground">
                                                {candidate.currentCompany || '-'}
                                            </span>
                                        )}
                                        {column.key === 'location' && (
                                            <span className="text-sm text-muted-foreground">
                                                {candidate.location || '-'}
                                            </span>
                                        )}
                                        {column.key === 'locationPreference' && (
                                            <span className="text-sm text-muted-foreground">
                                                {candidate.locationPreference || '-'}
                                            </span>
                                        )}
                                        {column.key === 'currentCTC' && (
                                            <span className="text-sm text-foreground">
                                                {candidate.currentCTC || '-'}
                                            </span>
                                        )}
                                        {column.key === 'expectedCTC' && (
                                            <span className="text-sm text-muted-foreground">
                                                {candidate.expectedCTC || '-'}
                                            </span>
                                        )}
                                        {column.key === 'noticePeriod' && (
                                            <span className="text-sm text-muted-foreground">
                                                {candidate.noticePeriod || '-'}
                                            </span>
                                        )}
                                        {column.key === 'isServingNotice' && (
                                            <span className="text-sm">
                                                {candidate.isServingNotice ? (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">Yes</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">No</span>
                                                )}
                                            </span>
                                        )}
                                        {column.key === 'isImmediateJoiner' && (
                                            <span className="text-sm">
                                                {candidate.isImmediateJoiner ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-500/30 bg-green-500/10">Yes</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">No</span>
                                                )}
                                            </span>
                                        )}
                                        {column.key === 'hasOtherOffers' && (
                                            <span className="text-sm">
                                                {candidate.hasOtherOffers ? (
                                                    <Badge variant="secondary">Yes</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">No</span>
                                                )}
                                            </span>
                                        )}
                                        {column.key === 'otherOfferCTC' && (
                                            <span className="text-sm text-muted-foreground">
                                                {candidate.otherOfferCTC || '-'}
                                            </span>
                                        )}
                                        {column.key === 'linkedInProfile' && candidate.linkedInProfile && (
                                            <a
                                                href={`https://${candidate.linkedInProfile.replace(/^https?:\/\//, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                View Profile
                                            </a>
                                        )}
                                        {column.key === 'referredBy' && (
                                            <span className="text-sm text-muted-foreground">
                                                {candidate.referredBy || '-'}
                                            </span>
                                        )}
                                        {column.key === 'round1Recommendation' && (
                                            <span className="text-sm text-foreground">
                                                {candidate.round1Recommendation ? (
                                                    <Badge variant={candidate.round1Recommendation === 'proceed_to_round2' ? 'default' : 'destructive'}>
                                                        {candidate.round1Recommendation === 'proceed_to_round2' ? 'Proceed' : 'Reject'}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </span>
                                        )}
                                        {column.key === 'round2Recommendation' && (
                                            <span className="text-sm text-foreground max-w-[150px] truncate inline-block" title={candidate.round2Recommendation || ''}>
                                                {candidate.round2Recommendation || '-'}
                                            </span>
                                        )}
                                        {column.key === 'actions' && (
                                            <div onClick={e => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onViewCandidate(candidate)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onViewResume(candidate)}>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            View Resume
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onScheduleInterview(candidate)}>
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            Schedule Interview
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => onMoveForward(candidate)}>
                                                            <ArrowUpDown className="mr-2 h-4 w-4" />
                                                            Move Forward
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => onReject(candidate)}
                                                        >
                                                            <X className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
