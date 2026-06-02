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
const mockCompanyC: Company = { id: 'C', name: 'Company C', ticker: 'TKC', country: 'USA', sector: 'Defense', products: 'Radar', category: 'defenseCompanies' };


const mockCompanies = [mockCompanyA, mockCompanyB, mockCompanyC];

// Formatted IDs as they would appear in dependencyData.nodes
const mockFormattedIdA = mockCompanyA.ticker.toLowerCase().replace(/\./g, '-'); // tka
const mockFormattedIdB = mockCompanyB.ticker.toLowerCase().replace(/\./g, '-'); // tkb
const mockFormattedIdC = mockCompanyC.ticker.toLowerCase().replace(/\./g, '-'); // tkc


const mockDependencyData: DependencyNetwork = {
  nodes: [
    { id: mockFormattedIdA, name: 'Company A', ticker: 'TKA', type: 'manufacturer', country: 'USA', category: 'defenseCompanies', details: {} },
    { id: mockFormattedIdB, name: 'Company B', ticker: 'TKB', type: 'manufacturer', country: 'USA', category: 'defenseCompanies', details: {} },
    { id: mockFormattedIdC, name: 'Company C', ticker: 'TKC', type: 'manufacturer', country: 'USA', category: 'defenseCompanies', details: {} },
  ],
  links: [
    { source: mockFormattedIdA, target: mockFormattedIdB, type: 'supplier' },
    { source: mockFormattedIdB, target: mockFormattedIdC, type: 'customer' },
  ],
};

jest.mock('../services/companyService', () => {
  const original = jest.requireActual('../services/companyService');
  return {
    ...original,
    getDefenseCompanies: jest.fn(() => Promise.resolve(mockCompanies)),
    getPotentialDefenseCompanies: jest.fn(() => Promise.resolve([])),
    getMaterialCompanies: jest.fn(() => Promise.resolve([])),
  };
});

const mockFilterNetworkByNode = jest.fn((data, nodeId, upstream, downstream) => {
  // Simulate filtering: return only the specified node, ignore levels for mock simplicity for now
  const selectedNode = data.nodes.find(n => n.id === nodeId);
  if (selectedNode) {
    // If specific levels 0,0 are passed, assume we only want the node itself.
    if (upstream === 0 && downstream === 0) {
      return { nodes: [selectedNode], links: [] };
    }
    // Otherwise, for this mock, just return the selected node and its direct links for simplicity
    // A more sophisticated mock could trace dependencies based on up/down levels.
    const relatedLinks = data.links.filter(link => link.source === nodeId || link.target === nodeId);
    const relatedNodeIds = new Set<string>([selectedNode.id]);
    relatedLinks.forEach(link => {
      relatedNodeIds.add(link.source);
      relatedNodeIds.add(link.target);
    });
    const relatedNodes = data.nodes.filter(n => relatedNodeIds.has(n.id));
    return { nodes: relatedNodes, links: relatedLinks };
  }
  return { nodes: [], links: [] };
});

