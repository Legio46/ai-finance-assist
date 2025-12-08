import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, DollarSign, CreditCard, TrendingUp, Wallet, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CalendarEvent {
  id: string;
  date: string;
  type: 'bill' | 'income' | 'investment' | 'goal' | 'custom';
  name: string;
  amount: number;
  isCustom?: boolean;
  notes?: string;
}

interface CustomEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_type: string;
  amount: number;
  event_date: string;
  is_recurring: boolean;
  recurrence_frequency: string | null;
  notes: string | null;
}

const FinancialCalendar = () => {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    event_name: '',
    event_type: 'bill',
    amount: '',
    event_date: '',
    notes: '',
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    if (user) {
      fetchFinancialEvents();
    }
  }, [user, currentMonth, currentYear]);

  const fetchFinancialEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const allEvents: CalendarEvent[] = [];

      // Fetch custom calendar events
      const { data: customEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id);

      if (customEvents) {
        customEvents.forEach((event: CustomEvent) => {
          const eventDate = new Date(event.event_date);
          if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
            allEvents.push({
              id: event.id,
              date: event.event_date,
              type: event.event_type as CalendarEvent['type'],
              name: event.event_name,
              amount: event.amount,
              isCustom: true,
              notes: event.notes || undefined,
            });
          }
        });
      }

      // Fetch recurring payments (bills)
      const { data: payments } = await supabase
        .from('recurring_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (payments) {
        payments.forEach(payment => {
          if (payment.next_due_date) {
            const paymentDate = new Date(payment.next_due_date);
            if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
              allEvents.push({
                id: `payment-${payment.id}`,
                date: payment.next_due_date,
                type: 'bill',
                name: payment.payment_name,
                amount: payment.amount,
              });
            }
          }
        });
      }

      // Fetch income sources (paydays)
      const { data: incomeSources } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (incomeSources) {
        incomeSources.forEach(income => {
          const startDate = income.start_date ? new Date(income.start_date) : new Date();
          const monthEnd = new Date(currentYear, currentMonth + 1, 0);

          if (income.frequency === 'monthly') {
            const incomeDay = startDate.getDate();
            const incomeDate = new Date(currentYear, currentMonth, Math.min(incomeDay, monthEnd.getDate()));
            allEvents.push({
              id: `income-${income.id}-${currentMonth}`,
              date: incomeDate.toISOString().split('T')[0],
              type: 'income',
              name: income.source_name,
              amount: income.amount,
            });
          }
        });
      }

      // Fetch financial goals with target dates
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id);

      if (goals) {
        goals.forEach(goal => {
          if (goal.target_date) {
            const targetDate = new Date(goal.target_date);
            if (targetDate.getMonth() === currentMonth && targetDate.getFullYear() === currentYear) {
              allEvents.push({
                id: `goal-${goal.id}`,
                date: goal.target_date,
                type: 'goal',
                name: goal.goal_name,
                amount: goal.target_amount,
              });
            }
          }
        });
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching financial events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.event_name || !formData.amount || !formData.event_date) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          event_name: formData.event_name,
          event_type: formData.event_type,
          amount: parseFloat(formData.amount),
          event_date: formData.event_date,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Event Added",
        description: "Your calendar event has been created.",
      });

      resetForm();
      fetchFinancialEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingEvent || !formData.event_name || !formData.amount || !formData.event_date) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          event_name: formData.event_name,
          event_type: formData.event_type,
          amount: parseFloat(formData.amount),
          event_date: formData.event_date,
          notes: formData.notes || null,
        })
        .eq('id', editingEvent.id);

      if (error) throw error;

      toast({
        title: "Event Updated",
        description: "Your calendar event has been updated.",
      });

      resetForm();
      fetchFinancialEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Event Deleted",
        description: "Your calendar event has been removed.",
      });

      fetchFinancialEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      event_name: '',
      event_type: 'bill',
      amount: '',
      event_date: '',
      notes: '',
    });
    setShowAddForm(false);
    setEditingEvent(null);
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      event_name: event.name,
      event_type: event.type,
      amount: event.amount.toString(),
      event_date: event.date,
      notes: event.notes || '',
    });
  };

  const openAddDialogForDate = (dateStr: string) => {
    setFormData({
      ...formData,
      event_date: dateStr,
    });
    setShowAddForm(true);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'bill': return 'bg-destructive';
      case 'income': return 'bg-success';
      case 'investment': return 'bg-primary';
      case 'goal': return 'bg-warning';
      case 'custom': return 'bg-accent';
      default: return 'bg-muted';
    }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'bill': return <CreditCard className="w-3 h-3" />;
      case 'income': return <Wallet className="w-3 h-3" />;
      case 'investment': return <TrendingUp className="w-3 h-3" />;
      case 'goal': return <DollarSign className="w-3 h-3" />;
      case 'custom': return <Calendar className="w-3 h-3" />;
      default: return null;
    }
  };

  const selectedDateEvents = selectedDate 
    ? events.filter(event => event.date === selectedDate)
    : [];

  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const eventTypes = [
    { value: 'bill', label: 'Bill / Expense' },
    { value: 'income', label: 'Income / Payday' },
    { value: 'investment', label: 'Investment' },
    { value: 'goal', label: 'Goal Deadline' },
    { value: 'custom', label: 'Custom Event' },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Financial Calendar
              </CardTitle>
              <CardDescription>
                View and manage your bills, paydays, and financial events
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">{monthName}</span>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span>Bills</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span>Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Investments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span>Goals</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 md:h-20" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = getEventsForDay(day);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={cn(
                        "h-16 md:h-20 border rounded-md p-1 cursor-pointer transition-colors hover:bg-accent/50",
                        isToday(day) && "border-primary bg-primary/5",
                        isSelected && "border-primary bg-primary/10",
                        "flex flex-col"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium",
                        isToday(day) && "text-primary"
                      )}>
                        {day}
                      </span>
                      <div className="flex flex-wrap gap-0.5 mt-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getEventColor(event.type)
                            )}
                            title={event.name}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Date Events */}
              {selectedDate && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">
                      Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    <Button variant="outline" size="sm" onClick={() => openAddDialogForDate(selectedDate)}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events scheduled for this day.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateEvents.map(event => (
                        <div 
                          key={event.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-white",
                              getEventColor(event.type)
                            )}>
                              {getEventIcon(event.type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{event.name}</p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {event.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-semibold",
                              event.type === 'income' ? 'text-success' : ''
                            )}>
                              {event.type === 'income' ? '+' : ''}{formatCurrency(event.amount)}
                            </span>
                            {event.isCustom && (
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(event);
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(event.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming Events Summary */}
              {events.length > 0 && !selectedDate && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Upcoming This Month</h4>
                  <div className="space-y-2">
                    {events
                      .filter(e => new Date(e.date) >= new Date(new Date().toDateString()))
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(0, 5)
                      .map(event => (
                        <div 
                          key={event.id} 
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/20"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              getEventColor(event.type)
                            )} />
                            <span className="text-sm">{event.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.date + 'T00:00:00').toLocaleDateString('default', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            event.type === 'income' ? 'text-success' : ''
                          )}>
                            {event.type === 'income' ? '+' : ''}{formatCurrency(event.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Event Dialog */}
      <Dialog open={showAddForm || !!editingEvent} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Calendar Event'}</DialogTitle>
            <DialogDescription>
              {editingEvent ? 'Update your calendar event details.' : 'Create a new financial event on your calendar.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent} className="space-y-4">
            <div>
              <Label htmlFor="event_name">Event Name</Label>
              <Input
                id="event_name"
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                placeholder="e.g., Rent Payment, Salary"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_type">Event Type</Label>
                <Select 
                  value={formData.event_type} 
                  onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinancialCalendar;
