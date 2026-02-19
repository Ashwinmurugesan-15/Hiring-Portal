import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  FileCheck,
  Send,
  Check,
  X,
  Clock,
  Download,
  Eye,
  IndianRupee,
  Calendar,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useRecruitment } from '@/context/RecruitmentContext';
import { Candidate } from '@/types/recruitment';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Offer {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  demandTitle: string;
  position: string;
  location: string;
  offeredCTC: string;
  expectedCTC: string;
  joiningDate: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'negotiating' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  notes?: string;
  experience?: string;
  currentCompany?: string;
}

const initialOffers: Offer[] = [
  {
    id: '1',
    candidateId: '3',
    candidateName: 'Ananya Patel',
    candidateEmail: 'ananya.patel@email.com',
    demandTitle: 'Senior DevOps Engineer',
    position: 'DevOps Engineer',
    location: 'Bangalore',
    offeredCTC: '30 LPA',
    expectedCTC: '28 LPA',
    joiningDate: new Date('2026-02-15'),
    status: 'accepted',
    createdAt: new Date('2026-01-10'),
    expiresAt: new Date('2026-01-25'),
  },
  {
    id: '2',
    candidateId: '4',
    candidateName: 'Vikram Singh',
    candidateEmail: 'vikram.singh@email.com',
    demandTitle: 'Senior SRE',
    position: 'Site Reliability Engineer',
    location: 'Remote',
    offeredCTC: '38 LPA',
    expectedCTC: '35 LPA',
    joiningDate: new Date('2026-02-01'),
    status: 'sent',
    createdAt: new Date('2026-01-15'),
    expiresAt: new Date('2026-01-30'),
  },
  {
    id: '3',
    candidateId: '6',
    candidateName: 'Arjun Reddy',
    candidateEmail: 'arjun.reddy@email.com',
    demandTitle: 'Full Stack Developer',
    position: 'Software Engineer',
    location: 'Hyderabad',
    offeredCTC: '22 LPA',
    expectedCTC: '20 LPA',
    joiningDate: new Date('2026-01-20'),
    status: 'accepted',
    createdAt: new Date('2025-12-28'),
    expiresAt: new Date('2026-01-12'),
  },
  {
    id: '4',
    candidateId: '7',
    candidateName: 'Meera Krishnan',
    candidateEmail: 'meera.k@email.com',
    demandTitle: 'Data Engineer',
    position: 'Data Engineer',
    location: 'Mumbai',
    offeredCTC: '25 LPA',
    expectedCTC: '24 LPA',
    joiningDate: new Date('2026-02-10'),
    status: 'negotiating',
    createdAt: new Date('2026-01-12'),
    expiresAt: new Date('2026-01-27'),
    notes: 'Candidate requested additional stock options',
  },
  {
    id: '5',
    candidateId: '8',
    candidateName: 'Suresh Kumar',
    candidateEmail: 'suresh.k@email.com',
    demandTitle: 'Full Stack Developer',
    position: 'Software Engineer',
    location: 'Hyderabad',
    offeredCTC: '16 LPA',
    expectedCTC: '18 LPA',
    joiningDate: new Date('2026-02-05'),
    status: 'rejected',
    createdAt: new Date('2026-01-08'),
    expiresAt: new Date('2026-01-23'),
    notes: 'Candidate accepted another offer',
  },
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Send },
  accepted: { label: 'Accepted', color: 'bg-success/20 text-success', icon: Check },
  rejected: { label: 'Rejected', color: 'bg-destructive/20 text-destructive', icon: X },
  negotiating: { label: 'Negotiating', color: 'bg-warning/20 text-warning', icon: Clock },
  expired: { label: 'Expired', color: 'bg-muted text-muted-foreground', icon: Clock },
};

