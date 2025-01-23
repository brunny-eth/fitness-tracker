// src/components/ui/tabs.jsx
import React from 'react';

export function Tabs({ defaultValue, children, ...props }) {
  return (
    <div role="tablist" {...props}>
      {children}
    </div>
  );
}

export function TabsList({ children, ...props }) {
  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground" {...props}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, ...props }) {
  return (
    <button
      role="tab"
      className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, ...props }) {
  return (
    <div
      role="tabpanel"
      className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      {...props}
    >
      {children}
    </div>
  );
}