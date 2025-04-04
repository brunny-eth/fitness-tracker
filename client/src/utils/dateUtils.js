// client/src/utils/dateUtils.js

/**
 * Get the user's timezone from context or defaults to browser timezone
 * @param {Object} user - The user object from AuthContext
 * @returns {string} - User's timezone
 */
export const getUserTimezone = (user) => {
  // First try to get timezone from user preferences (if logged in and set)
  if (user?.timezone) {
    return user.timezone;
  }
  
  // Fall back to browser's timezone
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting browser timezone:', error);
    return 'America/New_York'; // Default fallback
  }
};

/**
 * Get the current date in the user's timezone
 * @param {string} timezone - The user's timezone (e.g., 'America/New_York')
 * @returns {Date} - Current date in the user's timezone
 */
export const getCurrentDateInTimezone = (timezone) => {
  const date = new Date();
  
  // If no timezone is provided, return the current date in local browser time
  if (!timezone) return date;
  
  try {
    // Format the date as an ISO string with the timezone
    const dateString = date.toLocaleString('en-US', { timeZone: timezone });
    return new Date(dateString);
  } catch (error) {
    console.error('Error converting date to timezone:', error);
    return date; // Return original date if there's an error
  }
};

/**
 * Check if a date is today in the user's timezone
 * @param {string|Date} date - The date to check
 * @param {string} timezone - The user's timezone
 * @returns {boolean} - Whether the date is today in the user's timezone
 */
export const isToday = (date, timezone) => {
  if (!date) return false;
  
  // Convert the input date to a Date object if it's a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Get the current date in the user's timezone
  const today = getCurrentDateInTimezone(timezone);
  
  // Convert the input date to the user's timezone
  const convertedDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
  
  // Compare the dates (year, month, day only)
  return (
    today.getFullYear() === convertedDate.getFullYear() &&
    today.getMonth() === convertedDate.getMonth() &&
    today.getDate() === convertedDate.getDate()
  );
};

/**
 * Get start of day in the user's timezone, returned in UTC for server queries
 * @param {Date} date - The date to convert
 * @param {string} timezone - The user's timezone
 * @returns {Date} - Date at 00:00:00 in the user's timezone, converted to UTC
 */
export const getStartOfDayUTC = (date, timezone) => {
  // Convert to date object if string
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  
  // Create a formatter that will give us date parts in the user's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  
  // Get date parts in user's timezone
  const parts = formatter.formatToParts(dateObj);
  const dateParts = {};
  
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateParts[part.type] = parseInt(part.value, 10);
    }
  });
  
  // Create a date at midnight in the user's timezone, but in UTC
  const result = new Date(Date.UTC(
    dateParts.year,
    dateParts.month - 1, // JavaScript months are 0-based
    dateParts.day,
    0, 0, 0, 0
  ));
  
  return result;
};

/**
 * Get end of day in the user's timezone, returned in UTC for server queries
 * @param {Date} date - The date to convert
 * @param {string} timezone - The user's timezone
 * @returns {Date} - Date at 23:59:59.999 in the user's timezone, converted to UTC
 */
export const getEndOfDayUTC = (date, timezone) => {
  // Convert to date object if string
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  
  // Create a formatter that will give us date parts in the user's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  
  // Get date parts in user's timezone
  const parts = formatter.formatToParts(dateObj);
  const dateParts = {};
  
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateParts[part.type] = parseInt(part.value, 10);
    }
  });
  
  // Create a date at 23:59:59.999 in the user's timezone, but in UTC
  const result = new Date(Date.UTC(
    dateParts.year,
    dateParts.month - 1, // JavaScript months are 0-based
    dateParts.day,
    23, 59, 59, 999
  ));
  
  return result;
};

/**
 * Format a date for display in the user's timezone
 * @param {string|Date} date - The date to format
 * @param {string} timezone - The user's timezone
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, timezone) => {
  if (!date) return 'N/A';
  
  try {
    // Convert the date to the user's timezone
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Format using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-US', { 
      timeZone: timezone,
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
    
    return formatter.format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    
    // Fallback to basic date formatting if there's an error
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  }
};