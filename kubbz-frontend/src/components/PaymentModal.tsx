import React from 'react';
import { Tournament } from '../types/tournament';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface PaymentModalProps {
  tournament: Tournament;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentModal({ tournament, onClose, onConfirm }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-blue-900 mb-4">Tournament Registration</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-semibold text-blue-900">{tournament.name}</h3>
            <p className="text-blue-600">
              {format(new Date(tournament.date), 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-900 font-medium">Registration Fee</p>
            <p className="text-2xl font-bold text-blue-600">${tournament.entryFee}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-blue-900">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-blue-900">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiry"
                  placeholder="MM/YY"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-blue-900">
                  CVC
                </label>
                <input
                  type="text"
                  id="cvc"
                  placeholder="123"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`
                w-full py-2 px-4 rounded-md text-white font-medium
                ${
                  isProcessing
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
                transition-colors
              `}
            >
              {isProcessing ? 'Processing...' : `Pay $${tournament.entryFee}`}
            </button>
          </form>
        </div>

        <p className="text-sm text-gray-500 text-center">
          Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
}