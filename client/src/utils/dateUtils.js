// client/src/utils/dateUtils.js

/**
 * Get the current date in the user's timezone
 * @param {string} timezone - The user's timezone (e.g., 'America/New_York')
 * @returns {Date} - Current date in the user's timezone
 */
export const getCurrentDateInTimezone = (timezone = 'UTC') => {
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
  export const isToday = (date, timezone = 'UTC') => {
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
   * Convert a date to the start of day in the user's timezone
   * This is useful for creating date ranges for querying data
   * @param {Date} date - The date to convert
   * @param {string} timezone - The user's timezone
   * @returns {Date} - Date at 00:00:00 in the user's timezone
   */
  export const startOfDay = (date, timezone = 'UTC') => {
    try {
      // Convert to the user's timezone first
      const dateInTimezone = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
      
      // Set to start of day (00:00:00)
      dateInTimezone.setHours(0, 0, 0, 0);
      
      return dateInTimezone;
    } catch (error) {
      console.error('Error converting to start of day:', error);
      
      // Fallback: just set hours to 0 in whatever timezone we're in
      const fallbackDate = new Date(date);
      fallbackDate.setHours(0, 0, 0, 0);
      return fallbackDate;
    }
  };
  
  /**
   * Convert a date to the end of day in the user's timezone
   * This is useful for creating date ranges for querying data
   * @param {Date} date - The date to convert
   * @param {string} timezone - The user's timezone
   * @returns {Date} - Date at 23:59:59 in the user's timezone
   */
  export const endOfDay = (date, timezone = 'UTC') => {
    try {
      // Convert to the user's timezone first
      const dateInTimezone = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
      
      // Set to end of day (23:59:59.999)
      dateInTimezone.setHours(23, 59, 59, 999);
      
      return dateInTimezone;
    } catch (error) {
      console.error('Error converting to end of day:', error);
      
      // Fallback: just set hours to 23:59:59.999 in whatever timezone we're in
      const fallbackDate = new Date(date);
      fallbackDate.setHours(23, 59, 59, 999);
      return fallbackDate;
    }
  };
  
  /**
   * Format a date for display in the user's timezone
   * @param {string|Date} date - The date to format
   * @param {string} timezone - The user's timezone
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date, timezone = 'UTC') => {
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