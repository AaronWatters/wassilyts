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
});