"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ParsedEvent } from "@/lib/validation";
import { formatDate } from "@/lib/utils";
import { Badge } from "../ui/badge";

export const columns: ColumnDef<ParsedEvent>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return (
        <div className="font-medium">
          {formatDate(date)}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div className="font-medium max-w-[200px] truncate" title={title}>
          {title}
        </div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string;
      return (
        <div className="max-w-[250px] truncate text-muted-foreground" title={notes}>
          {notes || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const variant = {
        Lecture: "default",
        Exam: "destructive",
        Assignment: "secondary",
        Other: "outline",
      }[type] as "default" | "destructive" | "secondary" | "outline";
      
      return (
        <Badge variant={variant}>
          {type}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <button
            className="text-sm text-primary hover:text-primary/80 transition-colors"
            onClick={() => {
              // TODO: Implement edit functionality
              console.log("Edit event:", row.original);
            }}
          >
            Edit
          </button>
        </div>
      );
    },
  },
];
