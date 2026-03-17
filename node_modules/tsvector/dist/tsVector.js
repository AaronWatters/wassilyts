function L(t, r) {
  return t + r;
}
function R(t, r) {
  return t - r;
}
function f(t) {
  return Array(t).fill(0);
}
function p(t, r) {
  let n = f(t.length);
  for (let e = 0; e < t.length; e++)
    n[e] = t[e] + r[e];
  return n;
}
function Z(t, r) {
  let n = f(t.length);
  for (let e = 0; e < t.length; e++)
    n[e] = Math.min(t[e], r[e]);
  return n;
}
function q(t, r) {
  let n = f(t.length);
  for (let e = 0; e < t.length; e++)
    n[e] = Math.max(t[e], r[e]);
  return n;
}
function v(t, r) {
  let n = f(r.length);
  for (let e = 0; e < r.length; e++)
    n[e] = t * r[e];
  return n;
}
function M(t, r) {
  return p(t, v(-1, r));
}
function B(t, r) {
  let n = f(t.length);
  for (let e = 0; e < t.length; e++)
    n[e] = t[e] * r[e];
  return n;
}
function D(t, r) {
  let n = f(t.length);
  for (let e = 0; e < t.length; e++)
    n[e] = t[e] / r[e];
  return n;
}
function N(t, r) {
  return t.reduce((n, e, l) => n + e * r[l], 0);
}
function g(t) {
  return Math.sqrt(t.reduce((r, n) => r + n * n, 0));
}
function P(t) {
  return v(1 / g(t), t);
}
function $(t, r = 1e-6) {
  return g(t) < r;
}
function S(t, r, n = 1e-6) {
  return $(M(t, r), n);
}
function T(t, r) {
  const [n, e, l] = t, [o, s, i] = r;
  return [
    e * i - l * s,
    l * o - n * i,
    n * s - e * o
  ];
}
function h(t, r) {
  return Array(t).fill(0).map(() => f(r));
}
function k(t, r = [0, 0, 0]) {
  t === null && (t = w(3));
  let n = h(4, 4);
  for (let e = 0; e < 3; e++) {
    for (let l = 0; l < 3; l++)
      n[e][l] = t[e][l];
    n[e][3] = r[e];
  }
  return n[3][3] = 1, n;
}
function c(t, r = !1) {
  let n = t.length, e = t[0].length;
  if (r) {
    for (let l = 1; l < n; l++)
      if (t[l].length !== e)
        throw new Error(`Row ${l} has ${t[l].length} columns, expected ${e}`);
  }
  return [t.length, t[0].length];
}
function z(t) {
  const [r, n] = c(t);
  let e = h(n, r);
  for (let l = 0; l < r; l++)
    for (let o = 0; o < n; o++)
      e[o][l] = t[l][o];
  return e;
}
function w(t, r = 1) {
  let n = h(t, t);
  for (let e = 0; e < t; e++)
    n[e][e] = r;
  return n;
}
function j(t, r) {
  let n = f(t.length);
  for (let e = 0; e < t.length; e++)
    for (let l = 0; l < t[e].length; l++)
      n[e] += t[e][l] * r[l];
  return n;
}
function I(t, r) {
  const [n, e] = c(t), [l, o] = c(r);
  if (e !== l)
    throw new Error(`Matrix A has ${e} columns, Matrix B has ${l} rows. Cannot multiply.`);
  let s = h(n, o);
  for (let i = 0; i < n; i++)
    for (let u = 0; u < o; u++)
      for (let a = 0; a < e; a++)
        s[i][u] += t[i][a] * r[a][u];
  return s;
}
function d(t) {
  return t.map((r) => r.slice());
}
function F(t, r = 1e-3) {
  return t.map((n) => n.map((e) => Math.abs(e - Math.round(e)) < r ? Math.round(e) : e));
}
function G(t, r) {
  return j(t, r.concat(1)).slice(0, 3);
}
function H(t) {
  return t.reduce((r, n) => r.concat(n), []);
}
function J(t, r, n) {
  if (t.length !== r * n)
    throw new Error(`List length ${t.length} does not match ${r}x${n} matrix`);
  let e = h(r, n);
  for (let l = 0; l < r; l++)
    for (let o = 0; o < n; o++)
      e[l][o] = t[l * n + o];
  return e;
}
function m(t, r, n, e = !1) {
  let l = t;
  e || (l = d(t));
  let o = l[r];
  return l[r] = l[n], l[n] = o, l;
}
function y(t, r) {
  const [n, e] = c(t), [l, o] = c(r);
  if (n !== l)
    throw new Error(`Matrix M1 has ${n} rows, Matrix M2 has ${l} rows. Cannot adjoin.`);
  let s = h(n, e + o);
  for (let i = 0; i < n; i++) {
    for (let u = 0; u < e; u++)
      s[i][u] = t[i][u];
    for (let u = 0; u < o; u++)
      s[i][e + u] = r[i][u];
  }
  return s;
}
function A(t, r, n, e, l) {
  let o = h(n - r, l - e);
  for (let s = r; s < n; s++)
    for (let i = e; i < l; i++)
      o[s - r][i - e] = t[s][i];
  return o;
}
function E(t) {
  let r = d(t), [n, e] = c(r), l = 0;
  for (let o = 0; o < n; o++) {
    if (e <= l)
      return r;
    let s = o;
    for (; r[s][l] === 0; )
      if (s++, n === s && (s = o, l++, e === l))
        return r;
    r = m(r, s, o);
    let i = r[o][l];
    r[o] = r[o].map((u) => u / i);
    for (let u = 0; u < n; u++)
      u !== o && (i = r[u][l], r[u] = M(r[u], v(i, r[o])));
    l++;
  }
  return r;
}
function K(t) {
  let [r, n] = c(t);
  if (r !== n)
    throw new Error("Matrix is not square, cannot invert.");
  let e = y(t, w(r));
  return e = E(e), A(e, 0, r, r, 2 * r);
}
function x(t) {
  var r = Math.cos(t), n = Math.sin(t);
  return [
    [r, -n, 0],
    [n, r, 0],
    [0, 0, 1]
  ];
}
function C(t) {
  var r = Math.cos(t), n = Math.sin(t);
  return [
    [1, 0, 0],
    [0, r, n],
    [0, -n, r]
  ];
}
function b(t) {
  var r = Math.cos(t), n = Math.sin(t);
  return [
    [r, 0, n],
    [0, 1, 0],
    [-n, 0, r]
  ];
}
const O = x, Q = C, U = b;
export {
  y as MAdjoin,
  H as MAsList,
  d as MCopy,
  K as MInverse,
  I as MMProduct,
  E as MRowEchelon,
  F as MTolerate,
  z as MTranspose,
  U as Mpitch,
  O as Mroll,
  c as Mshape,
  A as Mslice,
  m as MswapRows,
  j as MvProduct,
  Q as Myaw,
  L as add,
  k as affine3d,
  G as applyAffine3d,
  w as eye,
  J as listAsM,
  h as mZero,
  b as pitch,
  C as roll,
  R as subtract,
  p as vAdd,
  S as vClose,
  T as vCross,
  D as vDiv,
  N as vDot,
  g as vLength,
  q as vMax,
  Z as vMin,
  B as vMul,
  $ as vNearlyZero,
  P as vNormalize,
  v as vScale,
  M as vSub,
  f as vZero,
  x as yaw
};
