import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RankingsTable } from '../components/rankings/RankingsTable';
import { useRankingStore } from '../store/rankingStore';
import { winnersService } from '../services/winnersService';
import { WinnersList } from '../components/winners/WinnersList';
import { Winner } from '../types/winner';
import { toast } from 'react-hot-toast';
import rankingsBackground from '../assets/images/backgrounds/rankingsbackground.jpeg';

const ITEMS_PER_PAGE = 10;

export function Rankings() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const { rankings, loading: rankingsLoading, error: rankingsError, fetchRankings } = useRankingStore();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [winnersLoading, setWinnersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rankings' | 'winners'>('rankings');
  
  useEffect(() => {
    fetchRankings();
    loadWinners();
  }, [fetchRankings]);

  const loadWinners = async () => {
    try {
      const data = await winnersService.getWinners();
      setWinners(data);
    } catch (error) {
      console.error('Error loading winners:', error);
      toast.error('Failed to load winners');
    } finally {
      setWinnersLoading(false);
    }
  };

  const totalPages = Math.ceil(rankings.length / ITEMS_PER_PAGE);
  const currentRankings = rankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (rankingsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-md">
          <p>{rankingsError}</p>
        </div>
      </div>
    );
  }

  const isLoading = rankingsLoading || winnersLoading;
  if (isLoading) {
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'rankings' ? t('rankings.title') : 'Winners'}
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('rankings')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'rankings'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Rankings
              </button>
              <button
                onClick={() => setActiveTab('winners')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'winners'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Winners
              </button>
            </div>
          </div>

          {activeTab === 'rankings' ? (
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
          ) : (
            <WinnersList winners={winners} />
          )}
        </div>
      </div>
    </div>
  );
}