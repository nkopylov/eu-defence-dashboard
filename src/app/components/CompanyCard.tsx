'use client';

import { useEffect, useState } from 'react';
import { getStockData } from '../services/stockService';
import { Company, DateRange, StockData } from '../types';
import StockChart from './StockChart';

interface CompanyCardProps {
  company: Company;
  dateRange: DateRange;
  highlighted?: boolean;
  onFilterByCompany: (ticker: string) => void;
}

export default function CompanyCard({ company, dateRange, highlighted = false, onFilterByCompany }: CompanyCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stockChange, setStockChange] = useState<number | null>(null);

  const isPublicCompany = !company.ticker.startsWith('PRIVATE:');

  useEffect(() => {
    async function fetchData() {
      if (!isPublicCompany) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const data = await getStockData(company.ticker, dateRange);
      setStockData(data);
      setIsLoading(false);
    }

    fetchData();
  }, [company.ticker, dateRange, isPublicCompany]);

  useEffect(() => {
    if (stockData.length > 0) {
      const firstPrice = stockData[0].close;
      const lastPrice = stockData[stockData.length - 1].close;
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      setStockChange(change);
    } else {
      setStockChange(null);
    }
  }, [stockData]);

  const getStockChangeColor = () => {
    if (stockChange === null) return 'text-gray-500';
    if (stockChange > 0) return 'text-green-700';
    if (stockChange < 0) return 'text-red-700';
    return 'text-gray-700';
  };

  const getStockChangeBackgroundColor = () => {
    if (stockChange === null) return 'bg-gray-100';
    if (stockChange > 0) return 'bg-green-100';
    if (stockChange < 0) return 'bg-red-100';
    return 'bg-gray-200';
  };

  return (
    <div 
      id={`company-${company.ticker}`}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition relative ${
        highlighted ? 'ring-2 ring-orange-500 dark:ring-orange-400' : ''
      }`}
    >
      <div className="flex flex-wrap justify-between items-start mb-3 sm:mb-4">
        <div className="relative max-w-full flex items-center group">
          <h3 
            className="text-lg sm:text-xl font-bold hover:text-blue-600 cursor-pointer truncate pr-2"
            onClick={() => setShowTooltip(!showTooltip)} 
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {company.name} {isPublicCompany ? <span className="hidden sm:inline">({company.ticker})</span> : ''}
            {!isPublicCompany && <span className="text-xs ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Private</span>}
            {stockChange !== null && (
              <span
                className={`text-xs ml-2 px-2 py-1 rounded text-sm font-bold ${getStockChangeBackgroundColor()} ${getStockChangeColor()}`}
              >
                {stockChange.toFixed(2)}%
              </span>
            )}
          </h3>
          <button
            onClick={() => onFilterByCompany(company.ticker)}
            onMouseEnter={() => setShowFilterTooltip(true)}
            onMouseLeave={() => setShowFilterTooltip(false)}
            className="ml-2 p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 relative"
            aria-label={`Filter by ${company.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            {showFilterTooltip && (
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg">
                Filter by {company.name}
              </span>
            )}
          </button>
          {showTooltip && (
            <div className="absolute z-10 left-0 top-8 w-full sm:w-80 bg-gray-100 dark:bg-gray-700 p-3 rounded shadow-lg"
                 style={{ maxWidth: "calc(100vw - 40px)" }}>
              <p><strong>Country:</strong> {company.country}</p>
              <p><strong>Products:</strong> {company.products}</p>
              {company.revenue !== undefined && (
                <p><strong>Revenue:</strong> €{company.revenue}B</p>
              )}
              {company.marketCap !== undefined && (
                <p><strong>Market Cap:</strong> €{company.marketCap}B</p>
              )}
              {company.euFundFocus !== undefined && (
                <p><strong>EU Fund Focus:</strong> {company.euFundFocus ? 'Yes' : 'No'}</p>
              )}
              {company.defensePotential && (
                <p><strong>Defense Potential:</strong> {company.defensePotential}</p>
              )}
              {company.defenseUses && (
                <p><strong>Defense Uses:</strong> {company.defenseUses}</p>
              )}
            </div>
          )}
        </div>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
          {company.country}
        </span>
      </div>

      {isPublicCompany ? (
        <>
          <StockChart 
            data={stockData} 
            companyName={company.name} 
            isLoading={isLoading}
            dateRange={dateRange}
          />
        </>
      ) : (
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-auto">
          <h4 className="font-bold text-lg mb-2">Company Profile</h4>
          <p className="mb-2"><strong>Sector:</strong> {company.sector || 'Various'}</p>
          <p className="mb-2"><strong>Key Capabilities:</strong> {company.products}</p>
          
          {company.revenue !== undefined && (
            <p className="mb-2"><strong>Revenue:</strong> €{company.revenue}B</p>
          )}
          
          {company.marketCap !== undefined && (
            <p className="mb-2"><strong>Market Cap:</strong> €{company.marketCap}B</p>
          )}
          
          {company.euFundFocus !== undefined && (
            <p className="mb-2"><strong>EU Fund Focus:</strong> {company.euFundFocus ? 'Yes' : 'No'}</p>
          )}
          
          {company.defensePotential && (
            <p className="mb-2"><strong>Defense Conversion Potential:</strong> {company.defensePotential}</p>
          )}
          
          {company.defenseUses && (
            <p className="mb-2"><strong>Defense Applications:</strong> {company.defenseUses}</p>
          )}
          
          {company.description && (
            <p className="text-sm mt-2">{company.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
