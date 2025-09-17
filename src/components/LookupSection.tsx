import React, { useState } from 'react';
import { Search, Calendar, User, Hash, Package, UserRound } from 'lucide-react';
import { searchByPlateNumber, searchByPartName, searchByMechanicName, type Entry } from '../utils/supabaseData';

const LookupSection: React.FC = () => {
  const [searchType, setSearchType] = useState<'plate' | 'part' | 'mechanic' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (type: 'plate' | 'part' | 'mechanic') => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      let results: Entry[] = [];
      
      if (type === 'plate') {
        results = await searchByPlateNumber(searchQuery.toUpperCase().trim());
      } else if (type === 'part') {
        results = await searchByPartName(searchQuery.trim());
      } else if (type === 'mechanic') {
        results = await searchByMechanicName(searchQuery.trim());
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchType(null);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!searchType) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Look Up Records</h2>
          <p className="text-gray-600 mt-1">Search for existing spare parts entries</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSearchType('plate')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center">
                <Hash className="h-8 w-8 mx-auto text-gray-400 group-hover:text-blue-500 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Search by Number Plate</h3>
                <p className="text-gray-600">Find all parts taken for a specific vehicle</p>
              </div>
            </button>

            <button
              onClick={() => setSearchType('part')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto text-gray-400 group-hover:text-blue-500 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Search by Part</h3>
                <p className="text-gray-600">Find all vehicles that used a specific part</p>
              </div>
            </button>

            <button
              onClick={() => setSearchType('mechanic')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center">
                <UserRound className="h-8 w-8 mx-auto text-gray-400 group-hover:text-blue-500 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Search by Mechanic</h3>
                <p className="text-gray-600">Find all entries by a specific mechanic</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Search by {searchType === 'plate' ? 'Number Plate' : searchType === 'part' ? 'Part' : 'Mechanic'}
            </h2>
            <p className="text-gray-600 mt-1">
              {searchType === 'plate' 
                ? 'Find all parts taken for a specific vehicle'
                : searchType === 'part'
                ? 'Find all vehicles that used a specific part'
                : 'Find all entries by a specific mechanic'
              }
            </p>
          </div>
          <button
            onClick={resetSearch}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Change Search
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Search Input */}
        <div className="flex space-x-3 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                searchType === 'plate' 
                  ? 'Enter vehicle number plate (e.g., KA01AB1234)'
                  : searchType === 'part'
                  ? 'Enter part name or number'
                  : 'Enter mechanic name'
              }
            />
          </div>
          <button
            onClick={() => handleSearch(searchType)}
            disabled={!searchQuery.trim() || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Searching...</p>
          </div>
        )}

        {!isLoading && hasSearched && searchResults.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">
              No entries found for "{searchQuery}". Try a different search term.
            </p>
          </div>
        )}

        {!isLoading && searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </h3>
            
            <div className="grid gap-4">
              {searchResults.map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{entry.vehicleNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(entry.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{entry.mechanicName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{entry.contactNumber}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-gray-900">Complaint Type:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {entry.complaintType}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Spare Parts:</h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.spareParts.map((part: { name: string; quantity: number }, partIndex: number) => (
                        <span
                          key={partIndex}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {part.name} (Qty: {part.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LookupSection;