import * as vector from './vector';
/**
 * A matrix represented as an array of vectors (rows)
 */
export type Matrix = vector.Vector[];
/**
 * Creates a zero matrix with n rows and m columns
 *
 * @param n - The number of rows
 * @param m - The number of columns
 * @returns A new n×m matrix filled with zeros
 */
export declare function mZero(n: number, m: number): Matrix;
/**
 * Creates a 4×4 affine transformation matrix for 3D graphics from a 3×3 rotation matrix and a translation vector
 *
 * @param rotation - A 3×3 rotation matrix, or null to use identity
 * @param translation - A 3D translation vector (default: [0,0,0])
 * @returns A 4×4 affine transformation matrix
 */
export declare function affine3d(rotation: Matrix | null, translation?: vector.Vector): Matrix;
/**
 * Gets the shape (dimensions) of a matrix as [rows, columns]
 *
 * @param M - The matrix to measure
 * @param check - If true, validates that all rows have the same number of columns (default: false)
 * @returns A tuple containing [number of rows, number of columns]
 * @throws Error if check is true and rows have inconsistent lengths
 */
export declare function Mshape(M: Matrix, check?: boolean): [number, number];
/**
 * Transposes a matrix (swaps rows and columns)
 *
 * @param M - The matrix to transpose
 * @returns A new matrix where M[i][j] becomes M[j][i]
 */
export declare function MTranspose(M: Matrix): Matrix;
/**
 * Creates an n×n identity matrix
 *
 * @param n - The size of the identity matrix
 * @returns An n×n identity matrix (1s on diagonal, 0s elsewhere)
 */
export declare function eye(n: number, scalar?: number): Matrix;
export declare function Mscale(scalar: number, M: Matrix): Matrix;
/**
 * Computes the matrix-vector product M·v
 *
 * @param M - The matrix
 * @param v - The vector
 * @returns A new vector resulting from the matrix-vector multiplication
 */
export declare function MvProduct(M: Matrix, v: vector.Vector): vector.Vector;
/**
 * Computes the matrix-matrix product A·B
 *
 * @param A - The first matrix
 * @param B - The second matrix
 * @returns A new matrix resulting from the matrix multiplication
 * @throws Error if the number of columns in A doesn't match the number of rows in B
 */
export declare function MMProduct(A: Matrix, B: Matrix): Matrix;
/**
 * Creates a deep copy of a matrix
 *
 * @param M - The matrix to copy
 * @returns A new matrix with the same values as M
 */
export declare function MCopy(M: Matrix): Matrix;
/**
 * Rounds matrix entries near integer values to integers (mainly for testing)
 *
 * @param M - The matrix to process
 * @param epsilon - The tolerance for rounding (default: 0.001)
 * @returns A new matrix with near-integer values rounded to integers
 */
export declare function MTolerate(M: Matrix, epsilon?: number): Matrix;
/**
 * Applies a 4×4 affine transformation matrix to a 3D vector
 *
 * @param M - The 4×4 affine transformation matrix
 * @param v - The 3D vector to transform
 * @returns A new 3D vector after applying the transformation
 */
export declare function applyAffine3d(M: Matrix, v: vector.Vector): vector.Vector;
/**
 * Flattens a matrix into a one-dimensional vector (row-major order)
 *
 * @param M - The matrix to flatten
 * @returns A vector containing all matrix elements concatenated row by row
 */
export declare function MAsList(M: Matrix): vector.Vector;
/**
 * Reshapes a one-dimensional vector into a matrix
 *
 * @param M - The vector to reshape
 * @param rows - The number of rows in the resulting matrix
 * @param cols - The number of columns in the resulting matrix
 * @returns A new rows×cols matrix
 * @throws Error if the vector length doesn't match rows × cols
 */
export declare function listAsM(M: vector.Vector, rows: number, cols: number): Matrix;
/**
 * Swaps two rows in a matrix
 *
 * @param M - The matrix to modify
 * @param i - The index of the first row
 * @param j - The index of the second row
 * @param inplace - If true, modifies M directly; if false, creates a copy (default: false)
 * @returns The matrix with rows i and j swapped
 */
export declare function MswapRows(M: Matrix, i: number, j: number, inplace?: boolean): Matrix;
/**
 * Adjoins (horizontally concatenates) two matrices side by side
 *
 * @param M1 - The first matrix
 * @param M2 - The second matrix
 * @returns A new matrix [M1 | M2] with M1's columns followed by M2's columns
 * @throws Error if M1 and M2 have different numbers of rows
 */
export declare function MAdjoin(M1: Matrix, M2: Matrix): Matrix;
/**
 * Extracts a submatrix from a matrix (similar to NumPy slicing)
 *
 * @param M - The source matrix
 * @param minrow - The starting row index (inclusive)
 * @param maxrow - The ending row index (exclusive)
 * @param mincol - The starting column index (inclusive)
 * @param maxcol - The ending column index (exclusive)
 * @returns A new matrix containing M[minrow:maxrow, mincol:maxcol]
 */
export declare function Mslice(M: Matrix, minrow: number, maxrow: number, mincol: number, maxcol: number): Matrix;
/**
 * Performs row echelon reduction (Gaussian elimination) on a matrix
 *
 * @param M - The matrix to reduce
 * @returns A new matrix in row echelon form
 */
export declare function MRowEchelon(M: Matrix): Matrix;
/**
 * Computes the inverse of a square matrix using row echelon reduction
 *
 * @param M - The matrix to invert
 * @returns The inverse matrix M⁻¹
 * @throws Error if the matrix is not square
 */
export declare function MInverse(M: Matrix): Matrix;
/**
 * Creates a 3D rotation matrix for yaw (rotation around the z-axis)
 *
 * @param angle - The yaw angle in radians
 * @returns A 3×3 rotation matrix for yaw
 */
export declare function yaw(angle: number): Matrix;
/**
 * Creates a 3D rotation matrix for roll (rotation around the x-axis)
 *
 * @param angle - The roll angle in radians
 * @returns A 3×3 rotation matrix for roll
 */
export declare function roll(angle: number): Matrix;
/**
 * Creates a 3D rotation matrix for pitch (rotation around the y-axis)
 *
 * @param angle - The pitch angle in radians
 * @returns A 3×3 rotation matrix for pitch
 */
export declare function pitch(angle: number): Matrix;
/**
 * @deprecated Use {@link yaw} instead. Mroll will be removed in a future version.
 */
export declare const Mroll: typeof yaw;
/**
 * @deprecated Use {@link roll} instead. Myaw will be removed in a future version.
 */
export declare const Myaw: typeof roll;
/**
 * @deprecated Use {@link pitch} instead. Mpitch will be removed in a future version.
 */
export declare const Mpitch: typeof pitch;
//# sourceMappingURL=matrix.d.ts.map