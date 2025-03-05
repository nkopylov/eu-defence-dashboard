'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DateRange } from '../types';
import { subDays } from 'date-fns';

interface DateRangePickerProps {
  onChange: (dateRange: DateRange) => void;
}

export default function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 14));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      onChange({ startDate: date, endDate });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date);
      onChange({ startDate, endDate: date });
    }
  };

  const handlePresetChange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(start);
    setEndDate(end);
    onChange({ startDate: start, endDate: end });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => handlePresetChange(7)}
        >
          1W
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => handlePresetChange(14)}
        >
          2W
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => handlePresetChange(30)}
        >
          1M
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => handlePresetChange(90)}
        >
          3M
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => handlePresetChange(180)}
        >
          6M
        </button>
      </div>
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
    </div>
  );
}