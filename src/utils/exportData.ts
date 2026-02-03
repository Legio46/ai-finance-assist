import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Base64 encoded Legio logo for PDF exports
const LEGIO_LOGO_BASE64 = 'data:image/png;base64,';

interface ExportData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: { label: string; value: string }[];
}

// Function to load image and convert to base64
const loadLogoBase64 = async (): Promise<string> => {
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load logo:', error);
    return '';
  }
};

export const exportToCSV = (data: ExportData, filename: string) => {
  // Add LEGIO branding header
  const csvContent = [
    'LEGIO FINANCE - Financial Report',
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    data.headers.join(','),
    ...data.rows.map(row => 
      row.map(cell => {
        const cellStr = String(cell);
        // Escape quotes and wrap in quotes if contains comma or quote
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ),
  ].join('\n');

  // Add summary at the end if provided
  let finalContent = csvContent;
  if (data.summary) {
    finalContent += '\n\n' + data.summary.map(s => `${s.label},${s.value}`).join('\n');
  }

  const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (data: ExportData, filename: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Load and add logo
  try {
    const logoBase64 = await loadLogoBase64();
    if (logoBase64) {
      // Add logo centered at top (40x40 px)
      const logoWidth = 25;
      const logoHeight = 25;
      doc.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, 10, logoWidth, logoHeight);
    }
  } catch (error) {
    console.error('Failed to add logo to PDF:', error);
  }
  
  // Brand name
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 22, 40); // Legio maroon color
  doc.text('LEGIO FINANCE', pageWidth / 2, 42, { align: 'center' });
  
  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(data.title, pageWidth / 2, 52, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 60, { align: 'center' });
  
  // Table
  autoTable(doc, {
    head: [data.headers],
    body: data.rows.map(row => row.map(cell => String(cell))),
    startY: 68,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [139, 22, 40], // Legio maroon
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });
  
  // Summary
  if (data.summary && data.summary.length > 0) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 68;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, finalY + 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    data.summary.forEach((item, index) => {
      doc.text(`${item.label}: ${item.value}`, 14, finalY + 25 + (index * 7));
    });
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('© Legio Finance - www.legio.financial', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  doc.save(`${filename}.pdf`);
};

export const formatExportDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatExportCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};
