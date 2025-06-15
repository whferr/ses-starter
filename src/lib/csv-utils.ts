import { ContactFormData } from './types';

/**
 * Detect the delimiter used in a CSV line
 * @param line The CSV line to analyze
 * @returns The detected delimiter
 */
function detectDelimiter(line: string): string {
  const delimiters = [',', ';', '\t', '|'];
  let maxCount = 0;
  let detectedDelimiter = ',';
  
  for (const delimiter of delimiters) {
    const count = line.split(delimiter).length - 1;
    if (count > maxCount) {
      maxCount = count;
      detectedDelimiter = delimiter;
    }
  }
  
  return detectedDelimiter;
}

/**
 * Simple CSV parser that properly handles comma-separated values
 * @param csvContent The CSV content as a string
 * @returns Array of parsed contacts
 */
export const parseContactsCSV = (csvContent: string): ContactFormData[] => {
  // Split by lines and remove empty lines
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }
  
  // Detect delimiter from first line
  const delimiter = detectDelimiter(lines[0]);
  
  // Parse header row to find column indices
  const headers = parseCSVLine(lines[0], delimiter).map(header => header.trim().toLowerCase());
  
  // Find required column indices
  let nameIndex = headers.indexOf('name');
  let emailIndex = headers.indexOf('email');
  
  // If headers don't have exact matches, try to find columns that contain these words
  if (nameIndex === -1) {
    nameIndex = headers.findIndex(h => h.includes('name'));
  }
  
  if (emailIndex === -1) {
    emailIndex = headers.findIndex(h => h.includes('email'));
  }
  
  // If still not found, try to guess based on common patterns
  if (nameIndex === -1 && headers.length > 0) {
    nameIndex = 0; // First column is often name
  }
  
  if (emailIndex === -1 && headers.length > 1) {
    emailIndex = 1; // Second column is often email
  }
  
  // Optional column indices
  const companyIndex = headers.indexOf('company');
  const tagsIndex = headers.indexOf('tags');
  const typeIndex = headers.indexOf('type');
  
  // Validate required columns exist
  if (nameIndex === -1 || emailIndex === -1) {
    throw new Error(`CSV must contain name and email columns. Found columns: ${headers.join(', ')}`);
  }
  
  // Parse data rows
  const contacts: ContactFormData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    
    // Skip if we don't have enough values
    if (values.length <= Math.max(nameIndex, emailIndex)) {
      continue;
    }
    
    const name = values[nameIndex]?.trim();
    const email = values[emailIndex]?.trim();
    
    // Skip if name or email is empty
    if (!name || !email) {
      continue;
    }
    
    const contact: ContactFormData = {
      name,
      email,
      tags: [],
      type: 'default'
    };
    
    // Add optional fields if they exist
    if (companyIndex !== -1 && values[companyIndex]) {
      contact.company = values[companyIndex].trim();
    }
    
    if (tagsIndex !== -1 && values[tagsIndex]) {
      contact.tags = values[tagsIndex].split(';').map(tag => tag.trim()).filter(tag => tag);
    }
    
    if (typeIndex !== -1 && values[typeIndex]) {
      const type = values[typeIndex].trim().toLowerCase();
      if (type === 'hot' || type === 'cold' || type === 'default') {
        contact.type = type as ContactFormData['type'];
      }
    }
    
    contacts.push(contact);
  }
  
  return contacts;
};

/**
 * Parse a single CSV line, handling quoted values properly
 * @param line The CSV line to parse
 * @param delimiter The delimiter to use (default: comma)
 * @returns Array of values
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes ("")
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      // Regular character
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue.trim());
  
  return values;
}

/**
 * Generate a sample CSV template for contacts
 * @returns CSV template string
 */
export const generateContactsCSVTemplate = (): string => {
  return 'name,email,company,tags,type\nJohn Doe,john@example.com,Acme Inc,client;important,hot\nJane Smith,jane@example.com,XYZ Corp,prospect,cold';
}; 