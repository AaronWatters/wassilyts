import { describe, expect, it } from 'vitest';
import { 
  diagram
 } from '../src/index';

describe('diagram module', () => {
  it('should create a diagram', () => {
    expect(diagram).toBeDefined();
    const container = document.createElement('div');
    const diag = new diagram.Diagram(container, 120, 100);
    expect(diag).toBeDefined();
    expect(diag.container).toBe(container);
    expect(diag.width).toBe(120);
    expect(diag.height).toBe(100);
    expect(diag.canvas).toBeDefined();
    expect(diag.ctx).toBeDefined();
    expect(diag.stats).toBeDefined();
  });
  it('should clear the diagram', () => {
    const container = document.createElement('div');
    const diag = new diagram.Diagram(container, 120, 100);
    diag.clear();
    expect(diag.stats.minxy).toBeNull();
    expect(diag.stats.maxxy).toBeNull();
    const ctx = diag.ctx!;
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 120, 100);
  });
  it('should add a point to the diagram', () => {
    const container = document.createElement('div');
    const diag = new diagram.Diagram(container, 120, 100);
    diag.addPoint([3, 4]);
    diag.addxy(2, 6);
    expect(diag.stats.minxy).toEqual([2, 4]);
    expect(diag.stats.maxxy).toEqual([3, 6]);
  });
  it('should reset stats', () => {
    const container = document.createElement('div');
    const diag = new diagram.Diagram(container, 120, 100);
    diag.addPoint([3, 4]);
    diag.addxy(2, 6);
    diag.resetStats();
    expect(diag.stats.minxy).toBeNull();
    expect(diag.stats.maxxy).toBeNull();
  });
  it('should detect overlapping stats', () => {
    const stats1 = new diagram.CanvasStats();
    stats1.addxy(0, 2);
    stats1.addxy(2, 0);
    const stats2 = new diagram.CanvasStats();
    stats2.addxy(1, 1);
    stats2.addxy(3, 3);
    expect(stats1.overlaps(stats2)).toBe(true);
    const stats3 = new diagram.CanvasStats();
    stats3.addxy(3, 3);
    stats3.addxy(4, 4);
    expect(stats1.overlaps(stats3)).toBe(false);
  });
});