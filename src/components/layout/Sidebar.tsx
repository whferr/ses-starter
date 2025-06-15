import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, Send, BarChart3, Settings } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Audience', href: '/contacts', icon: Users },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Campaigns', href: '/send', icon: Send },
  { name: 'History', href: '/history', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r border-gray-200 h-full">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="text-xl font-semibold text-gray-900">
          <img src="/logo.svg" alt="Logo" className="w-20 h-20" />
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-700 hover:bg-white hover:text-gray-900'
                }`
              }
            >
              <IconComponent className="mr-3 w-4 h-4" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}; 