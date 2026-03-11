'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A component that listens for global Firebase errors and re-throws them
 * so they can be captured by the Next.js error overlay or error boundaries.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In development, we want to surface this error prominently.
      // Re-throwing inside a listener might not always trigger the overlay 
      // depending on the React version/Next.js setup, so we also log it 
      // in a specific format if needed, but the architecture expects this 
      // listener to handle the "contextual error" promotion.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
