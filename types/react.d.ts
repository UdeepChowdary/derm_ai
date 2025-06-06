import React from 'react';

declare module 'react' {
  interface ReactInstance {
    use<T>(promise: Promise<T>): T;
  }

  namespace React {
    /**
     * React.use is a hook to unwrap promises in React components.
     * This is a Next.js 13+ feature for server components.
     */
    function use<T>(promise: Promise<T>): T;
  }
}
