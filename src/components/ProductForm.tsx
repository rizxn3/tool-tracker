import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { saveProduct } from '../utils/supabaseData';

interface ProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel }) => {
  const [productName, setProductName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!partNumber.trim()) {
      newErrors.partNumber = 'Part number is required';
    }

    if (buyingPrice.trim() !== '' && isNaN(parseFloat(buyingPrice))) {
      newErrors.buyingPrice = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await saveProduct({
        name: productName.trim(),
        partNumber: partNumber.trim(),
        buyingPrice: buyingPrice.trim() === '' ? 0 : parseFloat(buyingPrice),
        timestamp: new Date()
      });

      setShowSuccess(true);
      
      // Reset form
      setProductName('');
      setPartNumber('');
      setBuyingPrice('');
      setErrors({});

      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product Added Successfully!</h3>
          <p className="text-gray-600">The product has been added to the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
        <p className="text-gray-600 mt-1">Enter product details to add to inventory</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.productName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter product name"
          />
          {errors.productName && (
            <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
          )}
        </div>

        <div>
          <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Part Number *
          </label>
          <input
            type="text"
            id="partNumber"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.partNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter part number"
          />
          {errors.partNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.partNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="buyingPrice" className="block text-sm font-medium text-gray-700 mb-2">
            Buying Price *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="text"
              id="buyingPrice"
              value={buyingPrice}
              onChange={(e) => setBuyingPrice(e.target.value)}
              className={`w-full pl-7 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.buyingPrice ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.buyingPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.buyingPrice}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;