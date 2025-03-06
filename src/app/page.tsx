'use client';

import { subDays } from 'date-fns';
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

  // Update handleSearch to use the custom levels
  const handleSearch = (nodeId: string | null, shouldScroll: boolean = true) => {
    setSearchedNodeId(nodeId);
    
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
    // Find which list this company is in
    let found = false;
    
    // Check defense companies
    const defenseCompany = defenseCompanies.find(c => c.ticker === ticker);
    if (defenseCompany) {
      setActiveTab('defense');
      found = true;
      setTimeout(() => {
        defenseRef.current?.scrollIntoView({ behavior: 'smooth' });
        // Find the specific company card and scroll to it
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
      setActiveTab('potential');
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
      setActiveTab('materials');
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
      setActiveTab('defense');
      setTimeout(() => defenseRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // Handle node click in the network graph
  const handleNodeClick = (node: NetworkNode) => {
    // Use the search functionality but don't scroll - stay focused on the graph
    console.log(`Node clicked: ${node.id}, applying filter with upstream=${upstreamLevels}, downstream=${downstreamLevels}`);
    handleSearch(node.id, false);
  };

  const searchBarRef = useRef<SearchBarRef>(null);

  // Function to clear search and reset filters
  const clearFilters = () => {
    // First clear the search input
    searchBarRef.current?.clearSearch();
    // Then reset the search state
    handleSearch(null);
  };

  // Handle settings change
  const handleSettingsChange = (newUpstream: number, newDownstream: number) => {
    setUpstreamLevels(newUpstream);
    setDownstreamLevels(newDownstream);
    
    // Re-apply filter with new settings if a node is selected
    if (searchedNodeId) {
      const filtered = filterNetworkByNode(dependencyData, searchedNodeId, newUpstream, newDownstream);
      setFilteredDependencyData(filtered);
    }
  };

  return (
    <div className="min-h-screen pb-10 bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Defence Industry Dashboard
            </h1>
            <DateRangePicker onChange={setDateRange} />
          </div>
          <div className="w-full max-w-2xl mx-auto">
            <SearchBar 
              ref={searchBarRef}
              nodes={dependencyData.nodes} 
              onSearchResult={handleSearch}
              selectedNodeId={searchedNodeId}
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

        {/* Tabs - Below Network Graph */}
        <div className="flex flex-wrap border-b mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'defense'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('defense')}
          >
            Defense Companies
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'potential'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('potential')}
          >
            Potential Defense Companies
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'materials'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('materials')}
          >
            Crucial Materials
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
            ) : (
              defenseCompanies.map((company) => (
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
            ) : (
              potentialCompanies.map((company) => (
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
            ) : (
              Object.entries(materialCompaniesByCategory).map(([category, companies]) => (
                <div key={category} className="mb-10">
                  <h2 className="text-xl font-bold mb-4 pb-2 border-b">
                    {materialCategoryNames[category as MaterialCategory]}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                      <CompanyCard
                        key={company.ticker}
                        company={company}
                        dateRange={dateRange}
                        highlighted={company.ticker === highlightedCompany}
                      />
                    ))}
                  </div>
                </div>
              ))
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
