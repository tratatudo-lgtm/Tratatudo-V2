import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export const DataTable = <T extends { id: string | number }>({
  columns,
  data,
  loading,
  onRowClick,
  emptyMessage = "Nenhum dado encontrado.",
  className
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">A carregar dados...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 text-center px-6">
        <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-bottom border-slate-100">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={cn(
                  "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "group transition-colors",
                onRowClick ? "cursor-pointer hover:bg-slate-50/50" : ""
              )}
            >
              {columns.map((col, idx) => (
                <td
                  key={idx}
                  className={cn(
                    "px-6 py-4 text-sm font-medium text-slate-700",
                    col.className
                  )}
                >
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : (item[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
