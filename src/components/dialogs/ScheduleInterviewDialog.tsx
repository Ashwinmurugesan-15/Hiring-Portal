import { useState } from 'react';
import { Candidate, InterviewRound } from '@/types/recruitment';
import { mockDemands } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRecruitment } from '@/context/RecruitmentContext';

interface ScheduleInterviewDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule?: (data: ScheduleData) => void;
}

interface ScheduleData {
  candidateId: string;
  round: InterviewRound;
  date: string;
  time: string;
  meetLink: string;
  interviewerName: string;
}

const getRound1Template = (candidateName: string, positionTitle: string, date: string, time: string, interviewerName: string, meetLink: string) => {
  return `Dear ${candidateName},

We are pleased to inform you that your application for the position of ${positionTitle} has been shortlified.

We would like to invite you for Round 1 - Technical Interview / Coding with our team.

Interview Details:
━━━━━━━━━━━━━━━━━━━━━
📅 Date: ${date}
🕐 Time: ${time}
👤 Interviewer: ${interviewerName}
🔗 Meeting Link: ${meetLink}
⏱️ Duration: 1 hour (approx.)

Interview Format:
━━━━━━━━━━━━━━━━━━━━━
This round will focus on:
• Technical assessment and coding challenges
• Discussion on your technical skills and experience
• Problem-solving exercises
• Code review and best practices

What to Prepare:
━━━━━━━━━━━━━━━━━━━━━
✓ Review fundamental concepts related to the position
✓ Practice coding problems
✓ Be ready to explain your previous projects
✓ Prepare questions about the role and team

Important Instructions:
━━━━━━━━━━━━━━━━━━━━━
✓ Please join the meeting 5 minutes prior to the scheduled time
✓ Ensure a stable internet connection
✓ Keep your resume and relevant documents handy
✓ Have a quiet environment for the interview
✓ Test your audio and video before the call

Please confirm your availability for this interview by replying to this email.

If you have any questions or need to reschedule, please feel free to contact us.

We look forward to meeting you!

Best regards,
HR Team / Recruitment Team

---
Note: This is an automated email. Please do not reply directly to this email.
For any queries, contact us at hr@company.com`;
};

const getRound2Template = (candidateName: string, positionTitle: string, date: string, time: string, interviewerName: string, meetLink: string) => {
  return `Dear ${candidateName},

Congratulations! You have successfully cleared Round 1 of the interview process.

We would like to invite you for Round 2 - Technical Interview / HR with our team for the position of ${positionTitle}.

Interview Details:
━━━━━━━━━━━━━━━━━━━━━
📅 Date: ${date}
🕐 Time: ${time}
👤 Interviewer: ${interviewerName}
🔗 Meeting Link: ${meetLink}
⏱️ Duration: 1 hour (approx.)

Interview Format:
━━━━━━━━━━━━━━━━━━━━━
This round will focus on:
• In-depth technical discussion
• System design and architecture
• HR round and cultural fit assessment
• Discussion on compensation and benefits
• Team expectations and work culture

What to Prepare:
━━━━━━━━━━━━━━━━━━━━━
✓ Be ready for advanced technical questions
✓ Prepare examples of your leadership experience
✓ Think about your career goals
✓ Prepare questions about company culture and growth opportunities
✓ Be ready to discuss salary expectations

Important Instructions:
━━━━━━━━━━━━━━━━━━━━━
✓ Please join the meeting 5 minutes prior to the scheduled time
✓ Ensure a stable internet connection
✓ Keep your resume and relevant documents handy
✓ Have a quiet environment for the interview
✓ Test your audio and video before the call

Please confirm your availability for this interview by replying to this email.

If you have any questions or need to reschedule, please feel free to contact us.

We are excited to move forward with your candidacy!

Best regards,
HR Team / Recruitment Team

---
Note: This is an automated email. Please do not reply directly to this email.
For any queries, contact us at hr@company.com`;
};

