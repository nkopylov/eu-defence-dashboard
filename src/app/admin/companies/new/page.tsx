'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [materialCategories, setMaterialCategories] = useState<{id: number, name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    country: '',
    products: '',
    sector: '',
    categoryType: '',
    category: '',
    defensePotential: '',
    description: '',
    defenseUses: '',
    revenue: '',
    marketCap: '',
    euFundFocus: false
  });

  useEffect(() => {
    // Check both sessionStorage and localStorage for the auth key
    const sessionAuthKey = sessionStorage.getItem('adminAuthKey');
    const localAuthKey = localStorage.getItem('adminAuthKey');
    
    const authKey = sessionAuthKey || localAuthKey;
    
    // If found in localStorage but not in sessionStorage, sync them
    if (!sessionAuthKey && localAuthKey) {
      sessionStorage.setItem('adminAuthKey', localAuthKey);
    }
    
    if (!authKey) {
      router.push('/admin');
      return;
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories', {
          headers: {
            'Authorization': `Bearer ${authKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.companyCategories || []);
            setMaterialCategories(data.materialCategories || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
      return;
    }
    
    // Handle number fields
    if (name === 'revenue' || name === 'marketCap' || name === 'defensePotential') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : value
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const authKey = sessionStorage.getItem('adminAuthKey');
    if (!authKey) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      // Convert numeric fields
      const payload = {
        ...formData,
        revenue: formData.revenue ? parseFloat(formData.revenue as string) : null,
        marketCap: formData.marketCap ? parseFloat(formData.marketCap as string) : null,
        defensePotential: formData.defensePotential ? parseFloat(formData.defensePotential as string) : null,
      };

      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        router.push('/admin/companies');
      } else {
        setError(data.error || 'Failed to create company');
      }
    } catch (error) {
      setError('An error occurred while creating the company');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add New Company</h1>
          <Link href="/admin/companies" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Companies
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ticker Symbol *
              </label>
              <input
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Type *
              </label>
              <select
                name="categoryType"
                value={formData.categoryType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select Category Type</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {formData.categoryType === 'materials' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Material Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select Material Category</option>
                  {materialCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sector
              </label>
              <input
                type="text"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Revenue (millions €)
              </label>
              <input
                type="number"
                name="revenue"
                value={formData.revenue}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Market Cap (millions €)
              </label>
              <input
                type="number"
                name="marketCap"
                value={formData.marketCap}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Defense Potential (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                name="defensePotential"
                value={formData.defensePotential}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Products *
              </label>
              <textarea
                name="products"
                value={formData.products}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Defense Uses
              </label>
              <textarea
                name="defenseUses"
                value={formData.defenseUses}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="euFundFocus"
                  checked={formData.euFundFocus}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  EU Fund Focus
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Link
              href="/admin/companies"
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}