import React, { useState, useEffect } from 'react';
import { Contact, ContactFormData } from '../../lib/types';
import { EmailUtils } from '../../lib/email-utils';

interface ContactFormProps {
  contact?: Contact;  // For editing existing contact
  onSave: (contactData: ContactFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    tags: [],
    type: 'default'
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [tagInput, setTagInput] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email,
        company: contact.company || '',
        tags: contact.tags,
        type: contact.type
      });
    }
  }, [contact]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EmailUtils.validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="card-body space-y-4">
        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name *
          </label>
          <input
            type="text"
            id="name"
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            disabled={loading}
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            disabled={loading}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        {/* Company Field */}
        <div className="form-group">
          <label htmlFor="company" className="form-label">
            Company
          </label>
          <input
            type="text"
            id="company"
            className="form-input"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            placeholder="Enter company name"
            disabled={loading}
          />
        </div>

        {/* Type Field */}
        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Contact Type
          </label>
          <select
            id="type"
            className="form-select"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Contact['type'] }))}
            disabled={loading}
          >
            <option value="default">Default</option>
            <option value="cold">Cold Lead</option>
            <option value="hot">Hot Lead</option>
          </select>
        </div>

        {/* Tags Field */}
        <div className="form-group">
          <label htmlFor="tags" className="form-label">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            className="form-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            placeholder="Type tag and press Enter"
            disabled={loading}
          />
          <p className="form-help">Press Enter to add tags</p>
          
          {/* Display Tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="badge badge-secondary">
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    onClick={() => handleTagRemove(tag)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                Saving...
              </div>
            ) : (
              contact ? 'Update Contact' : 'Add Contact'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 