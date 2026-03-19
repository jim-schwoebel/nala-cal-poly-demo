import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MicButton } from "./mic-button";

describe("MicButton", () => {
  it("renders with mic icon", () => {
    render(<MicButton isRecording={false} onClick={vi.fn()} disabled={false} />);
    expect(screen.getByRole("button", { name: /mic/i })).toBeDefined();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<MicButton isRecording={false} onClick={onClick} disabled={false} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("shows recording state", () => {
    const { container } = render(
      <MicButton isRecording={true} onClick={vi.fn()} disabled={false} />
    );
    expect(container.querySelector(".mic-button--recording")).not.toBeNull();
  });

  it("is disabled when disabled prop is true", () => {
    render(<MicButton isRecording={false} onClick={vi.fn()} disabled={true} />);
    expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  });
});
