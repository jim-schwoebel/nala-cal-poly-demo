import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Waveform } from "./waveform";

describe("Waveform", () => {
  it("renders canvas when mode is recording", () => {
    const { container } = render(<Waveform mode="recording" analyserNode={null} />);
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("renders pulse animation when mode is thinking", () => {
    const { container } = render(<Waveform mode="thinking" analyserNode={null} />);
    expect(container.querySelector(".waveform--thinking")).not.toBeNull();
  });

  it("renders nothing when mode is idle", () => {
    const { container } = render(<Waveform mode="idle" analyserNode={null} />);
    expect(container.querySelector(".waveform")).toBeNull();
  });
});
