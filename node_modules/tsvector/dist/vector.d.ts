/**
 * A vector represented as an array of numbers
 */
export type Vector = number[];
/**
 * Creates a zero vector of length n
 *
 * @param n - The length of the vector to create
 * @returns A new vector of length n filled with zeros
 */
export declare function vZero(n: number): Vector;
/**
 * Adds two vectors element-wise
 *
 * @param a - The first vector
 * @param b - The second vector
 * @returns A new vector where each element is the sum of corresponding elements from a and b
 */
export declare function vAdd(a: Vector, b: Vector): Vector;
/**
 * Computes the element-wise minimum of two vectors
 *
 * @param a - The first vector
 * @param b - The second vector
 * @returns A new vector where each element is the minimum of corresponding elements from a and b
 */
export declare function vMin(a: Vector, b: Vector): Vector;
/**
 * Computes the element-wise maximum of two vectors
 *
 * @param a - The first vector
 * @param b - The second vector
 * @returns A new vector where each element is the maximum of corresponding elements from a and b
 */
export declare function vMax(a: Vector, b: Vector): Vector;
/**
 * Multiplies a vector by a scalar value
 *
 * @param a - The scalar value to multiply by
 * @param b - The vector to scale
 * @returns A new vector where each element is multiplied by the scalar a
 */
export declare function vScale(a: number, b: Vector): Vector;
/**
 * Subtracts one vector from another element-wise
 *
 * @param a - The vector to subtract from
 * @param b - The vector to subtract
 * @returns A new vector representing a - b
 */
export declare function vSub(a: Vector, b: Vector): Vector;
/**
 * Multiplies two vectors element-wise (Hadamard product)
 *
 * @param a - The first vector
 * @param b - The second vector
 * @returns A new vector where each element is the product of corresponding elements from a and b
 */
export declare function vMul(a: Vector, b: Vector): Vector;
/**
 * Divides two vectors element-wise
 *
 * @param a - The dividend vector
 * @param b - The divisor vector
 * @returns A new vector where each element is the quotient of corresponding elements from a and b
 */
export declare function vDiv(a: Vector, b: Vector): Vector;
/**
 * Computes the dot product (inner product) of two vectors
 *
 * @param a - The first vector
 * @param b - The second vector
 * @returns The scalar dot product of a and b
 */
export declare function vDot(a: Vector, b: Vector): number;
/**
 * Calculates the Euclidean length (L2 norm) of a vector
 *
 * @param a - The vector to measure
 * @returns The Euclidean length of the vector
 */
export declare function vLength(a: Vector): number;
/**
 * Normalizes a vector to unit length (length 1.0) in Euclidean norm
 *
 * @param a - The vector to normalize
 * @returns A new vector in the same direction as a with length 1.0
 */
export declare function vNormalize(a: Vector): Vector;
/**
 * Tests whether a vector is nearly the zero vector within a tolerance
 *
 * @param a - The vector to test
 * @param epsilon - The tolerance threshold (default: 1e-6)
 * @returns True if the vector's length is less than epsilon, false otherwise
 */
export declare function vNearlyZero(a: Vector, epsilon?: number): boolean;
/**
 * Tests whether two vectors are very close within a tolerance
 *
 * @param a - The first vector
 * @param b - The second vector
 * @param epsilon - The tolerance threshold (default: 1e-6)
 * @returns True if the vectors are within epsilon distance of each other, false otherwise
 */
export declare function vClose(a: Vector, b: Vector, epsilon?: number): boolean;
/**
 * Computes the 3D cross product of two 3D vectors
 *
 * @param a - The first 3D vector
 * @param b - The second 3D vector
 * @returns A new 3D vector perpendicular to both a and b
 */
export declare function vCross(a: Vector, b: Vector): Vector;
//# sourceMappingURL=vector.d.ts.map