import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus } from 'lucide-react';
import { getAllProducts, deleteProduct } from '../utils/supabaseData';
import { Product } from '../lib/supabase';
import ProductForm from './ProductForm';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadProducts();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return <ProductForm onSuccess={handleAddSuccess} onCancel={() => setShowAddForm(false)} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Products</h2>
          <p className="text-gray-600 mt-1">Manage your spare parts inventory</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="p-6 text-center py-8">
          <p className="text-gray-600">No products found. Add your first product to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buying Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.partNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.buyingPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {deleteConfirm === product.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-sm text-gray-600">Confirm?</span>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;