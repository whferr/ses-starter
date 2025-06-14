import React, { useState } from 'react';
import { EmailTemplate, TemplateFormData } from '../lib/types';
import { useTemplates } from '../hooks/useTemplates';
import { TemplateEditor } from '../components/templates/TemplateEditor';
import { TemplateList } from '../components/templates/TemplateList';

export const Templates: React.FC = () => {
  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useTemplates();

  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNew = () => {
    setEditingTemplate(undefined);
    setShowEditor(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleSave = async (templateData: TemplateFormData) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
      } else {
        await createTemplate(templateData);
      }
      setShowEditor(false);
      setEditingTemplate(undefined);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingTemplate(undefined);
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      await duplicateTemplate(templateId);
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your email templates.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn btn-primary"
          disabled={loading}
        >
          <span className="mr-2">+</span>
          Create Template
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <div className="flex">
            <span className="text-2xl mr-3">❌</span>
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor */}
      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      )}

      {/* Template List */}
      {!showEditor && (
        <TemplateList
          templates={templates}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}
    </div>
  );
}; 