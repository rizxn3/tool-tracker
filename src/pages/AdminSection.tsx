import React from 'react';
import { BarChart3, Users, Package, Settings, TrendingUp, Clock } from 'lucide-react';
// Note: Statistics will be static for now, but can be made dynamic by importing getStatistics from supabaseData

const AdminSection: React.FC = () => {
  // Mock statistics
  const stats = [
    { name: 'Total Entries', value: '1,234', icon: Package, change: '+12%', changeType: 'positive' },
    { name: 'Active Mechanics', value: '56', icon: Users, change: '+3%', changeType: 'positive' },
    { name: 'Parts This Month', value: '2,847', icon: TrendingUp, change: '+8%', changeType: 'positive' },
    { name: 'Avg. Response Time', value: '2.4 min', icon: Clock, change: '-15%', changeType: 'positive' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and monitor your bike spare parts system</p>
          </div>
          <Settings className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-2">from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-gray-600 mt-1">Latest system activities and entries</p>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">
                Real-time activity monitoring and detailed analytics will be available in the next update.
              </p>
            </div>
          </div>
        </div>

        {/* System Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Management</h2>
            <p className="text-gray-600 mt-1">Configure and manage system settings</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">User Management</h3>
                <p className="text-sm text-gray-600">Add, edit, and manage mechanic accounts and permissions.</p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Configure →
                </button>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Parts Database</h3>
                <p className="text-sm text-gray-600">Manage spare parts catalog and inventory tracking.</p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Manage →
                </button>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Reports & Analytics</h3>
                <p className="text-sm text-gray-600">Generate detailed reports and usage analytics.</p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View Reports →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Features */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Features</h3>
            <p className="text-gray-600 mt-1">
              We're constantly improving TOOL TRACK with new features and capabilities.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Advanced reporting and analytics dashboard</li>
              <li>• Inventory management and low-stock alerts</li>
              <li>• Mobile app for on-the-go access</li>
              <li>• Integration with popular bike service management systems</li>
              <li>• Automated billing and invoice generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;