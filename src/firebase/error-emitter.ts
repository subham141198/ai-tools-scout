
'use client';

type Listener = (...args: any[]) => void;

/**
 * A lightweight Event Emitter for client-side Firebase error handling.
 * Replaces Node.js 'events' to prevent chunk loading issues in some environments.
 */
class SimpleEventEmitter {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, listener: Listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  off(event: string, listener: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(l => {
      try {
        l(...args);
      } catch (e) {
        console.error('Error in listener:', e);
      }
    });
  }
}

export const errorEmitter = new SimpleEventEmitter();
