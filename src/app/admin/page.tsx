'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authKey, setAuthKey] = useState('');
  const [error, setError] = useState('');
  
  // Check if user is already authenticated on page load
  useEffect(() => {
    // Check both sessionStorage and localStorage for authentication key
    const sessionAuthKey = sessionStorage.getItem('adminAuthKey');
    const localAuthKey = localStorage.getItem('adminAuthKey');
    
    const savedAuthKey = sessionAuthKey || localAuthKey;
    
    if (savedAuthKey) {
      // Verify the saved key is valid
      verifyAuthKey(savedAuthKey);
    }
  }, []);
  
  // Function to verify an auth key with the API
  async function verifyAuthKey(key: string) {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        setAuthKey(key);
        setIsAuthorized(true);
        // Ensure the key is in both storage types for persistence
        sessionStorage.setItem('adminAuthKey', key);
        localStorage.setItem('adminAuthKey', key);
      }
    } catch (error) {
      console.error('Error verifying saved auth key:', error);
    }
  }

  async function handleAuth() {
    try {
      console.log('Authenticating with key:', authKey);
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authKey}`
        },
        // Empty body for the POST request
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      console.log('Auth response:', data);
      
      if (response.ok) {
        setIsAuthorized(true);
        setError('');
        // Store the auth key in both session and local storage for persistence
        sessionStorage.setItem('adminAuthKey', authKey);
        localStorage.setItem('adminAuthKey', authKey);
      } else {
        setError(`Invalid authorization key: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setError('Authentication failed');
      console.error('Auth error:', error);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Authentication</h1>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Authorization Key
            </label>
            <input
              type="password"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter admin authorization key"
            />
          </div>
          {error && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}
          <button
            onClick={handleAuth}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Manage database entities and dependencies for the Defence Industry Dashboard.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
              <h2 className="text-xl font-semibold mb-2">Companies</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage defence companies, potential companies, and material providers.
              </p>
              <Link href="/admin/companies" className="text-blue-600 dark:text-blue-400 hover:underline">
                Manage Companies →
              </Link>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
              <h2 className="text-xl font-semibold mb-2">Dependencies</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage supply chain dependencies between companies.
              </p>
              <Link href="/admin/dependencies" className="text-blue-600 dark:text-blue-400 hover:underline">
                Manage Dependencies →
              </Link>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
              <h2 className="text-xl font-semibold mb-2">Categories</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage company and material categories.
              </p>
              <Link href="/admin/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
                Manage Categories →
              </Link>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
              <h2 className="text-xl font-semibold mb-2">Database Setup</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Initialize or reset the database schema.
              </p>
              <Link href="/db-setup" className="text-blue-600 dark:text-blue-400 hover:underline">
                Database Setup →
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/admin/companies/new" 
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            >
              Add New Company
            </Link>
            <Link 
              href="/admin/dependencies/new" 
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Add New Dependency
            </Link>
            <button 
              onClick={() => {
                // Clear auth keys from both storages
                sessionStorage.removeItem('adminAuthKey');
                localStorage.removeItem('adminAuthKey');
                setIsAuthorized(false);
              }}
              className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}