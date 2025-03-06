'use client';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { DateRange, StockData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  data: StockData[];
  companyName: string;
  isLoading: boolean;
  miniVersion?: boolean;
  dateRange?: DateRange;
}

export default function StockChart({ 
  data, 
  companyName, 
  isLoading, 
  miniVersion = false, 
  dateRange 
}: StockChartProps) {
  // Check if dark mode is enabled
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check for dark mode preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);
    
    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handleChange);
    
    // Also check for class-based dark mode on document
    const isDarkClass = document.documentElement.classList.contains('dark');
    if (isDarkClass) {
      setIsDarkMode(true);
    }
    
    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);
  
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p>Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p>No data available</p>
      </div>
    );
  }

  // Determine if we're in Today mode
  const isIntraday = dateRange?.isToday === true || data.some(item => 'isIntraday' in item);
  
  // For large datasets, trim to show only every Nth point to avoid overcrowding the chart
  const maxPoints = isIntraday ? 30 : 14; // Show more points for intraday data
  let filteredData = data;
  
  if (!isIntraday && data.length > maxPoints) {
    const step = Math.ceil(data.length / maxPoints);
    filteredData = data.filter((_, index) => index % step === 0);
  }
  
  // Ensure we have all valid date objects before creating chart data
  // Convert any string dates to Date objects
  const processedData = filteredData.map(item => ({
    ...item,
    date: item.date instanceof Date ? item.date : new Date(item.date)
  }));
  
  // Sort data by date to ensure line connects properly
  processedData.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // For Today mode with a single point, we'll create a custom label
  let dateLabels;
  
  if (isIntraday && processedData.length === 1) {
    // For Today mode with single data point, create a special label
    dateLabels = ["Today"];
  } else if (isIntraday) {
    // For intraday with multiple points, show the time (HH:MM)
    dateLabels = processedData.map((item) => {
      const date = item.date instanceof Date ? item.date : new Date(item.date);
      // Check if we have a formattedTime property (from our API enhancement)
      if ('formattedTime' in item && item.formattedTime) {
        return item.formattedTime;
      }
      // Otherwise format the time from the date
      return date.getHours().toString().padStart(2, '0') + ':' + 
             date.getMinutes().toString().padStart(2, '0');
    });
  } else {
    // For regular mode, show DD/MM format
    dateLabels = processedData.map((item) => {
      const date = item.date instanceof Date ? item.date : new Date(item.date);
      return date.getDate() + '/' + (date.getMonth() + 1);
    });
  }
  
  // Define color schemes
  const mainLineColor = 'rgb(53, 162, 235)';
  const highLineColor = 'rgba(75, 192, 192, 0.8)';
  const lowLineColor = 'rgba(255, 99, 132, 0.8)';
  
  // For Today mode, we need to check if we have multiple data points or just one
  const isSinglePointToday = isIntraday && processedData.length === 1;
  
  let datasets;
  
  if (isSinglePointToday) {
    // For Today mode with a single point (no intraday data available)
    // We'll create a simple visualization with the closing price and high/low range
    const dataPoint = processedData[0];
    
    // Calculate a range to display
    const highValue = dataPoint.high;
    const lowValue = dataPoint.low;
    const closeValue = dataPoint.close;
    
    datasets = [
      // Main closing price line
      {
        type: 'line',
        label: 'Today\'s Price',
        data: [closeValue],
        borderColor: mainLineColor,
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        pointRadius: 8,
        pointStyle: 'circle',
        pointBackgroundColor: 'rgba(53, 162, 235, 0.8)',
        borderWidth: 2
      },
      // High marker 
      {
        type: 'line',
        label: 'High',
        data: [highValue],
        borderColor: highLineColor,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        pointRadius: 6,
        pointStyle: 'triangle',
        rotation: 180,
        borderWidth: 2
      },
      // Low marker
      {
        type: 'line',
        label: 'Low',
        data: [lowValue],
        borderColor: lowLineColor,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        pointRadius: 6,
        pointStyle: 'triangle',
        borderWidth: 2
      }
    ];
  } else if (isIntraday) {
    // Regular intraday mode with multiple points
    datasets = [
      // High price line
      {
        label: 'High Price',
        data: processedData.map(item => item.high),
        borderColor: highLineColor,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointRadius: 1,
        borderWidth: 1,
        spanGaps: true,
        yAxisID: 'y',
        fill: false
      },
      // Close price line - main line
      {
        label: 'Price',
        data: processedData.map(item => item.close),
        borderColor: mainLineColor,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        pointRadius: 2,
        borderWidth: 2,
        spanGaps: true,
        yAxisID: 'y',
        fill: false
      },
      // Low price line
      {
        label: 'Low Price',
        data: processedData.map(item => item.low),
        borderColor: lowLineColor,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointRadius: 1,
        borderWidth: 1,
        spanGaps: true,
        yAxisID: 'y',
        fill: {
          target: '-1', // Fill to the previous dataset
          above: 'rgba(75, 192, 192, 0.05)',
        }
      }
    ];
  } else {
    // Regular view - just close price
    datasets = [
      {
        label: 'Close Price',
        data: processedData.map(item => item.close),
        borderColor: mainLineColor,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        pointRadius: 2,
        borderWidth: 2,
        spanGaps: true
      }
    ];
  }
  
  const chartData = {
    labels: dateLabels,
    datasets: datasets
  };

  // Define text color based on dark mode
  const textColor = isDarkMode ? '#e5e7eb' : '#333333';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // Define title based on mode
  const chartTitle = isIntraday 
    ? `${companyName} Stock Price - Today` 
    : `${companyName} Stock Price`;
  
  // Define different options based on the mode
  let options;
  
  if (isSinglePointToday) {
    // Special options for Today mode with single data point
    options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !miniVersion,
          position: 'top' as const,
          labels: {
            color: textColor,
            font: {
              size: miniVersion ? 8 : 11
            },
            boxWidth: 10
          }
        },
        title: {
          display: !miniVersion,
          text: chartTitle,
          color: textColor,
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: {
            top: 2,
            bottom: 6
          }
        },
        tooltip: {
          enabled: !miniVersion,
          backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          callbacks: {
            title: function() {
              return 'Today';
            },
            label: function(context) {
              const dataPoint = processedData[0];
              switch(context.datasetIndex) {
                case 0: return `Current: ${dataPoint.close.toFixed(2)}`;
                case 1: return `High: ${dataPoint.high.toFixed(2)}`;
                case 2: return `Low: ${dataPoint.low.toFixed(2)}`;
                default: return '';
              }
            }
          }
        }
      },
      scales: {
        y: {
          display: !miniVersion,
          beginAtZero: false,
          ticks: {
            color: textColor,
            font: {
              size: 10
            },
            display: !miniVersion
          },
          grid: {
            color: gridColor,
            display: !miniVersion
          },
          border: {
            color: textColor
          }
        },
        x: {
          display: !miniVersion,
          ticks: {
            color: textColor,
            font: {
              size: 11,
              weight: 'bold'
            },
            display: !miniVersion
          },
          grid: {
            display: false
          },
          border: {
            color: textColor
          }
        }
      },
      animation: {
        duration: 500
      }
    };
  } else {
    // Options for regular line chart (both daily and intraday with multiple points)
    options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !miniVersion && (!isIntraday || (isIntraday && !miniVersion)),
          position: 'top' as const,
          labels: {
            color: textColor,
            font: {
              size: miniVersion ? 8 : 11
            },
            boxWidth: 10
          }
        },
        title: {
          display: !miniVersion,
          text: chartTitle,
          color: textColor,
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: {
            top: 2,
            bottom: 6
          }
        },
        tooltip: {
          enabled: !miniVersion,
          backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          callbacks: {
            title: function(tooltipItems) {
              const item = tooltipItems[0];
              const dataPoint = processedData[item.dataIndex];
              
              if (isIntraday) {
                // For intraday, show both date and time
                const date = dataPoint.date;
                const formattedDate = date.toLocaleDateString();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                
                // Use formattedTime if available, otherwise format from date
                const timeStr = 'formattedTime' in dataPoint && dataPoint.formattedTime 
                  ? dataPoint.formattedTime 
                  : `${hours}:${minutes}`;
                  
                return `${formattedDate} ${timeStr}`;
              } else {
                // For regular mode, just show the date
                return dataPoint.date.toLocaleDateString();
              }
            }
          }
        }
      },
      // This ensures we have enough points for smooth curved lines
      cubicInterpolationMode: processedData.length >= 3 ? 'monotone' : 'default',
      // Disable bezier curves if we don't have enough data points (prevents the error)
      tension: processedData.length >= 3 ? 0.2 : 0,
      scales: {
        y: {
          display: !miniVersion,
          beginAtZero: false,
          ticks: {
            color: textColor,
            font: {
              size: 10
            },
            display: !miniVersion
          },
          grid: {
            color: gridColor,
            display: !miniVersion
          },
          border: {
            color: textColor
          }
        },
        x: {
          display: !miniVersion,
          ticks: {
            color: textColor,
            font: {
              size: 9
            },
            maxRotation: 45,
            minRotation: 45,
            display: !miniVersion,
            autoSkip: true,
            maxTicksLimit: isIntraday ? 8 : 14,
          },
          grid: {
            display: false
          },
          border: {
            color: textColor
          }
        }
      },
      elements: {
        point: {
          radius: miniVersion ? 0 : (isIntraday ? 1 : 2),
          hoverRadius: miniVersion ? 0 : (isIntraday ? 2 : 3)
        },
        line: {
          borderWidth: miniVersion ? 1.5 : (isIntraday ? 1.5 : 2)
        }
      },
      animation: {
        duration: 300
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    };
  }

  return (
    <div className={miniVersion ? "h-full w-full" : "h-64"}>
      <Line data={chartData} options={options} />
    </div>
  );
}