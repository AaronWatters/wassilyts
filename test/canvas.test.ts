import { describe, it, expect } from "vitest";

describe("Canvas Drawing", () => {
  it("should call fillRect on the canvas context", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    expect(ctx).not.toBeNull();
    ctx?.fillRect(10, 10, 50, 50);

    expect(ctx?.fillRect).toHaveBeenCalledWith(10, 10, 50, 50);
  });
});
