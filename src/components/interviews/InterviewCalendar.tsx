import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Interview } from '@/types/recruitment';
import { Clock, Video, Calendar, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-day-picker/dist/style.css';

interface InterviewCalendarProps {
    interviews: Interview[];
    selectedDate: string | null;
    onDateSelect: (date: string | null) => void;
    onAddToGoogleCalendar: (interview: Interview) => void;
}

export const InterviewCalendar = ({
    interviews,
    selectedDate,
    onDateSelect,
    onAddToGoogleCalendar,
}: InterviewCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

    // Get dates that have interviews
    const interviewDates = interviews.reduce((acc, interview) => {
        const dateStr = format(interview.scheduledAt, 'yyyy-MM-dd');
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(interview);
        return acc;
    }, {} as Record<string, Interview[]>);

    // Get interview count for a specific date
    const getInterviewCount = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return interviewDates[dateStr]?.length || 0;
    };

    // Get interviews for a specific date
    const getInterviewsForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return interviewDates[dateStr] || [];
    };

    // Handle date click
    const handleDayClick = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        if (selectedDate === dateStr) {
            onDateSelect(null); // Deselect if already selected
        } else {
            onDateSelect(dateStr);
        }
    };

    // Custom day content renderer for month view
    const renderDayContent = (day: Date) => {
        const count = getInterviewCount(day);
        const isSelected = selectedDate === format(day, 'yyyy-MM-dd');
        const isToday = isSameDay(day, new Date());

        return (
            <div
                className={cn(
                    'relative w-full h-full min-h-[40px] flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all',
                    isSelected && 'bg-primary text-primary-foreground',
                    isToday && !isSelected && 'ring-2 ring-primary ring-offset-2',
                    count > 0 && !isSelected && 'bg-accent/20'
                )}
                onClick={() => handleDayClick(day)}
            >
                <span className={cn("text-sm font-medium", isSelected && "text-primary-foreground")}>
                    {format(day, 'd')}
                </span>
                {count > 0 && (
                    <div className="flex gap-0.5 mt-1">
                        {count <= 3 ? (
                            Array.from({ length: count }).map((_, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        isSelected ? "bg-primary-foreground" : "bg-primary"
                                    )}
                                />
                            ))
                        ) : (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                {count}
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Week view
    const renderWeekView = () => {
        const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(addDays(currentMonth, -7))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-semibold">
                        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(addDays(currentMonth, 7))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day) => {
                        const dayInterviews = getInterviewsForDate(day);
                        const isSelected = selectedDate === format(day, 'yyyy-MM-dd');
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    'p-2 rounded-lg border cursor-pointer transition-all min-h-[100px]',
                                    isSelected && 'border-primary bg-primary/5',
                                    isToday && !isSelected && 'border-primary/50',
                                    dayInterviews.length > 0 && !isSelected && 'bg-accent/10'
                                )}
                                onClick={() => handleDayClick(day)}
                            >
                                <div className="text-center mb-2">
                                    <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                                    <p className={cn(
                                        "text-lg font-semibold",
                                        isToday && "text-primary"
                                    )}>{format(day, 'd')}</p>
                                </div>
                                {dayInterviews.length > 0 && (
                                    <div className="space-y-1">
                                        {dayInterviews.slice(0, 2).map((interview) => (
                                            <div
                                                key={interview.id}
                                                className="text-xs p-1 bg-primary/10 rounded truncate"
                                                title={`${interview.candidateName} - ${format(interview.scheduledAt, 'h:mm a')}`}
                                            >
                                                {format(interview.scheduledAt, 'h:mm a')}
                                            </div>
                                        ))}
                                        {dayInterviews.length > 2 && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                +{dayInterviews.length - 2} more
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Day view
    const renderDayView = () => {
        const dayInterviews = getInterviewsForDate(currentMonth);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(addDays(currentMonth, -1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-semibold">{format(currentMonth, 'EEEE, MMMM d, yyyy')}</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(addDays(currentMonth, 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {dayInterviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No interviews scheduled for this day</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dayInterviews.map((interview) => (
                            <Card key={interview.id} className="shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{format(interview.scheduledAt, 'h:mm a')}</p>
                                                <p className="text-sm text-muted-foreground">{interview.candidateName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Round {interview.round}</Badge>
                                            {interview.meetLink && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(interview.meetLink, '_blank')}
                                                >
                                                    <Video className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onAddToGoogleCalendar(interview)}
                                                title="Add to Google Calendar"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="shadow-card">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Interview Calendar</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://calendar.google.com/calendar', '_blank')}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Google Calendar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week' | 'day')}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="day">Day</TabsTrigger>
                    </TabsList>

                    <TabsContent value="month" className="mt-0">
                        <DayPicker
                            mode="single"
                            selected={selectedDate ? new Date(selectedDate) : undefined}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            modifiers={{
                                hasInterview: Object.keys(interviewDates).map((d) => new Date(d)),
                            }}
                            modifiersStyles={{
                                hasInterview: {
                                    fontWeight: 'bold',
                                },
                            }}
                            components={{
                                DayContent: ({ date }) => renderDayContent(date),
                            }}
                            className="mx-auto"
                            classNames={{
                                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                                month: 'space-y-4 w-full',
                                caption: 'flex justify-center pt-1 relative items-center',
                                caption_label: 'text-sm font-medium',
                                nav: 'space-x-1 flex items-center',
                                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                                nav_button_previous: 'absolute left-1',
                                nav_button_next: 'absolute right-1',
                                table: 'w-full border-collapse space-y-1',
                                head_row: 'flex w-full',
                                head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
                                row: 'flex w-full mt-2',
                                cell: 'w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                                day: 'h-full w-full p-0 font-normal aria-selected:opacity-100',
                                day_selected: '',
                                day_today: '',
                                day_outside: 'text-muted-foreground opacity-50',
                                day_disabled: 'text-muted-foreground opacity-50',
                                day_hidden: 'invisible',
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="week" className="mt-0">
                        {renderWeekView()}
                    </TabsContent>

                    <TabsContent value="day" className="mt-0">
                        {renderDayView()}
                    </TabsContent>
                </Tabs>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span>Has interviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded border-2 border-primary" />
                        <span>Today</span>
                    </div>
                    {selectedDate && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDateSelect(null)}
                            className="ml-auto"
                        >
                            Clear selection
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
