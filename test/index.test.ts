

import { describe, expect, it } from 'vitest';
import { 
  name,
  tsvector
 } from '../src/index';

describe('Basics', () => {
  it('should return the correct name', () => {
    expect(name).toBe('wassilyjs');
  });
  it('should expose tsVector', () => {
    expect(tsvector).toBeDefined();
  });
  it('should expose tsVector functions', () => {
    const ln = tsvector.vLength([3, 4]);
    expect(ln).toBe(5);
  });
});
