import React, { useState, useEffect } from 'react';
import { RankingsTable } from '../components/rankings/RankingsTable';
import { useRankingStore } from '../store/rankingStore';

const ITEMS_PER_PAGE = 10;

export function Rankings() {
  const [currentPage, setCurrentPage] = useState(1);
  const { rankings, loading, error, fetchRankings } = useRankingStore();
  
  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const totalPages = Math.ceil(rankings.length / ITEMS_PER_PAGE);
  const currentRankings = rankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Season Rankings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View the current standings and points for all players this season.
          </p>
        </div>
      </div>

      <div className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <RankingsTable
          rankings={currentRankings}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}