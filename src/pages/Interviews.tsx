import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Calendar as CalendarIcon, Clock, Video, MessageSquare, Mail, Send, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { format, isSameDay, isSameWeek, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Interview } from '@/types/recruitment';

import { useRecruitment } from '@/context/RecruitmentContext';
import { InterviewCalendar } from '@/components/interviews/InterviewCalendar';

const Interviews = () => {
  const { updateCandidateFeedback, interviews, updateInterview } = useRecruitment();
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [feedbackRound, setFeedbackRound] = useState<1 | 2>(1);
  const [round1Feedback, setRound1Feedback] = useState({
    communication: '',
    technicalAssessment: '',
    problemSolving: '',
    overallPotential: '',
    recommendation: 'proceed_to_round2' as 'proceed_to_round2' | 'reject',
  });
  const [round2Feedback, setRound2Feedback] = useState({
    communication: '',
    technicalAssessment: '',
    problemSolving: '',
    overallPotential: '',
    recommendation: '',
    ctc: '',
  });
  const [emailContent, setEmailContent] = useState({
    subject: '',
    body: '',
  });

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  // Position filter state
  const [selectedPosition, setSelectedPosition] = useState<string>('All Positions');

  // Position options (reused from CandidateFilters)
  const positionOptions = [
    "All Positions",
    "Site Reliability Engineer",
    "Senior Site Reliability Engineer",
    "Lead Site Reliability Engineer",
    "Application Site Reliability Engineer",
    "Security Operations Centre Engineer",
    "Performance Engineer",
    "QA Automation Engineer (Playwright & Selenium)",
    "DevOps Engineer",
    "Lead SAP Engineer",
    "AI/ML Engineer",
    "AI/ML Intern",
    "Internship",
    "Fresher"
  ];

  const scheduledInterviews = interviews
    .filter((i) => i.status === 'scheduled')
    .filter((i) => selectedPosition === 'All Positions' || i.demandTitle === selectedPosition)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const groupedByDate = (selectedDate ? scheduledInterviews.filter(interview =>
    format(interview.scheduledAt, 'yyyy-MM-dd') === selectedDate
  ) : scheduledInterviews).reduce((acc, interview) => {
    const date = format(interview.scheduledAt, 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(interview);
    return acc;
  }, {} as Record<string, typeof scheduledInterviews>);

  // Calculate interview counts
  const today = new Date();
  const todayInterviews = scheduledInterviews.filter(interview =>
    isSameDay(interview.scheduledAt, today)
  ).length;

  const thisWeekInterviews = scheduledInterviews.filter(interview =>
    isSameWeek(interview.scheduledAt, today)
  ).length;

  const thisMonthInterviews = scheduledInterviews.filter(interview =>
    isSameMonth(interview.scheduledAt, today)
  ).length;

  const handleOpenFeedback = (interview: Interview) => {
    setSelectedInterview(interview);
    setFeedbackRound(interview.round as 1 | 2 || 1);
    setRound1Feedback({
      communication: '',
      technicalAssessment: '',
      problemSolving: '',
      overallPotential: '',
      recommendation: 'proceed_to_round2',
    });
    setRound2Feedback({
      communication: '',
      technicalAssessment: '',
      problemSolving: '',
      overallPotential: '',
      recommendation: '',
      ctc: '',
    });
    setIsFeedbackOpen(true);
  };

  const handleSubmitFeedback = () => {
    if (!selectedInterview) return;

    const isRound1 = feedbackRound === 1;

    // Use updateInterview from the context
    updateInterview(selectedInterview.id, {
      status: 'completed' as const,
      feedback: isRound1 ? {
        technicalRating: 0,
        communicationRating: 0,
        comments: `Communication: ${round1Feedback.communication}\nTechnical: ${round1Feedback.technicalAssessment}\nProblem-Solving: ${round1Feedback.problemSolving}\nOverall: ${round1Feedback.overallPotential}`,
        decision: round1Feedback.recommendation === 'proceed_to_round2' ? 'move_forward' : 'reject',
      } : {
        technicalRating: 0,
        communicationRating: 0,
        comments: `Communication: ${round2Feedback.communication}\nTechnical: ${round2Feedback.technicalAssessment}\nProblem-Solving: ${round2Feedback.problemSolving}\nOverall: ${round2Feedback.overallPotential}\nRecommendation: ${round2Feedback.recommendation}\nCTC: ${round2Feedback.ctc}`,
        decision: 'move_forward',
      }
    });

    // Update candidate's feedback in the recruitment context
    if (isRound1) {
      updateCandidateFeedback(selectedInterview.candidateId, 1, round1Feedback.recommendation);
    } else {
      updateCandidateFeedback(selectedInterview.candidateId, 2, round2Feedback.recommendation);
    }

    const decisionText = isRound1
      ? (round1Feedback.recommendation === 'proceed_to_round2' ? 'Proceed to Round 2' : 'Rejected')
      : 'Completed';

    toast.success(`Round ${feedbackRound} feedback submitted! ${decisionText}`);
    setIsFeedbackOpen(false);
    setSelectedInterview(null);
  };

  const handleOpenEmail = (interview: Interview) => {
    setSelectedInterview(interview);
    setEmailContent({
      subject: `Interview Reminder: ${interview.demandTitle} - Round ${interview.round}`,
      body: `Dear ${interview.candidateName},\n\nThis is a reminder for your upcoming interview scheduled on ${format(interview.scheduledAt, 'MMMM d, yyyy')} at ${format(interview.scheduledAt, 'h:mm a')}.\n\nPosition: ${interview.demandTitle}\nRound: ${interview.round}\n${interview.meetLink ? `Meeting Link: ${interview.meetLink}` : ''}\n\nPlease ensure you are available 5 minutes before the scheduled time.\n\nBest regards,\nHR Team`,
    });
    setIsEmailOpen(true);
  };

  const handleSendEmail = () => {
    toast.success(`Email notification sent to ${selectedInterview?.candidateName}!`);
    setIsEmailOpen(false);
    setSelectedInterview(null);
  };

  const generateGoogleCalendarLink = (interview: Interview) => {
    const startDate = interview.scheduledAt;
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = `Interview: ${interview.demandTitle} - ${interview.candidateName}`;
    const details = `Interview with ${interview.candidateName} for ${interview.demandTitle}\n\nRound: ${interview.round}\nCandidate ID: ${interview.candidateId}\nDemand ID: ${interview.demandId}`;
    const location = interview.meetLink || '';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
      details: details,
      location: location,
      trp: 'false' // Mark as busy
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleAddToGoogleCalendar = (interview: Interview) => {
    const calendarLink = generateGoogleCalendarLink(interview);
    window.open(calendarLink, '_blank');
  };

  const handleSendReminder = (interview: Interview) => {
    toast.success(`Reminder email sent to ${interview.candidateName} for the interview on ${format(interview.scheduledAt, 'MMM d')} at ${format(interview.scheduledAt, 'h:mm a')}`);
  };

  return (
    <DashboardLayout title="Interviews">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Interview Schedule</h2>
            <p className="text-muted-foreground">Manage your upcoming interviews</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Position Filter */}
            <div className="flex items-center gap-1">
              <Select
                value={selectedPosition}
                onValueChange={setSelectedPosition}
              >
                <SelectTrigger className="w-[200px] sm:w-[250px]">
                  <SelectValue placeholder="Filter by Position" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsCalendarVisible(!isCalendarVisible)}
            >
              <CalendarIcon className="h-4 w-4" />
              {isCalendarVisible ? 'Hide Calendar' : 'Show Calendar'}
            </Button>
            <Badge variant="outline" className="text-sm py-1">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {scheduledInterviews.length} Scheduled
            </Badge>
          </div>
        </div>

        {/* Calendar Section - Conditionally Visible */}
        {isCalendarVisible && (
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Google Calendar Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Google Calendar</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://calendar.google.com/calendar', '_blank')}
                  >
                    Open Full Calendar
                  </Button>
                </div>

                {/* Embedded Google Calendar */}
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?height=500&wkst=1&bgcolor=%23ffffff&ctz=Asia%2FKolkata&showTitle=0&showNav=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0"
                    style={{ border: 0, width: '100%', height: '500px' }}
                    loading="lazy"
                    title="Google Calendar"
                  ></iframe>
                </div>

                {/* Instructions */}
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold mb-1">How to use:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use the tabs at the top of the calendar to switch between Day, Week, and Month views</li>
                    <li>Use the navigation arrows to move between dates</li>
                    <li>Click "Open Full Calendar" for additional options</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Cards */}
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, dateInterviews]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="grid gap-4">
                {dateInterviews.map((interview) => (
                  <Card key={interview.id} className="shadow-card hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Time */}
                        <div className="flex items-center gap-3 lg:w-32">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {format(interview.scheduledAt, 'h:mm a')}
                            </p>
                            <p className="text-sm text-muted-foreground">Duration: 1hr</p>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="hidden lg:block w-px h-12 bg-border" />

                        {/* Candidate Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <span className="font-semibold text-accent">
                                {interview.candidateName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{interview.candidateName}</p>
                              <p className="text-sm text-muted-foreground">{interview.demandTitle}</p>
                            </div>
                          </div>
                        </div>

                        {/* Round Badge */}
                        <Badge className={cn(
                          'self-start lg:self-center',
                          interview.round === 1 ? 'bg-info/10 text-info border-info/20' :
                            interview.round === 2 ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-success/10 text-success border-success/20'
                        )}>
                          Round {interview.round}
                        </Badge>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendReminder(interview)}
                            className="text-primary"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Reminder
                          </Button>
                          {interview.meetLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-accent border-accent/30 hover:bg-accent hover:text-accent-foreground"
                              onClick={() => window.open(interview.meetLink, '_blank')}
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Join Meet
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenFeedback(interview)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Feedback
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEmail(interview)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {scheduledInterviews.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Upcoming Interviews</h3>
              <p className="text-muted-foreground">
                You don't have any interviews scheduled yet
              </p>
            </CardContent>
          </Card>
        )}

        {/* Feedback Dialog with Round-based feedback */}
        <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Interview Feedback</DialogTitle>
              <DialogDescription>
                Provide your feedback for {selectedInterview?.candidateName}'s Round {selectedInterview?.round} interview
              </DialogDescription>
            </DialogHeader>

            <Tabs value={String(feedbackRound)} onValueChange={(v) => setFeedbackRound(Number(v) as 1 | 2)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="1">Round 1 Feedback</TabsTrigger>
                <TabsTrigger value="2">Round 2 Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="1" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Communication:</Label>
                  <Textarea
                    value={round1Feedback.communication}
                    onChange={(e) => setRound1Feedback({ ...round1Feedback, communication: e.target.value })}
                    placeholder="Evaluate communication skills..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Technical Assessment:</Label>
                  <Textarea
                    value={round1Feedback.technicalAssessment}
                    onChange={(e) => setRound1Feedback({ ...round1Feedback, technicalAssessment: e.target.value })}
                    placeholder="Evaluate technical skills..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Problem-Solving:</Label>
                  <Textarea
                    value={round1Feedback.problemSolving}
                    onChange={(e) => setRound1Feedback({ ...round1Feedback, problemSolving: e.target.value })}
                    placeholder="Evaluate problem-solving abilities..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Overall Potential:</Label>
                  <Textarea
                    value={round1Feedback.overallPotential}
                    onChange={(e) => setRound1Feedback({ ...round1Feedback, overallPotential: e.target.value })}
                    placeholder="Overall assessment of the candidate..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recommendation:</Label>
                  <Select
                    value={round1Feedback.recommendation}
                    onValueChange={(value: 'proceed_to_round2' | 'reject') =>
                      setRound1Feedback({ ...round1Feedback, recommendation: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proceed_to_round2">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-success" />
                          Proceed Round 2
                        </div>
                      </SelectItem>
                      <SelectItem value="reject">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive" />
                          Reject
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="2" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Communication:</Label>
                  <Textarea
                    value={round2Feedback.communication}
                    onChange={(e) => setRound2Feedback({ ...round2Feedback, communication: e.target.value })}
                    placeholder="Evaluate communication skills..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Technical Assessment:</Label>
                  <Textarea
                    value={round2Feedback.technicalAssessment}
                    onChange={(e) => setRound2Feedback({ ...round2Feedback, technicalAssessment: e.target.value })}
                    placeholder="Evaluate technical skills..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Problem-Solving:</Label>
                  <Textarea
                    value={round2Feedback.problemSolving}
                    onChange={(e) => setRound2Feedback({ ...round2Feedback, problemSolving: e.target.value })}
                    placeholder="Evaluate problem-solving abilities..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Overall Potential:</Label>
                  <Textarea
                    value={round2Feedback.overallPotential}
                    onChange={(e) => setRound2Feedback({ ...round2Feedback, overallPotential: e.target.value })}
                    placeholder="Overall assessment of the candidate..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recommendation:</Label>
                  <Textarea
                    value={round2Feedback.recommendation}
                    onChange={(e) => setRound2Feedback({ ...round2Feedback, recommendation: e.target.value })}
                    placeholder="Your recommendation..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTC:</Label>
                  <Textarea
                    value={round2Feedback.ctc}
                    onChange={(e) => setRound2Feedback({ ...round2Feedback, ctc: e.target.value })}
                    placeholder="Enter CTC details..."
                    rows={2}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFeedbackOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitFeedback}>
                Submit Round {feedbackRound} Feedback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Send Email Notification</DialogTitle>
              <DialogDescription>
                Send an email to {selectedInterview?.candidateName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={emailContent.body}
                  onChange={(e) => setEmailContent({ ...emailContent, body: e.target.value })}
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Interviews;
