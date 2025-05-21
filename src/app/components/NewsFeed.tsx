'use client';

import { useEffect, useState } from 'react';
import { getNewsArticles, NewsArticle } from '../services/newsService';
import { Company, DateRange } from '../types';

interface NewsFeedProps {
  companies: Company[];
  dateRange: DateRange;
  searchedNodeId: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}

export default function NewsFeed({ 
  companies, 
  dateRange, 
  searchedNodeId, 
  isCollapsed, 
  onToggleCollapse,
  isMobile = false
}: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch news based on selected companies
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Reset to page 1 when the filters change
        setPage(1);
        
        // Get filtered companies based on search criteria
        const filteredCompanies = companies;

        // Fetch news articles
        const response = await getNewsArticles(filteredCompanies, dateRange, 1);
        
        setArticles(response.articles);
        setTotalResults(response.totalResults);
        setHasMore(response.articles.length < response.totalResults);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
        setIsLoading(false);
      }
    };

    if (!isCollapsed) {
      fetchNews();
    }
  }, [companies, dateRange, searchedNodeId, isCollapsed]);

  // Load more articles when scrolling
  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      
      const response = await getNewsArticles(companies, dateRange, nextPage);
      
      setArticles(prevArticles => [...prevArticles, ...response.articles]);
      setPage(nextPage);
      setHasMore(articles.length + response.articles.length < totalResults);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading more news:', err);
      setError('Failed to load more news. Please try again later.');
      setIsLoading(false);
    }
  };

  // Handle scroll event
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200 && !isLoading && hasMore) {
      loadMore();
    }
  };

  // Format publication date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 flex flex-col h-full transition-all duration-300 w-full ${isMobile ? 'rounded-t-xl shadow-lg' : ''}`}>
      {/* Header with collapse button */}
      <div className={`sticky ${isMobile ? (isCollapsed ? 'bottom-0' : 'top-0') : 'top-0'} bg-white dark:bg-gray-800 py-3 px-4 ${isMobile && !isCollapsed ? 'border-b rounded-t-xl' : isMobile ? 'border-t rounded-t-xl' : 'border-b'} z-10 flex justify-between items-center shadow-sm ${isCollapsed && !isMobile ? 'w-12' : 'w-full'} ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <h2 className="text-xl font-bold truncate">
            News Feed
            {searchedNodeId && companies.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                {companies.length} {companies.length === 1 ? 'company' : 'companies'}
              </span>
            )}
          </h2>
        )}
        <button 
          onClick={onToggleCollapse}
          className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0 ${isMobile && isCollapsed ? 'w-full' : ''}`}
          title={isCollapsed ? "Expand news panel" : "Collapse news panel"}
          aria-label={isCollapsed ? "Expand news panel" : "Collapse news panel"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${isMobile && isCollapsed ? 'mx-auto' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isCollapsed ? (
              isMobile ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )
            ) : (
              isMobile ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )
            )}
          </svg>
        </button>
      </div>

      {/* News content - only show when not collapsed */}
      {!isCollapsed && (
        <div 
          className={`flex-1 overflow-y-auto p-2 sm:p-4 ${isMobile ? 'pb-16' : ''}`}
          onScroll={handleScroll}
        >
          {isLoading && page === 1 ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading news...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  setPage(1);
                  getNewsArticles(companies, dateRange, 1)
                    .then(response => {
                      setArticles(response.articles);
                      setTotalResults(response.totalResults);
                      setHasMore(response.articles.length < response.totalResults);
                    })
                    .catch(err => {
                      console.error('Error retrying news fetch:', err);
                      setError('Failed to load news. Please try again later.');
                    });
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">No news articles found for the selected criteria.</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {articles.map((article, index) => (
                <article key={index} className="border-b pb-3 sm:pb-4 mb-3 sm:mb-4 last:border-0">
                  <h3 className="font-bold text-base sm:text-lg mb-2">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition"
                    >
                      {article.title}
                    </a>
                  </h3>
                  
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span className="mr-2">{article.source.name}</span>
                    <span>•</span>
                    <span className="ml-2">{formatDate(article.publishedAt)}</span>
                  </div>
                  
                  {article.urlToImage && (
                    <div className="mb-3">
                      <div className="w-full h-32 sm:h-48 relative">
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-full h-32 sm:h-48 object-cover rounded-md"
                          width={640}
                          height={360}
                          loading="lazy"
                          style={{ objectFit: 'cover', borderRadius: '0.375rem' }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    {article.description || article.content?.split('[+')[0] || 'No description available.'}
                  </p>
                  
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:underline text-sm sm:text-base"
                  >
                    Read more
                  </a>
                </article>
              ))}
              
              {isLoading && page > 1 && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Loading more news...</p>
                </div>
              )}
              
              {!hasMore && articles.length > 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  No more articles to load
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}