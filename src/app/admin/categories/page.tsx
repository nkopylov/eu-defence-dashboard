'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [companyCategories, setCompanyCategories] = useState<Category[]>([]);
  const [materialCategories, setMaterialCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for adding new categories
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'company'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

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

    fetchCategories(authKey);
  }, [router]);

  const fetchCategories = async (authKey: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${authKey}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCompanyCategories(data.companyCategories || []);
        setMaterialCategories(data.materialCategories || []);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch (error) {
      setError('An error occurred while fetching categories');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    if (!newCategory.name.trim()) {
      setSubmitError('Category name is required');
      setIsSubmitting(false);
      return;
    }

    const authKey = sessionStorage.getItem('adminAuthKey');
    if (!authKey) {
      setSubmitError('Not authenticated');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authKey}`
        },
        body: JSON.stringify(newCategory)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubmitSuccess(`Category "${newCategory.name}" created successfully`);
        setNewCategory({
          name: '',
          type: 'company'
        });
        
        // Refresh the categories list
        await fetchCategories(authKey);
      } else {
        setSubmitError(data.error || 'Failed to create category');
      }
    } catch (error) {
      setSubmitError('An error occurred while creating the category');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Categories Management</h1>
            <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline">
              Back to Admin
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Categories */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Company Categories</h2>
              
              {isLoading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
              ) : companyCategories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No company categories found</p>
              ) : (
                <ul className="space-y-2">
                  {companyCategories.map(category => (
                    <li 
                      key={category.id}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex justify-between items-center"
                    >
                      <span>{category.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Material Categories */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Material Categories</h2>
              
              {isLoading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
              ) : materialCategories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No material categories found</p>
              ) : (
                <ul className="space-y-2">
                  {materialCategories.map(category => (
                    <li 
                      key={category.id}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex justify-between items-center"
                    >
                      <span>{category.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Add New Category Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
          
          {submitError && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {submitError}
            </div>
          )}
          
          {submitSuccess && (
            <div className="mb-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
              {submitSuccess}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Type
              </label>
              <select
                name="type"
                value={newCategory.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="company">Company Category</option>
                <option value="material">Material Category</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Name
              </label>
              <input
                type="text"
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter category name"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}