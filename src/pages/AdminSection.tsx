import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Package, Settings, TrendingUp, Clock } from 'lucide-react';
import ProductList from '../components/ProductList';
import { getStatistics } from '../utils/supabaseData';

const AdminSection: React.FC = () => {
  const [stats, setStats] = useState([
    { name: 'Total Entries', value: '0', icon: Package, change: '0%', changeType: 'neutral' },
    { name: 'Active Mechanics', value: '0', icon: Users, change: '0%', changeType: 'neutral' },
    { name: 'Total Products', value: '0', icon: TrendingUp, change: '0%', changeType: 'neutral' },
    { name: 'Avg. Response Time', value: '0 min', icon: Clock, change: '0%', changeType: 'neutral' },
  ]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    loadStatistics();
  }, []);
  
  const loadStatistics = async () => {
    try {
      const statistics = await getStatistics();
      
      setStats([
        { 
          name: 'Total Entries', 
          value: statistics.totalEntries.toString(), 
          icon: Package, 
          change: '+0%', 
          changeType: 'neutral' 
        },
        { 
          name: 'Active Mechanics', 
          value: statistics.uniqueMechanics.toString(), 
          icon: Users, 
          change: '+0%', 
          changeType: 'neutral' 
        },
        { 
          name: 'Total Products', 
          value: statistics.totalProducts.toString(), 
          icon: TrendingUp, 
          change: '+0%', 
          changeType: 'neutral' 
        },
        { 
          name: 'Avg. Response Time', 
          value: '0 min', 
          icon: Clock, 
          change: '0%', 
          changeType: 'neutral' 
        },
      ]);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

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

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-4 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium rounded-md ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium rounded-md ${activeTab === 'products' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Products Management
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
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
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
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
      )}

      {/* Products Management Tab */}
      {activeTab === 'products' && (
        <ProductList />
      )}
     </div>
   );
};

export default AdminSection;