export const ScheduleInterviewDialog = ({
  candidate,
  open,
  onOpenChange,
  onSchedule
}: ScheduleInterviewDialogProps) => {
  const { addInterview } = useRecruitment();
  const [formData, setFormData] = useState({
    round: '1' as string,
    date: '',
    time: '',
    meetLink: '',
    interviewerName: '',
  });
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  if (!candidate) return null;

  const demand = mockDemands.find(d => d.id === candidate.demandId);
  const positionTitle = demand?.title || 'Unknown Position';

  // Update email template when round, date, time, or interviewer changes
  const updateEmailTemplate = (round: string, date: string, time: string, interviewerName: string, meetLink: string) => {
    if (!date || !time || !interviewerName) return;

    const formattedDate = date ? format(new Date(date), 'MMMM d, yyyy') : '[Date]';
    const formattedTime = time || '[Time]';
    const finalMeetLink = meetLink || 'https://meet.google.com/xxx-xxxx-xxx';

    if (round === '1') {
      setEmailSubject(`Interview Invitation - Round 1 - ${positionTitle}`);
      setEmailBody(getRound1Template(candidate.name, positionTitle, formattedDate, formattedTime, interviewerName, finalMeetLink));
    } else {
      setEmailSubject(`Interview Invitation - Round 2 - ${positionTitle}`);
      setEmailBody(getRound2Template(candidate.name, positionTitle, formattedDate, formattedTime, interviewerName, finalMeetLink));
    }
  };

  const handleFormChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Update email template when relevant fields change
    if (['round', 'date', 'time', 'interviewerName', 'meetLink'].includes(field)) {
      updateEmailTemplate(
        newFormData.round,
        newFormData.date,
        newFormData.time,
        newFormData.interviewerName,
        newFormData.meetLink
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.interviewerName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const scheduleData: ScheduleData = {
      candidateId: candidate.id,
      round: parseInt(formData.round) as InterviewRound,
      date: formData.date,
      time: formData.time,
      meetLink: formData.meetLink || `https://meet.google.com/${Math.random().toString(36).slice(2, 11)}`,
      interviewerName: formData.interviewerName,
    };

    // Create scheduled date object
    const scheduledAt = new Date(`${formData.date}T${formData.time}`);

    // Add interview to context (automatically updates calendar)
    addInterview({
      candidateId: candidate.id,
      candidateName: candidate.name,
      demandId: candidate.demandId,
      demandTitle: positionTitle,
      round: parseInt(formData.round) as InterviewRound,
      scheduledAt,
      interviewerId: '4', // Default interviewer ID
      interviewerName: formData.interviewerName,
      meetLink: scheduleData.meetLink,
      status: 'scheduled',
    });

    onSchedule?.(scheduleData);
    toast.success(`Interview scheduled and email sent to ${candidate.name}`);

    // Automatically add to Google Calendar
    const endDate = new Date(scheduledAt.getTime() + 60 * 60 * 1000); // 1 hour duration
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    const title = `Interview: ${positionTitle} - ${candidate.name}`;
    const details = `Interview with ${candidate.name} for ${positionTitle}\n\nRound: ${formData.round}\nInterviewer: ${formData.interviewerName}`;
    const location = scheduleData.meetLink;

    const calendarParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDateForGoogle(scheduledAt)}/${formatDateForGoogle(endDate)}`,
      details: details,
      location: location,
      trp: 'false'
    });

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?${calendarParams.toString()}`;
    window.open(googleCalendarUrl, '_blank');
    toast.info('Google Calendar opened - click "Save" to add the interview');

    onOpenChange(false);

    // Reset form
    setFormData({
      round: '1',
      date: '',
      time: '',
      meetLink: '',
      interviewerName: '',
    });
    setEmailSubject('');
    setEmailBody('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <p className="font-medium">{candidate.name}</p>
            <p className="text-sm text-muted-foreground">{positionTitle}</p>
          </div>

          <div className="space-y-2">
            <Label>Interview Round</Label>
            <Select
              value={formData.round}
              onValueChange={(value) => handleFormChange('round', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Round 1 - Technical Interview / Coding</SelectItem>
                <SelectItem value="2">Round 2 - Technical Interview / HR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => handleFormChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interviewer Name *</Label>
            <Input
              value={formData.interviewerName}
              onChange={(e) => handleFormChange('interviewerName', e.target.value)}
              placeholder="Enter interviewer name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Meeting Link (Optional)</Label>
            <Input
              value={formData.meetLink}
              onChange={(e) => handleFormChange('meetLink', e.target.value)}
              placeholder="Auto-generated if not provided"
            />
          </div>

          {/* Email Template Preview - Only show when all required fields are filled */}
          {emailBody && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Email Template (Editable)</Label>
                <span className="text-xs text-muted-foreground">You can edit this before sending</span>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule & Send Email</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
