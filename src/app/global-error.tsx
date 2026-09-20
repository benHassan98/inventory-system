'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
