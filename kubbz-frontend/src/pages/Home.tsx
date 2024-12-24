import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to KUBB Zürich
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Discover the exciting Viking chess game that's taking Zürich by storm
        </p>
      </div>

      {/* What is Kubb Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          What is Kubb?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Kubb is a traditional outdoor game that combines skill, strategy, and fun. Often called "Viking Chess," 
              it was originally played in Scandinavia and has now become popular worldwide.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              The game involves throwing wooden batons to knock over wooden blocks, with the ultimate goal of toppling 
              the "king" block. It's perfect for all ages and can be played on any relatively flat surface.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Rules</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Two teams compete against each other</li>
              <li>Teams take turns throwing batons at the opponent's kubbs</li>
              <li>Knocked-over kubbs are thrown to the opponent's side</li>
              <li>The king must be knocked over last to win</li>
              <li>If the king is knocked over too early, that team loses</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Join Us Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Join Our Community
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Whether you're a beginner or an experienced player, our community welcomes everyone who wants to enjoy 
              this unique game. We organize regular tournaments, practice sessions, and social events.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/tournament"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Tournaments
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                Join Us
              </Link>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Benefits</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Regular tournaments and events
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Training for all skill levels
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Social events and networking
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Equipment provided for beginners
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Get in Touch
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Have questions? Want to learn more about Kubb? We'd love to hear from you!
        </p>
        <a
          href="mailto:info@kubbzurich.ch"
          className="inline-flex items-center px-6 py-3 bg-gray-800 dark:bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
