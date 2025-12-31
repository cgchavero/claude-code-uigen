import { describe, it, expect } from "vitest";
import { formatToolCall, type ToolCallInfo } from "../tool-call-formatter";

describe("tool-call-formatter", () => {
  describe("str_replace_editor tool", () => {
    it("formats create command correctly", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "src/components/Card.jsx",
          file_text: "export default function Card() {}",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Creating");
      expect(result.target).toBe("Card.jsx");
      expect(result.icon).toBe("file-plus");
      expect(result.color).toBe("blue");
      expect(result.detail).toContain("Card.jsx");
    });

    it("formats str_replace command correctly", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: {
          command: "str_replace",
          path: "App.jsx",
          old_str: "Hello",
          new_str: "Hi",
        },
        state: "call",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Editing");
      expect(result.target).toBe("App.jsx");
      expect(result.icon).toBe("file-edit");
      expect(result.color).toBe("amber");
    });

    it("formats insert command correctly", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: {
          command: "insert",
          path: "components/Button.jsx",
          insert_line: 10,
          new_str: "console.log('test');",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Inserting into");
      expect(result.target).toBe("Button.jsx");
      expect(result.icon).toBe("file-edit");
      expect(result.color).toBe("amber");
      expect(result.detail).toContain("line 10");
    });

    it("formats view command correctly", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: {
          command: "view",
          path: "styles.css",
        },
        state: "call",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Viewing");
      expect(result.target).toBe("styles.css");
      expect(result.icon).toBe("eye");
      expect(result.color).toBe("green");
    });

    it("formats undo_edit command correctly", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: {
          command: "undo_edit",
          path: "index.js",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Reverting");
      expect(result.target).toBe("index.js");
      expect(result.icon).toBe("undo");
      expect(result.color).toBe("purple");
    });

    it("handles unknown command gracefully", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: {
          command: "unknown_command",
          path: "test.txt",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Processing");
      expect(result.target).toBe("test.txt");
      expect(result.icon).toBe("file");
      expect(result.color).toBe("neutral");
    });

    it("extracts filename from nested path", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "src/components/ui/button/PrimaryButton.tsx",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.target).toBe("PrimaryButton.tsx");
    });

    it("handles missing path", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.target).toBe("file");
    });

    it("handles empty path", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.target).toBe("file");
    });
  });

  describe("file_manager tool", () => {
    it("formats rename command correctly", () => {
      const toolCall: ToolCallInfo = {
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "Button.jsx",
          new_path: "PrimaryButton.jsx",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Renaming");
      expect(result.target).toBe("Button.jsx → PrimaryButton.jsx");
      expect(result.icon).toBe("folder");
      expect(result.color).toBe("purple");
      expect(result.detail).toContain("→");
    });

    it("formats rename with nested paths", () => {
      const toolCall: ToolCallInfo = {
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "src/old/Component.jsx",
          new_path: "src/new/Component.jsx",
        },
        state: "call",
      };

      const result = formatToolCall(toolCall);

      expect(result.target).toBe("Component.jsx → Component.jsx");
    });

    it("formats delete command correctly", () => {
      const toolCall: ToolCallInfo = {
        toolName: "file_manager",
        args: {
          command: "delete",
          path: "unused/OldComponent.jsx",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Deleting");
      expect(result.target).toBe("OldComponent.jsx");
      expect(result.icon).toBe("trash");
      expect(result.color).toBe("red");
    });

    it("handles unknown file_manager command", () => {
      const toolCall: ToolCallInfo = {
        toolName: "file_manager",
        args: {
          command: "copy",
          path: "test.txt",
        },
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Managing");
      expect(result.icon).toBe("folder");
      expect(result.color).toBe("neutral");
    });
  });

  describe("unknown tools", () => {
    it("handles unknown tool gracefully", () => {
      const toolCall: ToolCallInfo = {
        toolName: "unknown_tool",
        args: {},
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Running");
      expect(result.target).toBe("unknown_tool");
      expect(result.icon).toBe("file");
      expect(result.color).toBe("neutral");
    });
  });

  describe("error handling", () => {
    it("handles errors gracefully", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: null as any, // Force error
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result.action).toBe("Processing");
      expect(result.target).toBe("file");
      expect(result.icon).toBe("file");
      expect(result.color).toBe("neutral");
    });

    it("handles missing args object", () => {
      const toolCall: ToolCallInfo = {
        toolName: "str_replace_editor",
        args: undefined as any,
        state: "result",
      };

      const result = formatToolCall(toolCall);

      expect(result).toBeDefined();
      expect(result.action).toBeDefined();
      expect(result.target).toBeDefined();
    });
  });
});