const Offers = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { candidates, updateCandidateOfferDetails } = useRecruitment();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Derive offers from candidates who have an offer_rolled status or have an offeredCTC
  const offers: Offer[] = candidates
    .filter(c =>
      c.status === 'offer_rolled' ||
      c.status === 'offer_accepted' ||
      c.status === 'offer_rejected' ||
      c.status === 'selected' ||
      c.status === 'onboarding' ||
      c.status === 'onboarded' ||
      c.offeredCTC ||
      c.offeredPosition
    )
    .map(c => ({
      id: c.id,
      candidateId: c.id,
      candidateName: c.name,
      candidateEmail: c.email,
      demandTitle: 'Position Title', // Should ideally come from demands context, but keeping it simple for now as per current Offers.tsx logic
      position: c.offeredPosition || c.currentRole || 'Job Role',
      location: c.location || 'Remote',
      offeredCTC: c.offeredCTC || '0 LPA',
      expectedCTC: c.expectedCTC || '0 LPA',
      joiningDate: c.dateOfJoining || new Date(),
      status: (
        c.status === 'offer_accepted' || c.status === 'selected' || c.status === 'onboarding' || c.status === 'onboarded' ? 'accepted' :
          c.status === 'offer_rejected' ? 'rejected' :
            c.status === 'offer_rolled' ? 'sent' : 'draft'
      ) as Offer['status'],
      createdAt: c.appliedAt || new Date(),
      expiresAt: new Date(), // Mocked
      notes: '',
      experience: c.experience || '',
      currentCompany: c.currentCompany || ''
    }));

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: offers.length,
    sent: offers.filter(o => o.status === 'sent').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
    negotiating: offers.filter(o => o.status === 'negotiating').length,
  };

  const handleUpdateStatus = (candidateId: string, status: Offer['status']) => {
    const candidateStatus = status === 'accepted' ? 'offer_accepted' :
      status === 'rejected' ? 'offer_rejected' :
        status === 'sent' ? 'offer_rolled' : 'screening';

    updateCandidateOfferDetails(candidateId, {
      status: candidateStatus as Candidate['status']
    });
    toast.success(`Offer marked as ${statusConfig[status].label}`);
  };

  const handleDownloadOffer = (offer: Offer) => {
    toast.success(`Downloading offer letter for ${offer.candidateName}`);
  };

  const handleUpdateOffer = () => {
    if (!selectedOffer) return;
    updateCandidateOfferDetails(selectedOffer.candidateId, {
      offeredCTC: selectedOffer.offeredCTC,
      offeredPosition: selectedOffer.position,
      dateOfJoining: selectedOffer.joiningDate,
      experience: selectedOffer.experience,
      currentCompany: selectedOffer.currentCompany,
      status: (selectedOffer.status === 'accepted' ? 'offer_accepted' :
        selectedOffer.status === 'rejected' ? 'offer_rejected' :
          selectedOffer.status === 'sent' ? 'offer_rolled' : 'screening') as Candidate['status']
    });
    setIsEditOpen(false);
  };

  return (
    <DashboardLayout title="Offers">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Offer Management</h2>
            <p className="text-muted-foreground mt-1">Track and manage candidate offers</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Offers"
            value={stats.total}
            icon={<FileCheck className="h-5 w-5" />}
            variant="primary"
          />
          <StatsCard
            title="Sent"
            value={stats.sent}
            icon={<Send className="h-5 w-5" />}
            variant="default"
          />
          <StatsCard
            title="Accepted"
            value={stats.accepted}
            icon={<Check className="h-5 w-5" />}
            variant="success"
          />
          <StatsCard
            title="Negotiating"
            value={stats.negotiating}
            icon={<Clock className="h-5 w-5" />}
            variant="warning"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={<X className="h-5 w-5" />}
            variant="default"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Offers Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>CTC</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.slice((currentPage - 1) * 10, currentPage * 10).map((offer) => {
                const StatusIcon = statusConfig[offer.status].icon;
                return (
                  <TableRow
                    key={offer.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedOffer(offer);
                      setIsViewOpen(true);
                    }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{offer.candidateName}</p>
                        <p className="text-sm text-muted-foreground">{offer.candidateEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{offer.position}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {offer.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium text-success">
                        <IndianRupee className="h-4 w-4" />
                        {offer.offeredCTC}
                      </div>
                      <p className="text-sm text-muted-foreground">Expected: {offer.expectedCTC}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(offer.joiningDate, 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[offer.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[offer.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setIsViewOpen(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadOffer(offer)}
                          title="Download Offer Letter"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {offer.status === 'sent' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateStatus(offer.id, 'accepted')}
                              title="Mark Accepted"
                              className="text-success hover:text-success"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateStatus(offer.id, 'rejected')}
                              title="Mark Rejected"
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, filteredOffers.length)} of {filteredOffers.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {Math.ceil(filteredOffers.length / 10) || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOffers.length / 10)))}
                disabled={currentPage >= Math.ceil(filteredOffers.length / 10)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Offer Details</DialogTitle>
              <DialogDescription>
                Complete offer information for {selectedOffer?.candidateName}
              </DialogDescription>
            </DialogHeader>
            {selectedOffer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Position</Label>
                    <p className="font-medium">{selectedOffer.position}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="font-medium">{selectedOffer.location}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Offered CTC</Label>
                    <p className="font-medium text-success">{selectedOffer.offeredCTC}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Expected CTC</Label>
                    <p className="font-medium">{selectedOffer.expectedCTC}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Joining Date</Label>
                    <p className="font-medium">{format(selectedOffer.joiningDate, 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Offer Expires</Label>
                    <p className="font-medium">{format(selectedOffer.expiresAt, 'dd MMM yyyy')}</p>
                  </div>
                </div>
                {selectedOffer.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="font-medium">{selectedOffer.notes}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Status:</Label>
                  <Badge className={statusConfig[selectedOffer.status].color}>
                    {statusConfig[selectedOffer.status].label}
                  </Badge>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewOpen(false);
                setIsEditOpen(true);
              }}>
                Edit Offer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Offer</DialogTitle>
              <DialogDescription>
                Update offer details for {selectedOffer?.candidateName}
              </DialogDescription>
            </DialogHeader>
            {selectedOffer && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Offered Position</Label>
                  <Input
                    value={selectedOffer.position}
                    onChange={(e) => setSelectedOffer({ ...selectedOffer, position: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Input
                      value={selectedOffer.experience || ''}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, experience: e.target.value })}
                      placeholder="e.g., 5 years"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Organization</Label>
                    <Input
                      value={selectedOffer.currentCompany || ''}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, currentCompany: e.target.value })}
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Offered CTC</Label>
                  <Input
                    value={selectedOffer.offeredCTC}
                    onChange={(e) => setSelectedOffer({ ...selectedOffer, offeredCTC: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Joining Date</Label>
                  <Input
                    type="date"
                    value={format(selectedOffer.joiningDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedOffer({
                      ...selectedOffer,
                      joiningDate: new Date(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={selectedOffer.status}
                    onValueChange={(value: Offer['status']) =>
                      setSelectedOffer({ ...selectedOffer, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={selectedOffer.notes || ''}
                    onChange={(e) => setSelectedOffer({ ...selectedOffer, notes: e.target.value })}
                    placeholder="Add notes about this offer..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateOffer}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Offers;
