import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockCandidates, mockDemands } from '@/data/mockData';
import { Candidate } from '@/types/recruitment';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

// Components
import { CandidateFilters, FilterState } from '@/components/candidates/CandidateFilters';
import { CandidateTable } from '@/components/candidates/CandidateTable';

// Dialogs
import { CandidateProfileDialog } from '@/components/dialogs/CandidateProfileDialog';
import { ResumeDialog } from '@/components/dialogs/ResumeDialog';
import { ScheduleInterviewDialog } from '@/components/dialogs/ScheduleInterviewDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { InitialScreeningDialog } from '@/components/dialogs/InitialScreeningDialog';
import { RejectionEmailDialog } from '@/components/dialogs/RejectionEmailDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useRecruitment } from '@/context/RecruitmentContext';

const Candidates = () => {
  const { candidates, addCandidate, updateCandidateStatus, saveScreeningFeedback, updateInterviewStatus } = useRecruitment();
  const navigate = useNavigate();
  const location = useLocation();
  // const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialDemandId = queryParams.get('demandId') || '';
  const initialStatus = queryParams.get('status') || 'all';

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: initialStatus as FilterState['status'],
    position: initialDemandId ? 'All Positions' : 'All Positions',
    location: 'All Location',
    experience: 'Any Experience',
    noticePeriod: 'Any Notice Period',
    feedbackFilter: 'all',
  });

  // Apply initial filters from URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const demandId = params.get('demandId');
    const status = params.get('status');

    if (demandId || status) {
      setFilters(prev => ({
        ...prev,
        status: (status || 'all') as any,
      }));
    }
  }, [location.search]);

  // Dialog States
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isMoveForwardOpen, setIsMoveForwardOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isScreeningOpen, setIsScreeningOpen] = useState(false);

  // Add Candidate State
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandidateData, setNewCandidateData] = useState({
    name: '',
    email: '',
    phone: '',
    demandId: '',
    experience: '',
    currentCompany: '',
    currentRole: '',
    skills: '',
    source: 'career_portal' as const,
    location: '',
    locationPreference: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    isServingNotice: false,
    isImmediateJoiner: false,
    linkedInProfile: '',
    hasOtherOffers: false,
    otherOfferCTC: '',
    certifications: '',
    referredBy: '',
  });

  const getDemandTitle = (demandId: string) => {
    return mockDemands.find((d) => d.id === demandId)?.title || 'Unknown';
  };

  // Helper helpers for filtering
  const parseExperience = (exp: string): number => {
    const match = exp.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const parseNoticePeriod = (np: string): number => {
    if (!np) return 0;
    if (np.toLowerCase().includes('immediate')) return 0;
    const match = np.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  // Filter Logic
  const filteredCandidates = useMemo(() => {
    // Get query parameters for additional filtering
    const params = new URLSearchParams(location.search);
    const demandId = params.get('demandId');
    const statusParam = params.get('status');
    const currentRoundParam = params.get('currentRound');

    return candidates.filter(candidate => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          candidate.name.toLowerCase().includes(search) ||
          candidate.email.toLowerCase().includes(search) ||
          (candidate.skills || []).some(s => s.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      // Status filter - handle both single and multiple statuses
      const statusFilter = statusParam || filters.status;
      if (statusFilter !== 'all') {
        const statuses = statusFilter.split(',');
        const isRejectedRequested = statuses.includes('rejected');

        const isCandidateRejected = statuses.includes(candidate.status) ||
          (isRejectedRequested && (candidate.round1Recommendation === 'reject' || candidate.round2Recommendation === 'reject'));

        if (!isCandidateRejected) {
          return false;
        }
      } else {
        // By default (All), hide rejected candidates
        if (candidate.status === 'rejected' || candidate.status === 'offer_rejected' ||
          candidate.round1Recommendation === 'reject' || candidate.round2Recommendation === 'reject') {
          return false;
        }
      }

      // Current Round filter from URL
      if (currentRoundParam) {
        if (currentRoundParam === 'undefined') {
          // For screening rejection, check if currentRound is undefined or null
          if (candidate.currentRound !== undefined && candidate.currentRound !== null) {
            return false;
          }
        } else {
          // For specific rounds, check exact match or specific recommendation
          const round = parseInt(currentRoundParam, 10);
          const isRoundMatch = candidate.currentRound === round ||
            (round === 1 && candidate.round1Recommendation === 'reject') ||
            (round === 2 && candidate.round2Recommendation === 'reject');

          if (!isRoundMatch) {
            return false;
          }
        }
      }

      // Demand ID filter from URL
      if (demandId && candidate.demandId !== demandId) {
        return false;
      }

      // Position Filter
      if (filters.position !== 'All Positions') {
        const positionTitle = getDemandTitle(candidate.demandId);
        // Handle "Internship" / "Fresher" if they are specific titles, otherwise general matching
        // User list included "Internship", "Fresher". Assuming these might be part of title or special handling.
        // For now, doing exact title match logic.
        if (positionTitle !== filters.position) {
          // Fallback: If filter is "Internship" or "Fresher", check if title includes it
          if ((filters.position === 'Internship' || filters.position === 'Fresher') && positionTitle.includes(filters.position)) {
            // match
          } else {
            return false;
          }
        }
      }

      // Location Filter
      if (filters.location !== 'All Location') {
        const candLocation = candidate.location || '';
        if (filters.location === 'Others') {
          if (['Bangalore', 'Chennai', 'Coimbatore'].some(city => candLocation.includes(city))) {
            return false;
          }
        } else if (!candLocation.includes(filters.location)) {
          return false;
        }
      }

      // Experience Filter
      if (filters.experience !== 'Any Experience') {
        const expYears = parseExperience(candidate.experience);
        const [min, maxPart] = filters.experience.split('-');

        if (filters.experience === '10+ Years') {
          if (expYears < 10) return false;
        } else if (filters.experience === '0-1 Year') {
          if (expYears > 1) return false;
        } else if (maxPart) {
          const minYear = parseInt(min);
          const maxYear = parseInt(maxPart); // "3 Years" -> 3
          if (expYears < minYear || expYears > maxYear) return false;
        }
      }

      // Notice Period Filter
      if (filters.noticePeriod !== 'Any Notice Period') {
        if (filters.noticePeriod === 'Immediate') {
          if (!candidate.isImmediateJoiner && !candidate.noticePeriod?.toLowerCase().includes('immediate')) {
            return false;
          }
        } else {
          const filterDays = parseNoticePeriod(filters.noticePeriod);
          const candDays = parseNoticePeriod(candidate.noticePeriod || '');
          // Use a tolerance or exact match? Likely approximate bucket or exact match if data is clean.
          // Given the strict options "15 Days", "30 Days", assuming strict buckets.
          // But data might be "30 days" or "1 month".
          // Let's use exact match logic on difference < 5 days tolerance? 
          // Or better, check if candidate ranges around the filter.
          // Simple approach: exact number match
          if (candDays !== filterDays) return false;
        }
      }

      // Feedback Filter
      if (filters.feedbackFilter !== 'all') {
        switch (filters.feedbackFilter) {
          case 'has_screening':
            if (!candidate.screeningFeedback) return false;
            break;
          case 'has_round1':
            if (!candidate.round1Recommendation) return false;
            break;
          case 'has_round2':
            if (!candidate.round2Recommendation) return false;
            break;
          case 'no_screening':
            if (candidate.screeningFeedback) return false;
            break;
          case 'no_round1':
            if (candidate.round1Recommendation) return false;
            break;
          case 'no_round2':
            if (candidate.round2Recommendation) return false;
            break;
        }
      }

      return true;
    });
  }, [candidates, filters, location.search]);

  // Actions
  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsProfileOpen(true);
  };

  const handleViewResume = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsResumeOpen(true);
  };

  const handleScheduleInterview = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsScheduleOpen(true);
  };

  const handleMoveForward = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsMoveForwardOpen(true);
  };

  const handleReject = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsRejectOpen(true);
  };

  const handleInitialScreening = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsScreeningOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Position', 'Status', 'Applied Date', 'Round', 'Source'],
      ...filteredCandidates.map(c => [
        c.name,
        c.email,
        c.phone,
        getDemandTitle(c.demandId),
        c.status,
        format(new Date(c.appliedAt), 'yyyy-MM-dd'),
        c.currentRound || 'N/A',
        c.source || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Candidates exported successfully!');
  };

  const handleAddCandidate = () => {
    if (!newCandidateData.name || !newCandidateData.email || !newCandidateData.demandId) {
      toast.error('Please fill in required fields');
      return;
    }

    const newCandidate: Candidate = {
      id: String(candidates.length + 1),
      name: newCandidateData.name,
      email: newCandidateData.email,
      phone: newCandidateData.phone,
      demandId: newCandidateData.demandId,
      status: 'applied',
      appliedAt: new Date(),
      skills: newCandidateData.skills ? newCandidateData.skills.split(',').map(s => s.trim()) : [],
      source: newCandidateData.source,
      experience: newCandidateData.experience || '0 years',
      currentCompany: newCandidateData.currentCompany || '',
      currentRole: newCandidateData.currentRole || '',
      location: newCandidateData.location || '',
      locationPreference: newCandidateData.locationPreference || '',
      currentCTC: newCandidateData.currentCTC || '',
      expectedCTC: newCandidateData.expectedCTC || '',
      noticePeriod: newCandidateData.noticePeriod || '',
      isServingNotice: newCandidateData.isServingNotice,
      isImmediateJoiner: newCandidateData.isImmediateJoiner,
      linkedInProfile: newCandidateData.linkedInProfile || '',
      hasOtherOffers: newCandidateData.hasOtherOffers,
      otherOfferCTC: newCandidateData.otherOfferCTC || '',
      certifications: newCandidateData.certifications ? newCandidateData.certifications.split(',').map(s => s.trim()) : [],
      referredBy: newCandidateData.referredBy || '',
    };

    addCandidate(newCandidate);
    setIsAddCandidateOpen(false);
    setNewCandidateData({
      name: '',
      email: '',
      phone: '',
      demandId: '',
      experience: '',
      currentCompany: '',
      currentRole: '',
      skills: '',
      source: 'career_portal' as const,
      location: '',
      locationPreference: '',
      currentCTC: '',
      expectedCTC: '',
      noticePeriod: '',
      isServingNotice: false,
      isImmediateJoiner: false,
      linkedInProfile: '',
      hasOtherOffers: false,
      otherOfferCTC: '',
      certifications: '',
      referredBy: '',
    });
    toast.success('Candidate added successfully');
  };

  // Dialog Handlers (reused)
  const confirmMoveForward = () => {
    if (!selectedCandidate) return;

    // Auto-update status when moving forward from 'applied'
    if (selectedCandidate.status === 'applied') {
      updateCandidateStatus(selectedCandidate.id, 'screening');
    }

    toast.success(`Moved ${selectedCandidate.name} forward`);
    setIsMoveForwardOpen(false);
  };

  const confirmReject = () => {
    if (!selectedCandidate) return;
    updateCandidateStatus(selectedCandidate.id, 'rejected');
  };

  const handleStatusUpdate = (id: string, status: Candidate['status']) => {
    if (status === 'rejected') {
      const candidate = candidates.find(c => c.id === id);
      if (candidate) {
        setSelectedCandidate(candidate);
        setIsRejectOpen(true);
        return;
      }
    }
    updateCandidateStatus(id, status);
  };

  return (
    <DashboardLayout title="Candidates">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Candidate Pipeline</h2>
            <p className="text-muted-foreground">{filteredCandidates.length} candidates found</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsAddCandidateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        <div className="flex flex-col gap-2">
          <CandidateFilters onFilterChange={setFilters} />
        </div>

        {/* Table */}
        <CandidateTable
          candidates={filteredCandidates}
          onViewCandidate={handleViewCandidate}
          onViewResume={handleViewResume}
          onScheduleInterview={handleScheduleInterview}
          onMoveForward={handleMoveForward}
          onReject={handleReject}
          onInitialScreening={handleInitialScreening}
          onStatusChange={handleStatusUpdate}
          onInterviewStatusChange={updateInterviewStatus}
        />

        {/* Dialogs */}
        <CandidateProfileDialog
          candidate={selectedCandidate}
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          onViewResume={handleViewResume}
          onMoveForward={handleMoveForward}
          onReject={handleReject}
        />

        <ResumeDialog
          candidate={selectedCandidate}
          open={isResumeOpen}
          onOpenChange={setIsResumeOpen}
        />

        <ScheduleInterviewDialog
          candidate={selectedCandidate}
          open={isScheduleOpen}
          onOpenChange={setIsScheduleOpen}
        />

        <ConfirmDialog
          open={isMoveForwardOpen}
          onOpenChange={setIsMoveForwardOpen}
          title="Move Candidate Forward"
          description={`Are you sure you want to move ${selectedCandidate?.name} to the next stage?`}
          confirmLabel="Move Forward"
          onConfirm={confirmMoveForward}
        />

        <RejectionEmailDialog
          candidate={selectedCandidate}
          open={isRejectOpen}
          onOpenChange={setIsRejectOpen}
          onConfirm={confirmReject}
        />

        <InitialScreeningDialog
          candidate={selectedCandidate}
          open={isScreeningOpen}
          onOpenChange={setIsScreeningOpen}
          onSave={saveScreeningFeedback}
        />

        {/* Add Candidate Dialog */}
        <Dialog open={isAddCandidateOpen} onOpenChange={setIsAddCandidateOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={newCandidateData.name}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newCandidateData.email}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newCandidateData.phone}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interest Position *</Label>
                  <Select
                    value={newCandidateData.demandId}
                    onValueChange={(val) => setNewCandidateData({ ...newCandidateData, demandId: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sre">Site Reliability Engineer</SelectItem>
                      <SelectItem value="senior-sre">Senior Site Reliability Engineer</SelectItem>
                      <SelectItem value="lead-sre">Lead Site Reliability Engineer</SelectItem>
                      <SelectItem value="app-sre">Application Site Reliability Engineer</SelectItem>
                      <SelectItem value="soc-engineer">Security Operations Centre Engineer</SelectItem>
                      <SelectItem value="performance-engineer">Performance Engineer</SelectItem>
                      <SelectItem value="qa-automation">QA Automation Engineer (Playwright & Selenium)</SelectItem>
                      <SelectItem value="devops">DevOps Engineer</SelectItem>
                      <SelectItem value="lead-sap">Lead SAP Engineer</SelectItem>
                      <SelectItem value="ai-ml">AI/ML Engineer</SelectItem>
                      <SelectItem value="ai-ml-intern">AI/ML Intern</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="fresher">Fresher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Current Role & Company */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <Input
                    value={newCandidateData.currentRole}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, currentRole: e.target.value })}
                    placeholder="e.g. Senior Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Company</Label>
                  <Input
                    value={newCandidateData.currentCompany}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, currentCompany: e.target.value })}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>

              {/* Experience & Skills */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <Input
                    value={newCandidateData.experience}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, experience: e.target.value })}
                    placeholder="e.g. 5 years"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={newCandidateData.skills}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, AWS"
                  />
                </div>
              </div>

              {/* LinkedIn Profile */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn Profile</Label>
                  <Input
                    value={newCandidateData.linkedInProfile}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, linkedInProfile: e.target.value })}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Location</Label>
                  <Input
                    value={newCandidateData.location}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, location: e.target.value })}
                    placeholder="e.g. Bangalore"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location Preference</Label>
                  <Input
                    value={newCandidateData.locationPreference}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, locationPreference: e.target.value })}
                    placeholder="e.g. Bangalore, Chennai"
                  />
                </div>
              </div>

              {/* CTC */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current CTC</Label>
                  <Input
                    value={newCandidateData.currentCTC}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, currentCTC: e.target.value })}
                    placeholder="e.g. 12 LPA"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected CTC</Label>
                  <Input
                    value={newCandidateData.expectedCTC}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, expectedCTC: e.target.value })}
                    placeholder="e.g. 15 LPA"
                  />
                </div>
              </div>
              {/* Notice Period */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Notice Period</Label>
                  <Input
                    value={newCandidateData.noticePeriod}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, noticePeriod: e.target.value })}
                    placeholder="e.g. 30 days"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Certifications (comma-separated)</Label>
                  <Input
                    value={newCandidateData.certifications}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, certifications: e.target.value })}
                    placeholder="e.g. AWS Certified, Azure"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isServingNotice"
                    checked={newCandidateData.isServingNotice}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, isServingNotice: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isServingNotice">Serving Notice</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isImmediateJoiner"
                    checked={newCandidateData.isImmediateJoiner}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, isImmediateJoiner: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isImmediateJoiner">Immediate Joiner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasOtherOffers"
                    checked={newCandidateData.hasOtherOffers}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, hasOtherOffers: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="hasOtherOffers">Has Other Offers</Label>
                </div>
              </div>

              {/* Other Offer CTC & Referred By */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Other Offer CTC</Label>
                  <Input
                    value={newCandidateData.otherOfferCTC}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, otherOfferCTC: e.target.value })}
                    placeholder="e.g. 14 LPA"
                    disabled={!newCandidateData.hasOtherOffers}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referred By</Label>
                  <Input
                    value={newCandidateData.referredBy}
                    onChange={(e) => setNewCandidateData({ ...newCandidateData, referredBy: e.target.value })}
                    placeholder="e.g. John Smith"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCandidateOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCandidate}>Add Candidate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Candidates;
