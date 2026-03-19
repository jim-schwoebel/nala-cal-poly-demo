import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelLoader } from "./model-loader";

describe("ModelLoader", () => {
  it("shows progress bar", () => {
    render(<ModelLoader progress={0.5} error={null} />);
    expect(screen.getByRole("progressbar")).toBeDefined();
  });

  it("shows error message with retry", () => {
    render(<ModelLoader progress={0} error="WebGPU not supported" />);
    expect(screen.getByText(/WebGPU not supported/)).toBeDefined();
  });

  it("shows loading text", () => {
    render(<ModelLoader progress={0.3} error={null} />);
    expect(screen.getByText(/loading/i)).toBeDefined();
  });
});
