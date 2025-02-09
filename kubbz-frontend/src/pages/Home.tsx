import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import backgroundImage from '../assets/images/backgrounds/background.jpg';

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen w-full">
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100vw'
        }}
      >
        {/* Dark overlay - only in dark mode */}
        <div className="absolute inset-0 bg-black bg-opacity-0 dark:bg-opacity-55"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen w-full flex flex-col items-center pt-24 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero Section */}
          <div className="bg-white/40 backdrop-blur-sm dark:backdrop-blur-none dark:bg-black/60 dark:bg-transparent p-8 rounded-xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8">
              <span className="block">{t('home.welcome')}</span>
              <span className="block text-blue-600">{t('home.kubbz')}</span>
            </h1>
            <p className="text-xl sm:text-2xl mb-12">
              {t('home.description')}
            </p>
          </div>

          {/* What is Kubb Section */}
          <div className="mt-24 bg-white/40 backdrop-blur-sm dark:backdrop-blur-none dark:bg-black/60 dark:bg-transparent p-8 rounded-xl">
            <h2 className="text-3xl font-bold mb-6">
              {t('home.whatIsKubb')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p>
                  {t('home.whatIsKubbDescription')}
                </p>
                <p>
                  {t('home.whatIsKubbDescription2')}
                </p>
              </div>
              <div className="bg-white/30 dark:bg-black/75 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {t('home.basicRules')}
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>{t('home.basicRules1')}</li>
                  <li>{t('home.basicRules2')}</li>
                  <li>{t('home.basicRules3')}</li>
                  <li>{t('home.basicRules4')}</li>
                  <li>{t('home.basicRules5')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Join Us Section */}
          <div className="mt-24 bg-white/40 backdrop-blur-sm dark:backdrop-blur-none dark:bg-black/60 dark:bg-transparent p-8 rounded-xl">
            <h2 className="text-3xl font-bold mb-6">
              {t('home.joinUs')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p>
                  {t('home.joinUsDescription')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/tournament"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('home.viewTournaments')}
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {t('home.joinUsButton')}
                  </Link>
                </div>
              </div>
              <div className="bg-white/30 dark:bg-black/75 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {t('home.benefits')}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('home.benefit1')}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('home.benefit2')}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('home.benefit3')}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('home.benefit4')}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-24 mb-24 bg-white/40 backdrop-blur-sm dark:backdrop-blur-none dark:bg-black/60 dark:bg-transparent p-8 rounded-xl">
            <h2 className="text-3xl font-bold mb-6">
              {t('home.getInTouch')}
            </h2>
            <p className="mb-8">
              {t('home.contactDescription')}
            </p>
            <a
              href="mailto:info@kubbzurich.ch"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
            >
              {t('home.contactUs')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
