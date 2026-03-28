/**
 * Development-only logging utility
 * In production, these logs are no-ops (faster, no console overhead)
 */
const isDev = process.env.NODE_ENV === 'development';

export const devLog = (...args: any[]) => {
  if (isDev) console.log(...args);
};

export const devWarn = (...args: any[]) => {
  if (isDev) console.warn(...args);
};

export const devError = (...args: any[]) => {
  // Always log errors, even in production
  console.error(...args);
};
