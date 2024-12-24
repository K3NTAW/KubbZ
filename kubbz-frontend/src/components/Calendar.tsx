import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { Tournament } from '../types/tournament';

interface CalendarProps {
  tournaments: Tournament[];
  onDateClick: (date: Date) => void;
}

export function Calendar({ tournaments, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hasTournament = (date: Date) => {
    return tournaments.some(tournament => {
      const startDate = new Date(tournament.start_date);
      return isSameDay(date, startDate);
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors duration-200"
          aria-label="Previous month"
        >
          ←
        </button>
        
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors duration-200"
          aria-label="Next month"
        >
          →
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
        {days.map((date) => {
          const hasEvent = hasTournament(date);
          const isCurrentDay = isToday(date);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              className={`
                relative p-2 text-sm rounded-lg transition-colors duration-200
                ${
                  isCurrentDay
                    ? 'ring-2 ring-blue-500 text-gray-900 dark:text-white'
                    : hasEvent
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}