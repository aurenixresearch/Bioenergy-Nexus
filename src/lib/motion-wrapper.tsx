import React from 'react';

// Re-export everything from the underlying framer-motion library
export * from 'framer-motion';

/**
 * Custom safe AnimatePresence component for React 19.
 * 
 * In React 19, the standard AnimatePresence component can trigger a fatal
 * "Expected static flag was missing. Please notify the React team" assertion crash
 * inside the React fiber reconciler when elements are unmounted during layout effects.
 * 
 * This lightweight wrapper bypasses the unmounting suspension, rendering children
 * directly to ensure application stability and prevent crash screens.
 */
export function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
