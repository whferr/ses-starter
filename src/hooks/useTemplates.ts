import { useState, useEffect, useCallback } from 'react';
import { EmailTemplate, TemplateFormData } from '../lib/types';
import { storage } from '../lib/storage';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTemplates = await storage.loadTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const createTemplate = useCallback(async (templateData: TemplateFormData) => {
    try {
      setLoading(true);
      setError(null);
      const newTemplate = await storage.createTemplate(templateData);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<EmailTemplate>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTemplate = await storage.updateTemplate(id, updates);
      if (updatedTemplate) {
        setTemplates(prev => 
          prev.map(template => template.id === id ? updatedTemplate : template)
        );
        return updatedTemplate;
      }
      throw new Error('Template not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await storage.deleteTemplate(id);
      if (success) {
        setTemplates(prev => prev.filter(template => template.id !== id));
      } else {
        throw new Error('Template not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplateById = useCallback((id: string) => {
    return templates.find(template => template.id === id);
  }, [templates]);

  const searchTemplates = useCallback((query: string) => {
    if (!query.trim()) return templates;
    
    const lowercaseQuery = query.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.subject.toLowerCase().includes(lowercaseQuery) ||
      template.htmlContent.toLowerCase().includes(lowercaseQuery) ||
      template.textContent.toLowerCase().includes(lowercaseQuery)
    );
  }, [templates]);

  const duplicateTemplate = useCallback(async (id: string) => {
    const template = getTemplateById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const duplicatedTemplate = {
      name: `${template.name} (Copy)`,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
    };

    return createTemplate(duplicatedTemplate);
  }, [getTemplateById, createTemplate]);

  const getTemplatesByVariable = useCallback((variable: string) => {
    return templates.filter(template => 
      template.variables.includes(variable)
    );
  }, [templates]);

  const getAllVariables = useCallback(() => {
    const allVariables = templates.flatMap(template => template.variables);
    return Array.from(new Set(allVariables)).sort();
  }, [templates]);

  return {
    templates,
    loading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    searchTemplates,
    duplicateTemplate,
    getTemplatesByVariable,
    getAllVariables,
  };
}; 