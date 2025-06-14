import React, { useState, useMemo } from 'react';
import { EmailTemplate } from '../../lib/types';
import { EmailUtils } from '../../lib/email-utils';

interface TemplateListProps {
  templates: EmailTemplate[];
  loading?: boolean;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (templateId: string) => void;
  onDuplicate: (templateId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  loading = false,
  onEdit,
  onDelete,
  onDuplicate,
  searchQuery,
  onSearchChange
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.subject.toLowerCase().includes(lowercaseQuery) ||
      template.htmlContent.toLowerCase().includes(lowercaseQuery) ||
      template.textContent.toLowerCase().includes(lowercaseQuery)
    );
  }, [templates, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getVariablesBadges = (variables: string[]) => {
    return variables.slice(0, 3).map((variable, index) => (
      <span key={index} className="badge badge-primary text-xs">
        {`{{${variable}}}`}
      </span>
    ));
  };

  const getReadingTime = (content: string) => {
    return EmailUtils.calculateReadingTime(content);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <div className="spinner mr-2"></div>
            <span>Loading templates...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="card">
        <div className="card-body">
          <input
            type="text"
            placeholder="Search templates by name, subject, or content..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        {filteredTemplates.length} of {templates.length} templates
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full">
            <div className="card">
              <div className="card-body text-center py-12">
                <div className="text-gray-500 mb-4">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No templates match your search' : 'No templates yet'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Try adjusting your search terms.' 
                    : 'Create your first email template to get started.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="card hover:shadow-md transition-shadow">
              <div className="card-header">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {template.subject}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {selectedTemplate?.id === template.id ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {/* Template Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{getReadingTime(template.htmlContent || template.textContent)} min read</span>
                  <span>{template.variables.length} variables</span>
                </div>

                {/* Variables */}
                {template.variables.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {getVariablesBadges(template.variables)}
                      {template.variables.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{template.variables.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                {selectedTemplate?.id === template.id && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-3">
                      {template.htmlContent && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">HTML Preview:</h4>
                          <div 
                            className="prose prose-sm max-w-none text-gray-700 line-clamp-4"
                            dangerouslySetInnerHTML={{ 
                              __html: template.htmlContent.substring(0, 200) + '...' 
                            }}
                          />
                        </div>
                      )}
                      
                      {template.textContent && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Text Preview:</h4>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {template.textContent.substring(0, 200)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="text-xs text-gray-500 mt-3">
                  <div>Created: {formatDate(template.createdAt)}</div>
                  {template.updatedAt !== template.createdAt && (
                    <div>Updated: {formatDate(template.updatedAt)}</div>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(template)}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDuplicate(template.id)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Duplicate
                    </button>
                  </div>
                  <button
                    onClick={() => onDelete(template.id)}
                    className="text-error hover:text-error/80 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 