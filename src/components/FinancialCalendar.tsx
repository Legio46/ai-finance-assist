import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, DollarSign, CreditCard, TrendingUp, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  date: string;
  type: 'bill' | 'income' | 'investment' | 'goal';
  name: string;
  amount: number;
}

const FinancialCalendar = () => {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

      // Fetch recurring payments (bills)
      const { data: payments } = await supabase
        .from('recurring_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (payments) {
        payments.forEach(payment => {
          if (payment.next_due_date) {
            allEvents.push({
              id: `payment-${payment.id}`,
              date: payment.next_due_date,
              type: 'bill',
              name: payment.payment_name,
              amount: payment.amount,
            });
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
          // Generate income events for current month based on frequency
          const startDate = income.start_date ? new Date(income.start_date) : new Date();
          const monthStart = new Date(currentYear, currentMonth, 1);
          const monthEnd = new Date(currentYear, currentMonth + 1, 0);

          if (income.frequency === 'monthly') {
            const incomeDay = startDate.getDate();
            const incomeDate = new Date(currentYear, currentMonth, Math.min(incomeDay, monthEnd.getDate()));
            if (incomeDate >= monthStart && incomeDate <= monthEnd) {
              allEvents.push({
                id: `income-${income.id}-${currentMonth}`,
                date: incomeDate.toISOString().split('T')[0],
                type: 'income',
                name: income.source_name,
                amount: income.amount,
              });
            }
          } else if (income.frequency === 'weekly') {
            let current = new Date(monthStart);
            while (current <= monthEnd) {
              if (current.getDay() === startDate.getDay()) {
                allEvents.push({
                  id: `income-${income.id}-${current.toISOString()}`,
                  date: current.toISOString().split('T')[0],
                  type: 'income',
                  name: income.source_name,
                  amount: income.amount,
                });
              }
              current.setDate(current.getDate() + 1);
            }
          } else if (income.frequency === 'bi-weekly') {
            let current = new Date(startDate);
            while (current <= monthEnd) {
              if (current >= monthStart && current <= monthEnd) {
                allEvents.push({
                  id: `income-${income.id}-${current.toISOString()}`,
                  date: current.toISOString().split('T')[0],
                  type: 'income',
                  name: income.source_name,
                  amount: income.amount,
                });
              }
              current.setDate(current.getDate() + 14);
            }
          }
        });
      }

      // Fetch investments (dividends - using purchase_date as a placeholder for dividend dates)
      const { data: investments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);

      if (investments) {
        investments.forEach(investment => {
          if (investment.purchase_date) {
            // Show investment purchase anniversary in this month
            const purchaseDate = new Date(investment.purchase_date);
            const anniversaryDate = new Date(currentYear, currentMonth, purchaseDate.getDate());
            const monthEnd = new Date(currentYear, currentMonth + 1, 0);
            
            if (anniversaryDate.getDate() <= monthEnd.getDate()) {
              allEvents.push({
                id: `investment-${investment.id}`,
                date: anniversaryDate.toISOString().split('T')[0],
                type: 'investment',
                name: `${investment.investment_name} (${investment.investment_type})`,
                amount: investment.current_price * investment.quantity,
              });
            }
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
      default: return 'bg-muted';
    }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'bill': return <CreditCard className="w-3 h-3" />;
      case 'income': return <Wallet className="w-3 h-3" />;
      case 'investment': return <TrendingUp className="w-3 h-3" />;
      case 'goal': return <DollarSign className="w-3 h-3" />;
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Financial Calendar
            </CardTitle>
            <CardDescription>
              View all your bills, paydays, and financial events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
                <h4 className="text-sm font-medium mb-3">
                  Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
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
                        <span className={cn(
                          "font-semibold",
                          event.type === 'income' ? 'text-success' : ''
                        )}>
                          {event.type === 'income' ? '+' : ''}{formatCurrency(event.amount)}
                        </span>
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
                    .filter(e => new Date(e.date) >= new Date())
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
  );
};

export default FinancialCalendar;
