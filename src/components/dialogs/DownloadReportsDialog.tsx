import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRecruitment } from '@/context/RecruitmentContext';
import { useDemands } from '@/context/DemandsContext';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

interface DownloadReportsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const DownloadReportsDialog = ({ open, onOpenChange }: DownloadReportsDialogProps) => {
    const { candidates, interviews } = useRecruitment();
    const { demands } = useDemands();

    const [selectedReports, setSelectedReports] = useState({
        candidates: true,
        interviews: false,
        demands: false,
        selected: false,
        onboarding: false,
        offers: false,
        dashboard: false,
    });

    const reportOptions = [
        { id: 'candidates', label: 'Candidate Page Report' },
        { id: 'interviews', label: 'Interviewer Report' },
        { id: 'demands', label: 'Demand Report' },
        { id: 'selected', label: 'Selected Candidate Report' },
        { id: 'onboarding', label: 'Onboarding Report' },
        { id: 'offers', label: 'Offer Report' },
        { id: 'dashboard', label: 'Dashboard Report' },
    ];

    const handleToggle = (id: string) => {
        setSelectedReports((prev) => ({
            ...prev,
            [id]: !prev[id as keyof typeof prev],
        }));
    };

    const isAllSelected = Object.values(selectedReports).every(Boolean);

    const handleSelectAll = (checked: boolean) => {
        const newState = { ...selectedReports };
        Object.keys(newState).forEach(key => {
            newState[key as keyof typeof selectedReports] = checked;
        });
        setSelectedReports(newState);
    };

    const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();

