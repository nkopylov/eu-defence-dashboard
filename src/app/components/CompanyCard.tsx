'use client';

import { useState, useEffect } from 'react';
import { Company, DateRange, StockData } from '../types';
import { getStockData } from '../services/stockService';
import StockChart from './StockChart';

interface CompanyCardProps {
  company: Company;
  dateRange: DateRange;
  highlighted?: boolean;
}

export default function CompanyCard({ company, dateRange, highlighted = false }: CompanyCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  return (
    <div 
      id={`company-${company.ticker}`}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition ${
        highlighted ? 'ring-2 ring-orange-500 dark:ring-orange-400' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="relative">
          <h3 
            className="text-xl font-bold hover:text-blue-600 cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {company.name} {isPublicCompany ? `(${company.ticker})` : ''}
            {!isPublicCompany && <span className="text-xs ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Private</span>}
          </h3>
          {showTooltip && (
            <div className="absolute z-10 left-0 top-8 w-80 bg-gray-100 dark:bg-gray-700 p-3 rounded shadow-lg">
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
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {company.country}
        </span>
      </div>

      {isPublicCompany ? (
        <StockChart 
          data={stockData} 
          companyName={company.name} 
          isLoading={isLoading}
          dateRange={dateRange}
        />
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