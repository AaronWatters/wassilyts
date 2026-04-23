
import * as tsvector from "tsvector";

/**
 * Calculate "nice" tick values for a given range and maximum number of ticks.
 * 
 * @param lowerbound 
 * @param upperbound 
 * @param maxticks 
 * @returns [anchor, niceStep, offset, ticks]
 */
export function ticklist(
  lowerbound: number,
  upperbound: number,
  maxticks: number
): [number, number, number, number[]] {
  if (maxticks < 2) {
    throw new Error("maxticks must be >= 2");
  }
  if (lowerbound === upperbound) {
    return [lowerbound, 0, 0, [lowerbound]];
  }

  const span = upperbound - lowerbound;

  if (span <= 0) {
    throw new Error("upperbound must be greater than lowerbound");
  }

  const epsilon = span * 1e-12;

  // Step 1: raw step size
  const rawStep = span / (maxticks - 1);

  // Step 2: round to a "nice" number (1, 2, 5 × 10^n)
  const niceStep = niceNumber(rawStep);

  // Step 3: compute anchor (first tick ≤ lowerbound)
  const anchor = Math.floor(lowerbound / niceStep) * niceStep;

  // Step 4: generate ticks
  const ticks: number[] = [];
  let t = anchor;
  const maxIter = 10000; // safety guard

  for (let i = 0; i < maxIter; i++) {
    if (t > upperbound + epsilon) break;
    if (t >= lowerbound - epsilon) {
      ticks.push(roundTo(t, niceStep));
    }
    t += niceStep;
  }

  // Step 5: offset = how many steps from anchor to first tick ≥ lowerbound
  const offset = Math.ceil((lowerbound - anchor) / niceStep);

  return [anchor, niceStep, offset, ticks];
};

// --- helpers ---

function niceNumber(x: number): number {
  const exp = Math.floor(Math.log10(x));
  const f = x / Math.pow(10, exp);

  let nf: number;
  if (f <= 1) nf = 1;
  else if (f <= 2) nf = 2;
  else if (f <= 5) nf = 5;
  else nf = 10;

  return nf * Math.pow(10, exp);
};

function roundTo(x: number, step: number): number {
  const precision = Math.max(0, -Math.floor(Math.log10(step)) + 2);
  return Number(x.toFixed(precision));
};

export function rotation2dRadians(radians: number): tsvector.Matrix {
  const cosTheta = Math.cos(radians);
  const sinTheta = Math.sin(radians);
  return [
      [cosTheta, -sinTheta],
      [sinTheta, cosTheta]
  ];
};

export function rotation2dDegrees(degrees: number): tsvector.Matrix {
  const radians = (degrees * Math.PI) / 180.0;
  return rotation2dRadians(radians);
};

export function rotate2dDegrees(vector: tsvector.Vector, degrees: number): tsvector.Vector {
  const rotationMatrix = rotation2dDegrees(degrees);
  return tsvector.MvProduct(rotationMatrix, vector);
}

export function vectorToAngleRadians(vector: tsvector.Vector): number {
  return Math.atan2(vector[1], vector[0]);
};

export function vectorToAngleDegrees(vector: tsvector.Vector): number {
  const radians = vectorToAngleRadians(vector);
  return (radians * 180.0) / Math.PI;
};
