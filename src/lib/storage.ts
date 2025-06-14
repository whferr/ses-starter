import { Contact, EmailTemplate, SenderProfile, SentEmail, AppSettings } from './types';

// Storage utility for local JSON files
class LocalStorage {
  private readonly dataPath = 'data';

  // Generate unique ID
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generic file operations
  private async loadData<T>(filename: string, defaultData: T): Promise<T> {
    try {
      const response = await fetch(`/${this.dataPath}/${filename}`);
      if (!response.ok) {
        return defaultData;
      }
      return await response.json();
    } catch (error) {
      console.warn(`Failed to load ${filename}, using default data:`, error);
      return defaultData;
    }
  }

  private async saveData<T>(filename: string, data: T): Promise<void> {
    try {
      // In a real app, this would need a backend API to save files
      // For now, we'll store in localStorage as a fallback
      localStorage.setItem(filename, JSON.stringify(data));
      console.log(`Data saved to localStorage: ${filename}`);
    } catch (error) {
      console.error(`Failed to save ${filename}:`, error);
      throw error;
    }
  }

  private loadFromLocalStorage<T>(filename: string, defaultData: T): T {
    try {
      const stored = localStorage.getItem(filename);
      return stored ? JSON.parse(stored) : defaultData;
    } catch (error) {
      console.warn(`Failed to load from localStorage: ${filename}`, error);
      return defaultData;
    }
  }

  // Contact operations
  async loadContacts(): Promise<Contact[]> {
    return this.loadFromLocalStorage('contacts.json', []);
  }

  async saveContacts(contacts: Contact[]): Promise<void> {
    await this.saveData('contacts.json', contacts);
  }

  async createContact(contactData: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    const contact: Contact = {
      ...contactData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };

    const contacts = await this.loadContacts();
    contacts.push(contact);
    await this.saveContacts(contacts);
    
    return contact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const contacts = await this.loadContacts();
    const index = contacts.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    contacts[index] = { ...contacts[index], ...updates };
    await this.saveContacts(contacts);
    
    return contacts[index];
  }

  async deleteContact(id: string): Promise<boolean> {
    const contacts = await this.loadContacts();
    const filteredContacts = contacts.filter(c => c.id !== id);
    
    if (filteredContacts.length === contacts.length) return false;
    
    await this.saveContacts(filteredContacts);
    return true;
  }

  // Template operations
  async loadTemplates(): Promise<EmailTemplate[]> {
    return this.loadFromLocalStorage('templates.json', []);
  }

  async saveTemplates(templates: EmailTemplate[]): Promise<void> {
    await this.saveData('templates.json', templates);
  }

  async createTemplate(templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'variables'>): Promise<EmailTemplate> {
    const variables = this.extractVariables(templateData.htmlContent + ' ' + templateData.textContent);
    
    const template: EmailTemplate = {
      ...templateData,
      id: this.generateId(),
      variables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const templates = await this.loadTemplates();
    templates.push(template);
    await this.saveTemplates(templates);
    
    return template;
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const templates = await this.loadTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    // Re-extract variables if content changed
    let variables = templates[index].variables;
    if (updates.htmlContent || updates.textContent) {
      const content = (updates.htmlContent || templates[index].htmlContent) + ' ' + 
                     (updates.textContent || templates[index].textContent);
      variables = this.extractVariables(content);
    }
    
    templates[index] = { 
      ...templates[index], 
      ...updates, 
      variables,
      updatedAt: new Date().toISOString() 
    };
    await this.saveTemplates(templates);
    
    return templates[index];
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const templates = await this.loadTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    if (filteredTemplates.length === templates.length) return false;
    
    await this.saveTemplates(filteredTemplates);
    return true;
  }

  // Sender Profile operations
  async loadSenderProfiles(): Promise<SenderProfile[]> {
    return this.loadFromLocalStorage('sender-profiles.json', []);
  }

  async saveSenderProfiles(profiles: SenderProfile[]): Promise<void> {
    await this.saveData('sender-profiles.json', profiles);
  }

  async createSenderProfile(profileData: Omit<SenderProfile, 'id'>): Promise<SenderProfile> {
    const profile: SenderProfile = {
      ...profileData,
      id: this.generateId(),
    };

    const profiles = await this.loadSenderProfiles();
    
    // If this is set as default, unset others
    if (profile.isDefault) {
      profiles.forEach(p => p.isDefault = false);
    }
    
    profiles.push(profile);
    await this.saveSenderProfiles(profiles);
    
    return profile;
  }

  async updateSenderProfile(id: string, updates: Partial<SenderProfile>): Promise<SenderProfile | null> {
    const profiles = await this.loadSenderProfiles();
    const index = profiles.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    // If setting as default, unset others
    if (updates.isDefault) {
      profiles.forEach(p => p.isDefault = false);
    }
    
    profiles[index] = { ...profiles[index], ...updates };
    await this.saveSenderProfiles(profiles);
    
    return profiles[index];
  }

  async deleteSenderProfile(id: string): Promise<boolean> {
    const profiles = await this.loadSenderProfiles();
    const filteredProfiles = profiles.filter(p => p.id !== id);
    
    if (filteredProfiles.length === profiles.length) return false;
    
    await this.saveSenderProfiles(filteredProfiles);
    return true;
  }

  // Sent Email operations
  async loadSentEmails(): Promise<SentEmail[]> {
    return this.loadFromLocalStorage('sent-emails.json', []);
  }

  async saveSentEmails(emails: SentEmail[]): Promise<void> {
    await this.saveData('sent-emails.json', emails);
  }

  async recordSentEmail(emailData: Omit<SentEmail, 'id' | 'sentAt'>): Promise<SentEmail> {
    const sentEmail: SentEmail = {
      ...emailData,
      id: this.generateId(),
      sentAt: new Date().toISOString(),
    };

    const sentEmails = await this.loadSentEmails();
    sentEmails.push(sentEmail);
    await this.saveSentEmails(sentEmails);
    
    return sentEmail;
  }

  // Settings operations
  async loadSettings(): Promise<AppSettings | null> {
    return this.loadFromLocalStorage('settings.json', null);
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.saveData('settings.json', settings);
  }

  // Utility functions
  private extractVariables(content: string): string[] {
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

  // Backup and restore
  async createBackup(): Promise<string> {
    const backup = {
      contacts: await this.loadContacts(),
      templates: await this.loadTemplates(),
      senderProfiles: await this.loadSenderProfiles(),
      sentEmails: await this.loadSentEmails(),
      settings: await this.loadSettings(),
      timestamp: new Date().toISOString(),
    };
    
    return JSON.stringify(backup, null, 2);
  }

  async restoreFromBackup(backupData: string): Promise<void> {
    try {
      const backup = JSON.parse(backupData);
      
      if (backup.contacts) await this.saveContacts(backup.contacts);
      if (backup.templates) await this.saveTemplates(backup.templates);
      if (backup.senderProfiles) await this.saveSenderProfiles(backup.senderProfiles);
      if (backup.sentEmails) await this.saveSentEmails(backup.sentEmails);
      if (backup.settings) await this.saveSettings(backup.settings);
      
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw new Error('Invalid backup data');
    }
  }
}

export const storage = new LocalStorage(); 