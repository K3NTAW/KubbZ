import React from 'react';
import { useTranslation } from 'react-i18next';
import { RankingEntry } from '../../types/user';
import { Avatar } from '../common/Avatar';

interface RankingsTableProps {
  rankings: RankingEntry[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RankingsTable({ rankings, currentPage, totalPages, onPageChange }: RankingsTableProps) {
  const { t } = useTranslation();

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-yellow-400 font-bold">{t('rankings.rank1')}</span>;
      case 2:
        return <span className="text-gray-400 font-bold">{t('rankings.rank2')}</span>;
      case 3:
        return <span className="text-amber-600 font-bold">{t('rankings.rank3')}</span>;
      default:
        return <span className="text-gray-500 dark:text-gray-400">{rank}th</span>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="scrollbar-hide">
      <div className="overflow-x-auto">
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('rankings.rank')}
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('rankings.player')}
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('rankings.points')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rankings.map((entry, index) => (
              <tr 
                key={entry.userId} 
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRankDisplay((currentPage - 1) * 10 + index + 1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar 
                      src={entry.avatar} 
                      name={entry.userName} 
                      size="md"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.userName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {entry.points.toLocaleString()} pts
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('rankings.previous')}
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('rankings.next')}
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('rankings.showing')} <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> {t('rankings.to')}{' '}
              <span className="font-medium">
                {Math.min(currentPage * 10, rankings.length)}
              </span>{' '}
              {t('rankings.of')} <span className="font-medium">{rankings.length}</span> {t('rankings.results')}
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('rankings.previous')}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    currentPage === page
                      ? 'z-10 bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } text-sm font-medium`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('rankings.next')}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}