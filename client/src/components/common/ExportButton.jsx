import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';

export function exportAsCSV(data, filename = 'export.csv') {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'export.csv';
  link.click();
}

export function exportAsJSON(data, filename = 'export.json') {
  if (!data) {
    console.warn('No data to export');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'export.json';
  link.click();
}

export default function ExportButton({ data, filename = 'export' }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCSV = () => {
    exportAsCSV(Array.isArray(data) ? data : [data], `${filename}.csv`);
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    exportAsJSON(data, `${filename}.json`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
        style={{
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--color-accent)',
        }}
        title="Export data"
      >
        <Download size={16} />
        Export
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full right-0 mt-1 rounded-lg shadow-lg z-40 overflow-hidden"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <button
              onClick={handleExportCSV}
              className="w-full px-4 py-2 text-sm text-left hover:bg-opacity-50 transition-colors"
              style={{
                color: 'var(--color-text-primary)',
              }}
            >
              Export as CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full px-4 py-2 text-sm text-left hover:bg-opacity-50 transition-colors border-t"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
              }}
            >
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
