/**
 * Utility functions to format AI tool calls into user-friendly messages
 */

export interface ToolCallInfo {
  toolName: string;
  args: Record<string, any>;
  state: "result" | "call";
}

export interface FormattedToolCall {
  action: string; // "Creating", "Editing", "Viewing", etc.
  target: string; // "Card.jsx", "App.jsx → NewApp.jsx"
  icon: "file-plus" | "file-edit" | "eye" | "trash" | "folder" | "undo" | "file";
  color: "blue" | "amber" | "green" | "red" | "purple" | "neutral";
  detail?: string; // Additional context for tooltip
}

/**
 * Extracts the filename from a path
 * @example getFileName("src/components/Card.jsx") => "Card.jsx"
 */
function getFileName(path: string): string {
  if (!path) return "file";
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

/**
 * Formats a tool call into a user-friendly display format
 */
export function formatToolCall(toolCall: ToolCallInfo): FormattedToolCall {
  try {
    const { toolName, args } = toolCall;

    // Handle str_replace_editor tool
    if (toolName === "str_replace_editor") {
      const command = args.command as string;
      const path = args.path as string;
      const fileName = getFileName(path);

      switch (command) {
        case "create":
          return {
            action: "Creating",
            target: fileName,
            icon: "file-plus",
            color: "blue",
            detail: `Creating new file: ${path}`,
          };

        case "str_replace":
          return {
            action: "Editing",
            target: fileName,
            icon: "file-edit",
            color: "amber",
            detail: `Replacing text in: ${path}`,
          };

        case "insert":
          return {
            action: "Inserting into",
            target: fileName,
            icon: "file-edit",
            color: "amber",
            detail: `Inserting at line ${args.insert_line || "?"} in: ${path}`,
          };

        case "view":
          return {
            action: "Viewing",
            target: fileName,
            icon: "eye",
            color: "green",
            detail: `Reading file: ${path}`,
          };

        case "undo_edit":
          return {
            action: "Reverting",
            target: fileName,
            icon: "undo",
            color: "purple",
            detail: `Undoing changes in: ${path}`,
          };

        default:
          return {
            action: "Processing",
            target: fileName,
            icon: "file",
            color: "neutral",
            detail: `Unknown command: ${command}`,
          };
      }
    }

    // Handle file_manager tool
    if (toolName === "file_manager") {
      const command = args.command as string;
      const path = args.path as string;
      const fileName = getFileName(path);

      switch (command) {
        case "rename":
          const newPath = args.new_path as string;
          const newFileName = getFileName(newPath);
          return {
            action: "Renaming",
            target: `${fileName} → ${newFileName}`,
            icon: "folder",
            color: "purple",
            detail: `Renaming: ${path} → ${newPath}`,
          };

        case "delete":
          return {
            action: "Deleting",
            target: fileName,
            icon: "trash",
            color: "red",
            detail: `Deleting: ${path}`,
          };

        default:
          return {
            action: "Managing",
            target: fileName,
            icon: "folder",
            color: "neutral",
            detail: `Unknown command: ${command}`,
          };
      }
    }

    // Fallback for unknown tools
    return {
      action: "Running",
      target: toolName,
      icon: "file",
      color: "neutral",
      detail: `Unknown tool: ${toolName}`,
    };
  } catch (error) {
    // Graceful degradation on any error
    return {
      action: "Processing",
      target: "file",
      icon: "file",
      color: "neutral",
      detail: `Error formatting ${toolCall.toolName}`,
    };
  }
}
