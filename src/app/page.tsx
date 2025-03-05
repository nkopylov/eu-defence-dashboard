'use client';

import { useState, useRef, useEffect } from 'react';
import type { Company, MaterialCategory, NetworkNode, DependencyNetwork } from './types';
import DateRangePicker from './components/DateRangePicker';
import CompanyCard from './components/CompanyCard';
import DependencyGraph from './components/DependencyGraph';
import SearchBar from './components/SearchBar';
import { DateRange } from './types';
import { subDays } from 'date-fns';
import { 
  getDefenseCompanies, 
  getPotentialDefenseCompanies, 
  getMaterialCompanies 
} from './services/companyService';
import { 
  getDependencyNetwork,
  filterNetworkByNode
} from './services/networkService';

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
  
  // Group material companies by category
  const materialCompaniesByCategory = materialCompanies.reduce((acc, company) => {
    if (!acc[company.category!]) {
      acc[company.category!] = [];
    }
    acc[company.category!].push(company);
    return acc;
  }, {} as Record<MaterialCategory, Company[]>);

  const categoryNames: Record<MaterialCategory, string> = {
    steel: 'Steel & Metals',
    rareEarth: 'Rare Earth & Critical Minerals',
    explosives: 'Explosives & Chemicals',
    composites: 'Advanced Composites & Materials',
    electronics: 'Electronics & Semiconductor Materials'
  };

  // Handle search results from the search bar
  const handleSearch = (nodeId: string | null) => {
    setSearchedNodeId(nodeId);
    
    if (nodeId) {
      // Filter the network data based on the searched node
      const filtered = filterNetworkByNode(dependencyData, nodeId);
      setFilteredDependencyData(filtered);
      
      // Also highlight the node
      const node = dependencyData.nodes.find(n => n.id === nodeId);
      if (node) {
        setHighlightedCompany(node.ticker);
        scrollToCompany(node.ticker);
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
    // Set the highlighted company to the clicked node's ticker
    setHighlightedCompany(node.ticker);
    scrollToCompany(node.ticker);
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
              nodes={dependencyData.nodes} 
              onSearchResult={handleSearch} 
            />
            {searchedNodeId && (
              <div className="mt-2 text-sm text-center">
                <button 
                  onClick={() => handleSearch(null)}
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
                  <div className="mt-2 md:mt-0 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm">
                    Showing filtered network: connections 1 level up and 3 levels down from selected company
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
                    {categoryNames[category as MaterialCategory]}
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
