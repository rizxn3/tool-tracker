import React, { useState } from 'react';
import EntryForm from '../components/EntryForm';
import LookupSection from '../components/LookupSection';
import { Plus, Search } from 'lucide-react';

const MainSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'lookup'>('entry');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('entry')}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'entry'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'lookup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Search className="h-4 w-4 mr-2" />
            Look Up
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'entry' && <EntryForm />}
        {activeTab === 'lookup' && <LookupSection />}
      </div>
    </div>
  );
};

export default MainSection;