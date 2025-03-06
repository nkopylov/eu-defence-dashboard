'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DateRange } from '../types';
import { subDays } from 'date-fns';

interface DateRangePickerProps {
  onChange: (dateRange: DateRange) => void;
  selectedPreset?: string;
}

export default function DateRangePicker({ onChange, selectedPreset }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 14));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isTodayMode, setIsTodayMode] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>(selectedPreset || '2w');

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      setActivePreset('custom');
      onChange({ startDate: date, endDate, preset: 'custom' });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date);
      setActivePreset('custom');
      onChange({ startDate, endDate: date, preset: 'custom' });
    }
  };

  const handlePresetChange = (days: number, presetName: string) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(start);
    setEndDate(end);
    setIsTodayMode(false);
    setActivePreset(presetName);
    onChange({ startDate: start, endDate: end, preset: presetName });
  };

  const handleTodayMode = () => {
    const now = new Date();
    // Set time to beginning of day for startDate
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    // Use current time for endDate
    setStartDate(todayStart);
    setEndDate(now);
    setIsTodayMode(true);
    setActivePreset('today');
    onChange({ startDate: todayStart, endDate: now, isToday: true, preset: 'today' });
  };

  // Initialize with selected preset if provided
  useEffect(() => {
    if (selectedPreset && selectedPreset !== activePreset) {
      if (selectedPreset === 'today') {
        handleTodayMode();
      } else if (selectedPreset === '1w') {
        handlePresetChange(7, '1w');
      } else if (selectedPreset === '2w') {
        handlePresetChange(14, '2w');
      } else if (selectedPreset === '1m') {
        handlePresetChange(30, '1m');
      } else if (selectedPreset === '3m') {
        handlePresetChange(90, '3m');
      } else if (selectedPreset === '6m') {
        handlePresetChange(180, '6m');
      }
    }
  }, [selectedPreset]);

  // Auto-refresh for Today mode
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isTodayMode) {
      // Update every minute
      intervalId = setInterval(() => {
        const now = new Date();
        setEndDate(now);
        onChange({ 
          startDate: startDate, 
          endDate: now,
          isToday: true,
          preset: 'today'
        });
      }, 60000); // 60000ms = 1 minute
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTodayMode, onChange, startDate]);

  // Helper function to determine button style
  const getButtonStyle = (preset: string) => {
    const baseStyle = "px-4 py-2 text-white rounded font-medium transition-colors";
    if (preset === activePreset) {
      return `${baseStyle} bg-blue-800 ring-2 ring-blue-400 ring-offset-1`;
    }
    return `${baseStyle} bg-blue-600 hover:bg-blue-700`;
  };

  // Special style for Today button
  const getTodayButtonStyle = () => {
    const baseStyle = "px-5 py-2.5 text-white rounded-lg font-bold text-lg shadow-md transition-colors";
    if (activePreset === 'today') {
      return `${baseStyle} bg-emerald-800 ring-2 ring-emerald-400 ring-offset-1`;
    }
    return `${baseStyle} bg-emerald-600 hover:bg-emerald-700`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex gap-4">
        <button
          className={getTodayButtonStyle()}
          onClick={handleTodayMode}
        >
          Today
        </button>
        <button
          className={getButtonStyle('1w')}
          onClick={() => handlePresetChange(7, '1w')}
        >
          1W
        </button>
        <button
          className={getButtonStyle('2w')}
          onClick={() => handlePresetChange(14, '2w')}
        >
          2W
        </button>
        <button
          className={getButtonStyle('1m')}
          onClick={() => handlePresetChange(30, '1m')}
        >
          1M
        </button>
        <button
          className={getButtonStyle('3m')}
          onClick={() => handlePresetChange(90, '3m')}
        >
          3M
        </button>
        <button
          className={getButtonStyle('6m')}
          onClick={() => handlePresetChange(180, '6m')}
        >
          6M
        </button>
      </div>
      {!isTodayMode && (
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="flex items-center gap-2">
            <span>From:</span>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              className="p-2 border rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>To:</span>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="p-2 border rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}