/**
 * ToolCallBadge - Displays AI tool calls with user-friendly messaging
 * 
 * Transforms technical tool names like "str_replace_editor" into readable
 * messages like "Creating Card.jsx" or "Editing App.jsx"
 */

"use client";

import { Loader2, CheckCircle2, FilePlus, FileEdit, Eye, Trash2, FolderEdit, Undo2, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatToolCall } from "@/lib/utils/tool-call-formatter";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, any>;
  state: "result" | "call";
  className?: string;
}

const iconMap = {
  "file-plus": FilePlus,
  "file-edit": FileEdit,
  "eye": Eye,
  "trash": Trash2,
  "folder": FolderEdit,
  "undo": Undo2,
  "file": File,
} as const;

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "text-green-600",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "text-purple-600",
  },
  neutral: {
    bg: "bg-neutral-50",
    border: "border-neutral-200",
    icon: "text-neutral-600",
  },
} as const;

export function ToolCallBadge({ toolName, args, state, className }: ToolCallBadgeProps) {
  const formatted = formatToolCall({ toolName, args, state });
  const Icon = iconMap[formatted.icon];
  const colors = colorMap[formatted.color];

  return (
    <div
      role="status"
      aria-label={`${formatted.action} ${formatted.target}`}
      title={formatted.detail}
      className={cn(
        "inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium border",
        colors.bg,
        colors.border,
        className
      )}
    >
      {state === "result" ? (
        <CheckCircle2 className={cn("w-3 h-3", colors.icon)} />
      ) : (
        <Loader2 className={cn("w-3 h-3 animate-spin", colors.icon)} />
      )}
      <Icon className={cn("w-3 h-3", colors.icon)} />
      <span className="text-neutral-700">
        {formatted.action} <strong className="font-semibold">{formatted.target}</strong>
      </span>
    </div>
  );
}
