"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ParsedEvent } from "@/lib/validation";
import { columns } from "./columns";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter, Download, Calendar } from "lucide-react";

interface EventsTableProps {
  events: ParsedEvent[];
  onExportICS: () => void;
  onExportGoogle: () => void;
  isLoading?: boolean;
}

export function EventsTable({ events, onExportICS, onExportGoogle, isLoading }: EventsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  const filteredEvents = events.filter(event => {
    if (typeFilter !== "all" && event.type !== typeFilter) return false;
    if (globalFilter) {
      const searchTerm = globalFilter.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchTerm) ||
        event.notes?.toLowerCase().includes(searchTerm) ||
        event.type.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-foreground">No events found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a syllabus to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Lecture">Lecture</option>
            <option value="Exam">Exam</option>
            <option value="Assignment">Assignment</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onExportICS} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export ICS
          </Button>
          <Button onClick={onExportGoogle} size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Export to Google
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                      scope="col"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredEvents.map((event) => {
                const row = table.getRowModel().rows.find(r => r.original.id === event.id);
                if (!row) return null;
                
                return (
                  <tr
                    key={event.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredEvents.length} of {events.length} events
      </div>
    </div>
  );
}
