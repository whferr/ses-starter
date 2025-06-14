import { Contact, EmailTemplate, SenderProfile } from './types';

export class EmailUtils {
  // Process template variables with contact data
  static processTemplate(template: EmailTemplate, contact: Contact, senderProfile?: SenderProfile): {
    subject: string;
    htmlContent: string;
    textContent: string;
  } {
    const variables = {
      name: contact.name,
      email: contact.email,
      company: contact.company || '',
      firstName: contact.name.split(' ')[0] || contact.name,
      lastName: contact.name.split(' ').slice(1).join(' ') || '',
      senderName: senderProfile?.name || '',
      senderEmail: senderProfile?.email || '',
      senderSignature: senderProfile?.signature || '',
    };

    return {
      subject: this.replaceVariables(template.subject, variables),
      htmlContent: this.replaceVariables(template.htmlContent, variables),
      textContent: this.replaceVariables(template.textContent, variables),
    };
  }

  // Replace template variables in content
  private static replaceVariables(content: string, variables: Record<string, string>): string {
    let processedContent = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });

    return processedContent;
  }

  // Extract variables from template content
  static extractVariables(content: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  // Validate email address format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate preview data for templates
  static generatePreviewData(): Record<string, string> {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      company: 'Acme Corporation',
      firstName: 'John',
      lastName: 'Doe',
      senderName: 'Jane Smith',
      senderEmail: 'jane@yourcompany.com',
      senderSignature: 'Best regards,\nJane Smith\nSales Manager',
    };
  }

  // Convert HTML to plain text (basic implementation)
  static htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Generate auto text content from HTML
  static generateTextFromHtml(htmlContent: string): string {
    return this.htmlToText(htmlContent);
  }

  // Validate template content
  static validateTemplate(template: Partial<EmailTemplate>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!template.name?.trim()) {
      errors.push('Template name is required');
    }

    if (!template.subject?.trim()) {
      errors.push('Subject is required');
    }

    if (!template.htmlContent?.trim() && !template.textContent?.trim()) {
      errors.push('Either HTML or text content is required');
    }

    // Check for unmatched variables
    if (template.htmlContent || template.textContent) {
      const content = (template.htmlContent || '') + ' ' + (template.textContent || '');
      const variables = this.extractVariables(content);
      const validVariables = ['name', 'email', 'company', 'firstName', 'lastName', 'senderName', 'senderEmail', 'senderSignature'];
      
      const invalidVariables = variables.filter(v => !validVariables.includes(v));
      if (invalidVariables.length > 0) {
        errors.push(`Invalid variables: ${invalidVariables.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Calculate estimated reading time
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const textContent = this.htmlToText(content);
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Parse CSV contact data
  static parseCSV(csvData: string): {
    contacts: Omit<Contact, 'id' | 'createdAt'>[];
    errors: string[];
  } {
    const lines = csvData.trim().split('\n');
    const contacts: Omit<Contact, 'id' | 'createdAt'>[] = [];
    const errors: string[] = [];

    if (lines.length < 2) {
      errors.push('CSV must have at least a header row and one data row');
      return { contacts, errors };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Expected headers
    const emailIndex = headers.findIndex(h => h.includes('email'));
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const companyIndex = headers.findIndex(h => h.includes('company'));

    if (emailIndex === -1) {
      errors.push('CSV must have an email column');
      return { contacts, errors };
    }

    if (nameIndex === -1) {
      errors.push('CSV must have a name column');
      return { contacts, errors };
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < headers.length) {
        errors.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      const email = values[emailIndex];
      const name = values[nameIndex];
      const company = companyIndex !== -1 ? values[companyIndex] : undefined;

      if (!email) {
        errors.push(`Row ${i + 1}: Email is required`);
        continue;
      }

      if (!name) {
        errors.push(`Row ${i + 1}: Name is required`);
        continue;
      }

      if (!this.validateEmail(email)) {
        errors.push(`Row ${i + 1}: Invalid email format`);
        continue;
      }

      contacts.push({
        email,
        name,
        company,
        tags: [],
        type: 'default',
      });
    }

    return { contacts, errors };
  }

  // Generate CSV from contacts
  static generateCSV(contacts: Contact[]): string {
    const headers = ['Name', 'Email', 'Company', 'Type', 'Tags', 'Created At', 'Last Emailed'];
    const rows = contacts.map(contact => [
      contact.name,
      contact.email,
      contact.company || '',
      contact.type,
      contact.tags.join(';'),
      contact.createdAt,
      contact.lastEmailed || ''
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
} 