// client/src/components/ui/label.jsx

import React from 'react';

export function Label({ className, children, ...props }) {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
