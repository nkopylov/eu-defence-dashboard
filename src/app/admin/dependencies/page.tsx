'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NetworkLink } from '@/app/types';

interface DependencyWithNames extends NetworkLink {
  id: number;
  source_name: string;
  target_name: string;
}

export default function DependenciesAdmin() {
  const [dependencies, setDependencies] = useState<DependencyWithNames[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Check authentication
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
      // Use Next.js router instead of window.location for better SPA behavior
      import('next/navigation').then(({ useRouter }) => {
        const router = useRouter();
        router.push('/admin');
      });
    }
  }, []);

  // Load all dependencies
  useEffect(() => {
    async function loadDependencies() {
      setIsLoading(true);
      try {
        // Get auth key from either storage
        const authKey = sessionStorage.getItem('adminAuthKey') || localStorage.getItem('adminAuthKey');
        const response = await fetch('/api/admin/dependencies', {
          headers: {
            'Authorization': `Bearer ${authKey}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch dependencies');
        }
        
        setDependencies(data.dependencies);
      } catch (error) {
        console.error('Error loading dependencies:', error);
        setError('Failed to load dependencies. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDependencies();
  }, []);

  // Filter dependencies based on search query
  const filteredDependencies = dependencies.filter(dependency => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        dependency.source_name.toLowerCase().includes(query) ||
        dependency.target_name.toLowerCase().includes(query) ||
        dependency.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Handle dependency deletion
  async function handleDeleteDependency(id: number) {
    if (!confirm(`Are you sure you want to delete this dependency?`)) {
      return;
    }
    
    try {
      const authKey = sessionStorage.getItem('adminAuthKey');
      const response = await fetch(`/api/admin/dependencies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete dependency');
      }
      
      // Remove the dependency from the state
      setDependencies(dependencies.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting dependency:', error);
      setError('Failed to delete dependency. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Supply Chain Dependencies</h1>
          <Link 
            href="/admin"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Admin
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">All Dependencies</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search dependencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <Link
                href="/admin/dependencies/new"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Add New
              </Link>
            </div>
          </div>
          
          {error && (
            <div className="p-3 mb-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              {filteredDependencies.length === 0 ? (
                <div className="text-center p-10 text-gray-500 dark:text-gray-400">
                  No dependencies found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          From
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Strength
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredDependencies.map((dependency) => (
                        <tr key={dependency.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{dependency.source_name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{dependency.source}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{dependency.target_name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{dependency.target}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">{dependency.value}/10</span>
                              <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${dependency.value * 10}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm line-clamp-2">{dependency.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link 
                                href={`/admin/dependencies/edit/${dependency.id}`}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteDependency(dependency.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}