import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { winnersService } from '../services/winnersService';
import { WinnersList } from '../components/winners/WinnersList';
import { Winner } from '../types/winner';
import { toast } from 'react-hot-toast';
import rankingsBackground from '../assets/images/backgrounds/rankingsbackground.jpeg';

export function WinnersGallery() {
  const { t } = useTranslation();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    try {
      const data = await winnersService.getWinners();
      setWinners(data);
    } catch (error) {
      console.error('Error loading winners:', error);
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('rankings.title')}
            </h1>
          </div>
          
          <WinnersList winners={winners} />
        </div>
      </div>
    </div>
  );
}