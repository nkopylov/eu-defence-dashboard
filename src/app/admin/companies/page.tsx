'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Company } from '@/app/types';

// Tabs for filtering companies
type CompanyTab = 'all' | 'defense' | 'potential' | 'materials';

export default function CompaniesAdmin() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CompanyTab>('all');
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
      // Redirect to admin page
      window.location.href = '/admin';
    }
  }, []);

  // Load all companies
  useEffect(() => {
    async function loadCompanies() {
      setIsLoading(true);
      try {
        // Get auth key from either storage
        const authKey = sessionStorage.getItem('adminAuthKey') || localStorage.getItem('adminAuthKey');
        const response = await fetch('/api/admin/companies', {
          headers: {
            'Authorization': `Bearer ${authKey}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch companies');
        }
        
        setCompanies(data.companies);
      } catch (error) {
        console.error('Error loading companies:', error);
        setError('Failed to load companies. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCompanies();
  }, []);

  // Filter companies based on active tab and search query
  const filteredCompanies = companies.filter(company => {
    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'defense' && !company.ticker.includes('RHM') && !company.ticker.includes('BA.L')) {
        return false;
      }
      if (activeTab === 'potential' && !company.defensePotential) {
        return false;
      }
      if (activeTab === 'materials' && !company.category) {
        return false;
      }
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        company.name.toLowerCase().includes(query) ||
        company.ticker.toLowerCase().includes(query) ||
        company.country.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Handle company deletion
  async function handleDeleteCompany(ticker: string) {
    if (!confirm(`Are you sure you want to delete company ${ticker}?`)) {
      return;
    }
    
    try {
      // Get auth key from either storage
      const authKey = sessionStorage.getItem('adminAuthKey') || localStorage.getItem('adminAuthKey');
      const response = await fetch(`/api/admin/companies/${encodeURIComponent(ticker)}`, {
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
        throw new Error(data.error || 'Failed to delete company');
      }
      
      // Remove the company from the state
      setCompanies(companies.filter(c => c.ticker !== ticker));
    } catch (error) {
      console.error('Error deleting company:', error);
      setError('Failed to delete company. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Company Management</h1>
          <Link 
            href="/admin"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Admin
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between mb-6">
            <div className="flex space-x-4 mb-4 sm:mb-0">
              <button
                className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded ${activeTab === 'defense' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => setActiveTab('defense')}
              >
                Defense
              </button>
              <button
                className={`px-4 py-2 rounded ${activeTab === 'potential' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => setActiveTab('potential')}
              >
                Potential
              </button>
              <button
                className={`px-4 py-2 rounded ${activeTab === 'materials' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => setActiveTab('materials')}
              >
                Materials
              </button>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border rounded w-48 sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <Link
                href="/admin/companies/new"
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
              {filteredCompanies.length === 0 ? (
                <div className="text-center p-10 text-gray-500 dark:text-gray-400">
                  No companies found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ticker
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredCompanies.map((company) => (
                        <tr key={company.ticker} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{company.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{company.ticker}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{company.country}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${company.category ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                company.defensePotential ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                              {company.category ? 'Material' : company.defensePotential ? 'Potential' : 'Defense'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link 
                                href={`/admin/companies/edit/${encodeURIComponent(company.ticker)}`}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteCompany(company.ticker)}
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