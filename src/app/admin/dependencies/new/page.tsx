'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Company } from '@/app/types';

export default function NewDependencyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  
  const [formData, setFormData] = useState({
    source: '',
    target: '',
    description: '',
    value: 5 // Default value in the middle of the range
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

    // Fetch companies for the dropdowns
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const response = await fetch('/api/admin/companies', {
          headers: {
            'Authorization': `Bearer ${authKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCompanies(data.companies || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: name === 'value' ? parseInt(value, 10) : value
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
      const response = await fetch('/api/admin/dependencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authKey}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        router.push('/admin/dependencies');
      } else {
        setError(data.error || 'Failed to create dependency');
      }
    } catch (error) {
      setError('An error occurred while creating the dependency');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add New Dependency</h1>
          <Link href="/admin/dependencies" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Dependencies
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        {isLoadingCompanies ? (
          <div className="text-center p-4">
            <p>Loading companies data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source Company *
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select Source Company</option>
                  {companies.map(company => (
                    <option key={`source-${company.ticker}`} value={company.ticker}>
                      {company.name} ({company.ticker})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Company *
                </label>
                <select
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select Target Company</option>
                  {companies.map(company => (
                    <option key={`target-${company.ticker}`} value={company.ticker}>
                      {company.name} ({company.ticker})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Describe the dependency relationship"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dependency Strength (1-10) *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    name="value"
                    min="1"
                    max="10"
                    value={formData.value}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <span className="text-lg font-medium">{formData.value}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Weak</span>
                  <span>Strong</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Link
                href="/admin/dependencies"
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Dependency'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}