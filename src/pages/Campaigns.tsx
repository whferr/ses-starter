import React from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Rocket, Plus, BarChart3, Users, Mail } from 'lucide-react';

export const Campaigns: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage your email campaigns
          </p>
        </div>
        <Button disabled className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>
      
      {/* Coming Soon Notice */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Rocket className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Management</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Campaign management features are coming soon. You can still send emails directly from the Send page.
        </p>
        <div className="flex justify-center gap-3">
          <Button disabled variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Upcoming Features */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Features</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Automated Campaigns</div>
                      <div className="text-sm text-gray-500">Schedule & automate emails</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  Set up automated email sequences and drip campaigns
                </td>
                <td className="px-4 py-4">
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </td>
              </tr>
              
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">A/B Testing</div>
                      <div className="text-sm text-gray-500">Optimize performance</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  Test different subject lines and content variations
                </td>
                <td className="px-4 py-4">
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </td>
              </tr>
              
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Audience Segmentation</div>
                      <div className="text-sm text-gray-500">Smart targeting</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  Target specific groups based on contact properties
                </td>
                <td className="px-4 py-4">
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 