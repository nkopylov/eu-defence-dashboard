'use client';

import { useEffect, useState } from 'react';

interface NetworkFilterSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  upstreamLevels: number;
  downstreamLevels: number;
  onSettingsChange: (upstreamLevels: number, downstreamLevels: number) => void;
}

export default function NetworkFilterSettings({
  isOpen,
  onClose,
  upstreamLevels,
  downstreamLevels,
  onSettingsChange
}: NetworkFilterSettingsProps) {
  const [localUpstream, setLocalUpstream] = useState(upstreamLevels);
  const [localDownstream, setLocalDownstream] = useState(downstreamLevels);

  // Update local state when props change
  useEffect(() => {
    setLocalUpstream(upstreamLevels);
    setLocalDownstream(downstreamLevels);
  }, [upstreamLevels, downstreamLevels]);

  const handleApply = () => {
    onSettingsChange(localUpstream, localDownstream);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 z-20 w-72 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white">Network Filter Settings</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Upstream Levels (Who the node provides to)
        </label>
        <div className="flex items-center">
          <input
            type="range"
            min="1"
            max="5"
            value={localUpstream}
            onChange={(e) => setLocalUpstream(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300 w-6 text-center">{localUpstream}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Downstream Levels (Who provides to the node)
        </label>
        <div className="flex items-center">
          <input
            type="range"
            min="1"
            max="5"
            value={localDownstream}
            onChange={(e) => setLocalDownstream(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300 w-6 text-center">{localDownstream}</span>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Apply
        </button>
      </div>
    </div>
  );
} 