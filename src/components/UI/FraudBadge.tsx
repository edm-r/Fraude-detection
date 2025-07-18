import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface FraudBadgeProps {
  label: 'fraud' | 'legitimate';
  probability: number;
  size?: 'sm' | 'md' | 'lg';
}

const FraudBadge: React.FC<FraudBadgeProps> = ({ label, probability, size = 'md' }) => {
  const isFraud = label === 'fraud';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center space-x-2">
      <span
        className={`inline-flex items-center space-x-1 rounded-full font-medium ${sizeClasses[size]} ${
          isFraud
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}
      >
        {isFraud ? (
          <AlertTriangle className={iconSizes[size]} />
        ) : (
          <CheckCircle className={iconSizes[size]} />
        )}
        <span className="capitalize">{label}</span>
      </span>
      <span className="text-sm text-gray-600">
        {(probability * 100).toFixed(1)}%
      </span>
    </div>
  );
};

export default FraudBadge;