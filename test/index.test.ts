

import { describe, expect, it } from 'vitest';
import { name } from '../src/index';

describe('Basics', () => {
  it('should return the correct name', () => {
    expect(name).toBe('wassilyjs');
  });
});
