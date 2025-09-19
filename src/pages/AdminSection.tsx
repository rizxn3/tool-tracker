import React, { useState, useEffect } from 'react';
import { Package, Settings } from 'lucide-react';
import ProductList from '../components/ProductList';
import AuthModal from '../components/AuthModal';
import ChangeCredentialsForm from '../components/ChangeCredentialsForm';

const AdminSection: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [showChangeCredentials, setShowChangeCredentials] = useState(false);

  // Check if user was previously authenticated in this session
  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setShowAuthModal(false);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    // Store authentication status in session storage
    sessionStorage.setItem('adminAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setShowAuthModal(true);
  };

  const handleCredentialsChanged = () => {
    // After credentials are changed, we should log the user out
    setTimeout(() => {
      handleLogout();
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleAuthSuccess} 
        />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Admin Section</h2>
          <p className="text-gray-600 mb-4">Authentication required to access this section</p>
          {!showAuthModal && (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1">Manage your bike spare parts inventory</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowChangeCredentials(true)}
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
            >
              <Settings className="h-4 w-4" /> Change Credentials
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-red-600"
            >
              Logout
            </button>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Change Credentials Modal */}
      {showChangeCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full">
            <ChangeCredentialsForm 
              onClose={() => setShowChangeCredentials(false)}
              onSuccess={handleCredentialsChanged}
            />
          </div>
        </div>
      )}

      {/* Products List */}
      <ProductList />
    </div>
  );
};

export default AdminSection;