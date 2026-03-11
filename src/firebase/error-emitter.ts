'use client';

import { EventEmitter } from 'events';

/**
 * A global singleton event emitter for handling Firebase-related errors
 * throughout the application.
 */
export const errorEmitter = new EventEmitter();
