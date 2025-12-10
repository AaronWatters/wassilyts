import { vi } from "vitest";

const fakeMeasureText = {
  width: 100,
  actualBoundingBoxAscent: 80,
  actualBoundingBoxDescent: 10,
  actualBoundingBoxLeft: 5,
  actualBoundingBoxRight: 100,
};

global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({})),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => (fakeMeasureText)),
}) as unknown as CanvasRenderingContext2D);


class MockPath2D {
  constructor(path?: string | Path2D) {}
  addPath() {}
  rect() {}
  arc() {}
  moveTo() {}
  lineTo() {}
  closePath() {}
}

global.Path2D = MockPath2D as any;
