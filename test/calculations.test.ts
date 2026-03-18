import { describe, expect, it } from 'vitest';
import { ticklist } from '../src/calculations';

describe('calculations.ticklist', () => {
    it('should return a single tick when lowerbound equals upperbound', () => {
        const [anchor, niceStep, offset, ticks] = ticklist(5, 5, 5);
        expect(anchor).toBe(5);
        expect(niceStep).toBe(0);
        expect(offset).toBe(0);
        expect(ticks).toEqual([5]);
    });

    it('should throw when maxticks is less than 2', () => {
        expect(() => ticklist(0, 10, 1)).toThrow('maxticks must be >= 2');
    });

    it('should throw when upperbound is less than lowerbound', () => {
        expect(() => ticklist(10, 5, 5)).toThrow('upperbound must be greater than lowerbound');
    });

    it('should compute ticks for a simple integer range', () => {
        const [anchor, niceStep, offset, ticks] = ticklist(0, 10, 6);
        expect(niceStep).toBe(2);
        expect(anchor).toBe(0);
        expect(offset).toBe(0);
        expect(ticks).toEqual([0, 2, 4, 6, 8, 10]);
    });

    it('should compute ticks for ticklist(10.03, 10.04, 5)', () => {
        const [anchor, niceStep, offset, ticks] = ticklist(10.03, 10.04, 5);
        expect(anchor).toBe(10.025);
        expect(niceStep).toBe(0.005);
        expect(offset).toBe(1);
        expect(ticks).toEqual([10.03, 10.035, 10.04]);
    });

    it('should compute ticks for ticklist(1111, 2222, 14)', () => {
        const [anchor, niceStep, offset, ticks] = ticklist(1111, 2222, 14);
        expect(anchor).toBe(1100);
        expect(niceStep).toBe(100);
        expect(offset).toBe(1);
        expect(ticks).toEqual([1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200]);
    });
});
