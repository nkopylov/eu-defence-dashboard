'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NetworkNode } from '../types';

interface SearchBarProps {
  nodes: NetworkNode[];
  onSearchResult: (nodeId: string | null) => void;
  selectedNodeId?: string | null;
}

export interface SearchBarRef {
  clearSearch: () => void;
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(({ nodes, onSearchResult, selectedNodeId }, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<NetworkNode[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Update the search query when the selected node changes
  useEffect(() => {
    if (selectedNodeId) {
      const selectedNode = nodes.find(node => node.id === selectedNodeId);
      if (selectedNode) {
        setSearchQuery(selectedNode.name);
        initializedRef.current = true;
      }
    } else if (initializedRef.current) {
      // Only clear if we've previously initialized (prevents clearing on first render)
      setSearchQuery('');
    }
  }, [selectedNodeId, nodes]);

  // Initialize from URL on first load
  useEffect(() => {
    if (!initializedRef.current && nodes.length > 0) {
      // Check if there's a node parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const nodeId = urlParams.get('node');
      
      if (nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          setSearchQuery(node.name);
          initializedRef.current = true;
        }
      }
    }
  }, [nodes]);

  // Expose clearSearch method to parent component
  useImperativeHandle(ref, () => ({
    clearSearch: () => {
      setSearchQuery('');
      setResults([]);
      setShowResults(false);
    }
  }));

  // Filter nodes based on search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredNodes = nodes.filter(node => 
      node.name.toLowerCase().includes(query) || 
      node.ticker.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 results
    
    setResults(filteredNodes);
  }, [searchQuery, nodes]);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (results.length > 0) {
      // Select the first result if there are any
      handleSelectNode(results[0].id);
    }
  };

  const handleSelectNode = (nodeId: string) => {
    onSearchResult(nodeId);
    setResults([]);
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearchResult(null);
    setResults([]);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSearch} className="flex w-full">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="w-full px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Search companies..."
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {showResults && results.length > 0 && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
          <ul>
            {results.map((node) => (
              <li 
                key={node.id}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                onClick={() => handleSelectNode(node.id)}
              >
                <div className="font-medium">{node.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{node.ticker}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;