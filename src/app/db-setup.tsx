'use client';

import { useState } from 'react';

export default function DbSetup() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  async function initializeDatabase() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/db-setup', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer dev-api-key'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult('Success! Database initialized and seeded.');
      } else {
        setResult(`Error: ${data.error || 'Failed to initialize database'}`);
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Database Setup</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          This will initialize the database schema and seed it with company data.
        </p>
        
        <button 
          onClick={initializeDatabase}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Initializing...' : 'Initialize Database'}
        </button>
        
        {result && (
          <div className={`mt-4 p-3 rounded ${result.startsWith('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result}
          </div>
        )}
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>This setup page should only be accessible to administrators.</p>
          <p>In production, ensure this page is protected by authentication.</p>
        </div>
      </div>
    </div>
  );
}