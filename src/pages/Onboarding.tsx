import { useState } from 'react';
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

interface OnboardingTask {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  icon: React.ElementType;
}

interface OnboardingCandidate {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  joiningDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  tasks: OnboardingTask[];
  manager: string;
  experience?: string;
  currentCompany?: string;
}

const defaultTasks: Omit<OnboardingTask, 'completed'>[] = [
  { id: '1', name: 'Document Verification', description: 'Verify all required documents', icon: FileText },
  { id: '2', name: 'System Access Setup', description: 'Create email and system accounts', icon: Mail },
  { id: '3', name: 'Asset Allocation', description: 'Assign laptop and equipment', icon: Laptop },
  { id: '4', name: 'Bank Details', description: 'Collect bank account information', icon: CreditCard },
  { id: '5', name: 'Team Introduction', description: 'Schedule meet with team', icon: Users },
  { id: '6', name: 'Training Schedule', description: 'Plan initial training sessions', icon: Calendar },
];

const initialCandidates: OnboardingCandidate[] = [
  {
    id: '1',
    name: 'Ananya Patel',
    email: 'ananya.patel@company.com',
    position: 'DevOps Engineer',
    department: 'Engineering',
    joiningDate: new Date('2026-02-15'),
    status: 'pending',
    manager: 'Mike Manager',
    experience: '8 years',
    currentCompany: 'Cloud Systems',
    tasks: defaultTasks.map(t => ({ ...t, completed: false })),
  },
  {
    id: '2',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@company.com',
    position: 'Software Engineer',
    department: 'Engineering',
    joiningDate: new Date('2026-01-20'),
    status: 'in_progress',
    manager: 'Mike Manager',
    experience: '5 years',
    currentCompany: 'Tech Solutions',
    tasks: defaultTasks.map((t, idx) => ({ ...t, completed: idx < 3 })),
  },
  {
    id: '3',
    name: 'Vikram Singh',
    email: 'vikram.singh@company.com',
    position: 'Site Reliability Engineer',
    department: 'Engineering',
    joiningDate: new Date('2026-02-01'),
    status: 'pending',
    manager: 'Mike Manager',
    experience: '10 years',
    currentCompany: 'InfraCore Inc',
    tasks: defaultTasks.map(t => ({ ...t, completed: false })),
  },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-warning/20 text-warning' },
  completed: { label: 'Completed', color: 'bg-success/20 text-success' },
};

const Onboarding = () => {
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>(initialCandidates);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<OnboardingCandidate | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState<OnboardingCandidate | null>(null);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    inProgress: candidates.filter(c => c.status === 'in_progress').length,
    completed: candidates.filter(c => c.status === 'completed').length,
  };

  const getProgress = (tasks: OnboardingTask[]) => {
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const updateTaskStatus = (candidateId: string, taskId: string, completed: boolean) => {
    setCandidates(candidates.map(candidate => {
      if (candidate.id !== candidateId) return candidate;

      const updatedTasks = candidate.tasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      );

      const completedCount = updatedTasks.filter(t => t.completed).length;
      let status: OnboardingCandidate['status'] = 'pending';
      if (completedCount === updatedTasks.length) {
        status = 'completed';
      } else if (completedCount > 0) {
        status = 'in_progress';
      }

      return { ...candidate, tasks: updatedTasks, status };
    }));

    if (selectedCandidate?.id === candidateId) {
      const updatedCandidate = candidates.find(c => c.id === candidateId);
      if (updatedCandidate) {
        const updatedTasks = updatedCandidate.tasks.map(task =>
          task.id === taskId ? { ...task, completed } : task
        );
        setSelectedCandidate({ ...updatedCandidate, tasks: updatedTasks });
      }
    }
  };

  const handleSendWelcomeEmail = (candidate: OnboardingCandidate) => {
    toast.success(`Welcome email sent to ${candidate.email}`);
  };

  const handleCompleteOnboarding = (candidateId: string) => {
    setCandidates(candidates.map(c =>
      c.id === candidateId
        ? { ...c, status: 'completed' as const, tasks: c.tasks.map(t => ({ ...t, completed: true })) }
        : c
    ));
    setIsDetailsOpen(false);
    toast.success('Onboarding completed successfully!');
  };

  const handleUpdateCandidate = () => {
    if (!editCandidate) return;
    setCandidates(candidates.map(c => c.id === editCandidate.id ? editCandidate : c));
    setSelectedCandidate(editCandidate);
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
            const progress = getProgress(candidate.tasks);
            return (
              <Card
                key={candidate.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedCandidate(candidate);
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
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      </div>
                    </div>
                    <Badge className={statusConfig[candidate.status].color}>
                      {statusConfig[candidate.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joining: {format(candidate.joiningDate, 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{candidate.department}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
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
                      setEditCandidate(selectedCandidate);
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
                    <p className="font-medium">{selectedCandidate.position}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="font-medium">{selectedCandidate.department}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Joining Date</Label>
                    <p className="font-medium">{format(selectedCandidate.joiningDate, 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Reporting Manager</Label>
                    <p className="font-medium">{selectedCandidate.manager}</p>
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
                    <span className="text-muted-foreground">{getProgress(selectedCandidate.tasks)}%</span>
                  </div>
                  <Progress value={getProgress(selectedCandidate.tasks)} className="h-3" />
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  <h4 className="font-medium">Onboarding Checklist</h4>
                  {selectedCandidate.tasks.map((task) => {
                    const TaskIcon = task.icon;
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
              {selectedCandidate && selectedCandidate.status !== 'completed' && (
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
                Update candidate information for {editCandidate?.name}
              </DialogDescription>
            </DialogHeader>
            {editCandidate && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={editCandidate.position}
                      onChange={(e) => setEditCandidate({ ...editCandidate, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={editCandidate.department}
                      onChange={(e) => setEditCandidate({ ...editCandidate, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Joining Date</Label>
                    <Input
                      type="date"
                      value={format(editCandidate.joiningDate, 'yyyy-MM-dd')}
                      onChange={(e) => setEditCandidate({ ...editCandidate, joiningDate: new Date(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting Manager</Label>
                    <Input
                      value={editCandidate.manager}
                      onChange={(e) => setEditCandidate({ ...editCandidate, manager: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Input
                      value={editCandidate.experience || ''}
                      onChange={(e) => setEditCandidate({ ...editCandidate, experience: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Previous Organization</Label>
                    <Input
                      value={editCandidate.currentCompany || ''}
                      onChange={(e) => setEditCandidate({ ...editCandidate, currentCompany: e.target.value })}
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
