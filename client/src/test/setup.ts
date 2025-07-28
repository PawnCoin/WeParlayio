import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  observe(target: Element, options?: ResizeObserverOptions): void {}
  unobserve(target: Element): void {}
  disconnect(): void {}
};

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor(url: string) {}
  close() {}
  send() {}
} as any;

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = vi.fn();
}