jest.mock('../services/networkService', () => {
  const original = jest.requireActual('../services/networkService');
  return {
    ...original,
    getDependencyNetwork: jest.fn(() => Promise.resolve(mockDependencyData)),
    filterNetworkByNode: mockFilterNetworkByNode,
  };
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
    expect(await screen.findByText(/Company C \(TKC\)/)).toBeInTheDocument();


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

    // Assert Company B and C are no longer visible
    expect(screen.queryByText(/Company B \(TKB\)/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Company C \(TKC\)/)).not.toBeInTheDocument();
    
    // Assert filterNetworkByNode was called with 0 upstream/downstream levels
    expect(mockFilterNetworkByNode).toHaveBeenCalledWith(
      mockDependencyData,
      mockFormattedIdA, // Use the formatted ID
      0, // upstream levels
      0  // downstream levels
    );

    // Assert window.history.replaceState was called with correct params for 0,0 levels
    // URL should include node=tka, upstream=0, downstream=0
    // Note: updateUrlParams adds upstream/downstream if they are NOT the default 1 and 3.
    // So, 0,0 should be present.
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith(
        expect.any(Object),
        '',
        expect.stringContaining(`node=${mockFormattedIdA}`)
      );
      expect(mockReplaceState).toHaveBeenCalledWith(
        expect.any(Object),
        '',
        expect.stringContaining('upstream=0')
      );
      expect(mockReplaceState).toHaveBeenCalledWith(
        expect.any(Object),
        '',
        expect.stringContaining('downstream=0')
      );
      expect(mockReplaceState).toHaveBeenCalledWith(
        expect.any(Object),
        '',
        expect.stringContaining('tab=defense') // Default tab
      );
    });
  });

  test('filters companies using global levels when SearchBar is used', async () => {
    // Mock initial global levels (default are 1 and 3)
    // These are set in HomeContent's state, so we don't need to mock them directly here
    // as they are used by handleSearch.

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <HomeContent />
      </Suspense>
    );

    // Wait for initial cards to render
    expect(await screen.findByText(/Company A \(TKA\)/)).toBeInTheDocument();
    expect(await screen.findByText(/Company B \(TKB\)/)).toBeInTheDocument();
    expect(await screen.findByText(/Company C \(TKC\)/)).toBeInTheDocument();


    // Simulate SearchBar interaction
    // The SearchBar component calls onSearchResult(nodeId, true)
    // We can get the SearchBar input, type, and select an option.
    // For simplicity, we'll directly invoke what onSearchResult would do: call handleSearch via SearchBar's prop.
    // This requires getting a reference to the SearchBar or triggering its internal logic.
    // A simpler way for this test is to find the SearchBar input, change its value,
    // and then simulate selection if SearchBar exposes a way or if we mock its selection.
    // Given the existing structure, onSearchResult is `handleSearch`.
    // Let's find the input for SearchBar.
    const searchInput = screen.getByRole('combobox'); // Assuming SearchBar uses a combobox role for its input
    
    // Type company name - this will trigger suggestions
    fireEvent.change(searchInput, { target: { value: 'Company B' } });

    // Find and click the suggestion for Company B
    // Suggestions are usually list items or buttons.
    // The SearchBar renders suggestions as buttons with text like "Company B (TKB)"
    const suggestionButtonB = await screen.findByRole('button', { name: /Company B \(TKB\)/i });
    fireEvent.click(suggestionButtonB);


    // Assertions after search
    await waitFor(() => {
      // Company B should be visible and highlighted
      const companyBNameElement = screen.getByText((content, element) => 
        element?.tagName.toLowerCase() === 'h3' && content.startsWith(mockCompanyB.name)
      );
      expect(companyBNameElement).toBeInTheDocument();
      const companyBCardDiv = companyBNameElement.closest('div[id^="company-"]');
      expect(companyBCardDiv).toHaveClass('ring-2'); // Highlighted

      // Depending on the mockFilterNetworkByNode, Company A and C might still be visible if they are linked
      // For this test, let's assume filterNetworkByNode with global levels (1,3) will show B and its direct connections (A and C)
      expect(screen.getByText(/Company A \(TKA\)/)).toBeInTheDocument();
      expect(screen.getByText(/Company C \(TKC\)/)).toBeInTheDocument();
    });

    // Assert filterNetworkByNode was called with global levels (default 1 and 3)
    expect(mockFilterNetworkByNode).toHaveBeenCalledWith(
      mockDependencyData,
      mockFormattedIdB, // Searched for Company B
      1, // Default upstreamLevels from HomeContent state
      3  // Default downstreamLevels from HomeContent state
    );

    // Assert window.history.replaceState for global levels
    // Default levels 1 and 3 for upstream/downstream are NOT added to URL by updateUrlParams.
    await waitFor(() => {
      const lastCallArgs = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1];
      const urlString = lastCallArgs[2];
      
      expect(urlString).toContain(`node=${mockFormattedIdB}`);
      expect(urlString).toContain('tab=defense');
      expect(urlString).not.toContain('upstream='); // Should not include if default 1
      expect(urlString).not.toContain('downstream='); // Should not include if default 3
    });
  });
});

// Render Home component to ensure Suspense is handled as in actual app
describe('Home Page', () => {
  test('renders HomeContent within Suspense', async () => {
    render(<Home />);
    expect(await screen.findByText(/Company A \(TKA\)/)).toBeInTheDocument();
    expect(await screen.findByText(/Company B \(TKB\)/)).toBeInTheDocument();
    expect(await screen.findByText(/Company C \(TKC\)/)).toBeInTheDocument();
    expect(await screen.findByTestId('dependency-graph')).toBeInTheDocument();
  });
});
