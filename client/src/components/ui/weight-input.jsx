import React, { useState } from 'react';
import { Input } from './input';
import { Label } from './label';

const WeightInput = ({ 
  value, 
  onChange, 
  label = "Weight", 
  required = false,
  className = "",
  defaultUnit = "lb",
  onUnitChange = null
}) => {
  const [unit, setUnit] = useState(defaultUnit);
  const [displayValue, setDisplayValue] = useState(value ? (defaultUnit === 'lb' ? value * 2.20462 : value) : '');

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    if (onUnitChange) {
      onUnitChange(newUnit);
    }
    if (displayValue) {
      const kgValue = newUnit === 'kg' 
        ? displayValue 
        : displayValue * 0.453592;
      onChange(kgValue);
    }
  };

  const handleValueChange = (e) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    if (inputValue) {
      const kgValue = unit === 'kg' 
        ? parseFloat(inputValue) 
        : parseFloat(inputValue) * 0.453592;
      onChange(kgValue);
    } else {
      onChange('');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center space-x-2 text-sm">
          <button
            type="button"
            onClick={() => handleUnitChange('lb')}
            className={`px-2 py-1 rounded ${
              unit === 'lb' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            lb
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange('kg')}
            className={`px-2 py-1 rounded ${
              unit === 'kg' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            kg
          </button>
        </div>
      </div>
      <Input
        type="number"
        value={displayValue}
        onChange={handleValueChange}
        required={required}
        step="0.1"
        placeholder={`Enter weight in ${unit}`}
      />
      {displayValue && unit === 'lb' && (
        <div className="text-sm text-gray-500">
          {displayValue} lb = {(parseFloat(displayValue) * 0.453592).toFixed(1)} kg
        </div>
      )}
    </div>
  );
};

export default WeightInput; 