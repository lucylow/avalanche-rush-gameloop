// Error Boundary Utility Functions
// These utilities are separated to avoid React Fast Refresh warnings
import React from 'react';

export const getCurrentUserId = (): string | null => {
  // Implement user ID retrieval logic
  // This could come from authentication context, localStorage, etc.
  return localStorage.getItem('userId') || null;
};

export const getSessionId = (): string => {
  // Generate or retrieve session ID
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const getPreviousErrors = (): string[] => {
  // Get list of previous errors in this session
  const errors = sessionStorage.getItem('errorHistory');
  return errors ? JSON.parse(errors) : [];
};

export const updateErrorHistory = (errorId: string) => {
  const errors = getPreviousErrors();
  errors.push(errorId);
  
  // Keep only last 10 errors
  if (errors.length > 10) {
    errors.splice(0, errors.length - 10);
  }
  
  sessionStorage.setItem('errorHistory', JSON.stringify(errors));
};

// Note: withErrorBoundary HOC removed to avoid TypeScript parsing issues
// Use ErrorBoundary component directly in JSX instead

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: Partial<React.ErrorInfo>) => {
    // Create a synthetic error event to trigger the error boundary
    const syntheticError = new Error(error.message);
    syntheticError.stack = error.stack;
    
    // This will be caught by the nearest error boundary
    throw syntheticError;
  };

  return { handleError };
};
