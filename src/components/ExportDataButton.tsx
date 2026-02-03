import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { exportToCSV, exportToPDF, formatExportDate, formatExportCurrency } from '@/utils/exportData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ExportDataButtonProps {
  dataType: 'calendar' | 'expenses' | 'income' | 'investments' | 'budgets' | 'recurring' | 'all';
  className?: string;
}

const ExportDataButton: React.FC<ExportDataButtonProps> = ({ dataType, className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    if (!user) return null;

    const data: Record<string, unknown[]> = {};

    if (dataType === 'expenses' || dataType === 'all') {
      const { data: expenses } = await supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      data.expenses = expenses || [];
    }

    if (dataType === 'income' || dataType === 'all') {
      const { data: income } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id);
      data.income = income || [];
    }

    if (dataType === 'investments' || dataType === 'all') {
      const { data: investments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);
      data.investments = investments || [];
    }

    if (dataType === 'budgets' || dataType === 'all') {
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
      data.budgets = budgets || [];
    }

    if (dataType === 'recurring' || dataType === 'all') {
      const { data: recurring } = await supabase
        .from('recurring_payments')
        .select('*')
        .eq('user_id', user.id);
      data.recurring = recurring || [];
    }

    if (dataType === 'calendar' || dataType === 'all') {
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id);
      data.calendar = events || [];
    }

    return data;
  };

  const prepareExportData = (data: Record<string, unknown[]>, format: 'csv' | 'pdf') => {
    const exports: { data: ReturnType<typeof prepareDataSet>; filename: string }[] = [];

    if (data.expenses) {
      const expenses = data.expenses as { date: string; category: string; description: string; amount: number; is_recurring: boolean }[];
      exports.push({
        data: prepareDataSet(
          'Personal Expenses',
          ['Date', 'Category', 'Description', 'Amount', 'Recurring'],
          expenses.map(e => [
            formatExportDate(e.date),
            e.category,
            e.description || '-',
            formatExportCurrency(e.amount),
            e.is_recurring ? 'Yes' : 'No',
          ]),
          [
            { label: 'Total Expenses', value: formatExportCurrency(expenses.reduce((sum, e) => sum + e.amount, 0)) },
            { label: 'Total Records', value: String(expenses.length) },
          ]
        ),
        filename: 'expenses',
      });
    }

    if (data.income) {
      const income = data.income as { source_name: string; category: string; amount: number; frequency: string; is_active: boolean }[];
      exports.push({
        data: prepareDataSet(
          'Income Sources',
          ['Source', 'Category', 'Amount', 'Frequency', 'Active'],
          income.map(i => [
            i.source_name,
            i.category || '-',
            formatExportCurrency(i.amount),
            i.frequency,
            i.is_active ? 'Yes' : 'No',
          ]),
          [
            { label: 'Total Monthly Income', value: formatExportCurrency(income.filter(i => i.is_active).reduce((sum, i) => sum + i.amount, 0)) },
          ]
        ),
        filename: 'income',
      });
    }

    if (data.investments) {
      const investments = data.investments as { investment_name: string; investment_type: string; quantity: number; purchase_price: number; current_price: number; purchase_date: string }[];
      exports.push({
        data: prepareDataSet(
          'Investments',
          ['Name', 'Type', 'Quantity', 'Purchase Price', 'Current Price', 'Gain/Loss', 'Purchase Date'],
          investments.map(i => {
            const gainLoss = (i.current_price - i.purchase_price) * i.quantity;
            return [
              i.investment_name,
              i.investment_type,
              String(i.quantity),
              formatExportCurrency(i.purchase_price),
              formatExportCurrency(i.current_price),
              formatExportCurrency(gainLoss),
              i.purchase_date ? formatExportDate(i.purchase_date) : '-',
            ];
          }),
          [
            { label: 'Total Value', value: formatExportCurrency(investments.reduce((sum, i) => sum + (i.current_price * i.quantity), 0)) },
            { label: 'Total Gain/Loss', value: formatExportCurrency(investments.reduce((sum, i) => sum + ((i.current_price - i.purchase_price) * i.quantity), 0)) },
          ]
        ),
        filename: 'investments',
      });
    }

    if (data.budgets) {
      const budgets = data.budgets as { category: string; amount: number; period: string }[];
      exports.push({
        data: prepareDataSet(
          'Budgets',
          ['Category', 'Amount', 'Period'],
          budgets.map(b => [
            b.category,
            formatExportCurrency(b.amount),
            b.period,
          ]),
          [
            { label: 'Total Budget', value: formatExportCurrency(budgets.reduce((sum, b) => sum + b.amount, 0)) },
          ]
        ),
        filename: 'budgets',
      });
    }

    if (data.recurring) {
      const recurring = data.recurring as { payment_name: string; category: string; amount: number; frequency: string; next_due_date: string; is_active: boolean }[];
      exports.push({
        data: prepareDataSet(
          'Recurring Payments',
          ['Name', 'Category', 'Amount', 'Frequency', 'Next Due', 'Active'],
          recurring.map(r => [
            r.payment_name,
            r.category || '-',
            formatExportCurrency(r.amount),
            r.frequency,
            r.next_due_date ? formatExportDate(r.next_due_date) : '-',
            r.is_active ? 'Yes' : 'No',
          ]),
          [
            { label: 'Total Monthly', value: formatExportCurrency(recurring.filter(r => r.is_active).reduce((sum, r) => sum + r.amount, 0)) },
          ]
        ),
        filename: 'recurring_payments',
      });
    }

    if (data.calendar) {
      const calendar = data.calendar as { event_name: string; event_type: string; amount: number; event_date: string; notes: string }[];
      exports.push({
        data: prepareDataSet(
          'Calendar Events',
          ['Event', 'Type', 'Amount', 'Date', 'Notes'],
          calendar.map(c => [
            c.event_name,
            c.event_type,
            formatExportCurrency(c.amount),
            formatExportDate(c.event_date),
            c.notes || '-',
          ])
        ),
        filename: 'calendar_events',
      });
    }

    return exports;
  };

  const prepareDataSet = (
    title: string,
    headers: string[],
    rows: (string | number)[][],
    summary?: { label: string; value: string }[]
  ) => ({
    title,
    headers,
    rows,
    summary,
  });

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const data = await fetchData();
      if (!data) {
        toast({
          title: 'Error',
          description: 'Failed to fetch data for export.',
          variant: 'destructive',
        });
        return;
      }

      const exports = prepareExportData(data, format);
      const timestamp = new Date().toISOString().split('T')[0];

      if (dataType === 'all') {
        // Export each type separately
        for (const exp of exports) {
          if (format === 'csv') {
            exportToCSV(exp.data, `${exp.filename}_${timestamp}`);
          } else {
            await exportToPDF(exp.data, `${exp.filename}_${timestamp}`);
          }
        }
        toast({
          title: 'Export Complete',
          description: `${exports.length} files exported as ${format.toUpperCase()}.`,
        });
      } else {
        // Export single type
        const exp = exports[0];
        if (exp) {
          if (format === 'csv') {
            exportToCSV(exp.data, `${exp.filename}_${timestamp}`);
          } else {
            await exportToPDF(exp.data, `${exp.filename}_${timestamp}`);
          }
          toast({
            title: 'Export Complete',
            description: `Data exported as ${format.toUpperCase()}.`,
          });
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting data.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className} disabled={exporting}>
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-1" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDataButton;
