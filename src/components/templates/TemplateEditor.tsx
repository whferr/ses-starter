import React, { useState, useEffect } from 'react';
import { EmailTemplate, TemplateFormData } from '../../lib/types';
import { EmailUtils } from '../../lib/email-utils';

interface TemplateEditorProps {
  template?: EmailTemplate;
  onSave: (templateData: TemplateFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    subject: '',
    htmlContent: '',
    textContent: ''
  });

  const [errors, setErrors] = useState<Partial<TemplateFormData>>({});
  const [activeTab, setActiveTab] = useState<'html' | 'text' | 'preview'>('html');
  const [previewData] = useState(EmailUtils.generatePreviewData());

  // Populate form when editing
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent
      });
    }
  }, [template]);



  const validateForm = (): boolean => {
    const validation = EmailUtils.validateTemplate(formData);
    setErrors(validation.errors.reduce((acc, error) => {
      if (error.includes('name')) acc.name = error;
      if (error.includes('subject') || error.includes('Subject')) acc.subject = error;
      if (error.includes('content')) {
        acc.htmlContent = error;
        acc.textContent = error;
      }
      return acc;
    }, {} as Partial<TemplateFormData>));
    
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const generateTextFromHtml = () => {
    if (formData.htmlContent) {
      const autoText = EmailUtils.generateTextFromHtml(formData.htmlContent);
      setFormData(prev => ({ ...prev, textContent: autoText }));
    }
  };

  const insertVariable = (variable: string) => {
    const placeholder = `{{${variable}}}`;
    
    if (activeTab === 'html') {
      setFormData(prev => ({
        ...prev,
        htmlContent: prev.htmlContent + placeholder
      }));
    } else if (activeTab === 'text') {
      setFormData(prev => ({
        ...prev,
        textContent: prev.textContent + placeholder
      }));
    }
  };

  const availableVariables = [
    'name', 'firstName', 'lastName', 'email', 'company',
    'senderName', 'senderEmail', 'senderSignature'
  ];

  const getPreviewContent = () => {
    const processedContent = EmailUtils.processTemplate(
      { ...formData, id: 'preview', variables: [], createdAt: '', updatedAt: '' },
      {
        id: 'preview',
        name: previewData.name,
        email: previewData.email,
        company: previewData.company,
        tags: [],
        type: 'default',
        createdAt: ''
      },
      {
        id: 'preview',
        name: previewData.senderName,
        email: previewData.senderEmail,
        signature: previewData.senderSignature,
        isDefault: true
      }
    );

    return processedContent;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" data-template-form>
          {/* Template Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Template Name *
            </label>
            <input
              type="text"
              id="name"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter template name"
              disabled={loading}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {/* Subject Line */}
          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              Subject Line *
            </label>
            <input
              type="text"
              id="subject"
              className={`form-input ${errors.subject ? 'form-input-error' : ''}`}
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject"
              disabled={loading}
            />
            {errors.subject && <p className="form-error">{errors.subject}</p>}
          </div>

          {/* Variable Helper */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Available Variables:</h4>
            <div className="flex flex-wrap gap-2">
              {availableVariables.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className="btn btn-outline btn-sm"
                  disabled={loading || activeTab === 'preview'}
                >
                  {`{{${variable}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Content Tabs */}
          <div>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('html')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'html'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  HTML Content
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'text'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Text Content
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'preview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Preview
                </button>
              </nav>
            </div>

            <div className="mt-4">
              {activeTab === 'html' && (
                <div className="form-group">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="htmlContent" className="form-label">
                      HTML Content *
                    </label>
                    <button
                      type="button"
                      onClick={generateTextFromHtml}
                      className="btn btn-outline btn-sm"
                      disabled={loading || !formData.htmlContent}
                    >
                      Generate Text Version
                    </button>
                  </div>
                  <textarea
                    id="htmlContent"
                    rows={12}
                    className={`form-textarea font-mono ${errors.htmlContent ? 'form-input-error' : ''}`}
                    value={formData.htmlContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                    placeholder="Enter HTML content..."
                    disabled={loading}
                  />
                  {errors.htmlContent && <p className="form-error">{errors.htmlContent}</p>}
                </div>
              )}

              {activeTab === 'text' && (
                <div className="form-group">
                  <label htmlFor="textContent" className="form-label">
                    Text Content *
                  </label>
                  <textarea
                    id="textContent"
                    rows={12}
                    className={`form-textarea ${errors.textContent ? 'form-input-error' : ''}`}
                    value={formData.textContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, textContent: e.target.value }))}
                    placeholder="Enter plain text content..."
                    disabled={loading}
                  />
                  {errors.textContent && <p className="form-error">{errors.textContent}</p>}
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Subject:</h4>
                    <p className="text-gray-700">{getPreviewContent().subject || 'No subject'}</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">HTML Preview:</h4>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: getPreviewContent().htmlContent || 'No HTML content' }}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Text Preview:</h4>
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm">
                      {getPreviewContent().textContent || 'No text content'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

        </form>
      </div>
    );
  }; 