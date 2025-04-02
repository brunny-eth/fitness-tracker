// client/src/components/ui/TimeZoneSelector.jsx
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Label } from './label';

export const TimeZoneSelector = () => {
  const [timezone, setTimezone] = useState('');
  const [saving, setSaving] = useState(false);
  const { user, updateUserData } = useAuth();

  // Get the current timezone on component mount
  useEffect(() => {
    // Set to browser's timezone by default
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(user?.timezone || browserTimezone);
  }, [user]);

  const handleTimezoneChange = async (e) => {
    const newTimezone = e.target.value;
    setTimezone(newTimezone);
    setSaving(true);
    
    try {
      // Save the timezone preference to the server
      const updatedUser = await api.post('/api/user/timezone', { timezone: newTimezone });
      
      // Update the user context
      if (updateUserData) {
        updateUserData({ ...user, timezone: newTimezone });
      }
      
      // Show success feedback
      alert('Timezone updated successfully!');
    } catch (error) {
      console.error('Failed to update timezone:', error);
      alert('Failed to update timezone. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4">
      <Label htmlFor="timezone" className="block mb-2">Your Timezone</Label>
      <select
        id="timezone"
        value={timezone}
        onChange={handleTimezoneChange}
        className="w-full p-2 border rounded"
        disabled={saving}
      >
        <option value="UTC">UTC (Coordinated Universal Time)</option>
        <option value="America/New_York">Eastern Time (US & Canada)</option>
        <option value="America/Chicago">Central Time (US & Canada)</option>
        <option value="America/Denver">Mountain Time (US & Canada)</option>
        <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
        <option value="America/Anchorage">Alaska (US)</option>
        <option value="Pacific/Honolulu">Hawaii (US)</option>
        <option value="Europe/London">London, Edinburgh</option>
        <option value="Europe/Paris">Paris, Berlin, Rome, Madrid</option>
        <option value="Asia/Tokyo">Tokyo, Seoul</option>
        <option value="Australia/Sydney">Sydney, Melbourne</option>
      </select>
      {saving && <p className="text-sm text-gray-500 mt-1">Saving...</p>}
    </div>
  );
};