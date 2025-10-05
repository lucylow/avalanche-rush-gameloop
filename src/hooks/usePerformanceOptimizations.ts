import { memo, useMemo, useCallback, lazy, Suspense } from 'react';

// Performance utility exports
export {
  memo,
  useMemo,
  useCallback,
  lazy,
  Suspense
};

// Simple performance hooks
export const useStableCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: React.DependencyList
): T => {
  return useCallback(callback, dependencies);
};

export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(calculation, dependencies);
};