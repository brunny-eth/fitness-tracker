// client/src/components/ui/TimeZoneSelector.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from './card';
import { Button } from './button';
import { Label } from './label';

const TimeZoneSelector = () => {
  const { user, updateUser } = useAuth();
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Common time zones - you can expand this list
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'Europe/London', label: 'GMT/BST (UK)' },
    { value: 'Europe/Paris', label: 'CET (Central European Time)' },
    { value: 'Asia/Tokyo', label: 'JST (Japan)' },
    { value: 'Australia/Sydney', label: 'AEST (Eastern Australia)' }
  ];

  useEffect(() => {
    // Set the initial value based on the user's current setting
    if (user && user.timezone) {
      setSelectedTimezone(user.timezone);
    } else {
      // Try to get the browser's time zone as a default
      try {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setSelectedTimezone(browserTimezone);
      } catch (e) {
        // Fallback to a common timezone if browser detection fails
        setSelectedTimezone('America/New_York');
      }
    }
  }, [user]);

  const handleSaveTimeZone = async () => {
    if (!selectedTimezone) return;
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await api.post('/api/user/timezone', { timezone: selectedTimezone });
      
      // If your auth context has a method to update the user locally, use it
      if (updateUser) {
        updateUser({ ...user, timezone: selectedTimezone });
      }
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error setting timezone:', err);
      setError('Failed to update time zone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Time Zone Setting</h3>
      <p className="text-sm text-gray-500 mb-4">
        Set your local time zone to ensure your daily tracking aligns with your day.
      </p>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-50 text-green-700 rounded">
          Time zone updated successfully!
        </div>
      )}
      
      <div className="mb-4">
        <Label htmlFor="timezone">Your Time Zone</Label>
        <select
          id="timezone"
          value={selectedTimezone}
          onChange={(e) => setSelectedTimezone(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>
      
      <Button 
        onClick={handleSaveTimeZone} 
        disabled={loading || !selectedTimezone}
      >
        {loading ? 'Saving...' : 'Save Time Zone'}
      </Button>
    </Card>
  );
};

export default TimeZoneSelector;