'use client';

import { subDays } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import CompanyCard from './components/CompanyCard';
import DateRangePicker from './components/DateRangePicker';
import DependencyGraph from './components/DependencyGraph';
import NetworkFilterSettings from './components/NetworkFilterSettings';
import SearchBar, { SearchBarRef } from './components/SearchBar';
import {
  getDefenseCompanies,
  getMaterialCompanies,
  getPotentialDefenseCompanies
} from './services/companyService';
import {
  filterNetworkByNode,
  getDependencyNetwork
} from './services/networkService';
import type { Company, DependencyNetwork, MaterialCategory, NetworkNode } from './types';
import { DateRange } from './types';

export default function Home() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 14),
    endDate: new Date(),
    preset: '2w'
  });
  const [activeTab, setActiveTab] = useState<'defense' | 'potential' | 'materials'>('defense');
  const [networkCollapsed, setNetworkCollapsed] = useState(false);
  const [highlightedCompany, setHighlightedCompany] = useState<string | null>(null);
  
  // State for companies loaded from database
  const [defenseCompanies, setDefenseCompanies] = useState<Company[]>([]);
  const [potentialCompanies, setPotentialCompanies] = useState<Company[]>([]);
  const [materialCompanies, setMaterialCompanies] = useState<Company[]>([]);
  const [dependencyData, setDependencyData] = useState<DependencyNetwork>({ nodes: [], links: [] });
  const [filteredDependencyData, setFilteredDependencyData] = useState<DependencyNetwork>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [searchedNodeId, setSearchedNodeId] = useState<string | null>(null);
  
  // References for scrolling to companies
  const defenseRef = useRef<HTMLDivElement>(null);
  const potentialRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<HTMLDivElement>(null);
  
  // Add network filter settings state
  const [upstreamLevels, setUpstreamLevels] = useState(1);
  const [downstreamLevels, setDownstreamLevels] = useState(3);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Add router for URL manipulation
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializedFromUrlRef = useRef(false);
  
  // Load companies from database on mount
  useEffect(() => {
    async function loadCompanies() {
      setIsLoading(true);
      try {
        const [defense, potential, materials, network] = await Promise.all([
          getDefenseCompanies(),
          getPotentialDefenseCompanies(),
          getMaterialCompanies(),
          getDependencyNetwork()
        ]);
        
        setDefenseCompanies(defense);
        setPotentialCompanies(potential);
        setMaterialCompanies(materials);
        setDependencyData(network);
        setFilteredDependencyData(network);
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCompanies();
  }, []);
  
  // Load settings from local storage on initial render
  useEffect(() => {
    const savedUpstream = localStorage.getItem('networkFilterUpstreamLevels');
    const savedDownstream = localStorage.getItem('networkFilterDownstreamLevels');
    
    if (savedUpstream) {
      setUpstreamLevels(parseInt(savedUpstream));
    }
    
    if (savedDownstream) {
      setDownstreamLevels(parseInt(savedDownstream));
    }
  }, []);
  
  // Save settings to local storage when they change
  useEffect(() => {
    localStorage.setItem('networkFilterUpstreamLevels', upstreamLevels.toString());
    localStorage.setItem('networkFilterDownstreamLevels', downstreamLevels.toString());
  }, [upstreamLevels, downstreamLevels]);
  
  // Group material companies by category
  const materialCompaniesByCategory = materialCompanies.reduce((acc, company) => {
    if (!acc[company.category!]) {
      acc[company.category!] = [];
    }
    acc[company.category!].push(company);
    return acc;
  }, {} as Record<MaterialCategory, Company[]>);

  // Material category display names
  const materialCategoryNames: Record<MaterialCategory, string> = {
    steel: 'Steel & Metal Alloys',
    rareEarth: 'Rare Earth & Critical Materials',
    explosives: 'Explosives & Propellants',
    composites: 'Advanced Composites',
    electronics: 'Electronics & Semiconductor Materials',
    cybersecurity: 'Cybersecurity & Defense IT',
    missiles: 'Missile Systems',
    mobility: 'Mobility & Transport Systems'
  };

  // Update handleSearch to use the custom levels and update URL
  const handleSearch = (nodeId: string | null, shouldScroll: boolean = true) => {
    setSearchedNodeId(nodeId);
    
    // Update URL with search parameter
    updateUrlParams(nodeId, upstreamLevels, downstreamLevels);
    
    if (nodeId) {
      // Filter the network data based on the searched node using custom levels
      const filtered = filterNetworkByNode(dependencyData, nodeId, upstreamLevels, downstreamLevels);
      setFilteredDependencyData(filtered);
      
      // Also highlight the node
      const node = dependencyData.nodes.find(n => n.id === nodeId);
      if (node) {
        setHighlightedCompany(node.ticker);
        // Only scroll if explicitly requested
        if (shouldScroll) {
          scrollToCompany(node.ticker);
        }
      }
    } else {
      // Reset to full network when search is cleared
      setFilteredDependencyData(dependencyData);
      setHighlightedCompany(null);
    }
  };

  // Scroll to the company card in the appropriate tab
  const scrollToCompany = (ticker: string) => {
    let found = false;
    
    // Check defense companies
    const defenseCompany = defenseCompanies.find(c => c.ticker === ticker);
    if (defenseCompany) {
      handleTabChange('defense');
      found = true;
      setTimeout(() => {
        defenseRef.current?.scrollIntoView({ behavior: 'smooth' });
        const companyElement = document.getElementById(`company-${ticker}`);
        if (companyElement) {
          companyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    // Check potential companies
    const potentialCompany = potentialCompanies.find(c => c.ticker === ticker);
    if (potentialCompany) {
      handleTabChange('potential');
      found = true;
      setTimeout(() => {
        potentialRef.current?.scrollIntoView({ behavior: 'smooth' });
        const companyElement = document.getElementById(`company-${ticker}`);
        if (companyElement) {
          companyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    // Check material companies
    const materialCompany = materialCompanies.find(c => c.ticker === ticker);
    if (materialCompany) {
      handleTabChange('materials');
      found = true;
      setTimeout(() => {
        materialsRef.current?.scrollIntoView({ behavior: 'smooth' });
        const companyElement = document.getElementById(`company-${ticker}`);
        if (companyElement) {
          companyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    // If not found, just show all defense companies
    if (!found) {
      handleTabChange('defense');
      setTimeout(() => defenseRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // Handle node click in the network graph
  const handleNodeClick = (node: NetworkNode) => {
    handleSearch(node.id, false);
  };

  const searchBarRef = useRef<SearchBarRef>(null);

  // Function to clear search and reset filters
  const clearFilters = () => {
    // First clear the search input
    searchBarRef.current?.clearSearch();
    
    // Reset network options to defaults
    setUpstreamLevels(1);
    setDownstreamLevels(3);
    
    // Clear URL parameters but preserve timeframe and tab
    const params = new URLSearchParams();
    if (dateRange.preset) {
      params.set('timeframe', dateRange.preset);
    }
    params.set('tab', activeTab);
    window.history.replaceState({}, '', params.toString() ? `?${params.toString()}` : window.location.pathname);
    
    // Then reset the search state (this will not update URL again because of the null check in updateUrlParams)
    setSearchedNodeId(null);
    setFilteredDependencyData(dependencyData);
    setHighlightedCompany(null);
    
    // Reset the initialization flag
    initializedFromUrlRef.current = false;
  };

  // Handle settings change
  const handleSettingsChange = (newUpstream: number, newDownstream: number) => {
    setUpstreamLevels(newUpstream);
    setDownstreamLevels(newDownstream);
    
    // Update URL with new network options
    updateUrlParams(searchedNodeId, newUpstream, newDownstream);
    
    // Re-apply filter with new settings if a node is selected
    if (searchedNodeId) {
      const filtered = filterNetworkByNode(dependencyData, searchedNodeId, newUpstream, newDownstream);
      setFilteredDependencyData(filtered);
    }
  };

  // Function to update URL parameters
  const updateUrlParams = (nodeId: string | null, upstream: number, downstream: number) => {
    // Don't update URL if we're in the process of initializing from URL
    if (!initializedFromUrlRef.current && searchParams.get('node')) return;
    
    const params = new URLSearchParams();
    
    // Add date range preset to URL if available
    if (dateRange.preset) {
      params.set('timeframe', dateRange.preset);
    }
    
    // Add active tab to URL
    params.set('tab', activeTab);
    
    if (nodeId) {
      params.set('node', nodeId);
    } else {
      // If no node is selected, keep only the timeframe and tab parameters
      params.delete('node');
      params.delete('upstream');
      params.delete('downstream');
      window.history.replaceState({}, '', params.toString() ? `?${params.toString()}` : window.location.pathname);
      return;
    }
    
    // Only add network options if they differ from defaults
    if (upstream !== 1) {
      params.set('upstream', upstream.toString());
    }
    
    if (downstream !== 3) {
      params.set('downstream', downstream.toString());
    }
    
    // Update the URL without refreshing the page
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  // Handle date range change
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    
    // Update URL with new date range
    const params = new URLSearchParams(window.location.search);
    if (newDateRange.preset) {
      params.set('timeframe', newDateRange.preset);
    } else {
      params.delete('timeframe');
    }
    
    // Keep other parameters
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  // Handle tab change
  const handleTabChange = (tab: 'defense' | 'potential' | 'materials') => {
    setActiveTab(tab);
    
    // Update URL with new tab
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    
    // Keep other parameters
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  // Effect to initialize from URL parameters on load
  useEffect(() => {
    if (!dependencyData.nodes.length || initializedFromUrlRef.current) return; // Wait for data to be loaded and only run once
    
    const nodeId = searchParams.get('node');
    const upstreamParam = searchParams.get('upstream');
    const downstreamParam = searchParams.get('downstream');
    const timeframeParam = searchParams.get('timeframe');
    const tabParam = searchParams.get('tab');
    
    // Set active tab from URL if present
    if (tabParam === 'defense' || tabParam === 'potential' || tabParam === 'materials') {
      setActiveTab(tabParam);
    }
    
    // Set timeframe from URL if present
    if (timeframeParam) {
      // We'll set the date range based on the timeframe
      let newDateRange: DateRange;
      const now = new Date();
      
      if (timeframeParam === 'today') {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        newDateRange = {
          startDate: todayStart,
          endDate: now,
          isToday: true,
          preset: 'today'
        };
      } else if (timeframeParam === '1w') {
        newDateRange = {
          startDate: subDays(now, 7),
          endDate: now,
          preset: '1w'
        };
      } else if (timeframeParam === '2w') {
        newDateRange = {
          startDate: subDays(now, 14),
          endDate: now,
          preset: '2w'
        };
      } else if (timeframeParam === '1m') {
        newDateRange = {
          startDate: subDays(now, 30),
          endDate: now,
          preset: '1m'
        };
      } else if (timeframeParam === '3m') {
        newDateRange = {
          startDate: subDays(now, 90),
          endDate: now,
          preset: '3m'
        };
      } else if (timeframeParam === '6m') {
        newDateRange = {
          startDate: subDays(now, 180),
          endDate: now,
          preset: '6m'
        };
      } else if (timeframeParam === 'custom') {
        // For custom, we'll keep the default date range but mark it as custom
        newDateRange = {
          ...dateRange,
          preset: 'custom'
        };
      } else {
        // Default to 2 weeks if timeframe is not recognized
        newDateRange = {
          startDate: subDays(now, 14),
          endDate: now,
          preset: '2w'
        };
      }
      
      setDateRange(newDateRange);
    }
    
    // Set network options from URL if present
    const newUpstream = upstreamParam ? parseInt(upstreamParam, 10) : 1;
    const newDownstream = downstreamParam ? parseInt(downstreamParam, 10) : 3;
    
    // Update levels first
    setUpstreamLevels(newUpstream);
    setDownstreamLevels(newDownstream);
    
    // Apply search if node parameter is present
    if (nodeId) {
      // We'll use a direct approach instead of handleSearch to avoid double URL updates
      setSearchedNodeId(nodeId);
      
      // Filter the network data based on the searched node using custom levels
      const filtered = filterNetworkByNode(dependencyData, nodeId, newUpstream, newDownstream);
      setFilteredDependencyData(filtered);
      
      // Also highlight the node
      const node = dependencyData.nodes.find(n => n.id === nodeId);
      if (node) {
        setHighlightedCompany(node.ticker);
      }
    }
    
    // Mark as initialized
    initializedFromUrlRef.current = true;
  // Only run when dependencyData or searchParams change
  }, [dependencyData, searchParams]);

  // Add a function to filter companies based on the filtered network data
  const getFilteredCompanies = (companies: Company[]) => {
    if (!searchedNodeId) {
      // If no node is selected, show all companies
      return companies;
    }
    
    // Get the tickers of nodes in the filtered network
    const filteredTickers = new Set(filteredDependencyData.nodes.map(node => node.ticker));
    
    // Filter companies to only include those in the filtered network
    return companies.filter(company => filteredTickers.has(company.ticker));
  };

  return (
    <div className="min-h-screen pb-10 bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Defence Industry Dashboard
            </h1>
            <SearchBar 
              nodes={dependencyData.nodes} 
              onSearchResult={handleSearch}
              selectedNodeId={searchedNodeId}
              ref={searchBarRef}
            />
          </div>
          <div className="flex justify-between items-center">
            <DateRangePicker 
              onChange={handleDateRangeChange} 
              selectedPreset={dateRange.preset}
            />
            {searchedNodeId && (
              <div className="mt-2 text-sm text-center">
                <button 
                  onClick={clearFilters}
                  className="text-blue-600 hover:underline"
                >
                  Clear filter and show full network
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Network Graph - Always Visible */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Defence Industry Supply Chain Network</h2>
            <button 
              onClick={() => setNetworkCollapsed(!networkCollapsed)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              {networkCollapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
          
          {!networkCollapsed && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                <p className="text-gray-600 dark:text-gray-400">
                  This interactive network visualizes the dependencies between defense manufacturers, suppliers, 
                  and material providers. <strong>Click on any node to view detailed company information below.</strong>
                </p>
                {searchedNodeId && (
                  <div className="mt-2 md:mt-0 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm flex items-center relative">
                    <span>
                      Showing filtered network: connections {upstreamLevels} level{upstreamLevels > 1 ? 's' : ''} up and {downstreamLevels} level{downstreamLevels > 1 ? 's' : ''} down from selected company
                    </span>
                    <div className="flex items-center ml-2">
                      <button 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                        title="Filter Settings"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button 
                        onClick={clearFilters}
                        className="ml-2 px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded hover:bg-blue-300 dark:hover:bg-blue-700 transition"
                      >
                        Reset
                      </button>
                      <NetworkFilterSettings 
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        upstreamLevels={upstreamLevels}
                        downstreamLevels={downstreamLevels}
                        onSettingsChange={handleSettingsChange}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className={`transition-all duration-300 ${networkCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
                <DependencyGraph 
                  data={filteredDependencyData} 
                  dateRange={dateRange} 
                  onNodeClick={handleNodeClick}
                  highlightedNode={highlightedCompany}
                  height={450}
                />
              </div>
            </>
          )}
        </div>

        {/* Add a message above the tabs to indicate filtering */}
        {searchedNodeId && (
          <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm text-blue-800 dark:text-blue-200">
            <p>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Showing only companies that are part of the filtered network. 
              <button 
                onClick={clearFilters}
                className="ml-2 underline hover:text-blue-600 dark:hover:text-blue-300"
              >
                Clear filter
              </button>
            </p>
          </div>
        )}

        {/* Tabs - Below Network Graph */}
        <div className="flex flex-wrap border-b mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'defense'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('defense')}
          >
            Defense Companies
            {searchedNodeId && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                {getFilteredCompanies(defenseCompanies).length}
              </span>
            )}
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'potential'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('potential')}
          >
            Potential Defense Companies
            {searchedNodeId && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                {getFilteredCompanies(potentialCompanies).length}
              </span>
            )}
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'materials'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('materials')}
          >
            Crucial Materials
            {searchedNodeId && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                {Object.values(materialCompaniesByCategory).flat().filter(company => 
                  filteredDependencyData.nodes.some(node => node.ticker === company.ticker)
                ).length}
              </span>
            )}
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading company data...</p>
          </div>
        )}

        {/* Companies Grid for Defense and Potential tabs */}
        {!isLoading && activeTab === 'defense' && (
          <div ref={defenseRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defenseCompanies.length === 0 ? (
              <div className="col-span-3 py-10 text-center">
                <p className="text-gray-600 dark:text-gray-400">No defense companies found. Please check database connection.</p>
              </div>
            ) : getFilteredCompanies(defenseCompanies).length === 0 && searchedNodeId ? (
              <div className="col-span-3 py-10 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No defense companies in the current filtered network view.
                </p>
              </div>
            ) : (
              getFilteredCompanies(defenseCompanies).map((company) => (
                <CompanyCard
                  key={company.ticker}
                  company={company}
                  dateRange={dateRange}
                  highlighted={company.ticker === highlightedCompany}
                />
              ))
            )}
          </div>
        )}
        
        {!isLoading && activeTab === 'potential' && (
          <div ref={potentialRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {potentialCompanies.length === 0 ? (
              <div className="col-span-3 py-10 text-center">
                <p className="text-gray-600 dark:text-gray-400">No potential defense companies found. Please check database connection.</p>
              </div>
            ) : getFilteredCompanies(potentialCompanies).length === 0 && searchedNodeId ? (
              <div className="col-span-3 py-10 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No potential defense companies in the current filtered network view.
                </p>
              </div>
            ) : (
              getFilteredCompanies(potentialCompanies).map((company) => (
                <CompanyCard
                  key={company.ticker}
                  company={company}
                  dateRange={dateRange}
                  highlighted={company.ticker === highlightedCompany}
                />
              ))
            )}
          </div>
        )}

        {/* Materials Companies with Category Separators */}
        {!isLoading && activeTab === 'materials' && (
          <div ref={materialsRef}>
            {Object.keys(materialCompaniesByCategory).length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-600 dark:text-gray-400">No material companies found. Please check database connection.</p>
              </div>
            ) : Object.values(materialCompaniesByCategory).flat().filter(company => 
                filteredDependencyData.nodes.some(node => node.ticker === company.ticker)
              ).length === 0 && searchedNodeId ? (
              <div className="py-10 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No material companies in the current filtered network view.
                </p>
              </div>
            ) : (
              Object.entries(materialCompaniesByCategory).map(([category, companies]) => {
                const filteredCompanies = getFilteredCompanies(companies);
                // Skip categories with no companies after filtering
                if (filteredCompanies.length === 0 && searchedNodeId) return null;
                
                return (
                  <div key={category} className="mb-10">
                    <h2 className="text-xl font-bold mb-4 pb-2 border-b">
                      {materialCategoryNames[category as MaterialCategory]}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCompanies.map((company) => (
                        <CompanyCard
                          key={company.ticker}
                          company={company}
                          dateRange={dateRange}
                          highlighted={company.ticker === highlightedCompany}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 py-6 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Defence Industry Dashboard - Stock data powered by Yahoo Finance
          </p>
        </div>
      </footer>
    </div>
  );
}