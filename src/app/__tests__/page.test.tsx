import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home, { HomeContent } from '../page'; // Adjust if HomeContent is not exported directly
import { Company, DependencyNetwork, NetworkNode, DateRange } from '../types';

// --- Mocks ---

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useRouter: jest.fn(() => ({ replace: jest.fn() })), // Mock useRouter if used for navigation
}));

// Mock services
const mockCompanyA: Company = { id: 'A', name: 'Company A', ticker: 'TKA', country: 'USA', sector: 'Defense', products: 'Planes', category: 'defenseCompanies' };
const mockCompanyB: Company = { id: 'B', name: 'Company B', ticker: 'TKB', country: 'USA', sector: 'Defense', products: 'Ships', category: 'defenseCompanies' };

const mockCompanies = [mockCompanyA, mockCompanyB];

const mockDependencyData: DependencyNetwork = {
  nodes: [
    { id: 'TKA', name: 'Company A', ticker: 'TKA', type: 'manufacturer', country: 'USA', category: 'defenseCompanies', details: {} },
    { id: 'TKB', name: 'Company B', ticker: 'TKB', type: 'manufacturer', country: 'USA', category: 'defenseCompanies', details: {} },
  ],
  links: [{ source: 'TKA', target: 'TKB', type: 'supplier' }],
};

jest.mock('../services/companyService', () => ({
  getDefenseCompanies: jest.fn(() => Promise.resolve(mockCompanies)),
  getPotentialDefenseCompanies: jest.fn(() => Promise.resolve([])),
  getMaterialCompanies: jest.fn(() => Promise.resolve([])),
}));

const mockFilterNetworkByNode = jest.fn((data, nodeId, upstream, downstream) => {
  const node = data.nodes.find(n => n.id === nodeId);
  return {
    nodes: node ? [node] : [],
    links: [],
  };
});
jest.mock('../services/networkService', () => ({
  getDependencyNetwork: jest.fn(() => Promise.resolve(mockDependencyData)),
  filterNetworkByNode: mockFilterNetworkByNode,
}));

jest.mock('../services/stockService', () => ({
  getStockData: jest.fn(() => Promise.resolve([])),
}));

// Mock child components
jest.mock('../components/DependencyGraph', () => () => <div data-testid="dependency-graph">Dependency Graph</div>);
jest.mock('../components/NewsFeed', () => () => <div data-testid="news-feed">News Feed</div>);
// CompanyCard uses StockChart, but getStockData is mocked, so it should be fine.

// Mock window.history.replaceState
const mockReplaceState = jest.fn();
Object.defineProperty(window, 'history', {
  value: {
    replaceState: mockReplaceState,
    pushState: jest.fn(), // Add if used
    scrollRestoration: 'auto',
  },
  writable: true,
});

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.scrollTo = jest.fn();


// --- Test Suite ---
describe('HomeContent Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useSearchParams mock for each test if needed
    (require('next/navigation').useSearchParams as jest.Mock).mockImplementation(() => new URLSearchParams());
  });

  test('filters companies when a filter button on CompanyCard is clicked', async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <HomeContent />
      </Suspense>
    );

    // 1. Initial State: Wait for both companies to be rendered
    // CompanyCard renders name and ticker like "Company A (TKA)"
    expect(await screen.findByText(/Company A \(TKA\)/)).toBeInTheDocument();
    expect(await screen.findByText(/Company B \(TKB\)/)).toBeInTheDocument();

    // 2. Simulate Filter Button Click for Company A
    const companyANameElement = screen.getByText((content, element) => 
      element?.tagName.toLowerCase() === 'h3' && content.startsWith(mockCompanyA.name)
    );
    const companyAGroupElement = companyANameElement.closest('.group'); // CompanyCard has a div with 'group'
    
    if (!companyAGroupElement) throw new Error('Could not find group element for Company A card');

    // Hover over Company A's card to make the filter button "visible"
    fireEvent.mouseEnter(companyAGroupElement);
    
    const filterButtonA = screen.getByLabelText(`Filter by ${mockCompanyA.name}`);
    fireEvent.click(filterButtonA);

    // 3. Filtering Verification
    await waitFor(() => {
      // Assert Company A is still visible
      expect(screen.getByText(/Company A \(TKA\)/)).toBeInTheDocument();
      
      // Assert Company A's card is highlighted (has ring-2 class)
      // The card div is a few levels up from the h3.
      const companyACardDiv = companyANameElement.closest('div[id^="company-"]');
      expect(companyACardDiv).toHaveClass('ring-2'); 
    });

    // Assert Company B is no longer visible
    // After filtering, the list of companies passed to the map function changes.
    expect(screen.queryByText(/Company B \(TKB\)/)).not.toBeInTheDocument();
    
    // Assert filterNetworkByNode was called correctly
    // Default levels are upstream: 1, downstream: 3
    expect(mockFilterNetworkByNode).toHaveBeenCalledWith(
      mockDependencyData,
      mockCompanyA.ticker, // The ticker is used as nodeId
      1, // default upstreamLevels
      3  // default downstreamLevels
    );

    // Assert window.history.replaceState was called with correct params
    // The URL parameters are: ?tab=defense&node=TKA
    // The order of params might vary, so check for relevant parts.
    expect(mockReplaceState).toHaveBeenCalledWith(
      expect.any(Object),
      '',
      expect.stringContaining(`node=${mockCompanyA.ticker}`)
    );
    expect(mockReplaceState).toHaveBeenCalledWith(
      expect.any(Object),
      '',
      expect.stringContaining('tab=defense') // Default tab
    );
  });
});

// Render Home component to ensure Suspense is handled as in actual app
describe('Home Page', () => {
  test('renders HomeContent within Suspense', async () => {
    render(<Home />);
    expect(await screen.findByText(/Company A \(TKA\)/)).toBeInTheDocument();
    expect(await screen.findByTestId('dependency-graph')).toBeInTheDocument();
  });
});
