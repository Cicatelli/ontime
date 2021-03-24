export const clamp = (num, a, b) =>
  Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));