'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DemandCard } from '@/components/dashboard/DemandCard';
import { CandidatePipeline } from '@/components/dashboard/CandidatePipeline';
import { RecentInterviews } from '@/components/dashboard/RecentInterviews';
import { mockDemands, mockDashboardStats, mockBenchResources } from '@/data/mockData';
import { useDemands } from '@/context/DemandsContext';
import { useRecruitment } from '@/context/RecruitmentContext';
import { Demand } from '@/types/recruitment';
import {
  Briefcase,
  Users,
  Calendar,
  FileCheck,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Users2,
  FolderKanban,
  Plus,
  XCircle,
  Download,
  X,
  CheckCheck,
  User,
} from 'lucide-react';
import { ClipboardCheck } from '@/components/ui/ClipboardCheck';
import { Users as AnimatedUsers } from '@/components/ui/Users';
import { CheckCheck as AnimatedCheckCheck } from '@/components/animate-ui/icons/check-check';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CreateDemandDialog } from '@/components/dialogs/CreateDemandDialog';
import { DemandDetailsDialog } from '@/components/dialogs/DemandDetailsDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { DownloadReportsDialog } from '@/components/dialogs/DownloadReportsDialog';
import { toast } from 'sonner';
import SplitText from "@/components/ui/SplitText";
import { AnimateIcon } from '@/components/ui/AnimateIcon';

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { status } = useSession();

  // Redirect to login if unauthenticated or no internal user found after loading
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Use global demands state
  const { demands, addDemand, updateDemand, closeDemand, reopenDemand } = useDemands();
  // const [demands, setDemands] = useState(mockDemands); // Removed local state

  const { filteredCandidates: candidates, filteredInterviews: interviews } = useRecruitment();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const stats = mockDashboardStats;

  // Filter for open demands only
  const activeDemands = demands.filter(d => d.status === 'open');

  // Calculate role-specific stats - only count non-rejected for "Applied" to match table view
  const totalApplied = candidates.filter(c =>
    c.status !== 'rejected' &&
    c.round1Recommendation !== 'reject' &&
    c.round2Recommendation !== 'reject'
  ).length;
  const totalOffered = candidates.filter(c =>
    ['offer_rolled', 'offer_accepted', 'onboarding', 'onboarded'].includes(c.status)
  ).length;
  const totalRejected = candidates.filter(c =>
    c.round1Recommendation === 'reject' ||
    c.round2Recommendation === 'reject' ||
    (c.status === 'rejected' && !c.round1Recommendation && !c.round2Recommendation)
  ).length;
  const totalInterviews = interviews.length;
  const totalInterviewed = candidates.filter(c =>
    ['interview_scheduled', 'interview_completed', 'selected', 'offer_rolled', 'offer_accepted', 'onboarding', 'onboarded'].includes(c.status)
  ).length;

  // Calculate rejection percentages for admin/super admin
  const screeningRejected = candidates.filter(c =>
    c.status === 'rejected' && (!c.currentRound || c.currentRound === undefined)
  ).length;

  const screeningTotal = candidates.filter(c => {
    const isRejectedInScreening = c.status === 'rejected' && (!c.currentRound || c.currentRound === undefined);
    const hasPassedScreening = (c.currentRound !== undefined && Number(c.currentRound) >= 1) ||
      ['screening', 'interview_scheduled', 'interview_completed', 'selected', 'offer_rolled', 'offer_accepted', 'onboarding', 'onboarded'].includes(c.status);
    return isRejectedInScreening || hasPassedScreening;
  }).length;

  const screeningRejectionPercentage = screeningTotal > 0 ? Math.round((screeningRejected / screeningTotal) * 100) : 0;

  const round1Rejected = candidates.filter(c =>
    c.round1Recommendation === 'reject'
  ).length;

  const round1Total = candidates.filter(c =>
    (c.currentRound !== undefined && Number(c.currentRound) >= 1) ||
    (c.round1Recommendation !== undefined)
  ).length;

  const round1RejectionPercentage = round1Total > 0 ? Math.round((round1Rejected / round1Total) * 100) : 0;

  const round2Rejected = candidates.filter(c =>
    c.round2Recommendation === 'reject'
  ).length;

  const round2Total = candidates.filter(c =>
    (c.currentRound !== undefined && Number(c.currentRound) >= 2) ||
    (c.round2Recommendation !== undefined)
  ).length;

  const round2RejectionPercentage = round2Total > 0 ? Math.round((round2Rejected / round2Total) * 100) : 0;

  // Calculate rejected per demand
  const getRejectedForDemand = (demandId: string) => {
    return candidates.filter(c =>
      c.demandId === demandId && ['rejected', 'offer_rejected'].includes(c.status)
    ).length;
  };

  const getRoleGreeting = () => {
    switch (user?.role) {
      case 'super_admin':
        return "Here's your complete hiring overview";
      case 'admin':
        return "Manage candidates and schedule interviews";
      case 'hiring_manager':
        return "Track your demands and hiring progress";
      case 'interviewer':
        return "Your upcoming interviews at a glance";
      default:
        return "Welcome to your recruitment portal";
    }
  };

  const [greeting, setGreeting] = useState('');

  const handleCreateDemand = (newDemand: Omit<Demand, 'id' | 'createdAt' | 'applicants' | 'interviewed' | 'offers'>) => {
    addDemand(newDemand);
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);



  const handleViewDetails = (demand: Demand) => {
    setSelectedDemand(demand);
    setIsDetailsOpen(true);
  };

  const handleEditDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setIsEditOpen(true);
  };

  const handleCloseDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setIsCloseConfirmOpen(true);
  };

  const confirmCloseDemand = () => {
    if (!selectedDemand) return;
    closeDemand(selectedDemand.id);
    toast.success(`Position "${selectedDemand.title}" has been closed`);
    setIsCloseConfirmOpen(false);
  };

  const handleSaveDemand = (updatedDemand: Demand) => {
    updateDemand(updatedDemand);
  };

  // Interviewer Dashboard - Only shows interviews
  if (user?.role === 'interviewer') {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">


            <div>
              <SplitText
                text={`${greeting || 'Welcome'}, ${user?.name?.split(' ')[0]}!`}
                className="text-2xl font-bold text-foreground"
                delay={5}
                duration={0.2}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="left"
              />
              <p className="text-muted-foreground mt-1">{getRoleGreeting()}</p>
            </div>
          </div>


          {/* Stats for Interviewer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              title="Today's Interviews"
              value={interviews.filter(i =>
                format(i.scheduledAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              ).length}
              icon={<Calendar className="h-5 w-5" />}
              variant="primary"
            />
            <StatsCard
              title="This Week"
              value={stats.interviewsScheduled}
              icon={<Clock className="h-5 w-5" />}
              variant="accent"
            />
            <StatsCard
              title="Completed"
              value={interviews.filter(i => i.status === 'completed').length}
              icon={<CheckCircle2 className="h-5 w-5" />}
              variant="success"
            />
          </div>

          {/* Full Interview List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Scheduled Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviews
                  .filter(interview => interview.status === 'scheduled')
                  .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
                  .map((interview, index) => (
                    <div
                      key={interview.id || `interview-${index}`}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {interview.candidateName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{interview.candidateName}</p>
                          <p className="text-sm text-muted-foreground">{interview.demandTitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Round {interview.round}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(interview.scheduledAt, 'dd MMM yyyy, hh:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.meetLink && (
                          <Button size="sm" asChild>
                            <a href={interview.meetLink} target="_blank" rel="noopener noreferrer">
                              Join Meet
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => router.push('/interviews')}>
                          Submit Feedback
                        </Button>
                      </div>
                    </div>
                  ))}
                {interviews.filter(i => i.status === 'scheduled').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No scheduled interviews at the moment.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div >
      </DashboardLayout >
    );
  }

  // Hiring Manager Dashboard - Specific stats without pipeline/upcoming interviews
  if (user?.role === 'hiring_manager') {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <SplitText
                text={`${greeting || 'Welcome'}, ${user?.name?.split(' ')[0]}!`}
                className="text-2xl font-bold text-foreground"
                delay={5}
                duration={0.2}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="left"
              />
              <p className="text-muted-foreground mt-1">{getRoleGreeting()}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Download button removed for Hiring Manager */}
              <Button
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Demand
              </Button>
            </div>
          </div>

          {/* Stats for Hiring Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Open Positions"
              value={activeDemands.length}
              icon={<Briefcase className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
              variant="primary"
            />
            <StatsCard
              title="Applied"
              value={totalApplied}
              icon={<Users className="h-5 w-5" />}
              trend={{ value: 8, isPositive: true }}
              variant="accent"
            />
            <StatsCard
              title="Interviews"
              value={totalInterviews}
              icon={<Calendar className="h-5 w-5" />}
              variant="warning"
            />
            <StatsCard
              title="Offered"
              value={totalOffered}
              icon={<FileCheck className="h-5 w-5" />}
              trend={{ value: 5, isPositive: true }}
              variant="success"
            />
            <StatsCard
              title="Rejected"
              value={totalRejected}
              icon={
                <AnimateIcon animateOnHover>
                  <X className="h-5 w-5" />
                </AnimateIcon>
              }
              variant="default"
              animateIconOnHover
              iconContainerClassName="p-1.5 rounded-lg"
            />
          </div>

          {/* Active Demands - Full Width */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Your Active Demands</h3>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push('/demands')}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDemands.map((demand, index) => (
                <DemandCard
                  key={demand.id || `demand-${index}`}
                  demand={demand}
                  onViewDetails={() => handleViewDetails(demand)}
                  onEdit={() => handleEditDemand(demand)}
                  onClose={() => handleCloseDemand(demand)}
                  onReopen={() => reopenDemand(demand.id)}
                  onViewApplied={() => router.push(`/candidates?demandId=${demand.id}&status=applied`)}
                  onViewInterviewed={() => router.push(`/candidates?demandId=${demand.id}&status=interview_scheduled,interview_completed`)}
                  onViewOffers={() => router.push(`/candidates?demandId=${demand.id}&status=offer_rolled,offer_accepted`)}
                  showActions={true}
                />
              ))}
            </div>
          </div>

          {/* Demand Summary Table with Rejected column */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demand Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Demand</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Openings</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Applied</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Interviewed</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Offers</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Rejected</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDemands.map((demand, index) => (
                      <tr key={demand.id || `summary-demand-${index}`} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <p className="font-medium">{demand.title}</p>
                          <p className="text-sm text-muted-foreground">{demand.location}</p>
                        </td>
                        <td className="text-center py-3 px-4">{demand.openings}</td>
                        <td className="text-center py-3 px-4">{demand.applicants}</td>
                        <td className="text-center py-3 px-4">{demand.interviewed}</td>
                        <td className="text-center py-3 px-4">{demand.offers}</td>
                        <td className="text-center py-3 px-4 text-destructive font-medium">
                          {getRejectedForDemand(demand.id)}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant={demand.status === 'open' ? 'default' : 'secondary'}>
                            {demand.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Dialogs */}
          <CreateDemandDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onCreate={handleCreateDemand}
          />

          <DemandDetailsDialog
            demand={selectedDemand}
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            mode="view"
            onSave={handleSaveDemand}
            onClose={(id) => {
              const demand = demands.find(d => d.id === id);
              if (demand) handleCloseDemand(demand);
            }}
          />

          <DemandDetailsDialog
            demand={selectedDemand}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            mode="edit"
            onSave={handleSaveDemand}
          />

          <ConfirmDialog
            open={isCloseConfirmOpen}
            onOpenChange={setIsCloseConfirmOpen}
            title="Close Position"
            description={`Are you sure you want to close the position "${selectedDemand?.title}"? This will mark the demand as closed.`}
            confirmLabel="Close Position"
            variant="destructive"
            onConfirm={confirmCloseDemand}
          />

        </div>
      </DashboardLayout>
    );
  }

  // Default Dashboard for Super Admin and Admin
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <SplitText
              text={`${greeting || 'Welcome'}, ${user?.name?.split(' ')[0]}!`}
              className="text-2xl font-bold text-foreground"
              delay={50}
              duration={1.25}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="left"
            />
            <p className="text-muted-foreground mt-1">{getRoleGreeting()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDownloadOpen(true)} className="group">
              <AnimateIcon animateOnHover animation="bounce" className="mr-2">
                <Download className="h-4 w-4" />
              </AnimateIcon>
              All Reports Download
            </Button>
            {(user?.role === 'super_admin') && (
              <Button
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Demand
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Candidates Applied"
            value={totalApplied}
            icon={<Users className="h-5 w-5" />}
            variant="primary"
          />
          <StatsCard
            title="Candidates Selected"
            value={candidates.filter(c => c.status === 'selected').length}
            icon={
              <AnimateIcon animateOnHover animation="bounce">
                <ClipboardCheck className="h-5 w-5" />
              </AnimateIcon>
            }
            variant="success"
            animateIconOnHover
          />
          <StatsCard
            title="Candidates Interviewed"
            value={totalInterviewed}
            icon={<Calendar className="h-5 w-5" />}
            variant="accent"
          />
          <StatsCard
            title="Candidates Rejected"
            value={totalRejected}
            icon={
              <AnimateIcon animateOnHover>
                <X className="h-5 w-5" />
              </AnimateIcon>
            }
            variant="destructive"
            animateIconOnHover
            iconContainerClassName="p-1.5 rounded-lg"
          />
          <StatsCard
            title="Candidates Offered"
            value={candidates.filter(c => c.status === 'offer_rolled').length}
            icon={<AnimatedCheckCheck animateOnHover loop size={20} />}
            variant="warning"
            animateIconOnHover
          />
          <StatsCard
            title="Candidates Onboarded"
            value={candidates.filter(c => c.status === 'onboarded').length}
            icon={
              <AnimateIcon animateOnHover animation="bounce">
                <User className="h-5 w-5" />
              </AnimateIcon>
            }
            variant="default"
            animateIconOnHover
          />
          <StatsCard
            title="Bench Strength"
            value={mockBenchResources.length}
            icon={<AnimatedUsers animateOnHover className="h-5 w-5" />}
            variant="accent"
            animateIconOnHover
          />
          <StatsCard
            title="Allocated to Projects"
            value={mockBenchResources.filter(r => r.status === 'allocated').length}
            icon={<FolderKanban className="h-5 w-5" />}
            variant="warning"
          />
          {/* Rejection Percentage Cards for Admin/Super Admin */}
          <StatsCard
            title="Screening Rejection %"
            value={`${screeningRejectionPercentage}%`}
            icon={
              <AnimateIcon animateOnHover>
                <X className="h-5 w-5" />
              </AnimateIcon>
            }
            variant="destructive"
            onClick={() => router.push('/candidates?status=rejected&currentRound=undefined')}
            animateIconOnHover
            iconContainerClassName="p-1.5 rounded-lg"
          />
          <StatsCard
            title="Round 1 Rejection %"
            value={`${round1RejectionPercentage}%`}
            icon={
              <AnimateIcon animateOnHover>
                <X className="h-5 w-5" />
              </AnimateIcon>
            }
            variant="destructive"
            onClick={() => router.push('/candidates?status=rejected&currentRound=1')}
            animateIconOnHover
            iconContainerClassName="p-1.5 rounded-lg"
          />
          <StatsCard
            title="Round 2 Rejection %"
            value={`${round2RejectionPercentage}%`}
            icon={
              <AnimateIcon animateOnHover>
                <X className="h-5 w-5" />
              </AnimateIcon>
            }
            variant="destructive"
            onClick={() => router.push('/candidates?status=rejected&currentRound=2')}
            animateIconOnHover
            iconContainerClassName="p-1.5 rounded-lg"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Demands */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Active Demands</h3>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push('/demands')}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDemands.map((demand, index) => (
                <DemandCard
                  key={demand.id || `admin-demand-${index}`}
                  demand={demand}
                  onViewDetails={() => handleViewDetails(demand)}
                  onEdit={() => handleEditDemand(demand)}
                  onClose={() => handleCloseDemand(demand)}
                  onReopen={() => reopenDemand(demand.id)}
                  onViewApplied={() => router.push(`/candidates?demandId=${demand.id}&status=applied`)}
                  onViewInterviewed={() => router.push(`/candidates?demandId=${demand.id}&status=interview_scheduled,interview_completed`)}
                  onViewOffers={() => router.push(`/candidates?demandId=${demand.id}&status=offer_rolled,offer_accepted`)}
                  showActions={true}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Pipeline & Interviews */}
          <div className="space-y-6">
            <CandidatePipeline />
            <RecentInterviews />
          </div>
        </div>

        {/* Dialogs */}
        <CreateDemandDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onCreate={handleCreateDemand}
        />

        <DemandDetailsDialog
          demand={selectedDemand}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          mode="view"
          onSave={handleSaveDemand}
          onClose={(id) => {
            const demand = demands.find(d => d.id === id);
            if (demand) handleCloseDemand(demand);
          }}
        />

        <DemandDetailsDialog
          demand={selectedDemand}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          mode="edit"
          onSave={handleSaveDemand}
        />

        <ConfirmDialog
          open={isCloseConfirmOpen}
          onOpenChange={setIsCloseConfirmOpen}
          title="Close Position"
          description={`Are you sure you want to close the position "${selectedDemand?.title}"? This will mark the demand as closed.`}
          confirmLabel="Close Position"
          variant="destructive"
          onConfirm={confirmCloseDemand}
        />

        <DownloadReportsDialog
          open={isDownloadOpen}
          onOpenChange={setIsDownloadOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
