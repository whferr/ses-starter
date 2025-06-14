import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            AWS SES Mailer
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Ready to send
          </div>
        </div>
      </div>
    </header>
  );
}; 