import { useState, useEffect } from 'react';
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

const replacePlaceholders = (template: string, data: Record<string, string>) => {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    // Escape special characters for regex
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\[${escapedKey}\\]`, 'g'), value);
  });
  return result;
};

export const ScheduleInterviewDialog = ({
  candidate,
  open,
  onOpenChange,
  onSchedule
}: ScheduleInterviewDialogProps) => {
  const { addInterview, emailTemplates, sendEmail } = useRecruitment();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    round: '1' as string,
    date: '',
    time: '',
    meetLink: '',
    interviewerName: '',
  });
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Cleanup orphaned portal elements when dialog closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        // Find and remove any leftover radix portals
        const portals = document.querySelectorAll('[data-radix-portal]');
        portals.forEach(p => p.remove());
        // Force restore body styles
        document.body.style.pointerEvents = 'auto';
        document.body.style.overflow = 'auto';
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!candidate) return null;

  // Position title map for new position IDs
  const positionTitleMap: Record<string, string> = {
    'sre': 'Site Reliability Engineer',
    'senior-sre': 'Senior Site Reliability Engineer',
    'lead-sre': 'Lead Site Reliability Engineer',
    'app-sre': 'Application Site Reliability Engineer',
    'soc-engineer': 'Security Operations Centre Engineer',
    'performance-engineer': 'Performance Engineer',
    'qa-automation': 'QA Automation Engineer (Playwright & Selenium)',
    'devops': 'DevOps Engineer',
    'lead-sap': 'Lead SAP Engineer',
    'ai-ml': 'AI/ML Engineer',
    'ai-ml-intern': 'AI/ML Intern',
    'internship': 'Internship',
    'fresher': 'Fresher',
  };

  // Get position title from either new IDs or legacy mock demands
  const demand = mockDemands.find(d => d.id === candidate.demandId);
  const positionTitle = positionTitleMap[candidate.demandId] || demand?.title || candidate.demandId || 'Unknown Position';

  // Update email template when round, date, time, or interviewer changes
  const updateEmailTemplate = (round: string, date: string, time: string, interviewerName: string, meetLink: string) => {
    if (!date || !time || !interviewerName) return;

    const formattedDate = date ? format(new Date(date), 'MMMM d, yyyy') : '[Date]';
    const formattedTime = time || '[Time]';
    const finalMeetLink = meetLink || 'https://meet.google.com/xxx-xxxx-xxx';

    const templateId = round === '1' ? 'round1' : 'round2';
    const template = emailTemplates.find(t => t.id === templateId);

    if (template) {
      const pData = {
        'Candidate Name': candidate.name,
        'Position': positionTitle,
        'Date': formattedDate,
        'Time': formattedTime,
        'Interviewer': interviewerName,
        'Link': finalMeetLink,
        'Resume Link': candidate.resumeUrl ? candidate.resumeUrl : 'Not provided',
      };

      setEmailSubject(replacePlaceholders(template.subject, pData));
      setEmailBody(replacePlaceholders(template.body, pData));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.meetLink) {
      toast.error('Please fill in all required fields (Date, Time, and Meeting Link)');
      return;
    }

    const scheduleData: ScheduleData = {
      candidateId: candidate.id,
      round: parseInt(formData.round) as InterviewRound,
      date: formData.date,
      time: formData.time,
      meetLink: formData.meetLink,
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
      meetLink: formData.meetLink,
      status: 'scheduled',
    });

    // Send email notification
    setIsSending(true);
    let emailSent = false;

    if (candidate.email && emailSubject && emailBody) {
      try {
        const result = await sendEmail(candidate.email, emailSubject, emailBody.replace(/\n/g, '<br>'));
        if (result.success) {
          emailSent = true;
          toast.success('Invitation email sent to candidate');
        }
      } catch (error) {
        console.error('Failed to send interview email:', error);
      }
    } else {
      console.warn('Cannot send email: Missing candidate email or template content');
    }

    setIsSending(false);

    onSchedule?.(scheduleData);
    toast.success(`Interview scheduled for ${candidate.name}!`);

    // Close dialog
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
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
            <Label>Interviewer Name</Label>
            <Input
              value={formData.interviewerName}
              onChange={(e) => handleFormChange('interviewerName', e.target.value)}
              placeholder="Enter interviewer name"
            />
          </div>

          <div className="space-y-2">
            <Label>Meeting Link *</Label>
            <Input
              value={formData.meetLink}
              onChange={(e) => handleFormChange('meetLink', e.target.value)}
              placeholder="Paste meeting link here"
              required
            />
          </div>

          {/* Email Notification Preview */}
          {emailBody && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Email Notification Preview</Label>
                <span className="text-[10px] text-muted-foreground italic">Scheduled for both Candidate & Interviewer</span>
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
                <Label>Body</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={15}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSending}>
              {isSending ? 'Sending...' : 'Schedule & Send Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
