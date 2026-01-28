'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRecruitment } from '@/context/RecruitmentContext';
import { Candidate, OnboardingTask } from '@/types/recruitment';
import { useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  UserCheck,
  Calendar,
  Building2,
  Mail,
  FileText,
  Laptop,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { StatsCard } from '@/components/dashboard/StatsCard';

const defaultTasks: { id: string; name: string; description: string; icon: string }[] = [
  { id: '1', name: 'Document Verification', description: 'Verify all required documents', icon: 'FileText' },
  { id: '2', name: 'System Access Setup', description: 'Create email and system accounts', icon: 'Mail' },
  { id: '3', name: 'Asset Allocation', description: 'Assign laptop and equipment', icon: 'Laptop' },
  { id: '4', name: 'Bank Details', description: 'Collect bank account information', icon: 'CreditCard' },
  { id: '5', name: 'Team Introduction', description: 'Schedule meet with team', icon: 'Users' },
  { id: '6', name: 'Training Schedule', description: 'Plan initial training sessions', icon: 'Calendar' },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-blue-500/20 text-blue-600' },
  in_progress: { label: 'In Progress', color: 'bg-warning/20 text-warning' },
  completed: { label: 'Completed', color: 'bg-success/20 text-success' },
};

const iconMap: Record<string, React.ElementType> = {
  FileText, Mail, Laptop, CreditCard, Users, Calendar
};

const Onboarding = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { candidates: allCandidates, updateCandidateOnboardingTask, updateCandidateOfferDetails } = useRecruitment();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Candidate> | null>(null);

  // Filter and map candidates from recruitment context
  const onboardingCandidates = allCandidates
    .filter(c => c.status === 'onboarding' || c.status === 'onboarded')
    .map(c => ({
      ...c,
      onboardingTasks: (c.onboardingTasks || defaultTasks.map(t => ({ ...t, completed: false }))) as OnboardingTask[],
      onboardingStatus: (c.onboardingStatus || 'pending') as 'pending' | 'in_progress' | 'completed'
    }));

  const selectedCandidate = onboardingCandidates.find(c => c.id === selectedCandidateId) || null;

  const filteredCandidates = onboardingCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.offeredPosition || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.onboardingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: onboardingCandidates.length,
    pending: onboardingCandidates.filter(c => c.onboardingStatus === 'pending').length,
    inProgress: onboardingCandidates.filter(c => c.onboardingStatus === 'in_progress').length,
    completed: onboardingCandidates.filter(c => c.onboardingStatus === 'completed').length,
  };

  const getProgress = (tasks: OnboardingTask[]) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const updateTaskStatus = async (candidateId: string, taskId: string, completed: boolean) => {
    await updateCandidateOnboardingTask(candidateId, taskId, completed);
  };

  const handleSendWelcomeEmail = (candidate: any) => {
    toast.success(`Welcome email sent to ${candidate.email}`);
  };

  const handleCompleteOnboarding = async (candidateId: string) => {
    // Complete all tasks
    const candidate = onboardingCandidates.find(c => c.id === candidateId);
    if (candidate) {
      for (const task of candidate.onboardingTasks) {
        if (!task.completed) {
          await updateCandidateOnboardingTask(candidateId, task.id, true);
        }
      }
    }

    // Update status to onboarded if not already
    updateCandidateOfferDetails(candidateId, { status: 'onboarded' });

    setIsDetailsOpen(false);
    toast.success('Onboarding completed successfully!');
  };

  const handleUpdateCandidate = async () => {
    if (!editFormData || !selectedCandidateId) return;
    await updateCandidateOfferDetails(selectedCandidateId, editFormData);
    setIsEditOpen(false);
    toast.success('Candidate details updated successfully!');
  };

  return (
    <DashboardLayout title="Onboarding">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Onboarding Management</h2>
            <p className="text-muted-foreground mt-1">Track and manage new hire onboarding</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Onboarding"
            value={stats.total}
            icon={<UserCheck className="h-5 w-5" />}
            variant="primary"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="h-5 w-5" />}
            variant="warning"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Users className="h-5 w-5" />}
            variant="accent"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="success"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'in_progress', 'completed'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((candidate) => {
            const progress = getProgress(candidate.onboardingTasks);
            return (
              <Card
                key={candidate.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedCandidateId(candidate.id);
                  setIsDetailsOpen(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-lg">
                          {candidate.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base">{candidate.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{candidate.offeredPosition || 'Position'}</p>
                      </div>
                    </div>
                    <Badge className={statusConfig[candidate.onboardingStatus].color}>
                      {statusConfig[candidate.onboardingStatus].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joining: {candidate.dateOfJoining ? format(new Date(candidate.dateOfJoining), 'dd MMM yyyy') : 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{candidate.department || 'Not Assigned'}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{getProgress(candidate.onboardingTasks)}%</span>
                    </div>
                    <Progress value={getProgress(candidate.onboardingTasks)} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendWelcomeEmail(candidate);
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Onboarding Details</DialogTitle>
                  <DialogDescription>
                    Manage onboarding tasks for {selectedCandidate?.name}
                  </DialogDescription>
                </div>
                {selectedCandidate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      setEditFormData(selectedCandidate);
                      setIsEditOpen(true);
                    }}
                  >
                    Edit Details
                  </Button>
                )}
              </div>
            </DialogHeader>
            {selectedCandidate && (
              <div className="space-y-6">
                {/* Candidate Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-muted-foreground">Position</Label>
                    <p className="font-medium">{selectedCandidate.offeredPosition || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="font-medium">{selectedCandidate.department || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Joining Date</Label>
                    <p className="font-medium">{selectedCandidate.dateOfJoining ? format(new Date(selectedCandidate.dateOfJoining), 'dd MMM yyyy') : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Reporting Manager</Label>
                    <p className="font-medium">{selectedCandidate.reportingManager || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Experience</Label>
                    <p className="font-medium">{selectedCandidate.experience || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Previous Organization</Label>
                    <p className="font-medium">{selectedCandidate.currentCompany || '-'}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-muted-foreground">{getProgress(selectedCandidate.onboardingTasks)}%</span>
                  </div>
                  <Progress value={getProgress(selectedCandidate.onboardingTasks)} className="h-3" />
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  <h4 className="font-medium">Onboarding Checklist</h4>
                  {selectedCandidate.onboardingTasks.map((task: OnboardingTask) => {
                    const TaskIcon = (task.icon && iconMap[task.icon]) || FileText;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) =>
                            updateTaskStatus(selectedCandidate.id, task.id, checked as boolean)
                          }
                        />
                        <div className={`p-2 rounded-lg ${task.completed ? 'bg-success/10' : 'bg-muted'}`}>
                          <TaskIcon className={`h-4 w-4 ${task.completed ? 'text-success' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        {task.completed && (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              {selectedCandidate && selectedCandidate.onboardingStatus !== 'completed' && (
                <Button
                  onClick={() => handleCompleteOnboarding(selectedCandidate.id)}
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Onboarding
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Onboarding Details</DialogTitle>
              <DialogDescription>
                Update candidate information for {editFormData?.name}
              </DialogDescription>
            </DialogHeader>
            {editFormData && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={editFormData.offeredPosition || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, offeredPosition: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={editFormData.department || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Joining Date</Label>
                    <Input
                      type="date"
                      value={editFormData.dateOfJoining ? format(new Date(editFormData.dateOfJoining), 'yyyy-MM-dd') : ''}
                      onChange={(e) => setEditFormData({ ...editFormData, dateOfJoining: new Date(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting Manager</Label>
                    <Input
                      value={editFormData.reportingManager || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, reportingManager: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Input
                      value={editFormData.experience || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Previous Organization</Label>
                    <Input
                      value={editFormData.currentCompany || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, currentCompany: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCandidate}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Onboarding;