        if (selectedReports.candidates) {
            const data = candidates.map(c => ({
                Name: c.name,
                Email: c.email,
                Phone: c.phone,
                Status: c.status,
                Experience: c.experience,
                'Applied Date': format(c.appliedAt, 'yyyy-MM-dd'),
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
        }

        if (selectedReports.interviews) {
            const data = interviews.map(i => ({
                Candidate: i.candidateName,
                'Demand Title': i.demandTitle,
                Round: i.round,
                Interviewer: i.interviewerName,
                Date: format(i.scheduledAt, 'yyyy-MM-dd HH:mm'),
                Status: i.status,
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Interviews');
        }

        if (selectedReports.demands) {
            const data = demands.map(d => ({
                Title: d.title,
                Role: d.role,
                Location: d.location,
                Status: d.status,
                Openings: d.openings,
                'Created At': format(d.createdAt, 'yyyy-MM-dd'),
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Demands');
        }

        if (selectedReports.selected) {
            const data = candidates.filter(c => c.status === 'selected').map(c => ({
                Name: c.name,
                Email: c.email,
                Position: c.offeredPosition || '-',
                'Applied Date': format(c.appliedAt, 'yyyy-MM-dd'),
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Candidates');
        }

        if (selectedReports.onboarding) {
            const data = candidates.filter(c => ['onboarding', 'onboarded'].includes(c.status)).map(c => ({
                Name: c.name,
                Email: c.email,
                Status: c.status,
                'Joining Date': c.dateOfJoining ? format(c.dateOfJoining, 'yyyy-MM-dd') : '-',
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Onboarding');
        }

        if (selectedReports.offers) {
            const data = candidates.filter(c => ['offer_rolled', 'offer_accepted'].includes(c.status)).map(c => ({
                Name: c.name,
                Email: c.email,
                Status: c.status,
                'Offered CTC': c.offeredCTC || '-',
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Offers');
        }

        if (selectedReports.dashboard) {
            // 1. Dashboard Summary Stats
            const summaryData = [
                { Metric: 'Total Candidates Applied', Value: candidates.length },
                { Metric: 'Candidates Selected', Value: candidates.filter(c => c.status === 'selected').length },
                { Metric: 'Candidates Interviewed', Value: candidates.filter(c => ['interview_scheduled', 'interview_completed', 'selected', 'offer_rolled', 'offer_accepted', 'onboarding', 'onboarded'].includes(c.status)).length },
                { Metric: 'Candidates Rejected', Value: candidates.filter(c => ['rejected', 'offer_rejected'].includes(c.status) || c.round1Recommendation === 'reject' || c.round2Recommendation === 'reject').length },
                { Metric: 'Candidates Offered', Value: candidates.filter(c => c.status === 'offer_rolled').length },
                { Metric: 'Candidates Onboarded', Value: candidates.filter(c => c.status === 'onboarded').length },
                { Metric: 'Bench Strength', Value: 8 }, // Mock value matches Dashboard.tsx
                { Metric: 'Allocated to Projects', Value: 1 }, // Mock value matches Dashboard.tsx
            ];
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Dashboard Summary');

            // 2. Rejection Metrics
            const screeningRejected = candidates.filter(c => c.status === 'rejected' && (!c.currentRound || c.currentRound === undefined)).length;
            const screeningTotal = candidates.filter(c => (c.status === 'rejected' && (!c.currentRound || c.currentRound === undefined)) || (c.currentRound !== undefined && c.currentRound >= 1) || ['screening', 'interview_scheduled', 'interview_completed', 'selected', 'offer_rolled', 'offer_accepted', 'onboarding', 'onboarded'].includes(c.status)).length;

            const round1Rejected = candidates.filter(c => (c.status === 'rejected' && c.currentRound === 1) || (c.round1Recommendation === 'reject')).length;
            const round1Total = candidates.filter(c => (c.currentRound !== undefined && c.currentRound >= 1) || (c.round1Recommendation !== undefined)).length;

            const round2Rejected = candidates.filter(c => (c.status === 'rejected' && c.currentRound === 2) || (c.round2Recommendation === 'reject')).length;
            const round2Total = candidates.filter(c => (c.currentRound !== undefined && c.currentRound >= 2) || (c.round2Recommendation !== undefined)).length;

            const rejectionData = [
                { Stage: 'Screening', 'Rejected Count': screeningRejected, 'Total Count': screeningTotal, 'Percentage': screeningTotal > 0 ? `${Math.round((screeningRejected / screeningTotal) * 100)}%` : '0%' },
                { Stage: 'Round 1', 'Rejected Count': round1Rejected, 'Total Count': round1Total, 'Percentage': round1Total > 0 ? `${Math.round((round1Rejected / round1Total) * 100)}%` : '0%' },
                { Stage: 'Round 2', 'Rejected Count': round2Rejected, 'Total Count': round2Total, 'Percentage': round2Total > 0 ? `${Math.round((round2Rejected / round2Total) * 100)}%` : '0%' },
            ];
            const rejectionSheet = XLSX.utils.json_to_sheet(rejectionData);
            XLSX.utils.book_append_sheet(workbook, rejectionSheet, 'Rejection Metrics');

            // 3. Demand Summary Analysis
            const demandSummaryData = demands.filter(d => d.status === 'open').map(d => {
                const demandCandidates = candidates.filter(c => c.demandId === d.id);
                return {
                    'Demand Title': d.title,
                    'Location': d.location,
                    'Openings': d.openings,
                    'Applied': demandCandidates.length,
                    'Interviewed': demandCandidates.filter(c => ['interview_scheduled', 'interview_completed', 'selected', 'offer_rolled', 'offer_accepted', 'onboarding', 'onboarded'].includes(c.status)).length,
                    'Offers': demandCandidates.filter(c => ['offer_rolled', 'offer_accepted'].includes(c.status)).length,
                    'Rejected': demandCandidates.filter(c => ['rejected', 'offer_rejected'].includes(c.status)).length,
                    'Status': d.status
                };
            });
            const demandSheet = XLSX.utils.json_to_sheet(demandSummaryData);
            XLSX.utils.book_append_sheet(workbook, demandSheet, 'Demand Analysis');

            // 4. Hiring Pipeline
            const pipelineData = [
                { Stage: 'Applied', Count: candidates.length },
                { Stage: 'Screening', Count: candidates.filter(c => c.status === 'screening').length },
                { Stage: 'Interviewing', Count: candidates.filter(c => c.status === 'interview_scheduled').length },
                { Stage: 'Selected/Offered', Count: candidates.filter(c => ['selected', 'offer_rolled', 'offer_accepted'].includes(c.status)).length },
                { Stage: 'Joined', Count: candidates.filter(c => c.status === 'onboarded').length },
            ];
            const pipelineSheet = XLSX.utils.json_to_sheet(pipelineData);
            XLSX.utils.book_append_sheet(workbook, pipelineSheet, 'Hiring Pipeline');
        }

        XLSX.writeFile(workbook, `Recruitment_All_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Download Reports</DialogTitle>
                    <DialogDescription>
                        Select the reports you want to include in the Excel file.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-2 pb-2 border-b">
                        <Checkbox
                            id="select-all"
                            checked={isAllSelected}
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                        <Label
                            htmlFor="select-all"
                            className="text-sm font-bold leading-none cursor-pointer"
                        >
                            Select All
                        </Label>
                    </div>
                    {reportOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={option.id}
                                checked={selectedReports[option.id as keyof typeof selectedReports]}
                                onCheckedChange={() => handleToggle(option.id)}
                            />
                            <Label
                                htmlFor={option.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={downloadExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
