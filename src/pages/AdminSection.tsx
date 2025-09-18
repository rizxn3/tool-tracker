import React from 'react';
import { Package } from 'lucide-react';
import ProductList from '../components/ProductList';

const AdminSection: React.FC = () => {
  


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1">Manage your bike spare parts inventory</p>
          </div>
          <Package className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Products List */}
      <ProductList />
    </div>
  );
};

export default AdminSection;