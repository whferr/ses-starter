import React from 'react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Contacts', href: '/contacts', icon: '👥' },
  { name: 'Templates', href: '/templates', icon: '📄' },
  { name: 'Send', href: '/send', icon: '🚀' },
  { name: 'History', href: '/history', icon: '📈' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="text-lg font-semibold text-gray-900">
          SES Mailer
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
            }
          >
            <span className="mr-3 text-base">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}; 