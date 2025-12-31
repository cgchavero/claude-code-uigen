import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

describe("ToolCallBadge", () => {
  describe("str_replace_editor commands", () => {
    it("renders 'Creating' for create command", () => {
      render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "Card.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText(/Creating/)).toBeDefined();
      expect(screen.getByText(/Card\.jsx/)).toBeDefined();
      expect(screen.getByRole("status")).toBeDefined();
    });

    it("renders 'Editing' for str_replace command", () => {
      render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "str_replace", path: "App.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText(/Editing/)).toBeDefined();
      expect(screen.getByText(/App\.jsx/)).toBeDefined();
    });

    it("renders 'Inserting into' for insert command", () => {
      render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "insert", path: "Button.jsx", insert_line: 5 }}
          state="result"
        />
      );

      expect(screen.getByText(/Inserting into/)).toBeDefined();
      expect(screen.getByText(/Button\.jsx/)).toBeDefined();
    });

    it("renders 'Viewing' for view command", () => {
      render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "view", path: "styles.css" }}
          state="call"
        />
      );

      expect(screen.getByText(/Viewing/)).toBeDefined();
      expect(screen.getByText(/styles\.css/)).toBeDefined();
    });

    it("renders 'Reverting' for undo_edit command", () => {
      render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "undo_edit", path: "index.js" }}
          state="result"
        />
      );

      expect(screen.getByText(/Reverting/)).toBeDefined();
      expect(screen.getByText(/index\.js/)).toBeDefined();
    });
  });

  describe("file_manager commands", () => {
    it("renders 'Renaming' with arrow for rename command", () => {
      render(
        <ToolCallBadge
          toolName="file_manager"
          args={{ command: "rename", path: "old.jsx", new_path: "new.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText(/Renaming/)).toBeDefined();
      expect(screen.getByText(/old\.jsx → new\.jsx/)).toBeDefined();
    });

    it("renders 'Deleting' for delete command", () => {
      render(
        <ToolCallBadge
          toolName="file_manager"
          args={{ command: "delete", path: "unused.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText(/Deleting/)).toBeDefined();
      expect(screen.getByText(/unused\.jsx/)).toBeDefined();
    });
  });

  describe("loading states", () => {
    it("shows spinner when state is 'call'", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "test.txt" }}
          state="call"
        />
      );

      // Loader2 has animate-spin class
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeTruthy();
    });

    it("shows check icon when state is 'result'", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "test.txt" }}
          state="result"
        />
      );

      // CheckCircle2 is rendered, no spinner
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeFalsy();
    });
  });

  describe("styling", () => {
    it("applies blue color for create command", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "test.txt" }}
          state="result"
        />
      );

      const badge = container.querySelector(".bg-blue-50");
      expect(badge).toBeTruthy();
    });

    it("applies amber color for edit command", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "str_replace", path: "test.txt" }}
          state="result"
        />
      );

      const badge = container.querySelector(".bg-amber-50");
      expect(badge).toBeTruthy();
    });

    it("applies green color for view command", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "view", path: "test.txt" }}
          state="result"
        />
      );

      const badge = container.querySelector(".bg-green-50");
      expect(badge).toBeTruthy();
    });

    it("applies red color for delete command", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="file_manager"
          args={{ command: "delete", path: "test.txt" }}
          state="result"
        />
      );

      const badge = container.querySelector(".bg-red-50");
      expect(badge).toBeTruthy();
    });

    it("applies purple color for rename command", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="file_manager"
          args={{ command: "rename", path: "old.txt", new_path: "new.txt" }}
          state="result"
        />
      );

      const badge = container.querySelector(".bg-purple-50");
      expect(badge).toBeTruthy();
    });

    it("applies custom className", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "test.txt" }}
          state="result"
          className="custom-class"
        />
      );

      const badge = container.querySelector(".custom-class");
      expect(badge).toBeTruthy();
    });
  });

  describe("accessibility", () => {
    it("has role='status'", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "test.txt" }}
          state="result"
        />
      );

      const status = container.querySelector('[role="status"]');
      expect(status).toBeTruthy();
    });

    it("has aria-label with action and target", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "Card.jsx" }}
          state="result"
        />
      );

      const badge = container.querySelector('[role="status"]');
      const ariaLabel = badge?.getAttribute("aria-label");
      expect(ariaLabel).toContain("Creating");
      expect(ariaLabel).toContain("Card.jsx");
    });

    it("has title attribute with detail", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "src/Card.jsx" }}
          state="result"
        />
      );

      const badge = container.querySelector('[role="status"]');
      const title = badge?.getAttribute("title");
      expect(title).toContain("Creating new file");
      expect(title).toContain("src/Card.jsx");
    });
  });

  describe("unknown tools", () => {
    it("handles unknown tool gracefully", () => {
      render(
        <ToolCallBadge
          toolName="unknown_tool"
          args={{}}
          state="result"
        />
      );

      expect(screen.getByText(/Running/)).toBeDefined();
      expect(screen.getByText(/unknown_tool/)).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("handles missing path", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{ command: "create" }}
          state="result"
        />
      );

      const badge = container.querySelector('[role="status"]');
      expect(badge?.textContent).toContain("Creating");
      expect(badge?.textContent).toContain("file");
    });

    it("handles empty args", () => {
      const { container } = render(
        <ToolCallBadge
          toolName="str_replace_editor"
          args={{}}
          state="result"
        />
      );

      // Should not crash, renders fallback
      const status = container.querySelector('[role="status"]');
      expect(status).toBeTruthy();
    });
  });
});
