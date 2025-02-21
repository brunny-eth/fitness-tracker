
import React, { useState } from 'react';

export function Tabs({ defaultValue, children, value, onValueChange, ...props }) {
  const [activeTab, setActiveTab] = useState(defaultValue || value);
  
  const handleTabChange = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setActiveTab(newValue);
    }
  };
  
  const currentValue = value !== undefined ? value : activeTab;
  
  // Clone children and add props for controlled component behavior
  const enhancedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    
    if (child.type === TabsList || child.type === TabsContent) {
      return React.cloneElement(child, {
        value: currentValue,
        onValueChange: handleTabChange,
        ...child.props
      });
    }
    
    return child;
  });
  
  return (
    <div role="tablist" {...props}>
      {enhancedChildren}
    </div>
  );
}

export function TabsList({ children, value, onValueChange, ...props }) {
  // Clone TabsTrigger children to pass the active state and click handler
  const enhancedTriggers = React.Children.map(children, child => {
    if (!React.isValidElement(child) || child.type !== TabsTrigger) return child;
    
    return React.cloneElement(child, {
      isActive: child.props.value === value,
      onClick: () => onValueChange(child.props.value),
      ...child.props
    });
  });
  
  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600" {...props}>
      {enhancedTriggers}
    </div>
  );
}

export function TabsTrigger({ value, children, isActive, onClick, ...props }) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-white text-blue-600 shadow-sm' 
          : 'hover:bg-gray-200 hover:text-gray-900'
      }`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, activeValue, children, ...props }) {
  const isActive = value === activeValue;
  
  if (!isActive) return null;
  
  return (
    <div
      role="tabpanel"
      data-state={isActive ? 'active' : 'inactive'}
      className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      {...props}
    >
      {children}
    </div>
  );
}
