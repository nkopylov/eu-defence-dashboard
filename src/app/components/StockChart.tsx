'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { StockData } from '../types';
import { useState, useEffect } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockChartProps {
  data: StockData[];
  companyName: string;
  isLoading: boolean;
  miniVersion?: boolean;
}

export default function StockChart({ data, companyName, isLoading, miniVersion = false }: StockChartProps) {
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

  // For large datasets, trim to show only every Nth point to avoid overcrowding the chart
  const maxPoints = 14; // Maximum number of points to show
  let filteredData = data;
  
  if (data.length > maxPoints) {
    const step = Math.ceil(data.length / maxPoints);
    filteredData = data.filter((_, index) => index % step === 0);
  }
  
  const chartData = {
    labels: filteredData.map(item => {
      const date = new Date(item.date);
      return date.getDate() + '/' + (date.getMonth() + 1); // Shorter date format
    }),
    datasets: [
      {
        label: 'Close Price',
        data: filteredData.map(item => item.close),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.2,
        pointRadius: 2,
        borderWidth: 2,
      },
    ],
  };

  // Define text color based on dark mode
  const textColor = isDarkMode ? '#e5e7eb' : '#333333';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // Define options based on whether this is a mini version for tooltips
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !miniVersion, // Hide legend in mini version
        position: 'top' as const,
        labels: {
          color: textColor,
          font: {
            size: miniVersion ? 8 : 11 // Smaller font for mini display
          },
          boxWidth: 10
        }
      },
      title: {
        display: !miniVersion, // Hide title in mini version
        text: `${companyName} Stock Price`,
        color: textColor,
        font: {
          size: 12, // Smaller title for compact display
          weight: 'bold'
        },
        padding: {
          top: 2,
          bottom: 6
        }
      },
      tooltip: {
        enabled: !miniVersion, // Disable tooltips in mini version
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        display: !miniVersion, // Hide y axis in mini version
        beginAtZero: false,
        ticks: {
          color: textColor,
          font: {
            size: 10 // Small font for scale
          },
          display: !miniVersion
        },
        grid: {
          color: gridColor, // Subtle grid lines
          display: !miniVersion
        },
        border: {
          color: textColor
        }
      },
      x: {
        display: !miniVersion, // Hide x axis in mini version
        ticks: {
          color: textColor,
          font: {
            size: 9 // Small font for scale
          },
          maxRotation: 45,
          minRotation: 45,
          display: !miniVersion
        },
        grid: {
          display: false // No vertical grid lines
        },
        border: {
          color: textColor
        }
      }
    },
    elements: {
      point: {
        radius: miniVersion ? 0 : 2, // No points in mini version
        hoverRadius: miniVersion ? 0 : 3
      },
      line: {
        borderWidth: miniVersion ? 1.5 : 2
      }
    }
  };

  return (
    <div className={miniVersion ? "h-full w-full" : "h-64"}>
      <Line data={chartData} options={options} />
    </div>
  );
}