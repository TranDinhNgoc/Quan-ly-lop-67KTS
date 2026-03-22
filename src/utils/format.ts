/**
 * Formats a date string from YYYY-MM-DD to DD-MM-YYYY
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '---';
  
  // Handle ISO strings or YYYY-MM-DD
  const datePart = dateString.split('T')[0];
  const parts = datePart.split('-');
  
  if (parts.length !== 3) return dateString;
  
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};
