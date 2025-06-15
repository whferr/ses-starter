import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { parseContactsCSV, generateContactsCSVTemplate } from '../../lib/csv-utils';
import { ContactFormData } from '../../lib/types';
import { Download, Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: ContactFormData[]) => Promise<any>;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedContacts, setParsedContacts] = useState<ContactFormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    setIsLoading(true);
    setError(null);

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      setError('Please upload a CSV file');
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const contacts = parseContactsCSV(content);
        
        if (contacts.length === 0) {
          setError('No valid contacts found in the CSV file');
        } else {
          setParsedContacts(contacts);
        }
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
        setParsedContacts([]);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setParsedContacts([]);
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedContacts.length === 0) return;
    
    try {
      setIsImporting(true);
      await onImport(parsedContacts);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import contacts');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = generateContactsCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setParsedContacts([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      parseFile(droppedFile);
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Contacts from CSV"
      description="Upload a CSV file to import multiple contacts at once"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedContacts.length === 0 || isImporting}
            className="bg-black text-white hover:bg-gray-800"
          >
            {isImporting ? 'Importing...' : `Import ${parsedContacts.length} Contacts`}
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Upload CSV File</h3>
              <p className="text-xs text-gray-500 mt-1">
                File must contain name and email columns
              </p>
            </div>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download Template
            </Button>
          </div>

          <div 
            className={`border-2 ${isDragging ? 'border-black bg-gray-50' : 'border-dashed border-gray-300'} rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-sm font-medium text-gray-900">Processing file...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center">
                <FileText className="w-8 h-8 mx-auto text-gray-600" />
                <p className="mt-2 text-sm font-medium text-gray-900">{file.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
                >
                  Change file
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  CSV files only
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-red-800">Error</div>
              <div className="text-xs text-red-700 mt-1">{error}</div>
            </div>
          </div>
        )}

        {/* Preview */}
        {parsedContacts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-medium text-gray-900">
                {parsedContacts.length} contacts ready to import
              </h3>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Company</th>
                      <th className="px-4 py-2">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedContacts.slice(0, 5).map((contact, index) => (
                      <tr key={index} className="bg-white">
                        <td className="px-4 py-2 font-medium text-gray-900">{contact.name}</td>
                        <td className="px-4 py-2 text-gray-600">{contact.email}</td>
                        <td className="px-4 py-2 text-gray-600">{contact.company || '-'}</td>
                        <td className="px-4 py-2 text-gray-600">{contact.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedContacts.length > 5 && (
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
                  +{parsedContacts.length - 5} more contacts
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}; 