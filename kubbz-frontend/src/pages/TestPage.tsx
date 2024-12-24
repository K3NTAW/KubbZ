import React from 'react';

export function TestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-500">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">Test Page</h1>
        <p className="mt-4 text-gray-600">If you can see this, React is working!</p>
      </div>
    </div>
  );
}
