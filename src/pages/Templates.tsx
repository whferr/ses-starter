import React, { useState } from 'react';
import { EmailTemplate, TemplateFormData } from '../lib/types';
import { useTemplates } from '../hooks/useTemplates';
import { TemplateEditor } from '../components/templates/TemplateEditor';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Copy, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Eye
} from 'lucide-react';

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
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

  // Filter templates based on search
  const filteredTemplates = templates.filter(template => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.subject.toLowerCase().includes(query) ||
      template.htmlContent.toLowerCase().includes(query) ||
      template.textContent.toLowerCase().includes(query)
    );
  });

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

  const toggleTemplateSelection = (templateId: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedTemplates.size === filteredTemplates.length) {
      setSelectedTemplates(new Set());
    } else {
      setSelectedTemplates(new Set(filteredTemplates.map(t => t.id)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  const truncateText = (text: string, length: number = 60) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage reusable email templates
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          disabled={loading}
          className="bg-black text-white hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          New template
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent w-full"
          />
        </div>
      </div>

      <div className="text-sm text-gray-600">
        {filteredTemplates.length} of {templates.length} templates
        {selectedTemplates.size > 0 && (
          <span className="ml-4 text-black font-medium">{selectedTemplates.size} selected</span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-900 font-medium">Error</div>
          <div className="text-red-800 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No templates found' : 'No templates yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Create your first email template to get started'
            }
          </p>
          {!searchQuery && (
            <Button onClick={handleAddNew} className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Create your first template
            </Button>
          )}
        </div>
      )}

      {/* Templates Table */}
      {filteredTemplates.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.size === filteredTemplates.length && filteredTemplates.length > 0}
                    onChange={toggleAllSelection}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variables
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="w-40 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplates.has(template.id);
                const isExpanded = expandedTemplate === template.id;

                return (
                  <React.Fragment key={template.id}>
                    <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTemplateSelection(template.id)}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-sm font-medium">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500">{getReadingTime(template.htmlContent || template.textContent)} min read</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {truncateText(template.subject)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {template.variables.length}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(template.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => handleEdit(template)}
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDuplicate(template.id)}
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            onClick={() => handleDelete(template.id)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Preview Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 border-t border-gray-200">
                          <div className="px-4 py-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Variables</h4>
                                {template.variables.length === 0 ? (
                                  <p className="text-sm text-gray-500">No variables in this template</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {template.variables.map((variable, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {variable}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Content Preview</h4>
                                <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                                  {template.htmlContent ? (
                                    <div 
                                      className="prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{ 
                                        __html: template.htmlContent.substring(0, 300) + '...' 
                                      }} 
                                    />
                                  ) : (
                                    <p className="whitespace-pre-wrap">
                                      {template.textContent.substring(0, 300)}...
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Template Editor Modal */}
      {showEditor && (
        <Modal
          isOpen={showEditor}
          onClose={handleCancel}
          title={editingTemplate ? 'Edit Template' : 'Create New Template'}
          description={editingTemplate ? 'Update your email template' : 'Design your email template with personalization variables'}
          size="4xl"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Trigger form submission
                  const form = document.querySelector('[data-template-form]') as HTMLFormElement;
                  if (form) {
                    form.requestSubmit();
                  }
                }}
                disabled={loading}
                className="bg-black text-white hover:bg-gray-800"
              >
                {loading ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}
              </Button>
            </div>
          }
        >
          <div className="p-6">
            <TemplateEditor
              template={editingTemplate}
              onSave={handleSave}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}; 