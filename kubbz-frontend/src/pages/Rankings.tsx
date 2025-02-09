import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RankingsTable } from '../components/rankings/RankingsTable';
import { useRankingStore } from '../store/rankingStore';
import rankingsBackground from '../assets/images/backgrounds/rankingsbackground.jpeg';

const ITEMS_PER_PAGE = 10;

export function Rankings() {
  const { t } = useTranslation();
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
    <div className="relative min-h-screen">
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 w-full h-full"
        style={{ 
          backgroundImage: `url(${rankingsBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="fixed inset-0 bg-black/55 dark:bg-black/60 z-10" />
      
      <div className="relative z-20 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/40 dark:bg-black/75 backdrop-blur-sm shadow-xl rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {t('rankings.title')}
          </h1>
          <div className="space-y-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
              <div>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-400">
                  {t('rankings.description')}
                </p>
              </div>
            </div>

            <div className="mt-4 bg-white/80 dark:bg-gray-800/80 shadow rounded-lg overflow-hidden">
              <RankingsTable
                rankings={currentRankings}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}