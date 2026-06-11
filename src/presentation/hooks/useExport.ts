import { useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "excel";

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  format?: (value: unknown, row: T) => string;
}

export function useExport<T extends Record<string, unknown>>() {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = useCallback(
    (data: T[], columns: ExportColumn<T>[], filename: string, format: ExportFormat) => {
      setIsExporting(true);
      try {
        const rows = data.map((row) => {
          const formatted: Record<string, unknown> = {};
          for (const col of columns) {
            const rawValue = row[col.key as keyof T];
            formatted[col.header] = col.format ? col.format(rawValue, row) : rawValue;
          }
          return formatted;
        });

        if (format === "csv") {
          const csv = Papa.unparse(rows, { delimiter: ";" });
          const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
          downloadBlob(blob, `${filename}.csv`);
        } else {
          const ws = XLSX.utils.json_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, filename);
          XLSX.writeFile(wb, `${filename}.xlsx`);
        }
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return { exportData, isExporting };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
